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
package com.google.maps.android.rn.navsdk;

import android.annotation.SuppressLint;
import android.app.Activity;
import androidx.annotation.Nullable;
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

public class GMNMapViewController {
  private GoogleMap mGoogleMap;
  private Supplier<Activity> activitySupplier;
  private IGMNMapViewCallback mMapViewCallback;

  // Wrapper storage: key is rnId if present, else Google Maps object id.
  private final HashMap<String, GMNMarker> markerMap = new HashMap<>();
  private final HashMap<String, GMNPolyline> polylineMap = new HashMap<>();
  private final HashMap<String, GMNPolygon> polygonMap = new HashMap<>();
  private final HashMap<String, GMNCircle> circleMap = new HashMap<>();
  private final HashMap<String, GMNGroundOverlay> groundOverlayMap = new HashMap<>();

  // Google Maps object id -> rnId (or itself if rnId is null).
  private final HashMap<String, String> markerIdToRnId = new HashMap<>();
  private final HashMap<String, String> polylineIdToRnId = new HashMap<>();
  private final HashMap<String, String> polygonIdToRnId = new HashMap<>();
  private final HashMap<String, String> circleIdToRnId = new HashMap<>();
  private final HashMap<String, String> groundOverlayIdToRnId = new HashMap<>();

  private String style = "";
  private Float minZoomPreference = null;
  private Float maxZoomPreference = null;

  public void initialize(GoogleMap googleMap, Supplier<Activity> activitySupplier) {
    this.mGoogleMap = googleMap;
    this.activitySupplier = activitySupplier;
  }

  public void setupMapListeners(IGMNMapViewCallback navigationViewCallback) {
    this.mMapViewCallback = navigationViewCallback;
    if (mGoogleMap == null || mMapViewCallback == null) return;

    mGoogleMap.setOnMarkerClickListener(
        marker -> {
          String key = markerIdToRnId.getOrDefault(marker.getId(), marker.getId());
          GMNMarker gmnMarker = markerMap.get(key);
          if (gmnMarker != null) {
            mMapViewCallback.onMarkerClick(gmnMarker);
          }
          return false;
        });

    mGoogleMap.setOnPolylineClickListener(
        polyline -> {
          String key = polylineIdToRnId.getOrDefault(polyline.getId(), polyline.getId());
          GMNPolyline gmnPolyline = polylineMap.get(key);
          if (gmnPolyline != null) {
            mMapViewCallback.onPolylineClick(gmnPolyline);
          }
        });

    mGoogleMap.setOnPolygonClickListener(
        polygon -> {
          String key = polygonIdToRnId.getOrDefault(polygon.getId(), polygon.getId());
          GMNPolygon gmnPolygon = polygonMap.get(key);
          if (gmnPolygon != null) {
            mMapViewCallback.onPolygonClick(gmnPolygon);
          }
        });

    mGoogleMap.setOnCircleClickListener(
        circle -> {
          String key = circleIdToRnId.getOrDefault(circle.getId(), circle.getId());
          GMNCircle gmnCircle = circleMap.get(key);
          if (gmnCircle != null) {
            mMapViewCallback.onCircleClick(gmnCircle);
          }
        });

    mGoogleMap.setOnGroundOverlayClickListener(
        groundOverlay -> {
          String key =
              groundOverlayIdToRnId.getOrDefault(groundOverlay.getId(), groundOverlay.getId());
          GMNGroundOverlay gmnGroundOverlay = groundOverlayMap.get(key);
          if (gmnGroundOverlay != null) {
            mMapViewCallback.onGroundOverlayClick(gmnGroundOverlay);
          }
        });

    mGoogleMap.setOnInfoWindowClickListener(
        marker -> {
          String key = markerIdToRnId.getOrDefault(marker.getId(), marker.getId());
          GMNMarker gmnMarker = markerMap.get(key);
          if (gmnMarker != null) {
            mMapViewCallback.onMarkerInfoWindowTapped(gmnMarker);
          }
        });

    mGoogleMap.setOnMapClickListener(latLng -> mMapViewCallback.onMapClick(latLng));
  }

  public GoogleMap getGoogleMap() {
    return mGoogleMap;
  }

