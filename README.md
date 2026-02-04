# Google Navigation for React Native (Beta)

**European Economic Area (EEA) developers**

If your billing address is in the European Economic Area, effective on 8 July 2025, the [Google Maps Platform EEA Terms of Service](https://cloud.google.com/terms/maps-platform/eea) will apply to your use of the Services. Functionality varies by region. [Learn more](https://developers.google.com/maps/comms/eea/faq).

## Description

This repository contains a React Native plugin that provides a [Google Navigation](https://developers.google.com/maps/documentation/navigation) component for building native Android and iOS apps using React.

> [!NOTE]
> This package is in Beta until it reaches version 1.0. According to [semantic versioning](https://semver.org/#spec-item-4), breaking changes may be introduced before 1.0.

## Requirements

|                                 | Android | iOS       |
| ------------------------------- | ------- | --------- |
| **Minimum mobile OS supported** | SDK 24+ | iOS 16.0+ |

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

## React Native Compatibility

The current version of this package has been tested and verified to work with the following React Native versions: 

**0.83.1, 0.82.1, 0.81.5, 0.80.3, 0.79.6**

> [!IMPORTANT]
> This package requires React Native 0.79+ with the new architecture (Fabric & TurboModules) enabled. Make sure the new architecture is enabled in your project configuration as shown in the [Installation](#installation) section.

> [!NOTE]
> React Native 0.78.x and below are not supported due to Kotlin version incompatibility. If you need to use older React Native versions, please use version 0.13.x of this package with the old architecture.

> [!NOTE]
> For users upgrading from versions prior to 0.14.0, please refer to the [Migration Guide](./MIGRATING.md) for instructions on migrating to the new architecture and updated API.

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

#### Enable new architecture

This package requires React Native's new architecture. Make sure new architecture is enabled in your `android/gradle.properties` file:

```groovy
newArchEnabled=true
```

#### Enable Jetifier

To ensure compatibility with AndroidX, enable Jetifier in your `android/gradle.properties` file:

```groovy
# Automatically convert third-party libraries to use AndroidX
android.enableJetifier=true
```

#### Enable Core Library Desugaring

Core library desugaring **must be enabled** for your Android project, regardless of your minSdkVersion.

To enable desugaring, update your `android/app/build.gradle` file:

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

#### Minimum SDK Requirements for Android

The `minSdkVersion` for your Android project must be set to 24 or higher in `android/app/build.gradle`:

```groovy
android {
    defaultConfig {
        minSdkVersion 24
    }
}
```

#### Set Google Maps API Key

To securely store your API key, it is recommended to use the [Google Maps Secrets Gradle Plugin](https://developers.google.com/maps/documentation/android-sdk/secrets-gradle-plugin). This plugin helps manage API keys without exposing them in your app's source code.

See example configuration for secrets plugin at example applications [build.gradle](./example/android/app/build.gradle) file.

### iOS

#### Enable new architecture

This package requires React Native's new architecture. Make sure new architecture is enabled in your `ios/Podfile`:

```ruby
ENV['RCT_NEW_ARCH_ENABLED'] = '1'
```

#### Set Google Maps API Key

To set up, specify your API key in the application delegate `ios/Runner/AppDelegate.m`:

```objective-c
#import <GoogleMaps/GoogleMaps.h>

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
} from '@googlemaps/react-native-navigation-sdk';

const App = () => {
  return (
    <NavigationProvider
      termsAndConditionsDialogOptions={{
        title: 'Terms and Conditions',
        companyName: 'Your Company Name',
        showOnlyDisclaimer: false,
        uiParams: { // Optional UI customization
          backgroundColor: '#FFFFFF',
          titleColor: 'rgba(0,0,0,1)',
        },
      }}
      taskRemovedBehavior={TaskRemovedBehavior.CONTINUE_SERVICE}
    >
      {/* Add your application components here */}
    </NavigationProvider>
  );
};

export default App;
```

#### Terms and Conditions Dialog Options

The `termsAndConditionsDialogOptions` prop configures the Terms and Conditions dialog that must be shown before navigation can be used:

| Property             | Type                         | Description                                                                    |
| -------------------- | ---------------------------- | ------------------------------------------------------------------------------ |
| `title`              | `string`                     | The title of the Terms and Conditions dialog                                   |
| `companyName`        | `string`                     | Your company name displayed in the dialog                                      |
| `showOnlyDisclaimer` | `boolean`                    | If `true`, shows only the driver awareness disclaimer                          |
| `uiParams`           | `TermsAndConditionsUIParams` | Optional UI customization (colors in hex format like `#RRGGBB` or `#AARRGGBB`) |

#### Task Removed Behavior

The `taskRemovedBehavior` prop defines how the navigation should behave when a task is removed from the recent apps list on Android. It can either:

- `CONTINUE_SERVICE`: Continue running in the background. (default)
- `QUIT_SERVICE`: Shut down immediately.

This prop has only an effect on Android.

### Using NavigationController

You can use the `useNavigation` hook to access the `NavigationController` and control navigation within your components. The `useNavigation` hook also provides methods to add and remove listeners.

#### Showing Terms and Conditions Dialog

Before initializing navigation, you should show the Terms and Conditions dialog to the user. This is required for using the Navigation SDK. The dialog uses the options configured in `NavigationProvider`.

```tsx
const { navigationController } = useNavigation();

const showTermsDialog = async () => {
  // Uses options from NavigationProvider by default
  const accepted = await navigationController.showTermsAndConditionsDialog();
  return accepted;
};

// You can also override specific options:
const showTermsDialogWithOverride = async () => {
  const accepted = await navigationController.showTermsAndConditionsDialog({
    showOnlyDisclaimer: true, // Override specific options
  });
  return accepted;
};
```

#### Initializing Navigation

```tsx
import {
  useNavigation,
  NavigationSessionStatus,
} from '@googlemaps/react-native-navigation-sdk';

const { navigationController } = useNavigation();

const initializeNavigation = useCallback(async () => {
  // First show Terms and Conditions dialog (uses options from NavigationProvider)
  const termsAccepted = await navigationController.showTermsAndConditionsDialog();

  if (!termsAccepted) {
    console.log('User declined terms');
    return;
  }

  // Initialize the navigation session and check the status
  const status = await navigationController.init();
  
  switch (status) {
    case NavigationSessionStatus.OK:
      console.log('Navigation initialized successfully');
      break;
    case NavigationSessionStatus.NOT_AUTHORIZED:
      console.error('API key not authorized');
      break;
    case NavigationSessionStatus.TERMS_NOT_ACCEPTED:
      console.error('Terms not accepted');
      break;
    case NavigationSessionStatus.LOCATION_PERMISSION_MISSING:
      console.error('Location permission required');
      break;
    case NavigationSessionStatus.NETWORK_ERROR:
      console.error('Network error');
      break;
    default:
      console.error('Unknown error:', status);
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

  const displayOptions: DisplayOptions = {
    showDestinationMarkers: true,
    showStopSigns: true,
    showTrafficLights: true,
  };

  await navigationController.setDestinations([waypoint], { routingOptions, displayOptions });
  await navigationController.startGuidance();
} catch (error) {
  console.error('Error starting navigation', error);
}

```

> [!NOTE]
> Route calculation is only available after the Navigation SDK has successfully acquired the user's location. If the location is not yet available when trying to set a destination, the SDK will return a RouteStatus.LOCATION_DISABLED status.
>
> To avoid this, ensure that the SDK has provided a valid user location before calling the setDestinations function. You can do this by subscribing to the onLocationChanged navigation callback and waiting for the first valid location update.

#### Using Route Tokens

You can use a pre-computed route from the [Routes API](https://developers.google.com/maps/documentation/routes) by providing a route token. This is useful when you want to ensure the navigation follows a specific route that was calculated server-side.

To use a route token:

1. Pass the token using `routeTokenOptions` instead of `routingOptions`
2. **Important:** The waypoints passed to `setDestinations` must match the waypoints used when generating the route token

```tsx
const waypoint = {
  title: 'Destination',
  position: { lat: 37.7749, lng: -122.4194 },
};

const routeTokenOptions = {
  routeToken: 'your-route-token-from-routes-api',
  travelMode: TravelMode.DRIVING, // Must match the travel mode used to generate the token
};

await navigationController.setDestinations([waypoint], { routeTokenOptions });
await navigationController.startGuidance();
```

> [!IMPORTANT]
> `routingOptions` and `routeTokenOptions` are mutually exclusive. Providing both will throw an error.


#### Adding navigation listeners

```tsx
const { 
  navigationController, 
  removeAllListeners,
  setOnArrival,
  setOnRouteChanged,
  setOnNavigationReady,
} = useNavigation();

useEffect(() => {
  setOnArrival((event: ArrivalEvent) => {
    if (event.isFinalDestination) {
      console.log('Final destination reached');
      navigationController.stopGuidance();
    } else {
      console.log('Continuing to the next destination');
      navigationController.continueToNextDestination();
      navigationController.startGuidance();
    }
  });
  setOnRouteChanged(() => console.log('Route changed'));
  setOnNavigationReady(() => console.log('Navigation ready'));

  // On cleanup, removeAllListeners() clears all at once.
  // Alternatively, clear individual listeners: setOnArrival(null)
  return () => removeAllListeners();
}, [
  navigationController,
  setOnArrival,
  setOnRouteChanged,
  setOnNavigationReady,
  removeAllListeners,
]);
```

See [Navigation Listener Setters](#navigation-listener-setters) for a complete list of available listener setters.

### Add a navigation view

You can now add a `NavigationView` component to your application..

The view can be controlled with the `ViewController` (Navigation and MapView) that are retrieved from the `onMapViewControllerCreated` and `onNavigationViewControllerCreated` (respectively).

The `NavigationView` compoonent should be used within a View with a bounded size. Using it
in an unbounded widget will cause the application to behave unexpectedly.

```tsx
// Permissions must have been granted by this point.

<NavigationView
    mapId="your-map-id-here" // Optional: Your map ID configured in Google Cloud Console
    androidStylingOptions={{
        primaryDayModeThemeColor: '#34eba8',
        headerDistanceValueTextColor: '#76b5c5',
        headerInstructionsFirstRowTextSize: '20f',
    }}
    iOSStylingOptions={{
        navigationHeaderPrimaryBackgroundColor: '#34eba8',
        navigationHeaderDistanceValueTextColor: '#76b5c5',
    }}
    onMapReady={() => console.log('Map is ready')}
    onRecenterButtonClick={() => console.log('Recenter button clicked')}
    onMapViewControllerCreated={setMapViewController}
    onNavigationViewControllerCreated={setNavigationViewController}
/>
```

### Add a map view

You can also add a bare `MapView` that works as a normal map view without navigation functionality. `MapView` only need a `MapViewController` to be controlled.

```tsx
<MapView
    mapId="your-map-id-here" // Optional: Your map ID configured in Google Cloud Console
    onMapReady={() => console.log('Map is ready')}
    onMapClick={(latLng) => console.log('Map clicked at', latLng)}
    onMapViewControllerCreated={setMapViewController}
/>
```

### Control light and dark modes

Use the `mapColorScheme` prop on both `NavigationView` and `MapView` to force the map tiles into light, dark, or system-following mode.

For the navigation UI, pass the `navigationNightMode` prop to `NavigationView` to configure the initial lighting mode for navigation session.

> [!NOTE]
> When navigation UI is enabled, `mapColorScheme` does not affect the view styling. To control the style of the navigation UI, use the `navigationNightMode` prop on `NavigationView` instead.

### Requesting and handling permissions

The Google Navigation SDK React Native library offers functionalities that necessitate specific permissions from the mobile operating system. These include, but are not limited to, location services, background execution, and receiving background location updates.

> [!NOTE]
> The management of these permissions falls outside the scope of the Navigation SDKs for Android and iOS. As a developer integrating these SDKs into your applications, you are responsible for requesting and obtaining the necessary permissions from the users of your app.

You can see example of handling permissions in the [App.tsx](./example/src/App.tsx) file of the sample application:

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

## API Reference

### View Props

Both `NavigationView` and `MapView` support the following props. Props marked with **Nav** are only available on `NavigationView`.

#### Configuration Props

| Prop                            | Type                            | Default         |  Nav  | Description                                                 |
| ------------------------------- | ------------------------------- | --------------- | :---: | ----------------------------------------------------------- |
| `style`                         | `ViewStyle`                     | `{ flex: 1 }`   |       | Style applied to the view container                         |
| `mapId`                         | `string`                        | -               |       | Cloud-based map styling ID from Google Cloud Console        |
| `mapColorScheme`                | `MapColorScheme`                | `FOLLOW_SYSTEM` |       | Color scheme for map tiles (FOLLOW_SYSTEM, LIGHT, DARK)     |
| `mapStyle`                      | `string`                        | -               |       | Custom map styling via JSON                                 |
| `mapPadding`                    | `Padding`                       | -               |       | Padding applied to the map in pixels                        |
| `initialCameraPosition`         | `CameraPosition`                | -               |       | Initial camera position when map loads                      |
| `minZoomLevel`                  | `number`                        | -               |       | Minimum allowed zoom level                                  |
| `maxZoomLevel`                  | `number`                        | -               |       | Maximum allowed zoom level                                  |
| `navigationNightMode`           | `NavigationNightMode`           | `AUTO`          |   ✓   | Night mode for navigation UI (AUTO, FORCE_DAY, FORCE_NIGHT) |
| `navigationUIEnabledPreference` | `NavigationUIEnabledPreference` | `AUTOMATIC`     |   ✓   | Initial navigation UI visibility (AUTOMATIC, DISABLED)      |
| `androidStylingOptions`         | `AndroidStylingOptions`         | -               |   ✓   | Android-specific navigation UI styling                      |
| `iOSStylingOptions`             | `iOSStylingOptions`             | -               |   ✓   | iOS-specific navigation UI styling                          |

#### UI Control Props

| Prop                          | Type      | Default |  Nav  | Description                                           |
| ----------------------------- | --------- | ------- | :---: | ----------------------------------------------------- |
| `compassEnabled`              | `boolean` | `true`  |       | Show compass when map is rotated                      |
| `mapToolbarEnabled`           | `boolean` | `true`  |       | Show map toolbar (Google Maps button)                 |
| `myLocationButtonEnabled`     | `boolean` | `true`  |       | Show the my location button                           |
| `myLocationEnabled`           | `boolean` | `false` |       | Show the my location indicator (requires permissions) |
| `indoorEnabled`               | `boolean` | `true`  |       | Enable indoor maps                                    |
| `trafficEnabled`              | `boolean` | `false` |       | Show traffic data on the map                          |
| `buildingsEnabled`            | `boolean` | `true`  |       | Show 3D buildings                                     |
| `zoomControlsEnabled`         | `boolean` | `false` |       | Show zoom controls (Android only)                     |
| `headerEnabled`               | `boolean` | `true`  |   ✓   | Show navigation header with turn-by-turn instructions |
| `footerEnabled`               | `boolean` | `true`  |   ✓   | Show navigation footer                                |
| `tripProgressBarEnabled`      | `boolean` | `true`  |   ✓   | Show trip progress bar                                |
| `speedometerEnabled`          | `boolean` | `false` |   ✓   | Show speedometer                                      |
| `speedLimitIconEnabled`       | `boolean` | `true`  |   ✓   | Show speed limit icon                                 |
| `recenterButtonEnabled`       | `boolean` | `true`  |   ✓   | Show recenter button                                  |
| `reportIncidentButtonEnabled` | `boolean` | `true`  |   ✓   | Show report incident button                           |
| `trafficPromptsEnabled`       | `boolean` | `true`  |   ✓   | Enable traffic disruption callouts and alerts         |
| `trafficIncidentCardsEnabled` | `boolean` | `true`  |   ✓   | Enable traffic incident detail cards on tap           |

#### Gesture Props

| Prop                                      | Type      | Default | Description                                  |
| ----------------------------------------- | --------- | ------- | -------------------------------------------- |
| `rotateGesturesEnabled`                   | `boolean` | `true`  | Enable rotate gestures                       |
| `scrollGesturesEnabled`                   | `boolean` | `true`  | Enable scroll/pan gestures                   |
| `scrollGesturesDuringRotateOrZoomEnabled` | `boolean` | `true`  | Enable scroll gestures during rotate or zoom |
| `tiltGesturesEnabled`                     | `boolean` | `true`  | Enable tilt gestures                         |
| `zoomGesturesEnabled`                     | `boolean` | `true`  | Enable zoom gestures                         |

#### Callback Props

| Prop                                | Type                                             |  Nav  | Description                                      |
| ----------------------------------- | ------------------------------------------------ | :---: | ------------------------------------------------ |
| `onMapReady`                        | `() => void`                                     |       | Called when the map is ready to use              |
| `onMapClick`                        | `(latLng: LatLng) => void`                       |       | Called when the map is clicked                   |
| `onMarkerClick`                     | `(marker: Marker) => void`                       |       | Called when a marker is clicked                  |
| `onPolylineClick`                   | `(polyline: Polyline) => void`                   |       | Called when a polyline is clicked                |
| `onPolygonClick`                    | `(polygon: Polygon) => void`                     |       | Called when a polygon is clicked                 |
| `onCircleClick`                     | `(circle: Circle) => void`                       |       | Called when a circle is clicked                  |
| `onGroundOverlayClick`              | `(overlay: GroundOverlay) => void`               |       | Called when a ground overlay is clicked          |
| `onMarkerInfoWindowTapped`          | `(marker: Marker) => void`                       |       | Called when a marker info window is tapped       |
| `onMapViewControllerCreated`        | `(controller: MapViewController) => void`        |       | Called with the map controller instance          |
| `onNavigationViewControllerCreated` | `(controller: NavigationViewController) => void` |   ✓   | Called with the navigation controller instance   |
| `onRecenterButtonClick`             | `() => void`                                     |   ✓   | Called when recenter button is clicked           |
| `onPromptVisibilityChanged`         | `(visible: boolean) => void`                     |   ✓   | Called when navigation prompt visibility changes |

### MapViewController Methods

The `MapViewController` is provided via the `onMapViewControllerCreated` callback and allows programmatic control of the map.

| Method                                            | Returns                   | Description                                                                                |
| ------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------ |
| `clearMapView()`                                  | `void`                    | Clear all markers, polylines, polygons, and circles from the map                           |
| `addMarker(options: MarkerOptions)`               | `Promise<Marker>`         | Add or update a marker. If `options.id` matches an existing marker, it is updated          |
| `addPolyline(options: PolylineOptions)`           | `Promise<Polyline>`       | Add or update a polyline. If `options.id` matches an existing polyline, it is updated      |
| `addPolygon(options: PolygonOptions)`             | `Promise<Polygon>`        | Add or update a polygon. If `options.id` matches an existing polygon, it is updated        |
| `addCircle(options: CircleOptions)`               | `Promise<Circle>`         | Add or update a circle. If `options.id` matches an existing circle, it is updated          |
| `addGroundOverlay(options: GroundOverlayOptions)` | `Promise<GroundOverlay>`  | Add or update a ground overlay. If `options.id` matches an existing overlay, it is updated |
| `removeMarker(id: string)`                        | `void`                    | Remove a marker by its ID                                                                  |
| `removePolyline(id: string)`                      | `void`                    | Remove a polyline by its ID                                                                |
| `removePolygon(id: string)`                       | `void`                    | Remove a polygon by its ID                                                                 |
| `removeCircle(id: string)`                        | `void`                    | Remove a circle by its ID                                                                  |
| `removeGroundOverlay(id: string)`                 | `void`                    | Remove a ground overlay by its ID                                                          |
| `moveCamera(position: CameraPosition)`            | `void`                    | Move camera to a new position                                                              |
| `setZoomLevel(level: number)`                     | `void`                    | Set the map zoom level                                                                     |
| `setPadding(padding: Padding)`                    | `void`                    | Set padding on the map                                                                     |
| `getCameraPosition()`                             | `Promise<CameraPosition>` | Get the current camera position                                                            |
| `getMyLocation()`                                 | `Promise<Location>`       | Get the current user location                                                              |
| `getUiSettings()`                                 | `Promise<UISettings>`     | Get the current UI settings state                                                          |
| `isMyLocationEnabled()`                           | `Promise<boolean>`        | Check if my location is enabled                                                            |

### NavigationViewController Methods

The `NavigationViewController` is provided via the `onNavigationViewControllerCreated` callback and allows control of navigation-specific features.

| Method                                                    | Returns         | Description                                                             |
| --------------------------------------------------------- | --------------- | ----------------------------------------------------------------------- |
| `showRouteOverview()`                                     | `void`          | Show an overview of the remaining route                                 |
| `setNavigationUIEnabled(enabled: boolean)`                | `Promise<void>` | Enable or disable the navigation UI                                     |
| `setFollowingPerspective(perspective: CameraPerspective)` | `Promise<void>` | Set camera perspective (TILTED, TOP_DOWN_NORTH_UP, TOP_DOWN_HEADING_UP) |

### NavigationController (useNavigation hook)

The `useNavigation()` hook provides access to the `NavigationController` and listener setters for navigation events.

```tsx
import { useNavigation } from '@googlemaps/react-native-navigation-sdk';

const { 
  navigationController, 
  removeAllListeners,
  setOnArrival,
  setOnRouteChanged,
  // ... other listener setters
} = useNavigation();
```

#### useNavigation Return Values

| Property               | Type                                      | Description                                                                                                                |
| ---------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `navigationController` | `NavigationController`                    | Controller for navigation operations                                                                                       |
| `removeAllListeners`   | `() => void`                              | Remove all registered navigation listeners                                                                                 |
| `setOn[EventName]`     | `(listener \| null \| undefined) => void` | Listener setters for each event (e.g., `setOnArrival`, `setOnRouteChanged`). See [full list](#navigation-listener-setters) |

> [!TIP]
> To remove a specific listener, pass `null` or `undefined` to its setter: `setOnArrival(null)`

#### NavigationController Methods

| Method                                                                        | Returns                            | Description                                                                                |
| ----------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------ |
| `areTermsAccepted()`                                                          | `Promise<boolean>`                 | Check if terms and conditions have been accepted                                           |
| `showTermsAndConditionsDialog(optionsOverride?)`                              | `Promise<boolean>`                 | Show Terms and Conditions dialog (uses NavigationProvider options with optional overrides) |
| `resetTermsAccepted()`                                                        | `Promise<void>`                    | Reset the Terms and Conditions acceptance state                                            |
| `init()`                                                                      | `Promise<NavigationSessionStatus>` | Initialize the navigation session (returns status)                                         |
| `cleanup()`                                                                   | `Promise<void>`                    | Clean up the navigation controller                                                         |
| `getNavSDKVersion()`                                                          | `Promise<string>`                  | Get the Navigation SDK version                                                             |
| `setDestinations(destinations: Waypoint[], routingOptions?, displayOptions?)` | `Promise<RouteStatus>`             | Set navigation destinations                                                                |
| `setDestination(waypoint: Waypoint, routingOptions?, displayOptions?)`        | `Promise<RouteStatus>`             | Set a single navigation destination                                                        |
| `clearDestinations()`                                                         | `Promise<void>`                    | Clear all destinations                                                                     |
| `continueToNextDestination()`                                                 | `Promise<void>`                    | Navigate to the next destination in the list                                               |
| `startGuidance()`                                                             | `Promise<void>`                    | Start turn-by-turn navigation guidance                                                     |
| `stopGuidance()`                                                              | `Promise<void>`                    | Stop navigation guidance                                                                   |
| `getCurrentTimeAndDistance()`                                                 | `Promise<TimeAndDistance \| null>` | Get time and distance to current destination                                               |
| `getCurrentRouteSegment()`                                                    | `Promise<RouteSegment \| null>`    | Get the current route segment                                                              |
| `getRouteSegments()`                                                          | `Promise<RouteSegment[]>`          | Get all route segments                                                                     |
| `getTraveledPath()`                                                           | `Promise<LatLng[]>`                | Get the path traveled so far                                                               |
| `setAudioGuidanceType(type: AudioGuidanceType)`                               | `Promise<void>`                    | Set audio guidance type (SILENT, ALERTS_ONLY, VOICE_ALERTS_AND_GUIDANCE)                   |
| `setSpeedAlertOptions(options: SpeedAlertOptions)`                            | `Promise<void>`                    | Configure speed alert thresholds                                                           |
| `setAbnormalTerminatingReportingEnabled(enabled: boolean)`                    | `void`                             | Enable/disable abnormal termination reporting                                              |
| `startUpdatingLocation()`                                                     | `Promise<void>`                    | Start receiving location updates                                                           |
| `stopUpdatingLocation()`                                                      | `void`                             | Stop receiving location updates                                                            |
| `setBackgroundLocationUpdatesEnabled(enabled: boolean)`                       | `void`                             | Enable/disable background location updates (iOS only)                                      |
| `setTurnByTurnLoggingEnabled(enabled: boolean)`                               | `void`                             | Enable/disable turn-by-turn logging                                                        |
| `simulator`                                                                   | `Simulator`                        | Access the navigation simulator for testing                                                |

#### Simulator Methods

The `Simulator` object is available via `navigationController.simulator` and provides methods for testing navigation without actual GPS movement.

```tsx
const { navigationController } = useNavigation();

// Simulate driving along the current route at 5x speed
navigationController.simulator.simulateLocationsAlongExistingRoute({ speedMultiplier: 5 });

// Or set a specific location
navigationController.simulator.simulateLocation({ lat: 37.7749, lng: -122.4194 });
```

| Method                                                                      | Returns | Description                                             |
| --------------------------------------------------------------------------- | ------- | ------------------------------------------------------- |
| `simulateLocationsAlongExistingRoute(options: { speedMultiplier: number })` | `void`  | Simulate driving along the current route at given speed |
| `simulateLocation(location: LatLng)`                                        | `void`  | Set user location to a specific coordinate              |
| `pauseLocationSimulation()`                                                 | `void`  | Pause the current location simulation                   |
| `resumeLocationSimulation()`                                                | `void`  | Resume a paused location simulation                     |
| `stopLocationSimulation()`                                                  | `void`  | Stop the current location simulation                    |

#### Navigation Listener Setters

Set listeners using the individual setter functions returned by `useNavigation()`. Each setter accepts a callback, or `null`/`undefined` to clear the listener:

```tsx
const { setOnArrival, setOnRouteChanged, removeAllListeners } = useNavigation();

useEffect(() => {
  setOnArrival((event) => {
    console.log('Arrived at', event.waypoint);
    if (event.isFinalDestination) {
      navigationController.stopGuidance();
    }
  });
  setOnRouteChanged(() => console.log('Route changed'));
  
  // Use removeAllListeners() to clear all listeners at once on cleanup
  // Alternatively, clear individual listeners: setOnArrival(null)
  return () => removeAllListeners();
}, [setOnArrival, setOnRouteChanged, removeAllListeners]);

// To remove a single listener:
setOnArrival(null);
```

| Listener Setter                       | Event Data                                            | Description                                     |
| ------------------------------------- | ----------------------------------------------------- | ----------------------------------------------- |
| `setOnStartGuidance`                  | `void`                                                | Called when guidance starts                     |
| `setOnArrival`                        | `{ waypoint: Waypoint, isFinalDestination: boolean }` | Called when arriving at a destination           |
| `setOnLocationChanged`                | `{ location: Location }`                              | Called when location changes (road-snapped)     |
| `setOnRawLocationChanged`             | `{ location: Location }`                              | Called when raw GPS location changes            |
| `setOnNavigationReady`                | `void`                                                | Called when navigation is ready                 |
| `setOnNavigationInitError`            | `{ errorCode: NavigationInitErrorCode }`              | Called when navigation initialization fails     |
| `setOnRouteStatusResult`              | `RouteStatus`                                         | Called with route calculation status            |
| `setOnRouteChanged`                   | `void`                                                | Called when the route changes                   |
| `setOnReroutingRequestedByOffRoute`   | `void`                                                | Called when rerouting is triggered by off-route |
| `setOnTrafficUpdated`                 | `void`                                                | Called when traffic data is updated             |
| `setOnRemainingTimeOrDistanceChanged` | `void`                                                | Called when remaining time or distance changes  |
| `setOnTurnByTurn`                     | `{ navInfo: NavInfo }`                                | Called with turn-by-turn navigation info        |

### MapViewAutoController (useNavigationAuto hook)

For Android Auto and CarPlay support, the `useNavigationAuto()` hook provides a `MapViewAutoController` and auto-specific listener setters:

```tsx
import { useNavigationAuto } from '@googlemaps/react-native-navigation-sdk';

const { 
  mapViewAutoController, 
  removeAllListeners,
  setOnAutoScreenAvailabilityChanged,
  setOnCustomNavigationAutoEvent,
} = useNavigationAuto();
```

#### useNavigationAuto Return Values

| Property                             | Type                                                                          | Description                                 |
| ------------------------------------ | ----------------------------------------------------------------------------- | ------------------------------------------- |
| `mapViewAutoController`              | `MapViewAutoController`                                                       | Controller for auto screen map operations   |
| `removeAllListeners`                 | `() => void`                                                                  | Remove all registered auto listeners        |
| `setOnAutoScreenAvailabilityChanged` | `(listener: ((available: boolean) => void) \| null \| undefined) => void`     | Set/clear auto screen availability listener |
| `setOnCustomNavigationAutoEvent`     | `(listener: ((event: CustomAutoEvent) => void) \| null \| undefined) => void` | Set/clear custom auto event listener        |

The `MapViewAutoController` extends `MapViewController` with additional methods:

| Method                          | Returns            | Description                                              |
| ------------------------------- | ------------------ | -------------------------------------------------------- |
| *All MapViewController methods* | -                  | All map control methods from MapViewController           |
| `cleanup()`                     | `void`             | Clean up the auto screen resources                       |
| `isAutoScreenAvailable()`       | `Promise<boolean>` | Check if auto screen (Android Auto/CarPlay) is available |

See [Android Auto](./ANDROIDAUTO.md) and [CarPlay](./CARPLAY.md) documentation for platform-specific setup.

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
