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

   `RCT_NEW_ARCH_ENABLED=0 pod install`

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
