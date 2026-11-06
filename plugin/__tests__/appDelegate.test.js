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
const { addGoogleMapsApiKey } = require('../appDelegate');

// Has the shape of the AppDelegate.swift that Expo SDK 58 generates: the file
// starts with `internal import Expo`, and didFinishLaunchingWithOptions takes a
// default argument and spans several lines.
const template = [
  'internal import Expo',
  'import React',
  'import ReactAppDependencyProvider',
  '',
  '@main',
  'class AppDelegate: ExpoAppDelegate {',
  '  public override func application(',
  '    _ application: UIApplication,',
  '    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil',
  '  ) -> Bool {',
  '    let delegate = ReactNativeDelegate()',
  '    return super.application(application, didFinishLaunchingWithOptions: launchOptions)',
  '  }',
  '}',
  '',
].join('\n');

test('adds import GoogleMaps after the template imports, including internal import Expo', () => {
  const lines = addGoogleMapsApiKey(template).split('\n');

  assert.deepEqual(lines.slice(0, 5), [
    'internal import Expo',
    'import React',
    'import ReactAppDependencyProvider',
    'import GoogleMaps',
    '',
  ]);
});

test('adds import GoogleMaps when the only import has an access-level modifier', () => {
  const onlyExpo = template.replace(
    'import React\nimport ReactAppDependencyProvider\n',
    ''
  );

  const lines = addGoogleMapsApiKey(onlyExpo).split('\n');

  assert.deepEqual(lines.slice(0, 2), [
    'internal import Expo',
    'import GoogleMaps',
  ]);
});

test('provides the Info.plist GMSApiKey as the first statement of didFinishLaunchingWithOptions', () => {
  const result = addGoogleMapsApiKey(template);
  const launch = result.indexOf(
    'didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil\n  ) -> Bool {\n'
  );
  assert.notEqual(launch, -1);

  const body = result.slice(launch).split('\n').slice(2, 9);
  assert.deepEqual(body, [
    '    // @generated begin react-native-navigation-sdk-api-key',
    '    guard let googleMapsApiKey = Bundle.main.object(forInfoDictionaryKey: "GMSApiKey") as? String else {',
    '      fatalError("GMSApiKey is missing from Info.plist. Set ios.config.googleMapsApiKey in the Expo app config.")',
    '    }',
    '    GMSServices.provideAPIKey(googleMapsApiKey)',
    '    // @generated end react-native-navigation-sdk-api-key',
    '    let delegate = ReactNativeDelegate()',
  ]);
});

test('running twice leaves the file unchanged', () => {
  const once = addGoogleMapsApiKey(template);

  assert.equal(addGoogleMapsApiKey(once), once);
});

test('replaces an outdated generated block in place', () => {
  const current = addGoogleMapsApiKey(template);
  const outdated = current.replace(
    'GMSServices.provideAPIKey(googleMapsApiKey)',
    'GMSServices.provideAPIKey("OLD")'
  );

  assert.equal(addGoogleMapsApiKey(outdated), current);
});

test('keeps an existing import GoogleMaps', () => {
  const imported = template.replace(
    'import React\n',
    'import React\nimport GoogleMaps\n'
  );

  const result = addGoogleMapsApiKey(imported);

  assert.equal(result.match(/^import GoogleMaps$/gm).length, 1);
});

test('fails when the file has no import statements', () => {
  const noImports = template.replace(/^.*import .*\n/gm, '');

  assert.throws(() => addGoogleMapsApiKey(noImports), {
    code: 'APP_DELEGATE_IMPORTS_NOT_FOUND',
  });
});

test('fails when didFinishLaunchingWithOptions is missing', () => {
  const noLaunch = template.replace(
    'didFinishLaunchingWithOptions',
    'willFinishLaunchingWithOptions'
  );

  assert.throws(() => addGoogleMapsApiKey(noLaunch), {
    code: 'APP_DELEGATE_LAUNCH_METHOD_NOT_FOUND',
  });
});
