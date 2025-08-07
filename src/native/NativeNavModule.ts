/**
 * Copyright 2025 Google LLC
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

import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import type { RouteSegment, TimeAndDistance } from '../navigation/types';

import type {
  Float,
  EventEmitter,
  Double,
} from 'react-native/Libraries/Types/CodegenTypes';
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
  lat: Float;
  lng: Float;
}>;

type LocationSpec = Readonly<{
  lat: Float;
  lng: Float;
  altitude?: Float;
  bearing?: Float;
  speed: Float;
  accuracy?: Float;
  verticalAccuracy?: Float;
  provider?: string;
  time: Double;
}>;

type WaypointSpec = Readonly<{
  placeId?: string;
  title?: string;
  vehicleStopover?: boolean;
  preferSameSideOfRoad?: boolean;
  position?: LatLngSpec;
  preferredHeading?: Double;
}>;

type RoutingOptionsSpec = Readonly<{
  travelMode?: Double;
  routingStrategy?: Double;
  alternateRoutesStrategy?: Double;
  avoidFerries?: boolean;
  avoidTolls?: boolean;
  avoidHighways?: boolean;
}>;

type DisplayOptionsSpec = Readonly<{
  showDestinationMarkers?: boolean;
  showStopSigns?: boolean;
  showTrafficLights?: boolean;
}>;

type SpeedAlertOptionsSpec = Readonly<{
  majorSpeedAlertPercentThreshold: Float;
  minorSpeedAlertPercentThreshold: Float;
  severityUpgradeDurationSeconds: Double;
}>;

type LocationSimulationOptionsSpec = Readonly<{
  readonly speedMultiplier: Float;
}>;

type ArrivalEventSpec = Readonly<{
  waypoint: WaypointSpec;
  isFinalDestination?: boolean;
}>;

type TurnByTurnEventSpec = Readonly<{
  navState: Double;
  routeChanged: boolean;
  distanceToCurrentStepMeters?: Double;
  distanceToFinalDestinationMeters?: Double;
  timeToCurrentStepSeconds?: Double;
  distanceToNextDestinationMeters?: Double;
  timeToNextDestinationSeconds?: Double;
  timeToFinalDestinationSeconds?: Double;
  currentStep?: StepInfoSpec;
  getRemainingSteps: ReadonlyArray<StepInfoSpec>;
}>;

type StepInfoSpec = Readonly<{
  instruction: string;
  distanceMeters: Double;
  durationSeconds: Double;
  maneuver: string;
  position: LatLngSpec;
}>;

enum NavigationInitializationStatusSpec {
  UNKNOWN,
  NOT_AUTHORIZED,
  TERMS_NOT_ACCEPTED,
  NETWORK_ERROR,
  LOCATION_PERMISSION_MISSING,
}

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
  UNKNOWN,
}

type TOSDialogOptionsSpec = Readonly<{
  title?: string;
  companyName?: string;
  showOnlyDisclaimer?: boolean;
}>;

export interface Spec extends TurboModule {
  initializeNavigator(
    termsAndConditionsDialogOptions: TOSDialogOptionsSpec,
    taskRemovedBehavior: Double
  ): Promise<NavigationInitializationStatusSpec>;
  cleanup(): Promise<void>;
  setDestinations(
    waypoints: WaypointSpec[],
    routingOptions?: RoutingOptionsSpec,
    displayOptions?: DisplayOptionsSpec
  ): Promise<RouteStatusSpec>;
  continueToNextDestination(): Promise<void>;
  clearDestinations(): Promise<void>;
  startGuidance(): Promise<void>;
  stopGuidance(): Promise<void>;
  setSpeedAlertOptions(
    alertOptions: SpeedAlertOptionsSpec | null
  ): Promise<void>;
  setAbnormalTerminatingReportingEnabled(enabled: boolean): void;
  setAudioGuidanceType(index: Double): Promise<void>;
  setBackgroundLocationUpdatesEnabled(isEnabled: boolean): void;
  setTurnByTurnLoggingEnabled(isEnabled: boolean): void;
  areTermsAccepted(): Promise<boolean>;
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
  resetTermsAccepted(): void;

  // Event emitters
  onNavigationReady: EventEmitter<void>;
  onLocationChanged: EventEmitter<{ location: LocationSpec }>;
  onArrival: EventEmitter<{ arrivalEvent: ArrivalEventSpec }>;
  onRemainingTimeOrDistanceChanged: EventEmitter<void>;
  onRouteChanged: EventEmitter<void>;
  onReroutingRequestedByOffRoute: EventEmitter<void>;
  onStartGuidance: EventEmitter<void>;
  onTurnByTurn: EventEmitter<{
    turnByTurnEvents: ReadonlyArray<TurnByTurnEventSpec>;
  }>;
  onRawLocationChanged: EventEmitter<{ location: LocationSpec }>; // Android only
  onTrafficUpdated: EventEmitter<void>; // Android only
  logDebugInfo: EventEmitter<{ message: string }>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NavModule');
export interface NavModuleSpec extends Spec {}
