const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ignore backend and potentially large folders to prevent watch crash on Windows
config.resolver.blacklistRE = /#|node_modules\/.*\/node_modules\/fsevents.*|backend\/.*|frontend\/.*|.git\/.*/;

// Mock react-native-maps for web
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web" && moduleName === "react-native-maps") {
    return {
      type: "empty",
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
