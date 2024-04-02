/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {MapViewCallbacks, MapViewController} from '../../maps/mapView/types';
import {LatLng, Location} from '../../shared/types';
import {
  AlternateRoutingStrategy,
  AudioGuidance,
  NavigationInitErrorCode,
  RouteSegment,
  RouteStatus,
  RoutingStrategy,
  TimeAndDistance,
  TravelMode,
  Waypoint,
} from '../types';
import {AndroidStylingOptions, iOSStylingOptions} from './stylingOptions';

/**
 * The perspective that the camera will be looking at the GoogleMap.
 * Default: TILTED
 */
export enum CameraPerspective {
  /** A tilted perspective facing in the same direction as the user. */
  TILTED = 0,
  /** A north-facing top-down perspective of the camera's target. */
  TOP_DOWN_NORTH_UP,
  /** A heading-facing top-down perspective of the camera's target. */
  TOP_DOWN_HEADING_UP,
}

/**
 * Defines the options used by the Navigator for calculating a route to a destination.
 */
export interface RoutingOptions {
  /**
   * Specifies the type of transportation used to tailor the directions. The default is DRIVING.
   */
  travelMode?: TravelMode;
  /**
   * The routing strategy specifies how routes are ranked, which affects the route that is chosen
   * initially, and during re-routing. The default is DEFAULT_BEST.
   */
  routingStrategy?: RoutingStrategy;
  /**
   * Ranks routes by NavSDK's default cost model. This is the default routing strategy for
   * navigating.
   */
  alternateRoutesStrategy?: AlternateRoutingStrategy;
  /**
   * Configures whether to avoid ferries when generating a route to a destination.
   * If true, ferries are avoided.
   */
  avoidFerries?: boolean;
  /**
   * Configures whether to avoid toll roads when generating a route to a destination.
   * If true, toll roads are avoided.
   */
  avoidTolls?: boolean;
  /**
   * Configures whether to avoid highways and motorways when generating a route to a destination.
   * If true, highways and motorways are avoided.
   */
  avoidHighways?: boolean;
}
/**
 * Defines triggering thresholds for different severity levels of speed alerts, represented by
 * SpeedAlertSeverity.
 *
 * You can use this class to customize the speed alert triggering thresholds as a percentage for
 * both MINOR and MAJOR alerts, and to customize the time-based triggering threshold for MAJOR speed alert.
 *
 * The speed alerts that are triggered by thresholds from this SpeedAlertOptions have their UI
 * customized in SpeedometerUiOptions.
 */
export interface SpeedAlertOptions {
  majorSpeedAlertPercentThreshold: number;
  minorSpeedAlertPercentThreshold: number;
  /** The speed alert triggering threshold as a percentage. */
  severityUpgradeDurationSeconds: number;
}

/**
 * Defines options that can be used to customize the "Terms and conditions"
 * dialog for the Navigation sdk.
 */
export interface TermsAndConditionsDialogOptions {
  /** Title to be displayed in Terms of Services (TOS) dialog. */
  readonly title?: string;
  /** The name of your company to be displayed in Terms of Services (TOS) dialog. */
  readonly companyName?: string;
  readonly showOnlyDisclaimer?: boolean;
}

/**
 * An event fired upon arrival at a destination.
 */
export interface ArrivalEvent {
  /**
   * Waypoint the device has arrived to. This waypoint was used when setDestinations was called.
   */
  waypoint: Waypoint;
  /** Whether this is the last waypoint to be visited in the route */
  isFinalDestination?: boolean;
}

/** Options to be used inside the Simulator. */
export interface LocationSimulationOptions {
  /** The speed the vehicle will be moving in the simulated route */
  readonly speedMultiplier: number;
}

/** Defines all callbacks to be emitted during navigation. */
export interface NavigationViewCallbacks {
  /**
   * Callback function invoked when guidance is started.
   */
  onStartGuidance?(): void;

  /**
   * Callback function invoked when the destination is reached.
   * @param args - The arguments received upon arrival. The type
   *               and structure of `args` should be documented
   *               based on the actual usage and data expected.
   */
  onArrival?(args: ArrivalEvent): void;

  /**
   * Callback function invoked when the location is changed.
   *
   * @param args - The arguments received upon location change. The
   *               type and structure of `args` should be documented
   *               based on the actual usage and data expected.
   */
  onLocationChanged?(args: Location): void;

  /**
   * A callback function that gets invoked when navigation information is ready.
   *
   */
  onNavigationReady?(): void;

