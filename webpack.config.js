/**
 * webpack.config.js.js created on 2016. 12. 01.
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */
'use strict';

var pkg = require('./package.json');
var webpack = require('webpack');

var isProduction = process.argv.indexOf('-p') > -1;

var FILENAME = pkg.name + (isProduction ? '.min.js' : '.js');
var BANNER = [
    FILENAME,
    '@version ' + pkg.version,
    '@author ' + pkg.author,
    '@license ' + pkg.license
].join('\n');

module.exports = {
    eslint: {
        failOnError: true
    },
    entry: './src/index.js',
    output: {
        path: 'dist',
        publicPath: 'dist',
        filename: FILENAME
    },
    module: {
        preLoaders: [
            {
                test: /\.js$/,
                exclude: /(test|node_modules|bower_components)/,
                loader: 'eslint-loader'
            }
        ]
    },
    plugins: [
        new webpack.BannerPlugin(BANNER)
    ],
    devServer: {
        historyApiFallback: false,
        progress: true,
        inline: true,
        host: '0.0.0.0'
    }
};
