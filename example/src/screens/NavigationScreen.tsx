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
import { Button, Switch, Text, View } from 'react-native';
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
  useNavigationAuto,
  type CustomNavigationAutoEvent,
} from '@googlemaps/react-native-navigation-sdk';
import {
  mapNavControlsReducer,
  initialMapNavControlsState,
} from '../controls/mapNavControlsReducer';
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
  MapControls = 'MapControls',
  AutoMapControls = 'AutoMapControls',
}

const marginAmount = 50;

const NavigationScreen = () => {
  const { arePermissionsApproved } = usePermissions();
  const { navigationController } = useNavigation();

  const [overlayType, setOverlayType] = useState<OverlayType>(OverlayType.None);
  const [mapViewController, setMapViewController] =
    useState<MapViewController | null>(null);
  const [navigationViewController, setNavigationViewController] =
    useState<NavigationViewController | null>(null);

  const { mapViewAutoController } = useNavigationAuto();
  const [mapViewAutoAvailable, setMapViewAutoAvailable] =
    useState<boolean>(false);

  const [state, dispatch] = React.useReducer(
    mapNavControlsReducer,
    initialMapNavControlsState
  );

  const [navigationInitialized, setNavigationInitialized] = useState(false);

  const [margin, setMargin] = useState<number | undefined>(undefined);

  useEffect(() => {
    // Set listeners for navigation events
    navigationController.setOnArrivalListener(onArrival);
    navigationController.setOnLocationChangedListener((location: Location) => {
      console.log('onLocationChanged:', location);
    });
    navigationController.setOnRawLocationChangedListener(
      (location: Location) => {
        console.log('onRawLocationChanged:', location);
      }
    );
    navigationController.setOnNavigationReadyListener(() => {
      console.log('onNavigationReady');
      setNavigationInitialized(true);
    });
    navigationController.setOnRemainingTimeOrDistanceChangedListener(
      async () => {
        if (navigationController) {
          const currentTimeAndDistance =
            await navigationController.getCurrentTimeAndDistance();
          console.log(currentTimeAndDistance);
        }
        console.log('called onRemainingTimeOrDistanceChanged');
      }
    );
    navigationController.setOnRouteChangedListener(() => {
      showSnackbar('Route Changed');
    });
    navigationController.setOnStartGuidanceListener(() => {
      showSnackbar('Start Guidance');
    });
    navigationController.setOnTrafficUpdatedListener(() => {
      showSnackbar('Traffic Updated');
    });
    navigationController.setOnTurnByTurnListener((turnByTurn: any) => {
      console.log('onTurnByTurn:', turnByTurn);
    });
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

  const onNavigationDispose = useCallback(async () => {
    dispatch({ type: 'setNavigationUIEnabled', value: false });
    setNavigationInitialized(false);
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

  useEffect(() => {
    (async () => {
      const isAvailable = await mapViewAutoController.isAutoScreenAvailable();
      setMapViewAutoAvailable(isAvailable);
    })();
  }, [mapViewAutoController]);

  useEffect(() => {
    mapViewAutoController.setOnAutoScreenAvailabilityChangedListener(
      (available: boolean) => {
        console.log('onAutoScreenAvailabilityChanged:', available);
        setMapViewAutoAvailable(available);
      }
    );
    mapViewAutoController.setOnCustomNavigationAutoEventListener(
      (event: CustomNavigationAutoEvent) => {
        console.log('onCustomNavigationAutoEvent:', event);
      }
    );

    return () => {
      mapViewAutoController.removeAllListeners();
    };
  });

  const onMapReady = useCallback(async () => {
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
          showSnackbar('Error: Unknown Error:' + status);
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
  }, [setOverlayType]);

  const onShowMapsControlsClick = useCallback(() => {
    setOverlayType(OverlayType.MapControls);
  }, [setOverlayType]);

  const onShowAutoMapsControlsClick = useCallback(() => {
    setOverlayType(OverlayType.AutoMapControls);
  }, [setOverlayType]);

  const closeOverlay = (): void => {
    setOverlayType(OverlayType.None);
  };

  return arePermissionsApproved ? (
    <View style={[styles.container]}>
      <NavigationView
        style={[
          {
            ...styles.map_view,
            margin: margin,
          },
        ]}
        mapType={state.mapType}
        mapPadding={state.padding}
        mapToolbarEnabled={state.mapToolbarEnabled}
        indoorEnabled={state.indoorEnabled}
        myLocationEnabled={state.myLocationEnabled}
        trafficEnabled={state.trafficEnabled}
        compassEnabled={state.compassEnabled}
        myLocationButtonEnabled={state.myLocationButtonEnabled}
        buildingsEnabled={state.buildingsEnabled}
        rotateGesturesEnabled={state.rotateGesturesEnabled}
        scrollGesturesEnabled={state.scrollGesturesEnabled}
        scrollGesturesEnabledDuringRotateOrZoom={
          state.scrollGesturesEnabledDuringRotateOrZoom
        }
        tiltGesturesEnabled={state.tiltGesturesEnabled}
        zoomControlsEnabled={state.zoomControlsEnabled}
        zoomGesturesEnabled={state.zoomGesturesEnabled}
        followingPerspective={state.followingPerspective}
        nightMode={state.nightMode}
        navigationUIEnabled={state.navigationUIEnabled}
        tripProgressBarEnabled={state.tripProgressBarEnabled}
        speedLimitIconEnabled={state.speedLimitIconEnabled}
        speedometerEnabled={state.speedometerEnabled}
        trafficIncidentsCardEnabled={state.trafficIncidentsCardEnabled}
        reportIncidentButtonEnabled={state.reportIncidentButtonEnabled}
        recenterButtonEnabled={state.recenterButtonEnabled}
        headerEnabled={state.headerEnabled}
        footerEnabled={state.footerEnabled}
        onMapReady={onMapReady}
        onMarkerClick={(marker) => {
          console.log('onMarkerClick:', marker);
          showSnackbar('Removing marker in 5 seconds');
          setTimeout(() => {
            mapViewController?.removeMarker(marker.id);
          }, 5000);
        }}
        onPolygonClick={(polygon) => {
          console.log('onPolygonClick:', polygon);
          mapViewController?.removePolygon(polygon.id);
        }}
        onCircleClick={(circle) => {
          console.log('onCircleClick:', circle);
          mapViewController?.removeCircle(circle.id);
        }}
        onPolylineClick={(polyline) => {
          console.log('onPolylineClick:', polyline);
          mapViewController?.removePolyline(polyline.id);
        }}
        onMarkerInfoWindowTapped={(marker) => {
          console.log('onMarkerInfoWindowTapped:', marker);
        }}
        onMapClick={(latLng) => {
          console.log('onMapClick:', latLng);
        }}
        onPromptVisibilityChanged={(res) => {
          console.log('onPromptVisibilityChanged - visible:', res.visible);
        }}
        onMapViewControllerCreated={setMapViewController}
        onNavigationViewControllerCreated={setNavigationViewController}
        onRecenterButtonClick={onRecenterButtonClick}
        initialCameraPosition={{
          target: {
            lat: 37.422,
            lng: -122.084,
          },
          zoom: 15,
        }}
        androidStylingOptions={{
          primaryDayModeThemeColor: '#1A237E',
          secondaryDayModeThemeColor: '#3F51B5',
          primaryNightModeThemeColor: '#212121',
          secondaryNightModeThemeColor: '#424242',
          headerLargeManeuverIconColor: '#FFFF00',
          headerSmallManeuverIconColor: '#FFA500',
          headerNextStepTextColor: '#00FF00',
          headerNextStepTextSize: '20f',
          headerDistanceValueTextColor: '#00FF00',
          headerDistanceUnitsTextColor: '#0000FF',
          headerDistanceValueTextSize: '20f',
          headerDistanceUnitsTextSize: '18f',
          headerInstructionsTextColor: '#FFFF00',
          headerInstructionsFirstRowTextSize: '24f',
          headerInstructionsSecondRowTextSize: '20f',
          headerGuidanceRecommendedLaneColor: '#FFA500',
        }}
        iOSStylingOptions={{
          navigationHeaderPrimaryBackgroundColor: '#1A237E',
          navigationHeaderSecondaryBackgroundColor: '#3F51B5',
          navigationHeaderPrimaryBackgroundColorNightMode: '#212121',
          navigationHeaderSecondaryBackgroundColorNightMode: '#424242',
          navigationHeaderLargeManeuverIconColor: '#FFFF00',
          navigationHeaderSmallManeuverIconColor: '#FFA500',
          navigationHeaderGuidanceRecommendedLaneColor: '#FFA500',
          navigationHeaderNextStepTextColor: '#00FF00',
          navigationHeaderDistanceValueTextColor: '#00FF00',
          navigationHeaderDistanceUnitsTextColor: '#0000FF',
          navigationHeaderInstructionsTextColor: '#FFFF00',
        }}
      />

      {navigationViewController != null &&
        navigationController != null &&
        navigationInitialized && (
          <OverlayModal
            visible={overlayType === OverlayType.NavControls}
            closeOverlay={closeOverlay}
          >
            <NavigationControls
              navigationController={navigationController}
              navigationViewController={navigationViewController}
              getCameraPosition={mapViewController?.getCameraPosition}
              onNavigationDispose={onNavigationDispose}
              state={state}
              dispatch={dispatch}
              onRouteStatusResult={onRouteStatusResult}
            />
          </OverlayModal>
        )}

      {mapViewController != null && (
        <OverlayModal
          visible={overlayType === OverlayType.MapControls}
          closeOverlay={closeOverlay}
        >
          <MapsControls
            mapViewController={mapViewController}
            state={state}
            dispatch={dispatch}
          />
        </OverlayModal>
      )}

      {mapViewAutoAvailable && mapViewAutoController != null && (
        <OverlayModal
          visible={overlayType === OverlayType.AutoMapControls}
          closeOverlay={closeOverlay}
        >
          <MapsControls
            mapViewController={mapViewAutoController}
            state={state}
            dispatch={dispatch}
          />
        </OverlayModal>
      )}

      <View style={styles.controlButtons}>
        <Button
          title="Navigation"
          onPress={onShowNavControlsClick}
          disabled={!navigationInitialized}
        />
        <Button title="Maps" onPress={onShowMapsControlsClick} />
        {mapViewAutoAvailable && (
          <Button title="Auto" onPress={onShowAutoMapsControlsClick} />
        )}
        <View style={styles.rowContainer}>
          <Text>Margin</Text>
          <Switch
            value={!!margin}
            onValueChange={() => {
              setMargin(margin ? undefined : marginAmount);
            }}
          />
        </View>
      </View>
    </View>
  ) : (
    <React.Fragment />
  );
};

export default NavigationScreen;
