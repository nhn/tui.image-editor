/* eslint-disable */
const { version, license } = require('./package.json');

const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = ({ minify }) => {
  const productionConfig = {
    mode: 'production',
    plugins: [
      new webpack.BannerPlugin({
        banner: ['TOAST UI ImageEditor', `@version ${version}`, `@license ${license}`].join('\n'),
      }),
    ],
    optimization: {
      minimize: false,
    },
  };

  if (minify) {
    productionConfig.optimization = {
      minimize: true,
      minimizer: [new TerserPlugin({ extractComments: false }), new CssMinimizerPlugin()],
    };
  }

  return productionConfig;
};
