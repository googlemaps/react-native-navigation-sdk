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
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
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
import com.google.android.libraries.navigation.TermsAndConditionsUIParams;
import com.google.android.libraries.navigation.TimeAndDistance;
import com.google.android.libraries.navigation.Waypoint;
import com.google.maps.android.rn.navsdk.NativeNavModuleSpec;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * TurboModule for navigation controller operations. Manages navigation sessions, routing, guidance,
 * and location tracking.
 */
public class NavModule extends NativeNavModuleSpec
    implements INavigationCallback, LifecycleEventListener {
  public static final String REACT_CLASS = NAME;
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

  private @Navigator.TaskRemovedBehavior int taskRemovedBehaviour =
      Navigator.TaskRemovedBehavior.CONTINUE_SERVICE;
  private Promise pendingInitPromise;

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

  /**
   * Checks if the NavModule instance exists and has an active React context. Use this to safely
   * check before calling getInstance() to avoid crashes when React Native hasn't initialized yet.
   */
  public static synchronized boolean isInstanceReady() {
    return instance != null
        && instance.reactContext != null
        && instance.reactContext.hasActiveReactInstance();
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
    // Only trigger callback if instance exists AND has an active React context
    if (instance != null && moduleReadyListener != null && isInstanceReady()) {
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

  @Override
  public void cleanup(final Promise promise) {
    if (!ensureNavigatorAvailable(promise)) {
      return;
    }

    mIsListeningRoadSnappedLocation = false;
    removeLocationListener();
    removeNavigationListeners();
    mWaypoints.clear();

    for (NavigationReadyListener listener : mNavigationReadyListeners) {
      listener.onReady(false);
    }

    final Navigator navigator = mNavigator;
    UiThreadUtil.runOnUiThread(
        () -> {
          navigator.clearDestinations();
          navigator.stopGuidance();
          navigator.getSimulator().unsetUserLocation();
          promise.resolve(true);
        });
  }

  @Override
  public void showTermsAndConditionsDialog(
      String title,
      String companyName,
      boolean showOnlyDisclaimer,
      @Nullable ReadableMap uiParams,
      Promise promise) {
    final Activity currentActivity = getReactApplicationContext().getCurrentActivity();
    if (currentActivity == null) {
      promise.reject("noActivity", "No activity available to show the dialog");
      return;
    }

    // If terms already accepted, return true immediately
    if (getTermsAccepted()) {
      promise.resolve(true);
      return;
    }

    TermsAndConditionsCheckOption tosOption =
        showOnlyDisclaimer
            ? TermsAndConditionsCheckOption.SKIPPED
            : TermsAndConditionsCheckOption.ENABLED;

    // Build UI params if provided and valid
    TermsAndConditionsUIParams termsUiParams = null;
    if (uiParams != null && uiParams.hasKey("valid") && uiParams.getBoolean("valid")) {
      TermsAndConditionsUIParams.Builder uiParamsBuilder = TermsAndConditionsUIParams.builder();

      if (uiParams.hasKey("backgroundColor")) {
        Integer bgColor = (int) uiParams.getDouble("backgroundColor");
        uiParamsBuilder.setBackgroundColor(bgColor);
      }
      if (uiParams.hasKey("titleColor")) {
        Integer titleColor = (int) uiParams.getDouble("titleColor");
        uiParamsBuilder.setTitleColor(titleColor);
      }
      if (uiParams.hasKey("mainTextColor")) {
        Integer mainColor = (int) uiParams.getDouble("mainTextColor");
        uiParamsBuilder.setMainTextColor(mainColor);
      }
      if (uiParams.hasKey("acceptButtonTextColor")) {
        Integer acceptColor = (int) uiParams.getDouble("acceptButtonTextColor");
        uiParamsBuilder.setAcceptButtonTextColor(acceptColor);
      }
      if (uiParams.hasKey("cancelButtonTextColor")) {
        Integer cancelColor = (int) uiParams.getDouble("cancelButtonTextColor");
        uiParamsBuilder.setCancelButtonTextColor(cancelColor);
      }

      termsUiParams = uiParamsBuilder.build();
    }

    NavigationApi.showTermsAndConditionsDialog(
        currentActivity,
        companyName,
        title,
        termsUiParams,
        new OnTermsResponseListener() {
          @Override
          public void onTermsResponse(boolean areTermsAccepted) {
            promise.resolve(areTermsAccepted);
          }
        },
        tosOption);
  }

  @Override
  public void initializeNavigationSession(
      boolean abnormalTerminationReportingEnabled, double taskRemovedBehavior, Promise promise) {
    // Check if terms are accepted first
    if (!getTermsAccepted()) {
      promise.reject(
          "termsNotAccepted",
          "The session initialization failed, because the user has not yet accepted the navigation"
              + " terms and conditions.");
      return;
    }

    // Store the promise to resolve/reject when navigation is ready or fails
    this.pendingInitPromise = promise;
    this.taskRemovedBehaviour =
        EnumTranslationUtil.getTaskRemovedBehaviourFromJsValue((int) taskRemovedBehavior);

    // Set abnormal termination reporting
    NavigationApi.setAbnormalTerminationReportingEnabled(abnormalTerminationReportingEnabled);

    // Initialize the navigation API
    initializeNavigationApi();

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

    for (NavigationReadyListener listener : mNavigationReadyListeners) {
      listener.onReady(true);
    }

    // Resolve the pending init promise
    if (pendingInitPromise != null) {
      pendingInitPromise.resolve(null);
      pendingInitPromise = null;
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
    // Reject the pending init promise with the appropriate error
    if (pendingInitPromise != null) {
      String errorCodeStr;
      String errorMessage;
      switch (errorCode) {
        case NavigationApi.ErrorCode.NOT_AUTHORIZED:
          errorCodeStr = "notAuthorized";
          errorMessage =
              "Your API key is invalid or not authorized to use Navigation. You may need to"
                  + " request provisioning of the Navigation SDK through your Google Maps APIs"
                  + " representative.";
          break;
        case NavigationApi.ErrorCode.TERMS_NOT_ACCEPTED:
          errorCodeStr = "termsNotAccepted";
          errorMessage = "User did not accept the Navigation Terms of Use.";
          break;
        case NavigationApi.ErrorCode.NETWORK_ERROR:
          errorCodeStr = "networkError";
          errorMessage = "Network error occurred while loading Navigation API.";
          break;
        default:
          errorCodeStr = "locationPermissionMissing";
          errorMessage = "Location permission is not granted.";
      }
      pendingInitPromise.reject(errorCodeStr, errorMessage);
      pendingInitPromise = null;
    }
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
  @Override
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

  @Override
  public void setBackgroundLocationUpdatesEnabled(boolean isEnabled) {
    // Background location updates configuration
    // This is a placeholder for background location tracking configuration
    // Implementation depends on the specific requirements for background location
    // tracking
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
            WritableMap arrivalEventMap = Arguments.createMap();
            arrivalEventMap.putMap(
                "waypoint", ObjectTranslationUtil.getMapFromWaypoint(arrivalEvent.getWaypoint()));
            arrivalEventMap.putBoolean("isFinalDestination", arrivalEvent.isFinalDestination());

            WritableMap params = Arguments.createMap();
            params.putMap("arrivalEvent", arrivalEventMap);

            emitOnArrival(params);
          }
        };
    mNavigator.addArrivalListener(mArrivalListener);

    mRouteChangedListener =
        new Navigator.RouteChangedListener() {
          @Override
          public void onRouteChanged() {
            emitOnRouteChanged();
          }
        };
    mNavigator.addRouteChangedListener(mRouteChangedListener);

    mTrafficUpdatedListener =
        new Navigator.TrafficUpdatedListener() {
          @Override
          public void onTrafficUpdated() {
            emitOnTrafficUpdated();
          }
        };
    mNavigator.addTrafficUpdatedListener(mTrafficUpdatedListener);

    mReroutingListener =
        new Navigator.ReroutingListener() {
          @Override
          public void onReroutingRequestedByOffRoute() {
            emitOnReroutingRequestedByOffRoute();
          }
        };
    mNavigator.addReroutingListener(mReroutingListener);

    mRemainingTimeOrDistanceChangedListener =
        new Navigator.RemainingTimeOrDistanceChangedListener() {
          @Override
          public void onRemainingTimeOrDistanceChanged() {
            TimeAndDistance timeAndDistance = mNavigator.getCurrentTimeAndDistance();
            if (timeAndDistance != null) {
              WritableMap timeAndDistanceMap = Arguments.createMap();
              timeAndDistanceMap.putInt("delaySeverity", timeAndDistance.getDelaySeverity());
              timeAndDistanceMap.putInt("meters", timeAndDistance.getMeters());
              timeAndDistanceMap.putInt("seconds", timeAndDistance.getSeconds());

              WritableMap params = Arguments.createMap();
              params.putMap("timeAndDistance", timeAndDistanceMap);

              emitOnRemainingTimeOrDistanceChanged(params);
            }
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

  @Override
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

    // Check valid flag for codegen nullable objects pattern
    boolean hasValidDisplayOptions =
        displayOptions != null
            && displayOptions.hasKey("valid")
            && displayOptions.getBoolean("valid");
    boolean hasValidRouteTokenOptions =
        routeTokenOptions != null
            && routeTokenOptions.hasKey("valid")
            && routeTokenOptions.getBoolean("valid");
    boolean hasValidRoutingOptions =
        routingOptions != null
            && routingOptions.hasKey("valid")
            && routingOptions.getBoolean("valid");

    // Get display options if provided
    DisplayOptions parsedDisplayOptions =
        hasValidDisplayOptions
            ? ObjectTranslationUtil.getDisplayOptionsFromMap(displayOptions.toHashMap())
            : null;

    // If route token options are provided, use CustomRoutesOptions
    if (hasValidRouteTokenOptions) {
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
    } else if (hasValidRoutingOptions) {
      RoutingOptions parsedRoutingOptions =
          ObjectTranslationUtil.getRoutingOptionsFromMap(routingOptions.toHashMap());

      if (parsedDisplayOptions != null) {
        pendingRoute =
            mNavigator.setDestinations(mWaypoints, parsedRoutingOptions, parsedDisplayOptions);
      } else {
        pendingRoute = mNavigator.setDestinations(mWaypoints, parsedRoutingOptions);
      }
    } else if (parsedDisplayOptions != null) {
      // No routing options provided: use defaults, but still honor display options if supplied.
      pendingRoute =
          mNavigator.setDestinations(mWaypoints, new RoutingOptions(), parsedDisplayOptions);
    } else {
      pendingRoute = mNavigator.setDestinations(mWaypoints);
    }

    if (pendingRoute != null) {
      // Set an action to perform when a route is determined to the destination
      pendingRoute.setOnResultListener(
          code -> {
            // Convert RouteStatus to string matching codegen RouteStatusSpec
            promise.resolve(EnumTranslationUtil.getRouteStatusStringValue(code));
          });
    } else {
      // If no pending route, resolve with OK status
      promise.resolve(EnumTranslationUtil.getRouteStatusStringValue(Navigator.RouteStatus.OK));
    }
  }

  @Override
  public void clearDestinations(final Promise promise) {
    if (!ensureNavigatorAvailable(promise)) {
      return;
    }
    mWaypoints.clear(); // reset waypoints
    mNavigator.clearDestinations();
    promise.resolve(true);
  }

  @Override
  public void continueToNextDestination(final Promise promise) {
    if (!ensureNavigatorAvailable(promise)) {
      return;
    }
    mNavigator.continueToNextDestination();
    promise.resolve(true);
  }

  @Override
  public void startGuidance(final Promise promise) {
    if (!ensureNavigatorAvailable(promise)) {
      return;
    }
    if (mWaypoints.isEmpty()) {
      promise.reject(JsErrors.NO_DESTINATIONS_ERROR_CODE, JsErrors.NO_DESTINATIONS_ERROR_MESSAGE);
      return;
    }

    mNavigator.startGuidance();
    emitOnStartGuidance();
    promise.resolve(true);
  }

  @Override
  public void stopGuidance(final Promise promise) {
    if (!ensureNavigatorAvailable(promise)) {
      return;
    }
    mNavigator.stopGuidance();
    promise.resolve(true);
  }

  @Override
  public void simulateLocationsAlongExistingRoute(ReadableMap options, final Promise promise) {
    float speedMultiplier =
        options.hasKey("speedMultiplier") ? (float) options.getDouble("speedMultiplier") : 1.0f;
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
    promise.resolve(null);
  }

  @Override
  public void stopLocationSimulation(final Promise promise) {
    if (mNavigator == null) {
      promise.reject(JsErrors.NO_NAVIGATOR_ERROR_CODE, JsErrors.NO_NAVIGATOR_ERROR_MESSAGE);
      return;
    }
    mNavigator.getSimulator().unsetUserLocation();
    promise.resolve(null);
  }

  @Override
  public void pauseLocationSimulation(final Promise promise) {
    if (mNavigator == null) {
      promise.reject(JsErrors.NO_NAVIGATOR_ERROR_CODE, JsErrors.NO_NAVIGATOR_ERROR_MESSAGE);
      return;
    }
    mNavigator.getSimulator().pause();
    promise.resolve(null);
  }

  @Override
  public void resumeLocationSimulation(final Promise promise) {
    if (mNavigator == null) {
      promise.reject(JsErrors.NO_NAVIGATOR_ERROR_CODE, JsErrors.NO_NAVIGATOR_ERROR_MESSAGE);
      return;
    }
    mNavigator.getSimulator().resume();
    promise.resolve(null);
  }

  @Override
  public void setAbnormalTerminatingReportingEnabled(boolean enabled) {
    NavigationApi.setAbnormalTerminationReportingEnabled(enabled);
  }

  @Override
  public void setSpeedAlertOptions(@Nullable ReadableMap options, final Promise promise) {
    if (mNavigator == null) {
      promise.reject(JsErrors.NO_NAVIGATOR_ERROR_CODE, JsErrors.NO_NAVIGATOR_ERROR_MESSAGE);
      return;
    }
    // Check if valid options were provided (valid flag pattern for codegen nullable objects)
    if (options == null || !options.hasKey("valid") || !options.getBoolean("valid")) {
      mNavigator.setSpeedAlertOptions(null);
      promise.resolve(null);
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
    promise.resolve(null);
  }

  @Override
  public void setAudioGuidanceType(double index, final Promise promise) {
    int jsValue = (int) index;
    if (mNavigator == null) {
      promise.reject(JsErrors.NO_NAVIGATOR_ERROR_CODE, JsErrors.NO_NAVIGATOR_ERROR_MESSAGE);
      return;
    }

    UiThreadUtil.runOnUiThread(
        () -> {
          mNavigator.setAudioGuidance(EnumTranslationUtil.getAudioGuidanceFromJsValue(jsValue));
        });
    promise.resolve(null);
  }

  @Override
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

  @Override
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

  @Override
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

  @Override
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

  private boolean ensureNavigatorAvailable(final Promise promise) {
    if (mNavigator == null) {
      promise.reject(JsErrors.NO_NAVIGATOR_ERROR_CODE, JsErrors.NO_NAVIGATOR_ERROR_MESSAGE);
      return false;
    }
    return true;
  }

  @Override
  public void simulateLocation(ReadableMap location, final Promise promise) {
    if (mNavigator != null) {
      HashMap<String, Object> locationMap = location.toHashMap();
      Double lat = CollectionUtil.getDouble(Constants.LAT_FIELD_KEY, locationMap, 0);
      Double lng = CollectionUtil.getDouble(Constants.LNG_FIELD_KEY, locationMap, 0);
      mNavigator.getSimulator().setUserLocation(new LatLng(lat, lng));
      promise.resolve(null);
    } else {
      promise.reject(JsErrors.NO_NAVIGATOR_ERROR_CODE, JsErrors.NO_NAVIGATOR_ERROR_MESSAGE);
    }
  }

  @Override
  public void areTermsAccepted(final Promise promise) {
    promise.resolve(getTermsAccepted());
  }

  public Boolean getTermsAccepted() {
    final Activity currentActivity = getReactApplicationContext().getCurrentActivity();
    if (currentActivity == null) return false;
    return NavigationApi.areTermsAccepted(currentActivity.getApplication());
  }

  @Override
  public void getNavSDKVersion(final Promise promise) {
    promise.resolve(NavigationApi.getNavSDKVersion());
  }

  @Override
  public void resetTermsAccepted(final Promise promise) {
    final Activity currentActivity = getReactApplicationContext().getCurrentActivity();
    if (currentActivity == null) {
      promise.reject("noActivity", "No activity available");
      return;
    }

    // The NavigationApi will throw IllegalStateException if a session is still active.
    try {
      NavigationApi.resetTermsAccepted(currentActivity.getApplication());
      promise.resolve(null);
    } catch (IllegalStateException e) {
      promise.reject(
          "termsResetNotAllowed",
          "The terms acceptance cannot be reset after navigation session is initialized.",
          e);
    }
  }

  @Override
  public void startUpdatingLocation(final Promise promise) {
    registerLocationListener();
    mIsListeningRoadSnappedLocation = true;
    promise.resolve(null);
  }

  @Override
  public void stopUpdatingLocation(final Promise promise) {
    mIsListeningRoadSnappedLocation = false;
    removeLocationListener();
    promise.resolve(null);
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
                WritableMap params = Arguments.createMap();
                params.putMap("location", ObjectTranslationUtil.getMapFromLocation(location));
                emitOnLocationChanged(params);
              }
            }

            @Override
            public void onRawLocationUpdate(final Location location) {
              if (mIsListeningRoadSnappedLocation) {
                WritableMap params = Arguments.createMap();
                params.putMap("location", ObjectTranslationUtil.getMapFromLocation(location));
                emitOnRawLocationChanged(params);
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

    WritableArray turnByTurnEvents = Arguments.createArray();
    turnByTurnEvents.pushMap(map);
    WritableMap params = Arguments.createMap();
    params.putArray("turnByTurnEvents", turnByTurnEvents);
    emitOnTurnByTurn(params);
  }

  @Override
  public void logDebugInfo(String info) {
    WritableMap params = Arguments.createMap();
    params.putString("message", info);
    emitLogDebugInfo(params);
  }

  @Override
  public boolean canOverrideExistingModule() {
    return true;
  }

  @Override
  public void onHostResume() {
    // When React context resumes, trigger the module ready listener if it was set
    // before the React context was ready (e.g., Android Auto was already running).
    // Clear it after calling to avoid duplicate calls on subsequent resumes.
    if (moduleReadyListener != null) {
      ModuleReadyListener listener = moduleReadyListener;
      moduleReadyListener = null;
      listener.onModuleReady();
    }

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
