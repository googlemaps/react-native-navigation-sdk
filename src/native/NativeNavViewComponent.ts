/**
 * Copyright 2026 Google LLC
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

import type { HostComponent, ViewProps } from 'react-native';
import type {
  DirectEventHandler,
  Double,
  Float,
  Int32,
  UnsafeMixed,
  WithDefault,
} from 'react-native/Libraries/Types/CodegenTypesNamespace';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

export interface AndroidNavigationViewStylingOptionsProp {
  primaryDayModeThemeColor?: Double;
  secondaryDayModeThemeColor?: Double;
  primaryNightModeThemeColor?: Double;
  secondaryNightModeThemeColor?: Double;
  headerLargeManeuverIconColor?: Double;
  headerSmallManeuverIconColor?: Double;
  headerNextStepTextColor?: Double;
  headerNextStepTextSize?: string;
  headerDistanceValueTextColor?: Double;
  headerDistanceUnitsTextColor?: Double;
  headerDistanceValueTextSize?: string;
  headerDistanceUnitsTextSize?: string;
  headerInstructionsTextColor?: Double;
  headerInstructionsFirstRowTextSize?: string;
  headerInstructionsSecondRowTextSize?: string;
  headerGuidanceRecommendedLaneColor?: Double;
}

export interface iOSNavigationViewStylingOptionsProp {
  navigationHeaderPrimaryBackgroundColor?: Double;
  navigationHeaderSecondaryBackgroundColor?: Double;
  navigationHeaderPrimaryBackgroundColorNightMode?: Double;
  navigationHeaderSecondaryBackgroundColorNightMode?: Double;
  navigationHeaderLargeManeuverIconColor?: Double;
  navigationHeaderSmallManeuverIconColor?: Double;
  navigationHeaderGuidanceRecommendedLaneColor?: Double;
  navigationHeaderNextStepTextColor?: Double;
  navigationHeaderDistanceValueTextColor?: Double;
  navigationHeaderDistanceUnitsTextColor?: Double;
  navigationHeaderInstructionsTextColor?: Double;
}

export interface NativeNavViewProps extends ViewProps {
  // Explicitly define nativeID for the view registry pattern
  // This is needed for TurboModules to look up view instances
  nativeID: string;

  // Initialization params - set once during view creation
  // Uses sentinel values and boolean flags to detect when actually set
  viewInitializationParams: Readonly<{
    viewType?: WithDefault<Int32, -1>; // -1 = not set, 0 = MAP, 1 = NAVIGATION
    mapId?: WithDefault<string, ''>; // Empty string default for optional string
    mapType?: WithDefault<Int32, 1>; // Defaults to MapType.NORMAL
    navigationUIEnabledPreference?: WithDefault<Int32, 0>; // 0 = AUTOMATIC, 1 = DISABLED
    mapColorScheme?: WithDefault<Int32, 0>; // MapColorScheme: FOLLOW_SYSTEM=0, LIGHT=1, DARK=2
    navigationNightMode?: WithDefault<Int32, 0>; // NavigationNightMode: AUTO=0, FORCE_DAY=1, FORCE_NIGHT=2
    hasCameraPosition?: WithDefault<boolean, false>; // True when cameraPosition is provided
    cameraPosition?: Readonly<{
      hasTarget?: WithDefault<boolean, false>; // True when target coordinates are provided
      target?: Readonly<{
        lat?: Float;
        lng?: Float;
      }> | null;
      bearing?: WithDefault<Float, 0.0>;
      tilt?: WithDefault<Float, 0.0>;
      zoom?: WithDefault<Float, 0.0>;
    }>;
  }>;

  // Dynamic props that can change after initialization
  mapType?: WithDefault<Int32, 1>; // Can be updated after init
  mapColorScheme?: WithDefault<Int32, 0>; // Can be updated after init
  navigationNightMode?: WithDefault<Int32, 0>; // Can be updated after init

  // Map appearance and behavior settings
  mapPadding?: Readonly<{
    top?: Int32;
    left?: Int32;
    bottom?: Int32;
    right?: Int32;
  }> | null;
  mapStyle?: WithDefault<string, ''>; // Empty string default for optional string
  mapToolbarEnabled?: WithDefault<boolean, true>;
  indoorEnabled?: WithDefault<boolean, true>;
  indoorLevelPickerEnabled?: WithDefault<boolean, true>;
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

  // Navigation UI settings
  tripProgressBarEnabled?: WithDefault<boolean, false>;
  trafficPromptsEnabled?: WithDefault<boolean, true>;
  trafficIncidentCardsEnabled?: WithDefault<boolean, true>;
  headerEnabled?: WithDefault<boolean, true>;
  footerEnabled?: WithDefault<boolean, true>;
  speedometerEnabled?: WithDefault<boolean, true>;
  speedLimitIconEnabled?: WithDefault<boolean, true>;
  recenterButtonEnabled?: WithDefault<boolean, true>;
  reportIncidentButtonEnabled?: WithDefault<boolean, true>;
  navigationViewStylingOptions?: UnsafeMixed;

  // Zoom level constraints
  minZoomLevel?: WithDefault<Float, -1>;
  maxZoomLevel?: WithDefault<Float, -1>;

  // Event handlers
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
    position?: { lat: Float; lng: Float };
    bounds?: {
      northEast: { lat: Float; lng: Float };
      southWest: { lat: Float; lng: Float };
      center: { lat: Float; lng: Float };
    };
    height?: Float;
    width?: Float;
    bearing: Float;
    transparency: Float;
    zIndex?: Int32;
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
