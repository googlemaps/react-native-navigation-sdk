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
package com.google.android.react.navsdk;

import android.view.View;

import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.model.Circle;
import com.google.android.gms.maps.model.GroundOverlay;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.Polygon;
import com.google.android.gms.maps.model.Polyline;

import java.io.IOException;
import java.util.Map;

public interface IViewFragment {
  void setStylingOptions(Map stylingOptions);
  void applyStylingOptions();
  void setFollowingPerspective(int jsValue);
  void setNightModeOption(int jsValue);
  void setMapType(int jsValue);
  void clearMapView();
  void resetMinMaxZoomLevel();
  void animateCamera(Map map);
  Circle addCircle(Map optionsMap);
  Marker addMarker(Map optionsMap);
  Polyline addPolyline(Map optionsMap);
  Polygon addPolygon(Map optionsMap);
  void removeMarker(String id);
  void removePolyline(String id);
  void removePolygon(String id);
  void removeCircle(String id);
  void removeGroundOverlay(String id);
  GroundOverlay addGroundOverlay(Map map);
  void setMapStyle(String url);
  String fetchJsonFromUrl(String urlString) throws IOException;
  void moveCamera(Map map);
  void setZoomLevel(int level);
  void setIndoorEnabled(boolean isOn);
  void setTrafficEnabled(boolean isOn);
  void setCompassEnabled(boolean isOn);
  void setRotateGesturesEnabled(boolean isOn);
  void setScrollGesturesEnabled(boolean isOn);
  void setScrollGesturesEnabledDuringRotateOrZoom(boolean isOn);
  void setTiltGesturesEnabled(boolean isOn);
  void setZoomControlsEnabled(boolean isOn);
  void setZoomGesturesEnabled(boolean isOn);
  void setBuildingsEnabled(boolean isOn);
  void setMyLocationEnabled(boolean isOn);
  void setMapToolbarEnabled(boolean isOn);
  void setMyLocationButtonEnabled(boolean isOn);
  GoogleMap getGoogleMap();

  // Navigation
  void setNavigationUiEnabled(boolean enableNavigationUi);
  void setTripProgressBarEnabled(boolean enabled);
  void setSpeedometerEnabled(boolean enabled);
  void setSpeedLimitIconEnabled(boolean enabled);
  void setTrafficIncidentCardsEnabled(boolean enabled);
  void setEtaCardEnabled(boolean enabled);
  void setHeaderEnabled(boolean enabled);
  void setRecenterButtonEnabled(boolean enabled);
  void showRouteOverview();

  // Fragment
  boolean isAdded();
  View getView();
}
