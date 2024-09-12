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
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.maps.UiSettings;
import com.google.android.gms.maps.model.CameraPosition;
import com.google.android.gms.maps.model.Circle;
import com.google.android.gms.maps.model.GroundOverlay;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.Polygon;
import com.google.android.gms.maps.model.Polyline;
import java.util.HashMap;
import java.util.Map;

/**
 * This exposes a series of methods that can be called diretly from the React Native code. They have
 * been implemented using promises as it's not recommended for them to be synchronous.
 */
public class NavViewModule extends ReactContextBaseJavaModule {

  private static final String TAG = "NavViewModule";

  private NavViewManager mNavViewManager;

  public NavViewModule(ReactApplicationContext reactContext, NavViewManager navViewManager) {
    super(reactContext);
    mNavViewManager = navViewManager;
  }

  @Override
  public String getName() {
    return "NavViewModule";
  }

  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    return constants;
  }

  @ReactMethod
  public void getCameraPosition(Integer viewId, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mNavViewManager.getGoogleMap(viewId) == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          CameraPosition cp = mNavViewManager.getGoogleMap(viewId).getCameraPosition();

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

  @ReactMethod
  public void getMyLocation(Integer viewId, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mNavViewManager.getGoogleMap(viewId) == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          try {
            Location location = mNavViewManager.getGoogleMap(viewId).getMyLocation();
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

  @ReactMethod
  public void getUiSettings(Integer viewId, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mNavViewManager.getGoogleMap(viewId) == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          UiSettings settings = mNavViewManager.getGoogleMap(viewId).getUiSettings();

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

  @ReactMethod
  public void isMyLocationEnabled(Integer viewId, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mNavViewManager.getGoogleMap(viewId) == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          promise.resolve(mNavViewManager.getGoogleMap(viewId).isMyLocationEnabled());
        });
  }

  @ReactMethod
  public void addMarker(int viewId, ReadableMap markerOptionsMap, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mNavViewManager.getGoogleMap(viewId) != null) {
            Marker marker =
                mNavViewManager
                    .getFragmentForViewId(viewId)
                    .getMapController()
                    .addMarker(markerOptionsMap.toHashMap());

            promise.resolve(ObjectTranslationUtil.getMapFromMarker(marker));
          }
        });
  }

  @ReactMethod
  public void addPolyline(int viewId, ReadableMap polylineOptionsMap, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mNavViewManager.getGoogleMap(viewId) == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          Polyline polyline =
              mNavViewManager
                  .getFragmentForViewId(viewId)
                  .getMapController()
                  .addPolyline(polylineOptionsMap.toHashMap());

          promise.resolve(ObjectTranslationUtil.getMapFromPolyline(polyline));
        });
  }

  @ReactMethod
  public void addPolygon(int viewId, ReadableMap polygonOptionsMap, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mNavViewManager.getGoogleMap(viewId) == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          Polygon polygon =
              mNavViewManager
                  .getFragmentForViewId(viewId)
                  .getMapController()
                  .addPolygon(polygonOptionsMap.toHashMap());

          promise.resolve(ObjectTranslationUtil.getMapFromPolygon(polygon));
        });
  }

  @ReactMethod
  public void addCircle(int viewId, ReadableMap circleOptionsMap, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mNavViewManager.getGoogleMap(viewId) == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          Circle circle =
              mNavViewManager
                  .getFragmentForViewId(viewId)
                  .getMapController()
                  .addCircle(circleOptionsMap.toHashMap());

          promise.resolve(ObjectTranslationUtil.getMapFromCircle(circle));
        });
  }

  @ReactMethod
  public void addGroundOverlay(int viewId, ReadableMap overlayOptionsMap, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mNavViewManager.getGoogleMap(viewId) == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          GroundOverlay overlay =
              mNavViewManager
                  .getFragmentForViewId(viewId)
                  .getMapController()
                  .addGroundOverlay(overlayOptionsMap.toHashMap());

          promise.resolve(ObjectTranslationUtil.getMapFromGroundOverlay(overlay));
        });
  }

  @Override
  public boolean canOverrideExistingModule() {
    return true;
  }
}
