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

import static com.google.android.react.navsdk.Command.ANIMATE_CAMERA;
import static com.google.android.react.navsdk.Command.SET_FOLLOWING_PERSPECTIVE;
import static com.google.android.react.navsdk.Command.CLEAR_DESTINATIONS;
import static com.google.android.react.navsdk.Command.CLEAR_MAP_VIEW;
import static com.google.android.react.navsdk.Command.CONTINUE_TO_NEXT_DESTINATION;
import static com.google.android.react.navsdk.Command.CREATE_FRAGMENT;
import static com.google.android.react.navsdk.Command.DELETE_FRAGMENT;
import static com.google.android.react.navsdk.Command.STOP_LOCATION_SIMULATION;
import static com.google.android.react.navsdk.Command.REMOVE_CIRCLE;
import static com.google.android.react.navsdk.Command.REMOVE_GROUND_OVERLAY;
import static com.google.android.react.navsdk.Command.SET_SPEEDOMETER_ENABLED;
import static com.google.android.react.navsdk.Command.REMOVE_MARKER;
import static com.google.android.react.navsdk.Command.REMOVE_POLYGON;
import static com.google.android.react.navsdk.Command.REMOVE_POLYLINE;
import static com.google.android.react.navsdk.Command.PAUSE_LOCATION_SIMULATION;
import static com.google.android.react.navsdk.Command.RESUME_LOCATION_SIMULATION;
import static com.google.android.react.navsdk.Command.RESET_MIN_MAX_ZOOM_LEVEL;
import static com.google.android.react.navsdk.Command.RESET_TERMS_ACCEPTED;
import static com.google.android.react.navsdk.Command.SIMULATE_LOCATIONS_ALONG_EXISTING_ROUTE;
import static com.google.android.react.navsdk.Command.SIMULATE_LOCATION;
import static com.google.android.react.navsdk.Command.SET_DESTINATION;
import static com.google.android.react.navsdk.Command.SET_DESTINATIONS;
import static com.google.android.react.navsdk.Command.SET_MAP_STYLE;
import static com.google.android.react.navsdk.Command.SET_MAP_TOOLBAR_ENABLED;
import static com.google.android.react.navsdk.Command.SET_MAP_TYPE;
import static com.google.android.react.navsdk.Command.SET_SPEED_ALERT_OPTIONS;
import static com.google.android.react.navsdk.Command.SET_MY_LOCATION_BUTTON_ENABLED;
import static com.google.android.react.navsdk.Command.SET_MY_LOCATION_ENABLED;
import static com.google.android.react.navsdk.Command.SET_ZOOM_LEVEL;
import static com.google.android.react.navsdk.Command.SHOW_TERMS_AND_CONDITIONS_DIALOG;
import static com.google.android.react.navsdk.Command.START_GUIDANCE;
import static com.google.android.react.navsdk.Command.STOP_GUIDANCE;
import static com.google.android.react.navsdk.Command.MOVE_CAMERA;
import static com.google.android.react.navsdk.Command.SET_NIGHT_MODE;
import static com.google.android.react.navsdk.Command.SET_SCROLL_GESTURES_ENABLED_DURING_ROTATE_OR_ZOOM;
import static com.google.android.react.navsdk.Command.SET_ZOOM_CONTROLS_ENABLED;
import static com.google.android.react.navsdk.Command.SET_BUILDINGS_ENABLED;
import static com.google.android.react.navsdk.Command.SET_COMPASS_ENABLED;
import static com.google.android.react.navsdk.Command.SET_INDOOR_ENABLED;
import static com.google.android.react.navsdk.Command.SET_NAVIGATION_UI_ENABLED;
import static com.google.android.react.navsdk.Command.SET_ROTATE_GESTURES_ENABLED;
import static com.google.android.react.navsdk.Command.SET_SCROLL_GESTURES_ENABLED;
import static com.google.android.react.navsdk.Command.SET_SPEED_LIMIT_ICON_ENABLED;
import static com.google.android.react.navsdk.Command.SET_TILT_GESTURES_ENABLED;
import static com.google.android.react.navsdk.Command.SET_TRAFFIC_ENABLED;
import static com.google.android.react.navsdk.Command.SET_TRIP_PROGRESS_BAR_ENABLED;
import static com.google.android.react.navsdk.Command.SET_TURN_BY_TURN_LOGGING_ENABLED;
import static com.google.android.react.navsdk.Command.SET_ZOOM_GESTURES_ENABLED;
import static com.google.android.react.navsdk.Command.SET_AUDIO_GUIDANCE_TYPE;
import static com.google.android.react.navsdk.Command.SET_ABNORMAL_TERMINATION_REPORTING_ENABLED;
import static com.google.android.react.navsdk.Command.SET_TRAFFIC_INCIDENT_CARDS_ENABLED;
import static com.google.android.react.navsdk.Command.SHOW_ROUTE_OVERVIEW;
import static com.google.android.react.navsdk.Command.SET_RECENTER_BUTTON_ENABLED;
import static com.google.android.react.navsdk.Command.START_UPDATING_LOCATION;
import static com.google.android.react.navsdk.Command.STOP_UPDATING_LOCATION;

