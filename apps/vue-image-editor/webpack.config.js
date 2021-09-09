const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'toastui-vue-image-editor.js',
    library: 'toastui',
    libraryTarget: 'umd',
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
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
  ],
  devtool: 'source-map',
};
