const webpack = require('webpack');
const WorkBoxPlugin = require('workbox-webpack-plugin');

module.exports = function override(config) {
  config.resolve.fallback = {
    process: require.resolve('process/browser'),
    zlib: require.resolve('browserify-zlib'),
    stream: require.resolve('stream-browserify'),
    util: require.resolve('util'),
    buffer: require.resolve('buffer'),
    asset: require.resolve('assert'),
  };

  // https://stackoverflow.com/questions/69135310/workaround-for-cache-size-limit-in-create-react-app-pwa-service-worker
  config.plugins.forEach((plugin) => {
    if (plugin instanceof WorkBoxPlugin.InjectManifest) {
      plugin.config.maximumFileSizeToCacheInBytes = 50 * 1024 * 1024;
    }

    // The type checker runs in a forked process capped at 2048 MB by default,
    // which this codebase outgrew ("Issues checking service aborted - probably
    // out of memory"). Give it more headroom.
    if (plugin.constructor && plugin.constructor.name === 'ForkTsCheckerWebpackPlugin') {
      plugin.options = plugin.options || {};
      plugin.options.typescript = {
        ...(plugin.options.typescript || {}),
        memoryLimit: 4096,
      };
    }
  });

  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: 'process/browser.js',
      Buffer: ['buffer', 'Buffer'],
    }),
  ];

  return config;
};
