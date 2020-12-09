const webpack = require("webpack");

module.exports = {
  optimization: { minimize: false },
  // Workaround for a bug with wpapi: https://github.com/netlify/netlify-lambda/issues/64#issuecomment-429625359
  plugins: [new webpack.DefinePlugin({ "global.GENTLY": false })],
};
