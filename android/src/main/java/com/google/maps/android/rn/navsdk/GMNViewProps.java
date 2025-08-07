/**
 * Copyright 2025 Google LLC
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

import androidx.annotation.Nullable;
import com.facebook.react.bridge.ReadableMap;
import com.google.android.gms.maps.GoogleMapOptions;
import com.google.android.gms.maps.model.CameraPosition;

/** Class to hold view properties before the map/nav fragment is fully initialized. */
public class GMNViewProps {
  // Flags to inform if data is set (even if null)
  boolean initialCameraPositionSet = false;
  boolean initialCompassEnabledSet = false;
  boolean initialMaxZoomPreferenceSet = false;
  boolean initialMinZoomPreferenceSet = false;
  boolean initialMapIdSet = false;
  boolean initialRotateGesturesEnabledSet = false;
  boolean initialScrollGesturesEnabledSet = false;
  boolean initialScrollGesturesEnabledDuringRotateOrZoomSet = false;
  boolean initialZoomGesturesEnabledSet = false;
  boolean initialZoomControlsEnabledSet = false;
  boolean initialMapTypeSet = false;
  boolean initialTiltGesturesEnabledSet = false;

  // Data
  @Nullable String mapId;
  @Nullable Boolean navigationUIEnabled;
  @Nullable Integer mapType;
  @Nullable ReadableMap mapPadding;
  @Nullable Boolean tripProgressBarEnabled;
  @Nullable Boolean trafficIncidentCardsEnabled;
  @Nullable Boolean headerEnabled;
  @Nullable Boolean footerEnabled;
  @Nullable Boolean speedometerEnabled;
  @Nullable Boolean speedLimitIconEnabled;
  @Nullable Boolean recenterButtonEnabled;
  @Nullable ReadableMap navigationViewStylingOptions;
  @Nullable Integer nightMode;
  @Nullable Integer followingPerspective;
  @Nullable String mapStyle;
  @Nullable Boolean mapToolbarEnabled;
  @Nullable Boolean indoorEnabled;
  @Nullable Boolean trafficEnabled;
  @Nullable Boolean compassEnabled;
  @Nullable Boolean myLocationButtonEnabled;
  @Nullable Boolean myLocationEnabled;
  @Nullable Boolean rotateGesturesEnabled;
  @Nullable Boolean scrollGesturesEnabled;
  @Nullable Boolean scrollGesturesEnabledDuringRotateOrZoom;
  @Nullable Boolean tiltGesturesEnabled;
  @Nullable Boolean zoomControlsEnabled;
  @Nullable Boolean zoomGesturesEnabled;
  @Nullable Boolean buildingsEnabled;

  @Nullable Boolean reportIncidentButtonEnabled;
  @Nullable Float minZoomPreference;
  @Nullable Float maxZoomPreference;
  @Nullable CameraPosition initialCameraPosition;

  boolean hasPropsSetForViewInitialization() {
    return initialCameraPositionSet
        && initialCompassEnabledSet
        && initialMaxZoomPreferenceSet
        && initialMinZoomPreferenceSet
        && initialMapIdSet
        && initialRotateGesturesEnabledSet
        && initialScrollGesturesEnabledSet
        && initialScrollGesturesEnabledDuringRotateOrZoomSet
        && initialZoomGesturesEnabledSet
        && initialZoomControlsEnabledSet
        && initialMapTypeSet
        && initialTiltGesturesEnabledSet;
  }

  public GoogleMapOptions buildMapOptions() {
    GoogleMapOptions options = new GoogleMapOptions();

    if (mapId != null) {
      options.mapId(mapId);
    }
    if (initialCameraPosition != null) {
      options.camera(initialCameraPosition);
    }
    if (compassEnabled != null) {
      options.compassEnabled(compassEnabled);
    }
    if (maxZoomPreference != null) {
      options.maxZoomPreference(maxZoomPreference);
    }
    if (minZoomPreference != null) {
      options.minZoomPreference(minZoomPreference);
    }
    if (rotateGesturesEnabled != null) {
      options.rotateGesturesEnabled(rotateGesturesEnabled);
    }
    if (scrollGesturesEnabled != null) {
      options.scrollGesturesEnabled(scrollGesturesEnabled);
    }
    if (scrollGesturesEnabledDuringRotateOrZoom != null) {
      options.scrollGesturesEnabledDuringRotateOrZoom(scrollGesturesEnabledDuringRotateOrZoom);
    }
    if (zoomGesturesEnabled != null) {
      options.zoomGesturesEnabled(zoomGesturesEnabled);
    }
    if (zoomControlsEnabled != null) {
      options.zoomControlsEnabled(zoomControlsEnabled);
    }
    if (tiltGesturesEnabled != null) {
      options.tiltGesturesEnabled(tiltGesturesEnabled);
    }
    if (mapType != null) {
      options.mapType(mapType);
    }
    return options;
  }
}
