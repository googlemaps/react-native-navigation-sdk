/**
 * Copyright 2023 Google LLC
 *
 * <p>Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of the License at
 *
 * <p>http://www.apache.org/licenses/LICENSE-2.0
 *
 * <p>Unless required by applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.google.maps.android.rn.navsdk;

import com.google.android.libraries.navigation.StylingOptions;
import java.util.Map;
import java.util.Objects;

public class GMNStylingOptionsBuilder {
  private StylingOptions mStylingOptions;

  private GMNStylingOptionsBuilder(Builder builder) {
    this.mStylingOptions = builder.mStylingOptions;
  }

  public static class Builder {
    private StylingOptions mStylingOptions;
    private Map stylingOptions;

    public Builder(Map map) {
      this.stylingOptions = map;
    }

    private int parseColor(String color, Map map) {
      return GMNColorUtil.colorFromHexString(
              Objects.requireNonNull(GMNCollectionUtil.getString(color, map)))
          .toArgb();
    }

    public StylingOptions build() {
      mStylingOptions = new StylingOptions();
      if (stylingOptions.containsKey("primaryDayModeThemeColor"))
        mStylingOptions.primaryDayModeThemeColor(
            parseColor("primaryDayModeThemeColor", stylingOptions));
      if (stylingOptions.containsKey("secondaryDayModeThemeColor"))
        mStylingOptions.secondaryDayModeThemeColor(
            parseColor("secondaryDayModeThemeColor", stylingOptions));
      if (stylingOptions.containsKey("primaryNightModeThemeColor"))
        mStylingOptions.primaryNightModeThemeColor(
            parseColor("primaryNightModeThemeColor", stylingOptions));
      if (stylingOptions.containsKey("secondaryNightModeThemeColor"))
        mStylingOptions.secondaryNightModeThemeColor(
            parseColor("secondaryNightModeThemeColor", stylingOptions));
      if (stylingOptions.containsKey("headerLargeManeuverIconColor"))
        mStylingOptions.headerLargeManeuverIconColor(
            parseColor("headerLargeManeuverIconColor", stylingOptions));
      if (stylingOptions.containsKey("headerSmallManeuverIconColor"))
        mStylingOptions.headerSmallManeuverIconColor(
            parseColor("headerSmallManeuverIconColor", stylingOptions));
      if (stylingOptions.containsKey("headerNextStepTextColor"))
        mStylingOptions.headerNextStepTextColor(
            parseColor("headerNextStepTextColor", stylingOptions));
      if (stylingOptions.containsKey("headerDistanceValueTextColor"))
        mStylingOptions.headerDistanceValueTextColor(
            parseColor("headerDistanceValueTextColor", stylingOptions));
      if (stylingOptions.containsKey("headerDistanceUnitsTextColor"))
        mStylingOptions.headerDistanceUnitsTextColor(
            parseColor("headerDistanceUnitsTextColor", stylingOptions));
      if (stylingOptions.containsKey("headerInstructionsTextColor"))
        mStylingOptions.headerInstructionsTextColor(
            parseColor("headerInstructionsTextColor", stylingOptions));
      if (stylingOptions.containsKey("headerGuidanceRecommendedLaneColor"))
        mStylingOptions.headerGuidanceRecommendedLaneColor(
            parseColor("headerGuidanceRecommendedLaneColor", stylingOptions));
      if (stylingOptions.containsKey("headerNextStepTextSize"))
        mStylingOptions.headerNextStepTextSize(
            Float.parseFloat(
                GMNCollectionUtil.getString("headerNextStepTextSize", stylingOptions)));
      if (stylingOptions.containsKey("headerDistanceValueTextSize"))
        mStylingOptions.headerDistanceValueTextSize(
            Float.parseFloat(
                GMNCollectionUtil.getString("headerDistanceValueTextSize", stylingOptions)));
      if (stylingOptions.containsKey("headerDistanceUnitsTextSize"))
        mStylingOptions.headerDistanceUnitsTextSize(
            Float.parseFloat(
                GMNCollectionUtil.getString("headerDistanceUnitsTextSize", stylingOptions)));
      if (stylingOptions.containsKey("headerInstructionsFirstRowTextSize")) {
        mStylingOptions.headerInstructionsFirstRowTextSize(
            Float.parseFloat(
                GMNCollectionUtil.getString("headerInstructionsFirstRowTextSize", stylingOptions)));
      }
      if (stylingOptions.containsKey("headerInstructionsSecondRowTextSize"))
        mStylingOptions.headerInstructionsSecondRowTextSize(20f);
      return mStylingOptions;
    }
  }
}
