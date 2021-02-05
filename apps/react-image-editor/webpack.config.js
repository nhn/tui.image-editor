const path = require('path');

const config = {
  entry: './src/index.js',
  output: {
    filename: 'toastui-react-image-editor.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2',
  },
  externals: {
    'tui-image-editor': {
      commonjs: 'tui-image-editor',
      commonjs2: 'tui-image-editor',
    },
    react: {
      commonjs: 'react',
      commonjs2: 'react',
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [path.resolve(__dirname, 'src')],
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
};

module.exports = () => config;
