const path = require('path');

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // expo-router is not hoisted to the workspace root, so babel-preset-expo
      // (at workspace root) can't find it via require.resolve and skips
      // expoRouterBabelPlugin. Explicitly add it using an absolute path.
      require(path.join(__dirname, '../../node_modules/babel-preset-expo/build/expo-router-plugin'))
        .expoRouterBabelPlugin,
    ],
  };
};
