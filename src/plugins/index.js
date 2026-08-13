/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable */
const withApiKeyAndroid = require('./withApiKeyAndroid');
const withApiKeyIos = require('./withApiKeyIos');
const withCoreLibraryDesugaring = require('./withCoreLibraryDesugaring');
const withJetifier = require('./withJetifier');

/**
 * Expo Config Plugin for @googlemaps/react-native-navigation-sdk
 *
 * Automatically configures both Android and iOS native projects
 * with the required Google Maps API key for the Navigation SDK.
 *
 * Usage in app.config.ts:
 *
 *   plugins: [
 *     [
 *       '@googlemaps/react-native-navigation-sdk',
 *       {
 *         androidApiKey: 'YOUR_ANDROID_API_KEY',
 *         iosApiKey: 'YOUR_IOS_API_KEY',
 *       }
 *     ]
 *   ]
 *
 * Alternatively, set the API key via:
 *   - android.config.googleMaps.apiKey  (Android)
 *   - ios.config.googleMapsApiKey       (iOS)
 */
const withNavigationSdk = (config, options = {}) => {
  config = withApiKeyAndroid(config, options);
  config = withApiKeyIos(config, options);
  config = withCoreLibraryDesugaring(config);
  config = withJetifier(config);
  return config;
};

module.exports = withNavigationSdk;
