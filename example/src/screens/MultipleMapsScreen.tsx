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

import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { View } from 'react-native';
import { ExampleAppButton } from '../controls/ExampleAppButton';
import PagerView, {
  type PagerViewOnPageSelectedEvent,
} from 'react-native-pager-view';
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
import { CommonStyles, ControlStyles } from '../styles/components';
import { MapStylingOptions } from '../styles/mapStyling';
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
  const { navigationController, addListeners, removeListeners } =
    useNavigation();

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
    }),
    [
      onArrival,
      onNavigationReady,
      onNavigationInitError,
      onLocationChanged,
      onRawLocationChanged,
      onRouteStatusResult,
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

  const onShowNavControlsClick = () => {
    setOverlayType(OverlayType.NavControls);
  };

  const onShowMapsControlsClick1 = () => {
    setOverlayType(OverlayType.MapControls1);
  };

  const onShowMapsControlsClick2 = () => {
    setOverlayType(OverlayType.MapControls2);
  };

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
                navigationViewCallbacks={navigationViewCallbacks}
                mapViewCallbacks={mapViewCallbacks1}
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
                mapViewCallbacks={mapViewCallbacks2}
                mapColorScheme={mapColorScheme2}
                onMapViewControllerCreated={setMapViewController2}
              />
              <View style={ControlStyles.controlButtons}>
                <ExampleAppButton
                  title="Map 2"
                  onPress={onShowMapsControlsClick2}
                />
              </View>
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
                  showMessage={showSnackbar}
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
                showMessage={showSnackbar}
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
                showMessage={showSnackbar}
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
