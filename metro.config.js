const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for .flow file resolution issue
config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.resolver.sourceExts = [...config.resolver.sourceExts, 'flow'];

// Handle missing .flow files
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config; 