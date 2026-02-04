# Migration Guide

This document covers breaking changes and migration steps between major versions of `@googlemaps/react-native-navigation-sdk`.

## Table of Contents

- [Migrating from 0.13.x to 0.14.x](#migrating-from-013x-to-014x)

---

## Migrating from 0.13.x to 0.14.x

Version 0.14.0 introduces React Native's **New Architecture** (Fabric & TurboModules) as a requirement, dropping support for the legacy architecture. This release also includes breaking API changes and new features.

### Summary of Breaking Changes

| Category        | Change                                                                                              |
| --------------- | --------------------------------------------------------------------------------------------------- |
| Architecture    | New Architecture required (React Native 0.79+)                                                      |
| Native SDKs     | Android Navigation SDK 7.3.0, iOS Navigation SDK 10.7.0                                             |
| Navigation Init | Terms and Conditions dialog and session initialization are now separate methods                     |
| Navigation Init | `init()` now returns `NavigationSessionStatus` instead of throwing errors                           |
| Navigation Init | `onNavigationInitError` event removed; check `NavigationSessionStatus` return value instead         |
| Provider Props  | `termsAndConditionsDialogOptions` is now required on `NavigationProvider`                           |
| Event Listeners | Callback objects replaced with individual setter functions                                          |
| Route Status    | `onRouteStatusResult` callback is removed; use `await setDestination()` / `await setDestinations()` |
| View Props      | UI settings moved from controller methods to declarative view props                                 |
| View Callbacks  | `mapViewCallbacks` and `navigationViewCallbacks` props replaced with individual callback props      |
| Type Rename     | `Polygon.isGeodesic` renamed to `Polygon.geodesic` to match native SDKs                             |
| Color API       | All color properties now support React Native's `ColorValue` type for better color handling         |

### New Features

| Feature            | Description                                                                           |
| ------------------ | ------------------------------------------------------------------------------------- |
| Map Object Updates | `add*` methods now update existing objects when the same ID is passed (add or update) |
| Custom Object IDs  | Optionally provide your own IDs for map objects for easier state management           |
| ColorValue Support | All color properties accept `ColorValue` (strings, numbers, platform colors, etc.)    |

### Prerequisites

- **React Native 0.79 or higher** is required
- **New Architecture must be enabled** in your project

### Step 1: Enable New Architecture

#### Android

Update `android/gradle.properties`:

```diff
- newArchEnabled=false
+ newArchEnabled=true
```

#### iOS

Update `ios/Podfile`:

```diff
- ENV['RCT_NEW_ARCH_ENABLED'] = '0'
+ ENV['RCT_NEW_ARCH_ENABLED'] = '1'
```

Then reinstall pods:

```bash
cd ios && pod install
```

### Step 2: Update Navigation Initialization

The navigation initialization flow has been completely redesigned. Terms and Conditions dialog handling is now separate from session initialization, and the `init()` method now returns a status instead of throwing errors.

#### Key Changes

1. **`termsAndConditionsDialogOptions` is now required on `NavigationProvider`** - Configure your ToS dialog options at the provider level
2. **Separate methods for ToS and session initialization**:
   - `areTermsAccepted()` - Check if user has already accepted ToS
   - `showTermsAndConditionsDialog()` - Show ToS dialog (uses provider options, with optional override)
   - `init()` - Initialize navigation session (returns status, no longer throws)
   - `resetTermsAccepted()` - Reset ToS acceptance state
3. **`init()` returns `NavigationSessionStatus`** - Similar to how `setDestination()` returns `RouteStatus`
4. **`onNavigationReady` event is still available** but initialization success is determined by the return value
5. **`onNavigationInitError` event is removed** - Errors are returned as status values

#### Before (0.13.x)

```tsx
// App.tsx - Provider without ToS options
<NavigationProvider
  taskRemovedBehavior={TaskRemovedBehavior.CONTINUE_SERVICE}
>
  {children}
</NavigationProvider>

// Component - Initialization with try-catch
import { useNavigation } from '@googlemaps/react-native-navigation-sdk';

const { navigationController, setOnNavigationReady, setOnNavigationInitError } = useNavigation();

useEffect(() => {
  setOnNavigationReady(() => console.log('Navigation ready'));
  setOnNavigationInitError((errorCode) => console.error('Init error:', errorCode));
}, []);

const initNavigation = async () => {
  try {
    await navigationController.init({
      termsAndConditionsDialogTitle: 'Terms',
      termsAndConditionsDialogCompanyName: 'My Company',
      showOnlyDisclaimer: false,
    });
    // Success handled via onNavigationReady event
  } catch (error) {
    // Error handled via onNavigationInitError event
    console.error('Init failed', error);
  }
};
```

#### After (0.14.x)

```tsx
// App.tsx - Provider with ToS options (required)
import {
  NavigationProvider,
  TaskRemovedBehavior,
} from '@googlemaps/react-native-navigation-sdk';

<NavigationProvider
  termsAndConditionsDialogOptions={{
    title: 'Terms',
    companyName: 'My Company',
    showOnlyDisclaimer: false,
    // Optional UI customization (colors in hex format)
    uiParams: {
      backgroundColor: '#FFFFFF',
      titleColor: '#000000',
    },
  }}
  taskRemovedBehavior={TaskRemovedBehavior.CONTINUE_SERVICE}
>
  {children}
</NavigationProvider>

// Component - Initialization with status return
import { 
  useNavigation, 
  NavigationSessionStatus 
} from '@googlemaps/react-native-navigation-sdk';

const { navigationController, setOnNavigationReady } = useNavigation();

useEffect(() => {
  // onNavigationReady is still called on successful init
  setOnNavigationReady(() => console.log('Navigation ready'));
}, []);

const initNavigation = async () => {
  // Step 1: Show Terms and Conditions dialog
  const termsAccepted = await navigationController.showTermsAndConditionsDialog();
  
  if (!termsAccepted) {
    console.log('User declined terms');
    return;
  }

  // Step 2: Initialize navigation session
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
};
```

#### NavigationSessionStatus Values

| Status                        | Description                                 |
| ----------------------------- | ------------------------------------------- |
| `OK`                          | Navigation session initialized successfully |
| `NOT_AUTHORIZED`              | API key is invalid or not authorized        |
| `TERMS_NOT_ACCEPTED`          | User has not accepted navigation terms      |
| `NETWORK_ERROR`               | Network connectivity issue                  |
| `LOCATION_PERMISSION_MISSING` | Location permission not granted             |
| `UNKNOWN_ERROR`               | Unknown error occurred                      |

#### Optional: Override ToS Dialog Options

You can override specific options when calling `showTermsAndConditionsDialog()`:

```tsx
// Use all provider options
const accepted = await navigationController.showTermsAndConditionsDialog();

// Override specific options
const accepted = await navigationController.showTermsAndConditionsDialog({
  showOnlyDisclaimer: true, // Override just this option
});
```

#### Optional: Check Terms Acceptance Status

```tsx
// Check if terms are already accepted
const alreadyAccepted = await navigationController.areTermsAccepted();

if (alreadyAccepted) {
  // Skip showing dialog, go straight to init
  const status = await navigationController.init();
} else {
  // Show dialog first
  const accepted = await navigationController.showTermsAndConditionsDialog();
  if (accepted) {
    const status = await navigationController.init();
  }
}
```

### Step 3: Update Event Listeners

The `addListeners`/`removeListeners` pattern with callback objects has been replaced with individual setter functions.

#### Before (0.13.x)

```tsx
import { useNavigation, type NavigationCallbacks } from '@googlemaps/react-native-navigation-sdk';

const { navigationController, addListeners, removeListeners } = useNavigation();

const navigationCallbacks: NavigationCallbacks = useMemo(() => ({
  onArrival: (event) => {
    if (event.isFinalDestination) {
      navigationController.stopGuidance();
    }
  },
  onRouteChanged: () => console.log('Route changed'),
  onNavigationReady: () => console.log('Navigation ready'),
}), [navigationController]);

useEffect(() => {
  addListeners(navigationCallbacks);
  return () => {
    removeListeners(navigationCallbacks);
  };
}, [navigationCallbacks, addListeners, removeListeners]);
```

#### After (0.14.x)

```tsx
import { useNavigation } from '@googlemaps/react-native-navigation-sdk';

const { 
  navigationController, 
  removeAllListeners,
  setOnArrival,
  setOnRouteChanged,
  setOnNavigationReady,
} = useNavigation();

useEffect(() => {
  setOnArrival((event) => {
    if (event.isFinalDestination) {
      navigationController.stopGuidance();
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

> [!TIP]
> To clear a specific listener without affecting others, pass `null` to its setter: `setOnArrival(null)`. Use `removeAllListeners()` to clear all listeners at once.

#### Available Listener Setters

| Old Callback (NavigationCallbacks) | New Setter                                                                       |
| ---------------------------------- | -------------------------------------------------------------------------------- |
| `onArrival`                        | `setOnArrival`                                                                   |
| `onRouteChanged`                   | `setOnRouteChanged`                                                              |
| `onNavigationReady`                | `setOnNavigationReady`                                                           |
| `onNavigationInitError`            | **Removed** - Check `NavigationSessionStatus` return value from `init()` instead |
| `onLocationChanged`                | `setOnLocationChanged`                                                           |
| `onRawLocationChanged`             | `setOnRawLocationChanged`                                                        |
| `onRouteStatusResult`              | **Removed** - Use `await setDestination()` / `await setDestinations()` instead   |
| `onStartGuidance`                  | `setOnStartGuidance`                                                             |
| `onTrafficUpdated`                 | `setOnTrafficUpdated`                                                            |
| `onRemainingTimeOrDistanceChanged` | `setOnRemainingTimeOrDistanceChanged`                                            |
| `onTurnByTurn`                     | `setOnTurnByTurn`                                                                |
| `onReroutingRequestedByOffRoute`   | `setOnReroutingRequestedByOffRoute`                                              |

#### Handling Route Status

The `onRouteStatusResult` callback is no longer needed. Instead, `setDestination()` and `setDestinations()` now return a `Promise<RouteStatus>` that resolves with the route calculation result.

##### Before (0.13.x)

```tsx
const { navigationController, setOnRouteStatusResult } = useNavigation();

// Set up listener for route status
useEffect(() => {
  setOnRouteStatusResult((routeStatus) => {
    if (routeStatus === RouteStatus.OK) {
      console.log('Route created successfully');
    } else {
      console.log('Route creation failed:', routeStatus);
    }
  });
  return () => setOnRouteStatusResult(null);
}, [setOnRouteStatusResult]);

// Set destination without awaiting the result
const setRoute = () => {
  navigationController.setDestination(waypoint, { routingOptions });
};
```

##### After (0.14.x)

```tsx
import { RouteStatus } from '@googlemaps/react-native-navigation-sdk';

const { navigationController } = useNavigation();

// Await the route status directly from setDestination/setDestinations
const setRoute = async () => {
  const routeStatus = await navigationController.setDestination(waypoint, { routingOptions });
  
  if (routeStatus === RouteStatus.OK) {
    console.log('Route created successfully');
  } else {
    console.log('Route creation failed:', routeStatus);
  }
};
```

> [!TIP]
> The `RouteStatus` enum includes: `OK`, `NO_ROUTE_FOUND`, `NETWORK_ERROR`, `QUOTA_CHECK_FAILED`, `ROUTE_CANCELED`, `LOCATION_DISABLED`, `LOCATION_UNKNOWN`, `WAYPOINT_ERROR`, `DUPLICATE_WAYPOINTS_ERROR`, and `UNKNOWN`.

### Step 4: Update Auto Navigation Listeners

The same pattern applies to `useNavigationAuto`:

#### Before (0.13.x)

```tsx
const { mapViewAutoController, addListeners, removeListeners } = useNavigationAuto();

const autoCallbacks: NavigationAutoCallbacks = useMemo(() => ({
  onAutoScreenAvailabilityChanged: (available) => {
    setMapViewAutoAvailable(available);
  },
  onCustomNavigationAutoEvent: (event) => {
    console.log('Custom event:', event);
  },
}), []);

useEffect(() => {
  addListeners(autoCallbacks);
  return () => removeListeners(autoCallbacks);
}, [autoCallbacks, addListeners, removeListeners]);
```

#### After (0.14.x)

```tsx
const { 
  mapViewAutoController, 
  removeAllListeners,
  setOnAutoScreenAvailabilityChanged,
  setOnCustomNavigationAutoEvent,
} = useNavigationAuto();

useEffect(() => {
  setOnAutoScreenAvailabilityChanged((available) => {
    setMapViewAutoAvailable(available);
  });
  setOnCustomNavigationAutoEvent((event) => {
    console.log('Custom event:', event);
  });

  return () => removeAllListeners();
}, [
  setOnAutoScreenAvailabilityChanged,
  setOnCustomNavigationAutoEvent,
  removeAllListeners,
]);
```

> [!TIP]
> Individual listeners can be cleared by passing `null`: `setOnAutoScreenAvailabilityChanged(null)`

### Step 5: Replace Callback Props with Individual Callbacks

The `mapViewCallbacks` and `navigationViewCallbacks` props have been replaced with individual callback props on the view components.

#### Before (0.13.x)

```tsx
const mapViewCallbacks: MapViewCallbacks = {
  onMapReady: () => console.log('Map ready'),
  onMapClick: (latLng) => console.log('Map clicked', latLng),
  onMarkerClick: (marker) => console.log('Marker clicked', marker),
};

const navigationViewCallbacks: NavigationViewCallbacks = {
  onRecenterButtonClick: () => console.log('Recenter clicked'),
  onPromptVisibilityChanged: (visible) => console.log('Prompt visible:', visible),
};

<NavigationView
  navigationViewCallbacks={navigationViewCallbacks}
  mapViewCallbacks={mapViewCallbacks}
  onMapViewControllerCreated={setMapViewController}
  onNavigationViewControllerCreated={setNavigationViewController}
/>
```

#### After (0.14.x)

```tsx
<NavigationView
  onMapReady={() => console.log('Map ready')}
  onMapClick={(latLng) => console.log('Map clicked', latLng)}
  onMarkerClick={(marker) => console.log('Marker clicked', marker)}
  onRecenterButtonClick={() => console.log('Recenter clicked')}
  onPromptVisibilityChanged={(visible) => console.log('Prompt visible:', visible)}
  onMapViewControllerCreated={setMapViewController}
  onNavigationViewControllerCreated={setNavigationViewController}
/>
```

#### Callback Props Mapping

| Old Property                                        | New Prop                    |
| --------------------------------------------------- | --------------------------- |
| `mapViewCallbacks.onMapReady`                       | `onMapReady`                |
| `mapViewCallbacks.onMapClick`                       | `onMapClick`                |
| `mapViewCallbacks.onMarkerClick`                    | `onMarkerClick`             |
| `mapViewCallbacks.onPolylineClick`                  | `onPolylineClick`           |
| `mapViewCallbacks.onPolygonClick`                   | `onPolygonClick`            |
| `mapViewCallbacks.onCircleClick`                    | `onCircleClick`             |
| `mapViewCallbacks.onGroundOverlayClick`             | `onGroundOverlayClick`      |
| `mapViewCallbacks.onMarkerInfoWindowTapped`         | `onMarkerInfoWindowTapped`  |
| `navigationViewCallbacks.onRecenterButtonClick`     | `onRecenterButtonClick`     |
| `navigationViewCallbacks.onPromptVisibilityChanged` | `onPromptVisibilityChanged` |

### Step 6: Move UI Settings to View Props

Several UI settings that were previously set via controller methods are now declarative props on the view component. This aligns with React's declarative paradigm and enables better state management.

#### Before (0.13.x)

```tsx
// Settings were applied imperatively via controller methods
useEffect(() => {
  navigationViewController?.setSpeedometerEnabled(true);
  navigationViewController?.setSpeedLimitIconEnabled(true);
  navigationViewController?.setHeaderEnabled(true);
  navigationViewController?.setFooterEnabled(true);
  navigationViewController?.setRecenterButtonEnabled(true);
  navigationViewController?.setTrafficIncidentCardsEnabled(true);
  mapViewController?.setMyLocationEnabled(true);
  mapViewController?.setMyLocationButtonEnabled(true);
}, [navigationViewController, mapViewController]);
```

#### After (0.14.x)

```tsx
// Settings are now declarative props
const [speedometerEnabled, setSpeedometerEnabled] = useState(true);
const [myLocationEnabled, setMyLocationEnabled] = useState(true);

<NavigationView
  speedometerEnabled={speedometerEnabled}
  speedLimitIconEnabled={true}
  headerEnabled={true}
  footerEnabled={true}
  recenterButtonEnabled={true}
  trafficIncidentCardsEnabled={true}
  trafficPromptsEnabled={true}
  tripProgressBarEnabled={true}
  myLocationEnabled={myLocationEnabled}
  myLocationButtonEnabled={true}
  onMapViewControllerCreated={setMapViewController}
  onNavigationViewControllerCreated={setNavigationViewController}
/>
```

#### UI Props Now Available on Views

These props are available on both `NavigationView` and `MapView`:

| Prop                      | Type      | Default | Description                  |
| ------------------------- | --------- | ------- | ---------------------------- |
| `myLocationEnabled`       | `boolean` | `false` | Show my location indicator   |
| `myLocationButtonEnabled` | `boolean` | `true`  | Show my location button      |
| `compassEnabled`          | `boolean` | `true`  | Show compass                 |
| `mapToolbarEnabled`       | `boolean` | `true`  | Show map toolbar             |
| `indoorEnabled`           | `boolean` | `true`  | Enable indoor maps           |
| `trafficEnabled`          | `boolean` | `false` | Show traffic data            |
| `buildingsEnabled`        | `boolean` | `true`  | Show 3D buildings            |
| `zoomControlsEnabled`     | `boolean` | `false` | Show zoom controls (Android) |

These props are only available on `NavigationView`:

| Prop                          | Type      | Default | Description                   |
| ----------------------------- | --------- | ------- | ----------------------------- |
| `headerEnabled`               | `boolean` | `true`  | Show navigation header        |
| `footerEnabled`               | `boolean` | `true`  | Show navigation footer        |
| `speedometerEnabled`          | `boolean` | `false` | Show speedometer              |
| `speedLimitIconEnabled`       | `boolean` | `true`  | Show speed limit icon         |
| `tripProgressBarEnabled`      | `boolean` | `true`  | Show trip progress bar        |
| `recenterButtonEnabled`       | `boolean` | `true`  | Show recenter button          |
| `reportIncidentButtonEnabled` | `boolean` | `true`  | Show report incident button   |
| `trafficPromptsEnabled`       | `boolean` | `true`  | Enable traffic prompts        |
| `trafficIncidentCardsEnabled` | `boolean` | `true`  | Enable traffic incident cards |

### Step 7: Update Controller Method Calls

Some methods remain on the controllers but may have slightly different behavior. The following methods are still available on `NavigationViewController`:

```tsx
// These methods are still available on the controller
navigationViewController.setNavigationUIEnabled(true);
navigationViewController.setFollowingPerspective(CameraPerspective.TILTED);
navigationViewController.showRouteOverview();
```

### Step 8: Remove Deprecated Types

The following types have been removed and should no longer be imported:

```tsx
// Remove these imports
import type { 
  MapViewCallbacks,          // ❌ Removed
  NavigationViewCallbacks,   // ❌ Removed
  NavigationCallbacks,       // ❌ Removed  
  NavigationAutoCallbacks,   // ❌ Removed
  NavigationInitError,       // ❌ Removed - use NavigationSessionStatus instead
} from '@googlemaps/react-native-navigation-sdk';

// NavigationInitErrorCode is deprecated - use NavigationSessionStatus instead
import { 
  NavigationInitErrorCode,   // ⚠️ Deprecated
  NavigationSessionStatus,   // ✅ Use this instead
} from '@googlemaps/react-native-navigation-sdk';
```

### Complete Migration Example

Here's a complete before/after example showing the migration:

#### Before (0.13.x)

```tsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  NavigationView,
  useNavigation,
  type MapViewCallbacks,
  type NavigationCallbacks,
  type NavigationViewCallbacks,
} from '@googlemaps/react-native-navigation-sdk';

