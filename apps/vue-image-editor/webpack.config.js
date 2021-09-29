/* eslint-disable */
const path = require('path');
const { version, author, license } = require('./package.json');

const webpack = require('webpack');
const { VueLoaderPlugin } = require('vue-loader');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'toastui-vue-image-editor.js',
    library: { type: 'commonjs2' },
  },
  resolve: {
    alias: {
      vue: 'vue/dist/vue.js',
    },
  },
  externals: {
    'tui-image-editor': {
      commonjs: 'tui-image-editor',
      commonjs2: 'tui-image-editor',
      amd: 'tui-image-editor',
      root: ['tui', 'ImageEditor'],
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            rootMode: 'upward',
          },
        },
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.BannerPlugin({
      banner: [
        'TOAST UI ImageEditor : Vue Wrapper',
        `@version ${version}`,
        `@author ${author}`,
        `@license ${license}`,
      ].join('\n'),
    }),
  ],
};
