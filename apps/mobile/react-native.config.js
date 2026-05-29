/**
 * Project-level autolinking override.
 *
 * Why this exists:
 *   In pnpm monorepos, `expo/react-native.config.js`'s findProjectRootSync()
 *   doesn't reliably locate the workspace root inside EAS's build environment.
 *   When it fails, packageImportPath becomes undefined and
 *   expo-modules-autolinking falls back to the SDK-49 path
 *   `expo.core.ExpoModulesPackage`, which no longer exists in SDK 52 — every
 *   Android build then dies at `compileReleaseJavaWithJavac` with
 *   "cannot find symbol class ExpoModulesPackage".
 *
 * This file pins the import path explicitly so autolinking always picks the
 * SDK 52+ path.
 */
module.exports = {
  dependencies: {
    expo: {
      platforms: {
        android: {
          packageImportPath: "import expo.modules.ExpoModulesPackage;",
        },
      },
    },
  },
};