import android.location.Location;
import android.util.Log;
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
import com.google.android.libraries.navigation.RoutingOptions;
import com.google.android.libraries.navigation.TermsAndConditionsCheckOption;

import java.util.HashMap;
import java.util.Map;

public class NavViewManager extends ViewGroupManager<FrameLayout> implements INavigationCallback {

  public static final String REACT_CLASS = "NavViewManager";
  public static final String TAG = "NavViewManager";

  private static NavViewManager instance;
  private int propWidth = 400;
  private int propHeight = 400;
  private final NavViewFragment navViewFragment = new NavViewFragment();

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
    Map map = new HashMap<String, Integer>();
    map.put(CREATE_FRAGMENT.toString(), CREATE_FRAGMENT.getValue());
    map.put(
        SET_TURN_BY_TURN_LOGGING_ENABLED.toString(), SET_TURN_BY_TURN_LOGGING_ENABLED.getValue());
    map.put(MOVE_CAMERA.toString(), MOVE_CAMERA.getValue());
    map.put(SET_TRIP_PROGRESS_BAR_ENABLED.toString(), SET_TRIP_PROGRESS_BAR_ENABLED.getValue());
    map.put(SET_NAVIGATION_UI_ENABLED.toString(), SET_NAVIGATION_UI_ENABLED.getValue());
    map.put(SET_FOLLOWING_PERSPECTIVE.toString(), SET_FOLLOWING_PERSPECTIVE.getValue());
    map.put(SET_NIGHT_MODE.toString(), SET_NIGHT_MODE.getValue());
    map.put(DELETE_FRAGMENT.toString(), DELETE_FRAGMENT.getValue());
    map.put(SET_SPEEDOMETER_ENABLED.toString(), SET_SPEEDOMETER_ENABLED.getValue());
    map.put(SET_SPEED_LIMIT_ICON_ENABLED.toString(), SET_SPEED_LIMIT_ICON_ENABLED.getValue());
    map.put(SET_DESTINATIONS.toString(), SET_DESTINATIONS.getValue());
    map.put(START_GUIDANCE.toString(), START_GUIDANCE.getValue());
    map.put(STOP_GUIDANCE.toString(), STOP_GUIDANCE.getValue());
    map.put(SIMULATE_LOCATION.toString(), SIMULATE_LOCATION.getValue());
    map.put(
        SIMULATE_LOCATIONS_ALONG_EXISTING_ROUTE.toString(),
        SIMULATE_LOCATIONS_ALONG_EXISTING_ROUTE.getValue());
    map.put(STOP_LOCATION_SIMULATION.toString(), STOP_LOCATION_SIMULATION.getValue());
    map.put(SET_ZOOM_LEVEL.toString(), SET_ZOOM_LEVEL.getValue());
    map.put(SET_DESTINATION.toString(), SET_DESTINATION.getValue());
    map.put(CLEAR_DESTINATIONS.toString(), CLEAR_DESTINATIONS.getValue());
    map.put(CONTINUE_TO_NEXT_DESTINATION.toString(), CONTINUE_TO_NEXT_DESTINATION.getValue());
    map.put(
        SHOW_TERMS_AND_CONDITIONS_DIALOG.toString(), SHOW_TERMS_AND_CONDITIONS_DIALOG.getValue());
    map.put(RESET_TERMS_ACCEPTED.toString(), RESET_TERMS_ACCEPTED.getValue());
    map.put(SET_SPEED_ALERT_OPTIONS.toString(), SET_SPEED_ALERT_OPTIONS.getValue());
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
    map.put(SET_AUDIO_GUIDANCE_TYPE.toString(), SET_AUDIO_GUIDANCE_TYPE.getValue());
    map.put(
        SET_ABNORMAL_TERMINATION_REPORTING_ENABLED.toString(),
        SET_ABNORMAL_TERMINATION_REPORTING_ENABLED.getValue());
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
    map.put(PAUSE_LOCATION_SIMULATION.toString(), PAUSE_LOCATION_SIMULATION.getValue());
    map.put(RESUME_LOCATION_SIMULATION.toString(), RESUME_LOCATION_SIMULATION.getValue());
    map.put(START_UPDATING_LOCATION.toString(), START_UPDATING_LOCATION.getValue());
    map.put(STOP_UPDATING_LOCATION.toString(), STOP_UPDATING_LOCATION.getValue());
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

