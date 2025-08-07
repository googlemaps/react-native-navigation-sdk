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

import { Platform } from 'react-native';
import { type LatLng, type Location } from '../../shared';
import { useRef } from 'react';
import type { EventSubscription } from 'react-native';
import type {
  Waypoint,
  AudioGuidance,
  RouteSegment,
  TimeAndDistance,
  NavigationInitializationStatus,
  RouteStatus,
} from '../types';
import {
  type TermsAndConditionsDialogOptions,
  type NavigationController,
  type RoutingOptions,
  type SpeedAlertOptions,
  type LocationSimulationOptions,
  TaskRemovedBehavior,
  type DisplayOptions,
  type ArrivalEvent,
  type TurnByTurnEvent,
  type NavigationCallbackListenerSetters,
} from './types';
import { NavModule } from '../../native';

export const useNavigationController = (
  termsAndConditionsDialogOptions: TermsAndConditionsDialogOptions,
  taskRemovedBehavior: TaskRemovedBehavior = TaskRemovedBehavior.CONTINUE_SERVICE
): {
  navigationController: NavigationController;
} => {
  const subscriptions = useRef<Record<string, EventSubscription | null>>({});

  const createSetter =
    <T extends (...args: any[]) => void>(eventName: string) =>
    (callback: T | null) => {
      subscriptions.current[eventName]?.remove();
      subscriptions.current[eventName] = null;

      if (callback && (NavModule as any)[eventName] != null) {
        // Fix me
        subscriptions.current[eventName] = (NavModule as any)[eventName](
          callback
        );
      }
    };

  const eventListenerControllers: NavigationCallbackListenerSetters = {
    setOnNavigationReadyListener: createSetter<() => void>('onNavigationReady'),
    setOnStartGuidanceListener: createSetter<() => void>('onStartGuidance'),
    setOnArrivalListener:
      createSetter<(arrivalEvent: ArrivalEvent) => void>('onArrival'),
    setOnLocationChangedListener:
      createSetter<(location: Location) => void>('onLocationChanged'),
    setOnRawLocationChangedListener: createSetter<(location: Location) => void>(
      'onRawLocationChanged'
    ),
    setOnRouteChangedListener: createSetter<() => void>('onRouteChanged'),
    setOnReroutingRequestedByOffRouteListener: createSetter<() => void>(
      'onReroutingRequestedByOffRoute'
    ),
    setOnTrafficUpdatedListener: createSetter<() => void>('onTrafficUpdated'),
    setOnRemainingTimeOrDistanceChangedListener: createSetter<() => void>(
      'onRemainingTimeOrDistanceChanged'
    ),
    setOnTurnByTurnListener:
      createSetter<(turnByTurnEvents: TurnByTurnEvent[]) => void>(
        'onTurnByTurn'
      ),
    setLogDebugInfoListener:
      createSetter<(message: string) => void>('logDebugInfo'),

    removeAllListeners: () => {
      Object.keys(subscriptions.current).forEach((key) => {
        subscriptions.current[key]?.remove();
        subscriptions.current[key] = null;
      });
    },
  };

  const navigationController: NavigationController = {
    ...eventListenerControllers,
    init: async (): Promise<NavigationInitializationStatus> => {
      try {
        return (await NavModule.initializeNavigator(
          termsAndConditionsDialogOptions,
          taskRemovedBehavior
        )) as unknown as NavigationInitializationStatus;
      } catch (error) {
        console.error('Error initializing navigator:', error);
        return Promise.reject(error);
      }
    },

    cleanup: async () => {
      eventListenerControllers.removeAllListeners();
      await NavModule.cleanup();
    },

    setDestination: async (
      waypoint: Waypoint,
      routingOptions?: RoutingOptions,
      displayOptions?: DisplayOptions
    ) => {
      return (await NavModule.setDestinations(
        [waypoint],
        routingOptions || {},
        displayOptions || {}
      )) as unknown as RouteStatus;
    },

    setDestinations: async (
      waypoints: Waypoint[],
      routingOptions?: RoutingOptions,
      displayOptions?: DisplayOptions
    ) => {
      return (await NavModule.setDestinations(
        waypoints,
        routingOptions || {},
        displayOptions || {}
      )) as unknown as RouteStatus;
    },

    continueToNextDestination: async () => {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          `[DEPRECATED] continueToNextDestination() is deprecated. Use \`setDestinations(...)\` with the new list of destinations instead.`
        );
      }
      return NavModule.continueToNextDestination();
    },

    clearDestinations: async () => {
      return NavModule.clearDestinations();
    },

    startGuidance: async () => {
      return NavModule.startGuidance();
    },

    stopGuidance: async () => {
      return NavModule.stopGuidance();
    },

    setSpeedAlertOptions: async (alertOptions: SpeedAlertOptions | null) => {
      return NavModule.setSpeedAlertOptions(alertOptions);
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
      return NavModule.areTermsAccepted();
    },

    getCurrentRouteSegment: async (): Promise<RouteSegment> => {
      return NavModule.getCurrentRouteSegment();
    },

    getRouteSegments: async (): Promise<RouteSegment[]> => {
      return NavModule.getRouteSegments();
    },

    getCurrentTimeAndDistance: async (): Promise<TimeAndDistance> => {
      return NavModule.getCurrentTimeAndDistance();
    },

    getTraveledPath: async (): Promise<LatLng[]> => {
      return NavModule.getTraveledPath();
    },

    getNavSDKVersion: async (): Promise<string> => {
      return NavModule.getNavSDKVersion();
    },

    stopUpdatingLocation: async () => {
      return NavModule.stopUpdatingLocation();
    },

    startUpdatingLocation: async () => {
      return NavModule.startUpdatingLocation();
    },

    simulator: {
      simulateLocation: (location: LatLng) => {
        return NavModule.simulateLocation(location);
      },
      resumeLocationSimulation: () => {
        return NavModule.resumeLocationSimulation();
      },
      pauseLocationSimulation: () => {
        return NavModule.pauseLocationSimulation();
      },
      simulateLocationsAlongExistingRoute: ({
        speedMultiplier,
      }: LocationSimulationOptions) => {
        return NavModule.simulateLocationsAlongExistingRoute({
          speedMultiplier,
        });
      },
      stopLocationSimulation: () => {
        return NavModule.stopLocationSimulation();
      },
    },
  };

  return {
    navigationController,
  };
};
