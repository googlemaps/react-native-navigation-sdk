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

import android.view.Choreographer;
import android.view.View;
import android.widget.FrameLayout;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentActivity;
import com.facebook.react.bridge.Dynamic;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewManagerDelegate;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.viewmanagers.NavViewManagerDelegate;
import com.facebook.react.viewmanagers.NavViewManagerInterface;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.GoogleMapOptions;
import com.google.android.gms.maps.model.CameraPosition;
import com.google.android.libraries.navigation.StylingOptions;
import java.lang.ref.WeakReference;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;

// NavViewManager is responsible for managing both the regular map fragment as well as the
// navigation map view fragment.
//
@ReactModule(name = NavViewManager.REACT_CLASS)
public class NavViewManager extends SimpleViewManager<FrameLayout>
    implements NavViewManagerInterface<FrameLayout> {

  public static final String REACT_CLASS = "NavView";
  private static NavViewManager instance;

  private final ViewManagerDelegate<FrameLayout> mDelegate;

  private final HashMap<Integer, WeakReference<IMapViewFragment>> fragmentMap = new HashMap<>();
  private final HashMap<Integer, Choreographer.FrameCallback> frameCallbackMap = new HashMap<>();

  // Cache the latest options per view so deferred fragment creation uses fresh
  // values.
  private final HashMap<Integer, ReadableMap> mapOptionsCache = new HashMap<>();

  // Track views with pending fragment creation attempts.
  private final HashSet<Integer> pendingFragments = new HashSet<>();

  // Property sink to buffer both fragment and controller props that arrive before
  // fragment is created
  private final HashMap<Integer, ViewPropertiesSink> propertySinkMap = new HashMap<>();

  // nativeID-based view registry for TurboModule access
  private final HashMap<String, WeakReference<FrameLayout>> viewRegistry = new HashMap<>();

  private ReactApplicationContext reactContext;

  public NavViewManager() {
    mDelegate = new NavViewManagerDelegate<>(this);
  }

  @Override
  @Nullable
  public ViewManagerDelegate<FrameLayout> getDelegate() {
    return mDelegate;
  }

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

    // Set initial camera position if provided
    if (mapOptionsMap.hasKey("hasCameraPosition")
        && !mapOptionsMap.isNull("hasCameraPosition")
        && mapOptionsMap.getBoolean("hasCameraPosition")
        && mapOptionsMap.hasKey("cameraPosition")
        && !mapOptionsMap.isNull("cameraPosition")) {
      ReadableMap cameraMap = mapOptionsMap.getMap("cameraPosition");
      CameraPosition cameraPosition = ObjectTranslationUtil.getCameraPositionFromMap(cameraMap);
      if (cameraPosition != null) {
        options.camera(cameraPosition);
      }
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

  /**
   * Register a view in the nativeID-based registry for TurboModule access. Called when nativeID
   * prop is set.
   */
  public void registerViewByNativeId(String nativeID, FrameLayout view) {
    if (nativeID != null && !nativeID.isEmpty()) {
      viewRegistry.put(nativeID, new WeakReference<>(view));
    }
  }

  /**
   * Get a view by its nativeID. Used by TurboModules to access views. Returns null if view not
   * found or has been garbage collected.
   */
  @Nullable
  public FrameLayout getViewByNativeId(String nativeID) {
    if (nativeID == null || nativeID.isEmpty()) {
      return null;
    }
    WeakReference<FrameLayout> weakReference = viewRegistry.get(nativeID);
    if (weakReference == null) {
      return null;
    }
    FrameLayout view = weakReference.get();
    if (view == null) {
      // View was garbage collected, clean up
      viewRegistry.remove(nativeID);
      return null;
    }
    return view;
  }

  /**
   * Get the fragment for a view identified by nativeID. Used by TurboModules to perform operations
   * on specific views.
   */
  @Nullable
  public IMapViewFragment getFragmentByNativeId(String nativeID) {
    FrameLayout view = getViewByNativeId(nativeID);
    if (view == null) {
      return null;
    }
    return getFragmentForViewId(view.getId());
  }

  @NonNull
  @Override
  protected FrameLayout createViewInstance(@NonNull ThemedReactContext context) {
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

    // Clean up pending fragment tracking
    pendingFragments.remove(viewId);
    mapOptionsCache.remove(viewId);

    // Clean up nativeID registry
    // Find and remove this view from the registry by iterating (inefficient but
    // rare operation)
    viewRegistry
        .entrySet()
        .removeIf(
            entry -> {
              WeakReference<FrameLayout> ref = entry.getValue();
              return ref == null || ref.get() == null || ref.get() == view;
            });

    Choreographer.FrameCallback frameCallback = frameCallbackMap.remove(viewId);
    if (frameCallback != null) {
      Choreographer.getInstance().removeFrameCallback(frameCallback);
    }

    // Clean up property sink
    ViewPropertiesSink sink = propertySinkMap.remove(viewId);
    if (sink != null) {
      sink.clear();
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

  /** Get fragment properties interface - returns either the real fragment or the property sink. */
  @NonNull
  private INavigationViewProperties getNavigationFragmentProperties(int viewId) {
    IMapViewFragment fragment = getFragmentForViewId(viewId);
    if (fragment != null && fragment instanceof INavViewFragment) {
      return (INavViewFragment) fragment;
    }

    // Return sink to buffer properties
    ViewPropertiesSink sink = propertySinkMap.get(viewId);
    if (sink == null) {
      sink = new ViewPropertiesSink();
      propertySinkMap.put(viewId, sink);
    }
    return sink;
  }

  /** Get map fragment properties interface - for map-only views. */
  @NonNull
  private IMapViewProperties getMapFragmentProperties(int viewId) {
    IMapViewFragment fragment = getFragmentForViewId(viewId);
    if (fragment != null) {
      return fragment;
    }

    // Return sink to buffer properties
    ViewPropertiesSink sink = propertySinkMap.get(viewId);
    if (sink == null) {
      sink = new ViewPropertiesSink();
      propertySinkMap.put(viewId, sink);
    }
    return sink;
  }

  /** Get controller properties interface - returns either the real controller or the sink. */
  @NonNull
  private INavigationViewControllerProperties getMapControllerProperties(int viewId) {
    IMapViewFragment fragment = getFragmentForViewId(viewId);
    if (fragment != null && fragment.getMapController() != null) {
      return fragment.getMapController();
    }

    // Return sink to buffer controller properties
    ViewPropertiesSink sink = propertySinkMap.get(viewId);
    if (sink == null) {
      sink = new ViewPropertiesSink();
      propertySinkMap.put(viewId, sink);
    }
    return sink;
  }

  /**
   * Apply buffered properties from the unified sink to both fragment and controller, then discard
   * the sink. This should be called once when the fragment is ready.
   */
  private void applyBufferedPropertiesAndClearSinks(int viewId, IMapViewFragment fragment) {
    ViewPropertiesSink sink = propertySinkMap.remove(viewId);
    if (sink != null) {
      // Apply fragment-level properties
      sink.applyToFragment(fragment);

      // Apply controller-level properties
      if (fragment.getMapController() != null) {
        sink.applyToController(fragment.getMapController());
      }

      sink.clear();
    }
  }

  /**
   * Handle nativeID prop to register views in the registry. This is required for TurboModule
   * methods to find specific view instances.
   */
  @Override
  public void setNativeId(@NonNull FrameLayout view, @Nullable String nativeId) {
    super.setNativeId(view, nativeId);
    if (nativeId != null && !nativeId.isEmpty()) {
      registerViewByNativeId(nativeId, view);
    }
  }

  @Override
  public void setNativeID(@NonNull FrameLayout view, @Nullable String nativeID) {
    setNativeId(view, nativeID);
  }

  @ReactProp(name = "viewInitializationParams")
  public void setViewInitializationParams(
      FrameLayout view, @NonNull ReadableMap viewInitializationParams) {
    int viewId = view.getId();
    mapOptionsCache.put(viewId, viewInitializationParams);

    if (isFragmentCreated(viewId)) {
      updateMapOptionValues(viewId, viewInitializationParams);
      return;
    }

    if (!pendingFragments.contains(viewId)) {
      pendingFragments.add(viewId);
      scheduleFragmentTransaction(view);
    }
  }

  // ========== Dynamic Props - Map Appearance ==========

  @ReactProp(name = "mapType")
  public void setMapType(FrameLayout view, int mapType) {
    getMapControllerProperties(view.getId()).setMapType(mapType);
  }

  @ReactProp(name = "mapColorScheme")
  public void setMapColorScheme(FrameLayout view, int mapColorScheme) {
    getMapFragmentProperties(view.getId())
        .setMapColorScheme(EnumTranslationUtil.getMapColorSchemeFromJsValue(mapColorScheme));
  }

  @ReactProp(name = "navigationNightMode")
  public void setNavigationNightMode(FrameLayout view, int nightMode) {
    getNavigationFragmentProperties(view.getId())
        .setNightModeOption(EnumTranslationUtil.getForceNightModeFromJsValue(nightMode));
  }

  @ReactProp(name = "mapPadding")
  public void setMapPadding(FrameLayout view, @Nullable ReadableMap padding) {
    if (padding != null) {
      int top = padding.hasKey("top") ? padding.getInt("top") : 0;
      int left = padding.hasKey("left") ? padding.getInt("left") : 0;
      int bottom = padding.hasKey("bottom") ? padding.getInt("bottom") : 0;
      int right = padding.hasKey("right") ? padding.getInt("right") : 0;
      getMapControllerProperties(view.getId()).setPadding(top, left, bottom, right);
    }
  }

  @ReactProp(name = "mapStyle")
  public void setMapStyle(FrameLayout view, @Nullable String mapStyle) {
    if (mapStyle != null) {
      getMapControllerProperties(view.getId()).setMapStyle(mapStyle);
    }
  }

  @ReactProp(name = "mapToolbarEnabled", defaultBoolean = true)
  public void setMapToolbarEnabled(FrameLayout view, boolean enabled) {
    getMapControllerProperties(view.getId()).setMapToolbarEnabled(enabled);
  }

  @ReactProp(name = "indoorEnabled", defaultBoolean = true)
  public void setIndoorEnabled(FrameLayout view, boolean enabled) {
    getMapControllerProperties(view.getId()).setIndoorEnabled(enabled);
  }

  @ReactProp(name = "indoorLevelPickerEnabled", defaultBoolean = true)
  public void setIndoorLevelPickerEnabled(FrameLayout view, boolean enabled) {
    getMapControllerProperties(view.getId()).setIndoorLevelPickerEnabled(enabled);
  }

  @ReactProp(name = "trafficEnabled", defaultBoolean = false)
  public void setTrafficEnabled(FrameLayout view, boolean enabled) {
    getMapControllerProperties(view.getId()).setTrafficEnabled(enabled);
  }

  @ReactProp(name = "compassEnabled", defaultBoolean = true)
  public void setCompassEnabled(FrameLayout view, boolean enabled) {
    getMapControllerProperties(view.getId()).setCompassEnabled(enabled);
  }

  @ReactProp(name = "buildingsEnabled", defaultBoolean = true)
  public void setBuildingsEnabled(FrameLayout view, boolean enabled) {
    getMapControllerProperties(view.getId()).setBuildingsEnabled(enabled);
  }

  @ReactProp(name = "minZoomLevel")
  public void setMinZoomLevel(FrameLayout view, float minZoomLevel) {
    getMapControllerProperties(view.getId()).setMinZoomLevel(minZoomLevel);
  }

  @ReactProp(name = "maxZoomLevel")
  public void setMaxZoomLevel(FrameLayout view, float maxZoomLevel) {
    getMapControllerProperties(view.getId()).setMaxZoomLevel(maxZoomLevel);
  }

  // ========== Dynamic Props - Location ==========

  @ReactProp(name = "myLocationEnabled", defaultBoolean = false)
  public void setMyLocationEnabled(FrameLayout view, boolean enabled) {
    getMapControllerProperties(view.getId()).setMyLocationEnabled(enabled);
  }

  @ReactProp(name = "myLocationButtonEnabled", defaultBoolean = true)
  public void setMyLocationButtonEnabled(FrameLayout view, boolean enabled) {
    getMapControllerProperties(view.getId()).setMyLocationButtonEnabled(enabled);
  }

  // ========== Dynamic Props - Gestures ==========

  @ReactProp(name = "rotateGesturesEnabled", defaultBoolean = true)
  public void setRotateGesturesEnabled(FrameLayout view, boolean enabled) {
    getMapControllerProperties(view.getId()).setRotateGesturesEnabled(enabled);
  }

  @ReactProp(name = "scrollGesturesEnabled", defaultBoolean = true)
  public void setScrollGesturesEnabled(FrameLayout view, boolean enabled) {
    getMapControllerProperties(view.getId()).setScrollGesturesEnabled(enabled);
  }

  @ReactProp(name = "scrollGesturesEnabledDuringRotateOrZoom", defaultBoolean = true)
  public void setScrollGesturesEnabledDuringRotateOrZoom(FrameLayout view, boolean enabled) {
    getMapControllerProperties(view.getId()).setScrollGesturesEnabledDuringRotateOrZoom(enabled);
  }

  @ReactProp(name = "tiltGesturesEnabled", defaultBoolean = true)
  public void setTiltGesturesEnabled(FrameLayout view, boolean enabled) {
    getMapControllerProperties(view.getId()).setTiltGesturesEnabled(enabled);
  }

  @ReactProp(name = "zoomGesturesEnabled", defaultBoolean = true)
  public void setZoomGesturesEnabled(FrameLayout view, boolean enabled) {
    getMapControllerProperties(view.getId()).setZoomGesturesEnabled(enabled);
  }

  @ReactProp(name = "zoomControlsEnabled", defaultBoolean = true)
  public void setZoomControlsEnabled(FrameLayout view, boolean enabled) {
    getMapControllerProperties(view.getId()).setZoomControlsEnabled(enabled);
  }

  // ========== Dynamic Props - Navigation UI ==========

  @ReactProp(name = "tripProgressBarEnabled", defaultBoolean = false)
  public void setTripProgressBarEnabled(FrameLayout view, boolean enabled) {
    getNavigationFragmentProperties(view.getId()).setTripProgressBarEnabled(enabled);
  }

  @ReactProp(name = "trafficPromptsEnabled", defaultBoolean = true)
  public void setTrafficPromptsEnabled(FrameLayout view, boolean enabled) {
    getNavigationFragmentProperties(view.getId()).setTrafficPromptsEnabled(enabled);
  }

  @ReactProp(name = "trafficIncidentCardsEnabled", defaultBoolean = true)
  public void setTrafficIncidentCardsEnabled(FrameLayout view, boolean enabled) {
    getNavigationFragmentProperties(view.getId()).setTrafficIncidentCardsEnabled(enabled);
  }

  @ReactProp(name = "headerEnabled", defaultBoolean = true)
  public void setHeaderEnabled(FrameLayout view, boolean enabled) {
    getNavigationFragmentProperties(view.getId()).setHeaderEnabled(enabled);
  }

  @ReactProp(name = "footerEnabled", defaultBoolean = true)
  public void setFooterEnabled(FrameLayout view, boolean enabled) {
    getNavigationFragmentProperties(view.getId()).setFooterEnabled(enabled);
  }

  @ReactProp(name = "speedometerEnabled", defaultBoolean = true)
  public void setSpeedometerEnabled(FrameLayout view, boolean enabled) {
    getNavigationFragmentProperties(view.getId()).setSpeedometerEnabled(enabled);
  }

  @ReactProp(name = "speedLimitIconEnabled", defaultBoolean = true)
  public void setSpeedLimitIconEnabled(FrameLayout view, boolean enabled) {
    getNavigationFragmentProperties(view.getId()).setSpeedLimitIconEnabled(enabled);
  }

  @ReactProp(name = "recenterButtonEnabled", defaultBoolean = true)
  public void setRecenterButtonEnabled(FrameLayout view, boolean enabled) {
    getNavigationFragmentProperties(view.getId()).setRecenterButtonEnabled(enabled);
  }

  @ReactProp(name = "reportIncidentButtonEnabled", defaultBoolean = true)
  public void setReportIncidentButtonEnabled(FrameLayout view, boolean enabled) {
    getNavigationFragmentProperties(view.getId()).setReportIncidentButtonEnabled(enabled);
  }

  @Override
  @ReactProp(name = "navigationViewStylingOptions")
  public void setNavigationViewStylingOptions(FrameLayout view, @Nullable Dynamic stylingOptions) {
    if (stylingOptions != null && !stylingOptions.isNull()) {
      ReadableMap stylingOptionsMap = stylingOptions.asMap();
      StylingOptions options =
          new StylingOptionsBuilder.Builder(stylingOptionsMap.toHashMap()).build();
      getNavigationFragmentProperties(view.getId()).setStylingOptions(options);
    }
  }

  // ========== Helper Methods ==========

  @Nullable
  private INavViewFragment getNavFragmentForViewId(int viewId) {
    IMapViewFragment fragment = getFragmentForViewId(viewId);
    if (fragment == null) {
      return null;
    }
    if (fragment instanceof INavViewFragment) {
      return (INavViewFragment) fragment;
    }
    throw new IllegalStateException("The fragment is not a nav view fragment");
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
      int nightMode =
          mapOptions.isNull("navigationNightMode") ? 0 : mapOptions.getInt("navigationNightMode");
      ((INavViewFragment) fragment)
          .setNightModeOption(EnumTranslationUtil.getForceNightModeFromJsValue(nightMode));
    }
  }

  /**
   * Attaches the appropriate Map or Navigation fragment to the given parent view. Uses
   * commitNowAllowingStateLoss for immediate attachment. If FragmentManager is busy, retries
   * asynchronously by calling scheduleFragmentTransaction.
   */
  private void commitFragmentTransaction(
      @NonNull FrameLayout view, @NonNull ReadableMap viewInitializationParams) {

    FragmentActivity activity = (FragmentActivity) reactContext.getCurrentActivity();
    if (activity == null || activity.isFinishing()) {
      return;
    }

    int viewId = view.getId();
    String fragmentTag = String.valueOf(viewId);
    Fragment fragment;
    IMapViewFragment mapViewFragment;

    CustomTypes.MapViewType mapViewType =
        EnumTranslationUtil.getMapViewTypeFromJsValue(viewInitializationParams.getInt("viewType"));

    GoogleMapOptions googleMapOptions = buildGoogleMapOptions(viewInitializationParams);

    if (mapViewType == CustomTypes.MapViewType.MAP) {
      MapViewFragment mapFragment =
          MapViewFragment.newInstance(reactContext, viewId, googleMapOptions);
      fragment = mapFragment;
      mapViewFragment = mapFragment;
    } else {
      NavViewFragment navFragment =
          NavViewFragment.newInstance(reactContext, viewId, googleMapOptions);

      if (viewInitializationParams.hasKey("navigationNightMode")
          && !viewInitializationParams.isNull("navigationNightMode")) {
        int jsValue = viewInitializationParams.getInt("navigationNightMode");
        navFragment.setNightModeOption(EnumTranslationUtil.getForceNightModeFromJsValue(jsValue));
      }

      if (viewInitializationParams.hasKey("navigationStylingOptions")
          && !viewInitializationParams.isNull("navigationStylingOptions")) {
        ReadableMap stylingOptionsMap = viewInitializationParams.getMap("navigationStylingOptions");
        StylingOptions stylingOptions =
            new StylingOptionsBuilder.Builder(stylingOptionsMap.toHashMap()).build();
        navFragment.setStylingOptions(stylingOptions);
      }

      // Apply navigationUIEnabledPreference
      // 0 = AUTOMATIC (enable if session initialized), 1 = DISABLED
      boolean navigationUIEnabled = false;
      if (viewInitializationParams.hasKey("navigationUIEnabledPreference")) {
        int preference =
            viewInitializationParams.isNull("navigationUIEnabledPreference")
                ? 0
                : viewInitializationParams.getInt("navigationUIEnabledPreference");
        if (preference == 0) { // AUTOMATIC
          // Enable if navigation session is initialized
          navigationUIEnabled = NavModule.getInstance().getNavigator() != null;
        }
        // If preference is 1 (DISABLED), navigationUIEnabled stays false
      }
      navFragment.setNavigationUiEnabled(navigationUIEnabled);

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

    // Apply any buffered properties that arrived before fragment was created
    applyBufferedPropertiesAndClearSinks(viewId, mapViewFragment);

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
