const webpack = require('webpack');
const path = require('path');

const PATHS = {
    app: path.join(__dirname, 'src'),
    build: path.join(__dirname, 'build')
};

module.exports = {
    entry: {
        app: ['webpack/hot/dev-server', PATHS.app + '/entry.tsx'],
    },
    output: {
        path: './public/built',
        filename: 'bundle.js',
        publicPath: 'http://localhost:8080/built/'
    },
    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js']
    },
    devServer: {
        contentBase: './public',
        publicPath: 'http://localhost:8080/built/'
    },
    module: {
        loaders: [
            {
                test: /\.s?css$/,
                loaders: ['style', 'css', 'sass'],
                include: PATHS.app
            },
            {
                test: /\.jsx?$/,
                loaders: ['babel-loader?cacheDirectory'],
                include: PATHS.app
            },
            {
                test: /\.tsx$/,
                loaders: ['ts-loader'],
                include: PATHS.app
            }
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
};
