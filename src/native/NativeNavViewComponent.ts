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

import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

import type {
  DirectEventHandler,
  Float,
  Int32,
  UnsafeMixed,
  WithDefault,
} from 'react-native/Libraries/Types/CodegenTypes';

export interface AndroidNavigationViewStylingOptionsProp {
  primaryDayModeThemeColor?: string;
  secondaryDayModeThemeColor?: string;
  primaryNightModeThemeColor?: string;
  secondaryNightModeThemeColor?: string;
  headerLargeManeuverIconColor?: string;
  headerSmallManeuverIconColor?: string;
  headerNextStepTextColor?: string;
  headerNextStepTextSize?: string;
  headerDistanceValueTextColor?: string;
  headerDistanceUnitsTextColor?: string;
  headerDistanceValueTextSize?: string;
  headerDistanceUnitsTextSize?: string;
  headerInstructionsTextColor?: string;
  headerInstructionsFirstRowTextSize?: string;
  headerInstructionsSecondRowTextSize?: string;
  headerGuidanceRecommendedLaneColor?: string;
}

export interface iOSNavigationViewStylingOptionsProp {
  navigationHeaderPrimaryBackgroundColor?: string;
  navigationHeaderSecondaryBackgroundColor?: string;
  navigationHeaderPrimaryBackgroundColorNightMode?: string;
  navigationHeaderSecondaryBackgroundColorNightMode?: string;
  navigationHeaderLargeManeuverIconColor?: string;
  navigationHeaderSmallManeuverIconColor?: string;
  navigationHeaderGuidanceRecommendedLaneColor?: string;
  navigationHeaderNextStepTextColor?: string;
  navigationHeaderDistanceValueTextColor?: string;
  navigationHeaderDistanceUnitsTextColor?: string;
  navigationHeaderInstructionsTextColor?: string;
}

export interface NativeNavViewProps extends ViewProps {
  viewType: Int32;
  nativeID: string;
  mapId?: WithDefault<string, null>;
  mapType?: WithDefault<Int32, 1>; // Defaults to MapType.NORMAL
  mapPadding?: Readonly<{
    top?: Int32;
    left?: Int32;
    bottom?: Int32;
    right?: Int32;
  }> | null;
  navigationUIEnabled?: WithDefault<boolean, null>;
  tripProgressBarEnabled?: WithDefault<boolean, false>;
  trafficIncidentsCardEnabled?: WithDefault<boolean, true>;
  headerEnabled?: WithDefault<boolean, true>;
  footerEnabled?: WithDefault<boolean, true>;
  speedometerEnabled?: WithDefault<boolean, true>;
  speedLimitIconEnabled?: WithDefault<boolean, true>;
  recenterButtonEnabled?: WithDefault<boolean, true>;
  navigationViewStylingOptions?: UnsafeMixed;
  nightMode?: WithDefault<Int32, 0>;
  followingPerspective?: WithDefault<Int32, null>;
  mapStyle?: string;
  mapToolbarEnabled?: WithDefault<boolean, true>;
  indoorEnabled?: WithDefault<boolean, true>;
  trafficEnabled?: WithDefault<boolean, false>;
  compassEnabled?: WithDefault<boolean, true>;
  myLocationButtonEnabled?: WithDefault<boolean, true>;
  myLocationEnabled?: WithDefault<boolean, false>;
  rotateGesturesEnabled?: WithDefault<boolean, true>;
  scrollGesturesEnabled?: WithDefault<boolean, true>;
  scrollGesturesEnabledDuringRotateOrZoom?: WithDefault<boolean, true>;
  tiltGesturesEnabled?: WithDefault<boolean, true>;
  zoomControlsEnabled?: WithDefault<boolean, true>;
  zoomGesturesEnabled?: WithDefault<boolean, true>;
  buildingsEnabled?: WithDefault<boolean, true>;
  reportIncidentButtonEnabled?: WithDefault<boolean, true>;
  minZoomLevel?: WithDefault<Float, null>;
  maxZoomLevel?: WithDefault<Float, null>;
  initialCameraPosition?: Readonly<{
    target: Readonly<{
      lat?: WithDefault<Float, null>;
      lng?: WithDefault<Float, null>;
    }> | null;
    bearing?: WithDefault<Float, null>;
    tilt?: WithDefault<Float, null>;
    zoom?: WithDefault<Float, null>;
  }> | null;
  onMapReady?: DirectEventHandler<null>;
  onMapClick?: DirectEventHandler<{ lat: Float; lng: Float }>;
  onMarkerClick?: DirectEventHandler<{
    position: { lat: Float; lng: Float };
    id: string;
    title?: string;
    alpha?: Float;
    rotation?: Float;
    snippet?: string;
    zIndex?: Int32;
  }>;
  onPolylineClick?: DirectEventHandler<{
    points: { lat: Float; lng: Float }[];
    id: string;
    color?: string;
    width?: Float;
    jointType?: Int32;
    zIndex?: Int32;
  }>;
  onPolygonClick?: DirectEventHandler<{
    points: { lat: Float; lng: Float }[];
    holes: { lat: Float; lng: Float }[][];
    id: string;
    fillColor?: string;
    strokeWidth?: Float;
    strokeColor?: string;
    strokeJointType?: Int32;
    zIndex?: Int32;
    geodesic?: boolean;
  }>;
  onCircleClick?: DirectEventHandler<{
    center: { lat: Float; lng: Float };
    id: string;
    fillColor?: string;
    strokeWidth?: Float;
    strokeColor?: string;
    radius?: Float;
    zIndex?: Int32;
  }>;
  onGroundOverlayClick?: DirectEventHandler<{
    id: string;
  }>;
  onMarkerInfoWindowTapped?: DirectEventHandler<{
    position: { lat: Float; lng: Float };
    id: string;
    title?: string;
    alpha?: Float;
    rotation?: Float;
    snippet?: string;
    zIndex?: Int32;
  }>;
  onRecenterButtonClick?: DirectEventHandler<null>;
  onPromptVisibilityChanged?: DirectEventHandler<{ visible: boolean }>;
}

export type NativeNavViewType = HostComponent<NativeNavViewProps>;

export default codegenNativeComponent<NativeNavViewProps>(
  'NavView'
) as NativeNavViewType;
