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

let globalMapViewCounter = 0;

/**
 * Generates a unique string-based nativeID for map/navigation views.
 * This ID is used to reference views in TurboModule methods.
 *
 * The native side maintains a registry mapping nativeID to view instances,
 * allowing TurboModules to operate on specific views.
 *
 * @returns A unique string identifier in format "RNNavView_N"
 */
export const getUniqueMapViewId = (): string => {
  return `RNNavView_${globalMapViewCounter++}`;
};

/**
 * Resets the view counter. Used for testing purposes.
 * @returns The reset counter value (0)
 */
export const resetMapViewCounter = (): number => {
  globalMapViewCounter = 0;
  return globalMapViewCounter;
};
