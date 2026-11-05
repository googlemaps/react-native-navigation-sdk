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

const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { test } = require('node:test');
const { addCoreLibraryDesugaring } = require('../buildGradle');

// Copied from expo-template-bare-minimum@58.0.32.
const template = readFileSync(
  join(__dirname, '../__fixtures__/sdk58/build.gradle'),
  'utf8'
);

const block = [
  '// @generated begin react-native-navigation-sdk-desugaring',
  'android {',
  '    compileOptions {',
  '        coreLibraryDesugaringEnabled true',
  '    }',
  '}',
  '',
  'dependencies {',
  "    coreLibraryDesugaring 'com.android.tools:desugar_jdk_libs_nio:2.1.5'",
  '}',
  '// @generated end react-native-navigation-sdk-desugaring',
  '',
].join('\n');

test('appends the desugaring block to the template', () => {
  const result = addCoreLibraryDesugaring(template);

  assert.ok(result.startsWith(template.trimEnd()));
  assert.ok(result.endsWith(`\n\n${block}`));
});

test('running twice leaves the file unchanged', () => {
  const once = addCoreLibraryDesugaring(template);

  assert.equal(addCoreLibraryDesugaring(once), once);
});

test('updates an outdated desugaring version in place', () => {
  const current = addCoreLibraryDesugaring(template);
  const outdated = current.replace('nio:2.1.5', 'nio:2.0.4');

  assert.equal(addCoreLibraryDesugaring(outdated), current);
});
