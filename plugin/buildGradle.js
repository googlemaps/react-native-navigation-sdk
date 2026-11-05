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

const { generatedBlock, upsertGeneratedBlock } = require('./generatedBlock');

const TAG = 'react-native-navigation-sdk-desugaring';

const DESUGARING_BLOCK = generatedBlock(TAG, '', [
  'android {',
  '    compileOptions {',
  '        coreLibraryDesugaringEnabled true',
  '    }',
  '}',
  '',
  'dependencies {',
  "    coreLibraryDesugaring 'com.android.tools:desugar_jdk_libs_nio:2.1.5'",
  '}',
]);

function append(contents, block) {
  return `${contents.trimEnd()}\n\n${block}\n`;
}

/** Enables core library desugaring, which the Navigation SDK requires, in the Groovy app/build.gradle. */
function addCoreLibraryDesugaring(contents) {
  return upsertGeneratedBlock(contents, TAG, DESUGARING_BLOCK, append);
}

module.exports = { addCoreLibraryDesugaring };
