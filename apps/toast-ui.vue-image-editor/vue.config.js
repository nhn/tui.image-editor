module.exports = {
  filenameHashing: false,
  chainWebpack: config => {
    config.module
      .rule('svg')
      .use('file-loader')
      .options({
        name: '[name].[ext]',
        outputPath: ''
      });
  }
};
