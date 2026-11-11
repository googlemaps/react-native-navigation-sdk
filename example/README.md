# React Native: NavSDK Library Sample App

## Description

This contains a sample application to showcase the functionality of the NavSDK library for React Native.

## Setup

First, make sure you go through the setup from the main [README](../README.md).

### Android

1. Open the example/android folder in Android Studio and add your api key in local.properties by adding a line like this:
    * ```MAPS_API_KEY=YOUR_API_KEY``` - make sure that this key is pointing to a Google Cloud project which had Nav SDK enabled.
    * To enable Nav SDK in your project follow these guides:
        * **Android**: https://developers.google.com/maps/documentation/navigation/android-sdk/set-up-project
        * **iOS**: https://developers.google.com/maps/documentation/navigation/ios-sdk/config

### iOS

1. Using your preferred terminal, go to example/ios folder and run the command below.

   `pod install`
   
   Note: This example app requires React Native's new architecture and uses dynamic framework linkage, both configured in the Podfile. Open `SampleApp.xcworkspace` in Xcode after installing pods.

2. Copy the `Keys.plist.sample` file located in `example/ios/SampleApp/` to a new file named `Keys.plist`. This file is git ignored and won't be accidentally committed. In your Google cloud console, add the Google API key to the project and add this newly created API key to the `Keys.plist` file.

    ```xml
    <key>API_KEY</key>
    <string>Your API KEY</string>
    ```

## Running the app

1. To run the sample app, navigate to the `example` folder in the root directory and use the following commands for your platform in the terminal.

    1. Ensure all workspace dependencies are installed:
      `yarn install`

    2. Start the metro bundler:
       * Android:
         `npx react-native run-android`
       * iOS:
         `npx react-native run-ios`


2. After the app initializes, accept the terms of services. You should see a map loaded in background if you have used the right API key.

### Android 
1. On your Emulator, go to App Info for the installed app, then Permissions > Location and allow location for the app.

2. Restart the app, now the Navigation view should be displayed instead of the map.

## Route-token integration tests

The focused route-token suite requests fresh single- and multi-stop tokens from
the Routes API, then exercises native routing, omitted and supported client modes,
nested display options, guidance, simulation, arrival, route replacement, and the
deprecated API on both platforms. Configure the native Navigation SDK keys above
and follow the [Detox setup](../CONTRIBUTING.md#integration-tests).

Enable Routes API for a test key that permits requests from the test machine.
An Android- or iOS-app-restricted key may not permit these Node-side requests.
The key stays in the test process; only the resulting token is entered into
the app. Do not commit keys or route tokens.

From the repository root:

```sh
yarn example detox:build:android-release
yarn example detox:build:ios-release

# Paste the Routes API key, then press Enter; input is not echoed.
read -r -s ROUTES_API_KEY
export ROUTES_API_KEY

yarn example detox:test:android-release --testMatch "$PWD/example/e2e/route_token.e2e.js"
yarn example detox:test:ios-release --testMatch "$PWD/example/e2e/route_token.e2e.js" --headless

unset ROUTES_API_KEY
```

The default `*.test.js` suite does not require this additional key. Its token
validation coverage checks unsupported mode rejection and prior-route preservation
using an invalid token. The focused suite fails explicitly if `ROUTES_API_KEY` is
missing or cannot obtain a token.
