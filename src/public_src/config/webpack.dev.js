var webpack = require('webpack');
var webpackMerge = require('webpack-merge');
var commonConfig = require('./webpack.common.js');
var helpers = require('./helpers');

module.exports = webpackMerge(commonConfig, {
    devtool: 'source-map',

    output: {
        path: helpers.root('../public'),
        filename: '[name].js'
    },

    watch: true,

    watchOptions: {
        aggregateTimeout: 100
    }
});