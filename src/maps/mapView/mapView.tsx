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

import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { getMapViewController, MapViewType, type MapViewProps } from '.';
import NavView from '../../native/NativeNavViewComponent';
import { getUniqueMapViewId, useNativeEventCallback } from '../../shared';

export const MapView = (props: MapViewProps) => {
  const viewCreatedRef = useRef<boolean>(false);
  const nativeIDRef = useRef<number>(getUniqueMapViewId());
  const mapViewRef = useRef(null);

  const { onMapViewControllerCreated } = props;

  const onRefAssign = (_ref: any) => {
    if (mapViewRef.current !== _ref) {
      mapViewRef.current = _ref;
    }
  };

  useEffect(() => {
    if (!mapViewRef.current || viewCreatedRef.current) {
      return;
    }
    viewCreatedRef.current = true;

    // Initialize map view controller.
    onMapViewControllerCreated(getMapViewController(nativeIDRef.current));
  }, [onMapViewControllerCreated, mapViewRef]);

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
      nativeID={nativeIDRef.current?.toString()}
      ref={onRefAssign}
      viewType={MapViewType.MAP}
      mapId={props.mapId ?? null}
      mapType={props.mapType ?? null}
      navigationUIEnabled={false}
      mapPadding={props.mapPadding}
      onMapClick={onMapClick}
      onMapReady={onMapReady}
      onMarkerClick={onMarkerClick}
      onPolylineClick={onPolylineClick}
      onPolygonClick={onPolygonClick}
      onCircleClick={onCircleClick}
      onGroundOverlayClick={onGroundOverlayClick}
      onMarkerInfoWindowTapped={onMarkerInfoWindowTapped}
      recenterButtonEnabled={props.recenterButtonEnabled}
      nightMode={props.nightMode}
      mapStyle={props.mapStyle}
      mapToolbarEnabled={props.mapToolbarEnabled}
      indoorEnabled={props.indoorEnabled}
      trafficEnabled={props.trafficEnabled}
      compassEnabled={props.compassEnabled ?? null}
      myLocationButtonEnabled={props.myLocationButtonEnabled}
      myLocationEnabled={props.myLocationEnabled}
      rotateGesturesEnabled={props.rotateGesturesEnabled ?? null}
      scrollGesturesEnabled={props.scrollGesturesEnabled ?? null}
      scrollGesturesEnabledDuringRotateOrZoom={
        props.scrollGesturesEnabledDuringRotateOrZoom ?? null
      }
      maxZoomLevel={props.maxZoomLevel ?? null}
      minZoomLevel={props.minZoomLevel ?? null}
      tiltGesturesEnabled={props.tiltGesturesEnabled ?? null}
      zoomControlsEnabled={props.zoomControlsEnabled ?? null}
      zoomGesturesEnabled={props.zoomGesturesEnabled ?? null}
      buildingsEnabled={props.buildingsEnabled}
      initialCameraPosition={props.initialCameraPosition ?? null}
    />
  );
};

const styles = StyleSheet.create({
  defaultStyle: {
    flex: 1,
  },
});

export default MapView;
