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
import android.util.Log;
import android.widget.Toast;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.CatalystInstance;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.google.android.gms.maps.UiSettings;
import com.google.android.gms.maps.model.CameraPosition;
import com.google.android.gms.maps.model.Circle;
import com.google.android.gms.maps.model.GroundOverlay;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.Polygon;
import com.google.android.gms.maps.model.Polyline;
import com.google.android.libraries.navigation.Navigator;
import com.google.android.libraries.navigation.RouteSegment;
import com.google.android.libraries.navigation.TimeAndDistance;
import com.google.android.libraries.navigation.NavigationRoadStretchRenderingData;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.List;
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
  public void show(String message, int duration) {
    Log.d(TAG, "show: " + message + " duration: " + duration);
  }

  @ReactMethod
  public void getCurrentTimeAndDistance(final Promise promise) {
    if (mNavViewManager.getNavigator() == null) {
      promise.reject(JsErrors.NO_NAVIGATOR_ERROR_CODE, JsErrors.NO_NAVIGATOR_ERROR_MESSAGE);
      return;
    }

    TimeAndDistance timeAndDistance = mNavViewManager.getNavigator().getCurrentTimeAndDistance();

    if (timeAndDistance == null) {
      promise.resolve(null);
      return;
    }

    WritableMap map = Arguments.createMap();
    map.putInt("delaySeverity", timeAndDistance.getDelaySeverity());
    map.putInt("meters", timeAndDistance.getMeters());
    map.putInt("seconds", timeAndDistance.getSeconds());
    promise.resolve(map);
  }

  @ReactMethod
  public void areTermsAccepted(final Promise promise) {
    promise.resolve(mNavViewManager.areTermsAccepted());
  }

  @ReactMethod
  public void getCurrentRouteSegment(final Promise promise) {
    if (mNavViewManager.getNavigator() == null) {
      promise.reject(JsErrors.NO_NAVIGATOR_ERROR_CODE, JsErrors.NO_NAVIGATOR_ERROR_MESSAGE);
      return;
    }

    RouteSegment routeSegment = mNavViewManager.getNavigator().getCurrentRouteSegment();

    if (routeSegment == null) {
      promise.resolve(null);
      return;
    }

    promise.resolve(ObjectTranslationUtil.getMapFromRouteSegment(routeSegment));
  }

  @ReactMethod
  public void getRouteSegments(final Promise promise) {
    if (mNavViewManager.getNavigator() == null) {
      promise.reject(JsErrors.NO_NAVIGATOR_ERROR_CODE, JsErrors.NO_NAVIGATOR_ERROR_MESSAGE);
      return;
    }

    List<RouteSegment> routeSegmentList = mNavViewManager.getNavigator().getRouteSegments();
    WritableArray arr = Arguments.createArray();

    for (RouteSegment segment : routeSegmentList) {
      arr.pushMap(ObjectTranslationUtil.getMapFromRouteSegment(segment));
    }

    promise.resolve(arr);
  }

  @ReactMethod
  public void getTraveledPath(final Promise promise) {
    if (mNavViewManager.getNavigator() == null) {
      promise.reject(JsErrors.NO_NAVIGATOR_ERROR_CODE, JsErrors.NO_NAVIGATOR_ERROR_MESSAGE);
      return;
    }

    WritableArray arr = Arguments.createArray();

    for (LatLng latLng : mNavViewManager.getNavigator().getTraveledRoute()) {
      arr.pushMap(ObjectTranslationUtil.getMapFromLatLng(latLng));
    }

    promise.resolve(arr);
  }

  @ReactMethod
  public void getNavSDKVersion(final Promise promise) {
    promise.resolve(mNavViewManager.getNavSDKVersion());
  }

  @ReactMethod
  public void getCameraPosition(final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mNavViewManager.getGoogleMap() == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          CameraPosition cp = mNavViewManager.getGoogleMap().getCameraPosition();

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
  public void getMyLocation(final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mNavViewManager.getGoogleMap() == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          Location location = mNavViewManager.getGoogleMap().getMyLocation();

          if (location == null) {
            promise.resolve(null);
            return;
          }

          promise.resolve(ObjectTranslationUtil.getMapFromLocation(location));
        });
  }

  @ReactMethod
  public void getUiSettings(final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mNavViewManager.getGoogleMap() == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          UiSettings settings = mNavViewManager.getGoogleMap().getUiSettings();

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
  public void isMyLocationEnabled(final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mNavViewManager.getGoogleMap() == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          promise.resolve(mNavViewManager.getGoogleMap().isMyLocationEnabled());
        });
  }

  @ReactMethod
  public void addMarker(ReadableMap markerOptionsMap, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mNavViewManager.getGoogleMap() != null) {
            Marker marker =
                mNavViewManager.getNavViewFragment().addMarker(markerOptionsMap.toHashMap());

            promise.resolve(ObjectTranslationUtil.getMapFromMarker(marker));
          }
        });
  }

  @ReactMethod
  public void addPolyline(ReadableMap polylineOptionsMap, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mNavViewManager.getGoogleMap() == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          Polyline polyline =
              mNavViewManager.getNavViewFragment().addPolyline(polylineOptionsMap.toHashMap());

          promise.resolve(ObjectTranslationUtil.getMapFromPolyline(polyline));
        });
  }

  @ReactMethod
  public void addPolygon(ReadableMap polygonOptionsMap, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mNavViewManager.getGoogleMap() == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          Polygon polygon =
              mNavViewManager.getNavViewFragment().addPolygon(polygonOptionsMap.toHashMap());

          promise.resolve(ObjectTranslationUtil.getMapFromPolygon(polygon));
        });
  }

  @ReactMethod
  public void addCircle(ReadableMap circleOptionsMap, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mNavViewManager.getGoogleMap() == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          Circle circle =
              mNavViewManager.getNavViewFragment().addCircle(circleOptionsMap.toHashMap());

          promise.resolve(ObjectTranslationUtil.getMapFromCircle(circle));
        });
  }

  @ReactMethod
  public void addGroundOverlay(ReadableMap overlayOptionsMap, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mNavViewManager.getGoogleMap() == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          GroundOverlay overlay =
              mNavViewManager.getNavViewFragment().addGroundOverlay(overlayOptionsMap.toHashMap());

          promise.resolve(ObjectTranslationUtil.getMapFromGroundOverlay(overlay));
        });
  }

  private void sendCommandToReactNative(String functionName, String args) {
    ReactContext reactContext = getReactApplicationContext();

    if (reactContext != null) {
      CatalystInstance catalystInstance = reactContext.getCatalystInstance();
      WritableNativeArray params = new WritableNativeArray();

      if (args != null) {
        params.pushString("" + args);
      }

      catalystInstance.callFunction(Constants.JAVASCRIPT_FLAG, functionName, params);
    }
  }

  @Override
  public boolean canOverrideExistingModule() {
    return true;
  }
}
