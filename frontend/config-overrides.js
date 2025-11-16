const webpack = require('webpack');

module.exports = function override(config) {
  // Add fallback for 'process/browser'
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "process/browser": require.resolve("process/browser"),
    "process": require.resolve("process/browser")
  };

  // Add process polyfill
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ]);

  return config;
};
