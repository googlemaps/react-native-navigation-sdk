# React Native: NavSDK Library

## Description

This repository contains a library to support cross platform development for the NavSDK using React Native.

## Setup

### Android

1. Run this in your project root directory (Not sample app but the repository root):

   `npm install --save [FILL IN ONCE REPO CREATED]`

2. In your react native project, open the generated android folder in Android Studio. Open app module level build.gradle and add the following line below:

```groovy
    plugins {
        id "com.google.cloud.artifactregistry.gradle-plugin" version "2.1.5"
    }

    repositories {
        maven {
            url "artifactregistry://us-west2-maven.pkg.dev/gmp-artifacts/transportation"
        }
    }
```

3. Open, local.properties and add your API_KEY.

         MAPS_API_KEY=<place your map api key here>

4. Make sure to change the minSdkVersion to 23 from the build.gradle file.

```groovy
    buildToolsVersion = "33.0.0"
    minSdkVersion = 23
    compileSdkVersion = 33
    targetSdkVersion = 33
```

### iOS

1. Run this in your project root directory (Not sample app but the repository root):

   `npm install --save [FILL IN ONCE REPO CREATED]`

2. In your react native project, go to ios folder and open Podfile. Add this code:

   `platform: ios, '14.0'`

3. Open the pods directory in your ios folder and run this:

   `pod install`

4. In your Google cloud console, add the Google API key to the project. Add this newly created API key to the Info.plist file inside ios/name_of_proj.

```xml
    <key>API_KEY</key>
    <string>Your API KEY</string>
```

5. In the same file, add the following keys with your own description:

```xml
    <key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
    <string>Enter any description related to the key</string>
    <key>NSLocationAlwaysUsageDescription</key>
    <string>Enter any description related to the key</string>
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>Enter any description related to the key</string>
```

6. In the same file, add your allowed background permissions in the app:

```xml
    <key>UIBackgroundModes</key>
    <array>
        <string>location</string>
        <string>audio</string>
        <string>remote-notification</string>
        <string>fetch</string>
    </array>
```

7. Import GoogleMaps.h on your AppDelegate file:

   `#import <GoogleMaps/GoogleMaps.h>`

8. Attach your APIKey to GMSServices in didFinishLaunchingWithOptions function on your AppDelegate file:

```objective-c
    NSString *api_key = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"API_KEY"];
    [GMSServices provideAPIKey:api_key];
```

9. (Optional): Opt-in to use the Metal rendering framework. The Maps SDK for iOS lets you opt-in to use the Metal rendering framework from Apple. To try the Metal renderer in your app, apply the code snippet below under didFinishLaunchingWithOptions method.

```objective-c
    [GMSServices setMetalRendererEnabled:YES]
```

## Usage

### Rendering the NavigationView

1. In your react-native component, apply the code snippet below. This is also where the callback function can be applied. See the list of callback function available below.

```tsx
    import NavigationView from 'react-native-navigation-sdk/components/NavigationView';

    <NavigationView
    ref={child => {
        navViewRef = child
    }}
    onArrival={(opt) => console.log('onArrival: ', opt) }
    />
```

2. Initialize the **NavigationView** through **useEffect** or **componentDidMount** and declare the code snippet below. This is where we define the widht and height of the map.

```tsx
    var navViewRef = {};
    
    useEffect(() => {
        const height = Dimensions.get('window').height - 0.05 * Dimensions.get('window').height;
        const width = Dimensions.get('window').width;
    
        navViewRef.init(width,height);
        return () => {
          // component did unmount
        };
    }, []);
```

For example, in a newly built RN project via cli (npm i -g create-react-native-app), in the function App of App.tsx:
Observe how the code snippets above are inserted in the code below.

```tsx
    function App(): JSX.Element {
        var navViewRef = {};
        useEffect(() => {
            console.log('useEffect im in will mount');
            const height = Dimensions.get('window').height - 0.05 * Dimensions.get('window').height;
            const width = Dimensions.get('window').width;
            navViewRef.init(width,height);
            return () => {
                console.log('useEffect im in will umount');
            };
        }, []);
        return (
            <View style={{ flex: 1 }}>
                <NavigationView
                    ref={child => {
                        navViewRef = child;
                    }}
                    onArrival={(opt) => console.log('onArrival: ', opt) }
                />
            </View>
        );
    }
```


### Set destination

You can configure single or multiple routes using the **setDestination/setDestinations** method. To set the destination, you have to instantiate a list of **Waypoint** object. This is where you define the placeId or using LatLng object.

#### Defining a single destination using placeId
```typescript
    const setupDestinations = () => {
        var wp1: Waypoint = {
            placeId: "ChIJY9KXWjPQlzMRss9V4fv76gY",
        };

        navViewRef.setDestination(wp1);
    };
```

#### Defining a single destination using LatLng
```typescript
    const drive = async () => {
        const waypoint: Waypoint {
            position: new LatLng("-33.873006046764516", "151.2061156981911"),
            title: 'Town hall',
            preferSameSideOfRoad: false,
            vehicleStopover: false,
        }; 

        navViewRef.setDestination(waypoint);
    };
```

#### Defining a multiple destination
```typescript
    const drive = async () => {
        const map = [
           { placeId: "ChIJUdIgnCSuEmsRLzoJwyTgSW0" },
           { placeId: "ChIJI5336CKuEmsRHTnEjPxAFus" },
           { placeId: "ChIJU_xO9hOvEmsRERZv-itx524" },
        ];
        navViewRef.setDestinations(map);
    };
```

### Routing options

