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
import {NativeModules, Platform} from 'react-native';
import {LatLng} from '../../shared/types';
import {commands, sendCommand} from '../../shared/viewManager';
import {AudioGuidance, RouteSegment, TimeAndDistance, Waypoint} from '../types';
import {
  CameraPerspective,
  LocationSimulationOptions,
  NavigationViewController,
  RoutingOptions,
  SpeedAlertOptions,
} from './types';

const {NavViewModule} = NativeModules;

export const getNavigationViewController = (
  viewId: number,
): NavigationViewController => {
  return {
    setDestination: (waypoint: Waypoint, routingOptions?: RoutingOptions) => {
      let args: object[] = [];
      args.push([waypoint]);

      if (routingOptions != null) {
        args.push(routingOptions);
      }

      sendCommand(viewId, commands.setDestinations, args);
    },
    setDestinations: (
      waypoints: Waypoint[],
      routingOptions?: RoutingOptions,
    ) => {
      let args: object[] = [];

      args.push(waypoints);

      if (routingOptions != null) {
        args.push(routingOptions);
      }

      sendCommand(viewId, commands.setDestinations, args);
    },
    continueToNextDestination: () => {
      sendCommand(viewId, commands.continueToNextDestination, []);
    },
    clearDestinations: () => {
      sendCommand(viewId, commands.clearDestinations, []);
    },

    startGuidance: () => {
      sendCommand(viewId, commands.startGuidance);
    },

    stopGuidance: () => {
      sendCommand(viewId, commands.stopGuidance, []);
    },

    setSpeedAlertOptions: (alertOptions: SpeedAlertOptions | null) => {
      sendCommand(viewId, commands.setSpeedAlertOptions, [alertOptions]);
    },

    setNavigationUIEnabled: (isOn: boolean) => {
      sendCommand(viewId, commands.setNavigationUIEnabled, [isOn]);
    },

    setTripProgressBarEnabled: (isOn: boolean) => {
      sendCommand(viewId, commands.setTripProgressBarEnabled, [isOn]);
    },

    setSpeedometerEnabled: (isOn: boolean) => {
      sendCommand(viewId, commands.setSpeedometerEnabled, [isOn]);
    },

    setSpeedLimitIconEnabled: (isOn: boolean) => {
      sendCommand(viewId, commands.setSpeedLimitIconEnabled, [isOn]);
    },

    setAbnormalTerminatingReportingEnabled: (isOn: boolean) => {
      sendCommand(viewId, commands.setAbnormalTerminatingReportingEnabled, [
        isOn,
      ]);
    },

    setTrafficIncidentCardsEnabled: (isOn: boolean) => {
      sendCommand(viewId, commands.setTrafficIncidentCardsEnabled, [isOn]);
    },

    showRouteOverview: () => {
      sendCommand(viewId, commands.showRouteOverview, []);
    },

    setNightMode: (index: number) => {
      sendCommand(viewId, commands.setNightMode, [index]);
    },

    setAudioGuidanceType: (index: AudioGuidance) => {
      sendCommand(viewId, commands.setAudioGuidanceType, [index]);
    },

    setBackgroundLocationUpdatesEnabled: (isEnabled: boolean) => {
      if (Platform.OS == "ios") {
        sendCommand(viewId, commands.setBackgroundLocationUpdatesEnabled,
          [isEnabled]
        );
      }
    },

    setRecenterButtonEnabled(isEnabled: boolean) {
      sendCommand(viewId, commands.setRecenterButtonEnabled, [isEnabled]);
    },

    areTermsAccepted: async (): Promise<boolean> => {
      return await NavViewModule.areTermsAccepted();
    },

    getCurrentRouteSegment: async (): Promise<RouteSegment> => {
      return await NavViewModule.getCurrentRouteSegment();
    },

    getRouteSegments: async (): Promise<RouteSegment[]> => {
      return await NavViewModule.getRouteSegments();
    },

    getCurrentTimeAndDistance: async (): Promise<TimeAndDistance> => {
      return await NavViewModule.getCurrentTimeAndDistance();
    },

    getTraveledPath: async (): Promise<LatLng[]> => {
      return await NavViewModule.getTraveledPath();
    },

    getNavSDKVersion: async (): Promise<string> => {
      return await NavViewModule.getNavSDKVersion();
    },

    /**
     * Disables location updates by the library. This should be
     * called once no longer needed to save battery.
     */
    stopUpdatingLocation: () => {
      sendCommand(viewId, commands.stopUpdatingLocation);
    },

    /**
     * Allows the library to start tracking location and providing updates.
     */
    startUpdatingLocation: () => {
      sendCommand(viewId, commands.startUpdatingLocation);
    },

    setFollowingPerspective: (perspective: CameraPerspective) => {
      sendCommand(viewId, commands.setFollowingPerspective, [perspective]);
    },

    simulator: {
      simulateLocation: (location: LatLng) => {
        sendCommand(viewId, commands.simulateLocation, [{location}]);
      },
      resumeLocationSimulation: () => {
        sendCommand(viewId, commands.resumeLocationSimulation, []);
      },
      pauseLocationSimulation: () => {
        sendCommand(viewId, commands.pauseLocationSimulation, []);
      },
      simulateLocationsAlongExistingRoute: ({
        speedMultiplier,
      }: LocationSimulationOptions) => {
        sendCommand(viewId, commands.simulateLocationsAlongExistingRoute, [
          speedMultiplier,
        ]);
      },
      stopLocationSimulation: () => {
        sendCommand(viewId, commands.stopLocationSimulation, []);
      },
    },
  };
};
