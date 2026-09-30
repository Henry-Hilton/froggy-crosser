// Use Expo's flat lint configuration and exclude generated bundles and coverage reports.
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
module.exports = defineConfig([expoConfig, { ignores: ['dist/**', 'coverage/**'] }]);
