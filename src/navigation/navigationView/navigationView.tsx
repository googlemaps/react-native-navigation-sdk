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
  type GroundOverlay,
} from '../../maps';
import {
  type LatLng,
  sendCommand,
  commands,
  NavViewManager,
} from '../../shared';
import AndroidNavViewHelper from './androidNavViewHelper';
import { getNavigationViewController } from './navigationViewController';
import type { NavigationViewProps } from './types';

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
      onRecenterButtonClick: this.onRecenterButtonClick,
      onMapReady: this.onMapReady,
      onMapClick: this.onMapClick,
      onMarkerInfoWindowTapped: this.onMarkerInfoWindowTapped,
      onMarkerClick: this.onMarkerClick,
      onPolylineClick: this.onPolylineClick,
      onPolygonClick: this.onPolygonClick,
      onCircleClick: this.onCircleClick,
      onGroundOverlayClick: this.onGroundOverlayClick,
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
   * @param {Circle} circle - The cicle object that was clicked.
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
   * Callback invoked when clicking a ground overlay on the map.
   *
   * @param {GroundOverlay} overlay - The ground overlay object that was clicked.
   */
  onGroundOverlayClick = (overlay: GroundOverlay) => {
    if (
      this.props.mapViewCallbacks != null &&
      this.props.mapViewCallbacks.onGroundOverlayClick
    ) {
      this.props.mapViewCallbacks.onGroundOverlayClick(overlay);
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
      NativeModules.NavViewEventDispatcher
    );

    for (const eventName of Object.keys(this.nativeEventsToCallbackMap)) {
      eventEmitter.removeAllListeners(eventName);
    }
  };

  private registerNavModuleListener = () => {
    const eventEmitter = new NativeEventEmitter(
      NativeModules.NavViewEventDispatcher
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
    this.viewId = findNodeHandle(this.mapViewRef) || 0;

    if (Platform.OS === 'android') {
      AndroidNavViewHelper.initCallback(this);
    } else if (Platform.OS === 'ios') {
      this.unregisterNavModuleListeners();
      this.registerNavModuleListener();
    }

    const args =
      Platform.OS === 'android'
        ? [
            PixelRatio.getPixelSizeForLayoutSize(this.props.height),
            PixelRatio.getPixelSizeForLayoutSize(this.props.width),
            this.props.androidStylingOptions || {},
          ]
        : [
            this.props.height,
            this.props.width,
            this.props.iOSStylingOptions || {},
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
