/**
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const {
  createRunOncePlugin,
  withAppBuildGradle,
  withAppDelegate,
  withGradleProperties,
  withPlugins,
} = require('expo/config-plugins');
const pkg = require('../package.json');
const { addGoogleMapsApiKey } = require('./appDelegate');
const { addCoreLibraryDesugaring } = require('./buildGradle');
const { enableJetifier } = require('./gradleProperties');
const { pluginError } = require('./pluginError');

// Expo evaluates plugins every time it reads the app config, including from
// native build phases such as expo-constants. Checks therefore run only inside
// the mods, which execute during `expo prebuild`, so a build never fails on an
// API key that is already written into the native project.

const withIosApiKey = config =>
  withAppDelegate(config, mod => {
    if (!mod.ios?.config?.googleMapsApiKey) {
      throw pluginError(
        'IOS_API_KEY_MISSING',
        'Set ios.config.googleMapsApiKey in the Expo app config.'
      );
    }
    if (mod.modResults.language !== 'swift') {
      throw pluginError(
        'APP_DELEGATE_NOT_SWIFT',
        `Expected a Swift AppDelegate, found ${mod.modResults.language}. Expo SDK 58 and later generate a Swift AppDelegate.`
      );
    }
    mod.modResults.contents = addGoogleMapsApiKey(mod.modResults.contents);
    return mod;
  });

const withAndroidDesugaring = config =>
  withAppBuildGradle(config, mod => {
    if (!mod.android?.config?.googleMaps?.apiKey) {
      throw pluginError(
        'ANDROID_API_KEY_MISSING',
        'Set android.config.googleMaps.apiKey in the Expo app config.'
      );
    }
    if (mod.modResults.language !== 'groovy') {
      throw pluginError(
        'BUILD_GRADLE_NOT_GROOVY',
        `Expected a Groovy app/build.gradle, found ${mod.modResults.language}.`
      );
    }
    mod.modResults.contents = addCoreLibraryDesugaring(mod.modResults.contents);
    return mod;
  });

const withAndroidJetifier = config =>
  withGradleProperties(config, mod => {
    mod.modResults = enableJetifier(mod.modResults);
    return mod;
  });

/** Applies the native project setup that the Navigation SDK needs and Expo's app config does not cover. */
const withNavigationSdk = config =>
  withPlugins(config, [
    withIosApiKey,
    withAndroidDesugaring,
    withAndroidJetifier,
  ]);

module.exports = createRunOncePlugin(withNavigationSdk, pkg.name, pkg.version);