  /**
   * Callback function invoked when receiving a route status result.
   *
   * @param args - The arguments received related to the route status.
   *               The exact structure and type of `args` should be
   *               documented based on actual usage and expected data.
   */
  onRouteStatusResult?(args: RouteStatus): void;

  /**
   * Handles changes to raw location data and triggers a callback with the
   * changed data.
   *
   * @param args - An object containing the raw location data that has changed.
   */
  onRawLocationChanged?(args: Location): void;

  /**
   * Callback function invoked when the route is changed.
   */
  onRouteChanged?(): void;

  /**
   * Callback function invoked when the re-center button is clicked.
   */
  onRecenterButtonClick?(): void;

  /**
   * Callback function invoked when rerouting is requested due to an
   * off-route event.
   */
  onReroutingRequestedByOffRoute?(): void;

  /**
   * Callback function invoked when traffic data is updated.
   */
  onTrafficUpdated?(): void;

  /**
   * Callback function when the remaining time or distance changes.
   */
  onRemainingTimeOrDistanceChanged?(): void;

  /**
   * Callback that gets triggered when the navigation failed to initilize.
   *
   * @param errorCode - indicates the reason why navigation failed to initialize.
   */
  onNavigationInitError?(errorCode: NavigationInitErrorCode): void;

  /**
   * Allows developers to listen for relevant debug logs.
   * 
   * @param message relevant log message
   */
  logDebugInfo?(message: string): void;
}

/**
 * `NavigationViewProps` interface extends `MapViewProps` to provide
 * additional methods focused on managing navigation events and state changes.
 */
export interface NavigationViewProps {
  readonly width: number;
  readonly height: number;
  readonly androidStylingOptions?: AndroidStylingOptions;
  readonly iOSStylingOptions?: iOSStylingOptions;
  readonly termsAndConditionsDialogOptions: TermsAndConditionsDialogOptions;

  readonly navigationViewCallbacks?: NavigationViewCallbacks;
  readonly mapViewCallbacks?: MapViewCallbacks;

  onNavigationViewControllerCreated(
    navigationViewController: NavigationViewController,
  ): void;
  onMapViewControllerCreated(mapViewController: MapViewController): void;
}

/**
 * An interface to send simulated locations to the Nav API, or run the Nav API along simulated
 * routes. For use during testing, debugging and demos.
 */
export interface Simulator {
  /**
   * Initiates a simulation of the navigation with a specified speed multiplier.
   * @param speedMultiplier - Multiplier to speed up the simulation.
   */
  simulateLocationsAlongExistingRoute(options: LocationSimulationOptions): void;

  /**
   * Ends the currently running navigation simulation.
   */
  stopLocationSimulation(): void;

  /**
   * Resumes the location simulation in case it's been paused.
   *
   */
  resumeLocationSimulation(): void;

  /**
   * Pauses the location simulation if there's one running.
   *
   */
  pauseLocationSimulation(): void;

  /**
   * Sets the user's location on the map, provided a latitude and longitude.
   *
   * @param {LatLng} latLng - The geographic coordinates to set as the user's
   *                          location, containing latitude and longitude values.
   */
  simulateLocation(location: LatLng): void;
}

/**
 * Allows you to access Navigator methods.
 */
export interface NavigationViewController {
  /**
   *
   * @returns the current route information.
   * If navigation is not running, this function returns an error message
   * and can be accessed using the 'error' key
   */
  getCurrentRouteSegment(): Promise<RouteSegment>;

  /**
   * Retrieves an array of route segments from the navigation view module.
   *
   * @returns A promise that resolves with an array of `RouteSegment` objects,
   * representing the segments of the current route.
   */
  getRouteSegments(): Promise<RouteSegment[]>;

  /**
   *
   * @returns the current time and distance information.
   * If navigation is not running, this function returns an error message
   * and can be accessed using the 'error' key
   */
  getCurrentTimeAndDistance(): Promise<TimeAndDistance>;

  /**
   *
   * @returns the current traveled path list.
   * If navigation is not running, this function returns an error message
   * and can be accessed using the 'error' key
   */
  getTraveledPath(): Promise<LatLng[]>;

  /**
   * Asynchronously retrieves the version of the Navigation SDK.
   *
   * @returns A promise that resolves to a string indicating the SDK version.
   */
  getNavSDKVersion(): Promise<string>;

