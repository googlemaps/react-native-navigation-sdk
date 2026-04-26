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
const { withGradleProperties } = require('@expo/config-plugins');

/**
 * Config Plugin for @googlemaps/react-native-navigation-sdk
 *
 * Enables Jetifier in android/gradle.properties to ensure compatibility
 * with AndroidX when using the Google Navigation SDK.
 */
const withJetifier = (config) => {
  return withGradleProperties(config, (c) => {
    const props = c.modResults;

    const existing = props.find(
      (p) => p.type === 'property' && p.key === 'android.enableJetifier'
    );

    if (existing) {
      existing.value = 'true';
    } else {
      props.push({
        type: 'property',
        key: 'android.enableJetifier',
        value: 'true',
      });
    }

    return c;
  });
};

module.exports = withJetifier;
