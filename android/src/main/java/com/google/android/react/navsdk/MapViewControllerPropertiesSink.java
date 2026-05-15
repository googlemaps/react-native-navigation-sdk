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

/** Buffers map-controller props until getMapAsync creates the MapViewController. */
public class MapViewControllerPropertiesSink implements INavigationViewControllerProperties {
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

  /** Clear all buffered properties. */
  public void clear() {
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
    minZoomLevel = null;
    maxZoomLevel = null;
  }
}
