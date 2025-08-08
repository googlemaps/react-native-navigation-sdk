/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View, findNodeHandle } from 'react-native';
import {
  NavViewManager,
  sendCommand,
  commands,
  type LatLng,
} from '../../shared';
import { getNavigationViewController } from './navigationViewController';
import type { NavigationViewProps } from './types';
import {
  getMapViewController,
  FragmentType,
  type Circle,
  type GroundOverlay,
  type Marker,
  type Polygon,
  type Polyline,
} from '../../maps';

export const NavigationView = (props: NavigationViewProps) => {
  const mapViewRef = useRef<any>(null);
  const [viewId, setViewId] = useState<number | null>(null);

  const {
    androidStylingOptions,
    iOSStylingOptions,
    onNavigationViewControllerCreated,
    onMapViewControllerCreated,
  } = props;

  /**
   * @param {any} _ref - The reference to the NavViewManager component.
   */
  const onRefAssign = (_ref: any) => {
    if (mapViewRef.current !== _ref) {
      mapViewRef.current = _ref;
    }
  };

  useEffect(() => {
    if (!mapViewRef.current) {
      return;
    }
    const _viewId = findNodeHandle(mapViewRef.current) || 0;
    if (viewId !== _viewId) {
      setViewId(_viewId);

      const stylingOptions =
        (Platform.OS === 'android'
          ? androidStylingOptions
          : iOSStylingOptions) || {};

      const args = [stylingOptions, FragmentType.NAVIGATION];

      setTimeout(() => {
        sendCommand(_viewId, commands.createFragment, args);
      });

      onNavigationViewControllerCreated(getNavigationViewController(_viewId));
      onMapViewControllerCreated(getMapViewController(_viewId));
    }
  }, [
    androidStylingOptions,
    iOSStylingOptions,
    onMapViewControllerCreated,
    onNavigationViewControllerCreated,
    viewId,
  ]);

  const onMapClick = useCallback(
    ({ nativeEvent: latlng }: { nativeEvent: LatLng }) => {
      props.mapViewCallbacks?.onMapClick?.(latlng);
    },
    [props.mapViewCallbacks]
  );

  const onMapReady = useCallback(() => {
    props.mapViewCallbacks?.onMapReady?.();
  }, [props.mapViewCallbacks]);

  const onMarkerClick = useCallback(
    ({ nativeEvent: marker }: { nativeEvent: Marker }) => {
      props.mapViewCallbacks?.onMarkerClick?.(marker);
    },
    [props.mapViewCallbacks]
  );

  const onPolylineClick = useCallback(
    ({ nativeEvent: polyline }: { nativeEvent: Polyline }) => {
      props.mapViewCallbacks?.onPolylineClick?.(polyline);
    },
    [props.mapViewCallbacks]
  );

  const onPolygonClick = useCallback(
    ({ nativeEvent: polygon }: { nativeEvent: Polygon }) => {
      props.mapViewCallbacks?.onPolygonClick?.(polygon);
    },
    [props.mapViewCallbacks]
  );

  const onCircleClick = useCallback(
    ({ nativeEvent: circle }: { nativeEvent: Circle }) => {
      props.mapViewCallbacks?.onCircleClick?.(circle);
    },
    [props.mapViewCallbacks]
  );

  const onGroundOverlayClick = useCallback(
    ({ nativeEvent: groundOverlay }: { nativeEvent: GroundOverlay }) => {
      props.mapViewCallbacks?.onGroundOverlayClick?.(groundOverlay);
    },
    [props.mapViewCallbacks]
  );

  const onMarkerInfoWindowTapped = useCallback(
    ({ nativeEvent: marker }: { nativeEvent: Marker }) => {
      props.mapViewCallbacks?.onMarkerInfoWindowTapped?.(marker);
    },
    [props.mapViewCallbacks]
  );

  const onRecenterButtonClick = useCallback(() => {
    props.navigationViewCallbacks?.onRecenterButtonClick?.();
  }, [props.navigationViewCallbacks]);

  const onPromptVisibilityChanged = useCallback(
    ({ nativeEvent: event }: { nativeEvent: { visible: boolean } }) => {
      props.navigationViewCallbacks?.onPromptVisibilityChanged?.(event.visible);
    },
    [props.navigationViewCallbacks]
  );

  return (
    <View style={props.style ?? styles.defaultStyle}>
      <NavViewManager
        ref={onRefAssign}
        flex={1}
        onMapClick={onMapClick}
        onMapReady={onMapReady}
        onMarkerClick={onMarkerClick}
        onPolylineClick={onPolylineClick}
        onPolygonClick={onPolygonClick}
        onCircleClick={onCircleClick}
        onGroundOverlayClick={onGroundOverlayClick}
        onMarkerInfoWindowTapped={onMarkerInfoWindowTapped}
        onRecenterButtonClick={onRecenterButtonClick}
        onPromptVisibilityChanged={onPromptVisibilityChanged}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  defaultStyle: {
    flex: 1,
  },
});

export default NavigationView;
