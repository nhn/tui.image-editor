const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');
const SafeUmdPlugin = require('safe-umd-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'toastui-vue-image-editor.js',
        library: 'toastui',
        libraryTarget: 'umd'
    },
    resolve: {
        alias: {
            vue: 'vue/dist/vue.js'
        }
    },
    externals: {
        'tui-image-editor': {
            'commonjs': 'tui-image-editor',
            'commonjs2': 'tui-image-editor',
            'amd': 'tui-image-editor',
            'root': ['tui', 'ImageEditor']
        }
    },
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.(js|vue)$/,
                exclude: /node_modules|example/,
                use: {
                    loader: 'eslint-loader',
                    options: {
                        failOnError: true
                    }
                }
            },
            {
                test: /\.js$/,
                include: [path.resolve(__dirname, 'src')],
                loader: 'babel-loader'
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new VueLoaderPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        new SafeUmdPlugin()
    ],
    devtool: 'source-map'
};
