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

// Note: This Routes API implementation is meant to be used only to
// support the example app, and only includes the bare minimum to get
// the route tokens.

import type { LatLng, Waypoint } from '@googlemaps/react-native-navigation-sdk';

const ROUTES_API_URL = 'https://routes.googleapis.com';
const COMPUTE_ROUTES_URL = `${ROUTES_API_URL}/directions/v2:computeRoutes`;

/**
 * Travel modes supported by the Routes API.
 */
export type RoutesApiTravelMode = 'DRIVE' | 'BICYCLE' | 'WALK' | 'TWO_WHEELER';

/**
 * Routing preference options for the Routes API.
 */
export type RoutingPreference = 'TRAFFIC_AWARE' | 'TRAFFIC_AWARE_OPTIMAL';

/**
 * Options for the Routes API request.
 */
export interface RoutesApiOptions {
  /** The travel mode for the route. Defaults to 'DRIVE'. */
  travelMode?: RoutesApiTravelMode;
  /** The routing preference. Defaults to 'TRAFFIC_AWARE'. */
  routingPreference?: RoutingPreference;
}

/**
 * Response from the Routes API containing route tokens.
 */
export interface RoutesApiResponse {
  /** List of route tokens returned by the API. */
  routeTokens: string[];
}

/**
 * Converts a Waypoint to the Routes API waypoint format.
 */
function toRoutesApiWaypoint(
  waypoint: Waypoint | LatLng,
  via: boolean = false
): Record<string, unknown> {
  const output: Record<string, unknown> = { via };

  // Check if it's a Waypoint with placeId
  if ('placeId' in waypoint && waypoint.placeId) {
    output.placeId = waypoint.placeId;
  } else {
    // Handle LatLng or Waypoint with position
    let lat: number;
    let lng: number;

    if ('position' in waypoint && waypoint.position) {
      lat = waypoint.position.lat;
      lng = waypoint.position.lng;
    } else if ('lat' in waypoint && 'lng' in waypoint) {
      lat = waypoint.lat;
      lng = waypoint.lng;
    } else {
      throw new Error(
        'Invalid waypoint: Either position or placeId must be provided.'
      );
    }

    const location: Record<string, unknown> = {
      latLng: {
        latitude: lat,
        longitude: lng,
      },
    };

    // Add preferred heading if available
    if ('preferredHeading' in waypoint && waypoint.preferredHeading != null) {
      location.heading = waypoint.preferredHeading;
    }

    output.location = location;
  }

  return output;
}

/**
 * Queries the Google Maps Routes API and returns a list of route tokens.
 *
 * @param apiKey - The Google Maps API key with Routes API enabled.
 * @param waypoints - A list of waypoints representing the route (minimum 2: origin and destination).
 * @param options - Optional configuration for the route request.
 * @returns A promise that resolves to a list of route tokens.
 * @throws Error if the request fails or returns no route tokens.
 *
 * @example
 * ```typescript
 * const tokens = await getRouteToken(
 *   'YOUR_API_KEY',
 *   [
 *     { lat: 37.7749, lng: -122.4194 }, // Origin
 *     { lat: 37.3382, lng: -121.8863 }, // Destination
 *   ],
 *   { travelMode: 'DRIVE' }
 * );
 * ```
 */
export async function getRouteToken(
  apiKey: string,
  waypoints: (Waypoint | LatLng)[],
  options: RoutesApiOptions = {}
): Promise<string[]> {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error(
      'API key is required. Please provide a valid Google Maps API key.'
    );
  }

  if (waypoints.length < 2) {
    throw new Error(
      'At least two waypoints (origin and destination) are required.'
    );
  }

  const { travelMode = 'DRIVE', routingPreference = 'TRAFFIC_AWARE' } = options;

  const origin = waypoints[0]!;
  const destination = waypoints[waypoints.length - 1]!;
  const intermediates = waypoints.slice(1, -1);

  const requestBody: Record<string, unknown> = {
    origin: toRoutesApiWaypoint(origin),
    destination: toRoutesApiWaypoint(destination),
    intermediates: intermediates.map(wp => toRoutesApiWaypoint(wp, true)),
    travelMode,
    routingPreference,
  };

  const headers: Record<string, string> = {
    'X-Goog-Api-Key': apiKey,
    'X-Goog-FieldMask': 'routes.routeToken',
    'Content-Type': 'application/json',
  };

  const response = await fetch(COMPUTE_ROUTES_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to get route tokens: ${response.statusText}\n${errorText}`
    );
  }

  const responseData = (await response.json()) as {
    routes?: { routeToken: string }[];
  };
  const routes = responseData.routes;

  if (!routes || routes.length === 0) {
    throw new Error('No routes returned from the Routes API.');
  }

  return routes.map(route => route.routeToken);
}
