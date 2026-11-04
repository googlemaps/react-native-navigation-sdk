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

import type { CodegenTypes, HostComponent, ViewProps } from 'react-native';
import { codegenNativeComponent } from 'react-native';

export interface AndroidNavigationViewStylingOptionsProp {
  primaryDayModeThemeColor?: CodegenTypes.Double;
  secondaryDayModeThemeColor?: CodegenTypes.Double;
  primaryNightModeThemeColor?: CodegenTypes.Double;
  secondaryNightModeThemeColor?: CodegenTypes.Double;
  headerLargeManeuverIconColor?: CodegenTypes.Double;
  headerSmallManeuverIconColor?: CodegenTypes.Double;
  headerNextStepTextColor?: CodegenTypes.Double;
  headerNextStepTextSize?: string;
  headerDistanceValueTextColor?: CodegenTypes.Double;
  headerDistanceUnitsTextColor?: CodegenTypes.Double;
  headerDistanceValueTextSize?: string;
  headerDistanceUnitsTextSize?: string;
  headerInstructionsTextColor?: CodegenTypes.Double;
  headerInstructionsFirstRowTextSize?: string;
  headerInstructionsSecondRowTextSize?: string;
  headerGuidanceRecommendedLaneColor?: CodegenTypes.Double;
}

export interface iOSNavigationViewStylingOptionsProp {
  navigationHeaderPrimaryBackgroundColor?: CodegenTypes.Double;
  navigationHeaderSecondaryBackgroundColor?: CodegenTypes.Double;
  navigationHeaderPrimaryBackgroundColorNightMode?: CodegenTypes.Double;
  navigationHeaderSecondaryBackgroundColorNightMode?: CodegenTypes.Double;
  navigationHeaderLargeManeuverIconColor?: CodegenTypes.Double;
  navigationHeaderSmallManeuverIconColor?: CodegenTypes.Double;
  navigationHeaderGuidanceRecommendedLaneColor?: CodegenTypes.Double;
  navigationHeaderNextStepTextColor?: CodegenTypes.Double;
  navigationHeaderDistanceValueTextColor?: CodegenTypes.Double;
  navigationHeaderDistanceUnitsTextColor?: CodegenTypes.Double;
  navigationHeaderInstructionsTextColor?: CodegenTypes.Double;
}

export interface NativeNavViewProps extends ViewProps {
  // Explicitly define nativeID for the view registry pattern
  // This is needed for TurboModules to look up view instances
  nativeID: string;

  // Initialization params - set once during view creation
  // Uses sentinel values and boolean flags to detect when actually set
  viewInitializationParams: Readonly<{
    viewType?: CodegenTypes.WithDefault<CodegenTypes.Int32, -1>; // -1 = not set, 0 = MAP, 1 = NAVIGATION
    mapId?: CodegenTypes.WithDefault<string, ''>; // Empty string default for optional string
    mapType?: CodegenTypes.WithDefault<CodegenTypes.Int32, 1>; // Defaults to MapType.NORMAL
    navigationUIEnabledPreference?: CodegenTypes.WithDefault<
      CodegenTypes.Int32,
      0
    >; // 0 = AUTOMATIC, 1 = DISABLED
    mapColorScheme?: CodegenTypes.WithDefault<CodegenTypes.Int32, 0>; // MapColorScheme: FOLLOW_SYSTEM=0, LIGHT=1, DARK=2
    navigationNightMode?: CodegenTypes.WithDefault<CodegenTypes.Int32, 0>; // NavigationNightMode: AUTO=0, FORCE_DAY=1, FORCE_NIGHT=2
    hasCameraPosition?: CodegenTypes.WithDefault<boolean, false>; // True when cameraPosition is provided
    cameraPosition?: Readonly<{
      hasTarget?: CodegenTypes.WithDefault<boolean, false>; // True when target coordinates are provided
      target?: Readonly<{
        lat?: CodegenTypes.Float;
        lng?: CodegenTypes.Float;
      }> | null;
      bearing?: CodegenTypes.WithDefault<CodegenTypes.Float, 0.0>;
      tilt?: CodegenTypes.WithDefault<CodegenTypes.Float, 0.0>;
      zoom?: CodegenTypes.WithDefault<CodegenTypes.Float, 0.0>;
    }>;
  }>;

  // Dynamic props that can change after initialization
  mapType?: CodegenTypes.WithDefault<CodegenTypes.Int32, 1>; // Can be updated after init
  mapColorScheme?: CodegenTypes.WithDefault<CodegenTypes.Int32, 0>; // Can be updated after init
  navigationNightMode?: CodegenTypes.WithDefault<CodegenTypes.Int32, 0>; // Can be updated after init

