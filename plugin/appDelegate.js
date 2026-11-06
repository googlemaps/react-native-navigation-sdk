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
const { pluginError } = require('./pluginError');

const TAG = 'react-native-navigation-sdk-api-key';

// Matches access-level and attribute prefixes, such as the SDK 58 template's
// `internal import Expo`.
const IMPORT_LINE = /^(?:[\w@]+[ \t]+)*import[ \t]+[\w.]+[ \t]*$/gm;
const GOOGLE_MAPS_IMPORT = /^(?:[\w@]+[ \t]+)*import[ \t]+GoogleMaps[ \t]*$/m;
const DID_FINISH_LAUNCHING =
  /func application\(\s*_ application: UIApplication,\s*didFinishLaunchingWithOptions[^{]*\{[^\n]*\n/;

// Expo writes `ios.config.googleMapsApiKey` to Info.plist as `GMSApiKey`, so
// the key has a single source and never appears in Swift source.
const API_KEY_BLOCK = generatedBlock(TAG, '    ', [
  'guard let googleMapsApiKey = Bundle.main.object(forInfoDictionaryKey: "GMSApiKey") as? String else {',
  '  fatalError("GMSApiKey is missing from Info.plist. Set ios.config.googleMapsApiKey in the Expo app config.")',
  '}',
  'GMSServices.provideAPIKey(googleMapsApiKey)',
]);

function addGoogleMapsImport(contents) {
  if (GOOGLE_MAPS_IMPORT.test(contents)) {
    return contents;
  }
  const imports = [...contents.matchAll(IMPORT_LINE)];
  if (imports.length === 0) {
    throw pluginError(
      'APP_DELEGATE_IMPORTS_NOT_FOUND',
      'Could not find the import statements in AppDelegate.swift to add `import GoogleMaps`.'
    );
  }
  const last = imports[imports.length - 1];
  const end = last.index + last[0].length;
  return `${contents.slice(0, end)}\nimport GoogleMaps${contents.slice(end)}`;
}

function insertAtLaunch(contents, block) {
  const launch = contents.match(DID_FINISH_LAUNCHING);
  if (!launch) {
    throw pluginError(
      'APP_DELEGATE_LAUNCH_METHOD_NOT_FOUND',
      'Could not find application(_:didFinishLaunchingWithOptions:) in AppDelegate.swift to provide the Google Maps API key.'
    );
  }
  const end = launch.index + launch[0].length;
  return `${contents.slice(0, end)}${block}\n${contents.slice(end)}`;
}

/** Makes AppDelegate.swift import GoogleMaps and pass the Info.plist API key to GMSServices at launch. */
function addGoogleMapsApiKey(contents) {
  return upsertGeneratedBlock(
    addGoogleMapsImport(contents),
    TAG,
    API_KEY_BLOCK,
    insertAtLaunch
  );
}

module.exports = { addGoogleMapsApiKey };
