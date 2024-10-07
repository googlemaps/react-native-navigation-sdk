/**
 * Copyright 2024 Google LLC
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

import { NativeModules, Platform } from 'react-native';
import { useModuleListeners, type LatLng } from '../../shared';
import type {
  Waypoint,
  AudioGuidance,
  RouteSegment,
  TimeAndDistance,
} from '../types';
import type {
  NavigationCallbacks,
  TermsAndConditionsDialogOptions,
  NavigationController,
  RoutingOptions,
  SpeedAlertOptions,
  LocationSimulationOptions,
} from './types';
import { getRouteStatusFromStringValue } from '../navigationView';
import { useMemo } from 'react';

const { NavModule, NavEventDispatcher } = NativeModules;
const androidBridge: string = 'NavJavascriptBridge';

export const useNavigationController = (
  termsAndConditionsDialogOptions: TermsAndConditionsDialogOptions
): {
  navigationController: NavigationController;
  addListeners: (listeners: Partial<NavigationCallbacks>) => void;
  removeListeners: (listeners: Partial<NavigationCallbacks>) => void;
  removeAllListeners: () => void;
} => {
  const eventTransformer = <K extends keyof NavigationCallbacks>(
    eventKey: K,
    ...args: unknown[]
  ) => {
    if (eventKey === 'onRouteStatusResult' && typeof args[0] === 'string') {
      return [getRouteStatusFromStringValue(args[0])];
    }
    return args;
  };

  const moduleListenersHandler = useModuleListeners<NavigationCallbacks>(
    NavEventDispatcher,
    androidBridge,
    [
      'onStartGuidance',
      'onArrival',
      'onLocationChanged',
      'onNavigationReady',
      'onRouteStatusResult',
      'onRawLocationChanged',
      'onRouteChanged',
      'onReroutingRequestedByOffRoute',
      'onTrafficUpdated',
      'onRemainingTimeOrDistanceChanged',
      'onNavigationInitError',
      'onTurnByTurn',
      'logDebugInfo',
    ],
    eventTransformer
  );

  const navigationController: NavigationController = useMemo(
    () => ({
      init: async () => {
        return await NavModule.initializeNavigator(
          termsAndConditionsDialogOptions
        );
      },

      cleanup: async () => {
        moduleListenersHandler.removeAllListeners();
        await NavModule.cleanup();
      },

      setDestination: async (
        waypoint: Waypoint,
        routingOptions?: RoutingOptions
      ) => {
        return await NavModule.setDestination(waypoint, routingOptions);
      },

      setDestinations: async (
        waypoints: Waypoint[],
        routingOptions?: RoutingOptions
      ) => {
        return await NavModule.setDestinations(waypoints, routingOptions);
      },

      continueToNextDestination: async () => {
        return await NavModule.continueToNextDestination();
      },

      clearDestinations: async () => {
        return await NavModule.clearDestinations();
      },

      startGuidance: async () => {
        return await NavModule.startGuidance();
      },

      stopGuidance: async () => {
        return await NavModule.stopGuidance();
      },

      setSpeedAlertOptions: async (alertOptions: SpeedAlertOptions | null) => {
        return await NavModule.setSpeedAlertOptions(alertOptions);
      },

      setAbnormalTerminatingReportingEnabled: (enabled: boolean) => {
        return NavModule.setAbnormalTerminatingReportingEnabled(enabled);
      },

      setAudioGuidanceType: (index: AudioGuidance) => {
        NavModule.setAudioGuidanceType(index);
      },

      setBackgroundLocationUpdatesEnabled: (isEnabled: boolean) => {
        if (Platform.OS === 'ios') {
          NavModule.setBackgroundLocationUpdatesEnabled(isEnabled);
        }
      },

      setTurnByTurnLoggingEnabled: (isEnabled: boolean) => {
        NavModule.setTurnByTurnLoggingEnabled(isEnabled);
      },

      areTermsAccepted: async (): Promise<boolean> => {
        return await NavModule.areTermsAccepted();
      },

      getCurrentRouteSegment: async (): Promise<RouteSegment> => {
        return await NavModule.getCurrentRouteSegment();
      },

      getRouteSegments: async (): Promise<RouteSegment[]> => {
        return await NavModule.getRouteSegments();
      },

      getCurrentTimeAndDistance: async (): Promise<TimeAndDistance> => {
        return await NavModule.getCurrentTimeAndDistance();
      },

      getTraveledPath: async (): Promise<LatLng[]> => {
        return await NavModule.getTraveledPath();
      },

      getNavSDKVersion: async (): Promise<string> => {
        return await NavModule.getNavSDKVersion();
      },

      stopUpdatingLocation: () => {
        NavModule.stopUpdatingLocation();
      },

      startUpdatingLocation: () => {
        NavModule.startUpdatingLocation();
      },

      simulator: {
        simulateLocation: (location: LatLng) => {
          NavModule.simulateLocation(location);
        },
        resumeLocationSimulation: () => {
          NavModule.resumeLocationSimulation();
        },
        pauseLocationSimulation: () => {
          NavModule.pauseLocationSimulation();
        },
        simulateLocationsAlongExistingRoute: ({
          speedMultiplier,
        }: LocationSimulationOptions) => {
          NavModule.simulateLocationsAlongExistingRoute(speedMultiplier);
        },
        stopLocationSimulation: () => {
          NavModule.stopLocationSimulation();
        },
      },
    }),
    [moduleListenersHandler, termsAndConditionsDialogOptions]
  );

  return {
    navigationController,
    ...moduleListenersHandler,
  };
};
