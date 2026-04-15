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

import { Alert } from 'react-native';
import {
  RouteStatus,
  type NavigationController,
  type ContinueToNextDestinationResponse,
} from '@googlemaps/react-native-navigation-sdk';
import { showSnackbar } from './snackbar';

/**
 * Handles a RouteStatus result from setDestinations or continueToNextDestination.
 * Shows appropriate user feedback and returns whether the route was successful.
 *
 * @param routeStatus - The route status to handle.
 * @returns true if the route status is OK, false otherwise.
 */
export const handleRouteStatus = (routeStatus: RouteStatus): boolean => {
  switch (routeStatus) {
    case RouteStatus.OK:
      showSnackbar('Route created successfully');
      return true;
    case RouteStatus.ROUTE_CANCELED:
      Alert.alert('Error', 'Route Cancelled');
      return false;
    case RouteStatus.NO_ROUTE_FOUND:
      Alert.alert('Error', 'No Route Found');
      return false;
    case RouteStatus.NETWORK_ERROR:
      Alert.alert('Error', 'Network Error');
      return false;
    case RouteStatus.LOCATION_DISABLED:
      Alert.alert('Error', 'Location Disabled');
      return false;
    case RouteStatus.LOCATION_UNKNOWN:
      Alert.alert('Error', 'Location Unknown');
      return false;
    case RouteStatus.DUPLICATE_WAYPOINTS_ERROR:
      Alert.alert('Error', 'Consecutive duplicate waypoints are not allowed');
      return false;
    default:
      showSnackbar('Route status: ' + routeStatus);
      Alert.alert('Error', 'Starting Guidance Error');
      return false;
  }
};

/**
 * Handles the response from continueToNextDestination.
 *
 * Checks the route status (if available, i.e. on iOS) and stops guidance
 * on failure. Returns the response for further processing.
 *
 * @param navigationController - The navigation controller instance.
 * @param response - The response from continueToNextDestination.
 * @returns true if navigation can continue, false if it was aborted.
 */
export const handleContinueToNextDestination = async (
  navigationController: NavigationController,
  response: ContinueToNextDestinationResponse
): Promise<boolean> => {
  // If routeStatus is available (iOS), check for errors
  if (response.routeStatus !== undefined) {
    if (!handleRouteStatus(response.routeStatus)) {
      await navigationController.stopGuidance();
      return false;
    }
  }

  if (response.waypoint === null) {
    showSnackbar('No more waypoints remaining');
    await navigationController.stopGuidance();
    return false;
  }

  return true;
};
