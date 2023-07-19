const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const appConfig = require("./config.json");
const webpack = require("webpack");
const path = require("path");
const config = appConfig.otherServers.li;

module.exports = {

    devtool: "none",

    context: path.resolve(__dirname, "public"),

    entry: {
        index: path.resolve(__dirname, "./dist/"),
    },

    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                cache: true,
                parallel: true,
                sourceMap: false,
            }),
            new OptimizeCssAssetsPlugin({
                assetNameRegExp: /\.css$/g,
                canPrint: true,
                cssProcessor: require("cssnano"),
                cssProcessorPluginOptions: {
                    preset: ["default", {discardComments: {removeAll: true}}],
                },
            }),
        ],
    },

    module: {
        rules: [
            {
                exclude: /node_modules/,
                loader: "babel-loader",
                test: /\.js$/,
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                ],
            },
            {
                loader: "html-loader",
                test: /\.html$/,
            },
            {
                loader: "url-loader?limit=10000",
                test: /\.(a?png|svg)$/,
            },
            {
                test: /\.(eot|ttf)$/,
                use: [
                    {
                        loader: "url-loader?limit=10000",
                        options: {
                            name: "assets/fonts/[name].[contenthash].[ext]",
                        },
                    },
                ],
            },
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: [
                    {
                        loader: "url-loader?limit=10000&mimetype=application/font-woff",
                        options: {
                            name: "assets/fonts/[name].[contenthash].[ext]",
                        },
                    },
                ],
            },
            {
                test: /\.(jpe?g|gif|bmp|mp3|mp4|ogg|wav|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: {
                    loader: "file-loader",
                    options: {
                        name: "assets/fonts/[name].[ext]",
                    },
                },
            },
        ],
    },

    output: {
        chunkFilename: "scripts/[name].[chunkhash:4].chunk.js",
        filename: "scripts/[name].[chunkhash:4].js",
        path: path.join(__dirname, "public"),
        publicPath: "/",
    },

    resolve: {
        alias: {
            ajaxRequests: path.resolve(__dirname, "dist/ajax-requests"),
            assets: path.resolve(__dirname, "src/assets"),
            components: path.resolve(__dirname, "dist/components"),
            configs: path.resolve(__dirname, "dist/configs"),
            containers: path.resolve(__dirname, "dist/containers"),
            helpers: path.resolve(__dirname, "dist/helpers"),
            library: path.resolve(__dirname, "dist/library"),
            modules: path.resolve(__dirname, "dist/modules"),
            services: path.resolve(__dirname, "dist/services"),
        },
        extensions: [".js", ".jsx", ".ts", ".tsx", ".css"],
        mainFields: ["module", "browser", "main"],
    },

    plugins: [
        new CleanWebpackPlugin([
            path.resolve(__dirname, "public/scripts"),
            path.resolve(__dirname, "public/assets/css"),
            path.resolve(__dirname, "public/assets/fonts"),
            path.resolve(__dirname, "public/index.html"),
        ]),
        new webpack.HashedModuleIdsPlugin(),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
        }),
        new MiniCssExtractPlugin({
            chunkFilename: "assets/css/style.[chunkhash:4].css",
            filename: "assets/css/[name].[chunkhash:4].css",
            path: path.join(__dirname, "public"),
            publicPath: path.resolve(__dirname, "../src/assets/css"),
        }),
        new HtmlWebpackPlugin({
            appMountId: "root",
            chunksSortMode: "none",
            favicon: path.resolve(__dirname, "public/favicon.ico"),
            filename: "index.html",
            inject: false,
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                useShortDoctype: true,
            },
            mobile: true,
            scripts: [
                "https://js.stripe.com/v3/",
            ],
            template: path.resolve(__dirname, "index.ejs"),
            title: "",
            xhtml: true,
        }),
        new webpack.DefinePlugin({
            "process.env": {
                API_URL: JSON.stringify(config.api_url),
                APP_NAME: JSON.stringify(config.app_name),
                APP_PREFIX: JSON.stringify(config.prefix),
                ENVIRONMENT: JSON.stringify("production"),
                GOOGLE_RE_CAPTCHA: JSON.stringify(config.re_captcha),
                NETWORK_BASE_URL: JSON.stringify(config.network_base_url),
            },
        }),
    ],
};
