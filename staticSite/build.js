const webpack = require('webpack')

webpack(require('./webpack.config'), (error, stats) => {
    if (error) console.error(error)
})