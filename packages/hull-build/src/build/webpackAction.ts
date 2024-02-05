import path from 'path';
import WebpackDevServer from 'webpack-dev-server';
import webpack, { Configuration } from 'webpack';
import rm from 'rimraf';
import { choosePort, log, startStaticServer } from '@hulljs/utils';
import { DevServer, RequiredBuildOpts } from '../types';


export const startDevServer = async(webpackConfig: Configuration, buildOpts: RequiredBuildOpts) => {
  try {
    const compiler = webpack(webpackConfig);

    const devServer = buildOpts.devServer as DevServer;

    const port = await choosePort(devServer.port);

    const config: WebpackDevServer.Configuration = {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*',
      },
      liveReload: true,
      hot: false,
      allowedHosts: 'all',
      historyApiFallback: true,
      open: true,
      proxy: buildOpts.proxy,
      port,
      https: devServer.https,
    };

    const devService = new WebpackDevServer(config, compiler);

    await devService.start();
    log.success(`you service is running at http${buildOpts.devServer.https ? 's' : ''}://localhost:${port}`);
  } catch (error: any) {
    throw Error(error);
  }
};

export const startBuildPro = async(webpackConfig: Configuration, buildOpts: RequiredBuildOpts, callback?: any) => {
  log.msg('webpack building for production...');
  rm(
    buildOpts.outputPath,
    (err: any) => {
      if (err) throw err;
      webpack(webpackConfig, (err, stats) => {
        if (err) throw err;
        process.stdout.write(
          `${stats && stats.toString({
            colors: true,
            modules: false,
            children: true,
            chunks: false,
            chunkModules: false,
          }) }\n\n`,
        );
        if (stats && stats.hasErrors()) {
          log.error('Build failed with errors.\n');
          process.exit(1);
        }
        log.success('Webpack build complete.\n');
        callback && callback();
      });
    },
  );
};

export const startProServer = async(webpackConfig: Configuration, buildOpts: RequiredBuildOpts) => {
  const port = await choosePort(buildOpts.devServer.port);
  const runServer = () => {
    startStaticServer({
      assetsRoot: buildOpts.outputPath,
      port,
      isUseGzip: true,
      maxAge: 24 * 60 * 60 * 1000 * 360,
    });
  };
  await startBuildPro(webpackConfig, buildOpts, runServer);
};