  @Nullable
  public GMNCircle addCircle(Map<String, Object> optionsMap) {
    if (mGoogleMap == null) {
      return null;
    }

    CircleOptions options = new CircleOptions();

    float strokeWidth =
        Double.valueOf(GMNCollectionUtil.getDouble("strokeWidth", optionsMap, 0)).floatValue();
    options.strokeWidth(strokeWidth);

    double radius = GMNCollectionUtil.getDouble("radius", optionsMap, 0.0);
    options.radius(radius);

    boolean visible = GMNCollectionUtil.getBool("visible", optionsMap, true);
    options.visible(visible);

    Object centerObj = optionsMap.get("center");
    if (centerObj instanceof Map) {
      @SuppressWarnings("unchecked")
      Map<String, Object> centerMap = (Map<String, Object>) centerObj;
      options.center(GMNObjectTranslationUtil.getLatLngFromMap(centerMap));
    }

    boolean clickable = GMNCollectionUtil.getBool("clickable", optionsMap, false);
    options.clickable(clickable);

    String strokeColor = GMNCollectionUtil.getString("strokeColor", optionsMap);
    if (strokeColor != null) {
      options.strokeColor(GMNColorUtil.colorFromHexString(strokeColor).toArgb());
    }

    String fillColor = GMNCollectionUtil.getString("fillColor", optionsMap);
    if (fillColor != null) {
      options.fillColor(GMNColorUtil.colorFromHexString(fillColor).toArgb());
    }

    Circle circle = mGoogleMap.addCircle(options);
    String rnId = GMNCollectionUtil.getString("id", optionsMap);
    GMNCircle gmnCircle = new GMNCircle(circle, rnId);
    String key = rnId != null ? rnId : circle.getId();
    circleMap.put(key, gmnCircle);
    circleIdToRnId.put(circle.getId(), key);
    return gmnCircle;
  }

  @Nullable
  public GMNMarker addMarker(Map<String, Object> optionsMap) {
    if (mGoogleMap == null) {
      return null;
    }

    String imagePath = GMNCollectionUtil.getString("imgPath", optionsMap);
    String title = GMNCollectionUtil.getString("title", optionsMap);
    String snippet = GMNCollectionUtil.getString("snippet", optionsMap);
    float alpha = Double.valueOf(GMNCollectionUtil.getDouble("alpha", optionsMap, 1)).floatValue();
    float rotation =
        Double.valueOf(GMNCollectionUtil.getDouble("rotation", optionsMap, 0)).floatValue();
    boolean draggable = GMNCollectionUtil.getBool("draggable", optionsMap, false);
    boolean flat = GMNCollectionUtil.getBool("flat", optionsMap, false);
    boolean visible = GMNCollectionUtil.getBool("visible", optionsMap, true);

    MarkerOptions options = new MarkerOptions();
    if (imagePath != null && !imagePath.isEmpty()) {
      BitmapDescriptor icon = BitmapDescriptorFactory.fromAsset(imagePath);
      options.icon(icon);
    }

    Object positionObj = optionsMap.get("position");
    if (positionObj instanceof Map) {
      @SuppressWarnings("unchecked")
      Map<String, Object> positionMap = (Map<String, Object>) positionObj;
      LatLng latLng = GMNObjectTranslationUtil.getLatLngFromMap(positionMap);
      if (latLng != null) {
        options.position(latLng);
      }
    }

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
    String rnId = GMNCollectionUtil.getString("id", optionsMap);
    GMNMarker gmnMarker = new GMNMarker(marker, rnId);
    String key = rnId != null ? rnId : marker.getId();
    markerMap.put(key, gmnMarker);
    markerIdToRnId.put(marker.getId(), key);
    return gmnMarker;
  }

