/* eslint-disable */
const { merge } = require('webpack-merge');

const commonWebpackConfig = require('./webpack.common.config');
const prodWebpackConfig = require('./webpack.prod.config');
const devWebpackConfig = require('./webpack.dev.config');

module.exports = (env, args) => {
  const { mode } = args;
  const isProduction = mode === 'production';

  const commonConfig = commonWebpackConfig(env, args);

  return merge(commonConfig, isProduction ? prodWebpackConfig(env) : devWebpackConfig());
};
