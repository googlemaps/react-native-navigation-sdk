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

/** Defines all callbacks listeners setters for events emitted by auto support. */
export interface NavigationAutoCallbackListenerSetters {
  /**
   * Callback setter function for events invoked when the screen availability changes.
   */
  setOnAutoScreenAvailabilityChangedListener: (
    callback: ((available: boolean) => void) | null
  ) => void;

  /**
   * Callback setter function for events invoked when a custom navigation auto event is received.
   */
  setOnCustomNavigationAutoEventListener: (
    callback: ((event: CustomNavigationAutoEvent) => void) | null
  ) => void;

  /**
   * Removes all listeners for the naviation auto support events.
   */
  removeAllListeners: () => void;
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

export interface MapViewAutoController
  extends MapViewController,
    NavigationAutoCallbackListenerSetters {
  /**
   * Cleans up the navigation module, releasing any resources that were allocated.
   */
  cleanup(): Promise<void>;

  /**
   * Queries screen visibility.
   */
  isAutoScreenAvailable(): Promise<boolean>;
}
