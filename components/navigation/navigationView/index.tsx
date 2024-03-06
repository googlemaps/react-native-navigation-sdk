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
import * as React from 'react';
import {
  Dimensions,
  NativeEventEmitter,
  NativeModules,
  PixelRatio,
  Platform,
  findNodeHandle,
} from 'react-native';

import {getMapViewController} from '../../maps/mapView/mapViewController';
import {
  Circle,
  Marker,
  Polygon,
  Polyline,
} from '../../maps/types';
import {Location} from '../../shared/types';
import {NavViewManager, commands, sendCommand} from '../../shared/viewManager';
import {NavigationInitErrorCode} from '../types';
import NavHelper from './navHelper';
import {getNavigationViewController} from './navigationViewController';
import {getRouteStatusFromStringValue} from './shared';
import {ArrivalEvent, NavigationViewProps} from './types';

export default class NavigationView extends React.Component<NavigationViewProps> {
  private viewId: number = -1;
  private mapViewRef?: any;

  constructor(_props: NavigationViewProps) {
    super(_props);

    const isPortrait = () => {
      const dim = Dimensions.get('screen');
      return dim.height >= dim.width;
    };

    this.state = {
      count: 0,
      viewId: {},
      mapViewRef: {},
      orientation: isPortrait() ? 'portrait' : 'landscape',
    };

    Dimensions.addEventListener('change', () => {
      this.setState({
        orientation: isPortrait() ? 'portrait' : 'landscape',
      });
    });
  }

  /**
   * Callback function invoked when GoogleMap is ready.
   */
  onMapReady = () => {
    if (
      this.props.mapViewCallbacks != null &&
      this.props.mapViewCallbacks.onMapReady
    ) {
      this.props.mapViewCallbacks.onMapReady();
    }
  };

  /**
   * A callback function that gets invoked when navigation information is ready.
   *
   * @param args - The argument which contains navigation information,
   * potentially including routes, waypoints, and other relevant data.
   */
  onNavigationReady = () => {
    if (
      this.props.navigationViewCallbacks != null &&
      this.props.navigationViewCallbacks.onNavigationReady
    ) {
      this.props.navigationViewCallbacks.onNavigationReady();
    }
  };

  /**
   * A callback function that gets invoked when navigation init error is encountered.
   *
   * @param args - Enum argument that describes the error during SDK initialization
   */
  onNavigationInitError = (errorCode: NavigationInitErrorCode) => {
    if (
      this.props.navigationViewCallbacks != null &&
      this.props.navigationViewCallbacks.onNavigationInitError
    ) {
      this.props.navigationViewCallbacks.onNavigationInitError(errorCode);
    }
  };

  /**
   * Callback function invoked when the destination is reached.
   * @param args - The arguments received upon arrival. The type
   *               and structure of `args` should be documented
   *               based on the actual usage and data expected.
   */
  onArrival = (args: ArrivalEvent) => {
    if (
      this.props.navigationViewCallbacks != null &&
      this.props.navigationViewCallbacks.onArrival
    ) {
      this.props.navigationViewCallbacks.onArrival(args);
    }
  };

  /**
   * Callback function invoked when the route is changed.
   */
  onRouteChanged = () => {
    if (
      this.props.navigationViewCallbacks != null &&
      this.props.navigationViewCallbacks.onRouteChanged
    ) {
      this.props.navigationViewCallbacks.onRouteChanged();
    }
  };

  /**
   * Callback function invoked when receiving a route status result.
   *
   * @param args - The arguments received related to the route status.
   *               The exact structure and type of `args` should be
   *               documented based on actual usage and expected data.
   */
  onRouteStatusResult = (args: string) => {
    if (
      this.props.navigationViewCallbacks != null &&
      this.props.navigationViewCallbacks.onRouteStatusResult
    ) {
      this.props.navigationViewCallbacks.onRouteStatusResult(
        getRouteStatusFromStringValue(args),
      );
    }
  };

