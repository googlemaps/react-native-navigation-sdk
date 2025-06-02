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

import React, { useEffect, useState, useCallback } from 'react';
import { Button, View } from 'react-native';
import Snackbar from 'react-native-snackbar';

import {
  NavigationInitializationStatus,
  NavigationView,
  RouteStatus,
  type ArrivalEvent,
  type Location,
  type MapViewController,
  type NavigationViewController,
  useNavigation,
  MapView,
} from '@googlemaps/react-native-navigation-sdk';
import MapsControls from '../controls/mapsControls';
import NavigationControls from '../controls/navigationControls';
import OverlayModal from '../helpers/overlayModal';
import styles from '../styles';
import usePermissions from '../checkPermissions';
import {
  mapNavControlsReducer,
  initialMapNavControlsState,
} from '../controls/mapNavControlsReducer';

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
  const { navigationController } = useNavigation();

  const [overlayType, setOverlayType] = useState<OverlayType>(OverlayType.None);
  const [mapViewController1, setMapViewController1] =
    useState<MapViewController | null>(null);
  const [mapViewController2, setMapViewController2] =
    useState<MapViewController | null>(null);
  const [navigationViewController1, setNavigationViewController1] =
    useState<NavigationViewController | null>(null);
  const [navigationInitialized, setNavigationInitialized] = useState(false);

  const [navState, navDispatch] = React.useReducer(mapNavControlsReducer, {
    ...initialMapNavControlsState,
    navigationUIEnabled: false,
    myLocationEnabled: false,
  });
  const [mapState, mapDispatch] = React.useReducer(mapNavControlsReducer, {
    ...initialMapNavControlsState,
    navigationUIEnabled: false,
    myLocationEnabled: false,
  });

  useEffect(() => {
    // Set listeners for navigation events
    navigationController.setOnArrivalListener(onArrival);
    navigationController.setOnLocationChangedListener(onLocationChanged);
    navigationController.setOnRawLocationChangedListener(onRawLocationChanged);
    navigationController.setOnNavigationReadyListener(onNavigationReady);
    navigationController.setOnRemainingTimeOrDistanceChangedListener(
      onRemainingTimeOrDistanceChanged
    );
    navigationController.setOnRouteChangedListener(onRouteChanged);
    navigationController.setOnStartGuidanceListener(onStartGuidance);
    navigationController.setOnTrafficUpdatedListener(onTrafficUpdated);
    navigationController.setLogDebugInfoListener((message: string) => {
      console.log('LogDebugInfo:', message);
      showSnackbar(message);
    });
    navigationController.setOnReroutingRequestedByOffRouteListener(() => {
      console.log('Rerouting requested by off route');
    });

    // Cleanup function to remove all listeners
    return () => navigationController.removeAllListeners();
  });

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
      navDispatch({ type: 'setNavigationUIEnabled', value: true });
      console.log('onNavigationReady');
      setNavigationInitialized(true);
    }
  }, [navigationViewController1]);

  const onNavigationDispose = useCallback(async () => {
    navDispatch({ type: 'setNavigationUIEnabled', value: false });
    setNavigationInitialized(false);
  }, []);

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
          showSnackbar(`Error: Route Status Error: ${routeStatus}`);
      }
    },
    [
      onRouteStatusOk,
      onRouteCancelled,
      onNoRouteFound,
      onNetworkError,
      onLocationDisabled,
      onLocationUnknown,
    ]
  );

  const onMap1Ready = useCallback(async () => {
    console.log('Map is ready, initializing navigator...');
    try {
      const status = await navigationController.init();
      switch (status) {
        case NavigationInitializationStatus.OK:
          showSnackbar('Navigator initialized');
          break;
        case NavigationInitializationStatus.NOT_AUTHORIZED:
          showSnackbar('Error: Not Authorized');
          break;
        case NavigationInitializationStatus.TERMS_NOT_ACCEPTED:
          showSnackbar('Error: Terms Not Accepted');
          break;
        case NavigationInitializationStatus.NETWORK_ERROR:
          showSnackbar('Error: Network Error');
          break;
        case NavigationInitializationStatus.LOCATION_PERMISSION_MISSING:
          showSnackbar('Error: Location Permission Missing');
          break;
        default:
          showSnackbar('Error: Unknown Error' + status);
      }
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

  const closeOverlay = (): void => {
    setOverlayType(OverlayType.None);
  };

  return arePermissionsApproved ? (
    <View style={[styles.container]}>
      <NavigationView
        key={`NV_${navState.mapId}`}
        mapId={navState.mapId}
        onMapViewControllerCreated={setMapViewController1}
        onNavigationViewControllerCreated={setNavigationViewController1}
        onRecenterButtonClick={onRecenterButtonClick}
        onMapReady={onMap1Ready}
        onMarkerClick={(marker) => {
          console.log('Map 1, onMarkerClick:', marker);
          mapViewController1?.removeMarker(marker.id);
        }}
        onPolygonClick={(polygon) => {
          console.log('Map 1, onPolygonClick:', polygon);
          mapViewController1?.removePolygon(polygon.id);
        }}
        onCircleClick={(circle) => {
          console.log('Map 1, onCircleClick:', circle);
          mapViewController1?.removeCircle(circle.id);
        }}
        onPolylineClick={(polyline) => {
          console.log('Map 1, onPolylineClick:', polyline);
          mapViewController1?.removePolyline(polyline.id);
        }}
        onMarkerInfoWindowTapped={(marker) => {
          console.log('Map 1, onMarkerInfoWindowTapped:', marker);
        }}
        onMapClick={(latLng) => {
          console.log('Map 1, onMapClick:', latLng);
        }}
        navigationUIEnabled={navState.navigationUIEnabled}
        mapType={navState.mapType}
        mapPadding={navState.padding}
        myLocationEnabled={navState.myLocationEnabled}
        tripProgressBarEnabled={navState.tripProgressBarEnabled}
        reportIncidentButtonEnabled={navState.reportIncidentButtonEnabled}
        trafficIncidentsCardEnabled={navState.trafficIncidentsCardEnabled}
        speedLimitIconEnabled={navState.speedLimitIconEnabled}
        speedometerEnabled={navState.speedometerEnabled}
        nightMode={navState.nightMode}
        headerEnabled={navState.headerEnabled}
        footerEnabled={navState.footerEnabled}
        recenterButtonEnabled={navState.recenterButtonEnabled}
        followingPerspective={navState.followingPerspective}
      />
      <MapView
        key={`MV_${mapState.mapId}`}
        mapId={mapState.mapId}
        onMarkerClick={(marker) => {
          console.log('Map 2, onMarkerClick: ', marker);
          mapViewController2?.removeMarker(marker.id);
        }}
        onPolygonClick={(polygon) => {
          console.log('Map 2, onPolygonClick: ', polygon);
          mapViewController2?.removePolygon(polygon.id);
        }}
        onCircleClick={(circle) => {
          console.log('Map 2, onCircleClick: ', circle);
          mapViewController2?.removeCircle(circle.id);
        }}
        onPolylineClick={(polyline) => {
          console.log('Map 2, onPolylineClick: ', polyline);
          mapViewController2?.removePolyline(polyline.id);
        }}
        onMarkerInfoWindowTapped={(marker) => {
          console.log('Map 2, onMarkerInfoWindowTapped: ', marker);
        }}
        onMapClick={(latLng) => {
          console.log('Map 2, onMapClick: ', latLng);
        }}
        onMapViewControllerCreated={setMapViewController2}
        mapPadding={mapState.padding}
        mapType={mapState.mapType}
        myLocationEnabled={mapState.myLocationEnabled}
        nightMode={mapState.nightMode}
        initialCameraPosition={{
          target: {
            lat: 37.7749,
            lng: -122.4194,
          },
          zoom: 10,
          tilt: 0,
        }}
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
              state={navState}
              dispatch={navDispatch}
              onRouteStatusResult={onRouteStatusResult}
            />
          </OverlayModal>
        )}
      {mapViewController1 != null && (
        <OverlayModal
          visible={overlayType === OverlayType.MapControls1}
          closeOverlay={closeOverlay}
        >
          <MapsControls
            mapViewController={mapViewController1}
            state={navState}
            dispatch={navDispatch}
          />
        </OverlayModal>
      )}
      {mapViewController2 != null && (
        <OverlayModal
          visible={overlayType === OverlayType.MapControls2}
          closeOverlay={closeOverlay}
        >
          <MapsControls
            mapViewController={mapViewController2}
            state={mapState}
            dispatch={mapDispatch}
          />
        </OverlayModal>
      )}
      <View style={styles.controlButtons}>
        <Button
          title="Nav (Map 1)"
          onPress={onShowNavControlsClick}
          disabled={!navigationInitialized || !navigationViewController1}
        />
        <Button
          title="Map 1"
          disabled={!mapViewController1}
          onPress={onShowMapsControlsClick1}
        />
        <Button
          title="Map 2"
          disabled={!mapViewController2}
          onPress={onShowMapsControlsClick2}
        />
      </View>
    </View>
  ) : (
    <React.Fragment />
  );
};

export default MultipleMapsScreen;
