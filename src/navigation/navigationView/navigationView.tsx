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
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
 * @param {NavigationViewProps} props
 * @return {NavigationView}
 */
export const NavigationView = (props: NavigationViewProps) => {
  const viewId = useRef<number>(-1);
  const mapViewRef = useRef<any>({});
  const [, setOrientation] = useState<string>(() => {
    const dim = Dimensions.get('screen');
    return dim.height >= dim.width ? 'portrait' : 'landscape';
  });
  const ref = useRef<any>(null);

  const isPortrait = () => {
    const dim = Dimensions.get('screen');
    return dim.height >= dim.width;
  };

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(isPortrait() ? 'portrait' : 'landscape');
    };
    Dimensions.addEventListener('change', handleOrientationChange);
  }, []);

  /**
   * Callback function invoked when GoogleMap is ready.
   */
  const onMapReady = useMemo(
    () => () => {
      if (props.mapViewCallbacks != null && props.mapViewCallbacks.onMapReady) {
        props.mapViewCallbacks.onMapReady();
      }
    },
    [props.mapViewCallbacks]
  );

  /**
   * Event handler for map click events.
   * @param {LatLng} latLng - The latitude and longitude of the click event.
   */
  const onMapClick = useMemo(
    () => (latLng: LatLng) => {
      if (props.mapViewCallbacks != null && props.mapViewCallbacks.onMapClick) {
        props.mapViewCallbacks.onMapClick(latLng);
      }
    },
    [props.mapViewCallbacks]
  );

  /**
   * Callback function invoked when the re-center button is clicked.
   */
  const onRecenterButtonClick = useMemo(
    () => () => {
      if (
        props.navigationViewCallbacks != null &&
        props.navigationViewCallbacks.onRecenterButtonClick
      ) {
        props.navigationViewCallbacks.onRecenterButtonClick();
      }
    },
    [props.navigationViewCallbacks]
  );

  /**
   * MapView proxy methods
   */

  /**
   * Callback invoked when clicking a marker on the map.
   *
   * @param {Marker} marker - The marker object that was clicked.
   */
  const onMarkerClick = useMemo(
    () => (marker: Marker) => {
      if (
        props.mapViewCallbacks != null &&
        props.mapViewCallbacks.onMarkerClick
      ) {
        props.mapViewCallbacks.onMarkerClick(marker);
      }
    },
    [props.mapViewCallbacks]
  );

  /**
   * Callback invoked when clicking a polyline on the map.
   *
   * @param {Polyline} polyline - The polyline object that was clicked.
   */
  const onPolylineClick = useMemo(
    () => (polyline: Polyline) => {
      if (
        props.mapViewCallbacks != null &&
        props.mapViewCallbacks.onPolylineClick
      ) {
        props.mapViewCallbacks.onPolylineClick(polyline);
      }
    },
    [props.mapViewCallbacks]
  );

  /**
   * Callback invoked when clicking a polygon on the map.
   *
   * @param {Polygon} polygon - The polygon object that was clicked.
   */
  const onPolygonClick = useMemo(
    () => (polygon: Polygon) => {
      if (
        props.mapViewCallbacks != null &&
        props.mapViewCallbacks.onPolygonClick
      ) {
        props.mapViewCallbacks.onPolygonClick(polygon);
      }
    },
    [props.mapViewCallbacks]
  );

  /**
   * Callback invoked when clicking a circle on the map.
   *
   * @param {Circle} circle - The cicle object that was clicked.
   */
  const onCircleClick = useMemo(
    () => (circle: Circle) => {
      if (
        props.mapViewCallbacks != null &&
        props.mapViewCallbacks.onCircleClick
      ) {
        props.mapViewCallbacks.onCircleClick(circle);
      }
    },
    [props.mapViewCallbacks]
  );

  /**
   * Callback invoked when clicking a ground overlay on the map.
   *
   * @param {GroundOverlay} overlay - The ground overlay object that was clicked.
   */
  const onGroundOverlayClick = useMemo(
    () => (overlay: GroundOverlay) => {
      if (
        props.mapViewCallbacks != null &&
        props.mapViewCallbacks.onGroundOverlayClick
      ) {
        props.mapViewCallbacks.onGroundOverlayClick(overlay);
      }
    },
    [props.mapViewCallbacks]
  );

  /**
   * Callback invoked when tapping on marker's info window.
   * @platform Android only
   *
   * @param {Marker} marker - The marker object that info window was tapped.
   */
  const onMarkerInfoWindowTapped = useMemo(
    () => (marker: Marker) => {
      if (
        props.mapViewCallbacks != null &&
        props.mapViewCallbacks.onMarkerInfoWindowTapped
      ) {
        props.mapViewCallbacks.onMarkerInfoWindowTapped(marker);
      }
    },
    [props.mapViewCallbacks]
  );

  const nativeEventsToCallbackMap: { [key: string]: (event: any) => void } =
    useMemo(
      () => ({
        onRecenterButtonClick: onRecenterButtonClick,
        onMapReady: onMapReady,
        onMapClick: onMapClick,
        onMarkerInfoWindowTapped: onMarkerInfoWindowTapped,
        onMarkerClick: onMarkerClick,
        onPolylineClick: onPolylineClick,
        onPolygonClick: onPolygonClick,
        onCircleClick: onCircleClick,
        onGroundOverlayClick: onGroundOverlayClick,
      }),
      [
        onCircleClick,
        onGroundOverlayClick,
        onMapClick,
        onMapReady,
        onMarkerClick,
        onMarkerInfoWindowTapped,
        onPolygonClick,
        onPolylineClick,
        onRecenterButtonClick,
      ]
    );

  const _unregisterNavModuleListeners = useCallback(() => {
    const eventEmitter = new NativeEventEmitter(
      NativeModules.NavViewEventDispatcher
    );

    for (const eventName of Object.keys(nativeEventsToCallbackMap)) {
      eventEmitter.removeAllListeners(eventName);
    }
  }, [nativeEventsToCallbackMap]);

  const _registerNavModuleListener = useCallback(() => {
    const eventEmitter = new NativeEventEmitter(
      NativeModules.NavViewEventDispatcher
    );

    for (const eventName of Object.keys(nativeEventsToCallbackMap)) {
      const listener = nativeEventsToCallbackMap[eventName];
      if (listener !== undefined) {
        eventEmitter.addListener(eventName, listener);
      }
    }
  }, [nativeEventsToCallbackMap]);

  /**
   * Destroy the fragment if user presses the back button.
   */
  const deleteFragment = () => {
    sendCommand(viewId.current, commands.deleteFragment);
  };

  /**
   * @param {any} _ref - The reference to the NavViewManager component.
   */
  const onRefAssign = (_ref: any) => {
    mapViewRef.current = _ref;
  };

  /**
   * Called immediately after a component is mounted.
   */
  useEffect(() => {
    ref.current = nativeEventsToCallbackMap;
    const _viewId = findNodeHandle(mapViewRef.current) || 0;
    viewId.current = _viewId;

    if (Platform.OS === 'android') {
      AndroidNavViewHelper.initCallback(ref.current);
    } else if (Platform.OS === 'ios') {
      _unregisterNavModuleListeners();
      _registerNavModuleListener();
    }

    const args =
      Platform.OS === 'android'
        ? [
            PixelRatio.getPixelSizeForLayoutSize(props.height),
            PixelRatio.getPixelSizeForLayoutSize(props.width),
            props.androidStylingOptions || {},
          ]
        : [props.height, props.width, props.iOSStylingOptions || {}];

    setTimeout(() => {
      sendCommand(_viewId, commands.createFragment, args);
    });

    props.onNavigationViewControllerCreated(
      getNavigationViewController(_viewId)
    );
    props.onMapViewControllerCreated(getMapViewController(_viewId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    /**
     * Called immediately before a component is destroyed.
     */
    return () => {
      _unregisterNavModuleListeners();
      deleteFragment();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Renders the component.
   *
   * @return {Element}
   *    Returns the NavViewManager HostComponent.
   */
  return <NavViewManager ref={onRefAssign} />;
};

export default NavigationView;
