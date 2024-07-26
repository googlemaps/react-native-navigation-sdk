# React Native: NavSDK Library Sample App

## Description

This contains a sample application to showcase the functionality of the NavSDK library for React Native.

## Setup

1. First, make sure you go through the setup from the main [README](../README.md).

1. Run this command `npm install react-native` from the root of SampleApp folder. This will generate the `node_modules` from this sample app.
    * In case you get a `Permission denied (publickey).` error here, make sure that you have authenticated with Github in your terminal.
1. Run this in SampleApp's root directory:

   `npm install --save https://github.com/googlemaps/react-native-navigation-sdk`

1. Open the SampleApp/android folder in Android Studio and add your api key in local.properties by adding a line like this:
    * ```MAPS_API_KEY=YOUR_API_KEY``` - make sure that this key is pointing to a Google Cloud project which had Nav SDK enabled.
    * To enable Nav SDK in your project follow these guides:
        * **Android**: https://developers.google.com/maps/documentation/navigation/android-sdk/set-up-project
        * **iOS**: https://developers.google.com/maps/documentation/navigation/ios-sdk/config
1. Using your preferred terminal, go to SampleApp/ios folder and run the command below.

   `pod install`

1. In your Google cloud console, add the Google API key to the project. Add this newly created API key to the Info.plist file inside `SampleApp/ios/SampleApp/`.

    ```xml
    <key>API_KEY</key>
    <string>Your API KEY</string>
    ```

1. To run the sample app, go to the root folder of the sample app and run the command below according to platform using your preferred terminal.

    * Running in Android:
      `npx react-native run-android`
    * Running in iOS:
      `npx react-native run-ios`


1. After the app initializes, accept the terms of services. You should see a map loaded in background if you have used the right API key.


### Android 
1. On your Emulator, go to App Info for the installed app, then Permissions > Location and allow location for the app.

1. Restart the app, now the Navigation view should be displayed instead of the map.
