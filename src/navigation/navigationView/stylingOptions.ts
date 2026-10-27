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

import type { ColorValue } from 'react-native';

/**
 * Styling options for the Android navigation UI.
 *
 * @see https://developers.google.com/maps/documentation/navigation/android-sdk/release-notes#October_01_2026
 */
export interface AndroidStylingOptions {
  primaryDayModeThemeColor?: ColorValue;
  secondaryDayModeThemeColor?: ColorValue;
  primaryNightModeThemeColor?: ColorValue;
  secondaryNightModeThemeColor?: ColorValue;
  headerLargeManeuverIconColor?: ColorValue;
  headerSmallManeuverIconColor?: ColorValue;
  headerNextStepTextColor?: ColorValue;
  /** @deprecated Deprecated by Android Navigation SDK 8.0; still functional, but scheduled for removal by the native SDK. */
  headerNextStepTextSize?: string;
  headerDistanceValueTextColor?: ColorValue;
  headerDistanceUnitsTextColor?: ColorValue;
  /** @deprecated Deprecated by Android Navigation SDK 8.0; still functional, but scheduled for removal by the native SDK. */
  headerDistanceValueTextSize?: string;
  /** @deprecated Deprecated by Android Navigation SDK 8.0; still functional, but scheduled for removal by the native SDK. */
  headerDistanceUnitsTextSize?: string;
  headerInstructionsTextColor?: ColorValue;
  /** @deprecated Deprecated by Android Navigation SDK 8.0; still functional, but scheduled for removal by the native SDK. */
  headerInstructionsFirstRowTextSize?: string;
  /** @deprecated Deprecated by Android Navigation SDK 8.0; still functional, but scheduled for removal by the native SDK. */
  headerInstructionsSecondRowTextSize?: string;
  headerGuidanceRecommendedLaneColor?: ColorValue;
}

export interface iOSStylingOptions {
  navigationHeaderPrimaryBackgroundColor?: ColorValue;
  navigationHeaderSecondaryBackgroundColor?: ColorValue;
  navigationHeaderPrimaryBackgroundColorNightMode?: ColorValue;
  navigationHeaderSecondaryBackgroundColorNightMode?: ColorValue;
  navigationHeaderLargeManeuverIconColor?: ColorValue;
  navigationHeaderSmallManeuverIconColor?: ColorValue;
  navigationHeaderGuidanceRecommendedLaneColor?: ColorValue;
  navigationHeaderNextStepTextColor?: ColorValue;
  navigationHeaderDistanceValueTextColor?: ColorValue;
  navigationHeaderDistanceUnitsTextColor?: ColorValue;
  navigationHeaderInstructionsTextColor?: ColorValue;
}
