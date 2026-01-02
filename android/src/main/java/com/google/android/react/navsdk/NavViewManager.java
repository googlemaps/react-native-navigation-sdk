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
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.GoogleMapOptions;
import com.google.android.libraries.navigation.StylingOptions;
import java.lang.ref.WeakReference;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Objects;

// NavViewManager is responsible for managing both the regular map fragment as well as the
// navigation map view fragment.
//
public class NavViewManager extends SimpleViewManager<FrameLayout> {

  public static final String REACT_CLASS = "NavViewManager";
  private static NavViewManager instance;

  private final HashMap<Integer, WeakReference<IMapViewFragment>> fragmentMap = new HashMap<>();
  private final HashMap<Integer, Choreographer.FrameCallback> frameCallbackMap = new HashMap<>();

  // Cache the latest options per view so deferred fragment creation uses fresh values.
  private final HashMap<Integer, ReadableMap> mapOptionsCache = new HashMap<>();

  // Track views with pending fragment creation attempts.
  private final HashSet<Integer> pendingFragments = new HashSet<>();

  private ReactApplicationContext reactContext;

  public static synchronized NavViewManager getInstance(ReactApplicationContext reactContext) {
    if (instance == null) {
      instance = new NavViewManager();
    }
    instance.setReactContext(reactContext);
    return instance;
  }

  private boolean isFragmentCreated(int viewId) {
    WeakReference<IMapViewFragment> weakReference = fragmentMap.get(viewId);
    if (weakReference == null) {
      return false;
    }
    IMapViewFragment fragment = weakReference.get();
    if (fragment == null) {
      // Clean up the map entry if the fragment is not available anymore.
      fragmentMap.remove(viewId);
      return false;
    }
    return true;
  }

