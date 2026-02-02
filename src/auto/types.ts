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

import type { MapViewController, MapType, MapColorScheme } from '../maps';
import type { CameraPerspective, NavigationNightMode } from '../navigation';

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

  /**
   * Sets the following perspective for the auto navigation view and enables
   * camera following mode. This recenters the camera to follow the user's location.
   *
   * @param perspective The camera perspective to use when following.
   */
  setFollowingPerspective(perspective: CameraPerspective): void;

  /**
   * Sends a custom message from React Native to the native auto module.
   * This allows developers to implement custom communication between
   * the React Native layer and native CarPlay/Android Auto code.
   *
   * @param type The message type identifier.
   * @param data Optional data payload as a record of key-value pairs.
   */
  sendCustomMessage(type: string, data?: Record<string, unknown>): void;

  /**
   * Sets the map type for the auto navigation view.
   *
   * @param mapType The map type to set.
   */
  setMapType(mapType: MapType): void;

  /**
   * Sets the map style using a JSON string for the auto navigation view.
   *
   * @param mapStyle The JSON map style string.
   */
  setMapStyle(mapStyle: string): void;

  /**
   * Sets the map color scheme for the auto navigation view.
   *
   * @param colorScheme The color scheme to set (FOLLOW_SYSTEM=0, LIGHT=1, DARK=2).
   */
  setMapColorScheme(colorScheme: MapColorScheme): void;

  /**
   * Sets the navigation night mode for the auto navigation view.
   * Controls whether the navigation UI uses day or night styling.
   *
   * @param nightMode The night mode to set (AUTO=0, FORCE_DAY=1, FORCE_NIGHT=2).
   */
  setNightMode(nightMode: NavigationNightMode): void;

  /**
   * Enables or disables indoor maps for the auto navigation view.
   *
   * @param enabled Whether to enable indoor maps.
   */
  setIndoorEnabled(enabled: boolean): void;

  /**
   * Enables or disables traffic layer for the auto navigation view.
   *
   * @param enabled Whether to enable traffic layer.
   */
  setTrafficEnabled(enabled: boolean): void;

  /**
   * Enables or disables compass for the auto navigation view.
   *
   * @param enabled Whether to enable compass.
   */
  setCompassEnabled(enabled: boolean): void;

  /**
   * Enables or disables my location indicator for the auto navigation view.
   *
   * @param enabled Whether to enable my location indicator.
   */
  setMyLocationEnabled(enabled: boolean): void;

  /**
   * Enables or disables my location button for the auto navigation view.
   *
   * @param enabled Whether to enable my location button.
   */
  setMyLocationButtonEnabled(enabled: boolean): void;

  /**
   * Enables or disables 3D buildings for the auto navigation view.
   *
   * @param enabled Whether to enable 3D buildings.
   */
  setBuildingsEnabled(enabled: boolean): void;
}