  @Nullable
  public GMNPolyline addPolyline(Map<String, Object> optionsMap) {
    if (mGoogleMap == null) {
      return null;
    }

    float width = Double.valueOf(GMNCollectionUtil.getDouble("width", optionsMap, 0)).floatValue();
    boolean clickable = GMNCollectionUtil.getBool("clickable", optionsMap, false);
    boolean visible = GMNCollectionUtil.getBool("visible", optionsMap, true);

    Object pointsObj = optionsMap.get("points");
    if (!(pointsObj instanceof List)) {
      return null;
    }

    @SuppressWarnings("unchecked")
    List<Map<String, Object>> latLngList = (List<Map<String, Object>>) pointsObj;

    PolylineOptions options = new PolylineOptions();
    for (Map<String, Object> latLngMap : latLngList) {
      options.add(createLatLng(latLngMap));
    }

    String color = GMNCollectionUtil.getString("color", optionsMap);
    if (color != null) {
      options.color(GMNColorUtil.colorFromHexString(color).toArgb());
    }

    options.width(width);
    options.clickable(clickable);
    options.visible(visible);

    Polyline polyline = mGoogleMap.addPolyline(options);
    String rnId = GMNCollectionUtil.getString("id", optionsMap);
    GMNPolyline gmnPolyline = new GMNPolyline(polyline, rnId);
    String key = rnId != null ? rnId : polyline.getId();
    polylineMap.put(key, gmnPolyline);
    polylineIdToRnId.put(polyline.getId(), key);
    return gmnPolyline;
  }

  @Nullable
  public GMNPolygon addPolygon(Map<String, Object> optionsMap) {
    if (mGoogleMap == null) {
      return null;
    }

    String strokeColor = GMNCollectionUtil.getString("strokeColor", optionsMap);
    String fillColor = GMNCollectionUtil.getString("fillColor", optionsMap);
    float strokeWidth =
        Double.valueOf(GMNCollectionUtil.getDouble("strokeWidth", optionsMap, 0)).floatValue();
    boolean clickable = GMNCollectionUtil.getBool("clickable", optionsMap, false);
    boolean geodesic = GMNCollectionUtil.getBool("geodesic", optionsMap, false);
    boolean visible = GMNCollectionUtil.getBool("visible", optionsMap, true);

    Object pointsObj = optionsMap.get("points");
    if (!(pointsObj instanceof List)) {
      return null;
    }

    @SuppressWarnings("unchecked")
    List<Map<String, Object>> latLngList = (List<Map<String, Object>>) pointsObj;

    PolygonOptions options = new PolygonOptions();
    for (Map<String, Object> latLngMap : latLngList) {
      options.add(createLatLng(latLngMap));
    }

    Object holesObj = optionsMap.get("holes");
    if (holesObj instanceof List) {
      @SuppressWarnings("unchecked")
      List<List<Map<String, Object>>> holesArr = (List<List<Map<String, Object>>>) holesObj;

      for (List<Map<String, Object>> hole : holesArr) {
        List<LatLng> listHoles = new ArrayList<>();
        for (Map<String, Object> latLngMap : hole) {
          listHoles.add(createLatLng(latLngMap));
        }
        if (!listHoles.isEmpty()) {
          options.addHole(listHoles);
        }
      }
    }

    if (fillColor != null) {
      options.fillColor(GMNColorUtil.colorFromHexString(fillColor).toArgb());
    }

    if (strokeColor != null) {
      options.strokeColor(GMNColorUtil.colorFromHexString(strokeColor).toArgb());
    }

    options.strokeWidth(strokeWidth);
    options.visible(visible);
    options.geodesic(geodesic);
    options.clickable(clickable);

    Polygon polygon = mGoogleMap.addPolygon(options);
    String rnId = GMNCollectionUtil.getString("id", optionsMap);
    GMNPolygon gmnPolygon = new GMNPolygon(polygon, rnId);
    String key = rnId != null ? rnId : polygon.getId();
    polygonMap.put(key, gmnPolygon);
    polygonIdToRnId.put(polygon.getId(), key);

    return gmnPolygon;
  }

