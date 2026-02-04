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

import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { getUniqueMapViewId, useNativeEventCallback } from '../../shared';
import {
  MapColorScheme,
  getMapViewController,
  MapViewType,
  type MapViewProps,
} from '..';
import NavView from '../../native/NativeNavViewComponent';
import { NavigationUIEnabledPreference } from '../../navigation';

export const MapView = (props: MapViewProps): React.JSX.Element => {
  const viewCreatedRef = useRef<boolean>(false);
  const nativeIDRef = useRef<string>(getUniqueMapViewId());
  const mapViewRef = useRef(null);

  const { onMapViewControllerCreated } = props;

  // Initialize params once using lazy state initialization
  const [viewInitializationParams] = useState(() => {
    const hasInitialCamera = !!props.initialCameraPosition;
    const hasTarget = hasInitialCamera && !!props.initialCameraPosition?.target;

    return {
      viewType: MapViewType.MAP,
      mapId: props.mapId,
      mapType: props.mapType,
      navigationUIEnabledPreference: NavigationUIEnabledPreference.DISABLED, // navigation UI is always disabled for MapView
      mapColorScheme: props.mapColorScheme ?? MapColorScheme.FOLLOW_SYSTEM,
      navigationNightMode: 0, // Not used for MAP views
      hasCameraPosition: hasInitialCamera,
      ...(hasInitialCamera && {
        cameraPosition: {
          hasTarget,
          target: props.initialCameraPosition?.target ?? null,
          bearing: props.initialCameraPosition?.bearing ?? 0.0,
          tilt: props.initialCameraPosition?.tilt ?? 0.0,
          zoom: props.initialCameraPosition?.zoom ?? 0.0,
        },
      }),
    };
  });

  useEffect(() => {
    if (!mapViewRef.current || viewCreatedRef.current) {
      return;
    }
    viewCreatedRef.current = true;

    // Initialize map view controller with nativeID
    onMapViewControllerCreated?.(getMapViewController(nativeIDRef.current));
  }, [onMapViewControllerCreated, mapViewRef]);

  // Use the new architecture event callback hook
  const onMapClick = useNativeEventCallback(props.onMapClick);
  const onMapReady = useNativeEventCallback(props.onMapReady);
  const onMarkerClick = useNativeEventCallback(props.onMarkerClick);
  const onPolylineClick = useNativeEventCallback(props.onPolylineClick);
  const onPolygonClick = useNativeEventCallback(props.onPolygonClick);
  const onCircleClick = useNativeEventCallback(props.onCircleClick);
  const onGroundOverlayClick = useNativeEventCallback(
    props.onGroundOverlayClick
  );
  const onMarkerInfoWindowTapped = useNativeEventCallback(
    props.onMarkerInfoWindowTapped
  );

  return (
    <NavView
      style={props.style ?? styles.defaultStyle}
      nativeID={nativeIDRef.current}
      ref={mapViewRef}
      viewInitializationParams={viewInitializationParams}
      mapType={props.mapType}
      mapColorScheme={props.mapColorScheme ?? MapColorScheme.FOLLOW_SYSTEM}
      mapPadding={props.mapPadding}
      mapStyle={props.mapStyle}
      mapToolbarEnabled={props.mapToolbarEnabled}
      indoorEnabled={props.indoorEnabled}
      indoorLevelPickerEnabled={props.indoorLevelPickerEnabled}
      trafficEnabled={props.trafficEnabled}
      compassEnabled={props.compassEnabled}
      myLocationButtonEnabled={props.myLocationButtonEnabled}
      myLocationEnabled={props.myLocationEnabled}
      rotateGesturesEnabled={props.rotateGesturesEnabled}
      scrollGesturesEnabled={props.scrollGesturesEnabled}
      scrollGesturesEnabledDuringRotateOrZoom={
        props.scrollGesturesDuringRotateOrZoomEnabled
      }
      tiltGesturesEnabled={props.tiltGesturesEnabled}
      zoomControlsEnabled={props.zoomControlsEnabled}
      zoomGesturesEnabled={props.zoomGesturesEnabled}
      buildingsEnabled={props.buildingsEnabled}
      minZoomLevel={props.minZoomLevel}
      maxZoomLevel={props.maxZoomLevel}
      onMapClick={onMapClick}
      onMapReady={onMapReady}
      onMarkerClick={onMarkerClick}
      onPolylineClick={onPolylineClick}
      onPolygonClick={onPolygonClick}
      onCircleClick={onCircleClick}
      onGroundOverlayClick={onGroundOverlayClick}
      onMarkerInfoWindowTapped={onMarkerInfoWindowTapped}
    />
  );
};

const styles = StyleSheet.create({
  defaultStyle: {
    flex: 1,
  },
});

export default MapView;
