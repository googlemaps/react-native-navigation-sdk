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

import type { LatLng, Location } from '../../shared/types';
import type {
  AlternateRoutingStrategy,
  AudioGuidance,
  NavigationInitializationStatus,
  RouteSegment,
  RouteStatus,
  RoutingStrategy,
  TimeAndDistance,
  TravelMode,
  Waypoint,
} from '../types';

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
 * Defines the options used by the Navigator for dislaying different elements.
 */
export interface DisplayOptions {
  /**
   * Configures whether destination markers are shown during navigation.
   * If true, destination markers are shown.
   */
  showDestinationMarkers?: boolean;
  /**
   * Configures whether stop signs are shown during navigation.
   * If true, stop signs are shown.
   */
  showStopSigns?: boolean;
  /**
   * Configures whether traffic lights are shown during navigation.
   * If true, traffic lights are shown.
   */
  showTrafficLights?: boolean;
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

/** Defines all callbacks listeners setters for events emitted during navigation. */
export interface NavigationCallbackListenerSetters {
  /**
   * Callback setter function for events invoked when guidance is started.
   */
  setOnStartGuidanceListener: (callback: (() => void) | null) => void;

  /**
   * Callback setter function for events invoked when the destination is reached.
   *
   * @param {ArrivalEvent} arrivalEvent - An object containing the arrival event data.
   */
  setOnArrivalListener: (
    callback: ((arrivalEvent: ArrivalEvent) => void) | null
  ) => void;

  /**
   * Callback setter function for events invoked when the location is changed.
   *
   * @param {Location} location - An object containing the location.
   */
  setOnLocationChangedListener: (
    callback: ((location: Location) => void) | null
  ) => void;

  /**
   * Callback setter function for events that gets invoked when navigation information is ready.
   *
   */
  setOnNavigationReadyListener: (callback: (() => void) | null) => void;

  /**
   * Callback setter function for events of raw location data.
   *
   * @param location - An object containing the raw location data that has changed.
   */
  setOnRawLocationChangedListener: (
    callback: ((location: Location) => void) | null
  ) => void;

  /**
   * Callback setter function for events invoked when the route is changed.
   */
  setOnRouteChangedListener: (callback: (() => void) | null) => void;

  /**
   * Callback setter function for events invoked when rerouting is requested due to an
   * off-route event.
   */
  setOnReroutingRequestedByOffRouteListener: (
    callback: (() => void) | null
  ) => void;

  /**
   * Callback setter function for events invoked when traffic data is updated (Android only).
   */
  setOnTrafficUpdatedListener: (callback: (() => void) | null) => void;

  /**
   * Callback setter function for events invoked when the remaining time or distance changes.
   */
  setOnRemainingTimeOrDistanceChangedListener: (
    callback: (() => void) | null
  ) => void;

  /**
   * Callback setter function for events invoked when a turn-by-turn event occurs.
   *
   * @param turnByTurnEvent - An object containing the turn-by-turn event data.
   */
  setOnTurnByTurnListener: (
    callback: ((turnByTurnEvents: TurnByTurnEvent[]) => void) | null
  ) => void;

  /**
   * Allows developers to listen for relevant debug logs (Android only).
   *
   * @param message relevant log message
   */
  setLogDebugInfoListener: (
    callback: ((message: string) => void) | null
  ) => void;

  /**
   * Removes all listeners for the navigation events.
   */
  removeAllListeners: () => void;
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
  simulateLocationsAlongExistingRoute(
    options: LocationSimulationOptions
  ): Promise<void>;

  /**
   * Ends the currently running navigation simulation.
   */
  stopLocationSimulation(): Promise<void>;

  /**
   * Resumes the location simulation in case it's been paused.
   *
   */
  resumeLocationSimulation(): Promise<void>;

  /**
   * Pauses the location simulation if there's one running.
   *
   */
  pauseLocationSimulation(): Promise<void>;

