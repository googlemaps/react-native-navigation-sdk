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
import { useMemo, useCallback, useRef } from 'react';
import {
  useEventSubscription,
  type LatLng,
  type Location,
  processColorValue,
} from '../../shared';
import type {
  Waypoint,
  AudioGuidance,
  RouteSegment,
  TimeAndDistance,
  RouteStatus,
} from '../types';
import { NavigationSessionStatus } from '../types';
import {
  TaskRemovedBehavior,
  type TurnByTurnEvent,
  type SetDestinationsOptions,
  type TermsAndConditionsDialogOptions,
  type NavigationController,
  type SpeedAlertOptions,
  type LocationSimulationOptions,
  type ArrivalEvent,
} from './types';

const { NavModule } = NativeModules;

/**
 * Individual listener setters type - maps each callback key to a setter function.
 */
export type NavigationListenerSetters = {
  setOnStartGuidance: (callback: (() => void) | null | undefined) => void;
  setOnArrival: (
    callback: ((arrivalEvent: ArrivalEvent) => void) | null | undefined
  ) => void;
  setOnLocationChanged: (
    callback: ((location: Location) => void) | null | undefined
  ) => void;
  setOnRawLocationChanged: (
    callback: ((location: Location) => void) | null | undefined
  ) => void;
  setOnNavigationReady: (callback: (() => void) | null | undefined) => void;
  setOnRouteChanged: (callback: (() => void) | null | undefined) => void;
  setOnReroutingRequestedByOffRoute: (
    callback: (() => void) | null | undefined
  ) => void;
  setOnTrafficUpdated: (callback: (() => void) | null | undefined) => void;
  setOnRemainingTimeOrDistanceChanged: (
    callback: ((timeAndDistance: TimeAndDistance) => void) | null | undefined
  ) => void;
  setOnTurnByTurn: (
    callback: ((turnByTurnEvents: TurnByTurnEvent[]) => void) | null | undefined
  ) => void;
  setLogDebugInfo: (
    callback: ((message: string) => void) | null | undefined
  ) => void;
};

/**
 * Hook result that provides navigation controller and event setters.
 */
export interface UseNavigationControllerResult
  extends NavigationListenerSetters {
  /** Controller for navigation operations */
  navigationController: NavigationController;
  /** Removes all registered listeners */
  removeAllListeners: () => void;
}

/**
 * Hook to create and manage a navigation controller with event subscriptions.
 *
 * @param taskRemovedBehavior - Behavior when task is removed (Android only)
 * @returns Navigation controller and event setter functions
 *
 * @example
 * ```tsx
 * const {
 *   navigationController,
 *   setOnLocationChanged,
 *   setOnArrival,
 *   setOnNavigationReady,
 *   removeAllListeners,
 * } = useNavigationController(
 *   { title: 'Terms of Service', companyName: 'My Company' },
 *   TaskRemovedBehavior.CONTINUE_SERVICE
 * );
 *
 * // Set up event listeners
 * useEffect(() => {
 *   setOnLocationChanged((location) => console.log('Location:', location));
 *   setOnArrival((event) => console.log('Arrived at:', event.waypoint));
 *   setOnNavigationReady(() => console.log('Navigation ready'));
 *
 *   return () => removeAllListeners();
 * }, []);
 *
 * // Use navigation controller - first show ToS dialog, then initialize
 * const termsAccepted = await navigationController.showTermsAndConditionsDialog();
 * // Or override specific options:
 * // const termsAccepted = await navigationController.showTermsAndConditionsDialog({
 * //   uiParams: { backgroundColor: '#FFFFFF' },
 * // });
 *
 * if (termsAccepted) {
 *   await navigationController.init(); // Throws if terms not accepted or other error
 *   await navigationController.setDestination({ placeId: 'ChIJ...' });
 *   await navigationController.startGuidance();
 * }
 * ```
 */
