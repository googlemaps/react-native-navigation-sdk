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

import { device, element, waitFor, by } from 'detox';
import {
  initializeIntegrationTestsPage,
  agreeToTermsAndConditions,
  selectTestByName,
  waitForTestToFinish,
  expectSuccess,
  expectNoErrors,
} from './shared.js';

// Opt in with --testMatch and this file's absolute path; see example/README.md.
// The default suite needs no Routes API key; targeted runs require one.
// Keep these fixtures in sync with the in-app token integration scenarios.
const ORIGIN = { latitude: 37.791366, longitude: -122.415659 };
const DESTINATION = { latitude: 37.791957, longitude: -122.412529 };
const INTERMEDIATE = { latitude: 37.79165, longitude: -122.4141 };

const fetchFreshRouteToken = async (multiStop = false) => {
  const apiKey = process.env.ROUTES_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      'ROUTES_API_KEY is required for the targeted token-routing tests; enable Routes API for this credential.'
    );
  }

  let response;
  try {
    response = await fetch(
      'https://routes.googleapis.com/directions/v2:computeRoutes',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'routes.routeToken',
        },
        body: JSON.stringify({
          origin: { location: { latLng: ORIGIN } },
          destination: { location: { latLng: DESTINATION } },
          intermediates: multiStop
            ? [{ location: { latLng: INTERMEDIATE }, via: false }]
            : [],
          travelMode: 'DRIVE',
          routingPreference: 'TRAFFIC_AWARE',
        }),
        signal: AbortSignal.timeout(30000),
      }
    );
  } catch (error) {
    // Do not include request headers, credentials, or an unsanitized HTTP error.
    const code = error?.cause?.code ?? error?.code ?? error?.name;
    throw new Error(
      `Routes API request failed before an HTTP response (${code}).`
    );
  }
  if (!response.ok) {
    throw new Error(`Routes API request failed (HTTP ${response.status}).`);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      `Routes API returned invalid JSON (HTTP ${response.status}).`
    );
  }
  const token = data.routes?.[0]?.routeToken;
  if (typeof token !== 'string' || !token.trim()) {
    throw new Error('Routes API returned no route token.');
  }
  return token;
};

const runTokenTest = async (testName, multiStop = false) => {
  // Fetch immediately before each run; do not hardcode or cache route tokens.
  const routeToken = await fetchFreshRouteToken(multiStop);
  await initializeIntegrationTestsPage();
  await device.disableSynchronization();
  const tokenInput = element(by.id('route_token_input'));
  await waitFor(tokenInput).toBeVisible().withTimeout(10000);
  await tokenInput.tap();
  await tokenInput.replaceText(routeToken);
  if (device.getPlatform() === 'android') {
    await device.pressBack();
  } else {
    await tokenInput.tapReturnKey();
  }
  await selectTestByName(testName);
  await agreeToTermsAndConditions();
  await waitForTestToFinish(180000);
  await expectNoErrors();
  await expectSuccess();
};

describe('Fresh route-token navigation tests', () => {
  it('NT12 - replaces routes, preserves legacy token callers, clears, guides and arrives using a token-only route', async () => {
    await runTokenTest('testTokenRouting');
  }, 240000);

  it('NT13 - follows a multi-stop token, continues between SDK legs and clears the final route', async () => {
    await runTokenTest('testMultiStopTokenRouting', true);
  }, 240000);
});
