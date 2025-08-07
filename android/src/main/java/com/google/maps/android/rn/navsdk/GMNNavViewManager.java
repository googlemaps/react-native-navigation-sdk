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

import static com.google.maps.android.rn.navsdk.GMNEnumTranslationUtil.getMapViewTypeFromJsValue;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.facebook.react.bridge.Dynamic;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.touch.JSResponderHandler;
import com.facebook.react.uimanager.ReactStylesDiffMap;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.StateWrapper;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewManagerDelegate;
import com.facebook.react.viewmanagers.NavViewManagerDelegate;
import com.facebook.react.viewmanagers.NavViewManagerInterface;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.model.CameraPosition;
import java.lang.ref.WeakReference;
import java.util.HashMap;
import java.util.Map;

// NavViewManager is responsible for managing both the regular map fragment as well as the
// navigation map view fragment.
@ReactModule(name = GMNNavViewManager.NAME)
public class GMNNavViewManager extends SimpleViewManager<GMNMapViewLayout>
    implements NavViewManagerInterface<GMNMapViewLayout> {
  private final NavViewManagerDelegate<GMNMapViewLayout, GMNNavViewManager> mDelegate =
      new NavViewManagerDelegate<>(this);

  public static final String NAME = "NavView";

  private static GMNNavViewManager instance;

  private final HashMap<Integer, WeakReference<IGMNMapViewFragment>> fragmentMap = new HashMap<>();

  private final ReactApplicationContext reactContext;

  public GMNNavViewManager(ReactApplicationContext reactContext) {
    this.reactContext = reactContext;
  }

  public static synchronized GMNNavViewManager getInstance(ReactApplicationContext reactContext) {
    if (instance == null) {
      instance = new GMNNavViewManager(reactContext);
    }
    return instance;
  }

  public static synchronized GMNNavViewManager getInstance() {
    return instance;
  }

  @Nullable
  @Override
  protected ViewManagerDelegate<GMNMapViewLayout> getDelegate() {
    return mDelegate;
  }

  @Override
  @NonNull
  public String getName() {
    return NAME;
  }

  public @NonNull GMNMapViewLayout createView(
      int reactTag,
      @NonNull ThemedReactContext reactContext,
      @Nullable ReactStylesDiffMap props,
      @Nullable StateWrapper stateWrapper,
      JSResponderHandler jsResponderHandler) {
    return super.createView(reactTag, reactContext, props, stateWrapper, jsResponderHandler);
  }

  /** Return a FrameLayout which will later hold the Fragment */
  @Override
  @NonNull
  public GMNMapViewLayout createViewInstance(@NonNull ThemedReactContext context) {
    return new GMNMapViewLayout(context);
  }

  public void onDropViewInstance(@NonNull GMNMapViewLayout view) {
    super.onDropViewInstance(view);
    fragmentMap.remove(view.getNativeID());
  }

  public IGMNNavViewFragment getNavFragmentForNativeID(int nativeID) {
    IGMNMapViewFragment fragment = getFragmentForNativeID(nativeID);

    // Check if the fragment is an INavigationViewFragment
    if (fragment instanceof IGMNNavViewFragment) {
      return (IGMNNavViewFragment) fragment;
    } else {
      throw new IllegalStateException("The fragment is not a nav view fragment");
    }
  }

  public IGMNNavViewFragment getNavFragmentForView(GMNMapViewLayout view) {
    IGMNMapViewFragment fragment = view.getFragment();

    // Check if the fragment is an INavigationViewFragment
    if (fragment instanceof IGMNNavViewFragment) {
      return (IGMNNavViewFragment) fragment;
    } else {
      throw new IllegalStateException("The fragment is not a nav view fragment");
    }
  }

  public IGMNMapViewFragment getFragmentForNativeID(int nativeID) {
    WeakReference<IGMNMapViewFragment> weakReference = fragmentMap.get(nativeID);
    if (weakReference == null || weakReference.get() == null) {
      throw new IllegalStateException("Fragment not found for the provided viewId.");
    }
    return weakReference.get();
  }

  public IGMNMapViewFragment getFragmentForView(GMNMapViewLayout view) {
    return view.getFragment();
  }

  public IGMNMapViewFragment getAnyFragment() {
    if (fragmentMap.isEmpty()) {
      return null;
    }
    // Return the first fragment found in the map's values collection.
    return fragmentMap.values().iterator().next().get();
  }

  public void applyStylingOptions() {
    for (WeakReference<IGMNMapViewFragment> weakReference : fragmentMap.values()) {
      if (weakReference.get() != null) {
        weakReference.get().applyStylingOptions();
      }
    }
  }

  @Override
  public Map<String, Object> getExportedCustomDirectEventTypeConstants() {
    Map<String, Object> baseEventTypeConstants = super.getExportedCustomDirectEventTypeConstants();
    Map<String, Object> eventTypeConstants =
        baseEventTypeConstants != null ? baseEventTypeConstants : new HashMap<>();

    eventTypeConstants.putAll(
        Map.of(
            "topRecenterButtonClick",
            Map.of("registrationName", "onRecenterButtonClick"),
            "topPromptVisibilityChanged",
            Map.of("registrationName", "onPromptVisibilityChanged"),
            "topMapReady",
            Map.of("registrationName", "onMapReady"),
            "topMapClick",
            Map.of("registrationName", "onMapClick"),
            "topMarkerClick",
            Map.of("registrationName", "onMarkerClick"),
            "topPolylineClick",
            Map.of("registrationName", "onPolylineClick"),
            "topPolygonClick",
            Map.of("registrationName", "onPolygonClick"),
            "topCircleClick",
            Map.of("registrationName", "onCircleClick"),
            "topGroundOverlayClick",
            Map.of("registrationName", "onGroundOverlayClick"),
            "topMarkerInfoWindowTapped",
            Map.of("registrationName", "onMarkerInfoWindowTapped")));

    return eventTypeConstants;
  }

  public GoogleMap getGoogleMap(int nativeID) {
    try {
      return getFragmentForNativeID(nativeID).getGoogleMap();
    } catch (Exception e) {
      return null;
    }
  }

  @Override
  public void setViewType(GMNMapViewLayout view, int value) {
    GMNCustomTypes.MapViewType mapViewType = getMapViewTypeFromJsValue(value);
    view.setMapViewType(mapViewType);
  }

  @Override
  public void setNativeID(GMNMapViewLayout view, @Nullable String value) {
    assert value != null;
    view.setNativeID(Integer.parseInt(value));
    super.setNativeId(view, value);
  }

  @Override
  public void setNavigationUIEnabled(GMNMapViewLayout view, @Nullable Boolean value) {
    view.setNavigationUIEnabled(value);
  }

  @Override
  public void setMapType(GMNMapViewLayout view, int value) {
    view.setMapType(value);
  }

  @Override
  public void setMapPadding(GMNMapViewLayout view, @Nullable ReadableMap value) {
    view.setMapPadding(value);
  }

  @Override
  public void setTripProgressBarEnabled(GMNMapViewLayout view, boolean value) {
    view.setTripProgressBarEnabled(value);
  }

  @Override
  public void setTrafficIncidentCardsEnabled(GMNMapViewLayout view, boolean value) {
    view.setTrafficIncidentCardsEnabled(value);
  }

  @Override
  public void setHeaderEnabled(GMNMapViewLayout view, boolean value) {
    view.setHeaderEnabled(value);
  }

  @Override
  public void setFooterEnabled(GMNMapViewLayout view, boolean value) {
    view.setFooterEnabled(value);
  }

  @Override
  public void setSpeedometerEnabled(GMNMapViewLayout view, boolean value) {
    view.setSpeedometerEnabled(value);
  }

  @Override
  public void setSpeedLimitIconEnabled(GMNMapViewLayout view, boolean value) {
    view.setSpeedLimitIconEnabled(value);
  }

  @Override
  public void setRecenterButtonEnabled(GMNMapViewLayout view, boolean value) {
    view.setRecenterButtonEnabled(value);
  }

  @Override
  public void setNavigationViewStylingOptions(GMNMapViewLayout view, Dynamic value) {
    view.setNavigationViewStylingOptions(value.isNull() ? null : value.asMap());
  }

  @Override
  public void setNightMode(GMNMapViewLayout view, int value) {
    view.setNightMode(value);
  }

  @Override
  public void setFollowingPerspective(GMNMapViewLayout view, int value) {
    view.setFollowingPerspective(value);
  }

  @Override
  public void setMapStyle(GMNMapViewLayout view, @Nullable String value) {
    view.setMapStyle(value);
  }

  @Override
  public void setMapId(GMNMapViewLayout view, @Nullable String value) {
    view.setMapId(value);
  }

  @Override
  public void setMapToolbarEnabled(GMNMapViewLayout view, boolean value) {
    view.setMapToolbarEnabled(value);
  }

  @Override
  public void setIndoorEnabled(GMNMapViewLayout view, boolean value) {
    view.setIndoorEnabled(value);
  }

  @Override
  public void setTrafficEnabled(GMNMapViewLayout view, boolean value) {
    view.setTrafficEnabled(value);
  }

  @Override
  public void setCompassEnabled(GMNMapViewLayout view, boolean value) {
    view.setCompassEnabled(value);
  }

  @Override
  public void setMyLocationButtonEnabled(GMNMapViewLayout view, boolean value) {
    view.setMyLocationButtonEnabled(value);
  }

  @Override
  public void setMyLocationEnabled(GMNMapViewLayout view, boolean value) {
    view.setMyLocationEnabled(value);
  }

  @Override
  public void setRotateGesturesEnabled(GMNMapViewLayout view, boolean value) {
    view.setRotateGesturesEnabled(value);
  }

  @Override
  public void setScrollGesturesEnabled(GMNMapViewLayout view, boolean value) {
    view.setScrollGesturesEnabled(value);
  }

  @Override
  public void setScrollGesturesEnabledDuringRotateOrZoom(GMNMapViewLayout view, boolean value) {
    view.setScrollGesturesEnabledDuringRotateOrZoom(value);
  }

  @Override
  public void setTiltGesturesEnabled(GMNMapViewLayout view, boolean value) {
    view.setTiltGesturesEnabled(value);
  }

  @Override
  public void setZoomControlsEnabled(GMNMapViewLayout view, boolean value) {
    view.setZoomControlsEnabled(value);
  }

  @Override
  public void setZoomGesturesEnabled(GMNMapViewLayout view, boolean value) {
    view.setZoomGesturesEnabled(value);
  }

  @Override
  public void setBuildingsEnabled(GMNMapViewLayout view, boolean value) {
    view.setBuildingsEnabled(value);
  }

  @Override
  public void setReportIncidentButtonEnabled(GMNMapViewLayout view, boolean value) {
    view.setReportIncidentButtonEnabled(value);
  }

  @Override
  public void setMinZoomLevel(GMNMapViewLayout view, @Nullable Float value) {
    view.setMinZoomLevel(value);
  }

  @Override
  public void setMaxZoomLevel(GMNMapViewLayout view, @Nullable Float value) {
    view.setMaxZoomLevel(value);
  }

  @Override
  public void setInitialCameraPosition(
      GMNMapViewLayout view, @Nullable ReadableMap cameraPositionMap) {
    if (cameraPositionMap == null) {
      view.setInitialCameraPosition(null);
    } else {
      CameraPosition cameraPos =
          GMNObjectTranslationUtil.getCameraPositionFromMap(cameraPositionMap.toHashMap());
      view.setInitialCameraPosition(cameraPos);
    }
  }

  public void registerFragment(Integer nativeID, IGMNMapViewFragment fragment) {
    if (!fragmentMap.containsKey(nativeID)) {
      fragmentMap.put(nativeID, new WeakReference<IGMNMapViewFragment>(fragment));
    }
  }
}
