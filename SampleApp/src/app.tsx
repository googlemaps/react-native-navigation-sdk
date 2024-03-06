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

import React, {ReactElement, useEffect, useState} from 'react';
import {Button, Dimensions, Platform, View} from "react-native";

import {PERMISSIONS, RESULTS, requestMultiple} from "react-native-permissions";

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  MapViewCallbacks,
  MapViewController,
} from 'react-native-navigation-sdk/components/maps/mapView/types';
import {
  Circle,
  Marker,
  Polygon,
  Polyline,
} from 'react-native-navigation-sdk/components/maps/types';
import NavigationView from 'react-native-navigation-sdk/components/navigation/navigationView/index';
import {
  ArrivalEvent,
  NavigationViewCallbacks,
  NavigationViewController,
  TermsAndConditionsDialogOptions,
} from 'react-native-navigation-sdk/components/navigation/navigationView/types';
import {
  NavigationInitErrorCode,
  RouteStatus,
} from 'react-native-navigation-sdk/components/navigation/types';
import {Location} from 'react-native-navigation-sdk/components/shared/types';
import Snackbar from 'react-native-snackbar';
import MapsControls from './mapsControls';
import NavigationControls from './navigationControls';
import styles from './styles';

const App: React.FC = (): ReactElement => {
  const [shouldShowNavControls, setShouldShowNavControls] = useState(false);
  const [shouldShowMapControls, setShouldShowMapControls] = useState(false);
  const [_, setSnackbarShown] = useState(false);
  const [arePermissionsApproved, setArePermissionsApproved] = useState(false);

  const [mapViewController, setMapViewController] =
    useState<MapViewController | null>(null);
  const [navigationViewController, setNavigationViewController] =
    useState<NavigationViewController | null>(null);

  useEffect(() => {
    console.log('useEffect im in will mount');

    const checkSnackbarStatus = async () => {
      try {
        const value = await AsyncStorage.getItem('snackbarShown');
        if (value !== null) {
          setSnackbarShown(JSON.parse(value));
        }
      } catch (error) {
        console.error('Error reading from AsyncStorage', error);
      }
    };
    checkSnackbarStatus();

    checkPermissions();

    return () => {
      console.log('useEffect im in will umount');
    };
  }, []);

  const checkPermissions = async () => {
    const toRequestPermissions = Platform.OS == 'android' ?[
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
    ] : [
      PERMISSIONS.IOS.LOCATION_ALWAYS,
      PERMISSIONS.IOS.PHOTO_LIBRARY
    ];

    const permissionStatuses = await requestMultiple(toRequestPermissions);
    const result = permissionStatuses[toRequestPermissions[0]];

    if (result == RESULTS.GRANTED) {
      setArePermissionsApproved(true);
    } else {
      Snackbar.show({
        text: 'Location permissions are needed to proceed with the app. Please re-open and accept.',
        duration: Snackbar.LENGTH_SHORT,
      });
    }
  };

  const onRouteChanged = () => {
    Snackbar.show({
      text: 'Route Changed',
      duration: Snackbar.LENGTH_SHORT,
    });
  };

  const onArrival = (event: ArrivalEvent) => {
    if (event.isFinalDestination) {
      console.log('Final destination reached');
      navigationViewController?.stopGuidance();
    } else {
      console.log('Continuing to the next destination');
      navigationViewController?.continueToNextDestination();
      navigationViewController?.startGuidance();
    }

    Snackbar.dismiss();
    Snackbar.show({
      text: 'Arrived ',
      duration: Snackbar.LENGTH_SHORT,
    });
  };

  const onTrafficUpdated = () => {
    Snackbar.show({
      text: 'Traffic Updated',
      duration: Snackbar.LENGTH_SHORT,
    });
  };

  const onNavigationReady = () => {
    console.log('onNavigationReady');
  };

  const onNavigationInitError = (errorCode: NavigationInitErrorCode) => {
    Snackbar.show({
      text: 'Failed to initialize navigation errorCode: ' + errorCode,
      duration: Snackbar.LENGTH_SHORT,
    });
  };

  const onStartGuidance = () => {
    Snackbar.show({
      text: 'Start Guidance',
      duration: Snackbar.LENGTH_SHORT,
    });
  };

  const onRouteStatusOk = () => {
    Snackbar.show({
      text: 'Route created',
      duration: Snackbar.LENGTH_SHORT,
    });
  };

  const onRouteCancelled = () => {
    Snackbar.show({
      text: 'Error: Route Cancelled',
      duration: Snackbar.LENGTH_SHORT,
    });
  };

  const onNoRouteFound = () => {
    Snackbar.show({
      text: 'Error: No Route Found',
      duration: Snackbar.LENGTH_SHORT,
    });
  };

  const onNetworkError = () => {
    Snackbar.show({
      text: 'Error: Network Error',
      duration: Snackbar.LENGTH_SHORT,
    });
  };

  const onStartingGuidanceError = () => {
    Snackbar.show({
      text: 'Error: Starting Guidance Error',
      duration: Snackbar.LENGTH_SHORT,
    });
  };

  const onLocationDisabled = () => {
    Snackbar.show({
      text: 'Error: Location Disabled',
      duration: Snackbar.LENGTH_SHORT,
    });
  };

  const onLocationUnknown = () => {
    Snackbar.show({
      text: 'Error: Location Unknown',
      duration: Snackbar.LENGTH_SHORT,
    });
  };

  const onMapReady = () => {
    console.log('Map is ready');
  };

  const onLocationChanged = (location: Location) => {
    console.log('onLocationChanged: ');
    console.log(location);
  };

  const onRawLocationChanged = (location: Location) => {
    console.log('onRawLocationChanged: ');
    console.log(location);
  };

  const onRemainingTimeOrDistanceChanged = async () => {
    console.log(await navigationViewController?.getCurrentTimeAndDistance());
    console.log('called onRemainingTimeOrDistanceChanged');
  };

  const onRouteStatusResult = (routeStatus: RouteStatus) => {
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
  };

  const onRecenterButtonClick = () => {
    console.log('onRecenterButtonClick');
  };

  const onShowNavControlsClick = () => {
    setShouldShowMapControls(false);
    setShouldShowNavControls(!shouldShowNavControls);
  };

  const onShowMapsControlsClick = () => {
    setShouldShowNavControls(false);
    setShouldShowMapControls(!shouldShowMapControls);
  };

  const onMarkerClick = (marker: Marker) => {
    mapViewController?.removeMarker(marker.id);
  };

  console.log('arePermissionsApproved:', arePermissionsApproved);

  const navViewWidth = Dimensions.get('window').width;
  const navViewHeight =
    Dimensions.get('window').height -
    0.05 * Dimensions.get('window').height -
    50;

  const navigationViewCallbacks: NavigationViewCallbacks = {
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
    onRecenterButtonClick,
  };

  const mapViewCallbacks: MapViewCallbacks = {
    onMapReady,
    onMarkerClick: (marker: Marker) => {
      console.log('onMarkerClick: ', marker);
      mapViewController?.removeMarker(marker.id);
    },
    onPolygonClick: (polygon: Polygon) => {
      console.log('onPolygonClick: ', polygon);
      mapViewController?.removePolygon(polygon.id);
    },
    onCircleClick: (circle: Circle) => {
      console.log('onCircleClick: ', circle);
      mapViewController?.removeCircle(circle.id);
    },
    onPolylineClick: (polyline: Polyline) => {
      console.log('onPolylineClick: ', polyline);
      mapViewController?.removePolyline(polyline.id);
    },
    onMarkerInfoWindowTapped: (marker: Marker) => {
      console.log('onMarkerInfoWindowTapped: ', marker);
    },
  };

  const termsAndConditionsDialogOptions: TermsAndConditionsDialogOptions = {
    title: 'RN NavSDK Sample',
    companyName: 'Google',
    showOnlyDisclaimer: true,
  };

  return arePermissionsApproved ? (
    <View style={[styles.container]}>
      <View style={[styles.sub_container]}>
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
          termsAndConditionsDialogOptions={termsAndConditionsDialogOptions}
        />
      </View>

      <View style={{margin: 5}}>
        {navigationViewController != null ? (
          <NavigationControls
            navigationViewController={navigationViewController}
            visible={shouldShowNavControls}
          />
        ) : null}
      </View>

      <View style={{margin: 5}}>
        {mapViewController != null ? (
          <MapsControls
            mapViewController={mapViewController}
            visible={shouldShowMapControls}
          />
        ) : null}
      </View>

      <View style={styles.controlButton}>
        <Button title="Navigation" onPress={onShowNavControlsClick} />
        <View style={{margin: 10}} />
        <Button title="Maps" onPress={onShowMapsControlsClick} />
      </View>
    </View>
  ) : (
    <React.Fragment></React.Fragment>
  );
};

export default App;
