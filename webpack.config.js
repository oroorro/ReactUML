const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: {
      main: './src/index.js'
    },
    
    mode: 'development',
    devtool: 'cheap-module-source-map',
    devServer: {
        hot: true,
        port: 8080,
        devMiddleware: {
            writeToDisk: true,
        }
    },
    output: {
        filename: '[name].[contenthash].js', // Use contenthash for better caching
        path: path.resolve(__dirname, 'dist'),
        clean: true, // This can replace CleanWebpackPlugin in webpack 5
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.tsx?$/,
                use: [
                  {
                    loader: "ts-loader",
                    options: {
                      compilerOptions: { noEmit: false },
                    },
                  },
                ],
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader' }
                ]
            },
            {
                test: /\.jfif$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]'
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', ".ts", '.tsx']
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './public/index.html',
        })
    ],
    optimization: {
        splitChunks: {
            chunks: 'all',
            maxInitialRequests: Infinity,
            minSize: 0,
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name(module) {
                        // Get the name of the package
                        const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                        // Avoid any potential conflict by prefixing vendor names
                        return `npm.${packageName.replace('@', '')}`;
                    },
                },
            },
        },
    },
};