const NavigationScreen = () => {
  const [mapViewController, setMapViewController] = useState(null);
  const [navViewController, setNavViewController] = useState(null);
  
  const { navigationController, addListeners, removeListeners } = useNavigation();

  const navigationCallbacks: NavigationCallbacks = useMemo(() => ({
    onArrival: (event) => console.log('Arrived', event),
    onRouteChanged: () => console.log('Route changed'),
  }), []);

  const mapViewCallbacks: MapViewCallbacks = useMemo(() => ({
    onMapReady: () => console.log('Map ready'),
    onMapClick: (latLng) => console.log('Clicked', latLng),
  }), []);

  const navigationViewCallbacks: NavigationViewCallbacks = {
    onRecenterButtonClick: () => console.log('Recenter'),
  };

  useEffect(() => {
    addListeners(navigationCallbacks);
    return () => removeListeners(navigationCallbacks);
  }, [navigationCallbacks, addListeners, removeListeners]);

  useEffect(() => {
    navViewController?.setSpeedometerEnabled(true);
    mapViewController?.setMyLocationEnabled(true);
  }, [navViewController, mapViewController]);

  return (
    <NavigationView
      mapViewCallbacks={mapViewCallbacks}
      navigationViewCallbacks={navigationViewCallbacks}
      onMapViewControllerCreated={setMapViewController}
      onNavigationViewControllerCreated={setNavViewController}
    />
  );
};
```

#### After (0.14.x)

```tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  NavigationView,
  useNavigation,
} from '@googlemaps/react-native-navigation-sdk';