  // Map appearance and behavior settings
  mapPadding?: Readonly<{
    top?: CodegenTypes.Int32;
    left?: CodegenTypes.Int32;
    bottom?: CodegenTypes.Int32;
    right?: CodegenTypes.Int32;
  }> | null;
  mapStyle?: CodegenTypes.WithDefault<string, ''>; // Empty string default for optional string
  mapToolbarEnabled?: CodegenTypes.WithDefault<boolean, true>;
  indoorEnabled?: CodegenTypes.WithDefault<boolean, true>;
  indoorLevelPickerEnabled?: CodegenTypes.WithDefault<boolean, true>;
  trafficEnabled?: CodegenTypes.WithDefault<boolean, false>;
  compassEnabled?: CodegenTypes.WithDefault<boolean, true>;
  myLocationButtonEnabled?: CodegenTypes.WithDefault<boolean, true>;
  myLocationEnabled?: CodegenTypes.WithDefault<boolean, false>;
  rotateGesturesEnabled?: CodegenTypes.WithDefault<boolean, true>;
  scrollGesturesEnabled?: CodegenTypes.WithDefault<boolean, true>;
  scrollGesturesEnabledDuringRotateOrZoom?: CodegenTypes.WithDefault<
    boolean,
    true
  >;
  tiltGesturesEnabled?: CodegenTypes.WithDefault<boolean, true>;
  zoomControlsEnabled?: CodegenTypes.WithDefault<boolean, true>;
  zoomGesturesEnabled?: CodegenTypes.WithDefault<boolean, true>;
  buildingsEnabled?: CodegenTypes.WithDefault<boolean, true>;

  // Navigation UI settings
  tripProgressBarEnabled?: CodegenTypes.WithDefault<boolean, false>;
  trafficPromptsEnabled?: CodegenTypes.WithDefault<boolean, true>;
  trafficIncidentCardsEnabled?: CodegenTypes.WithDefault<boolean, true>;
  headerEnabled?: CodegenTypes.WithDefault<boolean, true>;
  footerEnabled?: CodegenTypes.WithDefault<boolean, true>;
  speedometerEnabled?: CodegenTypes.WithDefault<boolean, false>;
  speedLimitIconEnabled?: CodegenTypes.WithDefault<boolean, false>;
  recenterButtonEnabled?: CodegenTypes.WithDefault<boolean, true>;
  reportIncidentButtonEnabled?: CodegenTypes.WithDefault<boolean, true>;
  navigationViewStylingOptions?: CodegenTypes.UnsafeMixed;

  // Zoom level constraints
  minZoomLevel?: CodegenTypes.WithDefault<CodegenTypes.Float, -1>;
  maxZoomLevel?: CodegenTypes.WithDefault<CodegenTypes.Float, -1>;

  // Event handlers
  onMapReady?: CodegenTypes.DirectEventHandler<null>;
  onMapClick?: CodegenTypes.DirectEventHandler<{
    lat: CodegenTypes.Float;
    lng: CodegenTypes.Float;
  }>;
  onMarkerClick?: CodegenTypes.DirectEventHandler<{
    position: { lat: CodegenTypes.Float; lng: CodegenTypes.Float };
    id: string;
    title?: string;
    alpha?: CodegenTypes.Float;
    rotation?: CodegenTypes.Float;
    snippet?: string;
    zIndex?: CodegenTypes.Int32;
  }>;
  onPolylineClick?: CodegenTypes.DirectEventHandler<{
    points: { lat: CodegenTypes.Float; lng: CodegenTypes.Float }[];
    id: string;
    color?: string;
    width?: CodegenTypes.Float;
    jointType?: CodegenTypes.Int32;
    zIndex?: CodegenTypes.Int32;
  }>;
  onPolygonClick?: CodegenTypes.DirectEventHandler<{
    points: { lat: CodegenTypes.Float; lng: CodegenTypes.Float }[];
    holes: { lat: CodegenTypes.Float; lng: CodegenTypes.Float }[][];
    id: string;
    fillColor?: string;
    strokeWidth?: CodegenTypes.Float;
    strokeColor?: string;
    strokeJointType?: CodegenTypes.Int32;
    zIndex?: CodegenTypes.Int32;
    geodesic?: boolean;
  }>;
  onCircleClick?: CodegenTypes.DirectEventHandler<{
    center: { lat: CodegenTypes.Float; lng: CodegenTypes.Float };
    id: string;
    fillColor?: string;
    strokeWidth?: CodegenTypes.Float;
    strokeColor?: string;
    radius?: CodegenTypes.Float;
    zIndex?: CodegenTypes.Int32;
  }>;
  onGroundOverlayClick?: CodegenTypes.DirectEventHandler<{
    id: string;
    position?: { lat: CodegenTypes.Float; lng: CodegenTypes.Float };
    bounds?: {
      northEast: { lat: CodegenTypes.Float; lng: CodegenTypes.Float };
      southWest: { lat: CodegenTypes.Float; lng: CodegenTypes.Float };
      center: { lat: CodegenTypes.Float; lng: CodegenTypes.Float };
    };
    height?: CodegenTypes.Float;
    width?: CodegenTypes.Float;
    bearing: CodegenTypes.Float;
    transparency: CodegenTypes.Float;
    zIndex?: CodegenTypes.Int32;
  }>;
  onMarkerInfoWindowTapped?: CodegenTypes.DirectEventHandler<{
    position: { lat: CodegenTypes.Float; lng: CodegenTypes.Float };
    id: string;
    title?: string;
    alpha?: CodegenTypes.Float;
    rotation?: CodegenTypes.Float;
    snippet?: string;
    zIndex?: CodegenTypes.Int32;
  }>;
  onRecenterButtonClick?: CodegenTypes.DirectEventHandler<null>;
  onPromptVisibilityChanged?: CodegenTypes.DirectEventHandler<{
    visible: boolean;
  }>;
}

export type NativeNavViewType = HostComponent<NativeNavViewProps>;

export default codegenNativeComponent<NativeNavViewProps>(
  'NavView'
) as NativeNavViewType;