  @Override
  public void receiveCommand(
      @NonNull FrameLayout root, String commandId, @Nullable ReadableArray args) {
    super.receiveCommand(root, commandId, args);
    int reactNativeViewId = root.getId();
    int commandIdInt = Integer.parseInt(commandId);

    switch (Command.find(commandIdInt)) {
      case CREATE_FRAGMENT:
        propHeight = args.getInt(0);
        propWidth = args.getInt(1);
        Map stylingOptions = args.getMap(2).toHashMap();
        Map tocParams = args.getMap(3).toHashMap();
        createFragment(root, reactNativeViewId, stylingOptions, tocParams);
        break;
      case DELETE_FRAGMENT:
        FragmentActivity activity = (FragmentActivity) reactContext.getCurrentActivity();
        activity
            .getSupportFragmentManager()
            .beginTransaction()
            .remove(navViewFragment)
            .commitNowAllowingStateLoss();
        break;
      case SET_TURN_BY_TURN_LOGGING_ENABLED:
        navViewFragment.setTurnbyTurnLoggingEnabled(args.getBoolean(0));
        break;
      case MOVE_CAMERA:
        navViewFragment.moveCamera(args.getMap(0).toHashMap());
        break;
      case SET_TRIP_PROGRESS_BAR_ENABLED:
        navViewFragment.setTripProgressBarUiEnabled(args.getBoolean(0));
        break;
      case SET_NAVIGATION_UI_ENABLED:
        navViewFragment.setNavigationUiEnabled(args.getBoolean(0));
        break;
      case SET_FOLLOWING_PERSPECTIVE:
        navViewFragment.setFollowingPerspective(args.getInt(0));
        break;
      case SET_NIGHT_MODE:
        navViewFragment.setNightModeOption(args.getInt(0));
        break;
      case SET_SPEEDOMETER_ENABLED:
        navViewFragment.setSpeedometerEnabled(args.getBoolean(0));
        break;
      case SET_SPEED_LIMIT_ICON_ENABLED:
        navViewFragment.setSpeedLimitIconEnabled(args.getBoolean(0));
        break;
      case SET_DESTINATIONS:
        Map routingOptionsMulti = args.getMap(1) == null ? args.getMap(1).toHashMap() : null;
        navViewFragment.setDestinations(args.getArray(0), routingOptionsMulti);
        break;
      case SET_DESTINATION:
        Map routingOptionsSingle = args.getMap(1) == null ? args.getMap(1).toHashMap() : null;
        navViewFragment.setDestination((Map) args.getMap(0).toHashMap(), routingOptionsSingle);
        break;
      case START_GUIDANCE:
        navViewFragment.startGuidance();
        break;
      case STOP_GUIDANCE:
        navViewFragment.stopGuidance();
        break;
      case SIMULATE_LOCATIONS_ALONG_EXISTING_ROUTE:
        navViewFragment.runSimulation(args.getInt(0));
        break;

      case STOP_LOCATION_SIMULATION:
        navViewFragment.stopLocationSimulation();
        break;
      case SET_ZOOM_LEVEL:
        int level = args.getInt(0);
        navViewFragment.setZoomLevel(level);
        break;
      case CLEAR_DESTINATIONS:
        navViewFragment.clearDestinations();
        break;
      case CONTINUE_TO_NEXT_DESTINATION:
        navViewFragment.continueToNextDestination();
        break;
      case SIMULATE_LOCATION:
        navViewFragment.simulateLocation(args.getMap(0).toHashMap());
        break;
      case SET_SPEED_ALERT_OPTIONS:
        ReadableMap optionsMap = args.getMap(0);

        if (optionsMap != null) {
          navViewFragment.setSpeedAlertOptions(optionsMap.toHashMap());
        } else {
          navViewFragment.setSpeedAlertOptions(null);
        }
        break;
      case SET_INDOOR_ENABLED:
        navViewFragment.setIndoorEnabled(args.getBoolean(0));
        break;
      case SET_TRAFFIC_ENABLED:
        navViewFragment.setTrafficEnabled(args.getBoolean(0));
        break;
      case SET_COMPASS_ENABLED:
        navViewFragment.setCompassEnabled(args.getBoolean(0));
        break;
      case SET_MY_LOCATION_BUTTON_ENABLED:
        navViewFragment.setMyLocationButtonEnabled(args.getBoolean(0));
        break;
      case SET_MY_LOCATION_ENABLED:
        navViewFragment.setMyLocationEnabled(args.getBoolean(0));
        break;
      case SET_ROTATE_GESTURES_ENABLED:
        navViewFragment.setRotateGesturesEnabled(args.getBoolean(0));
        break;
      case SET_SCROLL_GESTURES_ENABLED:
        navViewFragment.setScrollGesturesEnabled(args.getBoolean(0));
        break;
      case SET_SCROLL_GESTURES_ENABLED_DURING_ROTATE_OR_ZOOM:
        navViewFragment.setScrollGesturesEnabledDuringRotateOrZoom(args.getBoolean(0));
        break;
      case SET_TILT_GESTURES_ENABLED:
        navViewFragment.setTiltGesturesEnabled(args.getBoolean(0));
        break;
      case SET_ZOOM_CONTROLS_ENABLED:
        navViewFragment.setZoomControlsEnabled(args.getBoolean(0));
        break;
      case SET_ZOOM_GESTURES_ENABLED:
        navViewFragment.setZoomGesturesEnabled(args.getBoolean(0));
        break;
      case SET_BUILDINGS_ENABLED:
        navViewFragment.setBuildingsEnabled(args.getBoolean(0));
        break;
      case SET_MAP_TYPE:
        navViewFragment.setMapType(args.getInt(0));
        break;
      case SET_MAP_TOOLBAR_ENABLED:
        navViewFragment.setMapToolbarEnabled(args.getBoolean(0));
        break;
      case CLEAR_MAP_VIEW:
        navViewFragment.clearMapView();
        break;
      case RESET_MIN_MAX_ZOOM_LEVEL:
        navViewFragment.resetMinMaxZoomLevel();
        break;
      case SET_MAP_STYLE:
        navViewFragment.setMapStyle(args.getString(0));
        break;
      case ANIMATE_CAMERA:
        navViewFragment.animateCamera(args.getMap(0).toHashMap());
        break;
      case SET_AUDIO_GUIDANCE_TYPE:
        navViewFragment.setAudioGuidanceType(args.getInt(0));
        break;
      case SET_ABNORMAL_TERMINATION_REPORTING_ENABLED:
        navViewFragment.setAbnormalTerminatingReportingEnabled(args.getBoolean(0));
        break;
      case SET_TRAFFIC_INCIDENT_CARDS_ENABLED:
        navViewFragment.setTrafficIncidentCards(args.getBoolean(0));
        break;
      case SET_RECENTER_BUTTON_ENABLED:
        navViewFragment.setRecenterButtonEnabled(args.getBoolean(0));
        break;
      case SHOW_ROUTE_OVERVIEW:
        navViewFragment.showRouteOverview();
        break;
      case REMOVE_MARKER:
        navViewFragment.removeMarker(args.getString(0));
        break;
      case REMOVE_POLYLINE:
        navViewFragment.removePolyline(args.getString(0));
        break;
      case REMOVE_POLYGON:
        navViewFragment.removePolygon(args.getString(0));
        break;
      case REMOVE_CIRCLE:
        navViewFragment.removeCircle(args.getString(0));
        break;
      case REMOVE_GROUND_OVERLAY:
        navViewFragment.removeGroundOverlay(args.getString(0));
        break;
      case PAUSE_LOCATION_SIMULATION:
        navViewFragment.pauseLocationSimulation();
        break;
      case RESUME_LOCATION_SIMULATION:
        navViewFragment.resumeLocationSimulation();
        break;
      case START_UPDATING_LOCATION:
        navViewFragment.startUpdatingLocation();
        break;
      case STOP_UPDATING_LOCATION:
        navViewFragment.stopUpdatingLocation();
        break;
    }
  }

