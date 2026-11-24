const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

// react-native-dotenv inlines .env values at transform time, so tie Metro's
// cache to the .env contents — editing .env then invalidates stale bundles.
const envPath = path.resolve(__dirname, '.env');
const envHash = fs.existsSync(envPath)
  ? crypto.createHash('md5').update(fs.readFileSync(envPath)).digest('hex')
  : 'no-env';

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  cacheVersion: envHash,
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
