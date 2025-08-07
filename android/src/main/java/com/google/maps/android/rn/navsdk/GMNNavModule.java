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

import android.app.Activity;
import android.location.Location;
import androidx.annotation.Nullable;
import androidx.lifecycle.LifecycleOwner;
import androidx.lifecycle.Observer;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.module.annotations.ReactModule;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.libraries.mapsplatform.turnbyturn.model.NavInfo;
import com.google.android.libraries.mapsplatform.turnbyturn.model.StepInfo;
import com.google.android.libraries.navigation.ArrivalEvent;
import com.google.android.libraries.navigation.ListenableResultFuture;
import com.google.android.libraries.navigation.NavigationApi;
import com.google.android.libraries.navigation.Navigator;
import com.google.android.libraries.navigation.RoadSnappedLocationProvider;
import com.google.android.libraries.navigation.RoadSnappedLocationProvider.LocationListener;
import com.google.android.libraries.navigation.RouteSegment;
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
import java.util.Objects;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * This exposes a series of methods that can be called diretly from the React Native code. They have
 * been implemented using promises as it's not recommended for them to be synchronous.
 */
@ReactModule(name = GMNNavModule.NAME)
public class GMNNavModule extends NativeNavModuleSpec
    implements IGMNNavigationCallback, LifecycleEventListener {
  private static GMNNavModule instance;
  private static ModuleReadyListener moduleReadyListener;

  ReactApplicationContext reactContext;
  private Navigator mNavigator;
  private final ArrayList<Waypoint> mWaypoints = new ArrayList<>();
  private RoadSnappedLocationProvider mRoadSnappedLocationProvider;
  private GMNNavViewManager mNavViewManager;
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

  public GMNNavModule(ReactApplicationContext reactContext, GMNNavViewManager navViewManager) {
    super(reactContext);
    setReactContext(reactContext);
    setViewManager(navViewManager);
  }

  public static synchronized GMNNavModule getInstance(
      ReactApplicationContext reactContext, GMNNavViewManager navViewManager) {
    if (instance == null) {
      instance = new GMNNavModule(reactContext, navViewManager);
    } else {
      instance.setReactContext(reactContext);
      instance.setViewManager(navViewManager);
    }
    if (moduleReadyListener != null) {
      moduleReadyListener.onModuleReady();
      moduleReadyListener = null;
    }
    return instance;
  }

  public static synchronized boolean hasInstance() {
    return instance != null;
  }

  public static synchronized GMNNavModule getInstance() {
    if (instance == null) {
      throw new IllegalStateException(NAME + " instance is null");
    }
    return instance;
  }

  public void setReactContext(ReactApplicationContext reactContext) {
    this.reactContext = reactContext;
    this.reactContext.addLifecycleEventListener(this);
  }

  public void setViewManager(GMNNavViewManager navViewManager) {
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

  @Override
  public void cleanup(Promise promise) {
    stopUpdatingLocation();
    removeNavigationListeners();
    mWaypoints.clear();

    for (NavigationReadyListener listener : mNavigationReadyListeners) {
      listener.onReady(false);
    }

    UiThreadUtil.runOnUiThread(
        () -> {
          mNavigator.clearDestinations();
          mNavigator.cleanup();
          promise.resolve(null);
        });
  }

  @Override
  public void initializeNavigator(
      ReadableMap tocParams, double taskRemovedBehaviourJsValue, Promise promise) {
    this.tocParamsMap = tocParams.toHashMap();
    this.taskRemovedBehaviour =
        GMNEnumTranslationUtil.getTaskRemovedBehaviourFromJsValue(
            (int) taskRemovedBehaviourJsValue);

    if (getTermsAccepted()) {
      initializeNavigationApi(promise);
    } else {
      this.showTermsAndConditionsDialogAndInitializeNavigationApi(promise);
    }

    // Observe live data for nav info updates.
    Observer<NavInfo> navInfoObserver = this::showNavInfo;

    UiThreadUtil.runOnUiThread(
        () -> {
          GMNNavInfoReceivingService.getNavInfoLiveData()
              .observe(
                  (LifecycleOwner) Objects.requireNonNull(getCurrentActivity()), navInfoObserver);
        });
  }

  private void onNavigationReady() {
    mNavViewManager.applyStylingOptions();

    emitOnNavigationReady();

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

  /** Starts the Navigation API, saving a reference to the ready Navigator instance. */
  private void initializeNavigationApi(Promise promise) {
    NavigationApi.getNavigator(
        Objects.requireNonNull(getCurrentActivity()).getApplication(),
        new NavigationApi.NavigatorListener() {
          @Override
          public void onNavigatorReady(Navigator navigator) {
            // Keep a reference to the Navigator (used to configure and start nav)
            mNavigator = navigator;
            mNavigator.setTaskRemovedBehavior(taskRemovedBehaviour);
            if (mRoadSnappedLocationProvider == null) {
              mRoadSnappedLocationProvider =
                  NavigationApi.getRoadSnappedLocationProvider(
                      Objects.requireNonNull(getCurrentActivity()).getApplication());
            }
            registerNavigationListeners();
            onNavigationReady();
            // 0: OK.
            promise.resolve(0);
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
              case NavigationApi.ErrorCode.LOCATION_PERMISSION_MISSING:
                errMsg = "Error loading Navigation API: Location permission is not granted";
                logDebugInfo(errMsg);
                break;
              default:
                errMsg = "Error loading Navigation API";
                logDebugInfo(errMsg);
            }

            promise.resolve(errorCode);
          }
        });
  }

  /** Enable turn by turn logging using background service */
  @ReactMethod
  public void setTurnByTurnLoggingEnabled(boolean isEnabled) {
    Activity activity = getCurrentActivity();
    if (activity != null) {
      if (isEnabled) {
        GMNNavForwardingManager.startNavForwarding(mNavigator, activity, this);
      } else {
        GMNNavForwardingManager.stopNavForwarding(mNavigator, activity, this);
      }
    }
  }

  /**
   * Registers a number of example event listeners that show an on screen message when certain
   * navigation events occur (e.g. the driver's route changes or the destination is reached).
   */
  private void registerNavigationListeners() {
    removeNavigationListeners();

    mArrivalListener =
        new Navigator.ArrivalListener() {
          @Override
          public void onArrival(ArrivalEvent arrivalEvent) {
            WritableMap map = Arguments.createMap();
            map.putMap(
                "waypoint",
                GMNObjectTranslationUtil.getMapFromWaypoint(arrivalEvent.getWaypoint()));
            map.putBoolean("isFinalDestination", arrivalEvent.isFinalDestination());

            emitOnArrival(map);
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
            emitOnRemainingTimeOrDistanceChanged();
          }
        };
    mNavigator.addRemainingTimeOrDistanceChangedListener(
        0, 0, mRemainingTimeOrDistanceChangedListener);
  }

  private void removeNavigationListeners() {
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

  private void createWaypoint(Map<String, Object> map) {
    String placeId = GMNCollectionUtil.getString("placeId", map);
    String title = GMNCollectionUtil.getString("title", map);

    Double lat = null;
    Double lng = null;

    if (map.containsKey("position")) {
      Map latlng = (Map) map.get("position");
      if (latlng.get("lat") != null) lat = Double.parseDouble(latlng.get("lat").toString());
      if (latlng.get("lng") != null) lng = Double.parseDouble(latlng.get("lng").toString());
    }

    boolean vehicleStopover = GMNCollectionUtil.getBool("vehicleStopover", map, false);
    boolean preferSameSideOfRoad = GMNCollectionUtil.getBool("preferSameSideOfRoad", map, false);

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
      Promise promise) {
    if (mNavigator == null) {
      promise.reject(GMNJsErrors.NO_NAVIGATOR_ERROR_CODE, GMNJsErrors.NO_NAVIGATOR_ERROR_MESSAGE);
      return;
    }

    mWaypoints.clear(); // reset waypoints

    // Set up a waypoint for each place that we want to go to.
    for (int i = 0; i < waypoints.size(); i++) {
      Map<String, Object> map = Objects.requireNonNull(waypoints.getMap(i)).toHashMap();
      createWaypoint(map);
    }

    ListenableResultFuture<Navigator.RouteStatus> pendingRoute;
    if (routingOptions != null) {
      if (displayOptions != null) {
        pendingRoute =
            mNavigator.setDestinations(
                mWaypoints,
                GMNObjectTranslationUtil.getRoutingOptionsFromMap(routingOptions.toHashMap()),
                GMNObjectTranslationUtil.getDisplayOptionsFromMap(displayOptions.toHashMap()));
      } else {
        pendingRoute =
            mNavigator.setDestinations(
                mWaypoints,
                GMNObjectTranslationUtil.getRoutingOptionsFromMap(routingOptions.toHashMap()));
      }
    } else {
      pendingRoute = mNavigator.setDestinations(mWaypoints);
    }

    pendingRoute.setOnResultListener(
        code -> {
          promise.resolve(code.ordinal());
        });
  }

  @Override
  public void clearDestinations(Promise promise) {
    if (mNavigator == null) {
      promise.reject(GMNJsErrors.NO_NAVIGATOR_ERROR_CODE, GMNJsErrors.NO_NAVIGATOR_ERROR_MESSAGE);
      return;
    }
    mWaypoints.clear(); // reset waypoints
    mNavigator.clearDestinations();
    promise.resolve(null);
  }

  @Override
  public void continueToNextDestination(Promise promise) {
    if (mNavigator == null) {
      promise.reject(GMNJsErrors.NO_NAVIGATOR_ERROR_CODE, GMNJsErrors.NO_NAVIGATOR_ERROR_MESSAGE);
      return;
    }

    mNavigator.continueToNextDestination();
    promise.resolve(null);
  }

  @Override
  public void startGuidance(Promise promise) {
    if (mWaypoints.isEmpty()) {
      promise.reject(
          GMNJsErrors.NO_WAYPOINTS_GUIDANCE_ERROR_CODE,
          GMNJsErrors.NO_WAYPOINTS_GUIDANCE_ERROR_MESSAGE);
    }

    if (mNavigator == null) {
      promise.reject(GMNJsErrors.NO_NAVIGATOR_ERROR_CODE, GMNJsErrors.NO_NAVIGATOR_ERROR_MESSAGE);
      return;
    }

    mNavigator.startGuidance();
    emitOnStartGuidance();
    promise.resolve(true);
  }

  @Override
  public void stopGuidance(Promise promise) {
    mNavigator.stopGuidance();
  }

  @Override
  public void simulateLocationsAlongExistingRoute(ReadableMap options, Promise promise) {
    if (mWaypoints.isEmpty()) {
      return;
    }

    mNavigator
        .getSimulator()
        .simulateLocationsAlongExistingRoute(
            new SimulationOptions().speedMultiplier((float) options.getDouble("speedMultiplier")));
    promise.resolve(true);
  }

  @Override
  public void stopLocationSimulation(Promise promise) {
    mNavigator.getSimulator().unsetUserLocation();
    promise.resolve(null);
  }

  @Override
  public void pauseLocationSimulation(Promise promise) {
    mNavigator.getSimulator().pause();
    promise.resolve(null);
  }

  @Override
  public void resumeLocationSimulation(Promise promise) {
    mNavigator.getSimulator().resume();
    promise.resolve(null);
  }

  @Override
  public void setAbnormalTerminatingReportingEnabled(boolean isOn) {
    NavigationApi.setAbnormalTerminationReportingEnabled(isOn);
  }

  @Override
  public void setAudioGuidanceType(double index, Promise promise) {
    if (mNavigator == null) {
      promise.reject(GMNJsErrors.NO_NAVIGATOR_ERROR_CODE, GMNJsErrors.NO_NAVIGATOR_ERROR_MESSAGE);
      return;
    }

    UiThreadUtil.runOnUiThread(
        () -> {
          mNavigator.setAudioGuidance(
              GMNEnumTranslationUtil.getAudioGuidanceFromJsValue((int) index));
          promise.resolve(null);
        });
  }

  @Override
  public void setSpeedAlertOptions(@Nullable ReadableMap options, Promise promise) {
    if (options == null) {
      mNavigator.setSpeedAlertOptions(null);
      return;
    }

    HashMap<String, Object> optionsMap = options.toHashMap();

    float minorThresholdPercentage =
        (float) GMNCollectionUtil.getDouble("minorSpeedAlertPercentThreshold", optionsMap, -1);
    float majorThresholdPercentage =
        (float) GMNCollectionUtil.getDouble("majorSpeedAlertPercentThreshold", optionsMap, -1);
    float severityUpgradeDurationSeconds =
        (float) GMNCollectionUtil.getDouble("severityUpgradeDurationSeconds", optionsMap, -1);

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

  @Override
  public void setBackgroundLocationUpdatesEnabled(boolean isEnabled) {
    // iOS only API method.
  }

  @Override
  public void getCurrentTimeAndDistance(final Promise promise) {
    if (mNavigator == null) {
      promise.reject(GMNJsErrors.NO_NAVIGATOR_ERROR_CODE, GMNJsErrors.NO_NAVIGATOR_ERROR_MESSAGE);
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
      promise.reject(GMNJsErrors.NO_NAVIGATOR_ERROR_CODE, GMNJsErrors.NO_NAVIGATOR_ERROR_MESSAGE);
      return;
    }

    RouteSegment routeSegment = mNavigator.getCurrentRouteSegment();

    if (routeSegment == null) {
      promise.resolve(null);
      return;
    }

    promise.resolve(GMNObjectTranslationUtil.getMapFromRouteSegment(routeSegment));
  }

  @Override
  public void getRouteSegments(final Promise promise) {
    if (mNavigator == null) {
      promise.reject(GMNJsErrors.NO_NAVIGATOR_ERROR_CODE, GMNJsErrors.NO_NAVIGATOR_ERROR_MESSAGE);
      return;
    }

    List<RouteSegment> routeSegmentList = mNavigator.getRouteSegments();
    WritableArray arr = Arguments.createArray();

    for (RouteSegment segment : routeSegmentList) {
      arr.pushMap(GMNObjectTranslationUtil.getMapFromRouteSegment(segment));
    }

    promise.resolve(arr);
  }

  @Override
  public void getTraveledPath(final Promise promise) {
    if (mNavigator == null) {
      promise.reject(GMNJsErrors.NO_NAVIGATOR_ERROR_CODE, GMNJsErrors.NO_NAVIGATOR_ERROR_MESSAGE);
      return;
    }

    WritableArray arr = Arguments.createArray();

    for (LatLng latLng : mNavigator.getTraveledRoute()) {
      arr.pushMap(GMNObjectTranslationUtil.getMapFromLatLng(latLng));
    }

    promise.resolve(arr);
  }

  @Override
  public void simulateLocation(ReadableMap location, Promise promise) {
    if (mNavigator == null) {
      promise.reject(GMNJsErrors.NO_NAVIGATOR_ERROR_CODE, GMNJsErrors.NO_NAVIGATOR_ERROR_MESSAGE);
      return;
    }

    HashMap<String, Object> locationMap = location.toHashMap();
    double lat = GMNCollectionUtil.getDouble("lat", locationMap, 0);
    double lng = GMNCollectionUtil.getDouble("lng", locationMap, 0);
    mNavigator.getSimulator().setUserLocation(new LatLng(lat, lng));
    promise.resolve(null);
  }

  private void showTermsAndConditionsDialogAndInitializeNavigationApi(Promise promise) {
    assert tocParamsMap != null;
    Activity activity = getCurrentActivity();
    if (activity == null) {
      promise.reject(GMNJsErrors.NO_ACTIVITY_ERROR_CODE, GMNJsErrors.NO_ACTIVITY_ERROR_MESSAGE);
      return;
    }
    String companyName = GMNCollectionUtil.getString("companyName", this.tocParamsMap);
    String title = GMNCollectionUtil.getString("title", this.tocParamsMap);
    boolean showOnlyDisclaimer =
        GMNCollectionUtil.getBool("showOnlyDisclaimer", this.tocParamsMap, false);

    TermsAndConditionsCheckOption tosOption =
        showOnlyDisclaimer
            ? TermsAndConditionsCheckOption.SKIPPED
            : TermsAndConditionsCheckOption.ENABLED;

    NavigationApi.showTermsAndConditionsDialog(
        getCurrentActivity(),
        companyName,
        title,
        null,
        areTermsAccepted -> {
          if (areTermsAccepted) {
            initializeNavigationApi(promise);
          } else {
            promise.resolve(NavigationApi.ErrorCode.TERMS_NOT_ACCEPTED);
          }
        },
        tosOption);
  }

  @Override
  public void areTermsAccepted(final Promise promise) {
    promise.resolve(getTermsAccepted());
  }

  public Boolean getTermsAccepted() {
    return NavigationApi.areTermsAccepted(
        Objects.requireNonNull(getCurrentActivity()).getApplication());
  }

  @Override
  public void getNavSDKVersion(final Promise promise) {
    promise.resolve(NavigationApi.getNavSDKVersion());
  }

  @Override
  public void resetTermsAccepted() {
    NavigationApi.resetTermsAccepted(Objects.requireNonNull(getCurrentActivity()).getApplication());
  }

  @Override
  public void startUpdatingLocation(Promise promise) {
    registerLocationListener();
    mIsListeningRoadSnappedLocation = true;
    promise.resolve(null);
  }

  private void stopUpdatingLocation() {
    mIsListeningRoadSnappedLocation = false;
    removeLocationListener();
  }

  @Override
  public void stopUpdatingLocation(Promise promise) {
    stopUpdatingLocation();
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
                WritableMap locationMap = GMNObjectTranslationUtil.getMapFromLocation(location);
                emitOnLocationChanged(locationMap);
              }
            }

            @Override
            public void onRawLocationUpdate(final Location location) {
              if (mIsListeningRoadSnappedLocation) {
                WritableMap locationMap = GMNObjectTranslationUtil.getMapFromLocation(location);
                emitOnRawLocationChanged(locationMap);
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
      map.putMap(
          "currentStep", GMNObjectTranslationUtil.getMapFromStepInfo(navInfo.getCurrentStep()));

    WritableArray remainingSteps = Arguments.createArray();
    if (navInfo.getRemainingSteps() != null) {
      for (StepInfo info : navInfo.getRemainingSteps()) {
        remainingSteps.pushMap(GMNObjectTranslationUtil.getMapFromStepInfo(info));
      }
    }
    map.putArray("getRemainingSteps", remainingSteps);

    emitOnTurnByTurn(map);
  }

  @Override
  public void logDebugInfo(String info) {
    WritableMap map = Arguments.createMap();
    map.putString("message", info);
    emitLogDebugInfo(map);
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
