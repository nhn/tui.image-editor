/* eslint-disable */
const path = require('path');

const ESLintPlugin = require('eslint-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = ({ minify, WEBPACK_BUILD }) => ({
  entry: './src/index.js',
  output: {
    library: {
      export: 'default',
      type: 'umd',
      name: ['tui', 'ImageEditor'],
    },
    path: path.resolve('dist'),
    publicPath: '/dist',
    filename: `tui-image-editor${minify ? '.min' : ''}.js`,
  },
  resolve: {
    alias: {
      '@': path.resolve('src/js'),
      '@css': path.resolve('src/css'),
      '@svg': path.resolve('src/svg'),
    },
  },
  externals: [
    {
      'tui-code-snippet': {
        commonjs: 'tui-code-snippet',
        commonjs2: 'tui-code-snippet',
        amd: 'tui-code-snippet',
        root: ['tui', 'util'],
      },
      'tui-color-picker': {
        commonjs: 'tui-color-picker',
        commonjs2: 'tui-color-picker',
        amd: 'tui-color-picker',
        root: ['tui', 'colorPicker'],
      },
    },
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          rootMode: 'upward',
        },
      },
      {
        test: /\.styl$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'stylus-loader'],
      },
      {
        test: /\.svg$/,
        type: 'asset/inline',
      },
    ],
  },
  plugins: [
    new ESLintPlugin({
      extensions: ['js'],
      failOnError: WEBPACK_BUILD,
    }),
    new MiniCssExtractPlugin({
      filename: `tui-image-editor${minify ? '.min' : ''}.css`,
    }),
  ],
});
