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

/**
 * This exposes a series of methods that can be called diretly from the React Native code. They have
 * been implemented using promises as it's not recommended for them to be synchronous.
 */
@ReactModule(name = GMNNavViewModule.NAME)
public class GMNNavViewModule extends NativeNavViewModuleSpec {

  private final GMNNavViewManager mNavViewManager;

  public GMNNavViewModule(ReactApplicationContext reactContext, GMNNavViewManager navViewManager) {
    super(reactContext);
    mNavViewManager = navViewManager;
  }

  @Override
  public void getCameraPosition(double nativeID, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mNavViewManager.getGoogleMap((int) nativeID) == null) {
            promise.reject(GMNJsErrors.NO_MAP_ERROR_CODE, GMNJsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          CameraPosition cp = mNavViewManager.getGoogleMap((int) nativeID).getCameraPosition();

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
  public void getMyLocation(double nativeID, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mNavViewManager.getGoogleMap((int) nativeID) == null) {
            promise.reject(GMNJsErrors.NO_MAP_ERROR_CODE, GMNJsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          try {
            Location location = mNavViewManager.getGoogleMap((int) nativeID).getMyLocation();
            promise.resolve(GMNObjectTranslationUtil.getMapFromLocation(location));
          } catch (Exception e) {
            promise.resolve(null);
          }
        });
  }

  @Override
  public void getUiSettings(double nativeID, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mNavViewManager.getGoogleMap((int) nativeID) == null) {
            promise.reject(GMNJsErrors.NO_MAP_ERROR_CODE, GMNJsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          UiSettings settings = mNavViewManager.getGoogleMap((int) nativeID).getUiSettings();

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
  public void isMyLocationEnabled(double nativeID, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mNavViewManager.getGoogleMap((int) nativeID) == null) {
            promise.reject(GMNJsErrors.NO_MAP_ERROR_CODE, GMNJsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }

          promise.resolve(mNavViewManager.getGoogleMap((int) nativeID).isMyLocationEnabled());
        });
  }

  // Generic error handler for promise-based view method calls.
  private void handleError(Promise promise, Exception e) {
    String code = GMNJsErrors.UNKNOWN_NATIVE_ERROR_CODE;

    if (e instanceof IllegalStateException) {
      String msg = e.getMessage();
      if (msg != null) {
        if (msg.contains("Fragment not found for the provided viewId.")) {
          code = GMNJsErrors.VIEW_NOT_FOUND_ERROR_CODE;
        }
      }
    }
    promise.reject(code, e);
  }

  @Override
  public void showRouteOverview(double viewId, Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          try {
            mNavViewManager.getNavFragmentForNativeID((int) viewId).showRouteOverview();
            promise.resolve(null);
          } catch (Exception e) {
            handleError(promise, e);
          }
        });
  }

  @Override
  public void clearMapView(double viewId, Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          try {
            mNavViewManager.getFragmentForNativeID((int) viewId).getGoogleMap().clear();
            promise.resolve(null);
          } catch (Exception e) {
            handleError(promise, e);
          }
        });
  }

  @Override
  public void removeMarker(double viewId, String id, Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          try {
            mNavViewManager
                .getFragmentForNativeID((int) viewId)
                .getMapController()
                .removeMarker(id);
            promise.resolve(null);
          } catch (Exception e) {
            handleError(promise, e);
          }
        });
  }

  @Override
  public void removePolyline(double viewId, String id, Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          try {
            mNavViewManager
                .getFragmentForNativeID((int) viewId)
                .getMapController()
                .removePolyline(id);
            promise.resolve(null);
          } catch (Exception e) {
            handleError(promise, e);
          }
        });
  }

  @Override
  public void removePolygon(double viewId, String id, Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          try {
            mNavViewManager
                .getFragmentForNativeID((int) viewId)
                .getMapController()
                .removePolygon(id);
            promise.resolve(null);
          } catch (Exception e) {
            handleError(promise, e);
          }
        });
  }

  @Override
  public void removeCircle(double viewId, String id, Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          try {
            mNavViewManager
                .getFragmentForNativeID((int) viewId)
                .getMapController()
                .removeCircle(id);
            promise.resolve(null);
          } catch (Exception e) {
            handleError(promise, e);
          }
        });
  }

  @Override
  public void removeGroundOverlay(double viewId, String id, Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          try {
            mNavViewManager
                .getFragmentForNativeID((int) viewId)
                .getMapController()
                .removeGroundOverlay(id);
            promise.resolve(null);
          } catch (Exception e) {
            handleError(promise, e);
          }
        });
  }

  @Override
  public void setZoomLevel(double viewId, double level, Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          try {
            mNavViewManager
                .getFragmentForNativeID((int) viewId)
                .getMapController()
                .setZoomLevel((int) level);
            promise.resolve(null);
          } catch (Exception e) {
            handleError(promise, e);
          }
        });
  }

  @Override
  public void moveCamera(double nativeID, ReadableMap cameraPositionMap, Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          try {
            CameraPosition cameraPos =
                GMNObjectTranslationUtil.getCameraPositionFromMap(cameraPositionMap.toHashMap());
            mNavViewManager
                .getFragmentForNativeID((int) nativeID)
                .getMapController()
                .moveCamera(cameraPos);
            promise.resolve(null);
          } catch (Exception e) {
            handleError(promise, e);
          }
        });
  }

  @Override
  public void addMarker(double nativeID, ReadableMap markerOptionsMap, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mNavViewManager.getGoogleMap((int) nativeID) == null) {
            promise.reject(GMNJsErrors.NO_MAP_ERROR_CODE, GMNJsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          GMNMarker marker =
              mNavViewManager
                  .getFragmentForNativeID((int) nativeID)
                  .getMapController()
                  .addMarker(markerOptionsMap.toHashMap());

          promise.resolve(GMNObjectTranslationUtil.getMapFromMarker(marker));
        });
  }

  @Override
  public void addPolyline(double nativeID, ReadableMap polylineOptionsMap, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mNavViewManager.getGoogleMap((int) nativeID) == null) {
            promise.reject(GMNJsErrors.NO_MAP_ERROR_CODE, GMNJsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          GMNPolyline polyline =
              mNavViewManager
                  .getFragmentForNativeID((int) nativeID)
                  .getMapController()
                  .addPolyline(polylineOptionsMap.toHashMap());

          promise.resolve(GMNObjectTranslationUtil.getMapFromPolyline(polyline));
        });
  }

  @Override
  public void addPolygon(double nativeID, ReadableMap polygonOptionsMap, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mNavViewManager.getGoogleMap((int) nativeID) == null) {
            promise.reject(GMNJsErrors.NO_MAP_ERROR_CODE, GMNJsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          GMNPolygon polygon =
              mNavViewManager
                  .getFragmentForNativeID((int) nativeID)
                  .getMapController()
                  .addPolygon(polygonOptionsMap.toHashMap());

          promise.resolve(GMNObjectTranslationUtil.getMapFromPolygon(polygon));
        });
  }

  @Override
  public void addCircle(double nativeID, ReadableMap circleOptionsMap, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mNavViewManager.getGoogleMap((int) nativeID) == null) {
            promise.reject(GMNJsErrors.NO_MAP_ERROR_CODE, GMNJsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          GMNCircle circle =
              mNavViewManager
                  .getFragmentForNativeID((int) nativeID)
                  .getMapController()
                  .addCircle(circleOptionsMap.toHashMap());

          promise.resolve(GMNObjectTranslationUtil.getMapFromCircle(circle));
        });
  }

  @Override
  public void addGroundOverlay(
      double nativeID, ReadableMap overlayOptionsMap, final Promise promise) {
    UiThreadUtil.runOnUiThread(
        () -> {
          if (mNavViewManager.getGoogleMap((int) nativeID) == null) {
            promise.reject(GMNJsErrors.NO_MAP_ERROR_CODE, GMNJsErrors.NO_MAP_ERROR_MESSAGE);
            return;
          }
          GMNGroundOverlay overlay =
              mNavViewManager
                  .getFragmentForNativeID((int) nativeID)
                  .getMapController()
                  .addGroundOverlay(overlayOptionsMap.toHashMap());

          promise.resolve(GMNObjectTranslationUtil.getMapFromGroundOverlay(overlay));
        });
  }

  @Override
  public boolean canOverrideExistingModule() {
    return true;
  }
}
