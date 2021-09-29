/* eslint-disable */
const { merge } = require('webpack-merge');

const commonWebpackConfig = require('./webpack.common.config');
const prodWebpackConfig = require('./webpack.prod.config');
const devWebpackConfig = require('./webpack.dev.config');

module.exports = (env) => {
  const isProduction = env.WEBPACK_BUILD;

  const commonConfig = commonWebpackConfig(env);

  return merge(commonConfig, isProduction ? prodWebpackConfig(env) : devWebpackConfig());
};
