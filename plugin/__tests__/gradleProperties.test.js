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
const { test } = require('node:test');
const { enableJetifier } = require('../gradleProperties');

test('adds android.enableJetifier=true when it is absent', () => {
  const properties = [
    { type: 'property', key: 'android.useAndroidX', value: 'true' },
  ];

  assert.deepEqual(enableJetifier(properties), [
    { type: 'property', key: 'android.useAndroidX', value: 'true' },
    { type: 'property', key: 'android.enableJetifier', value: 'true' },
  ]);
});

test('turns on an existing android.enableJetifier=false', () => {
  const properties = [
    { type: 'comment', value: 'Jetifier' },
    { type: 'property', key: 'android.enableJetifier', value: 'false' },
  ];

  assert.deepEqual(enableJetifier(properties), [
    { type: 'comment', value: 'Jetifier' },
    { type: 'property', key: 'android.enableJetifier', value: 'true' },
  ]);
});
