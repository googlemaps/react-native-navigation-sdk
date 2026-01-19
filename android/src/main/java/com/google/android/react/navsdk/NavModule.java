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

import android.app.Activity;
import android.location.Location;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.lifecycle.LifecycleOwner;
import androidx.lifecycle.Observer;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.libraries.mapsplatform.turnbyturn.model.NavInfo;
import com.google.android.libraries.mapsplatform.turnbyturn.model.StepInfo;
import com.google.android.libraries.navigation.ArrivalEvent;
import com.google.android.libraries.navigation.CustomRoutesOptions;
import com.google.android.libraries.navigation.DisplayOptions;
import com.google.android.libraries.navigation.ListenableResultFuture;
import com.google.android.libraries.navigation.NavigationApi;
import com.google.android.libraries.navigation.NavigationApi.OnTermsResponseListener;
import com.google.android.libraries.navigation.Navigator;
import com.google.android.libraries.navigation.RoadSnappedLocationProvider;
import com.google.android.libraries.navigation.RoadSnappedLocationProvider.LocationListener;
import com.google.android.libraries.navigation.RouteSegment;
import com.google.android.libraries.navigation.RoutingOptions;
import com.google.android.libraries.navigation.SimulationOptions;
import com.google.android.libraries.navigation.SpeedAlertOptions;
import com.google.android.libraries.navigation.SpeedAlertSeverity;
import com.google.android.libraries.navigation.TermsAndConditionsCheckOption;
import com.google.android.libraries.navigation.TimeAndDistance;
import com.google.android.libraries.navigation.Waypoint;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * This exposes a series of methods that can be called diretly from the React Native code. They have
 * been implemented using promises as it's not recommended for them to be synchronous.
 */
