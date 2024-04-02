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

public enum Command {
  CREATE_FRAGMENT(1, "createFragment"),
  SET_TURN_BY_TURN_LOGGING_ENABLED(5, "setTurnByTurnLoggingEnabled"),
  MOVE_CAMERA(6, "moveCamera"),
  SET_MY_LOCATION_ENABLED(7, "setMyLocationEnabled"),
  SET_TRIP_PROGRESS_BAR_ENABLED(8, "setTripProgressBarEnabled"),
  SET_NAVIGATION_UI_ENABLED(9, "setNavigationUIEnabled"),
  SET_FOLLOWING_PERSPECTIVE(10, "setFollowingPerspective"),
  SET_NIGHT_MODE(11, "setNightMode"),
  DELETE_FRAGMENT(12, "deleteFragment"),
  SET_SPEEDOMETER_ENABLED(14, "setSpeedometerEnabled"),
  SET_SPEED_LIMIT_ICON_ENABLED(15, "setSpeedLimitIconEnabled"),
  SET_DESTINATIONS(16, "setDestinations"),
  START_GUIDANCE(18, "startGuidance"),
  STOP_GUIDANCE(19, "stopGuidance"),
  SIMULATE_LOCATIONS_ALONG_EXISTING_ROUTE(20, "simulateLocationsAlongExistingRoute"),
  STOP_LOCATION_SIMULATION(21, "stopLocationSimulation"),
  SET_ZOOM_LEVEL(22, "setZoomLevel"),
  SET_DESTINATION(33, "setDestination"),
  CLEAR_DESTINATIONS(34, "clearDestinations"),
  CONTINUE_TO_NEXT_DESTINATION(35, "continueToNextDestination"),
  SIMULATE_LOCATION(36, "simulateLocation"),
  SHOW_TERMS_AND_CONDITIONS_DIALOG(38, "showTermsAndConditionsDialog"),
  RESET_TERMS_ACCEPTED(40, "resetTermsAccepted"),
  SET_SPEED_ALERT_OPTIONS(41, "setSpeedAlertOptions"),
  SET_INDOOR_ENABLED(42, "setIndoorEnabled"),
  SET_TRAFFIC_ENABLED(43, "setTrafficEnabled"),
  SET_COMPASS_ENABLED(44, "setCompassEnabled"),
  SET_MY_LOCATION_BUTTON_ENABLED(45, "setMyLocationButtonEnabled"),
  SET_ROTATE_GESTURES_ENABLED(46, "setRotateGesturesEnabled"),
  SET_SCROLL_GESTURES_ENABLED(47, "setScrollGesturesEnabled"),
  SET_SCROLL_GESTURES_ENABLED_DURING_ROTATE_OR_ZOOM(
      48, "setScrollGesturesEnabledDuringRotateOrZoom"),
  SET_TILT_GESTURES_ENABLED(49, "setTiltGesturesEnabled"),
  SET_ZOOM_GESTURES_ENABLED(50, "setZoomGestures"),
  SET_BUILDINGS_ENABLED(51, "setBuildingsEnabled"),
  SET_MAP_TYPE(52, "setMapType"),
  SET_MAP_TOOLBAR_ENABLED(53, "setMapToolbarEnabled"),
  CLEAR_MAP_VIEW(58, "clearMapView"),
  RESET_MIN_MAX_ZOOM_LEVEL(59, "resetMinMaxZoomLevel"),
  SET_MAP_STYLE(62, "setMapStyle"),
  ANIMATE_CAMERA(63, "animateCamera"),
  SET_AUDIO_GUIDANCE_TYPE(67, "setAudioGuidanceType"),
  SET_ABNORMAL_TERMINATION_REPORTING_ENABLED(68, "setAbnormalTerminatingReportingEnabled"),
  SHOW_ROUTE_OVERVIEW(69, "showRouteOverview"),
  SET_TRAFFIC_INCIDENT_CARDS_ENABLED(70, "setTrafficIncidentCardsEnabled"),
  REMOVE_MARKER(73, "removeMarker"),
  REMOVE_POLYLINE(75, "removePolyline"),
  REMOVE_POLYGON(77, "removePolygon"),
  REMOVE_CIRCLE(78, "removeCircle"),
  REMOVE_GROUND_OVERLAY(80, "removeGroundOverlay"),
  SET_ZOOM_CONTROLS_ENABLED(82, "setZoomControlsEnabled"),
  PAUSE_LOCATION_SIMULATION(85, "pauseLocationSimulation"),
  RESUME_LOCATION_SIMULATION(86, "resumeLocationSimulation"),
  START_UPDATING_LOCATION(87, "startUpdatingLocation"),
  STOP_UPDATING_LOCATION(88, "stopUpdatingLocation"),
  SET_RECENTER_BUTTON_ENABLED(89, "setRecenterButtonEnabled");

  private final int value;
  private final String name;

  Command(int value, String name) {
    this.value = value;
    this.name = name;
  }

  public int getValue() {
    return value;
  }

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
