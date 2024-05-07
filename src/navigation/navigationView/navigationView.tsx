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
import {
  type Marker,
  type Polyline,
  type Polygon,
  type Circle,
  getMapViewController,
} from '../../maps';
import {
  type LatLng,
  type Location,
  sendCommand,
  commands,
  NavViewManager,
} from '../../shared';
import type { NavigationInitErrorCode } from '../types';
import NavHelper from './navHelper';
import { getNavigationViewController } from './navigationViewController';
import { getRouteStatusFromStringValue } from './shared';
import type { NavigationViewProps, ArrivalEvent } from './types';

/**
 * Represents a navigation view that handles map and navigation interactions within a React Native application.
 *
 * @extends React.Component
 */
export default class NavigationView extends React.Component<NavigationViewProps> {
  private viewId: number = -1;
  private mapViewRef?: any;
  private nativeEventsToCallbackMap: { [key: string]: (event: any) => void };

  /**
   * Constructs an instance of NavigationView.
   * @param {NavigationViewProps} _props - Properties passed to the component.
   */
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

    this.nativeEventsToCallbackMap = {
      onRouteChanged: this.onRouteChanged,
      onRemainingTimeOrDistanceChanged: this.onRemainingTimeOrDistanceChanged,
      onTrafficUpdated: this.onTrafficUpdated,
      onArrival: this.onArrival,
      onNavigationReady: this.onNavigationReady,
      onStartGuidance: this.onStartGuidance,
      onRecenterButtonClick: this.onRecenterButtonClick,
      onRouteStatusResult: this.onRouteStatusResult,
      onMapReady: this.onMapReady,
      onReroutingRequestedByOffRoute: this.onReroutingRequestedByOffRoute,
      onLocationChanged: this.onLocationChanged,
      onNavigationInitError: this.onNavigationInitError,
      onMarkerInfoWindowTapped: this.onMarkerInfoWindowTapped,
      onMarkerClick: this.onMarkerClick,
      onPolylineClick: this.onPolylineClick,
      onPolygonClick: this.onPolygonClick,
      onCircleClick: this.onCircleClick,
      logDebugInfo: this.logDebugInfo,
    };
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
   * Event handler for map click events.
   * @param {LatLng} latLng - The latitude and longitude of the click event.
   */
  onMapClick = (latLng: LatLng) => {
    if (
      this.props.mapViewCallbacks != null &&
      this.props.mapViewCallbacks.onMapClick
    ) {
      this.props.mapViewCallbacks.onMapClick(latLng);
    }
  };

  /**
   * A callback function that gets invoked when navigation information is ready.
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
   * @param {NavigationInitErrorCode} errorCode - Enum argument that describes the error during SDK initialization
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
   *
   * @param {ArrivalEvent} event - An object containing the arrival event data.
   */
  onArrival = (event: ArrivalEvent) => {
    if (
      this.props.navigationViewCallbacks != null &&
      this.props.navigationViewCallbacks.onArrival
    ) {
      this.props.navigationViewCallbacks.onArrival(event);
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
   * @param {string} routeStatus - String presentation of the route status.
   */
  onRouteStatusResult = (routeStatus: string) => {
    if (
      this.props.navigationViewCallbacks != null &&
      this.props.navigationViewCallbacks.onRouteStatusResult
    ) {
      this.props.navigationViewCallbacks.onRouteStatusResult(
        getRouteStatusFromStringValue(routeStatus)
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
   * @param {Location} location - The location received upon location change.
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
   * @param {Location} location - An object containing the raw location data that has changed.
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
   *
   * @param {Marker} marker - The marker object that was clicked.
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
   *
   * @param {Polyline} polyline - The polyline object that was clicked.
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
   *
   * @param {Polygon} polygon - The polygon object that was clicked.
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
   *
   * @param {Circle} circle - The polygon object that was clicked.
   */
  onCircleClick = (circle: Circle) => {
    if (
      this.props.mapViewCallbacks != null &&
      this.props.mapViewCallbacks.onCircleClick
    ) {
      this.props.mapViewCallbacks.onCircleClick(circle);
    }
  };

  /**
   * Callback invoked on debug messages.
   *
   * @param {string} message - The debug message.
   */
  logDebugInfo = (message: string) => {
    if (
      this.props.navigationViewCallbacks != null &&
      this.props.navigationViewCallbacks.logDebugInfo != null
    ) {
      this.props.navigationViewCallbacks.logDebugInfo(message);
    }
  };

  /**
   * Callback invoked when tapping on marker's info window.
   * @platform Android only
   *
   * @param {Marker} marker - The marker object that info window was tapped.
   */
  onMarkerInfoWindowTapped = (marker: Marker) => {
    if (
      this.props.mapViewCallbacks != null &&
      this.props.mapViewCallbacks.onMarkerInfoWindowTapped
    ) {
      this.props.mapViewCallbacks.onMarkerInfoWindowTapped(marker);
    }
  };

  private unregisterNavModuleListeners = () => {
    const eventEmitter = new NativeEventEmitter(
      NativeModules.CustomEventDispatcher
    );

    for (const eventName of Object.keys(this.nativeEventsToCallbackMap)) {
      eventEmitter.removeAllListeners(eventName);
    }
  };

  private registerNavModuleListener = () => {
    const eventEmitter = new NativeEventEmitter(
      NativeModules.CustomEventDispatcher
    );

    for (const eventName of Object.keys(this.nativeEventsToCallbackMap)) {
      const listener = this.nativeEventsToCallbackMap[eventName];
      if (listener !== undefined) {
        eventEmitter.addListener(eventName, listener);
      }
    }
  };

  /**
   * Destroy the fragment if user presses the back button.
   */
  deleteFragment = () => {
    sendCommand(this.viewId, commands.deleteFragment);
  };

  /**
   * Called immediately after a component is mounted.
   */
  override componentDidMount() {
    NavHelper.initCallback(this);
    this.viewId = findNodeHandle(this.mapViewRef) || 0;

    if (Platform.OS === 'ios') {
      this.unregisterNavModuleListeners();
      this.registerNavModuleListener();
    }

    const args =
      Platform.OS === 'android'
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
      getNavigationViewController(this.viewId)
    );
    this.props.onMapViewControllerCreated(getMapViewController(this.viewId));
  }

  /**
   * Called immediately before a component is destroyed.
   */
  override componentWillUnmount() {
    this.unregisterNavModuleListeners();
    this.deleteFragment();
  }

  /**
   * @param {any} ref - The reference to the NavViewManager component.
   */
  onRefAssign = (ref: any) => {
    this.mapViewRef = ref;
  };

  /**
   * Renders the component.
   *
   * @return {Element}
   *    Returns the NavViewManager HostComponent.
   */
  override render() {
    return <NavViewManager ref={this.onRefAssign} />;
  }
}
