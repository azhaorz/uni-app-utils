const path = require("path");
const merge = require("webpack-merge");
const common = require("./webpack.common.js");
// const UglifyJSPlugin = require("uglifyjs-webpack-plugin");

module.exports = merge(common, {
  mode: "production",
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "../", "dist", "prod")
  }
  // plugins: [new UglifyJSPlugin()]
});
