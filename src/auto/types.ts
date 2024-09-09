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

import type { MapViewController } from '../maps';

/** Defines all callbacks to be emitted by NavViewAuto support. */
export interface NavigationAutoCallbacks {
  /**
   * Callback function invoked when the screen availability changes.
   */
  onAutoScreenAvailabilityChanged?(available: boolean): void;

  /**
   * Callback function invoked when a custom navigation auto event is received.
   */
  onCustomNavigationAutoEvent?(event: CustomNavigationAutoEvent): void;
}

/**
 * CustomNavigationAutoEvent is an event that can be sent from the
 * native side to the React Native side, ment to be simple way to
 * implement custom events fired by the native side.
 */
export interface CustomNavigationAutoEvent {
  /**
   * The event type.
   */
  type: string;

  /**
   * The event data.
   */
  data?: Record<string, unknown>;
}

export interface MapViewAutoController extends MapViewController {
  /**
   * Cleans up the navigation module, releasing any resources that were allocated.
   */
  cleanup(): Promise<void>;

  /**
   * Queries screen visibility.
   */
  isAutoScreenAvailable(): Promise<boolean>;
}
