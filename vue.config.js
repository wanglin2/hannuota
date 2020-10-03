const path = require('path');

// vue.config.js
module.exports = {
    publicPath: './',
    lintOnSave: false,
    configureWebpack: {
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src/components/'),
                '@p': path.resolve(__dirname, './src/pages/'),
                '@s': path.resolve(__dirname, './src/')
            }
        }
    }
}