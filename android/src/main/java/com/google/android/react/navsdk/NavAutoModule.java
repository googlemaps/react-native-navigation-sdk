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

import android.location.Location;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
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
import com.google.android.libraries.navigation.StylingOptions;
import com.google.maps.android.rn.navsdk.NativeNavAutoModuleSpec;
import java.util.Map;
import org.json.JSONObject;

/**
 * TurboModule for Android Auto integration. Manages map operations and UI settings for Android Auto
 * screens.
 */
public class NavAutoModule extends NativeNavAutoModuleSpec
    implements INavigationAutoCallback, LifecycleEventListener {
  private static final String TAG = "NavAutoModule";
  public static final String REACT_CLASS = NAME;
  private static NavAutoModule instance;
  private static ModuleReadyListener moduleReadyListener;

  ReactApplicationContext reactContext;
  private MapViewController mMapViewController;
  private StylingOptions mStylingOptions;
  private INavigationViewController mNavigationViewController;
  private AndroidAutoBaseScreen mAutoScreen;
  private boolean mPendingScreenAvailable = false;

  public interface ModuleReadyListener {
    void onModuleReady();
  }

  public NavAutoModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
    this.reactContext.addLifecycleEventListener(this);
    instance = this;
  }

  @NonNull
  @Override
  public String getName() {
    return REACT_CLASS;
  }

  // Called by the AndroidAuto implementation. See SampleApp for example.
  public static synchronized NavAutoModule getInstance() {
    if (instance == null) {
      throw new IllegalStateException(REACT_CLASS + " instance is null");
    }
    return instance;
  }

  /**
   * Checks if the NavAutoModule instance exists and has an active React context. Use this to safely
   * check before calling getInstance() to avoid crashes when React Native hasn't initialized yet.
   */
  public static synchronized boolean isInstanceReady() {
    return instance != null
        && instance.reactContext != null
        && instance.reactContext.hasActiveReactInstance();
  }

  public static void setModuleReadyListener(ModuleReadyListener listener) {
    moduleReadyListener = listener;
    // Only trigger callback if instance exists AND has an active React context
    if (instance != null && moduleReadyListener != null && isInstanceReady()) {
      moduleReadyListener.onModuleReady();
    }
  }

  public void androidAutoNavigationScreenInitialized(
      MapViewController mapViewController, INavigationViewController navigationViewController) {
    androidAutoNavigationScreenInitialized(mapViewController, navigationViewController, null);
  }

  public void androidAutoNavigationScreenInitialized(
      MapViewController mapViewController,
      INavigationViewController navigationViewController,
      @Nullable AndroidAutoBaseScreen autoScreen) {
    mMapViewController = mapViewController;
    mNavigationViewController = navigationViewController;
    mAutoScreen = autoScreen;
    if (mStylingOptions != null && mNavigationViewController != null) {
      mNavigationViewController.setStylingOptions(mStylingOptions);
    }
    sendScreenState(true);
  }

  public void androidAutoNavigationScreenDisposed() {
    sendScreenState(false);
    mMapViewController = null;
    mNavigationViewController = null;
    mAutoScreen = null;
  }

  @Override
  public void setMapType(double mapType) {
    int jsValue = (int) mapType;
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setMapType(jsValue);
        });
  }

  @Override
  public void setMapStyle(String mapStyle) {
    String url = mapStyle;
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setMapStyle(url);
        });
  }

  @Override
  public void addCircle(ReadableMap options, final Promise promise) {
    ReadableMap circleOptionsMap = options;
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          Circle circle = mMapViewController.addCircle(circleOptionsMap.toHashMap());
          String effectiveId = mMapViewController.getCircleEffectiveId(circle.getId());
          promise.resolve(ObjectTranslationUtil.getMapFromCircle(circle, effectiveId));
        });
  }

  @Override
  public void addMarker(ReadableMap options, final Promise promise) {
    ReadableMap markerOptionsMap = options;
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          try {
            Marker marker = mMapViewController.addMarker(markerOptionsMap.toHashMap());
            String effectiveId = mMapViewController.getMarkerEffectiveId(marker.getId());
            promise.resolve(ObjectTranslationUtil.getMapFromMarker(marker, effectiveId));
          } catch (IllegalArgumentException e) {
            promise.reject(JsErrors.INVALID_IMAGE_ERROR_CODE, e.getMessage());
          }
        });
  }

  @Override
  public void addPolyline(ReadableMap options, final Promise promise) {
    ReadableMap polylineOptionsMap = options;
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          Polyline polyline = mMapViewController.addPolyline(polylineOptionsMap.toHashMap());
          String effectiveId = mMapViewController.getPolylineEffectiveId(polyline.getId());
          promise.resolve(ObjectTranslationUtil.getMapFromPolyline(polyline, effectiveId));
        });
  }

  @Override
  public void addPolygon(ReadableMap options, final Promise promise) {
    ReadableMap polygonOptionsMap = options;
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          Polygon polygon = mMapViewController.addPolygon(polygonOptionsMap.toHashMap());
          String effectiveId = mMapViewController.getPolygonEffectiveId(polygon.getId());
          promise.resolve(ObjectTranslationUtil.getMapFromPolygon(polygon, effectiveId));
        });
  }

  @Override
  public void addGroundOverlay(ReadableMap options, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          try {
            GroundOverlay overlay = mMapViewController.addGroundOverlay(options.toHashMap());
            if (overlay == null) {
              promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
              return;
            }
            String effectiveId = mMapViewController.getGroundOverlayEffectiveId(overlay.getId());
            promise.resolve(ObjectTranslationUtil.getMapFromGroundOverlay(overlay, effectiveId));
          } catch (IllegalArgumentException e) {
            promise.reject(JsErrors.INVALID_OPTIONS_ERROR_CODE, e.getMessage());
          }
        });
  }

  @Override
  public void removeCircle(String id, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          mMapViewController.removeCircle(id);
          promise.resolve(null);
        });
  }

  @Override
  public void removeMarker(String id, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          mMapViewController.removeMarker(id);
          promise.resolve(null);
        });
  }

  @Override
  public void removePolyline(String id, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          mMapViewController.removePolyline(id);
          promise.resolve(null);
        });
  }

  @Override
  public void removePolygon(String id, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          mMapViewController.removePolygon(id);
          promise.resolve(null);
        });
  }

  @Override
  public void removeGroundOverlay(String id, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          // Ground overlay removal for Android Auto
          // This would require MapViewController to implement removeGroundOverlay
          promise.resolve(null);
        });
  }

  @Override
  public void clearMapView(final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          mMapViewController.clearMapView();
          promise.resolve(null);
        });
  }

  @Override
  public void setIndoorEnabled(boolean enabled) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setIndoorEnabled(enabled);
        });
  }

  @Override
  public void setTrafficEnabled(boolean enabled) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setTrafficEnabled(enabled);
        });
  }

  @Override
  public void setCompassEnabled(boolean enabled) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setCompassEnabled(enabled);
        });
  }

  @Override
  public void setMyLocationButtonEnabled(boolean enabled) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setMyLocationButtonEnabled(enabled);
        });
  }

  @Override
  public void setMapColorScheme(double colorScheme) {
    int jsValue = (int) colorScheme;
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setColorScheme(jsValue);
        });
  }

  @Override
  public void setNightMode(double nightMode) {
    int jsValue = (int) nightMode;
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mNavigationViewController == null) {
            return;
          }
          mNavigationViewController.setNightModeOption(
              EnumTranslationUtil.getForceNightModeFromJsValue(jsValue));
        });
  }

  @Override
  public void setMyLocationEnabled(boolean enabled) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setMyLocationEnabled(enabled);
        });
  }

  @Override
  public void setFollowingPerspective(double perspective) {
    int jsValue = (int) perspective;
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setFollowingPerspective(jsValue);
        });
  }

  @Override
  public void sendCustomMessage(String type, @Nullable String data) {
    UiThreadUtil.runOnUiThread(
        () -> {
          // Parse the JSON data string if provided
          JSONObject jsonObject = null;
          if (data != null && !data.isEmpty()) {
            try {
              jsonObject = new org.json.JSONObject(data);
            } catch (org.json.JSONException e) {
              Log.e(TAG, "Error parsing custom message data: " + e.getMessage());
            }
          }

          // Call the screen's handler method if registered
          if (mAutoScreen != null) {
            mAutoScreen.onCustomMessageReceived(type, jsonObject);
          }
        });
  }

  public void setRotateGesturesEnabled(Boolean enabled) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setRotateGesturesEnabled(enabled);
        });
  }

  public void setScrollGesturesEnabled(Boolean enabled) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setScrollGesturesEnabled(enabled);
        });
  }

  public void setScrollGesturesEnabledDuringRotateOrZoom(Boolean enabled) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setScrollGesturesEnabledDuringRotateOrZoom(enabled);
        });
  }

  public void setZoomControlsEnabled(Boolean enabled) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setZoomControlsEnabled(enabled);
        });
  }

  @Override
  public void setZoomLevel(double zoomLevel, final Promise promise) {
    int level = (int) zoomLevel;
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          mMapViewController.setZoomLevel(level);
          promise.resolve(true);
        });
  }

  public void setTiltGesturesEnabled(Boolean enabled) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setTiltGesturesEnabled(enabled);
        });
  }

  public void setZoomGesturesEnabled(Boolean enabled) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setZoomGesturesEnabled(enabled);
        });
  }

  @Override
  public void setBuildingsEnabled(boolean enabled) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setBuildingsEnabled(enabled);
        });
  }

  @Override
  public void getCameraPosition(final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          CameraPosition cp = mMapViewController.getGoogleMap().getCameraPosition();

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
  public void getMyLocation(final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          try {
            Location location = mMapViewController.getGoogleMap().getMyLocation();
            promise.resolve(ObjectTranslationUtil.getMapFromLocation(location));
          } catch (Exception e) {
            promise.resolve(null);
          }
        });
  }

  @Override
  public void getUiSettings(final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          UiSettings settings = mMapViewController.getGoogleMap().getUiSettings();

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
  public void isMyLocationEnabled(final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          promise.resolve(mMapViewController.getGoogleMap().isMyLocationEnabled());
        });
  }

  @Override
  public void moveCamera(ReadableMap cameraPosition, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          mMapViewController.moveCamera(cameraPosition.toHashMap());
          promise.resolve(null);
        });
  }

  @Override
  public void isAutoScreenAvailable(final Promise promise) {
    promise.resolve(mMapViewController != null);
  }

  @Override
  public void setMapPadding(double top, double left, double bottom, double right) {
    int topInt = (int) top;
    int leftInt = (int) left;
    int bottomInt = (int) bottom;
    int rightInt = (int) right;
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }

          mMapViewController.setPadding(topInt, leftInt, bottomInt, rightInt);
        });
  }

  @Override
  public void getMarkers(final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          WritableArray result = Arguments.createArray();
          for (Map.Entry<String, Marker> entry : mMapViewController.getMarkerMap().entrySet()) {
            result.pushMap(
                ObjectTranslationUtil.getMapFromMarker(entry.getValue(), entry.getKey()));
          }
          promise.resolve(result);
        });
  }

  @Override
  public void getCircles(final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          WritableArray result = Arguments.createArray();
          for (Map.Entry<String, Circle> entry : mMapViewController.getCircleMap().entrySet()) {
            result.pushMap(
                ObjectTranslationUtil.getMapFromCircle(entry.getValue(), entry.getKey()));
          }
          promise.resolve(result);
        });
  }

  @Override
  public void getPolylines(final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          WritableArray result = Arguments.createArray();
          for (Map.Entry<String, Polyline> entry : mMapViewController.getPolylineMap().entrySet()) {
            result.pushMap(
                ObjectTranslationUtil.getMapFromPolyline(entry.getValue(), entry.getKey()));
          }
          promise.resolve(result);
        });
  }

  @Override
  public void getPolygons(final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          WritableArray result = Arguments.createArray();
          for (Map.Entry<String, Polygon> entry : mMapViewController.getPolygonMap().entrySet()) {
            result.pushMap(
                ObjectTranslationUtil.getMapFromPolygon(entry.getValue(), entry.getKey()));
          }
          promise.resolve(result);
        });
  }

  @Override
  public void getGroundOverlays(final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          WritableArray result = Arguments.createArray();
          for (Map.Entry<String, GroundOverlay> entry :
              mMapViewController.getGroundOverlayMap().entrySet()) {
            result.pushMap(
                ObjectTranslationUtil.getMapFromGroundOverlay(entry.getValue(), entry.getKey()));
          }
          promise.resolve(result);
        });
  }

  public void sendScreenState(boolean available) {
    // Check if React context is active and has catalyst instance before emitting events.
    // This prevents crashes when Android Auto screen initializes before React Native is ready.
    if (reactContext == null || !reactContext.hasActiveReactInstance()) {
      Log.w(TAG, "Cannot send screen state: React context is not active, storing pending state");
      if (available) {
        mPendingScreenAvailable = true;
      }
      return;
    }

    try {
      mPendingScreenAvailable = false;
      emitOnAutoScreenAvailabilityChanged(available);
    } catch (Exception e) {
      Log.e(TAG, "Failed to emit screen state, deferring: " + e.getMessage());
      if (available) {
        mPendingScreenAvailable = true;
      }
    }
  }

  @Override
  public void onHostResume() {
    // When React context resumes, trigger the module ready listener if it was set
    // before the React context was ready. Clear it after calling to avoid duplicate calls.
    if (moduleReadyListener != null) {
      Log.i(TAG, "React context resumed, triggering pending module ready listener");
      ModuleReadyListener listener = moduleReadyListener;
      moduleReadyListener = null;
      listener.onModuleReady();
    }

    // Send any pending screen availability state
    if (mPendingScreenAvailable && mMapViewController != null) {
      Log.i(TAG, "React context resumed, sending pending screen available state");
      mPendingScreenAvailable = false;
      emitOnAutoScreenAvailabilityChanged(true);
    }
  }

  @Override
  public void onHostPause() {}

  @Override
  public void onHostDestroy() {}

  @Override
  public void onCustomNavigationAutoEvent(String type, ReadableMap data) {
    // Check if React context is active before emitting events.
    if (reactContext == null || !reactContext.hasActiveReactInstance()) {
      Log.w(TAG, "Cannot send custom event: React context is not active");
      return;
    }

    WritableMap params = Arguments.createMap();
    params.putString("type", type);
    if (data != null) {
      try {
        // Convert ReadableMap to JSON string for the data field
        org.json.JSONObject jsonObject = new org.json.JSONObject(data.toHashMap());
        params.putString("data", jsonObject.toString());
      } catch (Exception e) {
        params.putNull("data");
      }
    } else {
      params.putNull("data");
    }

    emitOnCustomNavigationAutoEvent(params);
  }
}