To apply routing options on routes, you can use the **RoutingOptions** class. You can set the travel mode, routing strategy and other configurations. See the sample code below:

#### For single destination
```typescript
    const drive = () => {
        const waypoint: Waypoint {
            placeId: "ChIJ23lU0MzRlzMRQ4h2DV2JrQU",
            title: 'Town hall',
            preferSameSideOfRoad: false,
            vehicleStopover: false,
        }; 
    
        var routingOptions = new RoutingOptions(parseInt(0));
        routingOptions.avoidFerries = true;
        routingOptions.avoidTolls = true;
        navViewRef.setDestination(waypoint, routingOptions);
    };
```

#### For multiple destination

```typescript
    const drive = () => {
        const map = [
           { placeId: "ChIJUdIgnCSuEmsRLzoJwyTgSW0" },
           { placeId: "ChIJI5336CKuEmsRHTnEjPxAFus" },
           { placeId: "ChIJU_xO9hOvEmsRERZv-itx524" },
        ];
    
        var routingOptions = new RoutingOptions(parseInt(0));
        routingOptions.avoidFerries = true;
        routingOptions.avoidTolls = false;
        navViewRef.setDestinations(map, routingOptions);
    };
```

### Stop navigation

```typescript
    const stopGuidance = () => {
        navViewRef.stopGuidance();
    }
```

### Styling options
Styling options should be applied during the initialization of the map. To apply styling options, you can use the **StylingOptions** class. See the sample code below:

#### Android

```typescript
    let stylingOptions = new StylingOptions();
    stylingOptions.primaryDayModeThemeColor = "#34eba8";
    stylingOptions.headerDistanceValueTextColor = "#76b5c5";
    stylingOptions.headerInstructionsFirstRowTextSize = "20f";
    navViewRef.init(<width>, <height>, stylingOptions);
```

#### iOS
```typescript
    let stylingOptions = new StylingOptions();
    stylingOptions.navigationHeaderPrimaryBackgroundColor = "#34eba8";
    stylingOptions.navigationHeaderSecondaryBackgroundColor = "#76b5c5";
    stylingOptions.navigationHeaderPrimaryBackgroundColorNightMode = "20f";
    navViewRef.init(<width>, <height>, stylingOptions);     
```

### List of sample functions
| Function | Description |
| ------ | ------ |
| `setTurnByTurnLoggingEnabled(boolean)` | enables the turn by turn logging through running the background service in Android. |
| `setMyLocationButtonEnabled(boolean)` | show or hide the location marker. |
| `setNavigationUIEnabled(boolean)` | show/hide navigation ui. |
| `setTripProgressBarEnabled(boolean)` | show/hide trip progress. |
| `setSpeedLimitIcon(boolean)` | show/hide speed limit icon. |
| `logTripInfo()` | logs the trip information from the console. |
| `moveCamera(int)` | move the map using the given latlng. |
| `setCameraPerspective(int)` | sets camera perspective. TILTED = 0, TOP_DOWN_NORTH_UP = 1, TOP_DOWN_HEADING_UP = 2 |
| `clearDestinations()` | clear destinations. |
| `continueToNextDestination()` | Move to the next destination. |
| `setSpeedAlertOptions(double)` | set the SpeedAlert for minor, major and severity. |
| `simulateLocation(double)` | set the logitude and latitude user location. |
| `setZoomLevel(int)` | set the zoom level. |
| `getCurrentRouteSegment()` | async function that returns destination, traffic, and coordinates of current route. |
| `getCurrentTimeAndDistance()` | async function that returns the time and distance from current location to next destination. |
| `getTraveledPath()` | async function that returns the coordinates of the path traveled by the navigator. |

**For Android**
**setNightMode(int)** set nightmode option. AUTO = 0, FORCE_DAY = 1, FORCE_NIGHT = 2.

**For IOS**
**setNightMode(int)** set nightmode option. FORCE_DAY = 0, FORCE_NIGHT = 1.

### List of sample callback:

| Callback functions |
|-|
| `onStartGuidance()` |
| `onArrival(object)` |
| `onRemainingTimeOrDistanceChanged()` |
| `onRouteChanged` |
| `onTrafficUpdated()` |
| `onTurnByTurn(object)` |


## Sample App

Please refer to the [sample app README](/SampleApp/README.md) for more information.

## Contributing

Please refer to our [contributing guide](CONTRIBUTING.md) for more information.

## Terms of Service

This library uses Google Maps Platform services, and any use of Google Maps Platform is subject to the [Terms of Service](https://cloud.google.com/maps-platform/terms).

For clarity, this library, and each underlying component, is not a Google Maps Platform Core Service.

## Support

This library is offered via an open source license. It is not governed by the Google Maps Platform Support [Technical Support Services Guidelines](https://cloud.google.com/maps-platform/terms/tssg), the [SLA](https://cloud.google.com/maps-platform/terms/sla), or the [Deprecation Policy](https://cloud.google.com/maps-platform/terms) (however, any Google Maps Platform services used by the library remain subject to the Google Maps Platform Terms of Service).

This library adheres to [semantic versioning](https://semver.org/) to indicate when backwards-incompatible changes are introduced. Accordingly, while the library is in version 0.x, backwards-incompatible changes may be introduced at any time.

If you find a bug, or have a feature request, please [file an issue]() on GitHub. If you would like to get answers to technical questions from other Google Maps Platform developers, ask through one of our [developer community channels](https://developers.google.com/maps/developer-community). If you'd like to contribute, please check the [Contributing guide]().

You can also discuss this library on our [Discord server](https://discord.gg/hYsWbmk).
   
