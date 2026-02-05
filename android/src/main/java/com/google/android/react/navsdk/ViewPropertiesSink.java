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

/**
 * Unified property sink for buffering both fragment-level and controller-level properties that
 * arrive before the fragment is created. Implements both INavigationViewProperties and
 * INavigationViewControllerProperties to handle all property types in a single object.
 */
public class ViewPropertiesSink
    implements INavigationViewProperties, INavigationViewControllerProperties {
  // Map fragment properties
  @Nullable private Integer mapColorScheme;

  // Map controller properties
  @Nullable private Integer mapType;
  @Nullable private Integer paddingTop;
  @Nullable private Integer paddingLeft;
  @Nullable private Integer paddingBottom;
  @Nullable private Integer paddingRight;
  @Nullable private String mapStyle;
  @Nullable private Boolean mapToolbarEnabled;
  @Nullable private Boolean indoorEnabled;
  @Nullable private Boolean indoorLevelPickerEnabled;
  @Nullable private Boolean trafficEnabled;
  @Nullable private Boolean compassEnabled;
  @Nullable private Boolean buildingsEnabled;
  @Nullable private Boolean myLocationEnabled;
  @Nullable private Boolean myLocationButtonEnabled;
  @Nullable private Boolean rotateGesturesEnabled;
  @Nullable private Boolean scrollGesturesEnabled;
  @Nullable private Boolean scrollGesturesEnabledDuringRotateOrZoom;
  @Nullable private Boolean tiltGesturesEnabled;
  @Nullable private Boolean zoomGesturesEnabled;
  @Nullable private Boolean zoomControlsEnabled;
  @Nullable private Float minZoomLevel;
  @Nullable private Float maxZoomLevel;

  // Navigation fragment properties
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

  // ========== IMapViewProperties implementation ==========

  @Override
  public void setMapColorScheme(int colorScheme) {
    this.mapColorScheme = colorScheme;
  }

  // ========== IMapViewControllerProperties implementation ==========

  @Override
  public void setMapType(int mapType) {
    this.mapType = mapType;
  }

  @Override
  public void setPadding(int top, int left, int bottom, int right) {
    this.paddingTop = top;
    this.paddingLeft = left;
    this.paddingBottom = bottom;
    this.paddingRight = right;
  }

  @Override
  public void setMapStyle(String mapStyle) {
    this.mapStyle = mapStyle;
  }

  @Override
  public void setMapToolbarEnabled(boolean enabled) {
    this.mapToolbarEnabled = enabled;
  }

  @Override
  public void setIndoorEnabled(boolean enabled) {
    this.indoorEnabled = enabled;
  }

  @Override
  public void setIndoorLevelPickerEnabled(boolean enabled) {
    this.indoorLevelPickerEnabled = enabled;
  }

  @Override
  public void setTrafficEnabled(boolean enabled) {
    this.trafficEnabled = enabled;
  }

  @Override
  public void setCompassEnabled(boolean enabled) {
    this.compassEnabled = enabled;
  }

  @Override
  public void setBuildingsEnabled(boolean enabled) {
    this.buildingsEnabled = enabled;
  }

  @Override
  public void setMyLocationEnabled(boolean enabled) {
    this.myLocationEnabled = enabled;
  }

  @Override
  public void setMyLocationButtonEnabled(boolean enabled) {
    this.myLocationButtonEnabled = enabled;
  }

  @Override
  public void setRotateGesturesEnabled(boolean enabled) {
    this.rotateGesturesEnabled = enabled;
  }

  @Override
  public void setScrollGesturesEnabled(boolean enabled) {
    this.scrollGesturesEnabled = enabled;
  }

  @Override
  public void setScrollGesturesEnabledDuringRotateOrZoom(boolean enabled) {
    this.scrollGesturesEnabledDuringRotateOrZoom = enabled;
  }

  @Override
  public void setTiltGesturesEnabled(boolean enabled) {
    this.tiltGesturesEnabled = enabled;
  }

  @Override
  public void setZoomGesturesEnabled(boolean enabled) {
    this.zoomGesturesEnabled = enabled;
  }

  @Override
  public void setZoomControlsEnabled(boolean enabled) {
    this.zoomControlsEnabled = enabled;
  }

  @Override
  public void setMinZoomLevel(float minZoomLevel) {
    this.minZoomLevel = minZoomLevel;
  }

  @Override
  public void setMaxZoomLevel(float maxZoomLevel) {
    this.maxZoomLevel = maxZoomLevel;
  }

  // ========== INavigationViewProperties implementation ==========

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
    // Footer on Android is the same as ETA card
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

  /** Apply all buffered controller properties to the map controller. */
  public void applyToController(MapViewController controller) {
    if (controller == null) {
      return;
    }

    if (mapType != null) {
      controller.setMapType(mapType);
    }
    if (paddingTop != null
        && paddingLeft != null
        && paddingBottom != null
        && paddingRight != null) {
      controller.setPadding(paddingTop, paddingLeft, paddingBottom, paddingRight);
    }
    if (mapStyle != null) {
      controller.setMapStyle(mapStyle);
    }
    if (mapToolbarEnabled != null) {
      controller.setMapToolbarEnabled(mapToolbarEnabled);
    }
    if (indoorEnabled != null) {
      controller.setIndoorEnabled(indoorEnabled);
    }
    if (indoorLevelPickerEnabled != null) {
      controller.setIndoorLevelPickerEnabled(indoorLevelPickerEnabled);
    }
    if (trafficEnabled != null) {
      controller.setTrafficEnabled(trafficEnabled);
    }
    if (compassEnabled != null) {
      controller.setCompassEnabled(compassEnabled);
    }
    if (buildingsEnabled != null) {
      controller.setBuildingsEnabled(buildingsEnabled);
    }
    if (myLocationEnabled != null) {
      controller.setMyLocationEnabled(myLocationEnabled);
    }
    if (myLocationButtonEnabled != null) {
      controller.setMyLocationButtonEnabled(myLocationButtonEnabled);
    }
    if (rotateGesturesEnabled != null) {
      controller.setRotateGesturesEnabled(rotateGesturesEnabled);
    }
    if (scrollGesturesEnabled != null) {
      controller.setScrollGesturesEnabled(scrollGesturesEnabled);
    }
    if (scrollGesturesEnabledDuringRotateOrZoom != null) {
      controller.setScrollGesturesEnabledDuringRotateOrZoom(
          scrollGesturesEnabledDuringRotateOrZoom);
    }
    if (tiltGesturesEnabled != null) {
      controller.setTiltGesturesEnabled(tiltGesturesEnabled);
    }
    if (zoomGesturesEnabled != null) {
      controller.setZoomGesturesEnabled(zoomGesturesEnabled);
    }
    if (zoomControlsEnabled != null) {
      controller.setZoomControlsEnabled(zoomControlsEnabled);
    }
    if (minZoomLevel != null) {
      controller.setMinZoomLevel(minZoomLevel);
    }
    if (maxZoomLevel != null) {
      controller.setMaxZoomLevel(maxZoomLevel);
    }
  }

  /** Apply all buffered fragment properties to the fragment. */
  public void applyToFragment(IMapViewFragment fragment) {
    if (fragment == null) {
      return;
    }

    // Apply map fragment properties
    if (mapColorScheme != null) {
      fragment.setMapColorScheme(mapColorScheme);
    }

    // Apply navigation fragment properties if applicable
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

  /** Clear all buffered properties (both fragment and controller). */
  public void clear() {
    // Clear fragment properties
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

    // Clear controller properties
    mapType = null;
    paddingTop = null;
    paddingLeft = null;
    paddingBottom = null;
    paddingRight = null;
    mapStyle = null;
    mapToolbarEnabled = null;
    indoorEnabled = null;
    indoorLevelPickerEnabled = null;
    trafficEnabled = null;
    compassEnabled = null;
    buildingsEnabled = null;
    myLocationEnabled = null;
    myLocationButtonEnabled = null;
    rotateGesturesEnabled = null;
    scrollGesturesEnabled = null;
    scrollGesturesEnabledDuringRotateOrZoom = null;
    tiltGesturesEnabled = null;
    zoomGesturesEnabled = null;
    zoomControlsEnabled = null;
  }
}
