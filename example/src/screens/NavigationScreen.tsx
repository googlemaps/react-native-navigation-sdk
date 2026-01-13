/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View } from 'react-native';
import { ExampleAppButton } from '../controls/ExampleAppButton';
import Snackbar from 'react-native-snackbar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  NavigationInitErrorCode,
  NavigationView,
  RouteStatus,
  MapColorScheme,
  NavigationNightMode,
  type ArrivalEvent,
  type Circle,
  type LatLng,
  type Location,
  type MapViewCallbacks,
  type MapViewController,
  type Marker,
  type NavigationAutoCallbacks,
  type NavigationCallbacks,
  type NavigationViewCallbacks,
  type NavigationViewController,
  type TurnByTurnEvent,
  type Polygon,
  type Polyline,
  useNavigation,
  useNavigationAuto,
  type CustomNavigationAutoEvent,
} from '@googlemaps/react-native-navigation-sdk';
import MapsControls from '../controls/mapsControls';
import NavigationControls from '../controls/navigationControls';
import OverlayModal from '../helpers/overlayModal';
import { CommonStyles, MapStyles } from '../styles/components';
import { MapStylingOptions } from '../styles/mapStyling';
import usePermissions from '../checkPermissions';

// Utility function for showing Snackbar
const showSnackbar = (text: string, duration = Snackbar.LENGTH_SHORT) => {
  Snackbar.show({ text, duration });
};

enum OverlayType {
  None = 'None',
  NavControls = 'NavControls',
  MapControls = 'MapControls',
  AutoMapControls = 'AutoMapControls',
}

