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

import android.location.Location;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.module.annotations.ReactModule;
import com.google.android.gms.maps.UiSettings;
import com.google.android.gms.maps.model.CameraPosition;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.libraries.navigation.StylingOptions;
import java.util.Map;

/**
 * This exposes a series of methods that can be called directly from the React Native code. They
 * have been implemented using promises as it's not recommended for them to be synchronous.
 */
@ReactModule(name = GMNNavAutoModule.NAME)
public class GMNNavAutoModule extends NativeNavAutoModuleSpec
    implements IGMNNavigationAutoCallback {
  private static GMNNavAutoModule instance;
  private static ModuleReadyListener moduleReadyListener;

  ReactApplicationContext reactContext;
  private GMNMapViewController mMapViewController;
  private StylingOptions mStylingOptions;
  private IGMNNavigationViewController mNavigationViewController;

  public interface ModuleReadyListener {
    void onModuleReady();
  }

  public GMNNavAutoModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
    instance = this;
    if (moduleReadyListener != null) {
      moduleReadyListener.onModuleReady();
    }
  }

  // Called by the AndroidAuto implementation. See NavigationSdkExample for example.
  public static synchronized GMNNavAutoModule getInstance() {
    if (instance == null) {
      throw new IllegalStateException(NAME + " instance is null");
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
      GMNMapViewController mapViewController,
      IGMNNavigationViewController navigationViewController) {
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
    mStylingOptions = new GMNStylingOptionsBuilder.Builder(stylingOptions).build();
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mStylingOptions != null && mNavigationViewController != null) {
            mNavigationViewController.setStylingOptions(mStylingOptions);
          }
        });
  }

  @Override
  public void setMapType(double jsValue) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setMapType((int) jsValue);
        });
  }

  @Override
  public void setMapStyle(String url) {
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
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(GMNJsErrors.NO_MAP_ERROR_CODE, GMNJsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          GMNCircle circle = mMapViewController.addCircle(options.toHashMap());

          if (circle == null) {
            promise.reject(
                GMNJsErrors.FAILED_TO_CREATE_MAP_OBJECT_ERROR_CODE,
                GMNJsErrors.FAILED_TO_CREATE_MAP_OBJECT_ERROR_MESSAGE);
            return;
          }

          promise.resolve(GMNObjectTranslationUtil.getMapFromCircle(circle));
        });
  }

  @Override
  public void addMarker(ReadableMap options, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(GMNJsErrors.NO_MAP_ERROR_CODE, GMNJsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          GMNMarker marker = mMapViewController.addMarker(options.toHashMap());

          if (marker == null) {
            promise.reject(
                GMNJsErrors.FAILED_TO_CREATE_MAP_OBJECT_ERROR_CODE,
                GMNJsErrors.FAILED_TO_CREATE_MAP_OBJECT_ERROR_MESSAGE);
            return;
          }

          promise.resolve(GMNObjectTranslationUtil.getMapFromMarker(marker));
        });
  }

  @Override
  public void addPolyline(ReadableMap options, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(GMNJsErrors.NO_MAP_ERROR_CODE, GMNJsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          GMNPolyline polyline = mMapViewController.addPolyline(options.toHashMap());

          if (polyline == null) {
            promise.reject(
                GMNJsErrors.FAILED_TO_CREATE_MAP_OBJECT_ERROR_CODE,
                GMNJsErrors.FAILED_TO_CREATE_MAP_OBJECT_ERROR_MESSAGE);
            return;
          }

          promise.resolve(GMNObjectTranslationUtil.getMapFromPolyline(polyline));
        });
  }

  @Override
  public void addPolygon(ReadableMap options, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(GMNJsErrors.NO_MAP_ERROR_CODE, GMNJsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          GMNPolygon polygon = mMapViewController.addPolygon(options.toHashMap());

          if (polygon == null) {
            promise.reject(
                GMNJsErrors.FAILED_TO_CREATE_MAP_OBJECT_ERROR_CODE,
                GMNJsErrors.FAILED_TO_CREATE_MAP_OBJECT_ERROR_MESSAGE);
            return;
          }

          promise.resolve(GMNObjectTranslationUtil.getMapFromPolygon(polygon));
        });
  }

  @Override
  public void addGroundOverlay(ReadableMap options, Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(GMNJsErrors.NO_MAP_ERROR_CODE, GMNJsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          GMNGroundOverlay overlay = mMapViewController.addGroundOverlay(options.toHashMap());

          if (overlay == null) {
            promise.reject(
                GMNJsErrors.FAILED_TO_CREATE_MAP_OBJECT_ERROR_CODE,
                GMNJsErrors.FAILED_TO_CREATE_MAP_OBJECT_ERROR_MESSAGE);
            return;
          }

          promise.resolve(GMNObjectTranslationUtil.getMapFromGroundOverlay(overlay));
        });
  }

  @Override
  public void removeCircle(String id, Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(GMNJsErrors.NO_MAP_ERROR_CODE, GMNJsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          mMapViewController.removeCircle(id);
          promise.resolve(true);
        });
  }

  @Override
  public void removeGroundOverlay(String id, Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(GMNJsErrors.NO_MAP_ERROR_CODE, GMNJsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          mMapViewController.removeGroundOverlay(id);
          promise.resolve(true);
        });
  }

  @Override
  public void removeMarker(String id, Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(GMNJsErrors.NO_MAP_ERROR_CODE, GMNJsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          mMapViewController.removeMarker(id);
          promise.resolve(true);
        });
  }

  @Override
  public void removePolyline(String id, Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(GMNJsErrors.NO_MAP_ERROR_CODE, GMNJsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          mMapViewController.removePolyline(id);
          promise.resolve(true);
        });
  }

  @Override
  public void removePolygon(String id, Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(GMNJsErrors.NO_MAP_ERROR_CODE, GMNJsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          mMapViewController.removePolygon(id);
          promise.resolve(true);
        });
  }

  @Override
  public void clearMapView(Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(GMNJsErrors.NO_MAP_ERROR_CODE, GMNJsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          mMapViewController.clearMapView();
          promise.resolve(true);
        });
  }

  @Override
  public void setIndoorEnabled(boolean isOn) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setIndoorEnabled(isOn);
        });
  }

  @Override
  public void setTrafficEnabled(boolean isOn) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setTrafficEnabled(isOn);
        });
  }

  @Override
  public void setCompassEnabled(boolean isOn) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setCompassEnabled(isOn);
        });
  }

  @Override
  public void setMyLocationEnabled(boolean isOn) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setMyLocationEnabled(isOn);
        });
  }

  @Override
  public void setZoomLevel(final double level, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(GMNJsErrors.NO_MAP_ERROR_CODE, GMNJsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          mMapViewController.setZoomLevel((int) level);
          promise.resolve(true);
        });
  }

  @Override
  public void setMapPadding(double top, double left, double bottom, double right) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }

          mMapViewController.setPadding((int) top, (int) left, (int) bottom, (int) right);
        });
  }

  @Override
  public void setBuildingsEnabled(boolean isOn) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            return;
          }
          mMapViewController.setBuildingsEnabled(isOn);
        });
  }

  @Override
  public void getCameraPosition(final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(GMNJsErrors.NO_MAP_ERROR_CODE, GMNJsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          CameraPosition cp = mMapViewController.getGoogleMap().getCameraPosition();

          LatLng target = cp.target;
          WritableMap map = Arguments.createMap();
          map.putDouble("bearing", cp.bearing);
          map.putDouble("tilt", cp.tilt);
          map.putDouble("zoom", cp.zoom);
          map.putMap("target", GMNObjectTranslationUtil.getMapFromLatLng(target));

          promise.resolve(map);
        });
  }

  @Override
  public void getMyLocation(final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(GMNJsErrors.NO_MAP_ERROR_CODE, GMNJsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          try {
            Location location = mMapViewController.getGoogleMap().getMyLocation();
            promise.resolve(GMNObjectTranslationUtil.getMapFromLocation(location));
          } catch (Exception e) {
            promise.resolve(null);
            return;
          }
        });
  }

  @Override
  public void getUiSettings(final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(GMNJsErrors.NO_MAP_ERROR_CODE, GMNJsErrors.NO_MAP_ERROR_MESSAGE);
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
            promise.reject(GMNJsErrors.NO_MAP_ERROR_CODE, GMNJsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          promise.resolve(mMapViewController.getGoogleMap().isMyLocationEnabled());
        });
  }

  @Override
  public void moveCamera(ReadableMap map, Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mMapViewController == null) {
            promise.reject(GMNJsErrors.NO_MAP_ERROR_CODE, GMNJsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          Map<String, Object> cameraMap = map.toHashMap();
          mMapViewController.moveCamera(
              GMNObjectTranslationUtil.getCameraPositionFromMap(cameraMap));
          promise.resolve(true);
        });
  }

  @Override
  public void isAutoScreenAvailable(final Promise promise) {
    promise.resolve(mMapViewController != null);
  }

  public void sendScreenState(boolean available) {
    emitOnAutoScreenAvailabilityChanged(available);
  }

  @Override
  public void onCustomNavigationAutoEvent(String type, ReadableMap data) {
    emitOnCustomNavigationAutoEvent(data);
  }
}
