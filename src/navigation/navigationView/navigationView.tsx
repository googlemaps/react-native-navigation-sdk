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
import { Platform, StyleSheet } from 'react-native';
import { getUniqueMapViewId, useNativeEventCallback } from '../../shared';
import { getNavigationViewController } from './navigationViewController';
import type { NavigationViewProps } from './types';
import { getMapViewController, MapViewType } from '../../maps';

import NavView from '../../native/NativeNavViewComponent';

export const NavigationView = (props: NavigationViewProps) => {
  const viewCreatedRef = useRef<boolean>(false);
  const nativeIDRef = useRef<number>(getUniqueMapViewId());
  const mapViewRef = useRef(null);

  const { onNavigationViewControllerCreated, onMapViewControllerCreated } =
    props;

  useEffect(() => {
    if (!mapViewRef.current || viewCreatedRef.current) {
      return;
    }
    viewCreatedRef.current = true;

    // Initialize controllers
    onNavigationViewControllerCreated(
      getNavigationViewController(nativeIDRef.current)
    );
    onMapViewControllerCreated(getMapViewController(nativeIDRef.current));
  }, [
    onNavigationViewControllerCreated,
    onMapViewControllerCreated,
    mapViewRef,
  ]);

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
  const onRecenterButtonClick = useNativeEventCallback(
    props.onRecenterButtonClick
  );
  const onPromptVisibilityChanged = useNativeEventCallback(
    props.onPromptVisibilityChanged
  );

  return (
    <NavView
      style={props.style ?? styles.defaultStyle}
      nativeID={nativeIDRef.current?.toString()}
      ref={mapViewRef}
      viewType={MapViewType.NAVIGATION}
      mapId={props.mapId ?? null}
      navigationViewStylingOptions={
        Platform.OS === 'android'
          ? props.androidStylingOptions
          : props.iOSStylingOptions
      }
      mapType={props.mapType ?? null}
      navigationUIEnabled={props.navigationUIEnabled}
      tripProgressBarEnabled={props.tripProgressBarEnabled}
      trafficIncidentsCardEnabled={props.trafficIncidentsCardEnabled}
      headerEnabled={props.headerEnabled}
      footerEnabled={props.footerEnabled}
      speedometerEnabled={props.speedometerEnabled}
      speedLimitIconEnabled={props.speedLimitIconEnabled}
      recenterButtonEnabled={props.recenterButtonEnabled}
      mapPadding={props.mapPadding}
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
      nightMode={props.nightMode}
      followingPerspective={props.followingPerspective}
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
      tiltGesturesEnabled={props.tiltGesturesEnabled ?? null}
      zoomControlsEnabled={props.zoomControlsEnabled ?? null}
      zoomGesturesEnabled={props.zoomGesturesEnabled ?? null}
      buildingsEnabled={props.buildingsEnabled}
      reportIncidentButtonEnabled={props.reportIncidentButtonEnabled}
      minZoomLevel={props.minZoomLevel ?? null}
      maxZoomLevel={props.maxZoomLevel ?? null}
      initialCameraPosition={props.initialCameraPosition ?? null}
    />
  );
};

const styles = StyleSheet.create({
  defaultStyle: {
    flex: 1,
  },
});

export default NavigationView;