export const useNavigationController = (
  termsAndConditionsDialogOptions: TermsAndConditionsDialogOptions,
  taskRemovedBehavior: TaskRemovedBehavior = TaskRemovedBehavior.CONTINUE_SERVICE
): UseNavigationControllerResult => {
  // Store callbacks in refs so they can be updated without re-subscribing
  const onStartGuidanceRef = useRef<(() => void) | null>(null);
  const onArrivalRef = useRef<((event: ArrivalEvent) => void) | null>(null);
  const onLocationChangedRef = useRef<((location: Location) => void) | null>(
    null
  );
  const onRawLocationChangedRef = useRef<((location: Location) => void) | null>(
    null
  );
  const onNavigationReadyRef = useRef<(() => void) | null>(null);
  const onRouteChangedRef = useRef<(() => void) | null>(null);
  const onReroutingRequestedByOffRouteRef = useRef<(() => void) | null>(null);
  const onTrafficUpdatedRef = useRef<(() => void) | null>(null);
  const onRemainingTimeOrDistanceChangedRef = useRef<
    ((timeAndDistance: TimeAndDistance) => void) | null
  >(null);
  const onTurnByTurnRef = useRef<
    ((turnByTurnEvents: TurnByTurnEvent[]) => void) | null
  >(null);
  const logDebugInfoRef = useRef<((message: string) => void) | null>(null);

  // Subscribe to events at the top level, routing to refs
  useEventSubscription('NavModule', 'onStartGuidance', () => {
    onStartGuidanceRef.current?.();
  });

  useEventSubscription<{ location: Location }>(
    'NavModule',
    'onLocationChanged',
    payload => {
      onLocationChangedRef.current?.(payload.location);
    }
  );

  useEventSubscription<{ location: Location }>(
    'NavModule',
    'onRawLocationChanged',
    payload => {
      onRawLocationChangedRef.current?.(payload.location);
    }
  );

  useEventSubscription('NavModule', 'onRouteChanged', () => {
    onRouteChangedRef.current?.();
  });

  useEventSubscription('NavModule', 'onReroutingRequestedByOffRoute', () => {
    onReroutingRequestedByOffRouteRef.current?.();
  });

  useEventSubscription('NavModule', 'onTrafficUpdated', () => {
    onTrafficUpdatedRef.current?.();
  });

  useEventSubscription<{ timeAndDistance: TimeAndDistance }>(
    'NavModule',
    'onRemainingTimeOrDistanceChanged',
    payload => {
      onRemainingTimeOrDistanceChangedRef.current?.(payload.timeAndDistance);
    }
  );

  useEventSubscription<{ arrivalEvent: ArrivalEvent }>(
    'NavModule',
    'onArrival',
    payload => {
      onArrivalRef.current?.(payload.arrivalEvent);
    }
  );

  useEventSubscription<{ turnByTurnEvents: TurnByTurnEvent[] }>(
    'NavModule',
    'onTurnByTurn',
    payload => {
      onTurnByTurnRef.current?.(payload.turnByTurnEvents);
    }
  );

  useEventSubscription<{ message: string }>(
    'NavModule',
    'logDebugInfo',
    payload => {
      logDebugInfoRef.current?.(payload.message);
    }
  );

  // Create setter functions
  const setOnStartGuidance = useCallback(
    (callback: (() => void) | null | undefined) => {
      onStartGuidanceRef.current = callback ?? null;
    },
    []
  );

  const setOnArrival = useCallback(
    (callback: ((event: ArrivalEvent) => void) | null | undefined) => {
      onArrivalRef.current = callback ?? null;
    },
    []
  );

  const setOnLocationChanged = useCallback(
    (callback: ((location: Location) => void) | null | undefined) => {
      onLocationChangedRef.current = callback ?? null;
    },
    []
  );

  const setOnRawLocationChanged = useCallback(
    (callback: ((location: Location) => void) | null | undefined) => {
      onRawLocationChangedRef.current = callback ?? null;
    },
    []
  );

  const setOnNavigationReady = useCallback(
    (callback: (() => void) | null | undefined) => {
      onNavigationReadyRef.current = callback ?? null;
    },
    []
  );

  const setOnRouteChanged = useCallback(
    (callback: (() => void) | null | undefined) => {
      onRouteChangedRef.current = callback ?? null;
    },
    []
  );

  const setOnReroutingRequestedByOffRoute = useCallback(
    (callback: (() => void) | null | undefined) => {
      onReroutingRequestedByOffRouteRef.current = callback ?? null;
    },
    []
  );

  const setOnTrafficUpdated = useCallback(
    (callback: (() => void) | null | undefined) => {
      onTrafficUpdatedRef.current = callback ?? null;
    },
    []
  );

  const setOnRemainingTimeOrDistanceChanged = useCallback(
    (
      callback: ((timeAndDistance: TimeAndDistance) => void) | null | undefined
    ) => {
      onRemainingTimeOrDistanceChangedRef.current = callback ?? null;
    },
    []
  );

  const setOnTurnByTurn = useCallback(
    (
      callback:
        | ((turnByTurnEvents: TurnByTurnEvent[]) => void)
        | null
        | undefined
    ) => {
      onTurnByTurnRef.current = callback ?? null;
    },
    []
  );

  const setLogDebugInfo = useCallback(
    (callback: ((message: string) => void) | null | undefined) => {
      logDebugInfoRef.current = callback ?? null;
    },
    []
  );

  const removeAllListeners = useCallback(() => {
    onStartGuidanceRef.current = null;
    onArrivalRef.current = null;
    onLocationChangedRef.current = null;
    onRawLocationChangedRef.current = null;
    onNavigationReadyRef.current = null;
    onRouteChangedRef.current = null;
    onReroutingRequestedByOffRouteRef.current = null;
    onTrafficUpdatedRef.current = null;
    onRemainingTimeOrDistanceChangedRef.current = null;
    onTurnByTurnRef.current = null;
    logDebugInfoRef.current = null;
  }, []);

  const setDestinationsImpl = async (
    waypoints: Waypoint[],
    options?: SetDestinationsOptions
  ) => {
    const { routingOptions, displayOptions, routeTokenOptions } = options ?? {};
    if (routingOptions && routeTokenOptions) {
      throw new Error(
        'Only one of routingOptions or routeTokenOptions can be provided, not both.'
      );
    }
    // Always send objects with defaults (never null) to ensure safe copying on native side
    const result = await NavModule.setDestinations(
      waypoints,
      routingOptions ? { ...routingOptions, valid: true } : { valid: false },
      displayOptions ? { ...displayOptions, valid: true } : { valid: false },
      routeTokenOptions
        ? { ...routeTokenOptions, valid: true }
        : { valid: false, routeToken: '' }
    );
    // Native module returns a string that matches RouteStatus enum values
    return result as RouteStatus;
  };

  const navigationController: NavigationController = useMemo(
    () => ({
      areTermsAccepted: async (): Promise<boolean> => {
        return await NavModule.areTermsAccepted();
      },

      showTermsAndConditionsDialog: async (
        optionsOverride?: Partial<TermsAndConditionsDialogOptions>
      ): Promise<boolean> => {
        // Merge provider options with any override options
        const mergedOptions = {
          ...termsAndConditionsDialogOptions,
          ...optionsOverride,
          // Deep merge uiParams if both exist
          uiParams:
            optionsOverride?.uiParams ||
            termsAndConditionsDialogOptions.uiParams
              ? {
                  ...termsAndConditionsDialogOptions.uiParams,
                  ...optionsOverride?.uiParams,
                }
              : undefined,
        };

        // Convert ColorValue parameters to color integers for native module
        const uiParams = mergedOptions.uiParams
          ? {
              valid: true,
              backgroundColor:
                processColorValue(mergedOptions.uiParams.backgroundColor) ??
                undefined,
              titleColor:
                processColorValue(mergedOptions.uiParams.titleColor) ??
                undefined,
              mainTextColor:
                processColorValue(mergedOptions.uiParams.mainTextColor) ??
                undefined,
              acceptButtonTextColor:
                processColorValue(
                  mergedOptions.uiParams.acceptButtonTextColor
                ) ?? undefined,
              cancelButtonTextColor:
                processColorValue(
                  mergedOptions.uiParams.cancelButtonTextColor
                ) ?? undefined,
            }
          : { valid: false };

        return await NavModule.showTermsAndConditionsDialog(
          mergedOptions.title,
          mergedOptions.companyName,
          mergedOptions.showOnlyDisclaimer ?? false,
          uiParams
        );
      },

      resetTermsAccepted: async (): Promise<void> => {
        return await NavModule.resetTermsAccepted();
      },

      init: async (): Promise<NavigationSessionStatus> => {
        try {
          await NavModule.initializeNavigationSession(
            true, // abnormalTerminationReportingEnabled - default to true
            taskRemovedBehavior
          );
          // Call the onNavigationReady callback after successful initialization
          onNavigationReadyRef.current?.();
          return NavigationSessionStatus.OK;
        } catch (error) {
          // Convert native error code to NavigationSessionStatus
          if (error && typeof error === 'object' && 'code' in error) {
            const code = (error as { code: string }).code;
            // Map native error codes to NavigationSessionStatus
            const statusMap: Record<string, NavigationSessionStatus> = {
              notAuthorized: NavigationSessionStatus.NOT_AUTHORIZED,
              termsNotAccepted: NavigationSessionStatus.TERMS_NOT_ACCEPTED,
              networkError: NavigationSessionStatus.NETWORK_ERROR,
              locationPermissionMissing:
                NavigationSessionStatus.LOCATION_PERMISSION_MISSING,
            };
            return statusMap[code] ?? NavigationSessionStatus.UNKNOWN_ERROR;
          }
          return NavigationSessionStatus.UNKNOWN_ERROR;
        }
      },

      cleanup: async () => {
        await NavModule.cleanup();
      },

      setDestination: async (
        waypoint: Waypoint,
        options?: SetDestinationsOptions
      ) => {
        return await setDestinationsImpl([waypoint], options);
      },

      setDestinations: async (
        waypoints: Waypoint[],
        options?: SetDestinationsOptions
      ) => {
        return await setDestinationsImpl(waypoints, options);
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
        return await NavModule.setSpeedAlertOptions(
          alertOptions
            ? { ...alertOptions, valid: true }
            : {
                valid: false,
                majorSpeedAlertPercentThreshold: 0,
                minorSpeedAlertPercentThreshold: 0,
                severityUpgradeDurationSeconds: 0,
              }
        );
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
          NavModule.simulateLocationsAlongExistingRoute({ speedMultiplier });
        },
        stopLocationSimulation: () => {
          NavModule.stopLocationSimulation();
        },
      },
    }),
    [termsAndConditionsDialogOptions, taskRemovedBehavior]
  );

  return {
    navigationController,
    removeAllListeners,
    setOnStartGuidance,
    setOnArrival,
    setOnLocationChanged,
    setOnRawLocationChanged,
    setOnNavigationReady,
    setOnRouteChanged,
    setOnReroutingRequestedByOffRoute,
    setOnTrafficUpdated,
    setOnRemainingTimeOrDistanceChanged,
    setOnTurnByTurn,
    setLogDebugInfo,
  };
};
