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

import android.location.Location;
import android.os.Build;
import com.facebook.react.bridge.Arguments;
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
import com.google.android.libraries.navigation.DisplayOptions;
import com.google.android.libraries.navigation.NavigationRoadStretchRenderingData;
import com.google.android.libraries.navigation.RouteSegment;
import com.google.android.libraries.navigation.RoutingOptions;
import com.google.android.libraries.navigation.Waypoint;
import java.util.List;
import java.util.Map;

public class GMNObjectTranslationUtil {
  public static WritableMap getMapFromRouteSegment(RouteSegment routeSegment) {
    WritableMap parentMap = Arguments.createMap();

    parentMap.putMap("destinationLatLng", getMapFromLatLng(routeSegment.getDestinationLatLng()));

    parentMap.putMap(
        "destinationWaypoint", getMapFromWaypoint(routeSegment.getDestinationWaypoint()));

    WritableArray latLngArr = Arguments.createArray();
    for (LatLng latLng : routeSegment.getLatLngs()) {
      latLngArr.pushMap(getMapFromLatLng(latLng));
    }
    parentMap.putArray("segmentLatLngList", latLngArr);

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
    map.putDouble("lat", latLng.latitude);
    map.putDouble("lng", latLng.longitude);
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

  public static DisplayOptions getDisplayOptionsFromMap(Map<String, Object> map) {
    DisplayOptions options = new DisplayOptions();

    if (map.containsKey("showDestinationMarkers")) {
      options.hideDestinationMarkers(
          !GMNCollectionUtil.getBool("showDestinationMarkers", map, true));
    }

    if (map.containsKey("showStopSigns")) {
      options.showStopSigns(GMNCollectionUtil.getBool("showStopSigns", map, false));
    }

    if (map.containsKey("showTrafficLights")) {
      options.showTrafficLights(GMNCollectionUtil.getBool("showTrafficLights", map, false));
    }

    return options;
  }

  public static RoutingOptions getRoutingOptionsFromMap(Map<String, Object> map) {
    RoutingOptions options = new RoutingOptions();

    if (map.containsKey("avoidTolls")) {
      options.avoidTolls(GMNCollectionUtil.getBool("avoidTolls", map, false));
    }

    if (map.containsKey("avoidHighways")) {
      options.avoidHighways(GMNCollectionUtil.getBool("avoidHighways", map, false));
    }

    if (map.containsKey("avoidFerries")) {
      options.avoidFerries(GMNCollectionUtil.getBool("avoidFerries", map, true));
    }

    if (map.containsKey("travelMode")) {
      options.travelMode(
          GMNCollectionUtil.getInt("travelMode", map, RoutingOptions.TravelMode.DRIVING));
    }

    if (map.containsKey("routingStrategy")) {
      options.routingStrategy(
          GMNCollectionUtil.getInt(
              "routingStrategy", map, RoutingOptions.RoutingStrategy.DEFAULT_BEST));
    }

    if (map.containsKey("alternateRoutesStrategy")) {
      int routesStrategyJsValue = GMNCollectionUtil.getInt("alternateRoutesStrategy", map, -1);

      AlternateRoutesStrategy routeStrategy =
          GMNEnumTranslationUtil.getAlternateRoutesStrategyFromJsValue(routesStrategyJsValue);

      options.alternateRoutesStrategy(routeStrategy);
    }

    return options;
  }

  public static LatLng getLatLngFromMap(Map<String, Object> map) {
    if (map.get(GMNConstants.LAT_FIELD_KEY) == null
        || map.get(GMNConstants.LNG_FIELD_KEY) == null) {
      return null;
    }

    return new LatLng(
        (Double) map.get(GMNConstants.LAT_FIELD_KEY), (Double) map.get(GMNConstants.LNG_FIELD_KEY));
  }

  public static CameraPosition getCameraPositionFromMap(Map<String, Object> map) {
    float zoom = (float) GMNCollectionUtil.getDouble("zoom", map, 0);
    float tilt = (float) GMNCollectionUtil.getDouble("tilt", map, 0);
    float bearing = (float) GMNCollectionUtil.getDouble("bearing", map, 0);
    return new CameraPosition.Builder()
        .target(
            getLatLngFromMap((Map<String, Object>) map.get("target"))) // Set the target location
        .zoom(zoom) // Set the desired zoom level
        .tilt(tilt) // Set the desired tilt angle (0 for straight down, 90 for straight
        // up)
        .bearing(bearing) // Set the desired bearing (rotation angle in degrees)
        .build();
  }

  public static WritableMap getMapFromLocation(Location location) {
    WritableMap map = Arguments.createMap();
    map.putDouble("lng", location.getLongitude());
    map.putDouble("lat", location.getLatitude());
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

  public static WritableMap getMapFromGroundOverlay(GMNGroundOverlay gmnOverlay) {
    GroundOverlay overlay = gmnOverlay.groundOverlay();
    String rnId = gmnOverlay.rnId();

    WritableMap map = Arguments.createMap();

    map.putMap("position", GMNObjectTranslationUtil.getMapFromLatLng(overlay.getPosition()));

    WritableMap mapBounds = Arguments.createMap();

    mapBounds.putMap(
        "northEast", GMNObjectTranslationUtil.getMapFromLatLng(overlay.getBounds().northeast));
    mapBounds.putMap(
        "southWest", GMNObjectTranslationUtil.getMapFromLatLng(overlay.getBounds().southwest));
    mapBounds.putMap(
        "center", GMNObjectTranslationUtil.getMapFromLatLng(overlay.getBounds().getCenter()));

    map.putMap("bounds", mapBounds);

    map.putString("id", rnId != null ? rnId : overlay.getId());
    map.putDouble("height", overlay.getHeight());
    map.putDouble("width", overlay.getWidth());
    map.putDouble("bearing", overlay.getBearing());
    map.putDouble("transparency", overlay.getTransparency());
    map.putDouble("zIndex", overlay.getZIndex());

    return map;
  }

  public static WritableMap getMapFromMarker(GMNMarker gmnMarker) {
    Marker marker = gmnMarker.marker();
    String rnId = gmnMarker.rnId();

    WritableMap map = Arguments.createMap();
    map.putMap("position", getMapFromLatLng(marker.getPosition()));
    map.putString("id", rnId != null ? rnId : marker.getId());
    map.putString("title", marker.getTitle());
    map.putDouble("alpha", marker.getAlpha());
    map.putDouble("rotation", marker.getRotation());
    map.putString("snippet", marker.getSnippet());
    map.putDouble("zIndex", marker.getZIndex());

    return map;
  }

  public static WritableMap getMapFromCircle(GMNCircle gmnCircle) {
    Circle circle = gmnCircle.circle();
    String rnId = gmnCircle.rnId();

    WritableMap map = Arguments.createMap();
    map.putMap("center", GMNObjectTranslationUtil.getMapFromLatLng(circle.getCenter()));

    map.putString("id", rnId != null ? rnId : circle.getId());
    map.putInt("fillColor", circle.getFillColor());
    map.putDouble("strokeWidth", circle.getStrokeWidth());
    map.putInt("strokeColor", circle.getStrokeColor());
    map.putDouble("radius", circle.getRadius());
    map.putDouble("zIndex", circle.getZIndex());

    return map;
  }

  public static WritableMap getMapFromPolyline(GMNPolyline gmnPolyline) {
    Polyline polyline = gmnPolyline.polyline();
    String rnId = gmnPolyline.rnId();

    WritableMap map = Arguments.createMap();
    WritableArray pointsArr = Arguments.createArray();

    for (LatLng point : polyline.getPoints()) {
      pointsArr.pushMap(GMNObjectTranslationUtil.getMapFromLatLng(point));
    }
    map.putArray("points", pointsArr);

    map.putString("id", rnId != null ? rnId : polyline.getId());
    map.putInt("color", polyline.getColor());
    map.putDouble("width", polyline.getWidth());
    map.putInt("jointType", polyline.getJointType());
    map.putDouble("zIndex", polyline.getZIndex());

    return map;
  }

  public static WritableMap getMapFromPolygon(GMNPolygon gmnPolygon) {
    Polygon polygon = gmnPolygon.polygon();
    String rnId = gmnPolygon.rnId();

    WritableMap map = Arguments.createMap();
    WritableArray pointsArr = Arguments.createArray();
    for (LatLng point : polygon.getPoints()) {
      pointsArr.pushMap(GMNObjectTranslationUtil.getMapFromLatLng(point));
    }

    map.putArray("points", pointsArr);

    WritableArray holesArr = Arguments.createArray();
    for (List<LatLng> holes : polygon.getHoles()) {
      WritableArray holeArr = Arguments.createArray();

      for (LatLng point : holes) {
        holesArr.pushMap(GMNObjectTranslationUtil.getMapFromLatLng(point));
      }

      holesArr.pushArray(holeArr);
    }
    map.putArray("holes", holesArr);

    map.putString("id", rnId != null ? rnId : polygon.getId());
    map.putInt("fillColor", polygon.getFillColor());
    map.putDouble("strokeWidth", polygon.getStrokeWidth());
    map.putInt("strokeColor", polygon.getStrokeColor());
    map.putInt("strokeJointType", polygon.getStrokeJointType());
    map.putDouble("zIndex", polygon.getZIndex());
    map.putBoolean("geodesic", polygon.isGeodesic());

    return map;
  }
}
