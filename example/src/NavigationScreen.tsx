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
import { Button, Dimensions, View } from 'react-native';
import Snackbar from 'react-native-snackbar';
import styles from './styles';
import {
  type MapViewController,
  type NavigationViewController,
  type Marker,
  type NavigationViewCallbacks,
  type MapViewCallbacks,
  type Polygon,
  type Circle,
  type Polyline,
  type LatLng,
  type NavigationCallbacks,
  useNavigation,
  NavigationInitErrorCode,
  RouteStatus,
  type ArrivalEvent,
  type Location,
} from 'react-native-navigation-sdk';
import usePermissions from './checkPermissions';
import MapsControls from './mapsControls';
import NavigationControls from './navigationControls';
import OverlayModal from './overlayModal';
import { NavigationView } from '../../src/navigation/navigationView/navigationView';

// Utility function for showing Snackbar
const showSnackbar = (text: string, duration = Snackbar.LENGTH_SHORT) => {
  Snackbar.show({ text, duration });
};

enum OverlayType {
  None = 'None',
  NavControls = 'NavControls',
  MapControls = 'MapControls',
}

const NavigationScreen = () => {
  const { arePermissionsApproved } = usePermissions();
  const [overlayType, setOverlayType] = useState<OverlayType>(OverlayType.None);
  const [mapViewController, setMapViewController] =
    useState<MapViewController | null>(null);
  const [navigationViewController, setNavigationViewController] =
    useState<NavigationViewController | null>(null);

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

  const onNavigationReady = useCallback(() => {
    console.log('onNavigationReady');
  }, []);

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
    console.log('onLocationChanged:', location);
  }, []);

  const onRawLocationChanged = useCallback((location: Location) => {
    console.log('onRawLocationChanged:', location);
  }, []);

  const onTurnByTurn = useCallback((turnByTurn: any) => {
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
      onTurnByTurn,
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
      onTurnByTurn,
    ]
  );

  useEffect(() => {
    removeListeners(navigationCallbacks);
    addListeners(navigationCallbacks);
    return () => {
      removeListeners(navigationCallbacks);
    };
  }, [navigationCallbacks, addListeners, removeListeners]);

  const onMapReady = useCallback(async () => {
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
  }, [setOverlayType]);

  const onShowMapsControlsClick = useCallback(() => {
    setOverlayType(OverlayType.MapControls);
  }, [setOverlayType]);

  const navViewWidth = useMemo(() => Dimensions.get('window').width, []);
  const navViewHeight = useMemo(
    () =>
      Dimensions.get('window').height -
      0.05 * Dimensions.get('window').height -
      100,
    []
  );

  const navigationViewCallbacks: NavigationViewCallbacks = {
    onRecenterButtonClick,
  };

  const mapViewCallbacks: MapViewCallbacks = useMemo(() => {
    return {
      onMapReady,
      onMarkerClick: (marker: Marker) => {
        console.log('onMarkerClick:', marker);
        mapViewController?.removeMarker(marker.id);
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

  const closeOverlay = (): void => {
    setOverlayType(OverlayType.None);
  };

  return arePermissionsApproved ? (
    <View style={[styles.container]}>
      <View style={[styles.map_container]}>
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
        />
      </View>

      {navigationViewController != null && navigationController != null && (
        <OverlayModal
          visible={overlayType === OverlayType.NavControls}
          closeOverlay={closeOverlay}
        >
          <NavigationControls
            navigationController={navigationController}
            navigationViewController={navigationViewController}
            getCameraPosition={mapViewController?.getCameraPosition}
          />
        </OverlayModal>
      )}

      {mapViewController != null && (
        <OverlayModal
          visible={overlayType === OverlayType.MapControls}
          closeOverlay={closeOverlay}
        >
          <MapsControls mapViewController={mapViewController} />
        </OverlayModal>
      )}

      <View style={styles.controlButton}>
        <Button title="Navigation" onPress={onShowNavControlsClick} />
        <View style={{ margin: 10 }} />
        <Button title="Maps" onPress={onShowMapsControlsClick} />
      </View>
    </View>
  ) : (
    <React.Fragment />
  );
};

export default NavigationScreen;
