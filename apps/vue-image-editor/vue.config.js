module.exports = {
  filenameHashing: false,
  chainWebpack: (config) => {
    config.module.rule('svg').use('file-loader').options({
      name: '[name].[ext]',
      outputPath: '',
    });

    // https://cli.vuejs.org/guide/troubleshooting.html#symbolic-links-in-node-modules
    config.resolve.symlinks(false);
  },
};