const NavigationScreen = () => {
  const [mapViewController, setMapViewController] = useState(null);
  const [navViewController, setNavViewController] = useState(null);
  
  const { 
    navigationController, 
    removeAllListeners,
    setOnArrival,
    setOnRouteChanged,
  } = useNavigation();

  // Set up navigation listeners
  useEffect(() => {
    setOnArrival((event) => console.log('Arrived', event));
    setOnRouteChanged(() => console.log('Route changed'));
    return () => removeAllListeners();
  }, [setOnArrival, setOnRouteChanged, removeAllListeners]);

  // Callbacks are now regular functions passed directly as props
  const onMapReady = useCallback(() => console.log('Map ready'), []);
  const onMapClick = useCallback((latLng) => console.log('Clicked', latLng), []);
  const onRecenterButtonClick = useCallback(() => console.log('Recenter'), []);

  return (
    <NavigationView
      // UI settings are now props
      speedometerEnabled={true}
      myLocationEnabled={true}
      // Callbacks are individual props
      onMapReady={onMapReady}
      onMapClick={onMapClick}
      onRecenterButtonClick={onRecenterButtonClick}
      onMapViewControllerCreated={setMapViewController}
      onNavigationViewControllerCreated={setNavViewController}
    />
  );
};
```

### New Feature: Map Object Updates

Version 0.14.0 introduces the ability to **update map objects in place**. The `add*` methods now work as "add or update" operations - if you pass an ID that already exists on the map, the existing object is updated instead of creating a duplicate.

#### How It Works

Every map object (marker, polyline, polygon, circle, ground overlay) has an `id` property. When you call an `add*` method:

1. **Without an existing ID**: A new object is created with an auto-generated ID
2. **With an existing ID**: The existing object is updated with the new properties

The returned object always includes the `id`, which you can use for subsequent updates.

#### Updating Objects with Auto-Generated IDs

You can update objects even when using auto-generated IDs - just pass the `id` from the previously returned object:

```tsx
// Create a marker (ID is auto-generated)
const marker = await mapViewController.addMarker({
  position: { lat: 37.7749, lng: -122.4194 },
  title: 'Current Location',
});

