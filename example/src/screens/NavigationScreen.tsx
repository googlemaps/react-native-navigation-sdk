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
import { View } from 'react-native';
import { ExampleAppButton } from '../controls/ExampleAppButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  NavigationView,
  MapColorScheme,
  CameraPerspective,
  NavigationNightMode,
  NavigationSessionStatus,
  type ArrivalEvent,
  type Circle,
  type GroundOverlay,
  type LatLng,
  type Location,
  type MapViewController,
  type Marker,
  type NavigationViewController,
  type TurnByTurnEvent,
  type Polygon,
  type Polyline,
  useNavigation,
  useNavigationAuto,
} from '@googlemaps/react-native-navigation-sdk';
import MapsControls from '../controls/mapsControls';
import AutoControls from '../controls/autoControls';
import NavigationControls from '../controls/navigationControls';
import NavigationActionPath, {
  ActionPathStep,
} from '../controls/NavigationActionPath';
import OverlayModal from '../helpers/overlayModal';
import { showSnackbar, Snackbar } from '../helpers/snackbar';
import { CommonStyles, MapStyles } from '../styles/components';
import { MapStylingOptions } from '../styles/mapStyling';
import usePermissions from '../checkPermissions';

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

  // Map state
  const [myLocationEnabled, setMyLocationEnabled] = useState(true);
  const [myLocationButtonEnabled, setMyLocationButtonEnabled] = useState(true);

  // Map UI settings
  const [compassEnabled, setCompassEnabled] = useState(true);
  const [mapToolbarEnabled, setMapToolbarEnabled] = useState(true);
  const [indoorEnabled, setIndoorEnabled] = useState(true);
  const [indoorLevelPickerEnabled, setIndoorLevelPickerEnabled] =
    useState(true);
  const [rotateGesturesEnabled, setRotateGesturesEnabled] = useState(true);
  const [scrollGesturesEnabled, setScrollGesturesEnabled] = useState(true);
  const [
    scrollGesturesDuringRotateOrZoomEnabled,
    setScrollGesturesDuringRotateOrZoomEnabled,
  ] = useState(true);
  const [tiltGesturesEnabled, setTiltGesturesEnabled] = useState(true);
  const [zoomControlsEnabled, setZoomControlsEnabled] = useState(true);
  const [zoomGesturesEnabled, setZoomGesturesEnabled] = useState(true);

  // Navigation UI state
  const [tripProgressBarEnabled, setTripProgressBarEnabled] = useState(false);
  const [trafficPromptsEnabled, setTrafficPromptsEnabled] = useState(true);
  const [trafficIncidentCardsEnabled, setTrafficIncidentCardsEnabled] =
    useState(true);
  const [headerEnabled, setHeaderEnabled] = useState(true);
  const [footerEnabled, setFooterEnabled] = useState(true);
  const [speedometerEnabled, setSpeedometerEnabled] = useState(false);
  const [speedLimitIconEnabled, setSpeedLimitIconEnabled] = useState(false);
  const [recenterButtonEnabled, setRecenterButtonEnabled] = useState(true);
  const [reportIncidentButtonEnabled, setReportIncidentButtonEnabled] =
    useState(true);
  const [followingPerspective, setFollowingPerspective] = useState<
    CameraPerspective | undefined
  >(undefined);

  const {
    mapViewAutoController,
    setOnAutoScreenAvailabilityChanged,
    setOnCustomNavigationAutoEvent,
  } = useNavigationAuto();
  const [mapViewAutoAvailable, setMapViewAutoAvailable] =
    useState<boolean>(false);

  const {
    navigationController,
    setOnNavigationReady,
    setOnArrival,
    setOnLocationChanged,
    setOnRawLocationChanged,
    setOnRouteChanged,
    setOnTrafficUpdated,
    setOnStartGuidance,
    setOnRemainingTimeOrDistanceChanged,
    setOnTurnByTurn,
  } = useNavigation();

  const [navigationInitialized, setNavigationInitialized] = useState(false);
  const [actionPathStep, setActionPathStep] = useState<ActionPathStep>(
    ActionPathStep.NOT_INITIALIZED
  );

  useEffect(() => {
    if (navigationViewController && followingPerspective !== undefined) {
      navigationViewController.setFollowingPerspective(followingPerspective);
    }
  }, [navigationViewController, followingPerspective]);

  const onNavigationDispose = useCallback(async () => {
    setNavigationInitialized(false);
    setActionPathStep(ActionPathStep.NOT_INITIALIZED);
  }, []);

  // Set up navigation event listeners
  useEffect(() => {
    setOnNavigationReady(() => {
      setNavigationInitialized(true);
      setActionPathStep(ActionPathStep.INITIALIZED);
    });

    setOnLocationChanged((_location: Location) => {
      console.debug(
        `Location updated with lat: ${_location.lat}, lng: ${_location.lng}`
      );
    });

    setOnRawLocationChanged((_location: Location) => {
      console.debug(
        `Raw location updated with lat: ${_location.lat}, lng: ${_location.lng}`
      );
    });

    setOnRouteChanged(() => showSnackbar('Route Changed'));
    setOnTrafficUpdated(() => showSnackbar('Traffic Updated'));
    setOnStartGuidance(() => showSnackbar('Start Guidance'));

    setOnTurnByTurn((_turnByTurn: TurnByTurnEvent[]) => {
      console.debug(`Received ${_turnByTurn.length} turn-by-turn events`);
    });
  }, [
    setOnNavigationReady,
    setOnLocationChanged,
    setOnRawLocationChanged,
    setOnRouteChanged,
    setOnTrafficUpdated,
    setOnStartGuidance,
    setOnTurnByTurn,
  ]);

  // Set up callbacks that depend on navigationController
  useEffect(() => {
    setOnArrival((event: ArrivalEvent) => {
      if (event.isFinalDestination) {
        navigationController.stopGuidance();
      } else {
        navigationController.continueToNextDestination();
        navigationController.startGuidance();
      }
      showSnackbar('Arrived');
    });

    setOnRemainingTimeOrDistanceChanged(timeAndDistance => {
      const minutes = Math.round(timeAndDistance.seconds / 60);
      const km = (timeAndDistance.meters / 1000).toFixed(1);
      console.info(`ETA: ${minutes} min, ${km} km remaining`);
    });
  }, [navigationController, setOnArrival, setOnRemainingTimeOrDistanceChanged]);

  // Set up auto navigation event listeners
  useEffect(() => {
    setOnAutoScreenAvailabilityChanged((available: boolean) => {
      setMapViewAutoAvailable(available);
    });

    setOnCustomNavigationAutoEvent(event => {
      // Show snackbar when custom event is received from Android Auto/CarPlay
      const dataStr = event.data ? JSON.stringify(event.data) : 'no data';
      showSnackbar(
        `Auto event: ${event.type} - ${dataStr}`,
        Snackbar.LENGTH_LONG
      );
    });
  }, [setOnAutoScreenAvailabilityChanged, setOnCustomNavigationAutoEvent]);

  useEffect(() => {
    (async () => {
      const isAvailable = await mapViewAutoController.isAutoScreenAvailable();
      setMapViewAutoAvailable(isAvailable);
    })();
  }, [mapViewAutoController]);

  const onMapReady = useCallback(async () => {
    // First show Terms and Conditions dialog (uses options from NavigationProvider)
    const termsAccepted =
      await navigationController.showTermsAndConditionsDialog();

    if (!termsAccepted) {
      showSnackbar('Terms and conditions not accepted');
      return;
    }

    const status = await navigationController.init();
    if (status !== NavigationSessionStatus.OK) {
      console.error('Error initializing navigator:', status);
      showSnackbar(`Error initializing navigator: ${status}`);
    }
  }, [navigationController]);

  const onRecenterButtonClick = () => {
    // Recenter button clicked
  };

  const handleInitNavigation = useCallback(async () => {
    // First show Terms and Conditions dialog (uses options from NavigationProvider)
    const termsAccepted =
      await navigationController.showTermsAndConditionsDialog();

    if (!termsAccepted) {
      showSnackbar('Terms and conditions not accepted');
      return;
    }

    const status = await navigationController.init();
    if (status !== NavigationSessionStatus.OK) {
      console.error('Error initializing navigator:', status);
      showSnackbar(`Error initializing navigator: ${status}`);
      throw new Error(`Navigation init failed: ${status}`);
    }
  }, [navigationController]);

  const onShowNavControlsClick = useCallback(() => {
    setOverlayType(OverlayType.NavControls);
  }, [setOverlayType]);

  const onShowMapsControlsClick = useCallback(() => {
    setOverlayType(OverlayType.MapControls);
  }, [setOverlayType]);

  const onShowAutoMapsControlsClick = useCallback(() => {
    setOverlayType(OverlayType.AutoMapControls);
  }, [setOverlayType]);

  // Map view callbacks
  const onMarkerClick = useCallback(
    (marker: Marker) => {
      showSnackbar('Removing marker in 5 seconds');
      setTimeout(() => {
        mapViewController?.removeMarker(marker.id);
      }, 5000);
    },
    [mapViewController]
  );

  const onPolygonClick = useCallback(
    (polygon: Polygon) => {
      showSnackbar('Polygon clicked, removing...');
      mapViewController?.removePolygon(polygon.id);
    },
    [mapViewController]
  );

  const onCircleClick = useCallback(
    (circle: Circle) => {
      showSnackbar('Circle clicked, removing...');
      mapViewController?.removeCircle(circle.id);
    },
    [mapViewController]
  );

  const onPolylineClick = useCallback(
    (polyline: Polyline) => {
      showSnackbar('Polyline clicked, removing...');
      mapViewController?.removePolyline(polyline.id);
    },
    [mapViewController]
  );

  const onGroundOverlayClick = useCallback((groundOverlay: GroundOverlay) => {
    showSnackbar(`Ground overlay clicked: ${groundOverlay.id}`);
  }, []);

  const onMarkerInfoWindowTapped = useCallback((_marker: Marker) => {
    showSnackbar('Marker info window tapped');
  }, []);

  const onMapClick = useCallback((latLng: LatLng) => {
    showSnackbar(
      `Clicked at ${latLng.lat.toFixed(4)}, ${latLng.lng.toFixed(4)}`
    );
  }, []);

  const closeOverlay = (): void => {
    setOverlayType(OverlayType.None);
  };

  return arePermissionsApproved ? (
    <View style={[CommonStyles.container, { paddingBottom: insets.bottom }]}>
      <NavigationView
        style={MapStyles.mapView}
        androidStylingOptions={MapStylingOptions.android}
        iOSStylingOptions={MapStylingOptions.iOS}
        mapColorScheme={mapColorScheme}
        navigationNightMode={navigationNightMode}
        myLocationEnabled={myLocationEnabled}
        myLocationButtonEnabled={myLocationButtonEnabled}
        compassEnabled={compassEnabled}
        mapToolbarEnabled={mapToolbarEnabled}
        indoorEnabled={indoorEnabled}
        indoorLevelPickerEnabled={indoorLevelPickerEnabled}
        rotateGesturesEnabled={rotateGesturesEnabled}
        scrollGesturesEnabled={scrollGesturesEnabled}
        scrollGesturesDuringRotateOrZoomEnabled={
          scrollGesturesDuringRotateOrZoomEnabled
        }
        tiltGesturesEnabled={tiltGesturesEnabled}
        zoomControlsEnabled={zoomControlsEnabled}
        zoomGesturesEnabled={zoomGesturesEnabled}
        navigationUIEnabledPreference={0} // 0 = AUTOMATIC
        tripProgressBarEnabled={tripProgressBarEnabled}
        trafficPromptsEnabled={trafficPromptsEnabled}
        trafficIncidentCardsEnabled={trafficIncidentCardsEnabled}
        headerEnabled={headerEnabled}
        footerEnabled={footerEnabled}
        speedometerEnabled={speedometerEnabled}
        speedLimitIconEnabled={speedLimitIconEnabled}
        recenterButtonEnabled={recenterButtonEnabled}
        reportIncidentButtonEnabled={reportIncidentButtonEnabled}
        onMapReady={onMapReady}
        onMapClick={onMapClick}
        onMarkerClick={onMarkerClick}
        onPolylineClick={onPolylineClick}
        onPolygonClick={onPolygonClick}
        onCircleClick={onCircleClick}
        onGroundOverlayClick={onGroundOverlayClick}
        onMarkerInfoWindowTapped={onMarkerInfoWindowTapped}
        onRecenterButtonClick={onRecenterButtonClick}
        onMapViewControllerCreated={setMapViewController}
        onNavigationViewControllerCreated={setNavigationViewController}
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
              navigationNightMode={navigationNightMode}
              onNavigationNightModeChange={setNavigationNightMode}
              onTripProgressBarEnabledChange={setTripProgressBarEnabled}
              onTrafficPromptsEnabledChange={setTrafficPromptsEnabled}
              onTrafficIncidentCardsEnabledChange={
                setTrafficIncidentCardsEnabled
              }
              onHeaderEnabledChange={setHeaderEnabled}
              onFooterEnabledChange={setFooterEnabled}
              onSpeedometerEnabledChange={setSpeedometerEnabled}
              onSpeedLimitIconEnabledChange={setSpeedLimitIconEnabled}
              onRecenterButtonEnabledChange={setRecenterButtonEnabled}
              onReportIncidentButtonEnabledChange={
                setReportIncidentButtonEnabled
              }
              onFollowingPerspectiveChange={setFollowingPerspective}
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
            mapColorScheme={mapColorScheme}
            onMapColorSchemeChange={setMapColorScheme}
            myLocationEnabled={myLocationEnabled}
            myLocationButtonEnabled={myLocationButtonEnabled}
            onMyLocationChange={(enabled, buttonEnabled) => {
              setMyLocationEnabled(enabled);
              setMyLocationButtonEnabled(buttonEnabled);
            }}
            compassEnabled={compassEnabled}
            onCompassEnabledChange={setCompassEnabled}
            mapToolbarEnabled={mapToolbarEnabled}
            onMapToolbarEnabledChange={setMapToolbarEnabled}
            indoorEnabled={indoorEnabled}
            onIndoorEnabledChange={setIndoorEnabled}
            indoorLevelPickerEnabled={indoorLevelPickerEnabled}
            onIndoorLevelPickerEnabledChange={setIndoorLevelPickerEnabled}
            rotateGesturesEnabled={rotateGesturesEnabled}
            onRotateGesturesEnabledChange={setRotateGesturesEnabled}
            scrollGesturesEnabled={scrollGesturesEnabled}
            onScrollGesturesEnabledChange={setScrollGesturesEnabled}
            scrollGesturesDuringRotateOrZoomEnabled={
              scrollGesturesDuringRotateOrZoomEnabled
            }
            onScrollGesturesDuringRotateOrZoomEnabledChange={
              setScrollGesturesDuringRotateOrZoomEnabled
            }
            tiltGesturesEnabled={tiltGesturesEnabled}
            onTiltGesturesEnabledChange={setTiltGesturesEnabled}
            zoomControlsEnabled={zoomControlsEnabled}
            onZoomControlsEnabledChange={setZoomControlsEnabled}
            zoomGesturesEnabled={zoomGesturesEnabled}
            onZoomGesturesEnabledChange={setZoomGesturesEnabled}
          />
        </OverlayModal>
      )}

      {mapViewAutoAvailable && mapViewAutoController != null && (
        <OverlayModal
          visible={overlayType === OverlayType.AutoMapControls}
          closeOverlay={closeOverlay}
        >
          <AutoControls mapViewAutoController={mapViewAutoController} />
        </OverlayModal>
      )}

      <NavigationActionPath
        navigationController={navigationController}
        navigationInitialized={navigationInitialized}
        onInitNavigation={handleInitNavigation}
        onNavigationCleanedUp={onNavigationDispose}
        currentStep={actionPathStep}
        onStepChange={setActionPathStep}
      />

      <View style={CommonStyles.buttonRow}>
        <ExampleAppButton
          title="Navigation"
          onPress={onShowNavControlsClick}
          disabled={!navigationInitialized}
        />
        <ExampleAppButton title="Maps" onPress={onShowMapsControlsClick} />
        {mapViewAutoAvailable && (
          <ExampleAppButton
            title="Auto"
            onPress={onShowAutoMapsControlsClick}
          />
        )}
      </View>
    </View>
  ) : (
    <React.Fragment />
  );
};

export default NavigationScreen;
