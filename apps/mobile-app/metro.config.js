const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

process.env.EXPO_ROUTER_APP_ROOT = path.resolve(projectRoot, 'app').replace(/\\/g, '/');

const config = getDefaultConfig(projectRoot);

// 1. SỬA QUAN TRỌNG: Cho phép Metro theo dõi cả thư mục gốc (Root) của Monorepo
config.watchFolders = [projectRoot, workspaceRoot];

// 2. SỬA QUAN TRỌNG: Chỉ đường cho Metro tìm thư viện.
// Ưu tiên tìm ở local trước, nếu không có thì chạy ra Root để tìm.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Ép Metro phải đọc theo đúng 2 đường dẫn đã chỉ định ở trên
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
