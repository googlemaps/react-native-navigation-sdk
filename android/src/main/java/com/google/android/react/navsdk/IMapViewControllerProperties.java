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

/**
 * Write-only interface for map view controller properties. These properties control GoogleMap
 * settings that require the map controller to be available.
 */
public interface IMapViewControllerProperties {
  void setMapType(int mapType);

  void setPadding(int top, int left, int bottom, int right);

  void setMapStyle(String mapStyle);

  void setMapToolbarEnabled(boolean enabled);

  void setIndoorEnabled(boolean enabled);

  void setIndoorLevelPickerEnabled(boolean enabled);

  void setTrafficEnabled(boolean enabled);

  void setCompassEnabled(boolean enabled);

  void setBuildingsEnabled(boolean enabled);

  void setMyLocationEnabled(boolean enabled);

  void setMyLocationButtonEnabled(boolean enabled);

  void setRotateGesturesEnabled(boolean enabled);

  void setScrollGesturesEnabled(boolean enabled);

  void setScrollGesturesEnabledDuringRotateOrZoom(boolean enabled);

  void setTiltGesturesEnabled(boolean enabled);

  void setZoomGesturesEnabled(boolean enabled);

  void setZoomControlsEnabled(boolean enabled);

  void setMinZoomLevel(float minZoomLevel);

  void setMaxZoomLevel(float maxZoomLevel);
}
