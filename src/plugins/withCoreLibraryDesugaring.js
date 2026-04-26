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
const { withAppBuildGradle } = require('@expo/config-plugins');

const TAG = 'withCoreLibraryDesugaring';

const block = `
// @generated begin ${TAG}
android {
    compileOptions {
        coreLibraryDesugaringEnabled true
    }
}

dependencies {
    coreLibraryDesugaring 'com.android.tools:desugar_jdk_libs_nio:2.0.4'
}
// @generated end ${TAG}
`;

const withCoreLibraryDesugaring = (config) => {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language !== 'groovy') {
      throw new Error('Only Groovy build.gradle is supported.');
    }

    const contents = config.modResults.contents;

    if (!contents.includes(`// @generated begin ${TAG}`)) {
      config.modResults.contents = `${contents.trimEnd()}\n\n${block}`;
    }

    return config;
  });
};

module.exports = withCoreLibraryDesugaring;
