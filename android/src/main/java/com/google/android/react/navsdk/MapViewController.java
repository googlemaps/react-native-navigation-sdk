/**
 * Copyright 2024 Google LLC
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

import android.annotation.SuppressLint;
import android.app.Activity;
import androidx.core.util.Supplier;
import com.facebook.react.bridge.UiThreadUtil;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.model.BitmapDescriptor;
import com.google.android.gms.maps.model.BitmapDescriptorFactory;
import com.google.android.gms.maps.model.CameraPosition;
import com.google.android.gms.maps.model.Circle;
import com.google.android.gms.maps.model.CircleOptions;
import com.google.android.gms.maps.model.GroundOverlay;
import com.google.android.gms.maps.model.GroundOverlayOptions;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.LatLngBounds;
import com.google.android.gms.maps.model.MapColorScheme;
import com.google.android.gms.maps.model.MapStyleOptions;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.MarkerOptions;
import com.google.android.gms.maps.model.Polygon;
import com.google.android.gms.maps.model.PolygonOptions;
import com.google.android.gms.maps.model.Polyline;
import com.google.android.gms.maps.model.PolylineOptions;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executors;

public class MapViewController implements INavigationViewControllerProperties {
  private GoogleMap mGoogleMap;
  private Supplier<Activity> activitySupplier;
  private INavigationViewCallback mNavigationViewCallback;

  // Map storage: key is the effective ID (custom ID if provided, otherwise native ID)
  private final Map<String, Marker> markerMap = new HashMap<>();
  private final Map<String, Polyline> polylineMap = new HashMap<>();
  private final Map<String, Polygon> polygonMap = new HashMap<>();
  private final Map<String, GroundOverlay> groundOverlayMap = new HashMap<>();
  private final Map<String, Circle> circleMap = new HashMap<>();

  // Reverse mapping: native ID -> effective ID (for click event handling)
  private final Map<String, String> markerNativeIdToEffectiveId = new HashMap<>();
  private final Map<String, String> polylineNativeIdToEffectiveId = new HashMap<>();
  private final Map<String, String> polygonNativeIdToEffectiveId = new HashMap<>();
  private final Map<String, String> groundOverlayNativeIdToEffectiveId = new HashMap<>();
  private final Map<String, String> circleNativeIdToEffectiveId = new HashMap<>();

  private String style = "";

  // Zoom level preferences (-1 means use map's current value)
  private Float minZoomLevelPreference = null;
  private Float maxZoomLevelPreference = null;

  public void initialize(GoogleMap googleMap, Supplier<Activity> activitySupplier) {
    this.mGoogleMap = googleMap;
    this.activitySupplier = activitySupplier;
  }

  public void setupMapListeners(INavigationViewCallback navigationViewCallback) {
    this.mNavigationViewCallback = navigationViewCallback;
    if (mGoogleMap == null || mNavigationViewCallback == null) return;

    mGoogleMap.setOnMarkerClickListener(
        marker -> {
          mNavigationViewCallback.onMarkerClick(marker);
          return false;
        });

    mGoogleMap.setOnPolylineClickListener(
        polyline -> mNavigationViewCallback.onPolylineClick(polyline));
    mGoogleMap.setOnPolygonClickListener(
        polygon -> mNavigationViewCallback.onPolygonClick(polygon));
    mGoogleMap.setOnCircleClickListener(circle -> mNavigationViewCallback.onCircleClick(circle));
    mGoogleMap.setOnGroundOverlayClickListener(
        groundOverlay -> mNavigationViewCallback.onGroundOverlayClick(groundOverlay));
    mGoogleMap.setOnInfoWindowClickListener(
        marker -> mNavigationViewCallback.onMarkerInfoWindowTapped(marker));
    mGoogleMap.setOnMapClickListener(latLng -> mNavigationViewCallback.onMapClick(latLng));
  }

  public GoogleMap getGoogleMap() {
    return mGoogleMap;
  }

  /**
   * Get the effective ID for a marker from its native ID. Returns the custom ID if one was
   * provided, otherwise returns the native ID.
   */
  public String getMarkerEffectiveId(String nativeId) {
    String effectiveId = markerNativeIdToEffectiveId.get(nativeId);
    return effectiveId != null ? effectiveId : nativeId;
  }

  /**
   * Get the effective ID for a polyline from its native ID. Returns the custom ID if one was
   * provided, otherwise returns the native ID.
   */
  public String getPolylineEffectiveId(String nativeId) {
    String effectiveId = polylineNativeIdToEffectiveId.get(nativeId);
    return effectiveId != null ? effectiveId : nativeId;
  }

  /**
   * Get the effective ID for a polygon from its native ID. Returns the custom ID if one was
   * provided, otherwise returns the native ID.
   */
  public String getPolygonEffectiveId(String nativeId) {
    String effectiveId = polygonNativeIdToEffectiveId.get(nativeId);
    return effectiveId != null ? effectiveId : nativeId;
  }

  /**
   * Get the effective ID for a circle from its native ID. Returns the custom ID if one was
   * provided, otherwise returns the native ID.
   */
  public String getCircleEffectiveId(String nativeId) {
    String effectiveId = circleNativeIdToEffectiveId.get(nativeId);
    return effectiveId != null ? effectiveId : nativeId;
  }

  /**
   * Get the effective ID for a ground overlay from its native ID. Returns the custom ID if one was
   * provided, otherwise returns the native ID.
   */
  public String getGroundOverlayEffectiveId(String nativeId) {
    String effectiveId = groundOverlayNativeIdToEffectiveId.get(nativeId);
    return effectiveId != null ? effectiveId : nativeId;
  }

  public Circle addCircle(Map<String, Object> optionsMap) {
    if (mGoogleMap == null) {
      return null;
    }

    // Determine effective ID: use custom ID if provided
    String customId = CollectionUtil.getString("id", optionsMap);

    // If custom ID provided and object exists, update it instead of recreating
    if (customId != null && !customId.isEmpty() && circleMap.containsKey(customId)) {
      Circle existingCircle = circleMap.get(customId);
      updateCircle(existingCircle, optionsMap);
      return existingCircle;
    }

    // Create new circle
    return createCircle(optionsMap, customId);
  }

  private Circle createCircle(Map<String, Object> optionsMap, String customId) {
    CircleOptions options = new CircleOptions();

    float strokeWidth =
        Double.valueOf(CollectionUtil.getDouble("strokeWidth", optionsMap, 0)).floatValue();
    options.strokeWidth(strokeWidth);

    double radius = CollectionUtil.getDouble("radius", optionsMap, 0.0);
    options.radius(radius);

    boolean visible = CollectionUtil.getBool("visible", optionsMap, true);
    options.visible(visible);

    options.center(
        ObjectTranslationUtil.getLatLngFromMap((Map<String, Object>) optionsMap.get("center")));

    boolean clickable = CollectionUtil.getBool("clickable", optionsMap, false);
    options.clickable(clickable);

    if (optionsMap.containsKey("strokeColor")) {
      int strokeColor = CollectionUtil.getInt("strokeColor", optionsMap, 0);
      options.strokeColor(strokeColor);
    }

    if (optionsMap.containsKey("fillColor")) {
      int fillColor = CollectionUtil.getInt("fillColor", optionsMap, 0);
      options.fillColor(fillColor);
    }

    Circle circle = mGoogleMap.addCircle(options);

    String effectiveId = (customId != null && !customId.isEmpty()) ? customId : circle.getId();

    circleMap.put(effectiveId, circle);
    circleNativeIdToEffectiveId.put(circle.getId(), effectiveId);

    return circle;
  }

  private void updateCircle(Circle circle, Map<String, Object> optionsMap) {
    float strokeWidth =
        Double.valueOf(CollectionUtil.getDouble("strokeWidth", optionsMap, 0)).floatValue();
    circle.setStrokeWidth(strokeWidth);

    double radius = CollectionUtil.getDouble("radius", optionsMap, 0.0);
    circle.setRadius(radius);

    boolean visible = CollectionUtil.getBool("visible", optionsMap, true);
    circle.setVisible(visible);

    circle.setCenter(
        ObjectTranslationUtil.getLatLngFromMap((Map<String, Object>) optionsMap.get("center")));

    boolean clickable = CollectionUtil.getBool("clickable", optionsMap, false);
    circle.setClickable(clickable);

    if (optionsMap.containsKey("strokeColor")) {
      int strokeColor = CollectionUtil.getInt("strokeColor", optionsMap, 0);
      circle.setStrokeColor(strokeColor);
    }

    if (optionsMap.containsKey("fillColor")) {
      int fillColor = CollectionUtil.getInt("fillColor", optionsMap, 0);
      circle.setFillColor(fillColor);
    }
  }

  public Marker addMarker(Map<String, Object> optionsMap) {
    if (mGoogleMap == null) {
      return null;
    }

    // Determine effective ID: use custom ID if provided
    String customId = CollectionUtil.getString("id", optionsMap);

    // If custom ID provided and object exists, update it instead of recreating
    if (customId != null && !customId.isEmpty() && markerMap.containsKey(customId)) {
      Marker existingMarker = markerMap.get(customId);
      updateMarker(existingMarker, optionsMap);
      return existingMarker;
    }

    // Create new marker
    return createMarker(optionsMap, customId);
  }

  private Marker createMarker(Map<String, Object> optionsMap, String customId) {
    String imagePath = CollectionUtil.getString("imgPath", optionsMap);
    String title = CollectionUtil.getString("title", optionsMap);
    String snippet = CollectionUtil.getString("snippet", optionsMap);
    float alpha = Double.valueOf(CollectionUtil.getDouble("alpha", optionsMap, 1)).floatValue();
    float rotation =
        Double.valueOf(CollectionUtil.getDouble("rotation", optionsMap, 0)).floatValue();
    boolean draggable = CollectionUtil.getBool("draggable", optionsMap, false);
    boolean flat = CollectionUtil.getBool("flat", optionsMap, false);
    boolean visible = CollectionUtil.getBool("visible", optionsMap, true);

    MarkerOptions options = new MarkerOptions();
    if (imagePath != null && !imagePath.isEmpty()) {
      try {
        BitmapDescriptor icon = BitmapDescriptorFactory.fromAsset(imagePath);
        options.icon(icon);
      } catch (Exception e) {
        throw new IllegalArgumentException(JsErrors.INVALID_IMAGE_ERROR_MESSAGE);
      }
    }

    options.position(
        ObjectTranslationUtil.getLatLngFromMap((Map<String, Object>) optionsMap.get("position")));

    if (title != null) {
      options.title(title);
    }

    if (snippet != null) {
      options.snippet(snippet);
    }

    options.flat(flat);
    options.alpha(alpha);
    options.rotation(rotation);
    options.draggable(draggable);
    options.visible(visible);

    Marker marker = mGoogleMap.addMarker(options);

    String effectiveId = (customId != null && !customId.isEmpty()) ? customId : marker.getId();

    markerMap.put(effectiveId, marker);
    markerNativeIdToEffectiveId.put(marker.getId(), effectiveId);

    return marker;
  }

  private void updateMarker(Marker marker, Map<String, Object> optionsMap) {
    String imagePath = CollectionUtil.getString("imgPath", optionsMap);
    String title = CollectionUtil.getString("title", optionsMap);
    String snippet = CollectionUtil.getString("snippet", optionsMap);
    float alpha = Double.valueOf(CollectionUtil.getDouble("alpha", optionsMap, 1)).floatValue();
    float rotation =
        Double.valueOf(CollectionUtil.getDouble("rotation", optionsMap, 0)).floatValue();
    boolean draggable = CollectionUtil.getBool("draggable", optionsMap, false);
    boolean flat = CollectionUtil.getBool("flat", optionsMap, false);
    boolean visible = CollectionUtil.getBool("visible", optionsMap, true);

    if (imagePath != null && !imagePath.isEmpty()) {
      try {
        BitmapDescriptor icon = BitmapDescriptorFactory.fromAsset(imagePath);
        marker.setIcon(icon);
      } catch (Exception e) {
        throw new IllegalArgumentException(JsErrors.INVALID_IMAGE_ERROR_MESSAGE);
      }
    }

    marker.setPosition(
        ObjectTranslationUtil.getLatLngFromMap((Map<String, Object>) optionsMap.get("position")));

    if (title != null) {
      marker.setTitle(title);
    }

    if (snippet != null) {
      marker.setSnippet(snippet);
    }

    marker.setFlat(flat);
    marker.setAlpha(alpha);
    marker.setRotation(rotation);
    marker.setDraggable(draggable);
    marker.setVisible(visible);
  }

  public Polyline addPolyline(Map<String, Object> optionsMap) {
    if (mGoogleMap == null) {
      return null;
    }

    // Determine effective ID: use custom ID if provided
    String customId = CollectionUtil.getString("id", optionsMap);

    // If custom ID provided and object exists, update it instead of recreating
    if (customId != null && !customId.isEmpty() && polylineMap.containsKey(customId)) {
      Polyline existingPolyline = polylineMap.get(customId);
      updatePolyline(existingPolyline, optionsMap);
      return existingPolyline;
    }

    // Create new polyline
    return createPolyline(optionsMap, customId);
  }

  private Polyline createPolyline(Map<String, Object> optionsMap, String customId) {
    float width = Double.valueOf(CollectionUtil.getDouble("width", optionsMap, 0)).floatValue();
    boolean clickable = CollectionUtil.getBool("clickable", optionsMap, false);
    boolean visible = CollectionUtil.getBool("visible", optionsMap, true);

    ArrayList latLngArr = (ArrayList) optionsMap.get("points");

    if (latLngArr == null) {
      return null;
    }

    PolylineOptions options = new PolylineOptions();
    for (int i = 0; i < latLngArr.size(); i++) {
      Map<String, Object> latLngMap = (Map<String, Object>) latLngArr.get(i);
      LatLng latLng = createLatLng(latLngMap);
      options.add(latLng);
    }

    if (optionsMap.containsKey("color")) {
      int color = CollectionUtil.getInt("color", optionsMap, 0);
      options.color(color);
    }

    options.width(width);
    options.clickable(clickable);
    options.visible(visible);

    Polyline polyline = mGoogleMap.addPolyline(options);

    String effectiveId = (customId != null && !customId.isEmpty()) ? customId : polyline.getId();

    polylineMap.put(effectiveId, polyline);
    polylineNativeIdToEffectiveId.put(polyline.getId(), effectiveId);

    return polyline;
  }

  private void updatePolyline(Polyline polyline, Map<String, Object> optionsMap) {
    float width = Double.valueOf(CollectionUtil.getDouble("width", optionsMap, 0)).floatValue();
    boolean clickable = CollectionUtil.getBool("clickable", optionsMap, false);
    boolean visible = CollectionUtil.getBool("visible", optionsMap, true);

    ArrayList latLngArr = (ArrayList) optionsMap.get("points");

    if (latLngArr != null) {
      List<LatLng> points = new ArrayList<>();
      for (int i = 0; i < latLngArr.size(); i++) {
        Map<String, Object> latLngMap = (Map<String, Object>) latLngArr.get(i);
        LatLng latLng = createLatLng(latLngMap);
        points.add(latLng);
      }
      polyline.setPoints(points);
    }

    if (optionsMap.containsKey("color")) {
      int color = CollectionUtil.getInt("color", optionsMap, 0);
      polyline.setColor(color);
    }

    polyline.setWidth(width);
    polyline.setClickable(clickable);
    polyline.setVisible(visible);
  }

  public Polygon addPolygon(Map<String, Object> optionsMap) {
    if (mGoogleMap == null) {
      return null;
    }

    // Determine effective ID: use custom ID if provided
    String customId = CollectionUtil.getString("id", optionsMap);

    // If custom ID provided and object exists, update it instead of recreating
    if (customId != null && !customId.isEmpty() && polygonMap.containsKey(customId)) {
      Polygon existingPolygon = polygonMap.get(customId);
      updatePolygon(existingPolygon, optionsMap);
      return existingPolygon;
    }

    // Create new polygon
    return createPolygon(optionsMap, customId);
  }

  private Polygon createPolygon(Map<String, Object> optionsMap, String customId) {
    float strokeWidth =
        Double.valueOf(CollectionUtil.getDouble("strokeWidth", optionsMap, 0)).floatValue();
    boolean clickable = CollectionUtil.getBool("clickable", optionsMap, false);
    boolean geodesic = CollectionUtil.getBool("geodesic", optionsMap, false);
    boolean visible = CollectionUtil.getBool("visible", optionsMap, true);

    ArrayList latLngArr = (ArrayList) optionsMap.get("points");

    PolygonOptions options = new PolygonOptions();
    for (int i = 0; i < latLngArr.size(); i++) {
      Map<String, Object> latLngMap = (Map<String, Object>) latLngArr.get(i);
      LatLng latLng = createLatLng(latLngMap);
      options.add(latLng);
    }

    ArrayList holesArr = (ArrayList) optionsMap.get("holes");

    for (int i = 0; i < holesArr.size(); i++) {
      ArrayList arr = (ArrayList) holesArr.get(i);

      List<LatLng> listHoles = new ArrayList<>();

      for (int j = 0; j < arr.size(); j++) {
        Map<String, Object> latLngMap = (Map<String, Object>) arr.get(j);
        LatLng latLng = createLatLng(latLngMap);

        listHoles.add(latLng);
      }

      options.addHole(listHoles);
    }

    if (optionsMap.containsKey("fillColor")) {
      int fillColor = CollectionUtil.getInt("fillColor", optionsMap, 0);
      options.fillColor(fillColor);
    }

    if (optionsMap.containsKey("strokeColor")) {
      int strokeColor = CollectionUtil.getInt("strokeColor", optionsMap, 0);
      options.strokeColor(strokeColor);
    }

    options.strokeWidth(strokeWidth);
    options.visible(visible);
    options.geodesic(geodesic);
    options.clickable(clickable);

    Polygon polygon = mGoogleMap.addPolygon(options);

    String effectiveId = (customId != null && !customId.isEmpty()) ? customId : polygon.getId();

    polygonMap.put(effectiveId, polygon);
    polygonNativeIdToEffectiveId.put(polygon.getId(), effectiveId);

    return polygon;
  }

  private void updatePolygon(Polygon polygon, Map<String, Object> optionsMap) {
    float strokeWidth =
        Double.valueOf(CollectionUtil.getDouble("strokeWidth", optionsMap, 0)).floatValue();
    boolean clickable = CollectionUtil.getBool("clickable", optionsMap, false);
    boolean geodesic = CollectionUtil.getBool("geodesic", optionsMap, false);
    boolean visible = CollectionUtil.getBool("visible", optionsMap, true);

    ArrayList latLngArr = (ArrayList) optionsMap.get("points");

    if (latLngArr != null) {
      List<LatLng> points = new ArrayList<>();
      for (int i = 0; i < latLngArr.size(); i++) {
        Map<String, Object> latLngMap = (Map<String, Object>) latLngArr.get(i);
        LatLng latLng = createLatLng(latLngMap);
        points.add(latLng);
      }
      polygon.setPoints(points);
    }

    ArrayList holesArr = (ArrayList) optionsMap.get("holes");

    if (holesArr != null) {
      List<List<LatLng>> holes = new ArrayList<>();
      for (int i = 0; i < holesArr.size(); i++) {
        ArrayList arr = (ArrayList) holesArr.get(i);
        List<LatLng> listHoles = new ArrayList<>();

        for (int j = 0; j < arr.size(); j++) {
          Map<String, Object> latLngMap = (Map<String, Object>) arr.get(j);
          LatLng latLng = createLatLng(latLngMap);
          listHoles.add(latLng);
        }

        holes.add(listHoles);
      }
      polygon.setHoles(holes);
    }

    if (optionsMap.containsKey("fillColor")) {
      int fillColor = CollectionUtil.getInt("fillColor", optionsMap, 0);
      polygon.setFillColor(fillColor);
    }

    if (optionsMap.containsKey("strokeColor")) {
      int strokeColor = CollectionUtil.getInt("strokeColor", optionsMap, 0);
      polygon.setStrokeColor(strokeColor);
    }

    polygon.setStrokeWidth(strokeWidth);
    polygon.setVisible(visible);
    polygon.setGeodesic(geodesic);
    polygon.setClickable(clickable);
  }

  public GroundOverlay addGroundOverlay(Map<String, Object> map) {
    if (mGoogleMap == null) {
      return null;
    }

    // Determine effective ID: use custom ID if provided
    String customId = CollectionUtil.getString("id", map);

    // If custom ID provided and object exists, update it instead of recreating
    if (customId != null && !customId.isEmpty() && groundOverlayMap.containsKey(customId)) {
      GroundOverlay existingOverlay = groundOverlayMap.get(customId);
      // GroundOverlay position/bounds cannot be changed after creation,
      // so we need to check if position-related properties changed
      if (needsGroundOverlayRecreation(existingOverlay, map)) {
        // Remove old and create new
        groundOverlayNativeIdToEffectiveId.remove(existingOverlay.getId());
        existingOverlay.remove();
        groundOverlayMap.remove(customId);
        return createGroundOverlay(map, customId);
      } else {
        // Update properties that can be changed
        updateGroundOverlay(existingOverlay, map);
        return existingOverlay;
      }
    }

    // Create new ground overlay
    return createGroundOverlay(map, customId);
  }

  private boolean needsGroundOverlayRecreation(GroundOverlay overlay, Map<String, Object> map) {
    // GroundOverlay position/bounds and image cannot be changed after creation
    // Check if any of these would change
    String imagePath = CollectionUtil.getString("imgPath", map);
    if (imagePath != null && !imagePath.isEmpty()) {
      // Image path specified - would need recreation
      // (We can't easily compare current image with new path)
      return true;
    }

    // Check if bounds or position has changed
    if (map.containsKey("bounds") || map.containsKey("location")) {
      // Position/bounds specified - would need recreation
      return true;
    }

    return false;
  }

  private GroundOverlay createGroundOverlay(Map<String, Object> map, String customId) {
    String imagePath = CollectionUtil.getString("imgPath", map);
    float transparency =
        Double.valueOf(CollectionUtil.getDouble("transparency", map, 0)).floatValue();
    float bearing = Double.valueOf(CollectionUtil.getDouble("bearing", map, 0)).floatValue();
    float zIndex = Double.valueOf(CollectionUtil.getDouble("zIndex", map, 0)).floatValue();
    boolean clickable = CollectionUtil.getBool("clickable", map, false);
    boolean visible = CollectionUtil.getBool("visible", map, true);

    // Get anchor point if specified (default is center: 0.5, 0.5)
    float anchorU = 0.5f;
    float anchorV = 0.5f;
    if (map.containsKey("anchor")) {
      Map<String, Object> anchor = (Map<String, Object>) map.get("anchor");
      if (anchor.get("u") != null)
        anchorU = Double.valueOf(anchor.get("u").toString()).floatValue();
      if (anchor.get("v") != null)
        anchorV = Double.valueOf(anchor.get("v").toString()).floatValue();
    }

    GroundOverlayOptions options = new GroundOverlayOptions();

    // Set image
    if (imagePath != null && !imagePath.isEmpty()) {
      BitmapDescriptor bitmapDescriptor = BitmapDescriptorFactory.fromAsset(imagePath);
      options.image(bitmapDescriptor);
    }

    // Determine positioning method: bounds-based or position-based
    if (map.containsKey("bounds")) {
      // Bounds-based positioning
      Map<String, Object> bounds = (Map<String, Object>) map.get("bounds");
      Map<String, Object> northEast = (Map<String, Object>) bounds.get("northEast");
      Map<String, Object> southWest = (Map<String, Object>) bounds.get("southWest");

      double neLat = Double.parseDouble(northEast.get(Constants.LAT_FIELD_KEY).toString());
      double neLng = Double.parseDouble(northEast.get(Constants.LNG_FIELD_KEY).toString());
      double swLat = Double.parseDouble(southWest.get(Constants.LAT_FIELD_KEY).toString());
      double swLng = Double.parseDouble(southWest.get(Constants.LNG_FIELD_KEY).toString());

      LatLngBounds latLngBounds =
          new LatLngBounds(new LatLng(swLat, swLng), new LatLng(neLat, neLng));
      options.positionFromBounds(latLngBounds);
    } else if (map.containsKey("location")) {
      // Position-based positioning
      Map<String, Object> latlng = (Map<String, Object>) map.get("location");
      Double lat = Double.parseDouble(latlng.get(Constants.LAT_FIELD_KEY).toString());
      Double lng = Double.parseDouble(latlng.get(Constants.LNG_FIELD_KEY).toString());

      float width = Double.valueOf(CollectionUtil.getDouble("width", map, 0)).floatValue();
      double height = CollectionUtil.getDouble("height", map, -1);

      if (width <= 0) {
        throw new IllegalArgumentException(JsErrors.INVALID_GROUND_OVERLAY_OPTIONS_MESSAGE);
      }

      if (height > 0) {
        options.position(new LatLng(lat, lng), width, (float) height);
      } else {
        // Height not specified - preserve aspect ratio
        options.position(new LatLng(lat, lng), width);
      }
    } else {
      throw new IllegalArgumentException(JsErrors.INVALID_GROUND_OVERLAY_OPTIONS_MESSAGE);
    }

    options.anchor(anchorU, anchorV);
    options.bearing(bearing);
    options.transparency(transparency);
    options.zIndex(zIndex);
    options.clickable(clickable);
    options.visible(visible);

    GroundOverlay groundOverlay = mGoogleMap.addGroundOverlay(options);

    String effectiveId =
        (customId != null && !customId.isEmpty()) ? customId : groundOverlay.getId();

    groundOverlayMap.put(effectiveId, groundOverlay);
    groundOverlayNativeIdToEffectiveId.put(groundOverlay.getId(), effectiveId);

    return groundOverlay;
  }

  private void updateGroundOverlay(GroundOverlay overlay, Map<String, Object> map) {
    float transparency =
        Double.valueOf(CollectionUtil.getDouble("transparency", map, 0)).floatValue();
    float bearing = Double.valueOf(CollectionUtil.getDouble("bearing", map, 0)).floatValue();
    float zIndex = Double.valueOf(CollectionUtil.getDouble("zIndex", map, 0)).floatValue();
    boolean clickable = CollectionUtil.getBool("clickable", map, false);
    boolean visible = CollectionUtil.getBool("visible", map, true);

    overlay.setBearing(bearing);
    overlay.setTransparency(transparency);
    overlay.setZIndex(zIndex);
    overlay.setClickable(clickable);
    overlay.setVisible(visible);
  }

  public void removeMarker(String id) {
    UiThreadUtil.runOnUiThread(
        () -> {
          Marker marker = markerMap.get(id);
          if (marker != null) {
            markerNativeIdToEffectiveId.remove(marker.getId());
            marker.remove();
            markerMap.remove(id);
          }
        });
  }

  public void removePolyline(String id) {
    Polyline polyline = polylineMap.get(id);
    if (polyline != null) {
      polylineNativeIdToEffectiveId.remove(polyline.getId());
      polyline.remove();
      polylineMap.remove(id);
    }
  }

  public void removePolygon(String id) {
    Polygon polygon = polygonMap.get(id);
    if (polygon != null) {
      polygonNativeIdToEffectiveId.remove(polygon.getId());
      polygon.remove();
      polygonMap.remove(id);
    }
  }

  public void removeCircle(String id) {
    Circle circle = circleMap.get(id);
    if (circle != null) {
      circleNativeIdToEffectiveId.remove(circle.getId());
      circle.remove();
      circleMap.remove(id);
    }
  }

  public void removeGroundOverlay(String id) {
    GroundOverlay groundOverlay = groundOverlayMap.get(id);
    if (groundOverlay != null) {
      groundOverlayNativeIdToEffectiveId.remove(groundOverlay.getId());
      groundOverlay.remove();
      groundOverlayMap.remove(id);
    }
  }

  public Map<String, Marker> getMarkerMap() {
    return markerMap;
  }

  public Map<String, Circle> getCircleMap() {
    return circleMap;
  }

  public Map<String, Polyline> getPolylineMap() {
    return polylineMap;
  }

  public Map<String, Polygon> getPolygonMap() {
    return polygonMap;
  }

  public Map<String, GroundOverlay> getGroundOverlayMap() {
    return groundOverlayMap;
  }

  public void setMapStyle(String url) {
    Executors.newSingleThreadExecutor()
        .execute(
            () -> {
              try {
                style = fetchJsonFromUrl(url);
              } catch (IOException e) {
                throw new RuntimeException(e);
              }

              Activity activity = activitySupplier.get();
              if (activity != null) {
                activity.runOnUiThread(
                    () -> {
                      MapStyleOptions options = new MapStyleOptions(style);
                      mGoogleMap.setMapStyle(options);
                    });
              }
            });
  }

  /** Moves the position of the camera to the specified location. */
  public void moveCamera(Map<String, Object> map) {
    if (mGoogleMap == null) {
      return;
    }

    LatLng latLng = ObjectTranslationUtil.getLatLngFromMap((Map<String, Object>) map.get("target"));

    float zoom = (float) CollectionUtil.getDouble("zoom", map, 0);
    float tilt = (float) CollectionUtil.getDouble("tilt", map, 0);
    float bearing = (float) CollectionUtil.getDouble("bearing", map, 0);

    CameraPosition cameraPosition =
        CameraPosition.builder().target(latLng).zoom(zoom).tilt(tilt).bearing(bearing).build();

    mGoogleMap.moveCamera(CameraUpdateFactory.newCameraPosition(cameraPosition));
  }

  public void animateCamera(Map<String, Object> map) {
    if (mGoogleMap != null) {
      int zoom = CollectionUtil.getInt("zoom", map, 0);
      int tilt = CollectionUtil.getInt("tilt", map, 0);
      int bearing = CollectionUtil.getInt("bearing", map, 0);
      int animationDuration = CollectionUtil.getInt("duration", map, 0);

      CameraPosition cameraPosition =
          new CameraPosition.Builder()
              .target(
                  ObjectTranslationUtil.getLatLngFromMap(
                      (Map<String, Object>) map.get("target"))) // Set the target location
              .zoom(zoom) // Set the desired zoom level
              .tilt(tilt) // Set the desired tilt angle (0 for straight down, 90 for straight up)
              .bearing(bearing) // Set the desired bearing (rotation angle in degrees)
              .build();

      mGoogleMap.animateCamera(
          CameraUpdateFactory.newCameraPosition(cameraPosition), animationDuration, null);
    }
  }

  public void setZoomLevel(int level) {
    if (mGoogleMap != null) {
      mGoogleMap.animateCamera(CameraUpdateFactory.zoomTo(level));
    }
  }

  public void setIndoorEnabled(boolean enabled) {
    if (mGoogleMap != null) {
      mGoogleMap.setIndoorEnabled(enabled);
    }
  }

  public void setIndoorLevelPickerEnabled(boolean enabled) {
    if (mGoogleMap != null) {
      mGoogleMap.getUiSettings().setIndoorLevelPickerEnabled(enabled);
    }
  }

  public void setTrafficEnabled(boolean enabled) {
    if (mGoogleMap != null) {
      mGoogleMap.setTrafficEnabled(enabled);
    }
  }

  public void setCompassEnabled(boolean enabled) {
    if (mGoogleMap != null) {
      mGoogleMap.getUiSettings().setCompassEnabled(enabled);
    }
  }

  public void setRotateGesturesEnabled(boolean enabled) {
    if (mGoogleMap != null) {
      mGoogleMap.getUiSettings().setRotateGesturesEnabled(enabled);
    }
  }

  public void setScrollGesturesEnabled(boolean enabled) {
    if (mGoogleMap != null) {
      mGoogleMap.getUiSettings().setScrollGesturesEnabled(enabled);
    }
  }

  public void setScrollGesturesEnabledDuringRotateOrZoom(boolean enabled) {
    if (mGoogleMap != null) {
      mGoogleMap.getUiSettings().setScrollGesturesEnabledDuringRotateOrZoom(enabled);
    }
  }

  public void setTiltGesturesEnabled(boolean enabled) {
    if (mGoogleMap != null) {
      mGoogleMap.getUiSettings().setTiltGesturesEnabled(enabled);
    }
  }

  public void setZoomControlsEnabled(boolean enabled) {
    if (mGoogleMap != null) {
      mGoogleMap.getUiSettings().setZoomControlsEnabled(enabled);
    }
  }

  @Override
  public void setMinZoomLevel(float minZoomLevel) {
    if (mGoogleMap == null) {
      return;
    }

    // Get the effective max zoom for comparison
    float maxZoom =
        (maxZoomLevelPreference != null && maxZoomLevelPreference >= 0.0f)
            ? maxZoomLevelPreference
            : mGoogleMap.getMaxZoomLevel();

    // Validate that min is not greater than max (unless using -1 sentinel)
    if (minZoomLevel >= 0.0f && minZoomLevel > maxZoom) {
      throw new IllegalArgumentException(
          "Minimum zoom level cannot be greater than maximum zoom level");
    }

    minZoomLevelPreference = minZoomLevel;

    // Use map's current minZoomLevel if -1 is provided
    float effectiveMin = (minZoomLevel < 0.0f) ? mGoogleMap.getMinZoomLevel() : minZoomLevel;
    mGoogleMap.setMinZoomPreference(effectiveMin);
  }

  @Override
  public void setMaxZoomLevel(float maxZoomLevel) {
    if (mGoogleMap == null) {
      return;
    }

    // Get the effective min zoom for comparison
    float minZoom =
        (minZoomLevelPreference != null && minZoomLevelPreference >= 0.0f)
            ? minZoomLevelPreference
            : mGoogleMap.getMinZoomLevel();

    // Validate that max is not less than min (unless using -1 sentinel)
    if (maxZoomLevel >= 0.0f && maxZoomLevel < minZoom) {
      throw new IllegalArgumentException(
          "Maximum zoom level cannot be less than minimum zoom level");
    }

    maxZoomLevelPreference = maxZoomLevel;

    // Use map's current maxZoomLevel if -1 is provided
    float effectiveMax = (maxZoomLevel < 0.0f) ? mGoogleMap.getMaxZoomLevel() : maxZoomLevel;
    mGoogleMap.setMaxZoomPreference(effectiveMax);
  }

  public void setZoomGesturesEnabled(boolean enabled) {
    if (mGoogleMap != null) {
      mGoogleMap.getUiSettings().setZoomGesturesEnabled(enabled);
    }
  }

  public void setBuildingsEnabled(boolean enabled) {
    if (mGoogleMap != null) {
      mGoogleMap.setBuildingsEnabled(enabled);
    }
  }

  @SuppressLint("MissingPermission")
  public void setMyLocationEnabled(boolean enabled) {
    if (mGoogleMap != null) {
      mGoogleMap.setMyLocationEnabled(enabled);
    }
  }

  public void setMapToolbarEnabled(boolean enabled) {
    if (mGoogleMap != null) {
      mGoogleMap.getUiSettings().setMapToolbarEnabled(enabled);
    }
  }

  /** Toggles whether the location marker is enabled. */
  public void setMyLocationButtonEnabled(boolean enabled) {
    if (mGoogleMap == null) {
      return;
    }

    UiThreadUtil.runOnUiThread(
        () -> {
          mGoogleMap.getUiSettings().setMyLocationButtonEnabled(enabled);
        });
  }

  public void setMapType(int jsValue) {
    if (mGoogleMap == null) {
      return;
    }

    mGoogleMap.setMapType(EnumTranslationUtil.getMapTypeFromJsValue(jsValue));
  }

  public void setColorScheme(@MapColorScheme int mapColorScheme) {
    if (mGoogleMap == null) {
      return;
    }

    mGoogleMap.setMapColorScheme(mapColorScheme);
  }

  public void clearMapView() {
    if (mGoogleMap == null) {
      return;
    }

    mGoogleMap.clear();

    // Clear all internal maps
    markerMap.clear();
    polylineMap.clear();
    polygonMap.clear();
    groundOverlayMap.clear();
    circleMap.clear();
    markerNativeIdToEffectiveId.clear();
    polylineNativeIdToEffectiveId.clear();
    polygonNativeIdToEffectiveId.clear();
    groundOverlayNativeIdToEffectiveId.clear();
    circleNativeIdToEffectiveId.clear();
  }

  public void resetMinMaxZoomLevel() {
    if (mGoogleMap == null) {
      return;
    }

    mGoogleMap.resetMinMaxZoomPreference();
  }

  @SuppressLint("MissingPermission")
  public void setFollowingPerspective(int jsValue) {
    if (mGoogleMap == null) {
      return;
    }

    mGoogleMap.followMyLocation(EnumTranslationUtil.getCameraPerspectiveFromJsValue(jsValue));
  }

  public void setPadding(int top, int left, int bottom, int right) {
    if (mGoogleMap != null) {
      mGoogleMap.setPadding(left, top, right, bottom);
    }
  }

  private String fetchJsonFromUrl(String urlString) throws IOException {
    URL url = new URL(urlString);
    HttpURLConnection connection = (HttpURLConnection) url.openConnection();
    connection.setRequestMethod("GET");

    int responseCode = connection.getResponseCode();
    if (responseCode == HttpURLConnection.HTTP_OK) {
      InputStream inputStream = connection.getInputStream();
      BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
      StringBuilder stringBuilder = new StringBuilder();
      String line;
      while ((line = reader.readLine()) != null) {
        stringBuilder.append(line);
      }
      reader.close();
      inputStream.close();
      return stringBuilder.toString();
    } else {
      // Handle error response
      throw new IOException("Error response: " + responseCode);
    }
  }

  private LatLng createLatLng(Map<String, Object> map) {
    Double lat = null;
    Double lng = null;
    if (map.containsKey(Constants.LAT_FIELD_KEY) && map.containsKey(Constants.LNG_FIELD_KEY)) {
      if (map.get(Constants.LAT_FIELD_KEY) != null)
        lat = Double.parseDouble(map.get(Constants.LAT_FIELD_KEY).toString());
      if (map.get(Constants.LNG_FIELD_KEY) != null)
        lng = Double.parseDouble(map.get(Constants.LNG_FIELD_KEY).toString());
    }

    return new LatLng(lat, lng);
  }
}
