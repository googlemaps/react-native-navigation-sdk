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

import static com.google.android.react.navsdk.Command.*;

import android.location.Location;
import android.view.Choreographer;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.FragmentActivity;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.CatalystInstance;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.model.Circle;
import com.google.android.gms.maps.model.GroundOverlay;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.Polygon;
import com.google.android.gms.maps.model.Polyline;
import com.google.android.libraries.mapsplatform.turnbyturn.model.NavInfo;
import com.google.android.libraries.mapsplatform.turnbyturn.model.StepInfo;
import com.google.android.libraries.navigation.ArrivalEvent;
import com.facebook.react.uimanager.annotations.ReactPropGroup;
import com.google.android.libraries.navigation.Navigator;

import java.lang.ref.WeakReference;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class NavViewManager extends ViewGroupManager<FrameLayout> implements INavigationViewCallback {

  public static final String REACT_CLASS = "NavViewManager";

  private static NavViewManager instance;
  private int propWidth = 400;
  private int propHeight = 400;

  private final HashMap<Integer, WeakReference<NavViewFragment>> fragmentMap = new HashMap<>();

  ReactApplicationContext reactContext;

  private NavViewManager(ReactApplicationContext reactContext) {
    this.reactContext = reactContext;
  }

  public static synchronized NavViewManager getInstance(ReactApplicationContext reactContext) {
    if (instance == null) {
      instance = new NavViewManager(reactContext);
    }
    return instance;
  }

  @NonNull
  @Override
  public String getName() {
    return REACT_CLASS;
  }

  /** Return a FrameLayout which will later hold the Fragment */
  @Override
  public FrameLayout createViewInstance(ThemedReactContext reactContext) {
    return new FrameLayout(reactContext);
  }

  /** Map the "create" command to an integer */
  @Nullable
  @Override
  public Map<String, Integer> getCommandsMap() {
    Map<String, Integer> map = new HashMap<>();
    map.put(CREATE_FRAGMENT.toString(), CREATE_FRAGMENT.getValue());
    map.put(MOVE_CAMERA.toString(), MOVE_CAMERA.getValue());
    map.put(SET_TRIP_PROGRESS_BAR_ENABLED.toString(), SET_TRIP_PROGRESS_BAR_ENABLED.getValue());
    map.put(SET_NAVIGATION_UI_ENABLED.toString(), SET_NAVIGATION_UI_ENABLED.getValue());
    map.put(SET_FOLLOWING_PERSPECTIVE.toString(), SET_FOLLOWING_PERSPECTIVE.getValue());
    map.put(SET_NIGHT_MODE.toString(), SET_NIGHT_MODE.getValue());
    map.put(DELETE_FRAGMENT.toString(), DELETE_FRAGMENT.getValue());
    map.put(SET_SPEEDOMETER_ENABLED.toString(), SET_SPEEDOMETER_ENABLED.getValue());
    map.put(SET_SPEED_LIMIT_ICON_ENABLED.toString(), SET_SPEED_LIMIT_ICON_ENABLED.getValue());
    map.put(SET_ZOOM_LEVEL.toString(), SET_ZOOM_LEVEL.getValue());
    map.put(SET_INDOOR_ENABLED.toString(), SET_INDOOR_ENABLED.getValue());
    map.put(SET_TRAFFIC_ENABLED.toString(), SET_TRAFFIC_ENABLED.getValue());
    map.put(SET_COMPASS_ENABLED.toString(), SET_COMPASS_ENABLED.getValue());
    map.put(SET_MY_LOCATION_BUTTON_ENABLED.toString(), SET_MY_LOCATION_BUTTON_ENABLED.getValue());
    map.put(SET_MY_LOCATION_ENABLED.toString(), SET_MY_LOCATION_ENABLED.getValue());
    map.put(SET_ROTATE_GESTURES_ENABLED.toString(), SET_ROTATE_GESTURES_ENABLED.getValue());
    map.put(SET_SCROLL_GESTURES_ENABLED.toString(), SET_SCROLL_GESTURES_ENABLED.getValue());
    map.put(
        SET_SCROLL_GESTURES_ENABLED_DURING_ROTATE_OR_ZOOM.toString(),
        SET_SCROLL_GESTURES_ENABLED_DURING_ROTATE_OR_ZOOM.getValue());
    map.put(SET_ZOOM_CONTROLS_ENABLED.toString(), SET_ZOOM_CONTROLS_ENABLED.getValue());
    map.put(SET_TILT_GESTURES_ENABLED.toString(), SET_TILT_GESTURES_ENABLED.getValue());
    map.put(SET_ZOOM_GESTURES_ENABLED.toString(), SET_ZOOM_GESTURES_ENABLED.getValue());
    map.put(SET_BUILDINGS_ENABLED.toString(), SET_BUILDINGS_ENABLED.getValue());
    map.put(SET_MAP_TYPE.toString(), SET_MAP_TYPE.getValue());
    map.put(SET_MAP_TOOLBAR_ENABLED.toString(), SET_MAP_TOOLBAR_ENABLED.getValue());
    map.put(CLEAR_MAP_VIEW.toString(), CLEAR_MAP_VIEW.getValue());
    map.put(RESET_MIN_MAX_ZOOM_LEVEL.toString(), RESET_MIN_MAX_ZOOM_LEVEL.getValue());
    map.put(SET_MAP_STYLE.toString(), SET_MAP_STYLE.getValue());
    map.put(ANIMATE_CAMERA.toString(), ANIMATE_CAMERA.getValue());
    map.put(
        SET_TRAFFIC_INCIDENT_CARDS_ENABLED.toString(),
        SET_TRAFFIC_INCIDENT_CARDS_ENABLED.getValue());
    map.put(
        SET_RECENTER_BUTTON_ENABLED.toString(),
        SET_RECENTER_BUTTON_ENABLED.getValue());
    map.put(SHOW_ROUTE_OVERVIEW.toString(), SHOW_ROUTE_OVERVIEW.getValue());
    map.put(REMOVE_MARKER.toString(), REMOVE_MARKER.getValue());
    map.put(REMOVE_POLYLINE.toString(), REMOVE_POLYLINE.getValue());
    map.put(REMOVE_POLYGON.toString(), REMOVE_POLYGON.getValue());
    map.put(REMOVE_CIRCLE.toString(), REMOVE_CIRCLE.getValue());
    map.put(REMOVE_GROUND_OVERLAY.toString(), REMOVE_GROUND_OVERLAY.getValue());
    map.put(SET_HEADER_ENABLED.toString(), SET_HEADER_ENABLED.getValue());
    map.put(SET_FOOTER_ENABLED.toString(), SET_FOOTER_ENABLED.getValue());
    return map;
  }

  @ReactPropGroup(
      names = {"width", "height"},
      customType = "Style")
  public void setStyle(FrameLayout view, int index, Integer value) {
    if (index == 0) {
      propWidth = value;
    }

    if (index == 1) {
      propHeight = value;
    }
  }

  public NavViewFragment getFragmentForRoot(ViewGroup root) {
    int viewId = root.getId();
    return getFragmentForViewId(viewId);
  }

  public NavViewFragment getFragmentForViewId(int viewId) {
    WeakReference<NavViewFragment> weakReference = fragmentMap.get(viewId);
    if (weakReference == null || weakReference.get() == null) {
      throw new IllegalStateException("Fragment not found for the provided viewId.");
    }
    return weakReference.get();
  }

  public NavViewFragment getAnyFragment() {
    if (fragmentMap.isEmpty()) {
        return null;
    }
    // Return the first fragment found in the map's values collection.
    return fragmentMap.values().iterator().next().get();
  }

  public void applyStylingOptions() {
    for (WeakReference<NavViewFragment> weakReference : fragmentMap.values()) {
      if (weakReference.get() != null) {
        weakReference.get().applyStylingOptions();
      }
    }
  }

  @Override
  public void receiveCommand(
      @NonNull FrameLayout root, String commandId, @Nullable ReadableArray args) {
    super.receiveCommand(root, commandId, args);
    int commandIdInt = Integer.parseInt(commandId);

    switch (Command.find(commandIdInt)) {
      case CREATE_FRAGMENT:
        propHeight = args.getInt(0);
        propWidth = args.getInt(1);
        Map<String, Object> stylingOptions = args.getMap(2).toHashMap();
        createFragment(root, stylingOptions);
        break;
      case DELETE_FRAGMENT:
        try {
          int viewId = root.getId();
          FragmentActivity activity = (FragmentActivity) reactContext.getCurrentActivity();
          activity
            .getSupportFragmentManager()
            .beginTransaction()
            .remove(Objects.requireNonNull(fragmentMap.remove(viewId)).get())
            .commitNowAllowingStateLoss();
        } catch (Exception ignored) {}
        break;
      case MOVE_CAMERA:
        getFragmentForRoot(root).moveCamera(args.getMap(0).toHashMap());
        break;
      case SET_TRIP_PROGRESS_BAR_ENABLED:
        getFragmentForRoot(root).setTripProgressBarUiEnabled(args.getBoolean(0));
        break;
      case SET_NAVIGATION_UI_ENABLED:
        getFragmentForRoot(root).setNavigationUiEnabled(args.getBoolean(0));
        break;
      case SET_FOLLOWING_PERSPECTIVE:
        getFragmentForRoot(root).setFollowingPerspective(args.getInt(0));
        break;
      case SET_NIGHT_MODE:
        getFragmentForRoot(root).setNightModeOption(args.getInt(0));
        break;
      case SET_SPEEDOMETER_ENABLED:
        getFragmentForRoot(root).setSpeedometerEnabled(args.getBoolean(0));
        break;
      case SET_SPEED_LIMIT_ICON_ENABLED:
        getFragmentForRoot(root).setSpeedLimitIconEnabled(args.getBoolean(0));
        break;
      case SET_ZOOM_LEVEL:
        int level = args.getInt(0);
        getFragmentForRoot(root).setZoomLevel(level);
        break;
      case SET_INDOOR_ENABLED:
        getFragmentForRoot(root).setIndoorEnabled(args.getBoolean(0));
        break;
      case SET_TRAFFIC_ENABLED:
        getFragmentForRoot(root).setTrafficEnabled(args.getBoolean(0));
        break;
      case SET_COMPASS_ENABLED:
        getFragmentForRoot(root).setCompassEnabled(args.getBoolean(0));
        break;
      case SET_MY_LOCATION_BUTTON_ENABLED:
        getFragmentForRoot(root).setMyLocationButtonEnabled(args.getBoolean(0));
        break;
      case SET_MY_LOCATION_ENABLED:
        getFragmentForRoot(root).setMyLocationEnabled(args.getBoolean(0));
        break;
      case SET_ROTATE_GESTURES_ENABLED:
        getFragmentForRoot(root).setRotateGesturesEnabled(args.getBoolean(0));
        break;
      case SET_SCROLL_GESTURES_ENABLED:
        getFragmentForRoot(root).setScrollGesturesEnabled(args.getBoolean(0));
        break;
      case SET_SCROLL_GESTURES_ENABLED_DURING_ROTATE_OR_ZOOM:
        getFragmentForRoot(root).setScrollGesturesEnabledDuringRotateOrZoom(args.getBoolean(0));
        break;
      case SET_TILT_GESTURES_ENABLED:
        getFragmentForRoot(root).setTiltGesturesEnabled(args.getBoolean(0));
        break;
      case SET_ZOOM_CONTROLS_ENABLED:
        getFragmentForRoot(root).setZoomControlsEnabled(args.getBoolean(0));
        break;
      case SET_ZOOM_GESTURES_ENABLED:
        getFragmentForRoot(root).setZoomGesturesEnabled(args.getBoolean(0));
        break;
      case SET_BUILDINGS_ENABLED:
        getFragmentForRoot(root).setBuildingsEnabled(args.getBoolean(0));
        break;
      case SET_MAP_TYPE:
        getFragmentForRoot(root).setMapType(args.getInt(0));
        break;
      case SET_MAP_TOOLBAR_ENABLED:
        getFragmentForRoot(root).setMapToolbarEnabled(args.getBoolean(0));
        break;
      case CLEAR_MAP_VIEW:
        getFragmentForRoot(root).clearMapView();
        break;
      case RESET_MIN_MAX_ZOOM_LEVEL:
        getFragmentForRoot(root).resetMinMaxZoomLevel();
        break;
      case SET_MAP_STYLE:
        getFragmentForRoot(root).setMapStyle(args.getString(0));
        break;
      case ANIMATE_CAMERA:
        getFragmentForRoot(root).animateCamera(args.getMap(0).toHashMap());
        break;
      case SET_TRAFFIC_INCIDENT_CARDS_ENABLED:
        getFragmentForRoot(root).setTrafficIncidentCards(args.getBoolean(0));
        break;
      case SET_FOOTER_ENABLED:
        getFragmentForRoot(root).setFooterEnabled(args.getBoolean(0));
        break;
      case SET_HEADER_ENABLED:
        getFragmentForRoot(root).setHeaderEnabled(args.getBoolean(0));
        break;
      case SET_RECENTER_BUTTON_ENABLED:
        getFragmentForRoot(root).setRecenterButtonEnabled(args.getBoolean(0));
        break;
      case SHOW_ROUTE_OVERVIEW:
        getFragmentForRoot(root).showRouteOverview();
        break;
      case REMOVE_MARKER:
        getFragmentForRoot(root).removeMarker(args.getString(0));
        break;
      case REMOVE_POLYLINE:
        getFragmentForRoot(root).removePolyline(args.getString(0));
        break;
      case REMOVE_POLYGON:
        getFragmentForRoot(root).removePolygon(args.getString(0));
        break;
      case REMOVE_CIRCLE:
        getFragmentForRoot(root).removeCircle(args.getString(0));
        break;
      case REMOVE_GROUND_OVERLAY:
        getFragmentForRoot(root).removeGroundOverlay(args.getString(0));
        break;
    }
  }

  /** Replace your React Native view with a custom fragment */
  public void createFragment(
      FrameLayout root, Map stylingOptions) {
    setupLayout(root);

    FragmentActivity activity = (FragmentActivity) reactContext.getCurrentActivity();
    int viewId = root.getId();
    NavViewFragment fragment = new NavViewFragment();
    fragmentMap.put(viewId, new WeakReference<>(fragment));

    fragment.setNavigationViewCallback(this);

    if (stylingOptions != null) {
      fragment.setStylingOptions(stylingOptions);
    }

    activity
      .getSupportFragmentManager()
      .beginTransaction()
      .replace(viewId, fragment, String.valueOf(viewId))
      .commit();
  }

  public void setupLayout(View view) {
    Choreographer.getInstance()
      .postFrameCallback(
        new Choreographer.FrameCallback() {
          @Override
          public void doFrame(long frameTimeNanos) {
            manuallyLayoutChildren(view);
            view.getViewTreeObserver().dispatchOnGlobalLayout();
            Choreographer.getInstance().postFrameCallback(this);
          }
        });
  }

  /** Layout all children properly */
  public void manuallyLayoutChildren(View view) {
    // propWidth and propHeight coming from react-native props
    int width = propWidth;
    int height = propHeight;

    view.measure(
        View.MeasureSpec.makeMeasureSpec(width, View.MeasureSpec.EXACTLY),
        View.MeasureSpec.makeMeasureSpec(height, View.MeasureSpec.EXACTLY));

    view.layout(0, 0, width, height);
  }

  private void sendCommandToReactNative(String functionName, Object args) {
    if (hasValidFragment()) {
      CatalystInstance catalystInstance = reactContext.getCatalystInstance();
      WritableNativeArray params = new WritableNativeArray();
      if (args != null) {
        params.pushString("" + args);
      }
      catalystInstance.callFunction(Constants.NAV_VIEW_JAVASCRIPT_FLAG, functionName, params);
    }
  }

  public GoogleMap getGoogleMap(int viewId) {
    try {
      return getFragmentForViewId(viewId).getGoogleMap();
    } catch (Exception e) {
      return null;
    }
  }

  @Override
  public void onMapReady() {
    sendCommandToReactNative("onMapReady", null);
  }

  @Override
  public void onMapClick(LatLng latLng) {
    CatalystInstance catalystInstance = reactContext.getCatalystInstance();

    WritableNativeArray params = new WritableNativeArray();
    params.pushMap(ObjectTranslationUtil.getMapFromLatLng(latLng));

    catalystInstance.callFunction(Constants.NAV_VIEW_JAVASCRIPT_FLAG, "onMapClick", params);
  }

  @Override
  public void onRecenterButtonClick() {
    sendCommandToReactNative("onRecenterButtonClick", null);
  }

  @Override
  public void onMarkerClick(Marker marker) {
    CatalystInstance catalystInstance = reactContext.getCatalystInstance();

    WritableNativeArray params = new WritableNativeArray();
    params.pushMap(ObjectTranslationUtil.getMapFromMarker(marker));

    catalystInstance.callFunction(Constants.NAV_VIEW_JAVASCRIPT_FLAG, "onMarkerClick", params);
  }

  @Override
  public void onPolylineClick(Polyline polyline) {
    CatalystInstance catalystInstance = reactContext.getCatalystInstance();

    WritableNativeArray params = new WritableNativeArray();
    params.pushMap(ObjectTranslationUtil.getMapFromPolyline(polyline));

    catalystInstance.callFunction(Constants.NAV_VIEW_JAVASCRIPT_FLAG, "onPolylineClick", params);
  }

  @Override
  public void onPolygonClick(Polygon polygon) {
    CatalystInstance catalystInstance = reactContext.getCatalystInstance();

    WritableNativeArray params = new WritableNativeArray();
    params.pushMap(ObjectTranslationUtil.getMapFromPolygon(polygon));

    catalystInstance.callFunction(Constants.NAV_VIEW_JAVASCRIPT_FLAG, "onPolygonClick", params);
  }

  @Override
  public void onCircleClick(Circle circle) {
    CatalystInstance catalystInstance = reactContext.getCatalystInstance();

    WritableNativeArray params = new WritableNativeArray();
    params.pushMap(ObjectTranslationUtil.getMapFromCircle(circle));

    catalystInstance.callFunction(Constants.NAV_VIEW_JAVASCRIPT_FLAG, "onCircleClick", params);
  }

  @Override
  public void onGroundOverlayClick(GroundOverlay overlay) {
    CatalystInstance catalystInstance = reactContext.getCatalystInstance();

    WritableNativeArray params = new WritableNativeArray();
    params.pushMap(ObjectTranslationUtil.getMapFromGroundOverlay(overlay));

    catalystInstance.callFunction(Constants.NAV_VIEW_JAVASCRIPT_FLAG, "onGroundOverlayClick", params);
  }

  @Override
  public void onMarkerInfoWindowTapped(Marker marker) {
    CatalystInstance catalystInstance = reactContext.getCatalystInstance();

    WritableNativeArray params = new WritableNativeArray();
    params.pushMap(ObjectTranslationUtil.getMapFromMarker(marker));

    catalystInstance.callFunction(Constants.NAV_VIEW_JAVASCRIPT_FLAG, "onMarkerInfoWindowTapped", params);
  }

  /**
   * Helper method to check if the fragment is added and the reactContext is not null.
   * requireActivity throws an exception if the fragment is not added or the activity is null,
   * in this case exception is caught and false is returned.
   */
  private boolean hasValidFragment() {
    try {
      return getAnyFragment().isAdded() && getAnyFragment().requireActivity() != null && reactContext != null;
    } catch (Exception e) {
      return false;
    }
  }
}