public class NavModule extends ReactContextBaseJavaModule
    implements INavigationCallback, LifecycleEventListener {
  public static final String REACT_CLASS = "NavModule";
  private static NavModule instance;
  private static ModuleReadyListener moduleReadyListener;

  ReactApplicationContext reactContext;
  private Navigator mNavigator;
  private final ArrayList<Waypoint> mWaypoints = new ArrayList<>();
  private ListenableResultFuture<Navigator.RouteStatus> pendingRoute;
  private RoadSnappedLocationProvider mRoadSnappedLocationProvider;
  private NavViewManager mNavViewManager;
  private final CopyOnWriteArrayList<NavigationReadyListener> mNavigationReadyListeners =
      new CopyOnWriteArrayList<>();
  private boolean mIsListeningRoadSnappedLocation = false;
  private LocationListener mLocationListener;
  private Navigator.ArrivalListener mArrivalListener;
  private Navigator.RouteChangedListener mRouteChangedListener;
  private Navigator.TrafficUpdatedListener mTrafficUpdatedListener;
  private Navigator.ReroutingListener mReroutingListener;
  private Navigator.RemainingTimeOrDistanceChangedListener mRemainingTimeOrDistanceChangedListener;

  private HashMap<String, Object> tocParamsMap;
  private @Navigator.TaskRemovedBehavior int taskRemovedBehaviour;

  public interface ModuleReadyListener {
    void onModuleReady();
  }

  public interface NavigationReadyListener {
    void onReady(boolean ready);
  }

  public NavModule(ReactApplicationContext reactContext, NavViewManager navViewManager) {
    super(reactContext);
    setReactContext(reactContext);
    setViewManager(navViewManager);
    if (moduleReadyListener != null) {
      moduleReadyListener.onModuleReady();
    }
  }

  public static synchronized NavModule getInstance(
      ReactApplicationContext reactContext, NavViewManager navViewManager) {
    if (instance == null) {
      instance = new NavModule(reactContext, navViewManager);
    } else {
      instance.setReactContext(reactContext);
      instance.setViewManager(navViewManager);
    }
    return instance;
  }

  public static synchronized NavModule getInstance() {
    if (instance == null) {
      throw new IllegalStateException(REACT_CLASS + " instance is null");
    }
    return instance;
  }

  public void setReactContext(ReactApplicationContext reactContext) {
    this.reactContext = reactContext;
    this.reactContext.addLifecycleEventListener(this);
  }

  public void setViewManager(NavViewManager navViewManager) {
    mNavViewManager = navViewManager;
  }

  public static void setModuleReadyListener(ModuleReadyListener listener) {
    moduleReadyListener = listener;
    if (instance != null && moduleReadyListener != null) {
      moduleReadyListener.onModuleReady();
    }
  }

  public Navigator getNavigator() {
    return mNavigator;
  }

  @NonNull
  @Override
  public String getName() {
    return REACT_CLASS;
  }

  @Override
  public Map<String, Object> getConstants() {
    return new HashMap<>();
  }

  @ReactMethod
  public void cleanup(final Promise promise) {
    if (!ensureNavigatorAvailable(promise)) {
      return;
    }

    stopUpdatingLocation();
    removeNavigationListeners();
    mWaypoints.clear();

    for (NavigationReadyListener listener : mNavigationReadyListeners) {
      listener.onReady(false);
    }

    final Navigator navigator = mNavigator;
    UiThreadUtil.runOnUiThread(
        () -> {
          navigator.clearDestinations();
          navigator.cleanup();
          promise.resolve(true);
        });
  }

  @ReactMethod
  public void initializeNavigator(
      @Nullable ReadableMap tocParams, int taskRemovedBehaviourJsValue) {
    this.tocParamsMap = tocParams.toHashMap();
    this.taskRemovedBehaviour =
        EnumTranslationUtil.getTaskRemovedBehaviourFromJsValue(taskRemovedBehaviourJsValue);

    if (getTermsAccepted()) {
      initializeNavigationApi();
    } else {
      this.showTermsAndConditionsDialog();
    }

    // Observe live data for nav info updates.
    Observer<NavInfo> navInfoObserver = this::showNavInfo;

    UiThreadUtil.runOnUiThread(
        () -> {
          final Activity currentActivity = getReactApplicationContext().getCurrentActivity();
          if (currentActivity != null) {
            NavInfoReceivingService.getNavInfoLiveData()
                .observe((LifecycleOwner) currentActivity, navInfoObserver);
          }
        });
  }

  private void onNavigationReady() {
    mNavViewManager.onNavigationReady();

    sendCommandToReactNative("onNavigationReady", null);

    for (NavigationReadyListener listener : mNavigationReadyListeners) {
      listener.onReady(true);
    }
  }

  public void registerNavigationReadyListener(NavigationReadyListener listener) {
    if (listener != null && !mNavigationReadyListeners.contains(listener)) {
      mNavigationReadyListeners.add(listener);
      if (mNavigator != null) {
        listener.onReady(true);
      }
    }
  }

  public void unRegisterNavigationReadyListener(NavigationReadyListener listener) {
    mNavigationReadyListeners.remove(listener);
  }

  private void onNavigationInitError(int errorCode) {
    sendCommandToReactNative("onNavigationInitError", String.valueOf(errorCode));
  }

  /** Starts the Navigation API, saving a reference to the ready Navigator instance. */
  private void initializeNavigationApi() {
    final Activity currentActivity = getReactApplicationContext().getCurrentActivity();
    if (currentActivity == null) return;
    NavigationApi.getNavigator(
        currentActivity.getApplication(),
        new NavigationApi.NavigatorListener() {
          @Override
          public void onNavigatorReady(Navigator navigator) {
            final Activity currentActivity = getReactApplicationContext().getCurrentActivity();
            if (currentActivity == null) return;

            // Keep a reference to the Navigator (used to configure and start nav)
            mNavigator = navigator;
            mNavigator.setTaskRemovedBehavior(taskRemovedBehaviour);
            if (mRoadSnappedLocationProvider == null) {
              mRoadSnappedLocationProvider =
                  NavigationApi.getRoadSnappedLocationProvider(currentActivity.getApplication());
            }
            registerNavigationListeners();
            onNavigationReady();
          }

          @Override
          public void onError(@NavigationApi.ErrorCode int errorCode) {
            String errMsg;
            switch (errorCode) {
              case NavigationApi.ErrorCode.NOT_AUTHORIZED:
                errMsg =
                    "Error loading Navigation API: Your API key is invalid or not authorized to use"
                        + " Navigation.";
                logDebugInfo(errMsg);
                break;
              case NavigationApi.ErrorCode.TERMS_NOT_ACCEPTED:
                errMsg =
                    "Error loading Navigation API: User did not accept the Navigation Terms of"
                        + " Use.";
                logDebugInfo(errMsg);
                break;
              case NavigationApi.ErrorCode.NETWORK_ERROR:
                errMsg = "Error loading Navigation API: Network error";
                logDebugInfo(errMsg);
                break;
              default:
                errMsg = "Error loading Navigation API: Location permission is not granted";
                logDebugInfo(errMsg);
            }

            onNavigationInitError(errorCode);
          }
        });
  }

  /**
   * Enable turn by turn logging using background service
   *
   * @param isEnabled
   */
  @ReactMethod
  public void setTurnByTurnLoggingEnabled(boolean isEnabled) {
    final Activity currentActivity = getReactApplicationContext().getCurrentActivity();
    if (currentActivity == null) return;
    if (mNavigator == null) {
      logDebugInfo(JsErrors.NO_NAVIGATOR_ERROR_MESSAGE);
      return;
    }

    if (isEnabled) {
      NavForwardingManager.startNavForwarding(mNavigator, currentActivity, this);
    } else {
      NavForwardingManager.stopNavForwarding(mNavigator, currentActivity, this);
    }
  }

  /**
   * Registers a number of example event listeners that show an on screen message when certain
   * navigation events occur (e.g. the driver's route changes or the destination is reached).
   */
  private void registerNavigationListeners() {
    if (mNavigator == null) {
      return;
    }
    removeNavigationListeners();

    mArrivalListener =
        new Navigator.ArrivalListener() {
          @Override
          public void onArrival(ArrivalEvent arrivalEvent) {
            WritableMap map = Arguments.createMap();
            map.putMap(
                "waypoint", ObjectTranslationUtil.getMapFromWaypoint(arrivalEvent.getWaypoint()));
            map.putBoolean("isFinalDestination", arrivalEvent.isFinalDestination());

            WritableNativeArray params = new WritableNativeArray();
            params.pushMap(map);

            sendCommandToReactNative("onArrival", params);
          }
        };
    mNavigator.addArrivalListener(mArrivalListener);

    mRouteChangedListener =
        new Navigator.RouteChangedListener() {
          @Override
          public void onRouteChanged() {
            sendCommandToReactNative("onRouteChanged", null);
          }
        };
    mNavigator.addRouteChangedListener(mRouteChangedListener);

    mTrafficUpdatedListener =
        new Navigator.TrafficUpdatedListener() {
          @Override
          public void onTrafficUpdated() {
            sendCommandToReactNative("onTrafficUpdated", null);
          }
        };
    mNavigator.addTrafficUpdatedListener(mTrafficUpdatedListener);

    mReroutingListener =
        new Navigator.ReroutingListener() {
          @Override
          public void onReroutingRequestedByOffRoute() {
            sendCommandToReactNative("onReroutingRequestedByOffRoute", null);
          }
        };
    mNavigator.addReroutingListener(mReroutingListener);

    mRemainingTimeOrDistanceChangedListener =
        new Navigator.RemainingTimeOrDistanceChangedListener() {
          @Override
          public void onRemainingTimeOrDistanceChanged() {
            sendCommandToReactNative("onRemainingTimeOrDistanceChanged", null);
          }
        };
    mNavigator.addRemainingTimeOrDistanceChangedListener(
        0, 0, mRemainingTimeOrDistanceChangedListener);
  }

  private void removeNavigationListeners() {
    if (mNavigator == null) {
      return;
    }
    if (mArrivalListener != null) {
      mNavigator.removeArrivalListener(mArrivalListener);
    }
    if (mRouteChangedListener != null) {
      mNavigator.removeRouteChangedListener(mRouteChangedListener);
    }
    if (mTrafficUpdatedListener != null) {
      mNavigator.removeTrafficUpdatedListener(mTrafficUpdatedListener);
    }
    if (mReroutingListener != null) {
      mNavigator.removeReroutingListener(mReroutingListener);
    }
    if (mRemainingTimeOrDistanceChangedListener != null) {
      mNavigator.removeRemainingTimeOrDistanceChangedListener(
          mRemainingTimeOrDistanceChangedListener);
    }
  }

  private void createWaypoint(Map map) {
    String placeId = CollectionUtil.getString("placeId", map);
    String title = CollectionUtil.getString("title", map);

    Double lat = null;
    Double lng = null;

    if (map.containsKey("position")) {
      Map latlng = (Map) map.get("position");
      if (latlng.get(Constants.LAT_FIELD_KEY) != null)
        lat = Double.parseDouble(latlng.get(Constants.LAT_FIELD_KEY).toString());
      if (latlng.get(Constants.LNG_FIELD_KEY) != null)
        lng = Double.parseDouble(latlng.get(Constants.LNG_FIELD_KEY).toString());
    }

    boolean vehicleStopover = CollectionUtil.getBool("vehicleStopover", map, false);
    boolean preferSameSideOfRoad = CollectionUtil.getBool("preferSameSideOfRoad", map, false);

    try {
      Waypoint.Builder waypointBuilder =
          Waypoint.builder()
              .setTitle(title)
              .setVehicleStopover(vehicleStopover)
              .setPreferSameSideOfRoad(preferSameSideOfRoad);

      if (map.containsKey("preferredHeading")) {
        int preferredHeading = (int) map.get("preferredHeading");
        waypointBuilder.setPreferredHeading(preferredHeading);
      }

      if (placeId == null || placeId.isEmpty() && lat != null && lng != null) {
        mWaypoints.add(waypointBuilder.setLatLng(lat, lng).build());
      } else {
        mWaypoints.add(waypointBuilder.setPlaceIdString(placeId).build());
      }
    } catch (Waypoint.UnsupportedPlaceIdException e) {
      logDebugInfo("Error starting navigation: Place ID is not supported: " + placeId);
    } catch (Waypoint.InvalidSegmentHeadingException e) {
      logDebugInfo("Error starting navigation: Preferred heading has to be between 0 and 360");
    }
  }

  @ReactMethod
  public void setDestinations(
      ReadableArray waypoints,
      @Nullable ReadableMap routingOptions,
      @Nullable ReadableMap displayOptions,
      @Nullable ReadableMap routeTokenOptions,
      final Promise promise) {
    if (!ensureNavigatorAvailable(promise)) {
      return;
    }

    pendingRoute = null; // reset pendingRoute.
    mWaypoints.clear(); // reset waypoints

    // Set up a waypoint for each place that we want to go to.
    for (int i = 0; i < waypoints.size(); i++) {
      Map map = waypoints.getMap(i).toHashMap();
      createWaypoint(map);
    }

    // Get display options if provided
    DisplayOptions parsedDisplayOptions =
        displayOptions != null
            ? ObjectTranslationUtil.getDisplayOptionsFromMap(displayOptions.toHashMap())
            : null;

    // If route token options are provided, use CustomRoutesOptions
    if (routeTokenOptions != null) {
      CustomRoutesOptions customRoutesOptions;
      try {
        customRoutesOptions =
            ObjectTranslationUtil.getCustomRoutesOptionsFromMap(routeTokenOptions.toHashMap());
      } catch (IllegalStateException e) {
        promise.reject("routeTokenMalformed", "The route token passed is malformed", e);
        return;
      }

      if (parsedDisplayOptions != null) {
        pendingRoute =
            mNavigator.setDestinations(mWaypoints, customRoutesOptions, parsedDisplayOptions);
      } else {
        pendingRoute = mNavigator.setDestinations(mWaypoints, customRoutesOptions);
      }
    } else if (routingOptions != null) {
      RoutingOptions parsedRoutingOptions =
          ObjectTranslationUtil.getRoutingOptionsFromMap(routingOptions.toHashMap());

      if (parsedDisplayOptions != null) {
        pendingRoute =
            mNavigator.setDestinations(mWaypoints, parsedRoutingOptions, parsedDisplayOptions);
      } else {
        pendingRoute = mNavigator.setDestinations(mWaypoints, parsedRoutingOptions);
      }
    } else if (parsedDisplayOptions != null) {
      // No routing options provided: use defaults, but still honor display options if
      // supplied.
      pendingRoute =
          mNavigator.setDestinations(mWaypoints, new RoutingOptions(), parsedDisplayOptions);
    } else {
      pendingRoute = mNavigator.setDestinations(mWaypoints);
    }

    if (pendingRoute != null) {
      // Set an action to perform when a route is determined to the destination
      pendingRoute.setOnResultListener(
          code -> {
            sendCommandToReactNative("onRouteStatusResult", code.toString());
            promise.resolve(true);
          });
    } else {
      promise.resolve(true);
    }
  }

  @ReactMethod
  public void clearDestinations(final Promise promise) {
    if (!ensureNavigatorAvailable(promise)) {
      return;
    }
    mWaypoints.clear(); // reset waypoints
    mNavigator.clearDestinations();
    promise.resolve(true);
  }

  @ReactMethod
  public void continueToNextDestination(final Promise promise) {
    if (!ensureNavigatorAvailable(promise)) {
      return;
    }
    mNavigator.continueToNextDestination();
    promise.resolve(true);
  }

  @ReactMethod
  public void startGuidance(final Promise promise) {
    if (!ensureNavigatorAvailable(promise)) {
      return;
    }
    if (mWaypoints.isEmpty()) {
      promise.reject(JsErrors.NO_DESTINATIONS_ERROR_CODE, JsErrors.NO_DESTINATIONS_ERROR_MESSAGE);
      return;
    }

    mNavigator.startGuidance();
    sendCommandToReactNative("onStartGuidance", null);
    promise.resolve(true);
  }

  @ReactMethod
  public void stopGuidance(final Promise promise) {
    if (!ensureNavigatorAvailable(promise)) {
      return;
    }
    mNavigator.stopGuidance();
    promise.resolve(true);
  }

  @ReactMethod
  public void simulateLocationsAlongExistingRoute(float speedMultiplier) {
    if (mNavigator == null) {
      return;
    }
    if (mWaypoints.isEmpty()) {
      return;
    }

    mNavigator
        .getSimulator()
        .simulateLocationsAlongExistingRoute(
            new SimulationOptions().speedMultiplier(speedMultiplier));
  }

  @ReactMethod
  public void stopLocationSimulation() {
    if (mNavigator == null) {
      return;
    }
    mNavigator.getSimulator().unsetUserLocation();
  }

  @ReactMethod
  public void pauseLocationSimulation() {
    if (mNavigator == null) {
      return;
    }
    mNavigator.getSimulator().pause();
  }

  @ReactMethod
  public void resumeLocationSimulation() {
    if (mNavigator == null) {
      return;
    }
    mNavigator.getSimulator().resume();
  }

  @ReactMethod
  public void setAbnormalTerminatingReportingEnabled(boolean isOn) {
    NavigationApi.setAbnormalTerminationReportingEnabled(isOn);
  }

  @ReactMethod
  public void setSpeedAlertOptions(@Nullable ReadableMap options) {
    if (mNavigator == null) {
      return;
    }
    if (options == null) {
      mNavigator.setSpeedAlertOptions(null);
      return;
    }

    HashMap<String, Object> optionsMap = options.toHashMap();

    float minorThresholdPercentage =
        (float) CollectionUtil.getDouble("minorSpeedAlertPercentThreshold", optionsMap, -1);
    float majorThresholdPercentage =
        (float) CollectionUtil.getDouble("majorSpeedAlertPercentThreshold", optionsMap, -1);
    float severityUpgradeDurationSeconds =
        (float) CollectionUtil.getDouble("severityUpgradeDurationSeconds", optionsMap, -1);

    // The JS layer will validate the values before calling.
    SpeedAlertOptions alertOptions =
        new SpeedAlertOptions.Builder()
            .setSpeedAlertThresholdPercentage(SpeedAlertSeverity.MINOR, minorThresholdPercentage)
            .setSpeedAlertThresholdPercentage(SpeedAlertSeverity.MAJOR, majorThresholdPercentage)
            .setSeverityUpgradeDurationSeconds(severityUpgradeDurationSeconds)
            .build();

    UiThreadUtil.runOnUiThread(
        () -> {
          mNavigator.setSpeedAlertOptions(alertOptions);
        });
  }

  @ReactMethod
  public void setAudioGuidanceType(int jsValue) {
    if (mNavigator == null) {
      return;
    }

    UiThreadUtil.runOnUiThread(
        () -> {
          mNavigator.setAudioGuidance(EnumTranslationUtil.getAudioGuidanceFromJsValue(jsValue));
        });
  }

  @ReactMethod
  public void getCurrentTimeAndDistance(final Promise promise) {
    if (mNavigator == null) {
      promise.reject(JsErrors.NO_NAVIGATOR_ERROR_CODE, JsErrors.NO_NAVIGATOR_ERROR_MESSAGE);
      return;
    }

    TimeAndDistance timeAndDistance = mNavigator.getCurrentTimeAndDistance();

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
  public void getCurrentRouteSegment(final Promise promise) {
    if (mNavigator == null) {
      promise.reject(JsErrors.NO_NAVIGATOR_ERROR_CODE, JsErrors.NO_NAVIGATOR_ERROR_MESSAGE);
      return;
    }

    RouteSegment routeSegment = mNavigator.getCurrentRouteSegment();

    if (routeSegment == null) {
      promise.resolve(null);
      return;
    }

    promise.resolve(ObjectTranslationUtil.getMapFromRouteSegment(routeSegment));
  }

  @ReactMethod
  public void getRouteSegments(final Promise promise) {
    if (mNavigator == null) {
      promise.reject(JsErrors.NO_NAVIGATOR_ERROR_CODE, JsErrors.NO_NAVIGATOR_ERROR_MESSAGE);
      return;
    }

    List<RouteSegment> routeSegmentList = mNavigator.getRouteSegments();
    WritableArray arr = Arguments.createArray();

    for (RouteSegment segment : routeSegmentList) {
      arr.pushMap(ObjectTranslationUtil.getMapFromRouteSegment(segment));
    }

    promise.resolve(arr);
  }

  @ReactMethod
  public void getTraveledPath(final Promise promise) {
    if (mNavigator == null) {
      promise.reject(JsErrors.NO_NAVIGATOR_ERROR_CODE, JsErrors.NO_NAVIGATOR_ERROR_MESSAGE);
      return;
    }

    WritableArray arr = Arguments.createArray();

    for (LatLng latLng : mNavigator.getTraveledRoute()) {
      arr.pushMap(ObjectTranslationUtil.getMapFromLatLng(latLng));
    }

    promise.resolve(arr);
  }

  /** Send command to react native. */
  private void sendCommandToReactNative(String functionName, @Nullable Object params) {
    if (reactContext.hasActiveReactInstance()) {
      reactContext
          .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
          .emit(functionName, params);
    }
  }

  private boolean ensureNavigatorAvailable(final Promise promise) {
    if (mNavigator == null) {
      promise.reject(JsErrors.NO_NAVIGATOR_ERROR_CODE, JsErrors.NO_NAVIGATOR_ERROR_MESSAGE);
      return false;
    }
    return true;
  }

  @ReactMethod
  public void simulateLocation(ReadableMap location) {
    if (mNavigator != null) {
      HashMap<String, Object> locationMap = location.toHashMap();
      Double lat = CollectionUtil.getDouble(Constants.LAT_FIELD_KEY, locationMap, 0);
      Double lng = CollectionUtil.getDouble(Constants.LNG_FIELD_KEY, locationMap, 0);
      mNavigator.getSimulator().setUserLocation(new LatLng(lat, lng));
    }
  }

  @ReactMethod
  private void showTermsAndConditionsDialog() {
    final Activity currentActivity = getReactApplicationContext().getCurrentActivity();
    if (currentActivity == null) return;

    if (this.tocParamsMap == null) {
      return;
    }

    String companyName = CollectionUtil.getString("companyName", this.tocParamsMap);
    String title = CollectionUtil.getString("title", this.tocParamsMap);
    boolean showOnlyDisclaimer =
        CollectionUtil.getBool("showOnlyDisclaimer", this.tocParamsMap, false);

    TermsAndConditionsCheckOption tosOption =
        showOnlyDisclaimer
            ? TermsAndConditionsCheckOption.SKIPPED
            : TermsAndConditionsCheckOption.ENABLED;

    NavigationApi.showTermsAndConditionsDialog(
        currentActivity,
        companyName,
        title,
        null,
        new OnTermsResponseListener() {
          @Override
          public void onTermsResponse(boolean areTermsAccepted) {
            if (areTermsAccepted) {
              initializeNavigationApi();
            } else {
              onNavigationInitError(NavigationApi.ErrorCode.TERMS_NOT_ACCEPTED);
            }
          }
        },
        tosOption);
  }

  @ReactMethod
  public void areTermsAccepted(final Promise promise) {
    promise.resolve(getTermsAccepted());
  }

  public Boolean getTermsAccepted() {
    final Activity currentActivity = getReactApplicationContext().getCurrentActivity();
    if (currentActivity == null) return false;
    return NavigationApi.areTermsAccepted(currentActivity.getApplication());
  }

  @ReactMethod
  public void getNavSDKVersion(final Promise promise) {
    promise.resolve(NavigationApi.getNavSDKVersion());
  }

  @ReactMethod
  public void resetTermsAccepted() {
    final Activity currentActivity = getReactApplicationContext().getCurrentActivity();
    if (currentActivity == null) return;
    NavigationApi.resetTermsAccepted(currentActivity.getApplication());
  }

  @ReactMethod
  public void startUpdatingLocation() {
    registerLocationListener();
    mIsListeningRoadSnappedLocation = true;
  }

  @ReactMethod
  public void stopUpdatingLocation() {
    mIsListeningRoadSnappedLocation = false;
    removeLocationListener();
  }

  private void registerLocationListener() {
    // Unregister existing location listener if available.
    removeLocationListener();

    if (mRoadSnappedLocationProvider != null) {
      mLocationListener =
          new LocationListener() {
            @Override
            public void onLocationChanged(final Location location) {
              if (mIsListeningRoadSnappedLocation) {
                sendCommandToReactNative(
                    "onLocationChanged", ObjectTranslationUtil.getMapFromLocation(location));
              }
            }

            @Override
            public void onRawLocationUpdate(final Location location) {
              if (mIsListeningRoadSnappedLocation) {
                sendCommandToReactNative(
                    "onRawLocationChanged", ObjectTranslationUtil.getMapFromLocation(location));
              }
            }
          };

      mRoadSnappedLocationProvider.resetFreeNav();
      mRoadSnappedLocationProvider.addLocationListener(mLocationListener);
    }
  }

  private void removeLocationListener() {
    if (mRoadSnappedLocationProvider != null && mLocationListener != null) {
      mRoadSnappedLocationProvider.removeLocationListener(mLocationListener);
      mLocationListener = null;
    }
  }

  private void showNavInfo(NavInfo navInfo) {
    if (navInfo == null || reactContext == null) {
      return;
    }
    WritableMap map = Arguments.createMap();

    map.putInt("navState", navInfo.getNavState());
    map.putBoolean("routeChanged", navInfo.getRouteChanged());
    if (navInfo.getDistanceToCurrentStepMeters() != null)
      map.putInt("distanceToCurrentStepMeters", navInfo.getDistanceToCurrentStepMeters());
    if (navInfo.getDistanceToFinalDestinationMeters() != null)
      map.putInt("distanceToFinalDestinationMeters", navInfo.getDistanceToFinalDestinationMeters());
    if (navInfo.getDistanceToNextDestinationMeters() != null)
      map.putInt("distanceToNextDestinationMeters", navInfo.getDistanceToNextDestinationMeters());
    if (navInfo.getTimeToCurrentStepSeconds() != null)
      map.putInt("timeToCurrentStepSeconds", navInfo.getTimeToCurrentStepSeconds());
    if (navInfo.getTimeToFinalDestinationSeconds() != null)
      map.putInt("timeToFinalDestinationSeconds", navInfo.getTimeToFinalDestinationSeconds());
    if (navInfo.getTimeToNextDestinationSeconds() != null)
      map.putInt("timeToNextDestinationSeconds", navInfo.getTimeToNextDestinationSeconds());
    if (navInfo.getCurrentStep() != null)
      map.putMap("currentStep", ObjectTranslationUtil.getMapFromStepInfo(navInfo.getCurrentStep()));

    WritableArray remainingSteps = Arguments.createArray();
    if (navInfo.getRemainingSteps() != null) {
      for (StepInfo info : navInfo.getRemainingSteps()) {
        remainingSteps.pushMap(ObjectTranslationUtil.getMapFromStepInfo(info));
      }
    }
    map.putArray("getRemainingSteps", remainingSteps);

    WritableNativeArray params = new WritableNativeArray();
    params.pushMap(map);
    sendCommandToReactNative("onTurnByTurn", params);
  }

  @Override
  public void logDebugInfo(String info) {
    sendCommandToReactNative("logDebugInfo", info);
  }

  @Override
  public boolean canOverrideExistingModule() {
    return true;
  }

  @Override
  public void onHostResume() {
    // Re-register listeners on resume.
    if (mNavigator != null) {
      registerNavigationListeners();
      if (mIsListeningRoadSnappedLocation) {
        registerLocationListener();
      }
    }
  }

  @Override
  public void onHostPause() {}

  @Override
  public void onHostDestroy() {}
}
