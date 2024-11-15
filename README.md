# Google Navigation for React Native (Beta)

## Description

This repository contains a React Native plugin that provides a [Google Navigation](https://developers.google.com/maps/documentation/navigation) component for building native Android and iOS apps using React.

> [!NOTE]
> This package is in Beta until it reaches version 1.0. According to [semantic versioning](https://semver.org/#spec-item-4), breaking changes may be introduced before 1.0.

## Requirements

|                                 | Android | iOS       |
| ------------------------------- | ------- | --------- |
| **Minimum mobile OS supported** | SDK 23+ | iOS 15.0+ |

* A React Native project
* A Google Cloud project
  *  If you are a Mobility Services developer, you must contact Sales as described in [Mobility services documentation](https://developers.google.com/maps/documentation/transportation-logistics/mobility).
  *  If you are not a Mobility Services developer, refer to [Setup Google Cloud Project](https://developers.google.com/maps/documentation/navigation/android-sdk/cloud-setup) for instructions.
* An [API key](https://console.cloud.google.com/google/maps-apis/credentials) from the project above
  * The API key must be configured for both Android and iOS. Refer to [Android Using Api Keys](https://developers.google.com/maps/documentation/navigation/android-sdk/get-api-key) and [iOS Using Api Keys](https://developers.google.com/maps/documentation/navigation/ios-sdk/get-api-key) respectively for instructions.
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

#### Disable new architecture

This package does not yet support new architecture. Make sure new architecture is disabled in your `android/gradle.properties` file:

```groovy
newArchEnabled=false
```

#### Enable Jetifier

To ensure compatibility with AndroidX, enable Jetifier in your `android/gradle.properties` file:

```groovy
# Automatically convert third-party libraries to use AndroidX
android.enableJetifier=true
```

#### Minimum SDK Requirements for Android

The `minSdkVersion` for your Android project must be set to 23 or higher in `android/app/build.gradle`:

```groovy
android {
    defaultConfig {
        minSdkVersion 23
    }
}
```

If `minSdkVersion` is set to less than 34 (API 34), you need to configure desugaring for your Android app.
To enable desugaring, add the following configurations to `android/app/build.gradle` file:
```groovy
android {
    ...
    compileOptions {
        coreLibraryDesugaringEnabled true
        ...
    }
}

dependencies {
    coreLibraryDesugaring 'com.android.tools:desugar_jdk_libs_nio:2.0.4'
}
```

You may also need to upgrade to Gradle 8.4 and the Android Gradle plugin version 8.3.0

#### Set Google Maps API Key

To securely store your API key, it is recommended to use the [Google Maps Secrets Gradle Plugin](https://developers.google.com/maps/documentation/android-sdk/secrets-gradle-plugin). This plugin helps manage API keys without exposing them in your app's source code.

See example configuration for secrets plugin at example applications [build.gradle](./example/android/app/build.gradle) file.

### iOS

#### Disable new architecture

This package does not yet support new architecture. Make sure new architecture is disabled in your `ios/Podfile`:

```ruby
ENV['RCT_NEW_ARCH_ENABLED'] = '0'
```

#### Set Google Maps API Key

To set up, specify your API key in the application delegate `ios/Runner/AppDelegate.m`:

```objective-c
@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [GMSServices provideAPIKey:@"API_KEY"];
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

```

## Usage

### Initializing Navigation
Wrap application with the `NavigationProvider` component. This will provide the necessary context for navigation throughout your app.

```tsx
import React from 'react';
import {
  NavigationProvider,
  TaskRemovedBehavior,
  type TermsAndConditionsDialogOptions,
} from '@googlemaps/react-native-navigation-sdk';

const termsAndConditionsDialogOptions: TermsAndConditionsDialogOptions = {
  title: 'Terms and Conditions Title',
  companyName: 'Your Company Name',
  showOnlyDisclaimer: true,
};

const App = () => {
  return (
    <NavigationProvider
      termsAndConditionsDialogOptions={termsAndConditionsDialogOptions}
      taskRemovedBehavior={TaskRemovedBehavior.CONTINUE_SERVICE}
    >
      {/* Add your application components here */}
    </NavigationProvider>
  );
};

export default App;
```

#### Task Removed Behavior

The `taskRemovedBehavior` prop defines how the navigation should behave when a task is removed from the recent apps list on Android. It can either:

- `CONTINUE_SERVICE`: Continue running in the background. (default)
- `QUIT_SERVICE`: Shut down immediately.

This prop has only an effect on Android.

### Using NavigationController

You can use the `useNavigation` hook to access the `NavigationController` and control navigation within your components. The `useNavigation` hook also provides methods to add and remove listeners.

#### Initializing Navigation

```tsx
...
const { navigationController } = useNavigation();

const initializeNavigation = useCallback(async () => {
  try {
    await navigationController.init();
    console.log('Navigation initialized');
  } catch (error) {
    console.error('Error initializing navigation', error);
  }
}, [navigationController]);
```

> [!NOTE]
> Navigation can be controlled separately from the navigation views allowing navigation to be started and stopped independently.


#### Starting Navigation
To start navigation, set a destination and start guidance:

```tsx
try {
  const waypoint = {
    title: 'Destination',
    position: {
      lat: 37.4220679,
      lng: -122.0859545,
    },
  };

  const routingOptions = {
    travelMode: TravelMode.DRIVING,
    avoidFerries: false,
    avoidTolls: false,
  };

  await navigationController.setDestinations([waypoint], routingOptions);
  await navigationController.startGuidance();
} catch (error) {
  console.error('Error starting navigation', error);
}

```


#### Adding navigation listeners

```tsx
const { navigationController, addListeners, removeListeners } = useNavigation();

const onArrival = useCallback((event: ArrivalEvent) => {
    if (event.isFinalDestination) {
        console.log('Final destination reached');
        navigationController.stopGuidance();
    } else {
        console.log('Continuing to the next destination');
        navigationController.continueToNextDestination();
        navigationController.startGuidance();
    }
}, [navigationController]);

const navigationCallbacks = useMemo(() => ({
    onArrival,
    // Add other callbacks here
}), [onArrival]);

useEffect(() => {
    addListeners(navigationCallbacks);
    return () => {
        removeListeners(navigationCallbacks);
    };
}, [navigationCallbacks, addListeners, removeListeners]);
```

See `NavigationCallbacks` interface for a list of available callbacks. 

When removing listeners, ensure you pass the same object that was used when adding them, as multiple listeners can be registered for the same event.

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

### Sample application

See the [example](./example) directory for a complete navigation sample app.

## Support for Android Auto and Apple CarPlay
This plugin is compatible with both Android Auto and Apple CarPlay infotainment systems. For more details, please refer to the respective platform documentation:

- [Android Auto documentation](./ANDROIDAUTO.md)
- [CarPlay documentation](./CARPLAY.md)

## Known issues

### Compatibility with other libraries

This package uses the Google Maps [Navigation SDK](https://mapsplatform.google.com/maps-products/navigation-sdk/) for Android and iOS, which includes a dependency on the `Google Maps SDK`. If your project includes other React Native libraries with `Google Maps SDK` dependencies, you may encounter build errors due to version conflicts. To avoid this, it's recommended to avoid using multiple packages with Google Maps dependencies.

> [!NOTE]
> This package provides a `MapView` component, which can be used as a classic Google Maps view without navigation. See [Add a map view](#add-a-map-view) for details.

## Contributing

See the [Contributing guide](./CONTRIBUTING.md).

## Terms of Service

This library uses Google Maps Platform services. Use of Google Maps Platform services through this library is subject to the [Google Maps Platform Terms of Service](https://cloud.google.com/maps-platform/terms).

This library is not a Google Maps Platform Core Service. Therefore, the Google Maps Platform Terms of Service (e.g. Technical Support Services, Service Level Agreements, and Deprecation Policy) do not apply to the code in this library.

## Support

This package is offered via an open source license. It is not governed by the Google Maps Platform Support [Technical Support Services Guidelines](https://cloud.google.com/maps-platform/terms/tssg), the [SLA](https://cloud.google.com/maps-platform/terms/sla), or the [Deprecation Policy](https://cloud.google.com/maps-platform/terms) (however, any Google Maps Platform services used by the library remain subject to the Google Maps Platform Terms of Service).

This package adheres to [semantic versioning](https://semver.org/) to indicate when backwards-incompatible changes are introduced. Accordingly, while the library is in version 0.x, backwards-incompatible changes may be introduced at any time.

If you find a bug, or have a feature request, please [file an issue](https://github.com/googlemaps/react-native-navigation-sdk/issues) on GitHub. If you would like to get answers to technical questions from other Google Maps Platform developers, ask through one of our [developer community channels](https://developers.google.com/maps/developer-community). If you'd like to contribute, please check the [Contributing guide](https://github.com/googlemaps/react-native-navigation-sdk/blob/main/CONTRIBUTING.md).


