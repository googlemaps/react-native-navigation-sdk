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

import android.graphics.Color;
import android.location.Location;
import android.os.Build;
import android.util.Log;
import androidx.annotation.Nullable;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.maps.model.CameraPosition;
import com.google.android.gms.maps.model.Circle;
import com.google.android.gms.maps.model.GroundOverlay;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.Polygon;
import com.google.android.gms.maps.model.Polyline;
import com.google.android.libraries.mapsplatform.turnbyturn.model.StepInfo;
import com.google.android.libraries.navigation.AlternateRoutesStrategy;
import com.google.android.libraries.navigation.CustomRoutesOptions;
import com.google.android.libraries.navigation.DisplayOptions;
import com.google.android.libraries.navigation.NavigationRoadStretchRenderingData;
import com.google.android.libraries.navigation.RouteSegment;
import com.google.android.libraries.navigation.RoutingOptions;
import com.google.android.libraries.navigation.Waypoint;
import java.util.List;
import java.util.Map;

public class ObjectTranslationUtil {

  /**
   * Parses a standardized hex color string (#RRGGBBAA format) and returns an Android color int.
   * This method expects colors in #RRGGBBAA format only (8 characters after #). The JavaScript
   * layer handles conversion from all React Native color formats to this standardized format using
   * processColor.
   *
   * @param hexString The hex color string in #RRGGBBAA format (e.g., "#FF0000FF")
   * @return Android color int in AARRGGBB format, or null if invalid
   */
  @Nullable
  public static Integer parseColorFromHexString(@Nullable String hexString) {
    if (hexString == null || !hexString.startsWith("#")) {
      return null;
    }

    String hexValue = hexString.substring(1);
    int length = hexValue.length();

    // We only support the standardized #RRGGBBAA format (8 hex chars)
    if (length != 8) {
      Log.w(
          "ObjectTranslationUtil",
          "parseColorFromHexString expects #RRGGBBAA format (8 hex chars), got: " + hexString);
      return null;
    }

    try {
      // #RRGGBBAA - Parse with alpha LAST
      long value = Long.parseLong(hexValue, 16);
      int r = (int) ((value & 0xFF000000L) >> 24);
      int g = (int) ((value & 0x00FF0000L) >> 16);
      int b = (int) ((value & 0x0000FF00L) >> 8);
      int a = (int) (value & 0x000000FFL); // Alpha is last

      // Construct Android color int in AARRGGBB format (alpha first)
      return (a << 24) | (r << 16) | (g << 8) | b;

    } catch (NumberFormatException e) {
      return null;
    }
  }

  /**
   * Converts an Android color int (AARRGGBB format) to standardized hex string (#RRGGBBAA).
   *
   * @param colorInt The color in AARRGGBB format (int)
   * @return A hex string in #RRGGBBAA format (e.g., "#FF0000FF")
   */
  public static String colorIntToHexString(int colorInt) {
    int a = Color.alpha(colorInt);
    int r = Color.red(colorInt);
    int g = Color.green(colorInt);
    int b = Color.blue(colorInt);
    // Standardized format: #RRGGBBAA (alpha last)
    return String.format("#%02X%02X%02X%02X", r, g, b, a);
  }

  public static WritableMap getMapFromRouteSegment(RouteSegment routeSegment) {
    WritableMap parentMap = Arguments.createMap();

    // Destination latLng
    WritableMap mapDestLatLng = Arguments.createMap();
    parentMap.putMap("destinationLatLng", getMapFromLatLng(routeSegment.getDestinationLatLng()));

    // Destination waypoint
    parentMap.putMap(
        "destinationWaypoint", getMapFromWaypoint(routeSegment.getDestinationWaypoint()));

    // Lat Lngs
    WritableArray latLngArr = Arguments.createArray();
    for (LatLng latLng : routeSegment.getLatLngs()) {
      latLngArr.pushMap(getMapFromLatLng(latLng));
    }
    parentMap.putArray("segmentLatLngList", latLngArr);

    // Traffic data
    WritableArray stretchRenderingDataArr = Arguments.createArray();
    for (NavigationRoadStretchRenderingData data :
        routeSegment.getTrafficData().getRoadStretchRenderingDataList()) {
      WritableMap mapRenderingData = Arguments.createMap();
      mapRenderingData.putInt("lengthMeters", data.getLengthMeters());
      mapRenderingData.putInt("offsetMeters", data.getOffsetMeters());
      mapRenderingData.putString("style", data.getStyle().name());
      stretchRenderingDataArr.pushMap(mapRenderingData);
    }

    WritableMap mapTrafficData = Arguments.createMap();
    mapTrafficData.putArray("roadStretchRenderingDataList", stretchRenderingDataArr);
    mapTrafficData.putString("status", routeSegment.getTrafficData().getStatus().name());
    parentMap.putMap("navigationTrafficData", mapTrafficData);

    return parentMap;
  }

