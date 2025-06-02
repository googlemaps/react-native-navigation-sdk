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

import { type LatLng } from '@googlemaps/react-native-navigation-sdk';
import type { TestTools } from './integration_test';

// Delay function execution by given time in ms.
export const delay = (timeInMs: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, timeInMs));
};

// Remove decimals from any floating point number.
export const roundDown = (value: number) => {
  const factor = Math.pow(10, 0);
  return Math.floor(value * factor) / factor;
};

/**
 * Simulate user location and wait until mapViewController.getMyLocation() matches it within tolerance.
 */
export const simulateAndWaitForLocation = async (
  testTools: TestTools,
  simulateLocation: LatLng,
  tolerance = 0.0001,
  timeoutMs = 30000
): Promise<boolean> => {
  const { navigationController, mapViewController, failTest } = testTools;
  await navigationController.simulator.simulateLocation(simulateLocation);

  const start = Date.now();
  while (true) {
    const currentLocation = await mapViewController?.getMyLocation();
    if (
      currentLocation &&
      Math.abs(currentLocation.lat - simulateLocation.lat) <= tolerance &&
      Math.abs(currentLocation.lng - simulateLocation.lng) <= tolerance
    ) {
      return true;
    }
    if (Date.now() - start > timeoutMs) {
      failTest(
        `Timeout: getMyLocation() did not match simulated location ${JSON.stringify(
          simulateLocation
        )} within ${timeoutMs}ms`
      );
      return false;
    }
    await delay(250);
  }
};
