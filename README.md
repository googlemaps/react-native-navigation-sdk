# Google Navigation for React Native (Beta)

## Description

This repository contains a React Native plugin that provides a [Google Navigation](https://developers.google.com/maps/documentation/navigation) component for building native Android and iOS apps using React.

> [!NOTE]
> This package is in Beta until it reaches version 1.0. According to [semantic versioning](https://semver.org/#spec-item-4), breaking changes may be introduced before 1.0.

## Requirements

|                                 | Android | iOS       |
| ------------------------------- | ------- | --------- |
| **Minimum mobile OS supported** | SDK 23+ | iOS 14.0+ |

* A React Native project
- A Google Cloud project with a Mobility solution enabled, such as On-Demand Rides and Deliveries or Last Mile Fleet Solution. This requires you to Contact Sales as described in the [Mobility services documentation](https://developers.google.com/maps/documentation/transportation-logistics/mobility).
- In that Google Cloud project,  these four products also need to be enabled depending on the target(s) of your React Native app:
  - [Maps SDK for Android](https://developers.google.com/maps/documentation/android-sdk/cloud-setup#enabling-apis)
  - [Navigation SDK for Android](https://developers.google.com/maps/documentation/navigation/android-sdk/set-up-project)
  - [Maps SDK for iOS](https://developers.google.com/maps/documentation/ios-sdk/cloud-setup#enabling-apis)
  - [Navigation SDK for iOS](https://developers.google.com/maps/documentation/navigation/ios-sdk/config)
* An [API key](https://console.cloud.google.com/google/maps-apis/credentials) from the project above
* If targeting Android, [Google Play Services](https://developers.google.com/android/guides/overview) installed and enabled
* [Attributions and licensing text](https://developers.google.com/maps/documentation/navigation/android-sdk/set-up-project#include_the_required_attributions_in_your_app) added to your app

> [!IMPORTANT]
> [Apply API restrictions](https://developers.google.com/maps/api-security-best-practices#api-restriction) to the API key to limit usage to "Navigation SDK, "Maps SDK for Android", and "Maps SDK for iOS" for enhanced security and cost management. This helps guard against unauthorized use of your API key.

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

To securely store your API key, it is recommended to use the [Google Maps Secrets Gradle Plugin](https://developers.google.com/maps/documentation/android-sdk/secrets-gradle-plugin). This plugin helps manage API keys without exposing them in your app's source code.

See example configuration for secrets plugin at example applications [build.gradle](./example/android/app/build.gradle) file.

### iOS

To set up, specify your API key in the application delegate `ios/Runner/AppDelegate.m`:

```objective-c
@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [GMSServices provideAPIKey:@"API_KEY"];
  [GMSServices setMetalRendererEnabled:YES];
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

```

## Usage

### Add a navigation view

You can now add a `NavigationView` component to your application..

The view can be controlled with the `ViewController` (Navigation and MapView) that are retrieved from the `onMapViewControllerCreated` and `onNavigationViewControllerCreated` (respectively).

The `NavigationView` compoonent should be used within a View with a bounded size. Using it
in an unbounded widget will cause the application to behave unexpectedly.

```tsx
    // Permissions must have been granted by this point.

    <NavigationView
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

### Add a map view

You can also add a bare `MapView` that works as a normal map view without navigation functionality. `MapView` only need a `MapViewController` to be controlled.

```tsx
<MapView
    mapViewCallbacks={mapViewCallbacks}
    onMapViewControllerCreated={setMapViewController}
/>
```

See the [example](./example) directory for a complete navigation sample app.

### Requesting and handling permissions

The Google Navigation SDK React Native library offers functionalities that necessitate specific permissions from the mobile operating system. These include, but are not limited to, location services, background execution, and receiving background location updates.

> [!NOTE]
> The management of these permissions falls outside the scope of the Navigation SDKs for Android and iOS. As a developer integrating these SDKs into your applications, you are responsible for requesting and obtaining the necessary permissions from the users of your app.

You can see example of handling permissions in the [app.tsx](./example/src/app.tsx) file of the sample application:

```tsx
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';

// ...

// Request permission for accessing the device's location.
const requestPermissions = async () => {
    const result = await request(
        Platform.OS === "android" ?
            PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION :
            PERMISSIONS.IOS.LOCATION_ALWAYS,
    );

    if (result === RESULTS.GRANTED) {
        setArePermissionsApproved(true);
    } else {
        Snackbar.show({
            text: 'Permissions are needed to proceed with the app. Please re-open and accept.',
            duration: Snackbar.LENGTH_SHORT,
        });
    }
};
```

### Changing the NavigationView size
By default, `NavigationView` uses all the available space provided to it. To adjust the size of the NavigationView, use the `style` prop.

```tsx
    <NavigationView
        style={{width: 200, height: 50%}}
        ...
    />
```

## Support for Android Auto and Apple CarPlay
This plugin is compatible with both Android Auto and Apple CarPlay infotainment systems. For more details, please refer to the respective platform documentation:

- [Android Auto documentation](./ANDROIDAUTO.md)
- [CarPlay documentation](./CARPLAY.md)

## Contributing

See the [Contributing guide](./CONTRIBUTING.md).

## Terms of Service

This library uses Google Maps Platform services. Use of Google Maps Platform services through this library is subject to the [Google Maps Platform Terms of Service](https://cloud.google.com/maps-platform/terms).

This library is not a Google Maps Platform Core Service. Therefore, the Google Maps Platform Terms of Service (e.g. Technical Support Services, Service Level Agreements, and Deprecation Policy) do not apply to the code in this library.

## Support

This package is offered via an open source license. It is not governed by the Google Maps Platform Support [Technical Support Services Guidelines](https://cloud.google.com/maps-platform/terms/tssg), the [SLA](https://cloud.google.com/maps-platform/terms/sla), or the [Deprecation Policy](https://cloud.google.com/maps-platform/terms) (however, any Google Maps Platform services used by the library remain subject to the Google Maps Platform Terms of Service).

This package adheres to [semantic versioning](https://semver.org/) to indicate when backwards-incompatible changes are introduced. Accordingly, while the library is in version 0.x, backwards-incompatible changes may be introduced at any time.

If you find a bug, or have a feature request, please [file an issue](https://github.com/googlemaps/react-native-navigation-sdk/issues) on GitHub. If you would like to get answers to technical questions from other Google Maps Platform developers, ask through one of our [developer community channels](https://developers.google.com/maps/developer-community). If you'd like to contribute, please check the [Contributing guide](https://github.com/googlemaps/react-native-navigation-sdk/blob/main/CONTRIBUTING.md).


