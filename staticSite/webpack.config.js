const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 's/bin'),
        filename: 'bundle.js',
    },
    module: {
        rules: [
            { test: /\.(js|jsx)$/, use: 'babel-loader' },
            {
                test: /\.less$/,
                use: [{ loader: 'style-loader' }, { loader: 'css-loader' }, { loader: "less-loader" }]
            }
        ]
    }
}