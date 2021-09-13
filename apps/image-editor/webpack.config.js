const pkg = require('./package.json');
const path = require('path');
const webpack = require('webpack');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, args) => {
  const { minify } = env;
  const { mode } = args;
  const isProduction = mode === 'production';
  const FILENAME = pkg.name + (minify ? '.min' : '');

  const config = {
    mode,
    entry: './src/index.js',
    output: {
      library: ['tui', 'ImageEditor'],
      libraryTarget: 'umd',
      libraryExport: 'default',
      path: path.resolve('dist'),
      publicPath: '/dist',
      filename: `${FILENAME}.js`,
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
      new webpack.BannerPlugin({
        banner: [
          `${FILENAME}.js`,
          `@version ${pkg.version}`,
          `@author ${pkg.author}`,
          `@license ${pkg.license}`,
        ].join('\n'),
      }),
      new MiniCssExtractPlugin({
        filename: `${FILENAME}.css`,
      }),
    ],
  };

  if (!isProduction) {
    config.devServer = {
      compress: true,
      open: true,
      hot: true,
      host: '0.0.0.0',
      static: './examples',
    };
    config.devtool = 'eval-source-map';
  }

  if (minify) {
    config.optimization = {
      minimize: true,
      minimizer: [new TerserPlugin({ extractComments: false }), new CssMinimizerPlugin()],
    };
  }

  return config;
};