const NavigationScreen = () => {
  const { arePermissionsApproved } = usePermissions();
  const insets = useSafeAreaInsets();
  const [overlayType, setOverlayType] = useState<OverlayType>(OverlayType.None);
  const [mapViewController, setMapViewController] =
    useState<MapViewController | null>(null);
  const [navigationViewController, setNavigationViewController] =
    useState<NavigationViewController | null>(null);
  const [mapColorScheme, setMapColorScheme] = useState<MapColorScheme>(
    MapColorScheme.FOLLOW_SYSTEM
  );
  const [navigationNightMode, setNavigationNightMode] =
    useState<NavigationNightMode>(NavigationNightMode.AUTO);

  const {
    mapViewAutoController,
    addListeners: addAutoListener,
    removeListeners: removeAutoListeners,
  } = useNavigationAuto();
  const [mapViewAutoAvailable, setMapViewAutoAvailable] =
    useState<boolean>(false);

  const { navigationController, addListeners, removeListeners } =
    useNavigation();

  const [navigationInitialized, setNavigationInitialized] = useState(false);

  const onArrival = useCallback(
    (event: ArrivalEvent) => {
      if (event.isFinalDestination) {
        console.log('Final destination reached');
        navigationController.stopGuidance();
      } else {
        console.log('Continuing to the next destination');
        navigationController.continueToNextDestination();
        navigationController.startGuidance();
      }

      showSnackbar('Arrived');
    },
    [navigationController]
  );

  const onNavigationReady = useCallback(() => {
    console.log('onNavigationReady');
    setNavigationInitialized(true);
  }, []);

  const onNavigationDispose = useCallback(async () => {
    await navigationViewController?.setNavigationUIEnabled(false);
    setNavigationInitialized(false);
  }, [navigationViewController]);

  const onNavigationInitError = useCallback(
    (errorCode: NavigationInitErrorCode) => {
      showSnackbar(`Failed to initialize navigation errorCode: ${errorCode}`);
    },
    []
  );

  const onLocationChanged = useCallback((location: Location) => {
    console.log('onLocationChanged:', location);
  }, []);

  const onRawLocationChanged = useCallback((location: Location) => {
    console.log('onRawLocationChanged:', location);
  }, []);

  const onTurnByTurn = useCallback((turnByTurn: TurnByTurnEvent[]) => {
    console.log('onTurnByTurn:', turnByTurn);
  }, []);

  const onRemainingTimeOrDistanceChanged = useCallback(async () => {
    if (navigationController) {
      const currentTimeAndDistance =
        await navigationController.getCurrentTimeAndDistance();
      console.log(currentTimeAndDistance);
    }
    console.log('called onRemainingTimeOrDistanceChanged');
  }, [navigationController]);

  const onPromptVisibilityChanged = (visible: boolean) => {
    console.log('Prompt visibility changed to:', visible);
  };

  const onRouteStatusResult = useCallback((routeStatus: RouteStatus) => {
    switch (routeStatus) {
      case RouteStatus.OK:
        showSnackbar('Route created');
        break;
      case RouteStatus.ROUTE_CANCELED:
        showSnackbar('Error: Route Cancelled');
        break;
      case RouteStatus.NO_ROUTE_FOUND:
        showSnackbar('Error: No Route Found');
        break;
      case RouteStatus.NETWORK_ERROR:
        showSnackbar('Error: Network Error');
        break;
      case RouteStatus.LOCATION_DISABLED:
        showSnackbar('Error: Location Disabled');
        break;
      case RouteStatus.LOCATION_UNKNOWN:
        showSnackbar('Error: Location Unknown');
        break;
      case RouteStatus.DUPLICATE_WAYPOINTS_ERROR:
        showSnackbar('Error: Consecutive duplicate waypoints are not allowed');
        break;
      default:
        console.log('routeStatus: ' + routeStatus);
        showSnackbar('Error: Starting Guidance Error');
    }
  }, []);

  const navigationCallbacks: NavigationCallbacks = useMemo(
    () => ({
      onRouteChanged: () => showSnackbar('Route Changed'),
      onArrival,
      onNavigationReady,
      onNavigationInitError,
      onLocationChanged,
      onRawLocationChanged,
      onTrafficUpdated: () => showSnackbar('Traffic Updated'),
      onRouteStatusResult,
      onStartGuidance: () => showSnackbar('Start Guidance'),
      onRemainingTimeOrDistanceChanged,
      onTurnByTurn,
    }),
    [
      onArrival,
      onNavigationReady,
      onNavigationInitError,
      onLocationChanged,
      onRawLocationChanged,
      onRouteStatusResult,
      onRemainingTimeOrDistanceChanged,
      onTurnByTurn,
    ]
  );

  const navigationAutoCallbacks: NavigationAutoCallbacks = useMemo(
    () => ({
      onCustomNavigationAutoEvent: (event: CustomNavigationAutoEvent) => {
        console.log('onCustomNavigationAutoEvent:', event);
      },
      onAutoScreenAvailabilityChanged: (available: boolean) => {
        console.log('onAutoScreenAvailabilityChanged:', available);
        setMapViewAutoAvailable(available);
      },
    }),
    []
  );

  useEffect(() => {
    (async () => {
      const isAvailable = await mapViewAutoController.isAutoScreenAvailable();
      setMapViewAutoAvailable(isAvailable);
    })();
  }, [mapViewAutoController]);

  useEffect(() => {
    addListeners(navigationCallbacks);
    return () => {
      removeListeners(navigationCallbacks);
    };
  }, [navigationCallbacks, addListeners, removeListeners]);

  useEffect(() => {
    addAutoListener(navigationAutoCallbacks);
    return () => {
      removeAutoListeners(navigationAutoCallbacks);
    };
  }, [navigationAutoCallbacks, addAutoListener, removeAutoListeners]);

  const onMapReady = useCallback(async () => {
    console.log('Map is ready, initializing navigator...');
    try {
      await navigationController.init();
    } catch (error) {
      console.error('Error initializing navigator', error);
      showSnackbar('Error initializing navigator');
    }
  }, [navigationController]);

  const onRecenterButtonClick = () => {
    console.log('onRecenterButtonClick');
  };

  const navigationViewCallbacks: NavigationViewCallbacks = {
    onRecenterButtonClick,
    onPromptVisibilityChanged,
  };

  const mapViewCallbacks: MapViewCallbacks = useMemo(() => {
    return {
      onMapReady,
      onMarkerClick: (marker: Marker) => {
        console.log('onMarkerClick:', marker);
        showSnackbar('Removing marker in 5 seconds');
        setTimeout(() => {
          mapViewController?.removeMarker(marker.id);
        }, 5000);
      },
      onPolygonClick: (polygon: Polygon) => {
        console.log('onPolygonClick:', polygon);
        mapViewController?.removePolygon(polygon.id);
      },
      onCircleClick: (circle: Circle) => {
        console.log('onCircleClick:', circle);
        mapViewController?.removeCircle(circle.id);
      },
      onPolylineClick: (polyline: Polyline) => {
        console.log('onPolylineClick:', polyline);
        mapViewController?.removePolyline(polyline.id);
      },
      onMarkerInfoWindowTapped: (marker: Marker) => {
        console.log('onMarkerInfoWindowTapped:', marker);
      },
      onMapClick: (latLng: LatLng) => {
        console.log('onMapClick:', latLng);
      },
    };
  }, [mapViewController, onMapReady]);

  return arePermissionsApproved ? (
    <View style={[CommonStyles.container, { paddingBottom: insets.bottom }]}>
      <NavigationView
        style={MapStyles.mapView}
        androidStylingOptions={MapStylingOptions.android}
        iOSStylingOptions={MapStylingOptions.iOS}
        mapColorScheme={mapColorScheme}
        navigationNightMode={navigationNightMode}
        navigationViewCallbacks={navigationViewCallbacks}
        mapViewCallbacks={mapViewCallbacks}
        onMapViewControllerCreated={setMapViewController}
        onNavigationViewControllerCreated={setNavigationViewController}
      />

      <View style={CommonStyles.buttonRow}>
        <ExampleAppButton
          title="Navigation"
          onPress={() => setOverlayType(OverlayType.NavControls)}
          disabled={!navigationInitialized}
        />
        <ExampleAppButton
          title="Maps"
          onPress={() => setOverlayType(OverlayType.MapControls)}
        />
        {mapViewAutoAvailable && (
          <ExampleAppButton
            title="Auto"
            onPress={() => setOverlayType(OverlayType.AutoMapControls)}
          />
        )}
      </View>

      {navigationViewController != null &&
        navigationController != null &&
        navigationInitialized && (
          <OverlayModal
            visible={overlayType === OverlayType.NavControls}
            closeOverlay={() => setOverlayType(OverlayType.None)}
          >
            <NavigationControls
              navigationController={navigationController}
              navigationViewController={navigationViewController}
              getCameraPosition={mapViewController?.getCameraPosition}
              onNavigationDispose={onNavigationDispose}
              navigationNightMode={navigationNightMode}
              onNavigationNightModeChange={setNavigationNightMode}
              showMessage={showSnackbar}
            />
          </OverlayModal>
        )}

      {mapViewController != null && (
        <OverlayModal
          visible={overlayType === OverlayType.MapControls}
          closeOverlay={() => setOverlayType(OverlayType.None)}
        >
          <MapsControls
            mapViewController={mapViewController}
            mapColorScheme={mapColorScheme}
            onMapColorSchemeChange={setMapColorScheme}
            showMessage={showSnackbar}
          />
        </OverlayModal>
      )}

      {mapViewAutoAvailable && mapViewAutoController != null && (
        <OverlayModal
          visible={overlayType === OverlayType.AutoMapControls}
          closeOverlay={() => setOverlayType(OverlayType.None)}
        >
          <MapsControls
            mapViewController={mapViewAutoController}
            showMessage={showSnackbar}
          />
        </OverlayModal>
      )}
    </View>
  ) : (
    <React.Fragment />
  );
};

export default NavigationScreen;
