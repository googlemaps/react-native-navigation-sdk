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

import type {
  AndroidStylingOptions,
  iOSStylingOptions,
} from './stylingOptions';
import type { MapViewProps } from '../../maps/types';

/**
 * The perspective that the camera will be looking at the GoogleMap.
 * Default: TILTED
 */
export enum CameraPerspective {
  /** A tilted perspective facing in the same direction as the user. */
  TILTED = 0,
  /** A north-facing top-down perspective of the camera's target. */
  TOP_DOWN_NORTH_UP,
  /** A heading-facing top-down perspective of the camera's target. */
  TOP_DOWN_HEADING_UP,
}

/** Defines all callbacks to be emitted during navigation. */
export interface NavigationViewCallbacks {
  /**
   * Callback function invoked when the re-center button is clicked.
   */
  onRecenterButtonClick?(): void;

  /**
   * A callback function invoked before a Navigation SDK UI prompt
   * element is about to appear and as soon as the element is removed.
   *
   * @param visible - A boolean indicating whether the prompt is visible.
   */
  onPromptVisibilityChanged?(visible: boolean): void;
}

/**
 * `NavigationViewProps` interface extends `MapViewProps` to provide
 * additional methods focused on managing navigation events and state changes.
 */
export interface NavigationViewProps extends MapViewProps {
  readonly androidStylingOptions?: AndroidStylingOptions;
  readonly iOSStylingOptions?: iOSStylingOptions;

  readonly navigationViewCallbacks?: NavigationViewCallbacks;

  onNavigationViewControllerCreated(
    navigationViewController: NavigationViewController
  ): void;
}

/**
 * Allows you to access Navigator methods.
 */
export interface NavigationViewController {
  /**
   * Show or hide the navigation user interface (UI) on the map.
   *
   * @param isOn - Indicates whether to display (true) or hide (false) the
   *               navigation user interface.
   */
  setNavigationUIEnabled(enabled: boolean): void;

  /**
   * Show or hide the trip progress information on the map.
   *
   * @param isOn - Indicates whether to display (true) or hide (false) the trip
   *               progress information.
   */
  setTripProgressBarEnabled(enabled: boolean): void;

  /**
   * Show or hide the report incident button.
   *
   * @param isOn - Indicateswhether the report incident button should be shown.
   */
  setReportIncidentButtonEnabled(enabled: boolean): void;

  /**
   * Show or hide traffic incident cards on the map.
   *
   * @param isOn - Indicates whether to display (true) or hide (false) traffic
   *               incident cards on the map.
   */
  setTrafficIncidentCardsEnabled(enabled: boolean): void;

  /**
   * Show or hide navigation header on the map.
   *
   * @param isOn - Indicates whether to display (true) or hide (false)
   * navigation header on the map.
   */
  setHeaderEnabled(enabled: boolean): void;

  /**
   * Show or hide navigation footer on the map.
   *
   * @param isOn - Indicates whether to display (true) or hide (false)
   * navigation footer on the map.
   */
  setFooterEnabled(enabled: boolean): void;

  /**
   * Enable or disable the speedometer display on the map.
   *
   * @param isOn - Indicates whether to enable (true) or disable (false) the
   *               speedometer display.
   */
  setSpeedometerEnabled(enabled: boolean): void;

  /**
   * Show or hide the speed limit icon on the map.
   *
   * @param isOn - Indicates whether to display (true) or hide (false) the
   *               speed limit icon.
   */
  setSpeedLimitIconEnabled(enabled: boolean): void;

  /**
   * Shows an overview of the remaining route.
   */
  showRouteOverview(): void;

  /**
   * Sets the night mode setting for the navigation UI.
   *
   * This controls whether the navigation UI should be displayed in day or night mode,
   * affecting the color scheme and visibility of UI elements.
   *
   * @param mode - The night mode setting to apply. Valid values are:
   *   - `0` (AUTO): The Navigation SDK automatically determines the appropriate
   *     day or night mode according to the user's location and local time.
   *   - `1` (FORCE_DAY): Forces day mode regardless of time or location.
   *   - `2` (FORCE_NIGHT): Forces night mode regardless of time or location.
   *
   * @example
   * ```typescript
   * // Auto mode - SDK determines day/night based on location and time
   * navigationViewController.setNightMode(0);
   *
   * // Force day mode
   * navigationViewController.setNightMode(1);
   *
   * // Force night mode
   * navigationViewController.setNightMode(2);
   * ```
   */
  setNightMode(mode: number): void;

  /**
   * Set the camera perspective mode for the map.
   *
   * @param perspective - The desired camera perspective mode.
   */
  setFollowingPerspective(perspective: CameraPerspective): void;

  /**
   * Enables/disables the "Recenter" button on the map.
   *
   * @param isEnabled - Determines whether the button should be enabled or not.
   */
  setRecenterButtonEnabled(isEnabled: boolean): void;
}