console.log(marker.id); // Auto-generated ID, e.g., 'abc123'

// Later, update the same marker by passing its ID
const updatedMarker = await mapViewController.addMarker({
  id: marker.id, // Use the ID from the original marker
  position: { lat: 37.7849, lng: -122.4294 },
  title: 'Updated Location',
});

// The marker was updated in place, not duplicated
console.log(updatedMarker.id === marker.id); // true
```

#### Using Custom IDs

You can also provide your own custom IDs for easier state management:

```tsx
// Create a marker with a custom ID
const marker = await mapViewController.addMarker({
  id: 'user-location',
  position: { lat: 37.7749, lng: -122.4194 },
  title: 'Current Location',
});

console.log(marker.id); // 'user-location'

// Update using the same custom ID
const updatedMarker = await mapViewController.addMarker({
  id: 'user-location',
  position: { lat: 37.7849, lng: -122.4294 },
  title: 'Updated Location',
});
```

Custom IDs are useful when you want to:
- **Use meaningful identifiers** that match your application's data model
- **Simplify state management** by using predictable IDs
- **Update objects without storing references** to the returned objects

### Need Help?

If you encounter issues during migration:

1. Check the [example app](./example) for complete working examples
2. Review the [API Reference](./README.md#api-reference) for detailed prop documentation
3. [File an issue](https://github.com/googlemaps/react-native-navigation-sdk/issues) on GitHub
