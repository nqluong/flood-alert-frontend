const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

process.env.EXPO_ROUTER_APP_ROOT = path.resolve(projectRoot, 'app').replace(/\\/g, '/');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// In a monorepo all @react-native/* packages (js-polyfills, normalize-colors,
// assets-registry, etc.) exist in BOTH apps/mobile-app/node_modules AND the
// workspace root node_modules. Metro can bundle both copies; when the second
// copy runs it tries to redefine Hermes non-writable globals (__DEV__, etc.)
// causing "TypeError: property is not writable".
//
// This Proxy intercepts every module lookup: if the package exists locally in
// apps/mobile-app/node_modules, it returns that path (one canonical copy).
// If it only exists in the workspace root, it returns undefined and Metro falls
// back to normal resolution via nodeModulesPaths.
const localNodeModules = path.resolve(projectRoot, 'node_modules');
const modulePathCache = {};
config.resolver.extraNodeModules = new Proxy(
  {},
  {
    get: (_target, name) => {
      if (typeof name !== 'string') return undefined;
      if (name in modulePathCache) return modulePathCache[name];
      const localPath = path.resolve(localNodeModules, name);
      const result = fs.existsSync(localPath) ? localPath : undefined;
      modulePathCache[name] = result;
      return result;
    },
  }
);

module.exports = config;