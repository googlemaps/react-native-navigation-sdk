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

import android.view.Choreographer;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentActivity;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.google.android.gms.maps.GoogleMap;
import java.lang.ref.WeakReference;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class NavViewManager extends SimpleViewManager<FrameLayout> {

  public static final String REACT_CLASS = "NavViewManager";

  private static NavViewManager instance;

  private final HashMap<Integer, WeakReference<IViewFragment>> fragmentMap = new HashMap<>();

  private ReactApplicationContext reactContext;

  public static synchronized NavViewManager getInstance(ReactApplicationContext reactContext) {
    if (instance == null) {
      instance = new NavViewManager();
    }
    instance.setReactContext(reactContext);
    return instance;
  }

  @NonNull
  @Override
  public String getName() {
    return REACT_CLASS;
  }

  public void setReactContext(ReactApplicationContext reactContext) {
    this.reactContext = reactContext;
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
    map.put(SET_RECENTER_BUTTON_ENABLED.toString(), SET_RECENTER_BUTTON_ENABLED.getValue());
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

  public IViewFragment getFragmentForRoot(ViewGroup root) {
    int viewId = root.getId();
    return getFragmentForViewId(viewId);
  }

  public IViewFragment getFragmentForViewId(int viewId) {
    WeakReference<IViewFragment> weakReference = fragmentMap.get(viewId);
    if (weakReference == null || weakReference.get() == null) {
      throw new IllegalStateException("Fragment not found for the provided viewId.");
    }
    return weakReference.get();
  }

  public IViewFragment getAnyFragment() {
    if (fragmentMap.isEmpty()) {
      return null;
    }
    // Return the first fragment found in the map's values collection.
    return fragmentMap.values().iterator().next().get();
  }

  public void applyStylingOptions() {
    for (WeakReference<IViewFragment> weakReference : fragmentMap.values()) {
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
        Map<String, Object> stylingOptions = args.getMap(0).toHashMap();
        Boolean isNavigationEnabled = args.getBoolean(1);
        createFragment(root, stylingOptions, isNavigationEnabled);
        break;
      case DELETE_FRAGMENT:
        try {
          int viewId = root.getId();
          FragmentActivity activity = (FragmentActivity) reactContext.getCurrentActivity();
          IViewFragment fragment = Objects.requireNonNull(fragmentMap.remove(viewId)).get();
          activity
            .getSupportFragmentManager()
            .beginTransaction()
            .remove((Fragment) fragment)
            .commitNowAllowingStateLoss();
        } catch (Exception ignored) {
        }
        break;
      case MOVE_CAMERA:
        getFragmentForRoot(root).moveCamera(args.getMap(0).toHashMap());
        break;
      case SET_TRIP_PROGRESS_BAR_ENABLED:
        getFragmentForRoot(root).setTripProgressBarEnabled(args.getBoolean(0));
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
        getFragmentForRoot(root).setTrafficIncidentCardsEnabled(args.getBoolean(0));
        break;
      case SET_FOOTER_ENABLED:
        getFragmentForRoot(root).setEtaCardEnabled(args.getBoolean(0));
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

  @Override
  public Map<String, Object> getExportedCustomDirectEventTypeConstants() {
    Map<String, Object> baseEventTypeConstants = super.getExportedCustomDirectEventTypeConstants();
    Map<String, Object> eventTypeConstants =
        baseEventTypeConstants != null ? baseEventTypeConstants : new HashMap<>();

    ((Map) eventTypeConstants)
        .putAll(
            MapBuilder.builder()
                .put(
                    "onRecenterButtonClick",
                    MapBuilder.of("registrationName", "onRecenterButtonClick"))
                .put("onMapReady", MapBuilder.of("registrationName", "onMapReady"))
                .put("onMapClick", MapBuilder.of("registrationName", "onMapClick"))
                .put("onMarkerClick", MapBuilder.of("registrationName", "onMarkerClick"))
                .put("onPolylineClick", MapBuilder.of("registrationName", "onPolylineClick"))
                .put("onPolygonClick", MapBuilder.of("registrationName", "onPolygonClick"))
                .put("onCircleClick", MapBuilder.of("registrationName", "onCircleClick"))
                .put(
                    "onGroundOverlayClick",
                    MapBuilder.of("registrationName", "onGroundOverlayClick"))
                .put(
                    "onMarkerInfoWindowTapped",
                    MapBuilder.of("registrationName", "onMarkerInfoWindowTapped"))
                .build());
    return (Map) eventTypeConstants;
  }

  /**
   * Replace your React Native view with a custom fragment
   */
  public void createFragment(
    FrameLayout root, Map stylingOptions, Boolean isNavigationEnabled) {
    setupLayout(root);

    FragmentActivity activity = (FragmentActivity) reactContext.getCurrentActivity();
    if (activity != null) {
      int viewId = root.getId();
      Fragment fragment;
      if (isNavigationEnabled) {
        NavViewFragment navFragment = new NavViewFragment(reactContext, root.getId());
        fragmentMap.put(viewId, new WeakReference<IViewFragment>(navFragment));
        fragment = navFragment;

        if (stylingOptions != null) {
          navFragment.setStylingOptions(stylingOptions);
        }
      } else {
        MapViewFragment mapFragment = new MapViewFragment(reactContext, root.getId());
        fragmentMap.put(viewId, new WeakReference<IViewFragment>(mapFragment));
        fragment = mapFragment;

        if (stylingOptions != null) {
          mapFragment.setStylingOptions(stylingOptions);
        }
      }
      activity.getSupportFragmentManager()
        .beginTransaction()
        .replace(viewId, fragment, String.valueOf(viewId))
        .commit();
    }
  }

  /**
   * Set up the layout for each frame. This official RN way to do this, but a bit hacky, and should
   * be changed when better solution is found.
   */
  public void setupLayout(FrameLayout view) {
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
  public void manuallyLayoutChildren(FrameLayout view) {
    IViewFragment fragment = getFragmentForRoot(view);
    if (fragment.isAdded()) {
      View childView = fragment.getView();
      if (childView != null) {
        childView.measure(
            View.MeasureSpec.makeMeasureSpec(view.getMeasuredWidth(), View.MeasureSpec.EXACTLY),
            View.MeasureSpec.makeMeasureSpec(view.getMeasuredHeight(), View.MeasureSpec.EXACTLY));
        childView.layout(0, 0, childView.getMeasuredWidth(), childView.getMeasuredHeight());
      }
    }
  }

  public GoogleMap getGoogleMap(int viewId) {
    try {
      return getFragmentForViewId(viewId).getGoogleMap();
    } catch (Exception e) {
      return null;
    }
  }
}
