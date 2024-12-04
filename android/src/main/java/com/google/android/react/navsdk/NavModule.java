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

import android.location.Location;
import androidx.annotation.Nullable;
import androidx.lifecycle.LifecycleOwner;
import androidx.lifecycle.Observer;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.CatalystInstance;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.NativeArray;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.libraries.mapsplatform.turnbyturn.model.NavInfo;
import com.google.android.libraries.mapsplatform.turnbyturn.model.StepInfo;
import com.google.android.libraries.navigation.ArrivalEvent;
import com.google.android.libraries.navigation.ListenableResultFuture;
import com.google.android.libraries.navigation.NavigationApi;
import com.google.android.libraries.navigation.NavigationApi.OnTermsResponseListener;
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
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * This exposes a series of methods that can be called diretly from the React Native code. They have
 * been implemented using promises as it's not recommended for them to be synchronous.
 */
public class NavModule extends ReactContextBaseJavaModule
    implements INavigationCallback, LifecycleEventListener {
  public static final String REACT_CLASS = "NavModule";
  private static final String TAG = "NavModule";
  private static NavModule instance;
  private static ModuleReadyListener moduleReadyListener;

  ReactApplicationContext reactContext;
  private Navigator mNavigator;
  private ArrayList<Waypoint> mWaypoints = new ArrayList<>();
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

  @Override
  public String getName() {
    return REACT_CLASS;
  }

  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    return constants;
  }

  @ReactMethod
  private void cleanup() {
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
          NavInfoReceivingService.getNavInfoLiveData()
              .observe((LifecycleOwner) getCurrentActivity(), navInfoObserver);
        });
  }

  private void onNavigationReady() {
    mNavViewManager.applyStylingOptions();

    sendCommandToReactNative("onNavigationReady", (NativeArray) null);

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
    NavigationApi.getNavigator(
        getCurrentActivity().getApplication(),
        new NavigationApi.NavigatorListener() {
          @Override
          public void onNavigatorReady(Navigator navigator) {
            // Keep a reference to the Navigator (used to configure and start nav)
            mNavigator = navigator;
            mNavigator.setTaskRemovedBehavior(taskRemovedBehaviour);
            if (mRoadSnappedLocationProvider == null) {
              mRoadSnappedLocationProvider =
                  NavigationApi.getRoadSnappedLocationProvider(
                      getCurrentActivity().getApplication());
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
    if (isEnabled) {
      NavForwardingManager.startNavForwarding(mNavigator, getCurrentActivity(), this);
    } else {
      NavForwardingManager.stopNavForwarding(mNavigator, getCurrentActivity(), this);
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
            sendCommandToReactNative("onRouteChanged", (NativeArray) null);
          }
        };
    mNavigator.addRouteChangedListener(mRouteChangedListener);

    mTrafficUpdatedListener =
        new Navigator.TrafficUpdatedListener() {
          @Override
          public void onTrafficUpdated() {
            sendCommandToReactNative("onTrafficUpdated", (NativeArray) null);
          }
        };
    mNavigator.addTrafficUpdatedListener(mTrafficUpdatedListener);

    mReroutingListener =
        new Navigator.ReroutingListener() {
          @Override
          public void onReroutingRequestedByOffRoute() {
            sendCommandToReactNative("onReroutingRequestedByOffRoute", (NativeArray) null);
          }
        };
    mNavigator.addReroutingListener(mReroutingListener);

    mRemainingTimeOrDistanceChangedListener =
        new Navigator.RemainingTimeOrDistanceChangedListener() {
          @Override
          public void onRemainingTimeOrDistanceChanged() {
            sendCommandToReactNative("onRemainingTimeOrDistanceChanged", (NativeArray) null);
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

  private void createWaypoint(Map map) {
    String placeId = CollectionUtil.getString("placeId", map);
    String title = CollectionUtil.getString("title", map);

    Double lat = null;
    Double lng = null;

    if (map.containsKey("position")) {
      Map latlng = (Map) map.get("position");
      if (latlng.get("lat") != null) lat = Double.parseDouble(latlng.get("lat").toString());
      if (latlng.get("lng") != null) lng = Double.parseDouble(latlng.get("lng").toString());
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
  public void setDestination(
      ReadableMap waypoint,
      @Nullable ReadableMap routingOptions,
      @Nullable ReadableMap displayOptions) {
    WritableArray array = new WritableNativeArray();
    array.pushMap(waypoint);
    setDestinations(array, routingOptions, displayOptions);
  }

  @ReactMethod
  public void setDestinations(
      ReadableArray waypoints,
      @Nullable ReadableMap routingOptions,
      @Nullable ReadableMap displayOptions) {
    if (mNavigator == null) {
      // TODO: HANDLE THIS
      return;
    }

    pendingRoute = null; // reset pendingRoute.
    mWaypoints.clear(); // reset waypoints

    // Set up a waypoint for each place that we want to go to.
    for (int i = 0; i < waypoints.size(); i++) {
      Map map = waypoints.getMap(i).toHashMap();
      createWaypoint(map);
    }

    if (routingOptions != null) {
      if (displayOptions != null) {
        pendingRoute =
            mNavigator.setDestinations(
                mWaypoints,
                ObjectTranslationUtil.getRoutingOptionsFromMap(routingOptions.toHashMap()),
                ObjectTranslationUtil.getDisplayOptionsFromMap(displayOptions.toHashMap()));
      } else {
        pendingRoute =
            mNavigator.setDestinations(
                mWaypoints,
                ObjectTranslationUtil.getRoutingOptionsFromMap(routingOptions.toHashMap()));
      }
    } else {
      pendingRoute = mNavigator.setDestinations(mWaypoints);
    }

    setOnResultListener(
        new IRouteStatusResult() {
          @Override
          public void onResult(Navigator.RouteStatus code) {
            sendCommandToReactNative("onRouteStatusResult", code.toString());
          }
        });
  }

  @ReactMethod
  public void clearDestinations() {
    if (mNavigator != null) {
      mWaypoints.clear(); // reset waypoints
      mNavigator.clearDestinations();
    }
  }

  @ReactMethod
  public void continueToNextDestination() {
    if (mNavigator != null) {
      mNavigator.continueToNextDestination();
    }
  }

  private void setOnResultListener(IRouteStatusResult listener) {
    // Set an action to perform when a route is determined to the destination
    if (pendingRoute != null)
      pendingRoute.setOnResultListener(
          new ListenableResultFuture.OnResultListener<Navigator.RouteStatus>() {
            @Override
            public void onResult(Navigator.RouteStatus code) {
              listener.onResult(code);
            }
          });
  }

  @ReactMethod
  public void startGuidance() {
    if (mWaypoints.isEmpty()) {
      return;
    }

    mNavigator.startGuidance();
    sendCommandToReactNative("onStartGuidance", (NativeArray) null);
  }

  @ReactMethod
  public void stopGuidance() {
    mNavigator.stopGuidance();
  }

  @ReactMethod
  public void simulateLocationsAlongExistingRoute(float speedMultiplier) {
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
    mNavigator.getSimulator().unsetUserLocation();
  }

  @ReactMethod
  public void pauseLocationSimulation() {
    mNavigator.getSimulator().pause();
  }

  @ReactMethod
  public void resumeLocationSimulation() {
    mNavigator.getSimulator().resume();
  }

  @ReactMethod
  public void setAbnormalTerminatingReportingEnabled(boolean isOn) {
    NavigationApi.setAbnormalTerminationReportingEnabled(isOn);
  }

  @ReactMethod
  public void setSpeedAlertOptions(@Nullable ReadableMap options) {
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

  /** Send command to react native with string param. */
  private void sendCommandToReactNative(String functionName, String stringParam) {
    WritableNativeArray params = new WritableNativeArray();

    if (stringParam != null) {
      params.pushString("" + stringParam);
    }
    sendCommandToReactNative(functionName, params);
  }

  /** Send command to react native. */
  private void sendCommandToReactNative(String functionName, NativeArray params) {
    ReactContext reactContext = getReactApplicationContext();

    if (reactContext != null) {
      CatalystInstance catalystInstance = reactContext.getCatalystInstance();
      catalystInstance.callFunction(Constants.NAV_JAVASCRIPT_FLAG, functionName, params);
    }
  }

  @ReactMethod
  public void simulateLocation(ReadableMap location) {
    if (mNavigator != null) {
      HashMap<String, Object> locationMap = location.toHashMap();
      Double lat = CollectionUtil.getDouble("lat", locationMap, 0);
      Double lng = CollectionUtil.getDouble("lng", locationMap, 0);
      mNavigator.getSimulator().setUserLocation(new LatLng(lat, lng));
    }
  }

  @ReactMethod
  private void showTermsAndConditionsDialog() {
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
        getCurrentActivity(),
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
    return NavigationApi.areTermsAccepted(getCurrentActivity().getApplication());
  }

  @ReactMethod
  public void getNavSDKVersion(final Promise promise) {
    promise.resolve(NavigationApi.getNavSDKVersion());
  }

  @ReactMethod
  public void resetTermsAccepted() {
    NavigationApi.resetTermsAccepted(getCurrentActivity().getApplication());
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
                WritableNativeArray params = new WritableNativeArray();
                params.pushMap(ObjectTranslationUtil.getMapFromLocation(location));

                sendCommandToReactNative("onLocationChanged", params);
              }
            }

            @Override
            public void onRawLocationUpdate(final Location location) {
              if (mIsListeningRoadSnappedLocation) {
                WritableNativeArray params = new WritableNativeArray();
                params.pushMap(ObjectTranslationUtil.getMapFromLocation(location));

                sendCommandToReactNative("onRawLocationChanged", params);
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

  private interface IRouteStatusResult {
    void onResult(Navigator.RouteStatus code);
  }
}
