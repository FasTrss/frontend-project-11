// Generated using webpack-cli https://github.com/webpack/webpack-cli

/* eslint-disable */
import path from "path";
import HTMLWebpackPlugin from "html-webpack-plugin";

const mode =
  process.env.NODE_ENV === "production" ? "production" : "development";

export default {
  //context: path.resolve(__dirname, 'src'),
  mode: mode,
  entry: "./src/index.js",
  output: {
    path: path.resolve("dist"),
    clean: true,
  },
  devServer: {
    open: true,
    host: "localhost",
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: "index.html",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/i,
        loader: "babel-loader",
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: "asset",
      },

      { test: /\.css$/, use: ["style-loader", "css-loader", "postcss-loader"] },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader", "postcss-loader"],
      },
      {
        test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: "url-loader?limit=10000",
      },
      {
        test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
        use: "file-loader",
      },
    ],
  },
};
