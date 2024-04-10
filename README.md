# Google Maps Navigation (Preview)

## Description

This repository contains a React Native library that provides a [Google Maps Navigation](https://developers.google.com/maps/documentation/navigation) component for building native Android and iOS apps using React.

The library is currenty in experimental state with a limited set of features available. [Turn-by-turn](https://developers.google.com/maps/documentation/navigation/android-sdk/tbt-feed), [Ground overlays](https://developers.google.com/maps/documentation/android-sdk/groundoverlay), and [Street view](https://developers.google.com/maps/documentation/android-sdk/streetview) are some of the main features that are not included but will come in the GA release.

## Requirements

|             | Android | iOS       |
| ----------- | ------- | --------- |
| **Support** | SDK 23+ | iOS 14.0+ |

* A React Native project
* A Google Cloud project with the [Navigation SDK enabled](https://developers.google.com/maps/documentation/navigation/android-sdk/set-up-project) and the [Maps SDK for iOS enabled](https://developers.google.com/maps/documentation/navigation/ios-sdk/config)
* An API key from the project above
* If targeting Android, [Google Play Services](https://developers.google.com/android/guides/overview) installed and enabled
* [Attributions and licensing text](https://developers.google.com/maps/documentation/navigation/android-sdk/set-up-project#include_the_required_attributions_in_your_app) added to your app

## Installation

This package is listed on NPM as [@googlemaps/react-native-navigation-sdk](https://www.npmjs.com/package/@googlemaps/react-native-navigation-sdk). Install it with:

```shell
npm i @googlemaps/react-native-navigation-sdk
```

In your TSX or JSX file, import the components you need:

```tsx
import { NavigationView } from '@googlemaps/react-native-navigation-sdk';
```

### Android

1. Set the `minSdkVersion` in `android/app/build.gradle`:

```groovy
android {
    defaultConfig {
        minSdkVersion 23
    }
}
```

1. To securely store your API key, it is recommended to use the [Google Maps Secrets Gradle Plugin](https://developers.google.com/maps/documentation/android-sdk/secrets-gradle-plugin). This plugin helps manage API keys without exposing them in your app's source code.

See example configuration for secrets plugin at example applications [build.gradle](./SampleApp/android/app/build.gradle) file.

### iOS

1. Set the iOS version in your application PodFile.

   `platform: ios, '14.0'`

1. Make sure to run `pod install` from your application `ios` module.

1. To set up, store your API key in the application plist file ([example](./SampleApp/ios/SampleApp/Info.plist), the key is defined under the API_KEY value). Then you need to update your [AppDelegate](./SampleApp/ios/SampleApp/AppDelegate.mm) file so the key can be read.

## Usage

You can now add a `NavigationView` component to your application..

The view can be controlled with the `ViewController` (Navigation and MapView) that are retrieved from the `onMapViewControllerCreated` and `onNavigationViewControllerCreated` (respectively).

The `NavigationView` compoonent should be used within a View with a bounded size. Using it
in an unbounded widget will cause the application to behave unexpectedly.

### Add a navigation view

```tsx
    // Permissions must have been granted by this point.

    <NavigationView
        width={navViewWidth}
        height={navViewHeight}
        androidStylingOptions={{
            primaryDayModeThemeColor: '#34eba8',
            headerDistanceValueTextColor: '#76b5c5',
            headerInstructionsFirstRowTextSize: '20f',
        }}
        iOSStylingOptions={{
            navigationHeaderPrimaryBackgroundColor: '#34eba8',
            navigationHeaderDistanceValueTextColor: '#76b5c5',
        }}
        navigationViewCallbacks={navigationViewCallbacks}
        mapViewCallbacks={mapViewCallbacks}
        onMapViewControllerCreated={setMapViewController}
        onNavigationViewControllerCreated={setNavigationViewController}
        termsAndConditionsDialogOptions={termsAndConditionsDialogOptions}
    />
```

See the [example](./SampleApp) directory for a complete navigation sample app.

### Requesting and handling permissions

The Google Navigation SDK React Native library offers functionalities that necessitate specific permissions from the mobile operating system. These include, but are not limited to, location services, background execution, and receiving background location updates.

> [!NOTE]
> The management of these permissions falls outside the scope of the Navigation SDKs for Android and iOS. As a developer integrating these SDKs into your applications, you are responsible for requesting and obtaining the necessary permissions from the users of your app.

You can see example of handling permissions in the [app.tsx](./SampleApp/src/app.tsx) file of the sample application:

```tsx
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';

// ...

// Request permission for accessing the device's location.
const requestPermissions = async () => {
    const result = await request(
        Platform.OS =="android" ?
            PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION :
            PERMISSIONS.IOS.LOCATION_ALWAYS,
    );

    if (result == RESULTS.GRANTED) {
        setArePermissionsApproved(true);
    } else {
        Snackbar.show({
            text: 'Permissions are needed to proceed with the app. Please re-open and accept.',
            duration: Snackbar.LENGTH_SHORT,
        });
    }
};
```

## Contributing

See the [Contributing guide](./CONTRIBUTING.md).

## Terms of Service

This library uses Google Maps Platform services. Use of Google Maps Platform services through this library is subject to the [Google Maps Platform Terms of Service](https://cloud.google.com/maps-platform/terms).

This library is not a Google Maps Platform Core Service. Therefore, the Google Maps Platform Terms of Service (e.g. Technical Support Services, Service Level Agreements, and Deprecation Policy) do not apply to the code in this library.


## Support

This package is offered via an open source license. It is not governed by the Google Maps Platform Support [Technical Support Services Guidelines](https://cloud.google.com/maps-platform/terms/tssg), the [SLA](https://cloud.google.com/maps-platform/terms/sla), or the [Deprecation Policy](https://cloud.google.com/maps-platform/terms) (however, any Google Maps Platform services used by the library remain subject to the Google Maps Platform Terms of Service).

This package adheres to [semantic versioning](https://semver.org/) to indicate when backwards-incompatible changes are introduced. Accordingly, while the library is in version 0.x, backwards-incompatible changes may be introduced at any time.

If you find a bug, or have a feature request, please [file an issue](https://github.com/googlemaps/react-native-navigation-sdk/issues) on GitHub. If you would like to get answers to technical questions from other Google Maps Platform developers, ask through one of our [developer community channels](https://developers.google.com/maps/developer-community). If you'd like to contribute, please check the [Contributing guide](https://github.com/googlemaps/react-native-navigation-sdk/blob/main/CONTRIBUTING.md).


