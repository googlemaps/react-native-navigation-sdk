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
import { StyleSheet, View, findNodeHandle } from 'react-native';
import { NavViewManager, type LatLng } from '../../shared';
import {
  MapColorScheme,
  getMapViewController,
  MapViewType,
  type Circle,
  type GroundOverlay,
  type MapViewProps,
  type Marker,
  type Polygon,
  type Polyline,
} from '..';

export const MapView = (props: MapViewProps): React.JSX.Element => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapViewRef = useRef<any>(null);
  const [viewId, setViewId] = useState<number | null>(null);

  const { onMapViewControllerCreated } = props;

  /**
   * @param ref - The reference to the NavViewManager component.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onRefAssign = (ref: any): void => {
    if (mapViewRef.current !== ref) {
      mapViewRef.current = ref;
    }
  };

  // Create controller when viewId changes
  useEffect(() => {
    if (!mapViewRef.current) {
      return;
    }
    const _viewId = findNodeHandle(mapViewRef.current) || 0;
    if (viewId !== _viewId) {
      setViewId(_viewId);
      onMapViewControllerCreated(getMapViewController(mapViewRef));
    }
  }, [onMapViewControllerCreated, viewId]);

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

  return (
    <View style={props.style ?? styles.defaultStyle}>
      <NavViewManager
        ref={onRefAssign}
        flex={1}
        mapOptions={{
          mapViewType: MapViewType.MAP,
          mapId: props.mapId,
          mapColorScheme: props.mapColorScheme ?? MapColorScheme.FOLLOW_SYSTEM,
        }}
        onMapClick={onMapClick}
        onMapReady={onMapReady}
        onMarkerClick={onMarkerClick}
        onPolylineClick={onPolylineClick}
        onPolygonClick={onPolygonClick}
        onCircleClick={onCircleClick}
        onGroundOverlayClick={onGroundOverlayClick}
        onMarkerInfoWindowTapped={onMarkerInfoWindowTapped}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  defaultStyle: {
    flex: 1,
  },
});

export default MapView;
