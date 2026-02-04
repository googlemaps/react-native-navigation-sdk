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

import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
} from 'react';
import { Platform, StyleSheet } from 'react-native';
import {
  getUniqueMapViewId,
  useNativeEventCallback,
  processColorValue,
} from '../../shared';
import { getNavigationViewController } from './navigationViewController';
import {
  NavigationNightMode,
  NavigationUIEnabledPreference,
  type NavigationViewProps,
} from './types';
import { MapColorScheme, getMapViewController, MapViewType } from '../../maps';
import NavView from '../../native/NativeNavViewComponent';

export const NavigationView = (
  props: NavigationViewProps
): React.JSX.Element => {
  const viewCreatedRef = useRef<boolean>(false);
  const nativeIDRef = useRef<string>(getUniqueMapViewId());
  const mapViewRef = useRef(null);

  const {
    onMapViewControllerCreated,
    androidStylingOptions,
    iOSStylingOptions,
    onNavigationViewControllerCreated,
  } = props;

  // Convert styling options colors from ColorValue to color integers
  const convertedAndroidStyling = useMemo(() => {
    if (!androidStylingOptions) return undefined;
    return {
      primaryDayModeThemeColor:
        processColorValue(androidStylingOptions.primaryDayModeThemeColor) ??
        undefined,
      secondaryDayModeThemeColor:
        processColorValue(androidStylingOptions.secondaryDayModeThemeColor) ??
        undefined,
      primaryNightModeThemeColor:
        processColorValue(androidStylingOptions.primaryNightModeThemeColor) ??
        undefined,
      secondaryNightModeThemeColor:
        processColorValue(androidStylingOptions.secondaryNightModeThemeColor) ??
        undefined,
      headerLargeManeuverIconColor:
        processColorValue(androidStylingOptions.headerLargeManeuverIconColor) ??
        undefined,
      headerSmallManeuverIconColor:
        processColorValue(androidStylingOptions.headerSmallManeuverIconColor) ??
        undefined,
      headerNextStepTextColor:
        processColorValue(androidStylingOptions.headerNextStepTextColor) ??
        undefined,
      headerNextStepTextSize: androidStylingOptions.headerNextStepTextSize,
      headerDistanceValueTextColor:
        processColorValue(androidStylingOptions.headerDistanceValueTextColor) ??
        undefined,
      headerDistanceUnitsTextColor:
        processColorValue(androidStylingOptions.headerDistanceUnitsTextColor) ??
        undefined,
      headerDistanceValueTextSize:
        androidStylingOptions.headerDistanceValueTextSize,
      headerDistanceUnitsTextSize:
        androidStylingOptions.headerDistanceUnitsTextSize,
      headerInstructionsTextColor:
        processColorValue(androidStylingOptions.headerInstructionsTextColor) ??
        undefined,
      headerInstructionsFirstRowTextSize:
        androidStylingOptions.headerInstructionsFirstRowTextSize,
      headerInstructionsSecondRowTextSize:
        androidStylingOptions.headerInstructionsSecondRowTextSize,
      headerGuidanceRecommendedLaneColor:
        processColorValue(
          androidStylingOptions.headerGuidanceRecommendedLaneColor
        ) ?? undefined,
    };
  }, [androidStylingOptions]);

  const convertedIOSStyling = useMemo(() => {
    if (!iOSStylingOptions) return undefined;
    return {
      navigationHeaderPrimaryBackgroundColor:
        processColorValue(
          iOSStylingOptions.navigationHeaderPrimaryBackgroundColor
        ) ?? undefined,
      navigationHeaderSecondaryBackgroundColor:
        processColorValue(
          iOSStylingOptions.navigationHeaderSecondaryBackgroundColor
        ) ?? undefined,
      navigationHeaderPrimaryBackgroundColorNightMode:
        processColorValue(
          iOSStylingOptions.navigationHeaderPrimaryBackgroundColorNightMode
        ) ?? undefined,
      navigationHeaderSecondaryBackgroundColorNightMode:
        processColorValue(
          iOSStylingOptions.navigationHeaderSecondaryBackgroundColorNightMode
        ) ?? undefined,
      navigationHeaderLargeManeuverIconColor:
        processColorValue(
          iOSStylingOptions.navigationHeaderLargeManeuverIconColor
        ) ?? undefined,
      navigationHeaderSmallManeuverIconColor:
        processColorValue(
          iOSStylingOptions.navigationHeaderSmallManeuverIconColor
        ) ?? undefined,
      navigationHeaderGuidanceRecommendedLaneColor:
        processColorValue(
          iOSStylingOptions.navigationHeaderGuidanceRecommendedLaneColor
        ) ?? undefined,
      navigationHeaderNextStepTextColor:
        processColorValue(
          iOSStylingOptions.navigationHeaderNextStepTextColor
        ) ?? undefined,
      navigationHeaderDistanceValueTextColor:
        processColorValue(
          iOSStylingOptions.navigationHeaderDistanceValueTextColor
        ) ?? undefined,
      navigationHeaderDistanceUnitsTextColor:
        processColorValue(
          iOSStylingOptions.navigationHeaderDistanceUnitsTextColor
        ) ?? undefined,
      navigationHeaderInstructionsTextColor:
        processColorValue(
          iOSStylingOptions.navigationHeaderInstructionsTextColor
        ) ?? undefined,
    };
  }, [iOSStylingOptions]);

  // Initialize params once using lazy state initialization
  const [viewInitializationParams] = useState(() => {
    const hasInitialCamera = !!props.initialCameraPosition;
    const hasTarget = hasInitialCamera && !!props.initialCameraPosition?.target;

    return {
      viewType: MapViewType.NAVIGATION,
      mapId: props.mapId,
      mapType: props.mapType,
      navigationUIEnabledPreference:
        props.navigationUIEnabledPreference ??
        NavigationUIEnabledPreference.AUTOMATIC,
      mapColorScheme: props.mapColorScheme ?? MapColorScheme.FOLLOW_SYSTEM,
      navigationNightMode:
        props.navigationNightMode ?? NavigationNightMode.AUTO,
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

    // Initialize controllers with nativeID
    onNavigationViewControllerCreated?.(
      getNavigationViewController(nativeIDRef.current)
    );
    onMapViewControllerCreated?.(getMapViewController(nativeIDRef.current));
  }, [
    onMapViewControllerCreated,
    onNavigationViewControllerCreated,
    mapViewRef,
  ]);

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
  const onRecenterButtonClick = useNativeEventCallback(
    props.onRecenterButtonClick
  );

  // Extract the visible field of the onPromptVisibilityChanged event.
  const { onPromptVisibilityChanged: onPromptVisibilityChangedProp } = props;
  const onPromptVisibilityChanged = useCallback(
    (event: { nativeEvent: { visible: boolean } }) => {
      onPromptVisibilityChangedProp?.(event.nativeEvent.visible);
    },
    [onPromptVisibilityChangedProp]
  );

  return (
    <NavView
      style={props.style ?? styles.defaultStyle}
      nativeID={nativeIDRef.current}
      ref={mapViewRef}
      viewInitializationParams={viewInitializationParams}
      mapType={props.mapType}
      mapColorScheme={props.mapColorScheme ?? MapColorScheme.FOLLOW_SYSTEM}
      navigationNightMode={
        props.navigationNightMode ?? NavigationNightMode.AUTO
      }
      mapPadding={props.mapPadding}
      tripProgressBarEnabled={props.tripProgressBarEnabled}
      trafficPromptsEnabled={props.trafficPromptsEnabled}
      trafficIncidentCardsEnabled={props.trafficIncidentCardsEnabled}
      headerEnabled={props.headerEnabled}
      footerEnabled={props.footerEnabled}
      speedometerEnabled={props.speedometerEnabled}
      speedLimitIconEnabled={props.speedLimitIconEnabled}
      recenterButtonEnabled={props.recenterButtonEnabled}
      navigationViewStylingOptions={
        Platform.OS === 'android'
          ? convertedAndroidStyling
          : convertedIOSStyling
      }
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
      reportIncidentButtonEnabled={props.reportIncidentButtonEnabled}
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
      onRecenterButtonClick={onRecenterButtonClick}
      onPromptVisibilityChanged={onPromptVisibilityChanged}
    />
  );
};

const styles = StyleSheet.create({
  defaultStyle: {
    flex: 1,
  },
});

export default NavigationView;