  /** Replace your React Native view with a custom fragment */
  public void createFragment(
      FrameLayout root, int reactNativeViewId, Map stylingOptions, Map tocParams) {
    ViewGroup parentView = root.findViewById(reactNativeViewId);
    setupLayout(parentView);
    FragmentActivity activity = (FragmentActivity) reactContext.getCurrentActivity();
    navViewFragment.setNavigationCallback(this);
    navViewFragment.setTocParams(tocParams);
    /**
     * Add the stylingOptions when it's not null. Added an else condition if the stylingOptions is
     * null. s
     */
    if (stylingOptions != null) {
      navViewFragment.setStylingOptions(stylingOptions);
      activity
          .getSupportFragmentManager()
          .beginTransaction()
          .replace(reactNativeViewId, navViewFragment, String.valueOf(reactNativeViewId))
          .commit();
    } else {
      activity
          .getSupportFragmentManager()
          .beginTransaction()
          .replace(reactNativeViewId, navViewFragment, String.valueOf(reactNativeViewId))
          .commit();
    }
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
    if (navViewFragment.requireActivity() != null && reactContext != null) {
      CatalystInstance catalystInstance = reactContext.getCatalystInstance();
      WritableNativeArray params = new WritableNativeArray();
      if (args != null) {
        params.pushString("" + args);
      }
      catalystInstance.callFunction(Constants.JAVASCRIPT_FLAG, functionName, params);
    }
  }

