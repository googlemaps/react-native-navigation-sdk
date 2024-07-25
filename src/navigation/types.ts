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

import type { LatLng } from '../shared/types';

/**
 * Whether this step is on a drive-on-right or drive-on-left route. May be unspecified.
 */
export enum DrivingSide {
  /** Unspecified side. */
  NONE = 0,
  /** Drive-on-left side. */
  LEFT = 1,
  /** Drive-on-right side. */
  RIGHT = 2,
}

/**
 * The state of navigation in Navigation SDK.
 */
export enum NavState {
  /** Error or unspecified state. */
  UNKNOWN = 0,
  /** Actively navigating. */
  ENROUTE = 1,
  /** Actively navigating but searching for a new route. */
  REROUTING = 2,
  /** Navigation has ended. */
  STOPPED = 3,
}

/**
 * Specify that the Navigation SDK should determine the appropriate day or night mode according to
 * user's location and local time.
 */
export enum NightModeOptions {
  /** Specify that the Navigation SDK should determine the appropriate day or night mode according to user's location and local time. */
  AUTO = 0,
  /** Force day mode (default light map style). */
  FORCE_DAY,
  /** Force night mode (default dark map style). */
  FORCE_NIGHT,
}

/**
 * Provides directions based on travel for a 4-wheeled, motorized vehicle. For example, a car or
 * two-wheeler, walking, taxi, cycling.
 */
export enum TravelMode {
  /** Provides directions based on travel for a 4-wheeled, motorized vehicle. */
  DRIVING = 0,
  /** Provides directions based on travel for a bicycle. */
  CYCLING,
  /** Provides directions based on walking. */
  WALKING,
  /** Provides directions based on travel for 2-wheeled, motorized transport. */
  TWO_WHEELER,
  /** Provides directions on routes for a vehicle authorized to use taxi lanes. */
  TAXI,
}

/**
 * The routing strategy specifies how routes are ranked, which affects the route that is chosen
 * initially, and during re-routing. The default is {@link #DEFAULT_BEST}.
 */
export enum RoutingStrategy {
  /** Ranks routes by NavSDK's default cost model. This is the default routing strategy for navigating. */
  DEFAULT_BEST = 0,
  /** Ranks routes by distance, shortest first. */
  SHORTER,
  /** Ranks routes based on absolute delta to each distance provided by meters. */
  TARGET_DISTANCE,
}

/**
 * Desired display strategy for showing alternate routes.
 */
export enum AlternateRoutingStrategy {
  /** Show all available alternate routes. */
  SHOW_ALL = 0,
  /** Do not show alternate routes. */
  SHOW_NONE,
  /** Show at most one alternate route. */
  SHOW_ONE,
}

/**
 * A set of values used to specify the severity levels of speed alerts.
 */
export enum SpeedAlertSeverity {
  /**
   * Speed alert triggered when speeding above the speed limit by a major percentage, or speeding
   * for more than specified time, which are configured.
   */
  MAJOR = 0,
  /**
   * Speed alert triggered when speeding above the speed limit by a minor percentage that is
   * configured.
   */
  MINOR,
  /**
   * Speed alert not triggered, meaning one of the following conditions is satisfied:
   * - The speed is unknown.
   * - The speed limit is unknown.
   * - The driver is not speeding according to the thresholds configured.
   */
  NONE,
}

/**
 * The possible status values of the NavigationTrafficData.
 */
export enum Status {
  /** Traffic available */
  OK = 0,
  /** Traffic information not available */
  UNAVAILABLE,
}

/**
 * AudioGuidance is a set of flags used to specify what kinds of audio alerts and guidance are
 * used during navigation.
 */
export enum AudioGuidance {
  /**
   * Specifies that voice guidance should be transmitted over Bluetooth if available. This flag
   * must be combined with VOICE_ALERTS_ONLY or VOICE_ALERTS_AND_GUIDANCE to
   * have any effect.
   */
  BLUETOOTH_AUDIO = 8,
  /**
   * Specifies that voice guidance and vibrations should be disabled. This flag should always be
   * specified by itself; it is a mistake to combine this with any other AudioGuidance
   * flags.
   */
  SILENT = 0,
  /** Specifies that vibrations should be enabled. */
  VIBRATION = 1,
  /**
   * Specifies that voice should be enabled for both alerts and turn-by-turn guidance
   * instructions. Note that this value alone will not allow voice guidance to be played over
   * Bluetooth; to enable that, BLUETOOTH_AUDIO should be added.
   */
  VOICE_ALERTS_AND_GUIDANCE = 4,
  /**
   * Specifies that voice should be enabled for alerts only (e.g., traffic incidents) but not for
   * turn-by-turn guidance instructions. Note that this value alone will not allow voice guidance
   * to be played over Bluetooth; to enable that, BLUETOOTH_AUDIO should be added.
   */
  VOICE_ALERTS_ONLY = 2,
}

/**
 * Defines an individual road stretch within a route polyline, and its rendering style based on
 * traffic conditions. This is a NavSDK equivalent of the Google Maps RoadStretch.
 */
export enum Style {
  /** No style selected. */
  UNKNOWN = 0,
  /** Traffic is slowing down. */
  SLOWER_TRAFFIC,
  /** There is a traffic jam. */
  TRAFFIC_JAM,
}

