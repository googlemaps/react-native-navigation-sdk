/**
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { CodegenTypes, TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import type { RouteSegment, TimeAndDistance } from '../navigation/types';
import type { LatLng } from '../shared';

// Note: Using Double instead of Int32 as codegen for TurboModules currently
// fails to unbox values to Integer on iOS. Transporting the value to integer is
// done in the native code.

// Explicitly define the types for codegen objects, to
// have exact types for the generated native code.
// Codegen currently cannot crawl through the files to infer types,
// and therefore we need to explicitly define all types here used in the
// codegen objects. This is a limitation of the current codegen system.

type LatLngSpec = Readonly<{
  lat: CodegenTypes.Float;
  lng: CodegenTypes.Float;
}>;

type LocationSpec = Readonly<{
  lat: CodegenTypes.Float;
  lng: CodegenTypes.Float;
  altitude?: CodegenTypes.Float;
  bearing?: CodegenTypes.Float;
  speed: CodegenTypes.Float;
  accuracy?: CodegenTypes.Float;
  verticalAccuracy?: CodegenTypes.Float;
  provider?: string;
  time: CodegenTypes.Double;
}>;

type WaypointSpec = Readonly<{
  placeId?: string;
  title?: string;
  vehicleStopover?: boolean;
  preferSameSideOfRoad?: boolean;
  position?: LatLngSpec;
  preferredHeading?: CodegenTypes.Double;
}>;

type RoutingOptionsSpec = Readonly<{
  valid?: CodegenTypes.WithDefault<boolean, false>;
  travelMode?: CodegenTypes.Double;
  routingStrategy?: CodegenTypes.Double;
  alternateRoutesStrategy?: CodegenTypes.Double;
  avoidFerries?: boolean;
  avoidTolls?: boolean;
  avoidHighways?: boolean;
}>;

type DisplayOptionsSpec = Readonly<{
  valid?: CodegenTypes.WithDefault<boolean, false>;
  showDestinationMarkers?: boolean;
}>;

type RouteTokenOptionsSpec = Readonly<{
  valid?: CodegenTypes.WithDefault<boolean, false>;
  routeToken: string;
  travelMode?: CodegenTypes.Double;
}>;

type SpeedAlertOptionsSpec = Readonly<{
  valid?: CodegenTypes.WithDefault<boolean, false>;
  majorSpeedAlertPercentThreshold: CodegenTypes.Float;
  minorSpeedAlertPercentThreshold: CodegenTypes.Float;
  severityUpgradeDurationSeconds: CodegenTypes.Double;
}>;

type LocationSimulationOptionsSpec = Readonly<{
  readonly speedMultiplier: CodegenTypes.Float;
}>;

type AudioGuidanceSettingsSpec = Readonly<{
  guidanceMode: CodegenTypes.Double;
  vibrationEnabled: boolean;
  bluetoothAudioEnabled: boolean;
}>;

type ArrivalEventSpec = Readonly<{
  waypoint: WaypointSpec;
  isFinalDestination?: boolean;
}>;

type ContinueToNextDestinationResponseSpec = Readonly<{
  waypoint: WaypointSpec | null;
  routeStatus?: string;
}>;

type TimeAndDistanceSpec = Readonly<{
  delaySeverity: CodegenTypes.Double;
  meters: CodegenTypes.Double;
  seconds: CodegenTypes.Double;
}>;

type TurnByTurnEventSpec = Readonly<{
  navState: CodegenTypes.Double;
  routeChanged: boolean;
  distanceToCurrentStepMeters?: CodegenTypes.Double;
  distanceToFinalDestinationMeters?: CodegenTypes.Double;
  timeToCurrentStepSeconds?: CodegenTypes.Double;
  distanceToNextDestinationMeters?: CodegenTypes.Double;
  timeToNextDestinationSeconds?: CodegenTypes.Double;
  timeToFinalDestinationSeconds?: CodegenTypes.Double;
  currentStep?: StepInfoSpec;
  getRemainingSteps: ReadonlyArray<StepInfoSpec>;
}>;

// This mirrors the fields emitted by Android's StepInfo and iOS's
// GMSNavigationStepInfo. Keep it aligned with the public StepInfo type.
type StepInfoSpec = Readonly<{
  instruction?: string;
  fullRoadName?: string;
  simpleRoadName?: string;
  maneuver: CodegenTypes.Double;
  drivingSide: CodegenTypes.Double;
  stepNumber?: CodegenTypes.Double;
  distanceFromPrevStepMeters?: CodegenTypes.Double;
  timeFromPrevStepSeconds?: CodegenTypes.Double;
  exitNumber?: string;
  roundaboutTurnNumber?: CodegenTypes.Double;
}>;

enum RouteStatusSpec {
  OK,
  NO_ROUTE_FOUND,
  NETWORK_ERROR,
  QUOTA_CHECK_FAILED,
  ROUTE_CANCELED,
  LOCATION_DISABLED,
  LOCATION_UNKNOWN,
  WAYPOINT_ERROR,
  INVALID_PLACE_ID,
  DUPLICATE_WAYPOINTS_ERROR,
  UNKNOWN,
  /** Android only: the route calculation request timed out on the routing backend. */
  ROUTING_TIMEOUT,
}