  @Override
  public void onArrival(ArrivalEvent event) {
    if (navViewFragment.requireActivity() != null && reactContext != null) {
      CatalystInstance catalystInstance = reactContext.getCatalystInstance();

      WritableMap map = Arguments.createMap();
      map.putMap("waypoint", ObjectTranslationUtil.getMapFromWaypoint(event.getWaypoint()));
      map.putBoolean("isFinalDestination", event.isFinalDestination());

      WritableNativeArray params = new WritableNativeArray();
      params.pushMap(map);

      catalystInstance.callFunction(Constants.JAVASCRIPT_FLAG, "onArrival", params);
    }
  }

  public Navigator getNavigator() {
    return navViewFragment.getNavigator();
  }

  public GoogleMap getGoogleMap() {
    return navViewFragment.getGoogleMap();
  }

  public boolean areTermsAccepted() {
    return navViewFragment.areTermsAccepted();
  }

  @Override
  public void onRouteChanged() {
    sendCommandToReactNative("onRouteChanged", null);
  }

  @Override
  public void onReroutingRequestedByOffRoute() {
    sendCommandToReactNative("onReroutingRequestedByOffRoute", null);
  }

  @Override
  public void onTrafficUpdated() {
    sendCommandToReactNative("onTrafficUpdated", null);
  }

  @Override
  public void logDebugInfo(String log) {
    sendCommandToReactNative("logDebugInfo", log);
  }

  @Override
  public void onNavigationReady() {
    navViewFragment.applyStylingOptions();

    CatalystInstance catalystInstance = reactContext.getCatalystInstance();
    WritableNativeArray params = new WritableNativeArray();

    catalystInstance.callFunction(Constants.JAVASCRIPT_FLAG, "onNavigationReady", params);
  }

  @Override
  public void onNavigationInitError(int errorCode) {
    sendCommandToReactNative("onNavigationInitError", errorCode);
  }

  @Override
  public void onRemainingTimeOrDistanceChanged() {
    sendCommandToReactNative("onRemainingTimeOrDistanceChanged", null);
  }

  @Override
  public void onLocationChanged(final Location location) {
    CatalystInstance catalystInstance = reactContext.getCatalystInstance();

    WritableNativeArray params = new WritableNativeArray();
    params.pushMap(ObjectTranslationUtil.getMapFromLocation(location));

    catalystInstance.callFunction(Constants.JAVASCRIPT_FLAG, "onLocationChanged", params);
  }

  @Override
  public void onRawLocationUpdate(final Location location) {
    CatalystInstance catalystInstance = reactContext.getCatalystInstance();

    WritableNativeArray params = new WritableNativeArray();
    params.pushMap(ObjectTranslationUtil.getMapFromLocation(location));

    catalystInstance.callFunction(Constants.JAVASCRIPT_FLAG, "onRawLocationChanged", params);
  }

  @Override
  public void onMapReady() {
    sendCommandToReactNative("onMapReady", null);
  }