/**
 * A RouteStatus is a status code that represents the result of a route calculation, accessed via
 * the returned of setDestinations.
 */
export enum RouteStatus {
  /** A route to the destination was successfully calculated. */
  OK,
  /** A route to the destination could not be calculated. */
  NO_ROUTE_FOUND,
  /** A route to the destination could not be calculated because of a network error. */
  NETWORK_ERROR,
  /** A route to the destination could not be calculated because of insufficient quota. */
  QUOTA_CHECK_FAILED,
  /** The route calculation was canceled in favor of a newer one. */
  ROUTE_CANCELED,
  /** A route could not be calculated because the device location was not obtained in time. */
  LOCATION_DISABLED,
  /** A route could not be calculated because the location could not be resolved in time. */
  LOCATION_UNKNOWN,
  /**
   * The navigator could not calculate a route because the request contained an unrecognized
   * waypoint, or too many waypoints. For example, a waypoint may be unrecognized if it contains a
   * stale or invalid place ID.
   */
  WAYPOINT_ERROR,
  /** An invalid place it was used to define the route, check if that exists or if that has expired. */
  INVALID_PLACE_ID,
  /** An unknown error has happened to generate the route. */
  UNKNOWN,
}

/**
 * An ErrorCode is a status code returned by when trying to retrieve the Navigator
 * but that could not be successfully obtained.
 */
export enum NavigationInitErrorCode {
  /**
   * The API key you supplied is not authorized to use the Navigation API. You may need to request
   * provisioning of the Navigation SDK through your Google Maps APIs representative. Your app
   * should fall back to another navigation mechanism if this code is received.
   */
  NOT_AUTHORIZED = 1,
  /** The user has not accepted Google's Navigation terms. */
  TERMS_NOT_ACCEPTED,
  /** The Navigation API is unable to access the internet. */
  NETWORK_ERROR,
  /** The app was not allowed to access the device's location or permission is yet to be granted. */
  LOCATION_PERMISSION_MISSING,
}

/**
 * Indicates how heavy traffic is.
 */
export enum DelaySeverity {
  /** No traffic data available. */
  NO_DATA = 0,
  /** Heavy traffic in the route. */
  HEAVY,
  /** Medium traffic in the route. */
  MEDIUM,
  /** Light traffic in the route. */
  LIGHT,
}

/**
 * Defines an individual road stretch within a route polyline, and its rendering style based on
 * traffic conditions. This is a NavSDK equivalent of the Google Maps RoadStretch.
 */
export interface NavigationRoadStretchRenderingData {
  /** Names of the rendering styles that can be applied to a road stretch. */
  style: Style;
  /**
   * Returns the offset of the road stretch relative to the start of the polyline (within which the
   * road stretch is defined), in meters.
   * In other words, the offset indicates how far into the polyline this particular road stretch
   * begins.
   */
  offsetMeters: number;
  /** Sets the length of the road stretch, in meters. */
  lengthMeters: number;
}

/**
 * Contains traffic data for a single "leg" of a journey (as represented by a RouteSegment)
 * relative to the current location of the vehicle.
 */
export interface NavigationTrafficData {
  /** The possible status values of the NavigationTrafficData */
  status: Status;
  /**
   * List of individual road stretch within a route polyline,
   * and its rendering style based on traffic conditions
   * @platform Android: Supported
   * @platform iOS: Not Supported
   */
  roadStretchRenderingDataList: NavigationRoadStretchRenderingData[];
}

/**
 * Represents a single "leg" of a journey, either from
 * the device's current position to the destination, or from one destination to a subsequent
 * destination, along with NavigationTrafficData along the segment.
 */
export interface RouteSegment {
  /**
   * The final LatLng in this segment. Note that this will in general not be the same location as
   * the destination Waypoint, unless the Waypoint is positioned directly on a road.
   */
  destinationLatLng: LatLng;
  /** The destination waypoint associated with this segment of the route. */
  destinationWaypoint: Waypoint;
  /** The traffic data associated with this segment of the route. */
  navigationTrafficData?: NavigationTrafficData;
  /** An array of LatLngs that represent the route segment. */
  segmentLatLngList: LatLng[];
}

/**
 * Used to specify navigation destinations. It may be constructed from
 * a latitude/longitude pair, or a Google Place ID.
 */
export interface Waypoint {
  /** The ID of the place used for this waypoint in case you are not using the position attribute */
  placeId?: string;
  /** The text to display for the waypoint in the notification tray */
  title?: string;
  /** The value for the vehicleStopover preference. */
  vehicleStopover?: boolean;
  /**
   * Whether it is preferred to route the driver to the same side of the
   * road. The route will arrive on the preferred side of the road unless there is a significant
   * delay caused by a road closure or slow-moving traffic.
   */
  preferSameSideOfRoad?: boolean;
  /** The location of the waypoint in case you are not using the placeId attribute. */
  position?: LatLng;
  /** Angle expressed in degrees [0, 360], where 0 means North. */
  preferredHeading?: number;
}

/**
 * Represents both time and distance to a destination.
 */
export interface TimeAndDistance {
  /** Indicates how heavy traffic is. */
  delaySeverity: DelaySeverity;
  /** Meters remaining to get to the destination waypoint */
  meters: number;
  /** Seconds remaining to get to the destination waypoint */
  seconds: number;
}
