var webpack = require('webpack');
var webpackMerge = require('webpack-merge');
var commonConfig = require('./webpack.common.js');
var helpers = require('./helpers');

module.exports = webpackMerge(commonConfig, {
    output: {
        path: helpers.root('../public'),
        publicPath: '/',
        filename: '[name].js'
    },

    plugins: [
        new webpack.optimize.UglifyJsPlugin({minimize: true})
    ]
});