  @Override
  public void onRecenterButtonClick() {
    sendCommandToReactNative("onRecenterButtonClick", null);
  }

  @Override
  public void onRouteStatusResult(Navigator.RouteStatus code) {
    sendCommandToReactNative("onRouteStatusResult", code.toString());
  }

  public String getNavSDKVersion() {
    return navViewFragment.getNavSDKVersion();
  }

  @Override
  public void onTurnByTurn(NavInfo navInfo) {
    if (navViewFragment.requireActivity() != null && reactContext != null) {
      CatalystInstance catalystInstance = reactContext.getCatalystInstance();

      WritableMap map = Arguments.createMap();

      map.putInt("navState", navInfo.getNavState());
      map.putBoolean("routeChanged", navInfo.getRouteChanged());
      if (navInfo.getDistanceToCurrentStepMeters() != null)
        map.putInt("distanceToCurrentStepMeters", navInfo.getDistanceToCurrentStepMeters());
      if (navInfo.getDistanceToFinalDestinationMeters() != null)
        map.putInt(
            "distanceToFinalDestinationMeters", navInfo.getDistanceToFinalDestinationMeters());
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
            "currentStep", ObjectTranslationUtil.getMapFromStepInfo(navInfo.getCurrentStep()));

      WritableArray remainingSteps = Arguments.createArray();
      if (navInfo.getRemainingSteps() != null) {
        for (StepInfo info : navInfo.getRemainingSteps()) {
          remainingSteps.pushMap(ObjectTranslationUtil.getMapFromStepInfo(info));
        }
      }
      map.putArray("getRemainingSteps", remainingSteps);

      WritableNativeArray params = new WritableNativeArray();
      params.pushMap(map);
      catalystInstance.callFunction(Constants.JAVASCRIPT_FLAG, "onTurnByTurn", params);
    }
  }

  @Override
  public void onStartGuidance() {
    sendCommandToReactNative("onStartGuidance", null);
  }

  @Override
  public void onMarkerClick(Marker marker) {
    CatalystInstance catalystInstance = reactContext.getCatalystInstance();

    WritableNativeArray params = new WritableNativeArray();
    params.pushMap(ObjectTranslationUtil.getMapFromMarker(marker));

    catalystInstance.callFunction(Constants.JAVASCRIPT_FLAG, "onMarkerClick", params);
  }

  @Override
  public void onPolylineClick(Polyline polyline) {
    CatalystInstance catalystInstance = reactContext.getCatalystInstance();

    WritableNativeArray params = new WritableNativeArray();
    params.pushMap(ObjectTranslationUtil.getMapFromPolyline(polyline));

    catalystInstance.callFunction(Constants.JAVASCRIPT_FLAG, "onPolylineClick", params);
  }

  @Override
  public void onPolygonClick(Polygon polygon) {
    CatalystInstance catalystInstance = reactContext.getCatalystInstance();

    WritableNativeArray params = new WritableNativeArray();
    params.pushMap(ObjectTranslationUtil.getMapFromPolygon(polygon));

    catalystInstance.callFunction(Constants.JAVASCRIPT_FLAG, "onPolygonClick", params);
  }

  @Override
  public void onCircleClick(Circle circle) {
    CatalystInstance catalystInstance = reactContext.getCatalystInstance();

    WritableNativeArray params = new WritableNativeArray();
    params.pushMap(ObjectTranslationUtil.getMapFromCircle(circle));

    catalystInstance.callFunction(Constants.JAVASCRIPT_FLAG, "onCircleClick", params);
  }

  @Override
  public void onGroundOverlayClick(GroundOverlay overlay) {
    CatalystInstance catalystInstance = reactContext.getCatalystInstance();

    WritableNativeArray params = new WritableNativeArray();
    params.pushMap(ObjectTranslationUtil.getMapFromGroundOverlay(overlay));

    catalystInstance.callFunction(Constants.JAVASCRIPT_FLAG, "onGroundOverlayClick", params);
  }

  @Override
  public void onMarkerInfoWindowTapped(Marker marker) {
    CatalystInstance catalystInstance = reactContext.getCatalystInstance();

    WritableNativeArray params = new WritableNativeArray();
    params.pushMap(ObjectTranslationUtil.getMapFromMarker(marker));

    catalystInstance.callFunction(Constants.JAVASCRIPT_FLAG, "onMarkerInfoWindowTapped", params);
  }

  NavViewFragment getNavViewFragment() {
    return navViewFragment;
  }
}
