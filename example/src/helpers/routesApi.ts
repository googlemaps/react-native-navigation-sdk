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

// Minimal Routes API implementation for fetching route tokens.
// Route tokens are currently only supported for DRIVE travel mode.
// See: https://developers.google.com/maps/documentation/routes/route_token

import type { LatLng } from '@googlemaps/react-native-navigation-sdk';

const COMPUTE_ROUTES_URL =
  'https://routes.googleapis.com/directions/v2:computeRoutes';

/**
 * Fetches a route token from the Google Maps Routes API.
 * Route tokens are only supported for DRIVE travel mode.
 *
 * @param apiKey - Google Maps API key with Routes API enabled.
 * @param origin - Starting location.
 * @param destination - Ending location.
 * @returns The route token string.
 *
 * @see https://developers.google.com/maps/documentation/routes/route_token
 */
export async function getRouteToken(
  apiKey: string,
  origin: LatLng,
  destination: LatLng
): Promise<string> {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('API key is required.');
  }

  const response = await fetch(COMPUTE_ROUTES_URL, {
    method: 'POST',
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'routes.routeToken',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      origin: {
        location: {
          latLng: { latitude: origin.lat, longitude: origin.lng },
        },
      },
      destination: {
        location: {
          latLng: { latitude: destination.lat, longitude: destination.lng },
        },
      },
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_AWARE',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Routes API error: ${response.statusText}\n${errorText}`);
  }

  const data = (await response.json()) as {
    routes?: { routeToken?: string }[];
  };

  const routeToken = data.routes?.[0]?.routeToken;
  if (!routeToken) {
    throw new Error('No route token returned from the Routes API.');
  }

  return routeToken;
}
