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

import android.location.Location;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.maps.UiSettings;
import com.google.android.gms.maps.model.CameraPosition;
import com.google.android.gms.maps.model.Circle;
import com.google.android.gms.maps.model.GroundOverlay;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.Polygon;
import com.google.android.gms.maps.model.Polyline;
import com.google.maps.android.rn.navsdk.NativeNavViewModuleSpec;
import java.util.Map;

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

          LatLng target = cp.target;
          WritableMap map = Arguments.createMap();
          map.putDouble("bearing", cp.bearing);
          map.putDouble("tilt", cp.tilt);
          map.putDouble("zoom", cp.zoom);
          map.putMap("target", ObjectTranslationUtil.getMapFromLatLng(target));

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
