import path from 'path';
import Ajv from 'ajv';
import { createConfig } from '@hulljs/utils';
import { RunBuildOpts, RequiredBuildOpts } from '../types';

export const configTool = createConfig<RequiredBuildOpts>();

const defaultConfig: RequiredBuildOpts = {
  appDirectory: process.cwd(),
  entry: path.join(process.cwd(), '/src/index'),
  outputPath: path.join(process.cwd(), '/build'),
  env: 'development',
  analyzer: false,
  buildTool: 'webpack',
  projectType: 'react',
  isProd: false,
  port: 8000,
  outputPublicPath: '/',
  resolveAlias: {},
  shouldUseSourceMap: false,
  extraBabelPresets: [],
  fileSizeLimit: 1000,
  htmlPluginOpts: {
    template: path.resolve(__dirname, '../../public/index.html'),
    inject: {
      title: 'welcome-use-hulljs',
    },
  },
  definePluginOptions: {},
  isUseBundleAnalyzer: false,
  devServer: {
    port: 8000,
    https: false,
  },
  extraWebpackPlugins: [],
  extraModuleRules: [],
  splitChunks: {},
  splitChunksLibary: {},
  sassLoaderOptions: {},
  lessLoaderOptions: {},
  proxy: {},
  extraBabelPlugins: [],
  viteExtraBuildOptions: {},
  viteExtraPlugins: [],
};

const schema = {
  type: 'object',
  properties: {
    appDirectory: { type: 'string' },
    env: { type: 'string' },
    port: { type: 'number' },
    analyzer: { type: 'boolean' },
    isProd: { type: 'boolean' },
    buildTool: {
      type: 'string',
      pattern: '(webpack|vite)',
    },
    projectType: {
      type: 'string',
      pattern: '(react|vue3)',
    },
    entry: { type: 'string' },
    outputPath: { type: 'string' },
    outputPublicPath: { type: 'string' },
    resolveAlias: {
      type: 'object',
    },
    shouldUseSourceMap: { type: 'boolean' },
    extraBabelPresets: {
      type: 'array',
    },
    fileSizeLimit: { type: 'number' },
    htmlPluginOpts: {
      type: 'object',
      properties: {
        template: { type: 'string' },
        inject: { type: 'object' },
      },
      required: ['template'],
    },
    definePluginOptions: {
      type: 'object',
    },
    isUseBundleAnalyzer: { type: 'boolean' },
    devServer: {
      type: 'object',
      properties: {
        port: { type: 'number' },
        https: { type: 'boolean' },
      },
    },
    extraWebpackPlugins: {
      type: 'array',
    },
    extraModuleRules: {
      type: 'array',
    },
    splitChunks: {
      type: 'object',
    },
    splitChunksLibary: {
      type: 'object',
    },
    sassLoaderOptions: {
      type: 'object',
    },
    lessLoaderOptions: {
      type: 'object',
    },
    proxy: {
      type: 'object',
    },
    extraBabelPlugins: {
      type: 'array',
    },
    viteExtraBuildOptions: {
      type: 'object',
    },
    viteExtraPlugins: {
      type: 'array',
    },
  },
  required: ['projectType', 'entry'],
  additionalProperties: false,
};


export const defineConfig = (opts: RunBuildOpts): RequiredBuildOpts => {

  const ajv = new Ajv();

  const validate = ajv.compile(schema);

  const valid = validate(opts);

  if (!valid) {
    throw validate.errors;
  }
  const libary = opts.splitChunksLibary;

  // schema暂时不知该如何定义
  if(libary){
    for(const key in libary){
      if(!Array.isArray(libary[key])){
        throw new Error(`splitChunksLibary.${key} mast be Array`);
      }
      for( const value of libary[key]){
        if(typeof value !== 'string'){
          throw new Error(`splitChunksLibary.${key} items mast be String`);
        }
      }
    }
  }

  const config = Object.assign(defaultConfig, opts);

  configTool.setConfig(config);
  return config;
};
