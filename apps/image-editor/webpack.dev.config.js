/* eslint-disable */
module.exports = () => ({
  mode: 'development',
  devServer: {
    compress: true,
    open: true,
    hot: true,
    host: '0.0.0.0',
    static: './examples',
    allowedHosts: 'all',
  },
  devtool: 'eval-source-map',
});
