const webpack = require('webpack');
const path = require('path');
const webpackTargetElectronRenderer = require('webpack-target-electron-renderer');

const PATHS = {
    app: path.join(__dirname, 'browser/src'),
};

var options = {
    entry: {
        app: ['webpack/hot/dev-server', PATHS.app + '/entry.tsx']
    },
    output: {
        path: './public/built',
        filename: 'bundle.js',
        publicPath: 'http://localhost:8080/built/',
    },
    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js']
    },
    devServer: {
        contentBase: './browser/public',
        publicPath: 'http://localhost:8080/built/'
    },
    resolveUrlLoader: {
        // Catch fire on error (which is not the default for some reason...)
        fail: true
    },
    module: {
        loaders: [
            {
                test: /\.(png|jpg)$/,
                loader: 'file'
            },
            {
                test   : /\.css$/,
                loaders: ['style', 'css', 'resolve-url'],
                include: PATHS.app
            },
            {
                test   : /\.scss$/,
                loaders: ['style', 'css', 'resolve-url', 'sass?sourceMap'],
                include: PATHS.app
            },
            {
                test: /\.jsx?$/,
                loaders: ['babel-loader?cacheDirectory'],
                include: PATHS.app
            },
            {
                test: /\.tsx?$/,
                loaders: ['ts-loader'],
                include: PATHS.app
            }
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        })
    ]
};

options.target = webpackTargetElectronRenderer(options);

module.exports = options;