  public static WritableMap getMapFromLatLng(LatLng latLng) {
    WritableMap map = Arguments.createMap();
    map.putDouble(Constants.LAT_FIELD_KEY, latLng.latitude);
    map.putDouble(Constants.LNG_FIELD_KEY, latLng.longitude);
    return map;
  }

  public static WritableMap getMapFromWaypoint(Waypoint waypoint) {
    WritableMap map = Arguments.createMap();

    map.putMap("position", getMapFromLatLng(waypoint.getPosition()));
    map.putString("title", waypoint.getTitle());
    map.putString("placeId", waypoint.getPlaceId());
    map.putInt("preferredHeading", waypoint.getPreferredHeading());
    map.putBoolean("vehicleStopover", waypoint.getVehicleStopover());
    map.putBoolean("preferSameSideOfRoad", waypoint.getPreferSameSideOfRoad());

    return map;
  }

  public static WritableMap getMapFromStepInfo(StepInfo stepInfo) {
    WritableMap map = Arguments.createMap();
    map.putInt("distanceFromPrevStepMeters", stepInfo.getDistanceFromPrevStepMeters());
    map.putInt("timeFromPrevStepSeconds", stepInfo.getTimeFromPrevStepSeconds());
    map.putInt("drivingSide", stepInfo.getDrivingSide());
    map.putInt("stepNumber", stepInfo.getStepNumber());
    map.putInt("maneuver", stepInfo.getManeuver());
    map.putInt("roundaboutTurnNumber", stepInfo.getRoundaboutTurnNumber());
    map.putString("exitNumber", stepInfo.getExitNumber());
    map.putString("fullRoadName", stepInfo.getFullRoadName());
    map.putString("instruction", stepInfo.getFullInstructionText());
    return map;
  }

  public static DisplayOptions getDisplayOptionsFromMap(Map map) {
    DisplayOptions options = new DisplayOptions();

    if (map.containsKey("showDestinationMarkers")) {
      options.hideDestinationMarkers(!CollectionUtil.getBool("showDestinationMarkers", map, true));
    }

    // Note: showStopSigns and showTrafficLights are deprecated in Navigation SDK
    // 7.0.0
    // and now default to true. These will be removed in SDK 8.0.0
    if (map.containsKey("showStopSigns")) {
      boolean showStopSigns = CollectionUtil.getBool("showStopSigns", map, true);
      // noinspection deprecation
      options.showStopSigns(showStopSigns);
    }

    if (map.containsKey("showTrafficLights")) {
      boolean showTrafficLights = CollectionUtil.getBool("showTrafficLights", map, true);
      // noinspection deprecation
      options.showTrafficLights(showTrafficLights);
    }

    return options;
  }

  public static RoutingOptions getRoutingOptionsFromMap(Map map) {
    RoutingOptions options = new RoutingOptions();

    if (map.containsKey("avoidTolls")) {
      options.avoidTolls(CollectionUtil.getBool("avoidTolls", map, false));
    }

    if (map.containsKey("avoidHighways")) {
      options.avoidHighways(CollectionUtil.getBool("avoidHighways", map, false));
    }

    if (map.containsKey("avoidFerries")) {
      options.avoidFerries(CollectionUtil.getBool("avoidFerries", map, true));
    }

    if (map.containsKey("travelMode")) {
      options.travelMode(
          CollectionUtil.getInt("travelMode", map, RoutingOptions.TravelMode.DRIVING));
    }

    if (map.containsKey("routingStrategy")) {
      options.routingStrategy(
          CollectionUtil.getInt(
              "routingStrategy", map, RoutingOptions.RoutingStrategy.DEFAULT_BEST));
    }

    if (map.containsKey("alternateRoutesStrategy")) {
      int routesStrategyJsValue = CollectionUtil.getInt("alternateRoutesStrategy", map, -1);

      AlternateRoutesStrategy routeStrategy =
          EnumTranslationUtil.getAlternateRoutesStrategyFromJsValue(routesStrategyJsValue);

      options.alternateRoutesStrategy(routeStrategy);
    }

    return options;
  }