  /** Builds GoogleMapOptions with all configured map settings. */
  @NonNull
  private GoogleMapOptions buildGoogleMapOptions(ReadableMap mapOptionsMap) {
    GoogleMapOptions options = new GoogleMapOptions();
    if (mapOptionsMap == null) {
      return options;
    }

    if (mapOptionsMap.hasKey("mapId") && !mapOptionsMap.isNull("mapId")) {
      String mapIdFromOptions = mapOptionsMap.getString("mapId");
      if (mapIdFromOptions != null && !mapIdFromOptions.isEmpty()) {
        options.mapId(mapIdFromOptions);
      }
    }

    if (mapOptionsMap.hasKey("mapType") && !mapOptionsMap.isNull("mapType")) {
      options.mapType(mapOptionsMap.getInt("mapType"));
    }

    if (mapOptionsMap.hasKey("mapColorScheme")) {
      int jsValue =
          mapOptionsMap.isNull("mapColorScheme") ? 0 : mapOptionsMap.getInt("mapColorScheme");
      options.mapColorScheme(EnumTranslationUtil.getMapColorSchemeFromJsValue(jsValue));
    }

    return options;
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
  @NonNull
  @Override
  public FrameLayout createViewInstance(@NonNull ThemedReactContext reactContext) {
    FrameLayout frameLayout = new FrameLayout(reactContext);
    return frameLayout;
  }

  /**
   * Ensures the fragment view is properly measured and laid out within its parent FrameLayout. This
   * is necessary because React Native's layout system doesn't automatically propagate layout to
   * native fragments.
   */
  private void layoutFragmentInView(FrameLayout frameLayout, @Nullable IMapViewFragment fragment) {
    if (fragment == null || !fragment.isAdded()) {
      return;
    }

    int width = frameLayout.getWidth();
    int height = frameLayout.getHeight();
    if (width == 0 || height == 0) {
      return;
    }

    View fragmentView = fragment.getView();
    if (fragmentView == null) {
      return;
    }

    fragmentView.measure(
        View.MeasureSpec.makeMeasureSpec(width, View.MeasureSpec.EXACTLY),
        View.MeasureSpec.makeMeasureSpec(height, View.MeasureSpec.EXACTLY));
    fragmentView.layout(0, 0, width, height);
  }

  /**
   * Starts a per-frame layout loop similar to the older implementation to ensure the fragment view
   * stays in sync with its container size.
   */
  private void startLayoutLoop(FrameLayout view) {
    int viewId = view.getId();

    // Remove existing callback if present
    Choreographer.FrameCallback existing = frameCallbackMap.get(viewId);
    if (existing != null) {
      Choreographer.getInstance().removeFrameCallback(existing);
    }

    Choreographer.FrameCallback frameCallback =
        new Choreographer.FrameCallback() {
          @Override
          public void doFrame(long frameTimeNanos) {
            IMapViewFragment fragment = getFragmentForViewId(viewId);
            if (fragment != null) {
              layoutFragmentInView(view, fragment);
              Choreographer.getInstance().postFrameCallback(this);
            } else {
              frameCallbackMap.remove(viewId);
            }
          }
        };

    frameCallbackMap.put(viewId, frameCallback);
    Choreographer.getInstance().postFrameCallback(frameCallback);
  }

  /** Clean up fragment when React Native view is destroyed */
  @Override
  public void onDropViewInstance(@NonNull FrameLayout view) {
    super.onDropViewInstance(view);

    int viewId = view.getId();

    pendingFragments.remove(viewId);
    mapOptionsCache.remove(viewId);

    Choreographer.FrameCallback frameCallback = frameCallbackMap.remove(viewId);
    if (frameCallback != null) {
      Choreographer.getInstance().removeFrameCallback(frameCallback);
    }

    FragmentActivity activity = (FragmentActivity) reactContext.getCurrentActivity();
    if (activity == null) return;

    WeakReference<IMapViewFragment> weakReference = fragmentMap.remove(viewId);
    if (weakReference != null) {
      IMapViewFragment fragment = weakReference.get();
      if (fragment != null && fragment.isAdded()) {
        activity
            .getSupportFragmentManager()
            .beginTransaction()
            .remove((Fragment) fragment)
            .commitNowAllowingStateLoss();
      }
    }
  }

  @ReactProp(name = "mapOptions")
  public void setMapOptions(FrameLayout view, @NonNull ReadableMap mapOptions) {
    int viewId = view.getId();
    mapOptionsCache.put(viewId, mapOptions);

    if (isFragmentCreated(viewId)) {
      updateMapOptionValues(viewId, mapOptions);
      return;
    }

    if (!pendingFragments.contains(viewId)) {
      pendingFragments.add(viewId);
      scheduleFragmentTransaction(view);
    }
  }

  /** Map the "create" command to an integer */
  @Nullable
  @Override
  public Map<String, Integer> getCommandsMap() {
    Map<String, Integer> map = new HashMap<>();
    map.put(MOVE_CAMERA.toString(), MOVE_CAMERA.getValue());
    map.put(SET_TRIP_PROGRESS_BAR_ENABLED.toString(), SET_TRIP_PROGRESS_BAR_ENABLED.getValue());
    map.put(SET_NAVIGATION_UI_ENABLED.toString(), SET_NAVIGATION_UI_ENABLED.getValue());
    map.put(SET_FOLLOWING_PERSPECTIVE.toString(), SET_FOLLOWING_PERSPECTIVE.getValue());
    map.put(SET_NIGHT_MODE.toString(), SET_NIGHT_MODE.getValue());
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
    map.put(SET_PADDING.toString(), SET_PADDING.getValue());
    map.put(
        SET_REPORT_INCIDENT_BUTTON_ENABLED.toString(),
        SET_REPORT_INCIDENT_BUTTON_ENABLED.getValue());
    return map;
  }

  @Nullable
  public INavViewFragment getNavFragmentForRoot(ViewGroup root) {
    IMapViewFragment fragment = getFragmentForRoot(root);

    if (fragment == null) {
      return null;
    }

    // Check if the fragment is an INavigationViewFragment
    if (fragment instanceof INavViewFragment) {
      return (INavViewFragment) fragment;
    } else {
      throw new IllegalStateException("The fragment is not a nav view fragment");
    }
  }

  @Nullable
  public IMapViewFragment getFragmentForRoot(ViewGroup root) {
    int viewId = root.getId();
    return getFragmentForViewId(viewId);
  }

  @Nullable
  public IMapViewFragment getFragmentForViewId(int viewId) {
    WeakReference<IMapViewFragment> weakReference = fragmentMap.get(viewId);
    if (weakReference == null) {
      return null; // No entry for this viewId
    }

    IMapViewFragment fragment = weakReference.get();
    if (fragment == null) {
      // Fragment was garbage collected, clean up the map entry
      fragmentMap.remove(viewId);
      return null;
    }

    return fragment;
  }

  public void onNavigationReady() {
    for (WeakReference<IMapViewFragment> weakReference : fragmentMap.values()) {
      IMapViewFragment fragment = weakReference.get();
      if (fragment instanceof INavViewFragment) {
        INavViewFragment navFragment = (INavViewFragment) fragment;
        navFragment.setNavigationUiEnabled(true);
        navFragment.applyStylingOptions();
      }
    }
  }

  @Override
  public void receiveCommand(
      @NonNull FrameLayout root, String commandId, @Nullable ReadableArray args) {
    super.receiveCommand(root, commandId, args);
    int commandIdInt = Integer.parseInt(commandId);
    Command command = Command.find(commandIdInt);
    assert command != null;
    IMapViewFragment fragment;
    INavViewFragment navFragment;
    switch (command) {
      case MOVE_CAMERA:
        fragment = getFragmentForRoot(root);
        if (fragment != null) {
          assert args != null;
          fragment
              .getMapController()
              .moveCamera(Objects.requireNonNull(args.getMap(0)).toHashMap());
        }
        break;
      case SET_TRIP_PROGRESS_BAR_ENABLED:
        navFragment = getNavFragmentForRoot(root);
        if (navFragment != null) {
          assert args != null;
          navFragment.setTripProgressBarEnabled(args.getBoolean(0));
        }
        break;
      case SET_NAVIGATION_UI_ENABLED:
        navFragment = getNavFragmentForRoot(root);
        if (navFragment != null) {
          assert args != null;
          navFragment.setNavigationUiEnabled(args.getBoolean(0));
        }
        break;
      case SET_FOLLOWING_PERSPECTIVE:
        navFragment = getNavFragmentForRoot(root);
        if (navFragment != null) {
          assert args != null;
          navFragment.getMapController().setFollowingPerspective(args.getInt(0));
        }
        break;
      case SET_NIGHT_MODE:
        navFragment = getNavFragmentForRoot(root);
        if (navFragment != null) {
          assert args != null;
          int nightModeOverride = EnumTranslationUtil.getForceNightModeFromJsValue(args.getInt(0));
          navFragment.setNightModeOption(nightModeOverride);
        }
        break;
      case SET_SPEEDOMETER_ENABLED:
        navFragment = getNavFragmentForRoot(root);
        if (navFragment != null) {
          assert args != null;
          navFragment.setSpeedometerEnabled(args.getBoolean(0));
        }
        break;
      case SET_SPEED_LIMIT_ICON_ENABLED:
        navFragment = getNavFragmentForRoot(root);
        if (navFragment != null) {
          assert args != null;
          navFragment.setSpeedLimitIconEnabled(args.getBoolean(0));
        }
        break;
      case SET_ZOOM_LEVEL:
        fragment = getFragmentForRoot(root);
        if (fragment != null) {
          assert args != null;
          int level = args.getInt(0);
          fragment.getMapController().setZoomLevel(level);
        }
        break;
      case SET_INDOOR_ENABLED:
        fragment = getFragmentForRoot(root);
        if (fragment != null) {
          assert args != null;
          fragment.getMapController().setIndoorEnabled(args.getBoolean(0));
        }
        break;
      case SET_TRAFFIC_ENABLED:
        fragment = getFragmentForRoot(root);
        if (fragment != null) {
          assert args != null;
          fragment.getMapController().setTrafficEnabled(args.getBoolean(0));
        }
        break;
      case SET_COMPASS_ENABLED:
        fragment = getFragmentForRoot(root);
        if (fragment != null) {
          assert args != null;
          fragment.getMapController().setCompassEnabled(args.getBoolean(0));
        }
        break;
      case SET_MY_LOCATION_BUTTON_ENABLED:
        fragment = getFragmentForRoot(root);
        if (fragment != null) {
          assert args != null;
          fragment.getMapController().setCompassEnabled(args.getBoolean(0));
        }
        break;
      case SET_MY_LOCATION_ENABLED:
        fragment = getFragmentForRoot(root);
        if (fragment != null) {
          assert args != null;
          fragment.getMapController().setMyLocationEnabled(args.getBoolean(0));
        }
        break;
      case SET_ROTATE_GESTURES_ENABLED:
        fragment = getFragmentForRoot(root);
        if (fragment != null) {
          assert args != null;
          fragment.getMapController().setRotateGesturesEnabled(args.getBoolean(0));
        }
        break;
      case SET_SCROLL_GESTURES_ENABLED:
        fragment = getFragmentForRoot(root);
        if (fragment != null) {
          assert args != null;
          fragment.getMapController().setScrollGesturesEnabled(args.getBoolean(0));
        }
        break;
      case SET_SCROLL_GESTURES_ENABLED_DURING_ROTATE_OR_ZOOM:
        fragment = getFragmentForRoot(root);
        if (fragment != null) {
          assert args != null;
          fragment
              .getMapController()
              .setScrollGesturesEnabledDuringRotateOrZoom(args.getBoolean(0));
        }
        break;
      case SET_TILT_GESTURES_ENABLED:
        fragment = getFragmentForRoot(root);
        if (fragment != null) {
          assert args != null;
          fragment.getMapController().setTiltGesturesEnabled(args.getBoolean(0));
        }
        break;
      case SET_ZOOM_CONTROLS_ENABLED:
        fragment = getFragmentForRoot(root);
        if (fragment != null) {
          assert args != null;
          fragment.getMapController().setZoomControlsEnabled(args.getBoolean(0));
        }
        break;
      case SET_ZOOM_GESTURES_ENABLED:
        fragment = getFragmentForRoot(root);
        if (fragment != null) {
          assert args != null;
          fragment.getMapController().setZoomGesturesEnabled(args.getBoolean(0));
        }
        break;
      case SET_BUILDINGS_ENABLED:
        fragment = getFragmentForRoot(root);
        if (fragment != null) {
          assert args != null;
          fragment.getMapController().setBuildingsEnabled(args.getBoolean(0));
        }
        break;
      case SET_MAP_TYPE:
        fragment = getFragmentForRoot(root);
        if (fragment != null) {
          assert args != null;
          fragment.getMapController().setMapType(args.getInt(0));
        }
        break;
      case SET_MAP_TOOLBAR_ENABLED:
        fragment = getFragmentForRoot(root);
        if (fragment != null) {
          assert args != null;
          fragment.getMapController().setMapToolbarEnabled(args.getBoolean(0));
        }
        break;
      case CLEAR_MAP_VIEW:
        fragment = getFragmentForRoot(root);
        if (fragment != null) {
          fragment.getMapController().clearMapView();
        }
        break;
      case RESET_MIN_MAX_ZOOM_LEVEL:
        fragment = getFragmentForRoot(root);
        if (fragment != null) {
          fragment.getMapController().resetMinMaxZoomLevel();
        }
        break;
      case SET_MAP_STYLE:
        fragment = getFragmentForRoot(root);
        if (fragment != null) {
          assert args != null;
          fragment.setMapStyle(args.getString(0));
        }
        break;
      case ANIMATE_CAMERA:
        fragment = getFragmentForRoot(root);
        if (fragment != null) {
          assert args != null;
          fragment
              .getMapController()
              .animateCamera(Objects.requireNonNull(args.getMap(0)).toHashMap());
        }
        break;
      case SET_TRAFFIC_INCIDENT_CARDS_ENABLED:
        navFragment = getNavFragmentForRoot(root);
        if (navFragment != null) {
          assert args != null;
          navFragment.setTrafficIncidentCardsEnabled(args.getBoolean(0));
        }
        break;
      case SET_FOOTER_ENABLED:
        navFragment = getNavFragmentForRoot(root);
        if (navFragment != null) {
          assert args != null;
          navFragment.setEtaCardEnabled(args.getBoolean(0));
        }
        break;
      case SET_HEADER_ENABLED:
        navFragment = getNavFragmentForRoot(root);
        if (navFragment != null) {
          assert args != null;
          navFragment.setHeaderEnabled(args.getBoolean(0));
        }
        break;
      case SET_RECENTER_BUTTON_ENABLED:
        navFragment = getNavFragmentForRoot(root);
        if (navFragment != null) {
          assert args != null;
          navFragment.setRecenterButtonEnabled(args.getBoolean(0));
        }
        break;
      case SHOW_ROUTE_OVERVIEW:
        navFragment = getNavFragmentForRoot(root);
        if (navFragment != null) {
          navFragment.showRouteOverview();
        }
        break;
      case REMOVE_MARKER:
        fragment = getFragmentForRoot(root);
        if (fragment != null) {
          assert args != null;
          fragment.getMapController().removeMarker(args.getString(0));
        }
        break;
      case REMOVE_POLYLINE:
        fragment = getFragmentForRoot(root);
        if (fragment != null) {
          assert args != null;
          fragment.getMapController().removePolyline(args.getString(0));
        }
        break;
      case REMOVE_POLYGON:
        fragment = getFragmentForRoot(root);
        if (fragment != null) {
          assert args != null;
          fragment.getMapController().removePolygon(args.getString(0));
        }
        break;
      case REMOVE_CIRCLE:
        fragment = getFragmentForRoot(root);
        if (fragment != null) {
          assert args != null;
          fragment.getMapController().removeCircle(args.getString(0));
        }
        break;
      case REMOVE_GROUND_OVERLAY:
        fragment = getFragmentForRoot(root);
        if (fragment != null) {
          assert args != null;
          fragment.getMapController().removeGroundOverlay(args.getString(0));
        }
        break;
      case SET_PADDING:
        fragment = getFragmentForRoot(root);
        if (fragment != null) {
          assert args != null;
          fragment
              .getMapController()
              .setPadding(args.getInt(0), args.getInt(1), args.getInt(2), args.getInt(3));
        }
        break;
      case SET_REPORT_INCIDENT_BUTTON_ENABLED:
        navFragment = getNavFragmentForRoot(root);
        if (navFragment != null) {
          assert args != null;
          navFragment.setReportIncidentButtonEnabled(args.getBoolean(0));
        }
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
                .put(
                    "onPromptVisibilityChanged",
                    MapBuilder.of("registrationName", "onPromptVisibilityChanged"))
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

  private void scheduleFragmentTransaction(@NonNull FrameLayout root) {
    root.post(() -> tryCommitFragmentTransaction(root));
  }

  /** Attempt to create/attach the fragment once the parent view has a real size. */
  private void tryCommitFragmentTransaction(@NonNull FrameLayout root) {
    int viewId = root.getId();

    if (isFragmentCreated(viewId)) {
      return;
    }

    // If pendingFragments does not contain viewId, view was dropped and we should abort retry loop.
    if (!pendingFragments.contains(viewId)) {
      return;
    }

    ReadableMap mapOptions = mapOptionsCache.get(viewId);
    if (mapOptions == null) {
      return;
    }

    // If view is not attached to window, retry later.
    if (!root.isAttachedToWindow()) {
      scheduleFragmentTransaction(root);
      return;
    }

    // Wait for layout to provide a size
    int width = root.getWidth();
    int height = root.getHeight();
    if (width == 0 || height == 0) {
      scheduleFragmentTransaction(root);
      return;
    }

    commitFragmentTransaction(root, mapOptions);
  }

  private void updateMapOptionValues(int viewId, @NonNull ReadableMap mapOptions) {
    IMapViewFragment fragment = getFragmentForViewId(viewId);
    if (fragment == null) {
      return;
    }

    if (mapOptions.hasKey("mapColorScheme")) {
      int jsValue = mapOptions.isNull("mapColorScheme") ? 0 : mapOptions.getInt("mapColorScheme");
      fragment.setMapColorScheme(EnumTranslationUtil.getMapColorSchemeFromJsValue(jsValue));
    }

    if (fragment instanceof INavViewFragment
        && mapOptions.hasKey("navigationStylingOptions")
        && !mapOptions.isNull("navigationStylingOptions")) {
      ReadableMap stylingMap = mapOptions.getMap("navigationStylingOptions");
      if (stylingMap != null) {
        StylingOptions stylingOptions =
            new StylingOptionsBuilder.Builder(stylingMap.toHashMap()).build();
        ((INavViewFragment) fragment).setStylingOptions(stylingOptions);
      }
    }

    if (fragment instanceof INavViewFragment && mapOptions.hasKey("navigationNightMode")) {
      int jsValue =
          mapOptions.isNull("navigationNightMode") ? 0 : mapOptions.getInt("navigationNightMode");
      ((INavViewFragment) fragment)
          .setNightModeOption(EnumTranslationUtil.getForceNightModeFromJsValue(jsValue));
    }
  }

  /**
   * Attaches the appropriate Map or Navigation fragment to the given parent view. Uses
   * commitNowAllowingStateLoss for immediate attachment. If FragmentManager is busy, retries
   * asynchronously by calling scheduleFragmentTransaction.
   */
  private void commitFragmentTransaction(
      @NonNull FrameLayout view, @NonNull ReadableMap mapOptions) {

    FragmentActivity activity = (FragmentActivity) reactContext.getCurrentActivity();
    if (activity == null || activity.isFinishing()) {
      return;
    }

    int viewId = view.getId();
    String fragmentTag = String.valueOf(viewId);
    Fragment fragment;
    IMapViewFragment mapViewFragment;

    CustomTypes.MapViewType mapViewType =
        EnumTranslationUtil.getMapViewTypeFromJsValue(mapOptions.getInt("mapViewType"));
    GoogleMapOptions googleMapOptions = buildGoogleMapOptions(mapOptions);

    if (mapViewType == CustomTypes.MapViewType.MAP) {
      MapViewFragment mapFragment =
          MapViewFragment.newInstance(reactContext, viewId, googleMapOptions);
      fragment = mapFragment;
      mapViewFragment = mapFragment;
    } else {
      NavViewFragment navFragment =
          NavViewFragment.newInstance(reactContext, viewId, googleMapOptions);

      if (mapOptions.hasKey("navigationNightMode") && !mapOptions.isNull("navigationNightMode")) {
        int jsValue = mapOptions.getInt("navigationNightMode");
        navFragment.setNightModeOption(EnumTranslationUtil.getForceNightModeFromJsValue(jsValue));
      }

      if (mapOptions.hasKey("navigationStylingOptions")
          && !mapOptions.isNull("navigationStylingOptions")) {
        ReadableMap stylingOptionsMap = mapOptions.getMap("navigationStylingOptions");
        StylingOptions stylingOptions =
            new StylingOptionsBuilder.Builder(stylingOptionsMap.toHashMap()).build();
        navFragment.setStylingOptions(stylingOptions);
      }

      fragment = navFragment;
      mapViewFragment = navFragment;
    }

    // Execute Transaction
    try {
      activity
          .getSupportFragmentManager()
          .beginTransaction()
          .replace(viewId, fragment, fragmentTag)
          .commitNowAllowingStateLoss();
    } catch (IllegalStateException e) {
      // FragmentManager is busy or Activity state is invalid.
      // re-schedule the transaction.
      scheduleFragmentTransaction(view);
      return;
    } catch (Exception e) {
      // For other unrecoverable errors, simply abort.
      // Most likely the activity is finishing or destroyed.
      return;
    }

    // Fragment created successfully, update state.
    pendingFragments.remove(viewId);
    mapOptionsCache.remove(viewId);
    fragmentMap.put(viewId, new WeakReference<>(mapViewFragment));

    // Start per-frame layout loop to keep fragment sized correctly.
    startLayoutLoop(view);
    // Trigger layout after fragment transaction is done.
    view.post(() -> layoutFragmentInView(view, mapViewFragment));
  }

  public GoogleMap getGoogleMap(int viewId) {
    try {
      IMapViewFragment fragment = getFragmentForViewId(viewId);
      if (fragment == null) return null;
      return fragment.getGoogleMap();
    } catch (Exception e) {
      return null;
    }
  }
}
