const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

process.env.EXPO_ROUTER_APP_ROOT = path.resolve(projectRoot, 'app').replace(/\\/g, '/');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [projectRoot, workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

config.resolver.disableHierarchicalLookup = true;

config.server = {
  ...config.server,
  unstable_serverRoot: projectRoot,
};

module.exports = config;
