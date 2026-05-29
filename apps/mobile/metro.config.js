// Metro config for Expo + pnpm monorepo.
// Recipe from Expo's docs (https://docs.expo.dev/guides/monorepos/).
const { getDefaultConfig } = require("expo/metro-config");
const path = require("node:path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Watch all files in the monorepo (so changes in packages/shared trigger reloads).
//    Append to Expo's defaults rather than replace, so any Expo plugin-added
//    folders stay watched.
config.watchFolders = [...(config.watchFolders ?? []), workspaceRoot];

// 2. Let Metro resolve modules from both the project's node_modules and the workspace root's.
//    (With nodeLinker: hoisted the workspace root has the real packages; this is belt + braces.)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// 3. Force Metro to look up the dependency tree only at the project's node_modules first.
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
