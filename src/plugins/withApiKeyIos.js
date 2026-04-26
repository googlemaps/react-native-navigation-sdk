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
const { withAppDelegate } = require('@expo/config-plugins');

/**
 * Config Plugin for @googlemaps/react-native-navigation-sdk (iOS)
 *
 * Injects GMSServices.provideAPIKey() into AppDelegate.swift
 */
const withApiKeyIos = (config, { iosApiKey } = {}) => {
  const key = iosApiKey ?? config?.ios?.config?.googleMapsApiKey;

  if (!key) {
    throw new Error(
      '[withApiKeyIos] Google Maps API key is not set. ' +
      'Pass it as a plugin option or set ios.config.googleMapsApiKey in app.config.ts.'
    );
  }

  return withAppDelegate(config, (c) => {
    let contents = c.modResults.contents;

    // Already patched
    if (contents.includes('GMSServices.provideAPIKey')) {
      return c;
    }

    // Add import if not present
    if (!contents.includes('import GoogleMaps')) {
      contents = contents.replace(
        /^import Expo/m,
        'import Expo\nimport GoogleMaps'
      );
    }

    // Inject provideAPIKey call right after the opening of application(_:didFinishLaunchingWithOptions:)
    contents = contents.replace(
      /(public override func application\(\s*_ application: UIApplication,\s*didFinishLaunchingWithOptions[^{]*\{)/,
      `$1\n    GMSServices.provideAPIKey("${key}")`
    );

    c.modResults.contents = contents;
    return c;
  });
};

module.exports = withApiKeyIos;
