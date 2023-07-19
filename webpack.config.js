const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const appConfig = require("./config.json");
const webpack = require("webpack");
const path = require("path");
const config = appConfig.otherServers.li;
const host = "localhost";
const port = 5554;

module.exports = {

    devtool: "cheap-module-eval-source-map",

    context: path.resolve(__dirname, "public"),

    entry: {
        index: path.resolve(__dirname, "./src/"),
    },

    module: {
        rules: [
            {
                exclude: /(node_modules|bower_components)/,
                include: path.join(__dirname, "src"),
                test: /\.tsx?$/,
                use: "ts-loader",
            },
            {
                test: /\.(a?png|svg|eot|ttf)$/,
                use: "url-loader?limit=10000",
            },
            {
                loader: "url-loader?limit=10000&minetype=application/font-woff",
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            },
            {
                loader: "file-loader",
                test: /\.(jpe?g|gif|bmp|mp3|mp4|ogg|wav|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            },
            {
                exclude: [
                    path.resolve(__dirname, "node_modules"),
                    path.resolve(__dirname, "src/assets/css"),
                ],
                test: /\.css$/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: {
                            importLoaders: 1,
                            localIdentName: "[name]_[local]_[hash:base64]",
                            modules: true,
                            sourceMap: true,
                            // minimize: true
                        },
                    },
                ],
            },
            {
                include: [
                    path.resolve(__dirname, "node_modules"),
                    path.resolve(__dirname, "src/assets/css"),
                ],
                test: /\.css$/,
                use: [
                    "style-loader",
                    "css-loader",
                ],
            },
            {
                test: /\.html$/,
                use: "html-loader",
            },
        ],
    },

    output: {
        chunkFilename: "scripts/[name].chunk.js",
        filename: "scripts/[name].bundle.js",
        path: path.join(__dirname, "public"),
        publicPath: "/",
    },

    devServer: {
        compress: true,
        contentBase: path.join(__dirname, "public"),
        disableHostCheck: true,
        historyApiFallback: true,
        host: host,
        hot: true,
        port: port,
    },

    resolve: {
        alias: {
            ajaxRequests: path.resolve(__dirname, "src/ajax-requests"),
            assets: path.resolve(__dirname, "src/assets"),
            components: path.resolve(__dirname, "src/components"),
            configs: path.resolve(__dirname, "src/configs"),
            containers: path.resolve(__dirname, "src/containers"),
            helpers: path.resolve(__dirname, "src/helpers"),
            library: path.resolve(__dirname, "src/library"),
            modules: path.resolve(__dirname, "src/modules"),
            services: path.resolve(__dirname, "src/services"),
        },
        extensions: [".js", ".jsx", ".ts", ".tsx", ".css", ".ejs"],
        mainFields: ["module", "browser", "main"],
    },

    plugins: [
        new CleanWebpackPlugin([
            path.resolve(__dirname, "public/scripts"),
            path.resolve(__dirname, "public/assets/css"),
            path.resolve(__dirname, "public/assets/fonts"),
            path.resolve(__dirname, "public/index.html"),
        ]),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
        }),
        new webpack.HotModuleReplacementPlugin(),
        new MiniCssExtractPlugin({
            filename: "assets/css/style.css",
            path: path.join(__dirname, "public"),
            publicPath: path.resolve(__dirname, "../src/assets/css"),
        }),
        new HtmlWebpackPlugin({
            appMountId: "root",
            chunksSortMode: "none",
            favicon: path.resolve(__dirname, "public/favicon.ico"),
            filename: "index.html",
            inject: false,
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
                ENVIRONMENT: JSON.stringify("development"),
                GOOGLE_RE_CAPTCHA: JSON.stringify(config.re_captcha),
                NETWORK_BASE_URL: JSON.stringify(config.network_base_url),
            },
        }),
    ],
};
