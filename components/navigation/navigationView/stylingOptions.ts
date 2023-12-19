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

export interface AndroidStylingOptions {
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

export interface iOSStylingOptions {
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