  /**
   * Set a single destination on the map using a provided waypoint.
   *
   * @param waypoint - A Waypoint object, defining a destination or stopover point
   *                   with specific attributes, such as place ID, title, and
   *                   coordinates (latitude and longitude).
   */
  setDestination(waypoint: Waypoint, routingOptions?: RoutingOptions): void;

  /**
   * Set the destinations on the map using the provided waypoints.
   *
   * @param waypoints - A list of Waypoint objects, each defining a destination
   *                    or stopover point with specific attributes.
   */
  setDestinations(waypoints: Waypoint[], routingOptions?: RoutingOptions): void;

  /**
   * Proceeds to the next destination or waypoint within a predefined route.
   * Assumes that there is an ongoing route with multiple waypoints.
   */
  continueToNextDestination(): void;

  /**
   * Clears all previously set destinations or waypoints from the map, effectively
   * removing any predefined routes.
   */
  clearDestinations(): void;

  /**
   * Initiates the guidance mode on the map, typically starting the navigation
   * towards a previously set destination or following a predefined route.
   */
  startGuidance(): void;

  /**
   * Stops the ongoing guidance navigation, if active.
   */
  stopGuidance(): void;

  /**
   * Show or hide the navigation user interface (UI) on the map.
   *
   * @param isOn - Indicates whether to display (true) or hide (false) the
   *               navigation user interface.
   */
  setNavigationUIEnabled(enabled: boolean): void;

  /**
   * Show or hide the trip progress information on the map.
   *
   * @param isOn - Indicates whether to display (true) or hide (false) the trip
   *               progress information.
   */
  setTripProgressBarEnabled(enabled: boolean): void;

  /**
   * Enable or disable reporting of abnormal terminations.
   *
   * @param isOn - Indicates whether to enable (true) or disable (false) reporting
   *               of abnormal terminations.
   */
  setAbnormalTerminatingReportingEnabled(enabled: boolean): void;

  /**
   * Show or hide traffic incident cards on the map.
   *
   * @param isOn - Indicates whether to display (true) or hide (false) traffic
   *               incident cards on the map.
   */
  setTrafficIncidentCardsEnabled(enabled: boolean): void;

  /**
   * Enable or disable the speedometer display on the map.
   *
   * @param isOn - Indicates whether to enable (true) or disable (false) the
   *               speedometer display.
   */
  setSpeedometerEnabled(enabled: boolean): void;

  /**
   * Show or hide the speed limit icon on the map.
   *
   * @param isOn - Indicates whether to display (true) or hide (false) the
   *               speed limit icon.
   */
  setSpeedLimitIconEnabled(enabled: boolean): void;

  /**
   * Set the configuration for the minor/major speed alerts.
   *
   * @param alertOptions - Configuration for speed alert severity levels.
   */
  setSpeedAlertOptions(speed: SpeedAlertOptions | null): void;

  /**
   * Shows an overview of the remaining route.
   */
  showRouteOverview(): void;

  /**
   * Sets the night mode setting according to the provided index.
   *
   * @param index - The index representing the desired night mode
   * setting.
   */
  setNightMode(index: number): void;

  /**
   * Sets the audio guidance type according to the provided index.
   *
   * @param index - The index representing the desired audio
   * guidance type.
   */
  setAudioGuidanceType(index: AudioGuidance): void;

  /**
   * Checks if the Terms and Conditions have been accepted.
   *
   * @returns {Promise<boolean>} A promise resolving to a boolean indicating
   * whether the terms have been accepted.
   */
  areTermsAccepted(): Promise<boolean>;

  /**
   * Disables location updates by the library. This should be
   * called once no longer needed to save battery.
   */
  stopUpdatingLocation(): void;

  /**
   * Allows the library to start tracking location and providing updates.
   */
  startUpdatingLocation(): void;

  /**
   * Set the camera perspective mode for the map.
   *
   * @param perspective - The desired camera perspective mode.
   */
  setFollowingPerspective(perspective: CameraPerspective): void;

  /**
   * Enables location updates when the application is on the background. 
   * Only available in iOS, it's a NO-OP for Android.
   * 
   * @param isEnabled - Determines whether the updates should be enabled or disabled.
   */
  setBackgroundLocationUpdatesEnabled(isEnabled: boolean): void;

  /**
   * Enables/disables the "Recenter" button on the map.
   * 
   * @param isEnabled - Determines whether the button should be enabled or not.
   */
  setRecenterButtonEnabled(isEnabled: boolean): void;

  /**
   * Simulator to be used in navigation.
   */
  readonly simulator: Simulator;
}
