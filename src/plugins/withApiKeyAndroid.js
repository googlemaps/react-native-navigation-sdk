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
const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Config Plugin for @googlemaps/react-native-navigation-sdk (Android)
 *
 * Injects the Google Maps API key into AndroidManifest.xml as a <meta-data> entry
 */
const withApiKeyAndroid = (config, { androidApiKey } = {}) => {
  const key = androidApiKey ?? config?.android?.config?.googleMaps?.apiKey;

  if (!key) {
    throw new Error(
      '[withApiKeyAndroid] Google Maps API key is not set. ' +
      'Pass it as a plugin option or set android.config.googleMaps.apiKey in app.config.ts.'
    );
  }

  return withAndroidManifest(config, (c) => {
    const mainApp = c.modResults.manifest.application?.[0];
    if (mainApp) {
      mainApp['meta-data'] = mainApp['meta-data'] ?? [];
      const existing = mainApp['meta-data'].find(
        (m) => m.$?.['android:name'] === 'com.google.android.geo.API_KEY'
      );
      if (existing) {
        existing.$['android:value'] = key;
      } else {
        mainApp['meta-data'].push({
          $: { 'android:name': 'com.google.android.geo.API_KEY', 'android:value': key },
        });
      }
    }
    return c;
  });
};

module.exports = withApiKeyAndroid;
