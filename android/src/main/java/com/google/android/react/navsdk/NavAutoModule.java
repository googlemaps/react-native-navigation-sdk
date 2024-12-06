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
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.CatalystInstance;
import com.facebook.react.bridge.NativeArray;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.google.android.gms.maps.UiSettings;
import com.google.android.gms.maps.model.CameraPosition;
import com.google.android.gms.maps.model.Circle;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.Polygon;
import com.google.android.gms.maps.model.Polyline;
import com.google.android.libraries.navigation.StylingOptions;
import java.util.Map;

/**
 * This exposes a series of methods that can be called diretly from the React Native code. They have
 * been implemented using promises as it's not recommended for them to be synchronous.
 */
public class NavAutoModule extends ReactContextBaseJavaModule implements INavigationAutoCallback {
  public static final String REACT_CLASS = "NavAutoModule";
  private static final String TAG = "AndroidAutoModule";
  private static NavAutoModule instance;
  private static ModuleReadyListener moduleReadyListener;

  ReactApplicationContext reactContext;
  private MapViewController mMapViewController;
  private StylingOptions mStylingOptions;
  private INavigationViewController mNavigationViewController;

  public interface ModuleReadyListener {
    void onModuleReady();
  }

  public NavAutoModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
    instance = this;
    if (moduleReadyListener != null) {
      moduleReadyListener.onModuleReady();
    }
  }

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

  public static void setModuleReadyListener(ModuleReadyListener listener) {
    moduleReadyListener = listener;
    if (instance != null && moduleReadyListener != null) {
      moduleReadyListener.onModuleReady();
    }
  }

  public void androidAutoNavigationScreenInitialized(
      MapViewController mapViewController, INavigationViewController navigationViewController) {
    mMapViewController = mapViewController;
    mNavigationViewController = navigationViewController;
    if (mStylingOptions != null && mNavigationViewController != null) {
      mNavigationViewController.setStylingOptions(mStylingOptions);
    }
    sendScreenState(true);
  }

  public void androidAutoNavigationScreenDisposed() {
    sendScreenState(false);
    mMapViewController = null;
    mNavigationViewController = null;
  }

  public void setStylingOptions(Map<String, Object> stylingOptions) {
    mStylingOptions = new StylingOptionsBuilder.Builder(stylingOptions).build();
    if (mStylingOptions != null && mNavigationViewController != null) {
      mNavigationViewController.setStylingOptions(mStylingOptions);
    }
  }

  @ReactMethod
  public void setMapType(int jsValue) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setMapType(jsValue);
        });
  }

  @ReactMethod
  public void setMapStyle(String url) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setMapStyle(url);
        });
  }

  @ReactMethod
  public void setMapToolbarEnabled(boolean isOn) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setMapToolbarEnabled(isOn);
        });
  }

  @ReactMethod
  public void addCircle(ReadableMap circleOptionsMap, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          Circle circle = mMapViewController.addCircle(circleOptionsMap.toHashMap());

          promise.resolve(ObjectTranslationUtil.getMapFromCircle(circle));
        });
  }

  @ReactMethod
  public void addMarker(ReadableMap markerOptionsMap, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          Marker marker = mMapViewController.addMarker(markerOptionsMap.toHashMap());

          promise.resolve(ObjectTranslationUtil.getMapFromMarker(marker));
        });
  }

  @ReactMethod
  public void addPolyline(ReadableMap polylineOptionsMap, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          Polyline polyline = mMapViewController.addPolyline(polylineOptionsMap.toHashMap());

          promise.resolve(ObjectTranslationUtil.getMapFromPolyline(polyline));
        });
  }

  @ReactMethod
  public void addPolygon(ReadableMap polygonOptionsMap, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          Polygon polygon = mMapViewController.addPolygon(polygonOptionsMap.toHashMap());

          promise.resolve(ObjectTranslationUtil.getMapFromPolygon(polygon));
        });
  }

  @ReactMethod
  public void removeCircle(String id) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.removeCircle(id);
        });
  }

  @ReactMethod
  public void removeMarker(String id) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.removeMarker(id);
        });
  }

  @ReactMethod
  public void removePolyline(String id) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.removePolyline(id);
        });
  }

  @ReactMethod
  public void removePolygon(String id) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.removePolygon(id);
        });
  }

  @ReactMethod
  public void clearMapView() {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.clearMapView();
        });
  }

  @ReactMethod
  public void setIndoorEnabled(Boolean isOn) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setIndoorEnabled(isOn);
        });
  }

  @ReactMethod
  public void setTrafficEnabled(Boolean isOn) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setTrafficEnabled(isOn);
        });
  }

  @ReactMethod
  public void setCompassEnabled(Boolean isOn) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setCompassEnabled(isOn);
        });
  }

  @ReactMethod
  public void setMyLocationButtonEnabled(Boolean isOn) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setMyLocationButtonEnabled(isOn);
        });
  }

  @ReactMethod
  public void setMyLocationEnabled(Boolean isOn) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setMyLocationEnabled(isOn);
        });
  }

  @ReactMethod
  public void setRotateGesturesEnabled(Boolean isOn) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setRotateGesturesEnabled(isOn);
        });
  }

  @ReactMethod
  public void setScrollGesturesEnabled(Boolean isOn) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setScrollGesturesEnabled(isOn);
        });
  }

  @ReactMethod
  public void setScrollGesturesEnabledDuringRotateOrZoom(Boolean isOn) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setScrollGesturesEnabledDuringRotateOrZoom(isOn);
        });
  }

  @ReactMethod
  public void setZoomControlsEnabled(Boolean isOn) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setZoomControlsEnabled(isOn);
        });
  }

  @ReactMethod
  public void setZoomLevel(final Integer level, final Promise promise) {
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

  @ReactMethod
  public void setTiltGesturesEnabled(Boolean isOn) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setTiltGesturesEnabled(isOn);
        });
  }

  @ReactMethod
  public void setZoomGesturesEnabled(Boolean isOn) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setZoomGesturesEnabled(isOn);
        });
  }

  @ReactMethod
  public void setBuildingsEnabled(Boolean isOn) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setBuildingsEnabled(isOn);
        });
  }

  @ReactMethod
  public void getCameraPosition(final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          CameraPosition cp = mMapViewController.getGoogleMap().getCameraPosition();

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
          if (mMapViewController == null) {
            promise.reject(JsErrors.NO_MAP_ERROR_CODE, JsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          try {
            Location location = mMapViewController.getGoogleMap().getMyLocation();
            promise.resolve(ObjectTranslationUtil.getMapFromLocation(location));
          } catch (Exception e) {
            promise.resolve(null);
            return;
          }
        });
  }

  @ReactMethod
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

  @ReactMethod
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

  @ReactMethod
  public void moveCamera(ReadableMap map) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }

          mMapViewController.moveCamera(map.toHashMap());
        });
  }

  @ReactMethod
  public void isAutoScreenAvailable(final Promise promise) {
    promise.resolve(mMapViewController != null);
  }

  @ReactMethod
  public void setPadding(
      final Integer top, final Integer left, final Integer bottom, final Integer right) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }

          mMapViewController.setPadding(top, left, bottom, right);
        });
  }

  public void sendScreenState(boolean available) {
    WritableNativeArray params = new WritableNativeArray();
    params.pushBoolean(available);

    sendCommandToReactNative("onAutoScreenAvailabilityChanged", params);
  }

  @Override
  public void onCustomNavigationAutoEvent(String type, ReadableMap data) {
    WritableMap map = Arguments.createMap();
    map.putString("type", type);
    map.putMap("data", data);

    WritableNativeArray params = new WritableNativeArray();
    params.pushMap(map);

    sendCommandToReactNative("onCustomNavigationAutoEvent", params);
  }

  /** Send command to react native. */
  private void sendCommandToReactNative(String functionName, NativeArray params) {
    ReactContext reactContext = getReactApplicationContext();

    if (reactContext != null) {
      CatalystInstance catalystInstance = reactContext.getCatalystInstance();
      catalystInstance.callFunction(Constants.NAV_AUTO_JAVASCRIPT_FLAG, functionName, params);
    }
  }
}
