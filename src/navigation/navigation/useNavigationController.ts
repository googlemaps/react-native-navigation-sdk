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

import { useRef, useCallback, useEffect } from 'react';
import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import type { LatLng } from '../../shared';
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

const { NavModule, NavEventDispatcher } = NativeModules;

type ListenerMap = {
  [K in keyof NavigationCallbacks]?: Array<NonNullable<NavigationCallbacks[K]>>;
};

const useNavigationController = (
  termsAndConditionsDialogOptions: TermsAndConditionsDialogOptions
): {
  navigationController: NavigationController;
  addListeners: (listeners: Partial<NavigationCallbacks>) => void;
  removeListeners: (listeners: Partial<NavigationCallbacks>) => void;
  removeAllListeners: () => void;
} => {
  const listenersRef = useRef<ListenerMap>({});
  const eventEmitter: NativeEventEmitter | null = null;

  const getEventEmitter = () => {
    if (!eventEmitter) {
      return new NativeEventEmitter(NavEventDispatcher);
    }
    return eventEmitter;
  };

  // Conversion function to handle different types of data transformation based on the event
  const convert = (eventKey: keyof NavigationCallbacks, ...args: any[]) => {
    if (eventKey === 'onRouteStatusResult' && typeof args[0] === 'string') {
      return [getRouteStatusFromStringValue(args[0])]; // Return as array for consistent callback application
    }
    return args; // For all other events, pass through the arguments unchanged
  };

  const updateListeners = useCallback(() => {
    const wrappedListeners = Object.keys(listenersRef.current).reduce(
      (acc, eventName) => {
        const eventKey = eventName as keyof NavigationCallbacks;
        acc[eventKey] = (...args: any[]) => {
          listenersRef.current[eventKey]?.forEach((callback: any) =>
            callback(...convert(eventKey, ...args))
          );
        };
        return acc;
      },
      {} as {
        [K in keyof NavigationCallbacks]?: (...args: any[]) => void;
      }
    );

    const allEventTypes: Array<keyof NavigationCallbacks> = [
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
      'logDebugInfo',
    ];

    allEventTypes.forEach(eventType => {
      if (!wrappedListeners[eventType]) {
        wrappedListeners[eventType] = () => {};
      }
    });

    // Platform-specific event handling
    if (Platform.OS === 'android') {
      const BatchedBridge = require('react-native/Libraries/BatchedBridge/BatchedBridge');
      BatchedBridge.registerCallableModule(
        'NavJavascriptBridge',
        wrappedListeners
      );
    } else if (Platform.OS === 'ios') {
      allEventTypes.forEach(eventType => {
        getEventEmitter().removeAllListeners(eventType);
        getEventEmitter().addListener(eventType, wrappedListeners[eventType]!);
      });

      return () =>
        allEventTypes.forEach(eventType =>
          getEventEmitter().removeAllListeners(eventType)
        );
    }

    return () => {};
  }, []);

  const addListeners = useCallback(
    (newListeners: Partial<NavigationCallbacks>) => {
      console.log('useNavigationController addListeners called');
      const prevListeners = listenersRef.current;
      const updatedListeners: ListenerMap = { ...prevListeners };
      Object.keys(newListeners).forEach(eventName => {
        const eventKey = eventName as keyof NavigationCallbacks;
        updatedListeners[eventKey] = [
          ...(updatedListeners[eventKey] || []),
          newListeners[eventKey],
        ].filter(Boolean) as Array<NonNullable<() => void>>;
      });
      listenersRef.current = updatedListeners;
      updateListeners();
    },
    [updateListeners]
  );

  const removeListeners = useCallback(
    (listenersToRemove: Partial<NavigationCallbacks>) => {
      console.log('useNavigationController removeListeners called');
      const prevListeners = listenersRef.current;
      const updatedListeners: ListenerMap = { ...prevListeners };
      Object.keys(listenersToRemove).forEach(eventName => {
        const eventKey = eventName as keyof NavigationCallbacks;
        if (updatedListeners[eventKey]) {
          updatedListeners[eventKey] = updatedListeners[eventKey]!.filter(
            listener => listener !== listenersToRemove[eventKey]
          ) as Array<NonNullable<() => void>>;
          if (updatedListeners[eventKey]!.length === 0) {
            delete updatedListeners[eventKey];
          }
        }
      });
      listenersRef.current = updatedListeners;
      updateListeners();
    },
    [updateListeners]
  );

  const removeAllListeners = useCallback(() => {
    Object.keys(listenersRef.current).forEach(eventName => {
      const eventKey = eventName as keyof NavigationCallbacks;
      if (listenersRef.current[eventKey]) {
        listenersRef.current[eventKey] = [];
        if (Platform.OS === 'ios') {
          getEventEmitter().removeAllListeners(eventKey);
        }
      }
    });
    if (Platform.OS === 'android') {
      // Android might need special handling to unregister all events
      const BatchedBridge = require('react-native/Libraries/BatchedBridge/BatchedBridge');
      BatchedBridge.registerCallableModule('NavJavascriptBridge', {});
    }
    console.log('All listeners removed');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      removeAllListeners();
    };
  }, [removeAllListeners]);

  const navigationController: NavigationController = {
    init: async () => {
      return await NavModule.initializeNavigator(
        termsAndConditionsDialogOptions
      );
    },

    cleanup: () => {
      removeAllListeners();
      return NavModule.cleanup();
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
  };

  return {
    navigationController,
    addListeners,
    removeListeners,
    removeAllListeners,
  };
};

export default useNavigationController;