  /**
   * Callback function invoked when the re-center button is clicked.
   */
  onRecenterButtonClick = () => {
    if (
      this.props.navigationViewCallbacks != null &&
      this.props.navigationViewCallbacks.onRecenterButtonClick
    ) {
      this.props.navigationViewCallbacks.onRecenterButtonClick();
    }
  };

  /**
   * Callback function invoked when rerouting is requested due to an
   * off-route event.
   */
  onReroutingRequestedByOffRoute = () => {
    if (
      this.props.navigationViewCallbacks != null &&
      this.props.navigationViewCallbacks.onReroutingRequestedByOffRoute
    ) {
      this.props.navigationViewCallbacks.onReroutingRequestedByOffRoute();
    }
  };

  /**
   * Callback function invoked when traffic data is updated.
   */
  onTrafficUpdated = () => {
    if (
      this.props.navigationViewCallbacks != null &&
      this.props.navigationViewCallbacks.onTrafficUpdated
    ) {
      this.props.navigationViewCallbacks.onTrafficUpdated();
    }
  };

  /**
   * Callback function invoked when guidance is started.
   */
  onStartGuidance = () => {
    if (
      this.props.navigationViewCallbacks != null &&
      this.props.navigationViewCallbacks.onStartGuidance
    ) {
      this.props.navigationViewCallbacks.onStartGuidance();
    }
  };

  /**
   * Callback function when the remaining time or distance changes.
   */
  onRemainingTimeOrDistanceChanged = () => {
    if (
      this.props.navigationViewCallbacks != null &&
      this.props.navigationViewCallbacks.onRemainingTimeOrDistanceChanged
    ) {
      this.props.navigationViewCallbacks.onRemainingTimeOrDistanceChanged();
    }
  };

  /**
   * Callback function invoked when the location is changed.
   *
   * @param args - The arguments received upon location change. The
   *               type and structure of `args` should be documented
   *               based on the actual usage and data expected.
   */
  onLocationChanged = (location: Location) => {
    if (
      this.props.navigationViewCallbacks != null &&
      this.props.navigationViewCallbacks.onLocationChanged
    ) {
      this.props.navigationViewCallbacks.onLocationChanged(location);
    }
  };

  /**
   * Handles changes to raw location data and triggers a callback with the
   * changed data.
   *
   * @param location - An object containing the raw location data that has changed.
   */
  onRawLocationChanged = (location: Location) => {
    if (
      this.props.navigationViewCallbacks != null &&
      this.props.navigationViewCallbacks.onRawLocationChanged
    ) {
      this.props.navigationViewCallbacks.onRawLocationChanged(location);
    }
  };

  /**
   * MapView proxy methods
   */

  /**
   * Callback invoked when clicking a marker on the map.
   */
  onMarkerClick = (marker: Marker) => {
    if (
      this.props.mapViewCallbacks != null &&
      this.props.mapViewCallbacks.onMarkerClick
    ) {
      this.props.mapViewCallbacks.onMarkerClick(marker);
    }
  };

  /**
   * Callback invoked when clicking a polyline on the map.
   */
  onPolylineClick = (polyline: Polyline) => {
    if (
      this.props.mapViewCallbacks != null &&
      this.props.mapViewCallbacks.onPolylineClick
    ) {
      this.props.mapViewCallbacks.onPolylineClick(polyline);
    }
  };

  /**
   * Callback invoked when clicking a polygon on the map.
   */
  onPolygonClick = (polygon: Polygon) => {
    if (
      this.props.mapViewCallbacks != null &&
      this.props.mapViewCallbacks.onPolygonClick
    ) {
      this.props.mapViewCallbacks.onPolygonClick(polygon);
    }
  };

  /**
   * Callback invoked when clicking a circle on the map.
   */
  onCircleClick = (circle: Circle) => {
    if (
      this.props.mapViewCallbacks != null &&
      this.props.mapViewCallbacks.onCircleClick
    ) {
      this.props.mapViewCallbacks.onCircleClick(circle);
    }
  };

