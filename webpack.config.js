/*
 * Copyright (c) Jon Lachlan 2020
*/

const path = require('path');

module.exports = {
    mode: 'development',
    entry: ['babel-polyfill', './browser/main.js'],
    output: {
        path: path.resolve(__dirname, 'browser/public/.bundle'),
        filename: 'main.js'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                loader: "babel-loader"
                }
            }
        ]
    }
};