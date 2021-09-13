/* eslint-disable */
module.exports = () => ({
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.styl$/,
        use: ['css-loader', 'stylus-loader'],
      },
    ],
  },
  devServer: {
    compress: true,
    open: true,
    hot: true,
    host: '0.0.0.0',
    static: './examples',
  },
  devtool: 'eval-source-map',
});