  @Nullable
  public GMNGroundOverlay addGroundOverlay(Map<String, Object> optionsMap) {
    if (mGoogleMap == null) {
      return null;
    }

    String imagePath = GMNCollectionUtil.getString("imgPath", optionsMap);
    float width = Double.valueOf(GMNCollectionUtil.getDouble("width", optionsMap, 0)).floatValue();
    float height =
        Double.valueOf(GMNCollectionUtil.getDouble("height", optionsMap, 0)).floatValue();
    float transparency =
        Double.valueOf(1.0 - GMNCollectionUtil.getDouble("alpha", optionsMap, 1)).floatValue();
    boolean clickable = GMNCollectionUtil.getBool("clickable", optionsMap, false);
    boolean visible = GMNCollectionUtil.getBool("visible", optionsMap, true);

    LatLng location = null;
    Object locationObj = optionsMap.get("location");
    if (locationObj instanceof Map) {
      @SuppressWarnings("unchecked")
      Map<String, Object> latlngMap = (Map<String, Object>) locationObj;
      double lat = GMNCollectionUtil.getDouble("lat", latlngMap, 0);
      double lng = GMNCollectionUtil.getDouble("lng", latlngMap, 0);
      location = new LatLng(lat, lng);
    }

    if (location == null) {
      return null; // Cannot add overlay without a valid position
    }

    GroundOverlayOptions options = new GroundOverlayOptions();
    if (imagePath != null && !imagePath.isEmpty()) {
      BitmapDescriptor bitmapDescriptor = BitmapDescriptorFactory.fromAsset(imagePath);
      options.image(bitmapDescriptor);
    }
    options.position(location, width, height);
    options.transparency(transparency);
    options.clickable(clickable);
    options.visible(visible);
    GroundOverlay groundOverlay = mGoogleMap.addGroundOverlay(options);
    String rnId = GMNCollectionUtil.getString("id", optionsMap);
    GMNGroundOverlay gmnGroundOverlay = new GMNGroundOverlay(groundOverlay, rnId);
    String key = rnId != null ? rnId : groundOverlay.getId();
    groundOverlayMap.put(key, gmnGroundOverlay);
    groundOverlayIdToRnId.put(groundOverlay.getId(), key);

    return gmnGroundOverlay;
  }

  public void removeMarker(String id) {
    GMNMarker m = markerMap.remove(id);
    if (m != null) {
      markerIdToRnId.remove(m.marker().getId());
      m.marker().remove();
    }
  }

  public void removePolyline(String id) {
    GMNPolyline p = polylineMap.remove(id);
    if (p != null) {
      polylineIdToRnId.remove(p.polyline().getId());
      p.polyline().remove();
    }
  }

  public void removePolygon(String id) {
    GMNPolygon p = polygonMap.remove(id);
    if (p != null) {
      polygonIdToRnId.remove(p.polygon().getId());
      p.polygon().remove();
    }
  }

  public void removeCircle(String id) {
    GMNCircle c = circleMap.remove(id);
    if (c != null) {
      circleIdToRnId.remove(c.circle().getId());
      c.circle().remove();
    }
  }

