/**
 * webpack.config.js created on 2016. 12. 01.
 * @author NHN Ent. FE Development Lab <dl_javascript@nhn.com>
 */
const pkg = require('./package.json');
const path = require('path');
const webpack = require('webpack');
const SafeUmdPlugin = require('safe-umd-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isProduction = process.argv.indexOf('-p') > -1;

const FILENAME = pkg.name + (isProduction ? '.min' : '');
const BANNER = [
    `${FILENAME}.js`,
    `@version ${pkg.version}`,
    `@author ${pkg.author}`,
    `@license ${pkg.license}`
].join('\n');

module.exports = {
    entry: './src/index.js',
    output: {
        library: ['tui', 'ImageEditor'],
        libraryTarget: 'umd',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/dist',
        filename: `${FILENAME}.js`
    },
    externals: {
        'tui-code-snippet': {
            'commonjs': 'tui-code-snippet',
            'commonjs2': 'tui-code-snippet',
            'amd': 'tui-code-snippet',
            'root': ['tui', 'util']
        },
        'tui-color-picker': {
            'commonjs': 'tui-color-picker',
            'commonjs2': 'tui-color-picker',
            'amd': 'tui-color-picker',
            'root': ['tui', 'colorPicker']
        },
        'fabric': {
            'commonjs': ['fabric', 'fabric'],
            'commonjs2': ['fabric', 'fabric'],
            'amd': 'fabric',
            'root': 'fabric'
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules|bower_components/,
                loader: 'eslint-loader',
                enforce: 'pre',
                options: {
                    failOnWarning: false,
                    failOnError: false
                }
            }, {
                test: /\.js$/,
                exclude: /node_modules|bower_components/,
                loader: 'babel-loader?cacheDirectory',
                options: {
                    babelrc: true
                }
            }, {
                test: /\.styl$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true
                        }
                    },
                    {
                        loader: 'stylus-loader',
                        options: {
                            sourceMap: true
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new webpack.BannerPlugin(BANNER),
        new MiniCssExtractPlugin({
            filename: `${FILENAME}.css`
        }),
        new SafeUmdPlugin()
    ],
    devServer: {
        historyApiFallback: false,
        progress: true,
        inline: true,
        host: '0.0.0.0',
        disableHostCheck: true
    }
};