  public static CustomRoutesOptions getCustomRoutesOptionsFromMap(Map map)
      throws IllegalStateException {
    String routeToken = CollectionUtil.getString("routeToken", map);

    CustomRoutesOptions.Builder builder = CustomRoutesOptions.builder().setRouteToken(routeToken);

    if (map.containsKey("travelMode")) {
      int travelModeJsValue =
          CollectionUtil.getInt("travelMode", map, RoutingOptions.TravelMode.DRIVING);
      builder.setTravelMode(EnumTranslationUtil.getTravelModeFromJsValue(travelModeJsValue));
    }

    return builder.build();
  }

  public static LatLng getLatLngFromMap(Map map) {
    if (map.get(Constants.LAT_FIELD_KEY) == null || map.get(Constants.LNG_FIELD_KEY) == null) {
      return null;
    }

    return new LatLng(
        (Double) map.get(Constants.LAT_FIELD_KEY), (Double) map.get(Constants.LNG_FIELD_KEY));
  }

  public static WritableMap getMapFromLocation(Location location) {
    WritableMap map = Arguments.createMap();
    map.putDouble(Constants.LNG_FIELD_KEY, location.getLongitude());
    map.putDouble(Constants.LAT_FIELD_KEY, location.getLatitude());
    map.putDouble("time", location.getTime());
    map.putDouble("speed", location.getSpeed());
    map.putString("provider", location.getProvider());

    if (location.hasBearing()) {
      map.putDouble("bearing", location.getBearing());
    }

    if (location.hasAccuracy()) {
      map.putDouble("accuracy", location.getAccuracy());
    }

    if (location.hasAltitude()) {
      map.putDouble("altitude", location.getAltitude());
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      if (location.hasVerticalAccuracy()) {
        map.putDouble("verticalAccuracy", location.getVerticalAccuracyMeters());
      }
    }
    return map;
  }

  public static WritableMap getMapFromGroundOverlay(GroundOverlay overlay) {
    return getMapFromGroundOverlay(overlay, overlay.getId());
  }

  public static WritableMap getMapFromGroundOverlay(GroundOverlay overlay, String effectiveId) {
    WritableMap map = Arguments.createMap();

    // Position may be null if created with bounds - calculate from bounds center if so
    if (overlay.getPosition() != null) {
      map.putMap("position", ObjectTranslationUtil.getMapFromLatLng(overlay.getPosition()));
    } else if (overlay.getBounds() != null) {
      // Calculate position from bounds center
      map.putMap(
          "position", ObjectTranslationUtil.getMapFromLatLng(overlay.getBounds().getCenter()));
    }

    // Bounds is always available
    if (overlay.getBounds() != null) {
      WritableMap mapBounds = Arguments.createMap();
      mapBounds.putMap(
          "northEast", ObjectTranslationUtil.getMapFromLatLng(overlay.getBounds().northeast));
      mapBounds.putMap(
          "southWest", ObjectTranslationUtil.getMapFromLatLng(overlay.getBounds().southwest));
      mapBounds.putMap(
          "center", ObjectTranslationUtil.getMapFromLatLng(overlay.getBounds().getCenter()));
      map.putMap("bounds", mapBounds);
    }

    map.putString("id", effectiveId);
    map.putDouble("height", overlay.getHeight());
    map.putDouble("width", overlay.getWidth());
    map.putDouble("bearing", overlay.getBearing());
    map.putDouble("transparency", overlay.getTransparency());
    map.putInt("zIndex", (int) overlay.getZIndex());

    return map;
  }

  public static WritableMap getMapFromMarker(Marker marker) {
    return getMapFromMarker(marker, marker.getId());
  }

  public static WritableMap getMapFromMarker(Marker marker, String effectiveId) {
    WritableMap map = Arguments.createMap();

    map.putMap("position", getMapFromLatLng(marker.getPosition()));
    map.putString("id", effectiveId);
    map.putString("title", marker.getTitle());
    map.putDouble("alpha", marker.getAlpha());
    map.putDouble("rotation", marker.getRotation());
    map.putString("snippet", marker.getSnippet());
    map.putDouble("zIndex", marker.getZIndex());

    return map;
  }

  public static WritableMap getMapFromCircle(Circle circle) {
    return getMapFromCircle(circle, circle.getId());
  }