type TermsAndConditionsUIParamsSpec = Readonly<{
  valid?: CodegenTypes.WithDefault<boolean, false>;
  backgroundColor?: CodegenTypes.Double;
  titleColor?: CodegenTypes.Double;
  mainTextColor?: CodegenTypes.Double;
  acceptButtonTextColor?: CodegenTypes.Double;
  cancelButtonTextColor?: CodegenTypes.Double;
}>;

export interface Spec extends TurboModule {
  // Terms and conditions methods
  areTermsAccepted(): Promise<boolean>;
  showTermsAndConditionsDialog(
    title: string,
    companyName: string,
    showOnlyDisclaimer: boolean,
    uiParams: TermsAndConditionsUIParamsSpec
  ): Promise<boolean>;
  resetTermsAccepted(): Promise<void>;

  // Navigation session initialization
  initializeNavigationSession(
    abnormalTerminationReportingEnabled: boolean,
    taskRemovedBehavior: CodegenTypes.Double
  ): Promise<void>;
  cleanup(): Promise<void>;
  setDestinations(
    waypoints: WaypointSpec[],
    routingOptions: RoutingOptionsSpec,
    displayOptions: DisplayOptionsSpec,
    routeTokenOptions: RouteTokenOptionsSpec
  ): Promise<RouteStatusSpec>;
  continueToNextDestination(): Promise<ContinueToNextDestinationResponseSpec>;
  clearDestinations(): Promise<void>;
  startGuidance(): Promise<void>;
  stopGuidance(): Promise<void>;
  setSpeedAlertOptions(alertOptions: SpeedAlertOptionsSpec): Promise<void>;
  setAbnormalTerminatingReportingEnabled(enabled: boolean): void;
  setAudioGuidanceType(index: CodegenTypes.Double): Promise<void>;
  setAudioGuidanceSettings(settings: AudioGuidanceSettingsSpec): Promise<void>;
  setBackgroundLocationUpdatesEnabled(isEnabled: boolean): void;
  setTurnByTurnLoggingEnabled(isEnabled: boolean): void;
  getCurrentRouteSegment(): Promise<RouteSegment>;
  getRouteSegments(): Promise<RouteSegment[]>;
  getCurrentTimeAndDistance(): Promise<TimeAndDistance>;
  getTraveledPath(): Promise<LatLng[]>;
  getNavSDKVersion(): Promise<string>;
  stopUpdatingLocation(): Promise<void>;
  startUpdatingLocation(): Promise<void>;
  simulateLocation(location: LatLngSpec): Promise<void>;
  resumeLocationSimulation(): Promise<void>;
  pauseLocationSimulation(): Promise<void>;
  simulateLocationsAlongExistingRoute(
    options: LocationSimulationOptionsSpec
  ): Promise<void>;
  stopLocationSimulation(): Promise<void>;

  // Event emitters
  onLocationChanged: CodegenTypes.EventEmitter<{ location: LocationSpec }>;
  onArrival: CodegenTypes.EventEmitter<{ arrivalEvent: ArrivalEventSpec }>;
  onRemainingTimeOrDistanceChanged: CodegenTypes.EventEmitter<{
    timeAndDistance: TimeAndDistanceSpec;
  }>;
  onRouteChanged: CodegenTypes.EventEmitter<void>;
  onReroutingRequestedByOffRoute: CodegenTypes.EventEmitter<void>;
  onStartGuidance: CodegenTypes.EventEmitter<void>;
  onTurnByTurn: CodegenTypes.EventEmitter<{
    turnByTurnEvents: ReadonlyArray<TurnByTurnEventSpec>;
  }>;
  onRawLocationChanged: CodegenTypes.EventEmitter<{ location: LocationSpec }>; // Android only
  onTrafficUpdated: CodegenTypes.EventEmitter<void>; // Android only
  logDebugInfo: CodegenTypes.EventEmitter<{ message: string }>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NavModule');
export type { Spec as NavModuleSpec };