  /**
   * Sets the user's location on the map, provided a latitude and longitude.
   *
   * @param {LatLng} latLng - The geographic coordinates to set as the user's
   *                          location, containing latitude and longitude values.
   */
  simulateLocation(location: LatLng): Promise<void>;
}

/**
 * Allows you to access Navigator methods.
 */
export interface NavigationController
  extends NavigationCallbackListenerSetters {
  /**
   * Initializes the navigation module.
   *
   * @returns {NavigationInitializationStatus} - The status of the navigation initialization.
   */
  init(): Promise<NavigationInitializationStatus>;

  /**
   * Cleans up the navigation module, releasing any resources that were allocated.
   */
  cleanup(): Promise<void>;

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
  setDestination(
    waypoint: Waypoint,
    routingOptions?: RoutingOptions,
    displayOptions?: DisplayOptions
  ): Promise<RouteStatus>;

  /**
   * Set the destinations on the map using the provided waypoints.
   *
   * @param waypoints - A list of Waypoint objects, each defining a destination
   *                    or stopover point with specific attributes.
   *
   * @returns A promise that resolves to a routeStatus.
   */
  setDestinations(
    waypoints: Waypoint[],
    routingOptions?: RoutingOptions,
    displayOptions?: DisplayOptions
  ): Promise<RouteStatus>;

  /**
   * @deprecated Use `setDestinations(...)` with the updated list of waypoints
   * instead.
   *
   * Proceeds to the next destination or waypoint within a predefined route.
   * Assumes that there is an ongoing route with multiple waypoints.
   */
  continueToNextDestination(): Promise<void>;

  /**
   * Clears all previously set destinations or waypoints from the map, effectively
   * removing any predefined routes.
   */
  clearDestinations(): Promise<void>;

  /**
   * Initiates the guidance mode on the map, typically starting the navigation
   * towards a previously set destination or following a predefined route.
   */
  startGuidance(): Promise<void>;

  /**
   * Stops the ongoing guidance navigation, if active.
   */
  stopGuidance(): Promise<void>;

  /**
   * Enable or disable reporting of abnormal terminations.
   *
   * @param isOn - Indicates whether to enable (true) or disable (false) reporting
   *               of abnormal terminations.
   */
  setAbnormalTerminatingReportingEnabled(enabled: boolean): void;

  /**
   * Set the configuration for the minor/major speed alerts.
   *
   * @param alertOptions - Configuration for speed alert severity levels.
   */
  setSpeedAlertOptions(speed: SpeedAlertOptions | null): void;

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
   * Enables location updates when the application is on the background.
   * Only available in iOS, it's a NO-OP for Android.
   *
   * @param isEnabled - Determines whether the updates should be enabled or disabled.
   */
  setBackgroundLocationUpdatesEnabled(isEnabled: boolean): void;

  /**
   * Enables or disables turn-by-turn logging.
   *
   * @param isEnabled - Determines whether the turn-by-turn logging should be enabled or disabled.
   */
  setTurnByTurnLoggingEnabled(isEnabled: boolean): void;

  /**
   * Simulator to be used in navigation.
   */
  readonly simulator: Simulator;
}

/**
 * Defines how application should behave when a application task is removed.
 */
export enum TaskRemovedBehavior {
  /** The default state, indicating that navigation guidance, location updates, and notification should persist after user removes the application task. */
  CONTINUE_SERVICE = 0,
  /** Indicates that navigation guidance, location updates, and notification should shut down immediately when the user removes the application task. */
  QUIT_SERVICE,
}
/**
 * Defines the turn-by-turn event data.
 */
export interface TurnByTurnEvent {
  /**
   * The current navigation state.
   */
  navState: number;

  /**
   * Indicates whether the route has changed.
   */
  routeChanged: boolean;

  /**
   * The distance to the current step in meters, if available.
   */
  distanceToCurrentStepMeters?: number;

  /**
   * The distance to the final destination in meters, if available.
   */
  distanceToFinalDestinationMeters?: number;

  /**
   * The time to the current step in seconds, if available.
   */
  timeToCurrentStepSeconds?: number;

  /**
   * The distance to the next destination in meters, if available.
   */
  distanceToNextDestinationMeters?: number;

  /**
   * The time to the next destination in seconds, if available.
   */
  timeToNextDestinationSeconds?: number;

  /**
   * The time to the final destination in seconds, if available.
   */
  timeToFinalDestinationSeconds?: number;

  /**
   * Information about the current step, if available.
   */
  currentStep?: StepInfo;

  /**
   * The remaining steps in the route.
   */
  getRemainingSteps: StepInfo[];
}

/**
 * Defines the information for a navigation step.
 */
export interface StepInfo {
  /**
   * The instruction for the step.
   */
  instruction: string;

  /**
   * The distance for the step in meters.
   */
  distanceMeters: number;

  /**
   * The duration for the step in seconds.
   */
  durationSeconds: number;

  /**
   * The maneuver type for the step.
   */
  maneuver: string;

  /**
   * The position of the step as latitude and longitude.
   */
  position: LatLng;
}
