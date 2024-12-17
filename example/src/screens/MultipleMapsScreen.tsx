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
import { Button, View } from 'react-native';
import Snackbar from 'react-native-snackbar';

import {
  NavigationInitErrorCode,
  NavigationView,
  RouteStatus,
  type ArrivalEvent,
  type Circle,
  type LatLng,
  type Location,
  type MapViewCallbacks,
  type MapViewController,
  type Marker,
  type NavigationCallbacks,
  type NavigationViewCallbacks,
  type NavigationViewController,
  type Polygon,
  type Polyline,
  useNavigation,
  MapView,
} from '@googlemaps/react-native-navigation-sdk';
import MapsControls from '../controls/mapsControls';
import NavigationControls from '../controls/navigationControls';
import OverlayModal from '../helpers/overlayModal';
import styles from '../styles';
import usePermissions from '../checkPermissions';

// Utility function for showing Snackbar
const showSnackbar = (text: string, duration = Snackbar.LENGTH_SHORT) => {
  Snackbar.show({ text, duration });
};

enum OverlayType {
  None = 'None',
  NavControls = 'NavControls',
  MapControls1 = 'MapControls1',
  MapControls2 = 'MapControls2',
}

const MultipleMapsScreen = () => {
  const { arePermissionsApproved } = usePermissions();
  const [overlayType, setOverlayType] = useState<OverlayType>(OverlayType.None);
  const [mapViewController1, setMapViewController1] =
    useState<MapViewController | null>(null);
  const [mapViewController2, setMapViewController2] =
    useState<MapViewController | null>(null);
  const [navigationViewController1, setNavigationViewController1] =
    useState<NavigationViewController | null>(null);
  const [navigationInitialized, setNavigationInitialized] = useState(false);
  const { navigationController, addListeners, removeListeners } =
    useNavigation();

  const onRouteChanged = useCallback(() => {
    showSnackbar('Route Changed');
  }, []);

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

  const onTrafficUpdated = useCallback(() => {
    showSnackbar('Traffic Updated');
  }, []);

  const onNavigationReady = useCallback(async () => {
    if (navigationViewController1 != null) {
      await navigationViewController1.setNavigationUIEnabled(true);
      console.log('onNavigationReady');
      setNavigationInitialized(true);
    }
  }, [navigationViewController1]);

  const onNavigationDispose = useCallback(async () => {
    await navigationViewController1?.setNavigationUIEnabled(false);
    setNavigationInitialized(false);
  }, [navigationViewController1]);

  const onNavigationInitError = useCallback(
    (errorCode: NavigationInitErrorCode) => {
      showSnackbar(`Failed to initialize navigation errorCode: ${errorCode}`);
    },
    []
  );

  const onStartGuidance = useCallback(() => {
    showSnackbar('Start Guidance');
  }, []);

  const onRouteStatusOk = useCallback(() => {
    showSnackbar('Route created');
  }, []);

  const onRouteCancelled = useCallback(() => {
    showSnackbar('Error: Route Cancelled');
  }, []);

  const onNoRouteFound = useCallback(() => {
    showSnackbar('Error: No Route Found');
  }, []);

  const onNetworkError = useCallback(() => {
    showSnackbar('Error: Network Error');
  }, []);

  const onStartingGuidanceError = useCallback(() => {
    showSnackbar('Error: Starting Guidance Error');
  }, []);

  const onLocationDisabled = useCallback(() => {
    showSnackbar('Error: Location Disabled');
  }, []);

  const onLocationUnknown = useCallback(() => {
    showSnackbar('Error: Location Unknown');
  }, []);

  const onLocationChanged = useCallback((location: Location) => {
    console.log('onLocationChanged: ', location);
  }, []);

  const onRawLocationChanged = useCallback((location: Location) => {
    console.log('onRawLocationChanged: ', location);
  }, []);

  const onRemainingTimeOrDistanceChanged = useCallback(async () => {
    const currentTimeAndDistance =
      await navigationController.getCurrentTimeAndDistance();

    console.log('onRemainingTimeOrDistanceChanged', currentTimeAndDistance);
  }, [navigationController]);

  const onRouteStatusResult = useCallback(
    (routeStatus: RouteStatus) => {
      switch (routeStatus) {
        case RouteStatus.OK:
          onRouteStatusOk();
          break;
        case RouteStatus.ROUTE_CANCELED:
          onRouteCancelled();
          break;
        case RouteStatus.NO_ROUTE_FOUND:
          onNoRouteFound();
          break;
        case RouteStatus.NETWORK_ERROR:
          onNetworkError();
          break;
        case RouteStatus.LOCATION_DISABLED:
          onLocationDisabled();
          break;
        case RouteStatus.LOCATION_UNKNOWN:
          onLocationUnknown();
          break;
        default:
          console.log('routeStatus: ' + routeStatus);
          onStartingGuidanceError();
      }
    },
    [
      onRouteStatusOk,
      onRouteCancelled,
      onNoRouteFound,
      onNetworkError,
      onLocationDisabled,
      onLocationUnknown,
      onStartingGuidanceError,
    ]
  );

  const navigationCallbacks: NavigationCallbacks = useMemo(
    () => ({
      onRouteChanged,
      onArrival,
      onNavigationReady,
      onNavigationInitError,
      onLocationChanged,
      onRawLocationChanged,
      onTrafficUpdated,
      onRouteStatusResult,
      onStartGuidance,
      onRemainingTimeOrDistanceChanged,
    }),
    [
      onRouteChanged,
      onArrival,
      onNavigationReady,
      onNavigationInitError,
      onLocationChanged,
      onRawLocationChanged,
      onTrafficUpdated,
      onRouteStatusResult,
      onStartGuidance,
      onRemainingTimeOrDistanceChanged,
    ]
  );

  useEffect(() => {
    addListeners(navigationCallbacks);
    return () => {
      removeListeners(navigationCallbacks);
    };
  }, [navigationCallbacks, addListeners, removeListeners]);

  const onMap1Ready = useCallback(async () => {
    console.log('Map is ready, initializing navigator...');
    try {
      await navigationController.init();
    } catch (error) {
      console.error('Error initializing navigator', error);
      showSnackbar('Error initializing navigator');
    }
  }, [navigationController]);

  const onRecenterButtonClick = useCallback(() => {
    console.log('onRecenterButtonClick');
  }, []);

  const onShowNavControlsClick = useCallback(() => {
    setOverlayType(OverlayType.NavControls);
  }, []);

  const onShowMapsControlsClick1 = useCallback(() => {
    setOverlayType(OverlayType.MapControls1);
  }, []);

  const onShowMapsControlsClick2 = useCallback(() => {
    setOverlayType(OverlayType.MapControls2);
  }, []);

  const navigationViewCallbacks: NavigationViewCallbacks = useMemo(
    () => ({
      onRecenterButtonClick,
    }),
    [onRecenterButtonClick]
  );

  const mapViewCallbacks1: MapViewCallbacks = useMemo(
    () => ({
      onMapReady: onMap1Ready,
      onMarkerClick: (marker: Marker) => {
        console.log('Map 1, onMarkerClick:', marker);
        mapViewController1?.removeMarker(marker.id);
      },
      onPolygonClick: (polygon: Polygon) => {
        console.log('Map 1, onPolygonClick:', polygon);
        mapViewController1?.removePolygon(polygon.id);
      },
      onCircleClick: (circle: Circle) => {
        console.log('Map 1, onCircleClick:', circle);
        mapViewController1?.removeCircle(circle.id);
      },
      onPolylineClick: (polyline: Polyline) => {
        console.log('Map 1, onPolylineClick:', polyline);
        mapViewController1?.removePolyline(polyline.id);
      },
      onMarkerInfoWindowTapped: (marker: Marker) => {
        console.log('Map 1, onMarkerInfoWindowTapped:', marker);
      },
      onMapClick: (latLng: LatLng) => {
        console.log('Map 1, onMapClick:', latLng);
      },
    }),
    [mapViewController1, onMap1Ready]
  );

  const mapViewCallbacks2: MapViewCallbacks = useMemo(
    () => ({
      onMarkerClick: (marker: Marker) => {
        console.log('Map 2, onMarkerClick: ', marker);
        mapViewController2?.removeMarker(marker.id);
      },
      onPolygonClick: (polygon: Polygon) => {
        console.log('Map 2, onPolygonClick: ', polygon);
        mapViewController2?.removePolygon(polygon.id);
      },
      onCircleClick: (circle: Circle) => {
        console.log('Map 2, onCircleClick: ', circle);
        mapViewController2?.removeCircle(circle.id);
      },
      onPolylineClick: (polyline: Polyline) => {
        console.log('Map 2, onPolylineClick: ', polyline);
        mapViewController2?.removePolyline(polyline.id);
      },
      onMarkerInfoWindowTapped: (marker: Marker) => {
        console.log('Map 2, onMarkerInfoWindowTapped: ', marker);
      },
      onMapClick: (latLng: LatLng) => {
        console.log('Map 2, onMapClick: ', latLng);
      },
    }),
    [mapViewController2]
  );

  const closeOverlay = (): void => {
    setOverlayType(OverlayType.None);
  };

  return arePermissionsApproved ? (
    <View style={styles.container}>
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
        mapViewCallbacks={mapViewCallbacks1}
        onMapViewControllerCreated={setMapViewController1}
        onNavigationViewControllerCreated={setNavigationViewController1}
      />

      <MapView
        mapViewCallbacks={mapViewCallbacks2}
        onMapViewControllerCreated={setMapViewController2}
      />

      {navigationViewController1 != null &&
        navigationController != null &&
        navigationInitialized && (
          <OverlayModal
            visible={overlayType === OverlayType.NavControls}
            closeOverlay={closeOverlay}
          >
            <NavigationControls
              navigationController={navigationController}
              navigationViewController={navigationViewController1}
              getCameraPosition={mapViewController1?.getCameraPosition}
              onNavigationDispose={onNavigationDispose}
            />
          </OverlayModal>
        )}

      {mapViewController1 != null && (
        <OverlayModal
          visible={overlayType === OverlayType.MapControls1}
          closeOverlay={closeOverlay}
        >
          <MapsControls mapViewController={mapViewController1} />
        </OverlayModal>
      )}

      {mapViewController2 != null && (
        <OverlayModal
          visible={overlayType === OverlayType.MapControls2}
          closeOverlay={closeOverlay}
        >
          <MapsControls mapViewController={mapViewController2} />
        </OverlayModal>
      )}

      <View style={styles.controlButtons}>
        <Button
          title="Nav (Map 1)"
          onPress={onShowNavControlsClick}
          disabled={!navigationInitialized}
        />
        <Button title="Map 1" onPress={onShowMapsControlsClick1} />
        <Button title="Map 2" onPress={onShowMapsControlsClick2} />
      </View>
    </View>
  ) : (
    <React.Fragment />
  );
};

export default MultipleMapsScreen;
