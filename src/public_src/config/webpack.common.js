'use strict';

var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var helpers = require('./helpers');

module.exports = {
    context: helpers.root('src'),

    entry: {
        general: './js/general.js',
        sign: './js/pages/sign.js'
    },

    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: ['general']
        }),
        new ExtractTextPlugin("[name].css")
    ],

    module: {
        loaders: [
            {
                test: /\.scss/,
                include: helpers.root('src'),
                loader: ExtractTextPlugin.extract("style", "css!resolve-url!sass?sourceMap")
            },
            {
                test: /\.css$/,
                loader: 'style!css'
            },
            {
                test: /\.(svg|jpg|png|gif|ttf|eot|woff|woff2)$/,
                loader: 'file?name=[path][name].[ext]'
            }
        ]
    },

    sassLoader: {
        includePaths: [
            helpers.root('src/vendor/theme/classic/global/src/scss'),
            helpers.root('src/vendor/theme/classic/global/src/scss/bootstrap'),
            helpers.root('src/vendor/theme/classic/global/src/scss/mixins')
        ]
    },

    resolve: {
        modulesDirectories: ['node_modules'],
        extensions: ['', '.js']
    },

    resolveLoader: {
        modulesDirectories: ['node_modules'],
        moduleTemplates: ['*-loader', '*'],
        extensions: ['', '.js']
    }
};