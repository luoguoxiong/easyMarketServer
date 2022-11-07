import path from 'path';
import webpack, { Configuration } from 'webpack';
import { merge } from 'webpack-merge';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { VueLoaderPlugin } from 'vue-loader';
import{ getModulesFromConfig } from '@hulljs/utils';
import { WEBPACK_COMMON_CONF, WEBPACK_DEV_CONF, WEBPACK_PROD_CONF } from '../constants';
import { createGranlarChunks } from '../features/codeSplitting';
import { getFileLoaderConfig, getJsLoaderConfig, getCssLoaderConfig } from './getLoaderConfig';
import { configTool } from './defineConfig';

export const getWebpackConfig = async(): Promise<Configuration> => {
  const buildConfig = configTool.getConfig();

  const { appDirectory, shouldUseSourceMap, outputPath,
    outputPublicPath, resolveAlias, entry, htmlPluginOpts,
    extraWebpackPlugins, extraModuleRules, projectType,
    definePluginOptions, isUseBundleAnalyzer, splitChunks, splitChunksLibary, isProd } = buildConfig;

  const { modules, alias, isTypeScript } = getModulesFromConfig(appDirectory);

  const isUseSourceMap = isProd ? shouldUseSourceMap : false;

  const devtool = isProd ? (shouldUseSourceMap ? 'source-map' : false) : 'cheap-module-source-map';

  const splitChunksOpts = {
    ...splitChunks,
    cacheGroups: {
      ...splitChunks.cacheGroups || {},
      ...createGranlarChunks(splitChunksLibary),
    },
  };

  const config: Configuration = {
    devtool,
    context: appDirectory,
    entry,
    output: {
      path: outputPath,
      publicPath: outputPublicPath,
    },
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
      cacheDirectory: path.resolve(appDirectory, `node_modules/.${isProd ? 'prod' : 'dev'}_cache`),
    },
    resolve: {
      modules,
      alias: {
        ...resolveAlias,
        ...alias,
      },
    },
    optimization: {
      splitChunks: isProd ? splitChunksOpts : {},
    },
    module: {
      strictExportPresence: true,
      rules: [
        ...(isUseSourceMap ? [{
          exclude: /@babel(?:\/|\\{1,2})runtime/,
          test: /\.(js|mjs|jsx|ts|tsx|css)$/,
          use: ['source-map-loader'],
        }] : []),
        {
          test: /\.vue$/,
          loader: 'vue-loader',
        },
        ...getFileLoaderConfig(),
        ...getJsLoaderConfig({ isTypeScript, isProduction: isProd }),
        ...getCssLoaderConfig(),
        ...(extraModuleRules ? extraModuleRules : []),
      ],
    },
    plugins: [
      ...(projectType === 'vue3' ? [new VueLoaderPlugin()] : []),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        cache: false,
        minify: isProd,
        template: htmlPluginOpts.template || path.join(__dirname, '../../public/index.html'),
        ...htmlPluginOpts.inject,
      }),
      new webpack.DefinePlugin({
        ...definePluginOptions,
        'DEBUG': !isProd,
      }),
      ...(isUseBundleAnalyzer && isProd ? [new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: path.resolve(appDirectory, './visualizer.html'),
      })] : []),
      ...(extraWebpackPlugins ? extraWebpackPlugins : []),
    ],
  };

  return merge(isProd ? WEBPACK_PROD_CONF : WEBPACK_DEV_CONF, WEBPACK_COMMON_CONF, config);
};
