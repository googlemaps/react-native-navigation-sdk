# Using the Navigation SDK with Expo

This guide explains how to set up the React Native Navigation SDK in an Expo app.
The package ships an [Expo config plugin](https://docs.expo.dev/config-plugins/introduction/)
that applies the native setup during `npx expo prebuild`.

## Requirements

- Expo SDK 58 or later. Earlier SDKs ship a React Native version below this
  package's minimum; see [React Native Compatibility](./README.md#react-native-compatibility).
- A [development build](https://docs.expo.dev/develop/development-builds/introduction/).
  Expo Go cannot load this package's native code, so start the app with
  `npx expo run:android` and `npx expo run:ios`, or build it with EAS Build.

## Setup

Install the package and `expo-build-properties`:

```shell
npx expo install @googlemaps/react-native-navigation-sdk expo-build-properties
```

Add the required settings to the `expo` object in `app.json`, keeping the
fields your app already has:

```json
{
  "expo": {
    "ios": {
      "deploymentTarget": "17.0",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "Navigation needs your location.",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "Navigation needs your location.",
        "NSMotionUsageDescription": "Used to improve navigation features.",
        "UIBackgroundModes": ["location", "audio"]
      }
    },
    "plugins": [
      "@googlemaps/react-native-navigation-sdk",
      ["expo-build-properties", { "android": { "kotlinVersion": "2.3.21" } }]
    ]
  }
}
```

`npx expo install` may already have added `expo-build-properties` to `plugins`
without options; keep a single entry with the Kotlin version. The override is
required because the Navigation SDK needs Kotlin Gradle Plugin 2.3.0 or later;
see the [Migration Guide](./MIGRATING.md).

Set the API keys in `ios.config.googleMapsApiKey` and
`android.config.googleMaps.apiKey`. Expo writes them to `Info.plist` as
`GMSApiKey` and to `AndroidManifest.xml`. To read them from environment
variables, add an `app.config.js` that extends `app.json`:

```js
module.exports = ({ config }) => ({
  ...config,
  ios: {
    ...config.ios,
    config: { googleMapsApiKey: process.env.GOOGLE_MAPS_IOS_API_KEY },
  },
  android: {
    ...config.android,
    config: { googleMaps: { apiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY } },
  },
});
```

Then generate the native projects:

```shell
npx expo prebuild --clean
```

## Location permission

The `infoPlist` usage descriptions only provide the text of the iOS permission
prompt. The app requests location permission at runtime before it initializes
navigation; see
[Requesting and handling permissions](./README.md#requesting-and-handling-permissions).
In an Expo app, `expo-location` can request it:

```shell
npx expo install expo-location
```

```tsx
import * as Location from 'expo-location';

const { granted } = await Location.requestForegroundPermissionsAsync();
```

## What the plugin changes

The plugin applies the native setup that Expo's app config does not cover:

- **iOS**: adds `import GoogleMaps` to `AppDelegate.swift` and passes the
  `Info.plist` `GMSApiKey` value to `GMSServices.provideAPIKey` at launch.
- **Android**: enables Jetifier in `gradle.properties`, and enables core library
  desugaring with `desugar_jdk_libs_nio` in `app/build.gradle`.

`npx expo prebuild` fails with an error from the plugin when an API key is not
set, or when it cannot find where to add its code in `AppDelegate.swift`. The
plugin supports the Swift `AppDelegate` and the Groovy `app/build.gradle` that
Expo SDK 58 generates.

Other packages that depend on the Google Maps SDK, such as `react-native-maps`,
may conflict with this package; see
[Compatibility with other libraries](./README.md#compatibility-with-other-libraries).

## Projects that keep native folders

If your project commits its `ios` and `android` folders instead of generating
them with `npx expo prebuild`, the plugin does not run. Follow the
[Android](./README.md#android) and [iOS](./README.md#ios) setup in the README
instead.
