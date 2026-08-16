const webpack = require('webpack');
const path = require('path');

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

  // Add alias for @/
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(__dirname, 'src'),
  };

  return config;
};
