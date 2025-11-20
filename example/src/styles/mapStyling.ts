/**
 * Copyright 2025 Google LLC
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

import { Colors } from './theme';

/**
 * Consistent navigation map view styling options using theme colors
 */
export const MapStylingOptions = {
  android: {
    primaryDayModeThemeColor: Colors.mapStyling.primaryDay,
    primaryNightModeThemeColor: Colors.mapStyling.primaryNight,
    secondaryDayModeThemeColor: Colors.mapStyling.secondaryDay,
    secondaryNightModeThemeColor: Colors.mapStyling.secondaryNight,
    headerLargeManeuverIconColor: Colors.mapStyling.accent,
    headerSmallManeuverIconColor: Colors.mapStyling.accent,
    headerDistanceValueTextColor: Colors.mapStyling.accent,
    headerInstructionsFirstRowTextSize: '18f',
  },
  iOS: {
    navigationHeaderPrimaryBackgroundColor: Colors.mapStyling.primaryDay,
    navigationHeaderPrimaryBackgroundColorNightMode:
      Colors.mapStyling.primaryNight,
    navigationHeaderSecondaryBackgroundColor: Colors.mapStyling.secondaryDay,
    navigationHeaderSecondaryBackgroundColorNightMode:
      Colors.mapStyling.secondaryNight,
    navigationHeaderDistanceValueTextColor: Colors.mapStyling.accent,
  },
} as const;
