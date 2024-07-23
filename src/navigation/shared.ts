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
import { RouteStatus } from './types';

export const getRouteStatusFromStringValue = (value: string) => {
  switch (value) {
    case 'OK':
      return RouteStatus.OK;

    case 'NO_ROUTE_FOUND':
      return RouteStatus.NO_ROUTE_FOUND;

    case 'NETWORK_ERROR':
      return RouteStatus.NETWORK_ERROR;

    case 'QUOTA_CHECK_FAILED':
      return RouteStatus.QUOTA_CHECK_FAILED;

    case 'ROUTE_CANCELED':
      return RouteStatus.ROUTE_CANCELED;

    case 'LOCATION_DISABLED':
      return RouteStatus.LOCATION_DISABLED;

    case 'LOCATION_UNKNOWN':
      return RouteStatus.LOCATION_UNKNOWN;

    case 'WAYPOINT_ERROR':
      return RouteStatus.WAYPOINT_ERROR;

    default:
      return RouteStatus.UNKNOWN;
  }
};