  public void removeGroundOverlay(String id) {
    GMNGroundOverlay g = groundOverlayMap.remove(id);
    if (g != null) {
      groundOverlayIdToRnId.remove(g.groundOverlay().getId());
      g.groundOverlay().remove();
    }
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

  /** Moves the position of the camera to hover over Melbourne. */
  public void moveCamera(CameraPosition cameraPosition) {
    mGoogleMap.moveCamera(CameraUpdateFactory.newCameraPosition(cameraPosition));
  }

  public void animateCamera(CameraPosition cameraPosition, int animationDuration) {
    if (mGoogleMap != null) {
      mGoogleMap.animateCamera(
          CameraUpdateFactory.newCameraPosition(cameraPosition), animationDuration, null);
    }
  }

  public void setZoomLevel(int level) {
    if (mGoogleMap != null) {
      mGoogleMap.animateCamera(CameraUpdateFactory.zoomTo(level));
    }
  }

  public void setIndoorEnabled(boolean isOn) {
    if (mGoogleMap != null) {
      mGoogleMap.setIndoorEnabled(isOn);
    }
  }

  public void setTrafficEnabled(boolean isOn) {
    if (mGoogleMap != null) {
      mGoogleMap.setTrafficEnabled(isOn);
    }
  }

  public void setCompassEnabled(boolean isOn) {
    if (mGoogleMap != null) {
      mGoogleMap.getUiSettings().setCompassEnabled(isOn);
    }
  }

  public void setRotateGesturesEnabled(boolean isOn) {
    if (mGoogleMap != null) {
      mGoogleMap.getUiSettings().setRotateGesturesEnabled(isOn);
    }
  }

  public void setScrollGesturesEnabled(boolean isOn) {
    if (mGoogleMap != null) {
      mGoogleMap.getUiSettings().setScrollGesturesEnabled(isOn);
    }
  }

  public void setScrollGesturesEnabledDuringRotateOrZoom(boolean isOn) {
    if (mGoogleMap != null) {
      mGoogleMap.getUiSettings().setScrollGesturesEnabledDuringRotateOrZoom(isOn);
    }
  }

  public void setTiltGesturesEnabled(boolean isOn) {
    if (mGoogleMap != null) {
      mGoogleMap.getUiSettings().setTiltGesturesEnabled(isOn);
    }
  }

  public void setZoomControlsEnabled(boolean isOn) {
    if (mGoogleMap != null) {
      mGoogleMap.getUiSettings().setZoomControlsEnabled(isOn);
    }
  }

  public void setZoomGesturesEnabled(boolean isOn) {
    if (mGoogleMap != null) {
      mGoogleMap.getUiSettings().setZoomGesturesEnabled(isOn);
    }
  }

  public void setBuildingsEnabled(boolean isOn) {
    if (mGoogleMap != null) {
      mGoogleMap.setBuildingsEnabled(isOn);
    }
  }

  @SuppressLint("MissingPermission")
  public void setMyLocationEnabled(boolean isOn) {
    if (mGoogleMap != null) {
      mGoogleMap.setMyLocationEnabled(isOn);
    }
  }

  public void setMapToolbarEnabled(boolean isOn) {
    if (mGoogleMap != null) {
      mGoogleMap.getUiSettings().setMapToolbarEnabled(isOn);
    }
  }

  /** Toggles whether the location marker is enabled. */
  public void setMyLocationButtonEnabled(boolean isOn) {
    if (mGoogleMap == null) {
      return;
    }

    UiThreadUtil.runOnUiThread(
        () -> {
          mGoogleMap.getUiSettings().setMyLocationButtonEnabled(isOn);
        });
  }

  public void setMapType(int jsValue) {
    if (mGoogleMap == null) {
      return;
    }

    mGoogleMap.setMapType(GMNEnumTranslationUtil.getMapTypeFromJsValue(jsValue));
  }

  public void clearMapView() {
    if (mGoogleMap == null) {
      return;
    }
    mGoogleMap.clear();
    markerMap.clear();
    polylineMap.clear();
    polygonMap.clear();
    circleMap.clear();
    groundOverlayMap.clear();
    markerIdToRnId.clear();
    polylineIdToRnId.clear();
    polygonIdToRnId.clear();
    circleIdToRnId.clear();
    groundOverlayIdToRnId.clear();
  }

  @SuppressLint("MissingPermission")
  public void setFollowingPerspective(int jsValue) {
    if (mGoogleMap == null) {
      return;
    }

    mGoogleMap.followMyLocation(GMNEnumTranslationUtil.getCameraPerspectiveFromJsValue(jsValue));
  }

  public void setPadding(int left, int top, int right, int bottom) {
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
    if (map.containsKey("lat") && map.containsKey("lng")) {
      if (map.get("lat") != null) lat = Double.parseDouble(map.get("lat").toString());
      if (map.get("lng") != null) lng = Double.parseDouble(map.get("lng").toString());
    }

    return new LatLng(lat, lng);
  }

  public void setMinZoomPreference(Float value) {
    minZoomPreference = value;
    updateMinMaxZoomPreference();
  }

  public void setMaxZoomPreference(Float value) {
    maxZoomPreference = value;
    updateMinMaxZoomPreference();
  }

  private void updateMinMaxZoomPreference() {
    if (mGoogleMap == null) {
      return;
    }
    if (minZoomPreference == null || maxZoomPreference == null) {
      mGoogleMap.resetMinMaxZoomPreference();
    }
    if (minZoomPreference != null) {
      mGoogleMap.setMinZoomPreference(minZoomPreference);
    }
    if (maxZoomPreference != null) {
      mGoogleMap.setMinZoomPreference(maxZoomPreference);
    }
  }
}
