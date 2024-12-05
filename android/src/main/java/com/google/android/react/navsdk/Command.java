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

import androidx.annotation.NonNull;

public enum Command {
  CREATE_FRAGMENT(1, "createFragment"),
  MOVE_CAMERA(2, "moveCamera"),
  SET_MY_LOCATION_ENABLED(3, "setMyLocationEnabled"),
  SET_TRIP_PROGRESS_BAR_ENABLED(4, "setTripProgressBarEnabled"),
  SET_NAVIGATION_UI_ENABLED(5, "setNavigationUIEnabled"),
  SET_FOLLOWING_PERSPECTIVE(6, "setFollowingPerspective"),
  SET_NIGHT_MODE(7, "setNightMode"),
  DELETE_FRAGMENT(8, "deleteFragment"),
  SET_SPEEDOMETER_ENABLED(9, "setSpeedometerEnabled"),
  SET_SPEED_LIMIT_ICON_ENABLED(10, "setSpeedLimitIconEnabled"),
  SET_ZOOM_LEVEL(11, "setZoomLevel"),
  SET_INDOOR_ENABLED(12, "setIndoorEnabled"),
  SET_TRAFFIC_ENABLED(13, "setTrafficEnabled"),
  SET_COMPASS_ENABLED(14, "setCompassEnabled"),
  SET_MY_LOCATION_BUTTON_ENABLED(15, "setMyLocationButtonEnabled"),
  SET_ROTATE_GESTURES_ENABLED(16, "setRotateGesturesEnabled"),
  SET_SCROLL_GESTURES_ENABLED(17, "setScrollGesturesEnabled"),
  SET_SCROLL_GESTURES_ENABLED_DURING_ROTATE_OR_ZOOM(
      18, "setScrollGesturesEnabledDuringRotateOrZoom"),
  SET_TILT_GESTURES_ENABLED(19, "setTiltGesturesEnabled"),
  SET_ZOOM_GESTURES_ENABLED(20, "setZoomGesturesEnabled"),
  SET_BUILDINGS_ENABLED(21, "setBuildingsEnabled"),
  SET_MAP_TYPE(22, "setMapType"),
  SET_MAP_TOOLBAR_ENABLED(23, "setMapToolbarEnabled"),
  CLEAR_MAP_VIEW(24, "clearMapView"),
  RESET_MIN_MAX_ZOOM_LEVEL(25, "resetMinMaxZoomLevel"),
  SET_MAP_STYLE(26, "setMapStyle"),
  ANIMATE_CAMERA(27, "animateCamera"),
  SHOW_ROUTE_OVERVIEW(28, "showRouteOverview"),
  SET_TRAFFIC_INCIDENT_CARDS_ENABLED(29, "setTrafficIncidentCardsEnabled"),
  SET_FOOTER_ENABLED(30, "setFooterEnabled"),
  SET_HEADER_ENABLED(31, "setHeaderEnabled"),
  REMOVE_MARKER(32, "removeMarker"),
  REMOVE_POLYLINE(33, "removePolyline"),
  REMOVE_POLYGON(34, "removePolygon"),
  REMOVE_CIRCLE(35, "removeCircle"),
  REMOVE_GROUND_OVERLAY(36, "removeGroundOverlay"),
  SET_ZOOM_CONTROLS_ENABLED(37, "setZoomControlsEnabled"),
  SET_RECENTER_BUTTON_ENABLED(38, "setRecenterButtonEnabled"),
  SET_PADDING(39, "setPadding");

  private final int value;
  private final String name;

  Command(int value, String name) {
    this.value = value;
    this.name = name;
  }

  public int getValue() {
    return value;
  }

  @NonNull
  public String toString() {
    return this.name;
  }

  public static Command find(int value) {
    for (Command i : Command.values()) {
      if (i.value == value) return i;
    }
    return null;
  }
}