  public static WritableMap getMapFromCircle(Circle circle, String effectiveId) {
    WritableMap map = Arguments.createMap();
    map.putMap("center", ObjectTranslationUtil.getMapFromLatLng(circle.getCenter()));

    map.putString("id", effectiveId);
    map.putInt("fillColor", circle.getFillColor());
    map.putDouble("strokeWidth", circle.getStrokeWidth());
    map.putInt("strokeColor", circle.getStrokeColor());
    map.putDouble("radius", circle.getRadius());
    map.putDouble("zIndex", circle.getZIndex());

    return map;
  }

  public static WritableMap getMapFromPolyline(Polyline polyline) {
    return getMapFromPolyline(polyline, polyline.getId());
  }

  public static WritableMap getMapFromPolyline(Polyline polyline, String effectiveId) {
    WritableMap map = Arguments.createMap();
    WritableArray pointsArr = Arguments.createArray();

    for (LatLng point : polyline.getPoints()) {
      pointsArr.pushMap(ObjectTranslationUtil.getMapFromLatLng(point));
    }
    map.putArray("points", pointsArr);

    map.putString("id", effectiveId);
    map.putInt("color", polyline.getColor());
    map.putDouble("width", polyline.getWidth());
    map.putInt("jointType", polyline.getJointType());
    map.putDouble("zIndex", polyline.getZIndex());

    return map;
  }

  public static WritableMap getMapFromPolygon(Polygon polygon) {
    return getMapFromPolygon(polygon, polygon.getId());
  }

  public static WritableMap getMapFromPolygon(Polygon polygon, String effectiveId) {

    WritableMap map = Arguments.createMap();
    WritableArray pointsArr = Arguments.createArray();
    for (LatLng point : polygon.getPoints()) {
      pointsArr.pushMap(ObjectTranslationUtil.getMapFromLatLng(point));
    }

    map.putArray("points", pointsArr);

    WritableArray holesArr = Arguments.createArray();
    for (List<LatLng> holes : polygon.getHoles()) {
      WritableArray holeArr = Arguments.createArray();

      for (LatLng point : holes) {
        holesArr.pushMap(ObjectTranslationUtil.getMapFromLatLng(point));
      }

      holesArr.pushArray(holeArr);
    }
    map.putArray("holes", holesArr);

    map.putString("id", effectiveId);
    map.putInt("fillColor", polygon.getFillColor());
    map.putDouble("strokeWidth", polygon.getStrokeWidth());
    map.putInt("strokeColor", polygon.getStrokeColor());
    map.putInt("strokeJointType", polygon.getStrokeJointType());
    map.putDouble("zIndex", polygon.getZIndex());
    map.putBoolean("geodesic", polygon.isGeodesic());

    return map;
  }

  /**
   * Converts a ReadableMap representing an initial camera position to a CameraPosition object. Used
   * for setting initial camera when creating a map.
   *
   * @param cameraMap ReadableMap with keys: target (lat/lng), zoom, bearing, tilt
   * @return CameraPosition or null if cameraMap is null or invalid
   */
  @Nullable
  public static CameraPosition getCameraPositionFromMap(@Nullable ReadableMap cameraMap) {
    if (cameraMap == null) {
      return null;
    }

    CameraPosition.Builder builder = new CameraPosition.Builder();

    // Set target (lat/lng)
    if (cameraMap.hasKey("target") && !cameraMap.isNull("target")) {
      ReadableMap targetMap = cameraMap.getMap("target");
      if (targetMap != null
          && targetMap.hasKey("lat")
          && targetMap.hasKey("lng")
          && !targetMap.isNull("lat")
          && !targetMap.isNull("lng")) {
        double lat = targetMap.getDouble("lat");
        double lng = targetMap.getDouble("lng");
        builder.target(new LatLng(lat, lng));
      }
    }

    // Set zoom
    if (cameraMap.hasKey("zoom") && !cameraMap.isNull("zoom")) {
      builder.zoom((float) cameraMap.getDouble("zoom"));
    }

    // Set bearing
    if (cameraMap.hasKey("bearing") && !cameraMap.isNull("bearing")) {
      builder.bearing((float) cameraMap.getDouble("bearing"));
    }

    // Set tilt
    if (cameraMap.hasKey("tilt") && !cameraMap.isNull("tilt")) {
      builder.tilt((float) cameraMap.getDouble("tilt"));
    }

    return builder.build();
  }
}
