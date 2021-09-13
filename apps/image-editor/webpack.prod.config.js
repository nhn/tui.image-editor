/* eslint-disable */
const { version, author, license } = require('./package.json');

const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = ({ minify }) => {
  const productionConfig = {
    mode: 'production',
    plugins: [
      new webpack.BannerPlugin({
        banner: [
          `tui-image-editor${minify ? '.min' : ''}.js`,
          `@version ${version}`,
          `@author ${author}`,
          `@license ${license}`,
        ].join('\n'),
      }),
      new MiniCssExtractPlugin({
        filename: `tui-image-editor${minify ? '.min' : ''}.css`,
      }),
    ],
    module: {
      rules: [
        {
          test: /\.styl$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'stylus-loader'],
        },
      ],
    },
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
