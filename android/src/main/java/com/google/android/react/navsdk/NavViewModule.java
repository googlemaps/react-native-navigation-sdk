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

import android.graphics.Point;
import android.location.Location;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.maps.CameraUpdate;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.UiSettings;
import com.google.android.gms.maps.model.CameraPosition;
import com.google.android.gms.maps.model.Circle;
import com.google.android.gms.maps.model.GroundOverlay;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.LatLngBounds;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.Polygon;
import com.google.android.gms.maps.model.Polyline;
import com.google.android.gms.maps.model.VisibleRegion;
import com.google.maps.android.rn.navsdk.NativeNavViewModuleSpec;
import java.util.Map;
import java.util.Objects;

/**
 * TurboModule for map view operations. Uses nativeID-based view registry to access view instances.
 * All methods accept a nativeID string parameter to identify which view to operate on.
 */
public class NavViewModule extends NativeNavViewModuleSpec {

  public static final String REACT_CLASS = NAME;
  private static final String TAG = "NavViewModule";

  private NavViewManager mNavViewManager;

  public NavViewModule(ReactApplicationContext reactContext, NavViewManager navViewManager) {
    super(reactContext);
    mNavViewManager = navViewManager;
  }

  @Override
  public void getCameraPosition(String nativeID, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          IMapViewFragment fragment = mNavViewManager.getFragmentByNativeId(nativeID);
          if (fragment == null || fragment.getGoogleMap() == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          CameraPosition cp = fragment.getGoogleMap().getCameraPosition();

          if (cp == null) {
            promise.resolve(null);
            return;
          }

          WritableMap map = ObjectTranslationUtil.getMapFromCameraPosition(cp);

          promise.resolve(map);
        });
  }

  @Override
  public void getMyLocation(String nativeID, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          IMapViewFragment fragment = mNavViewManager.getFragmentByNativeId(nativeID);
          if (fragment == null || fragment.getGoogleMap() == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          try {
            Location location = fragment.getGoogleMap().getMyLocation();
            if (location == null) {
              promise.resolve(null);
              return;
            }

            promise.resolve(ObjectTranslationUtil.getMapFromLocation(location));
          } catch (Exception e) {
            promise.resolve(null);
            return;
          }
        });
  }

  public static void resolveCoordinateForPoint(
      ReactApplicationContext context, GoogleMap map, ReadableMap pointMap, final Promise promise) {
    try {
      float density = context.getResources().getDisplayMetrics().density;
      int x = (int) density * CollectionUtil.getInt("x", pointMap.toHashMap(), 0);
      int y = (int) density * CollectionUtil.getInt("y", pointMap.toHashMap(), 0);
      Point point = new Point(x, y);
      LatLng latLng = map.getProjection().fromScreenLocation(point);

      promise.resolve(ObjectTranslationUtil.getMapFromLatLng(latLng));
    } catch (Exception e) {
      promise.resolve(null);
    }
  }

  @ReactMethod
  public void coordinateForPoint(String nativeID, ReadableMap pointMap, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          IMapViewFragment fragment = mNavViewManager.getFragmentByNativeId(nativeID);
          if (fragment == null || fragment.getGoogleMap() == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          NavViewModule.resolveCoordinateForPoint(
              getReactApplicationContext(), fragment.getGoogleMap(), pointMap, promise);
        });
  }

  public static void resolvePointForCoordinate(
      ReactApplicationContext context,
      GoogleMap map,
      ReadableMap latLngMap,
      final Promise promise) {
    LatLng latLng = ObjectTranslationUtil.getLatLngFromMap(latLngMap.toHashMap());
    Point point = map.getProjection().toScreenLocation(latLng);
    float density = context.getResources().getDisplayMetrics().density;
    point.x = (int) (point.x / density);
    point.y = (int) (point.y / density);

    promise.resolve(ObjectTranslationUtil.getMapFromPoint(point));
  }

  @ReactMethod
  public void pointForCoordinate(String nativeID, ReadableMap latLngMap, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          IMapViewFragment fragment = mNavViewManager.getFragmentByNativeId(nativeID);
          if (fragment == null || fragment.getGoogleMap() == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          NavViewModule.resolvePointForCoordinate(
              getReactApplicationContext(), fragment.getGoogleMap(), latLngMap, promise);
        });
  }

  public static void resolveFitBounds(
      ReactApplicationContext context,
      GoogleMap map,
      ReadableMap boundsOptions,
      final Promise promise) {
    try {
      LatLng northEast =
          ObjectTranslationUtil.getLatLngFromMap(
              Objects.requireNonNull(
                      Objects.requireNonNull(boundsOptions.getMap("bounds")).getMap("northEast"))
                  .toHashMap());
      LatLng southWest =
          ObjectTranslationUtil.getLatLngFromMap(
              Objects.requireNonNull(
                      Objects.requireNonNull(boundsOptions.getMap("bounds")).getMap("southWest"))
                  .toHashMap());

      if (northEast == null || southWest == null) {
        promise.resolve(null);
        return;
      }

      ReadableMap paddingMap = boundsOptions.getMap("padding");
      if (paddingMap != null) {
        double density = context.getResources().getDisplayMetrics().density;
        int left = (int) (paddingMap.getInt("left") * density);
        int top = (int) (paddingMap.getInt("top") * density);
        int right = (int) (paddingMap.getInt("right") * density);
        int bottom = (int) (paddingMap.getInt("bottom") * density);
        map.setPadding(left, top, right, bottom);
      }

      CameraUpdate cameraUpdate =
          CameraUpdateFactory.newLatLngBounds(new LatLngBounds(southWest, northEast), 0);
      map.animateCamera(cameraUpdate);

      promise.resolve(null);
    } catch (Exception e) {
      promise.resolve(null);
    }
  }

  @ReactMethod
  public void fitBounds(String nativeID, ReadableMap boundsOptions, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          IMapViewFragment fragment = mNavViewManager.getFragmentByNativeId(nativeID);
          if (fragment == null || fragment.getGoogleMap() == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          NavViewModule.resolveFitBounds(
              getReactApplicationContext(), fragment.getGoogleMap(), boundsOptions, promise);
        });
  }

  public static void resolveGetBounds(GoogleMap map, final Promise promise) {
    VisibleRegion visibleRegion = map.getProjection().getVisibleRegion();
    LatLng northEast = visibleRegion.farRight;
    LatLng southWest = visibleRegion.nearLeft;

    WritableMap northEastMap = ObjectTranslationUtil.getMapFromLatLng(northEast);
    WritableMap southWestMap = ObjectTranslationUtil.getMapFromLatLng(southWest);

    WritableMap boundsMap = Arguments.createMap();
    boundsMap.putMap("northEast", northEastMap);
    boundsMap.putMap("southWest", southWestMap);

    promise.resolve(boundsMap);
  }

  @ReactMethod
  public void getBounds(String nativeID, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          IMapViewFragment fragment = mNavViewManager.getFragmentByNativeId(nativeID);
          if (fragment == null || fragment.getGoogleMap() == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          NavViewModule.resolveGetBounds(fragment.getGoogleMap(), promise);
        });
  }

  @Override
  public void getUiSettings(String nativeID, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          IMapViewFragment fragment = mNavViewManager.getFragmentByNativeId(nativeID);
          if (fragment == null || fragment.getGoogleMap() == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          UiSettings settings = fragment.getGoogleMap().getUiSettings();

          if (settings == null) {
            promise.resolve(null);
            return;
          }

          WritableMap map = Arguments.createMap();
          map.putBoolean("isCompassEnabled", settings.isCompassEnabled());
          map.putBoolean("isMapToolbarEnabled", settings.isMapToolbarEnabled());
          map.putBoolean("isIndoorLevelPickerEnabled", settings.isIndoorLevelPickerEnabled());
          map.putBoolean("isRotateGesturesEnabled", settings.isRotateGesturesEnabled());
          map.putBoolean("isScrollGesturesEnabled", settings.isScrollGesturesEnabled());
          map.putBoolean(
              "isScrollGesturesEnabledDuringRotateOrZoom",
              settings.isScrollGesturesEnabledDuringRotateOrZoom());
          map.putBoolean("isTiltGesturesEnabled", settings.isTiltGesturesEnabled());
          map.putBoolean("isZoomControlsEnabled", settings.isZoomControlsEnabled());
          map.putBoolean("isZoomGesturesEnabled", settings.isZoomGesturesEnabled());

          promise.resolve(map);
        });
  }

  @Override
  public void isMyLocationEnabled(String nativeID, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          IMapViewFragment fragment = mNavViewManager.getFragmentByNativeId(nativeID);
          if (fragment == null || fragment.getGoogleMap() == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          promise.resolve(fragment.getGoogleMap().isMyLocationEnabled());
        });
  }

  @Override
  public void addMarker(String nativeID, ReadableMap options, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          IMapViewFragment fragment = mNavViewManager.getFragmentByNativeId(nativeID);
          if (fragment == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          try {
            MapViewController mapController = fragment.getMapController();
            Marker marker = mapController.addMarker(options.toHashMap());
            String effectiveId = mapController.getMarkerEffectiveId(marker.getId());
            promise.resolve(ObjectTranslationUtil.getMapFromMarker(marker, effectiveId));
          } catch (IllegalArgumentException e) {
            promise.reject(JsErrors.INVALID_IMAGE_ERROR_CODE, e.getMessage());
          }
        });
  }

  @Override
  public void addPolyline(String nativeID, ReadableMap options, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          IMapViewFragment fragment = mNavViewManager.getFragmentByNativeId(nativeID);
          if (fragment == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          MapViewController mapController = fragment.getMapController();
          Polyline polyline = mapController.addPolyline(options.toHashMap());
          String effectiveId = mapController.getPolylineEffectiveId(polyline.getId());
          promise.resolve(ObjectTranslationUtil.getMapFromPolyline(polyline, effectiveId));
        });
  }

  @Override
  public void addPolygon(String nativeID, ReadableMap options, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          IMapViewFragment fragment = mNavViewManager.getFragmentByNativeId(nativeID);
          if (fragment == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          MapViewController mapController = fragment.getMapController();
          Polygon polygon = mapController.addPolygon(options.toHashMap());
          String effectiveId = mapController.getPolygonEffectiveId(polygon.getId());
          promise.resolve(ObjectTranslationUtil.getMapFromPolygon(polygon, effectiveId));
        });
  }

  @Override
  public void addCircle(String nativeID, ReadableMap options, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          IMapViewFragment fragment = mNavViewManager.getFragmentByNativeId(nativeID);
          if (fragment == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          MapViewController mapController = fragment.getMapController();
          Circle circle = mapController.addCircle(options.toHashMap());
          String effectiveId = mapController.getCircleEffectiveId(circle.getId());
          promise.resolve(ObjectTranslationUtil.getMapFromCircle(circle, effectiveId));
        });
  }

  @Override
  public void addGroundOverlay(String nativeID, ReadableMap options, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          IMapViewFragment fragment = mNavViewManager.getFragmentByNativeId(nativeID);
          if (fragment == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          try {
            MapViewController mapController = fragment.getMapController();
            GroundOverlay overlay = mapController.addGroundOverlay(options.toHashMap());
            if (overlay == null) {
              promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
              return;
            }
            String effectiveId = mapController.getGroundOverlayEffectiveId(overlay.getId());
            promise.resolve(ObjectTranslationUtil.getMapFromGroundOverlay(overlay, effectiveId));
          } catch (IllegalArgumentException e) {
            promise.reject(JsErrors.INVALID_OPTIONS_ERROR_CODE, e.getMessage());
          }
        });
  }

  @Override
  public void moveCamera(String nativeID, ReadableMap cameraPosition, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          IMapViewFragment fragment = mNavViewManager.getFragmentByNativeId(nativeID);
          if (fragment == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          fragment.getMapController().moveCamera(cameraPosition.toHashMap());
          promise.resolve(null);
        });
  }

  @Override
  public void showRouteOverview(String nativeID, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          IMapViewFragment fragment = mNavViewManager.getFragmentByNativeId(nativeID);
          if (fragment == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          if (fragment instanceof INavViewFragment) {
            ((INavViewFragment) fragment).showRouteOverview();
            promise.resolve(null);
          } else {
            promise.reject(JsErrors.NOT_NAV_VIEW_ERROR_CODE, JsErrors.NOT_NAV_VIEW_ERROR_MESSAGE);
          }
        });
  }

  @Override
  public void clearMapView(String nativeID, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          IMapViewFragment fragment = mNavViewManager.getFragmentByNativeId(nativeID);
          if (fragment == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          fragment.getMapController().clearMapView();
          promise.resolve(null);
        });
  }

  @Override
  public void removeMarker(String nativeID, String id, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          IMapViewFragment fragment = mNavViewManager.getFragmentByNativeId(nativeID);
          if (fragment == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          fragment.getMapController().removeMarker(id);
          promise.resolve(null);
        });
  }

  @Override
  public void removePolyline(String nativeID, String id, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          IMapViewFragment fragment = mNavViewManager.getFragmentByNativeId(nativeID);
          if (fragment == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          fragment.getMapController().removePolyline(id);
          promise.resolve(null);
        });
  }

  @Override
  public void removePolygon(String nativeID, String id, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          IMapViewFragment fragment = mNavViewManager.getFragmentByNativeId(nativeID);
          if (fragment == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          fragment.getMapController().removePolygon(id);
          promise.resolve(null);
        });
  }

  @Override
  public void removeCircle(String nativeID, String id, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          IMapViewFragment fragment = mNavViewManager.getFragmentByNativeId(nativeID);
          if (fragment == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          fragment.getMapController().removeCircle(id);
          promise.resolve(null);
        });
  }

  @Override
  public void removeGroundOverlay(String nativeID, String id, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          IMapViewFragment fragment = mNavViewManager.getFragmentByNativeId(nativeID);
          if (fragment == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          fragment.getMapController().removeGroundOverlay(id);
          promise.resolve(null);
        });
  }

  @Override
  public void setZoomLevel(String nativeID, double level, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          IMapViewFragment fragment = mNavViewManager.getFragmentByNativeId(nativeID);
          if (fragment == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          fragment.getMapController().setZoomLevel((int) level);
          promise.resolve(null);
        });
  }

  @Override
  public void setNavigationUIEnabled(String nativeID, boolean enabled, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          IMapViewFragment fragment = mNavViewManager.getFragmentByNativeId(nativeID);
          if (fragment == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          if (fragment instanceof INavViewFragment) {
            ((INavViewFragment) fragment).setNavigationUiEnabled(enabled);
            promise.resolve(null);
          } else {
            promise.reject(JsErrors.NOT_NAV_VIEW_ERROR_CODE, JsErrors.NOT_NAV_VIEW_ERROR_MESSAGE);
          }
        });
  }

  @Override
  public void setFollowingPerspective(String nativeID, double perspective, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          IMapViewFragment fragment = mNavViewManager.getFragmentByNativeId(nativeID);
          if (fragment == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          if (fragment instanceof INavViewFragment) {
            fragment.getMapController().setFollowingPerspective((int) perspective);
            promise.resolve(null);
          } else {
            promise.reject(JsErrors.NOT_NAV_VIEW_ERROR_CODE, JsErrors.NOT_NAV_VIEW_ERROR_MESSAGE);
          }
        });
  }

  @Override
  public void getMarkers(String nativeID, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          IMapViewFragment fragment = mNavViewManager.getFragmentByNativeId(nativeID);
          if (fragment == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          MapViewController mapController = fragment.getMapController();
          WritableArray result = Arguments.createArray();
          for (Map.Entry<String, Marker> entry : mapController.getMarkerMap().entrySet()) {
            result.pushMap(
                ObjectTranslationUtil.getMapFromMarker(entry.getValue(), entry.getKey()));
          }
          promise.resolve(result);
        });
  }

  @Override
  public void getCircles(String nativeID, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          IMapViewFragment fragment = mNavViewManager.getFragmentByNativeId(nativeID);
          if (fragment == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          MapViewController mapController = fragment.getMapController();
          WritableArray result = Arguments.createArray();
          for (Map.Entry<String, Circle> entry : mapController.getCircleMap().entrySet()) {
            result.pushMap(
                ObjectTranslationUtil.getMapFromCircle(entry.getValue(), entry.getKey()));
          }
          promise.resolve(result);
        });
  }

  @Override
  public void getPolylines(String nativeID, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          IMapViewFragment fragment = mNavViewManager.getFragmentByNativeId(nativeID);
          if (fragment == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          MapViewController mapController = fragment.getMapController();
          WritableArray result = Arguments.createArray();
          for (Map.Entry<String, Polyline> entry : mapController.getPolylineMap().entrySet()) {
            result.pushMap(
                ObjectTranslationUtil.getMapFromPolyline(entry.getValue(), entry.getKey()));
          }
          promise.resolve(result);
        });
  }

  @Override
  public void getPolygons(String nativeID, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          IMapViewFragment fragment = mNavViewManager.getFragmentByNativeId(nativeID);
          if (fragment == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          MapViewController mapController = fragment.getMapController();
          WritableArray result = Arguments.createArray();
          for (Map.Entry<String, Polygon> entry : mapController.getPolygonMap().entrySet()) {
            result.pushMap(
                ObjectTranslationUtil.getMapFromPolygon(entry.getValue(), entry.getKey()));
          }
          promise.resolve(result);
        });
  }

  @Override
  public void getGroundOverlays(String nativeID, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          IMapViewFragment fragment = mNavViewManager.getFragmentByNativeId(nativeID);
          if (fragment == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          MapViewController mapController = fragment.getMapController();
          WritableArray result = Arguments.createArray();
          for (Map.Entry<String, GroundOverlay> entry :
              mapController.getGroundOverlayMap().entrySet()) {
            result.pushMap(
                ObjectTranslationUtil.getMapFromGroundOverlay(entry.getValue(), entry.getKey()));
          }
          promise.resolve(result);
        });
  }
}
