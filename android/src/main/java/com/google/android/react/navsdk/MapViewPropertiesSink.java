/*
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

package com.google.android.react.navsdk;

import androidx.annotation.Nullable;
import com.google.android.libraries.navigation.StylingOptions;

/** Buffers fragment-level props until the native map or navigation fragment is attached. */
public class MapViewPropertiesSink implements INavigationViewProperties {
  @Nullable private Integer mapColorScheme;
  @Nullable private Integer nightModeOption;
  @Nullable private Boolean tripProgressBarEnabled;
  @Nullable private Boolean trafficPromptsEnabled;
  @Nullable private Boolean trafficIncidentCardsEnabled;
  @Nullable private Boolean headerEnabled;
  @Nullable private Boolean footerEnabled;
  @Nullable private Boolean speedometerEnabled;
  @Nullable private Boolean speedLimitIconEnabled;
  @Nullable private Boolean recenterButtonEnabled;
  @Nullable private Boolean reportIncidentButtonEnabled;
  @Nullable private StylingOptions stylingOptions;

  @Override
  public void setMapColorScheme(int colorScheme) {
    this.mapColorScheme = colorScheme;
  }

  @Override
  public void setNightModeOption(int nightMode) {
    this.nightModeOption = nightMode;
  }

  @Override
  public void setStylingOptions(StylingOptions options) {
    this.stylingOptions = options;
  }

  @Override
  public void setTripProgressBarEnabled(boolean enabled) {
    this.tripProgressBarEnabled = enabled;
  }

  @Override
  public void setTrafficPromptsEnabled(boolean enabled) {
    this.trafficPromptsEnabled = enabled;
  }

  @Override
  public void setTrafficIncidentCardsEnabled(boolean enabled) {
    this.trafficIncidentCardsEnabled = enabled;
  }

  @Override
  public void setHeaderEnabled(boolean enabled) {
    this.headerEnabled = enabled;
  }

  @Override
  public void setFooterEnabled(boolean enabled) {
    // Footer on Android is the same as ETA card.
    this.footerEnabled = enabled;
  }

  @Override
  public void setSpeedometerEnabled(boolean enabled) {
    this.speedometerEnabled = enabled;
  }

  @Override
  public void setSpeedLimitIconEnabled(boolean enabled) {
    this.speedLimitIconEnabled = enabled;
  }

  @Override
  public void setRecenterButtonEnabled(boolean enabled) {
    this.recenterButtonEnabled = enabled;
  }

  @Override
  public void setReportIncidentButtonEnabled(boolean enabled) {
    this.reportIncidentButtonEnabled = enabled;
  }

  /** Apply all buffered fragment properties to the fragment. */
  public void applyToFragment(IMapViewFragment fragment) {
    if (fragment == null) {
      return;
    }

    if (mapColorScheme != null) {
      fragment.setMapColorScheme(mapColorScheme);
    }

    if (fragment instanceof INavViewFragment) {
      INavViewFragment navFragment = (INavViewFragment) fragment;

      if (nightModeOption != null) {
        navFragment.setNightModeOption(nightModeOption);
      }
      if (stylingOptions != null) {
        navFragment.setStylingOptions(stylingOptions);
      }
      if (tripProgressBarEnabled != null) {
        navFragment.setTripProgressBarEnabled(tripProgressBarEnabled);
      }
      if (trafficPromptsEnabled != null) {
        navFragment.setTrafficPromptsEnabled(trafficPromptsEnabled);
      }
      if (trafficIncidentCardsEnabled != null) {
        navFragment.setTrafficIncidentCardsEnabled(trafficIncidentCardsEnabled);
      }
      if (headerEnabled != null) {
        navFragment.setHeaderEnabled(headerEnabled);
      }
      if (footerEnabled != null) {
        navFragment.setFooterEnabled(footerEnabled);
      }
      if (speedometerEnabled != null) {
        navFragment.setSpeedometerEnabled(speedometerEnabled);
      }
      if (speedLimitIconEnabled != null) {
        navFragment.setSpeedLimitIconEnabled(speedLimitIconEnabled);
      }
      if (recenterButtonEnabled != null) {
        navFragment.setRecenterButtonEnabled(recenterButtonEnabled);
      }
      if (reportIncidentButtonEnabled != null) {
        navFragment.setReportIncidentButtonEnabled(reportIncidentButtonEnabled);
      }
    }
  }

  /** Clear all buffered properties. */
  public void clear() {
    mapColorScheme = null;
    nightModeOption = null;
    stylingOptions = null;
    tripProgressBarEnabled = null;
    trafficPromptsEnabled = null;
    trafficIncidentCardsEnabled = null;
    headerEnabled = null;
    footerEnabled = null;
    speedometerEnabled = null;
    speedLimitIconEnabled = null;
    recenterButtonEnabled = null;
    reportIncidentButtonEnabled = null;
  }
}
