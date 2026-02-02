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

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View } from 'react-native';
import { ExampleAppButton } from '../controls/ExampleAppButton';
import PagerView, {
  type PagerViewOnPageSelectedEvent,
} from 'react-native-pager-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  NavigationView,
  MapColorScheme,
  NavigationNightMode,
  NavigationSessionStatus,
  type ArrivalEvent,
  type Circle,
  type LatLng,
  type Location,
  type MapViewController,
  type Marker,
  type NavigationViewController,
  type Polygon,
  type Polyline,
  useNavigation,
  MapView,
} from '@googlemaps/react-native-navigation-sdk';
import MapsControls from '../controls/mapsControls';
import NavigationControls from '../controls/navigationControls';
import OverlayModal from '../helpers/overlayModal';
import { showSnackbar } from '../helpers/snackbar';
import { CommonStyles, ControlStyles } from '../styles/components';
import { MapStylingOptions } from '../styles/mapStyling';
import usePermissions from '../checkPermissions';

enum OverlayType {
  None = 'None',
  NavControls = 'NavControls',
  MapControls1 = 'MapControls1',
  MapControls2 = 'MapControls2',
}

const MultipleMapsScreen = () => {
  const insets = useSafeAreaInsets();
  const [mapsVisible, setMapsVisible] = useState(true);
  const { arePermissionsApproved } = usePermissions();
  const [overlayType, setOverlayType] = useState<OverlayType>(OverlayType.None);
  const [mapViewController1, setMapViewController1] =
    useState<MapViewController | null>(null);
  const [mapViewController2, setMapViewController2] =
    useState<MapViewController | null>(null);
  const [navigationViewController1, setNavigationViewController1] =
    useState<NavigationViewController | null>(null);
  const [navigationInitialized, setNavigationInitialized] = useState(false);
  const [mapColorScheme1, setMapColorScheme1] = useState<MapColorScheme>(
    MapColorScheme.FOLLOW_SYSTEM
  );
  const [mapColorScheme2, setMapColorScheme2] = useState<MapColorScheme>(
    MapColorScheme.FOLLOW_SYSTEM
  );
  const [navigationNightMode, setNavigationNightMode] =
    useState<NavigationNightMode>(NavigationNightMode.AUTO);
  const pagerRef = useRef<PagerView | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
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
  } = useNavigation();

  const onNavigationDispose = useCallback(async () => {
    setNavigationInitialized(false);
  }, []);

  // Set up navigation event listeners
  useEffect(() => {
    setOnNavigationReady(() => {
      if (navigationViewController1 != null) {
        setNavigationInitialized(true);
      }
    });

    setOnLocationChanged((_location: Location) => {
      // Location changed
    });

    setOnRawLocationChanged((_location: Location) => {
      // Raw location changed
    });

    setOnRouteChanged(() => showSnackbar('Route Changed'));
    setOnTrafficUpdated(() => showSnackbar('Traffic Updated'));
    setOnStartGuidance(() => showSnackbar('Start Guidance'));
  }, [
    navigationViewController1,
    setOnNavigationReady,
    setOnLocationChanged,
    setOnRawLocationChanged,
    setOnRouteChanged,
    setOnTrafficUpdated,
    setOnStartGuidance,
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

  const onMap1Ready = useCallback(async () => {
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

  const onRecenterButtonClick = useCallback(() => {
    // Recenter button clicked
  }, []);

  const onShowNavControlsClick = () => {
    setOverlayType(OverlayType.NavControls);
  };

  const onShowMapsControlsClick1 = () => {
    setOverlayType(OverlayType.MapControls1);
  };

  const onShowMapsControlsClick2 = () => {
    setOverlayType(OverlayType.MapControls2);
  };

  // Map 1 callbacks
  const onMarkerClick1 = useCallback(
    (marker: Marker) => {
      showSnackbar(`Map 1: Marker clicked, removing...`);
      mapViewController1?.removeMarker(marker.id);
    },
    [mapViewController1]
  );

  const onPolygonClick1 = useCallback(
    (polygon: Polygon) => {
      showSnackbar(`Map 1: Polygon clicked, removing...`);
      mapViewController1?.removePolygon(polygon.id);
    },
    [mapViewController1]
  );

  const onCircleClick1 = useCallback(
    (circle: Circle) => {
      showSnackbar(`Map 1: Circle clicked, removing...`);
      mapViewController1?.removeCircle(circle.id);
    },
    [mapViewController1]
  );

  const onPolylineClick1 = useCallback(
    (polyline: Polyline) => {
      showSnackbar(`Map 1: Polyline clicked, removing...`);
      mapViewController1?.removePolyline(polyline.id);
    },
    [mapViewController1]
  );

  const onMarkerInfoWindowTapped1 = useCallback((_marker: Marker) => {
    showSnackbar('Map 1: Marker info window tapped');
  }, []);

  const onMapClick1 = useCallback((latLng: LatLng) => {
    showSnackbar(
      `Map 1: Clicked at ${latLng.lat.toFixed(4)}, ${latLng.lng.toFixed(4)}`
    );
  }, []);

  // Map 2 callbacks
  const onMarkerClick2 = useCallback(
    (marker: Marker) => {
      showSnackbar(`Map 2: Marker clicked, removing...`);
      mapViewController2?.removeMarker(marker.id);
    },
    [mapViewController2]
  );

  const onPolygonClick2 = useCallback(
    (polygon: Polygon) => {
      showSnackbar(`Map 2: Polygon clicked, removing...`);
      mapViewController2?.removePolygon(polygon.id);
    },
    [mapViewController2]
  );

  const onCircleClick2 = useCallback(
    (circle: Circle) => {
      showSnackbar(`Map 2: Circle clicked, removing...`);
      mapViewController2?.removeCircle(circle.id);
    },
    [mapViewController2]
  );

  const onPolylineClick2 = useCallback(
    (polyline: Polyline) => {
      showSnackbar(`Map 2: Polyline clicked, removing...`);
      mapViewController2?.removePolyline(polyline.id);
    },
    [mapViewController2]
  );

  const onMarkerInfoWindowTapped2 = useCallback((_marker: Marker) => {
    showSnackbar('Map 2: Marker info window tapped');
  }, []);

  const onMapClick2 = useCallback((latLng: LatLng) => {
    showSnackbar(
      `Map 2: Clicked at ${latLng.lat.toFixed(4)}, ${latLng.lng.toFixed(4)}`
    );
  }, []);

  const closeOverlay = (): void => {
    setOverlayType(OverlayType.None);
  };

  const handlePageSelected = useCallback(
    (event: PagerViewOnPageSelectedEvent) => {
      setCurrentPage(event.nativeEvent.position);
    },
    []
  );

  const goToPage = useCallback((pageIndex: number) => {
    setCurrentPage(pageIndex);
    pagerRef.current?.setPage(pageIndex);
  }, []);

  return arePermissionsApproved ? (
    <View style={[CommonStyles.container, { paddingBottom: insets.bottom }]}>
      <View style={CommonStyles.buttonContainer}>
        <ExampleAppButton
          title={mapsVisible ? 'Hide maps' : 'Show maps'}
          onPress={() => setMapsVisible(v => !v)}
        />
      </View>

      {mapsVisible && (
        <React.Fragment>
          <View style={ControlStyles.pagerButtons}>
            <ExampleAppButton
              title="Navigation page"
              onPress={() => goToPage(0)}
              disabled={currentPage === 0}
            />
            <ExampleAppButton
              title="Map page"
              onPress={() => goToPage(1)}
              disabled={currentPage === 1}
            />
          </View>
          <PagerView
            ref={pagerRef}
            style={{ flex: 1 }}
            initialPage={currentPage}
            onPageSelected={handlePageSelected}
          >
            {/* Page 1: NavigationView */}
            <View key="1" style={{ flex: 1 }}>
              <NavigationView
                key="navigationView1"
                style={{ flex: 1 }}
                androidStylingOptions={MapStylingOptions.android}
                iOSStylingOptions={MapStylingOptions.iOS}
                mapColorScheme={mapColorScheme1}
                navigationNightMode={navigationNightMode}
                onRecenterButtonClick={onRecenterButtonClick}
                onMapReady={onMap1Ready}
                onMarkerClick={onMarkerClick1}
                onPolygonClick={onPolygonClick1}
                onCircleClick={onCircleClick1}
                onPolylineClick={onPolylineClick1}
                onMarkerInfoWindowTapped={onMarkerInfoWindowTapped1}
                onMapClick={onMapClick1}
                onMapViewControllerCreated={setMapViewController1}
                onNavigationViewControllerCreated={setNavigationViewController1}
              />
              <View style={ControlStyles.controlButtons}>
                <ExampleAppButton
                  title="Nav (Map 1)"
                  onPress={onShowNavControlsClick}
                  disabled={!navigationInitialized}
                />
                <ExampleAppButton
                  title="Map 1"
                  onPress={onShowMapsControlsClick1}
                />
              </View>
            </View>
            {/* Page 2: MapView */}
            <View key="2" style={{ flex: 1 }}>
              <MapView
                style={{ flex: 1 }}
                mapColorScheme={mapColorScheme2}
                onMarkerClick={onMarkerClick2}
                onPolygonClick={onPolygonClick2}
                onCircleClick={onCircleClick2}
                onPolylineClick={onPolylineClick2}
                onMarkerInfoWindowTapped={onMarkerInfoWindowTapped2}
                onMapClick={onMapClick2}
                onMapViewControllerCreated={setMapViewController2}
              />
              {currentPage === 1 && (
                <View style={ControlStyles.controlButtons}>
                  <ExampleAppButton
                    title="Map 2"
                    onPress={onShowMapsControlsClick2}
                  />
                </View>
              )}
            </View>
          </PagerView>

          {/* Overlays and controls remain outside PagerView */}
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
                  navigationNightMode={navigationNightMode}
                  onNavigationNightModeChange={setNavigationNightMode}
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
                mapColorScheme={mapColorScheme1}
                onMapColorSchemeChange={setMapColorScheme1}
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
                mapColorScheme={mapColorScheme2}
                onMapColorSchemeChange={setMapColorScheme2}
              />
            </OverlayModal>
          )}
        </React.Fragment>
      )}
    </View>
  ) : (
    <React.Fragment />
  );
};

export default MultipleMapsScreen;