  logDebugInfo = (message: string) => {
    if (
      this.props.navigationViewCallbacks != null &&
      this.props.navigationViewCallbacks.logDebugInfo != null) {
      this.props.navigationViewCallbacks.logDebugInfo(message);
    }
  };

  /**
   * Callback invoked when tapping on marker's info window.
   * @platform Android only
   */
  onMarkerInfoWindowTapped = (marker: Marker) => {
    if (
      this.props.mapViewCallbacks != null &&
      this.props.mapViewCallbacks.onMarkerInfoWindowTapped
    ) {
      this.props.mapViewCallbacks.onMarkerInfoWindowTapped(marker);
    }
  };

  private registerNavModuleListener = () => {
    const NavModuleEvt = new NativeEventEmitter(
      NativeModules.CustomEventDispatcher,
    );

    NavModuleEvt.addListener('onRouteChanged', this.onRouteChanged);
    NavModuleEvt.addListener(
      'onRemainingTimeOrDistanceChanged',
      this.onRemainingTimeOrDistanceChanged,
    );
    NavModuleEvt.addListener('onTrafficUpdated', this.onTrafficUpdated);
    NavModuleEvt.addListener('onArrival', this.onArrival);
    NavModuleEvt.addListener('onNavigationReady', this.onNavigationReady);
    NavModuleEvt.addListener('onStartGuidance', this.onStartGuidance);
    NavModuleEvt.addListener(
      'onRecenterButtonClick',
      this.onRecenterButtonClick,
    );
    NavModuleEvt.addListener('onRouteStatusResult', this.onRouteStatusResult);
    NavModuleEvt.addListener('onMapReady', this.onMapReady);
    NavModuleEvt.addListener(
      'onReroutingRequestedByOffRoute',
      this.onReroutingRequestedByOffRoute,
    );
    NavModuleEvt.addListener('onLocationChanged', this.onLocationChanged);
    NavModuleEvt.addListener(
      'onNavigationInitError',
      this.onNavigationInitError,
    );

    NavModuleEvt.addListener(
      'onMarkerInfoWindowTapped',
      this.onMarkerInfoWindowTapped,
    );
    NavModuleEvt.addListener('onMarkerClick', this.onMarkerClick);
    NavModuleEvt.addListener('onPolylineClick', this.onPolylineClick);
    NavModuleEvt.addListener('onPolygonClick', this.onPolygonClick);
    NavModuleEvt.addListener('onCircleClick', this.onCircleClick);
    NavModuleEvt.addListener('logDebugInfo', this.logDebugInfo);
  };

  /**
   * Destroy the fragment if user presses the back button.
   */
  deleteFragment = () => {
    sendCommand(this.viewId, commands.deleteFragment);
  };

  override componentDidMount() {
    NavHelper.initCallback(this);
    this.viewId = findNodeHandle(this.mapViewRef) || 0;

    if (Platform.OS == 'ios') {
      this.registerNavModuleListener();
    }

    const args =
      Platform.OS == 'android'
        ? [
            PixelRatio.getPixelSizeForLayoutSize(this.props.height),
            PixelRatio.getPixelSizeForLayoutSize(this.props.width),
            this.props.androidStylingOptions || {},
            this.props.termsAndConditionsDialogOptions || {},
          ]
        : [
            this.props.height,
            this.props.width,
            this.props.iOSStylingOptions || {},
            this.props.termsAndConditionsDialogOptions || {},
          ];

    setTimeout(() => {
      sendCommand(this.viewId, commands.createFragment, args);
    });

    this.props.onNavigationViewControllerCreated(
      getNavigationViewController(this.viewId),
    );
    this.props.onMapViewControllerCreated(getMapViewController(this.viewId));
  }

  override componentWillUnmount() {
    this.deleteFragment();
  }

  onRefAssign = (ref: any) => {
    this.mapViewRef = ref;
  };

  override render() {
    return <NavViewManager ref={this.onRefAssign}></NavViewManager>;
  }
}
