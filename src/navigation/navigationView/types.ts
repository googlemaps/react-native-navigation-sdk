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
 * Determines the initial visibility of the navigation UI on map initialization.
 */
export enum NavigationUIEnabledPreference {
  /**
   * Navigation UI gets enabled if the navigation
   * session has already been successfully started.
   */
  AUTOMATIC = 0,
  /** Navigation UI is disabled. */
  DISABLED = 1,
}

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

/**
 * `NavigationViewProps` interface extends `MapViewProps` to provide
 * additional methods focused on managing navigation events and state changes.
 */
export interface NavigationViewProps extends MapViewProps {
  readonly androidStylingOptions?: AndroidStylingOptions;
  readonly iOSStylingOptions?: iOSStylingOptions;

  /**
   * Controls the navigation night mode for Navigation UI.
   *
   * Defaults to `NavigationNightMode.AUTO` when not provided.
   */
  readonly navigationNightMode?: NavigationNightMode;

  /**
   * Callback function invoked when the re-center button is clicked.
   */
  readonly onRecenterButtonClick?: () => void;

  /**
   * A callback function invoked before a Navigation SDK UI prompt
   * element is about to appear and as soon as the element is removed.
   *
   * @param visible - A boolean indicating whether the prompt is visible.
   */
  readonly onPromptVisibilityChanged?: (visible: boolean) => void;

  /**
   * Determines the initial visibility of the navigation UI on map initialization.
   *
   * - `AUTOMATIC`: Navigation UI gets enabled if the navigation session has already been successfully started.
   * - `DISABLED`: Navigation UI is disabled.
   *
   * Defaults to `NavigationUIEnabledPreference.AUTOMATIC` when not provided.
   */
  readonly navigationUIEnabledPreference?: NavigationUIEnabledPreference;

  /**
   * Controls whether the trip progress bar is shown.
   * Defaults to true.
   */
  readonly tripProgressBarEnabled?: boolean;

  /**
   * Controls interactive disruption callouts and prompt alerts along the route.
   * When enabled, disruption callouts render and prompt alerts surface as users approach them.
   * Defaults to true.
   */
  readonly trafficPromptsEnabled?: boolean;

  /**
   * Controls whether disruption info cards can be shown when users tap callouts
   * (route overview or active navigation).
   * Keeps the tap-to-expand cards available for disruption details and voting.
   * Defaults to true.
   */
  readonly trafficIncidentCardsEnabled?: boolean;

  /**
   * Controls whether the navigation header is shown.
   * Defaults to true.
   */
  readonly headerEnabled?: boolean;

  /**
   * Controls whether the navigation footer is shown.
   * Defaults to true.
   */
  readonly footerEnabled?: boolean;

  /**
   * Controls whether the speedometer is shown.
   * Defaults to false.
   */
  readonly speedometerEnabled?: boolean;

  /**
   * Controls whether the speed limit icon is shown.
   * Defaults to true.
   */
  readonly speedLimitIconEnabled?: boolean;

  /**
   * Controls whether the recenter button is shown.
   * Defaults to true.
   */
  readonly recenterButtonEnabled?: boolean;

  /**
   * Controls whether the report incident button is shown.
   * Defaults to true.
   */
  readonly reportIncidentButtonEnabled?: boolean;

  /**
   * Callback invoked when the NavigationViewController is created.
   */
  onNavigationViewControllerCreated?(
    navigationViewController: NavigationViewController
  ): void;
}

/**
 * Represents the navigation UI lighting mode.
 *
 * Android ref https://developers.google.com/maps/documentation/navigation/android-sdk/reference/com/google/android/libraries/navigation/ForceNightMode
 * iOS ref https://developers.google.com/maps/documentation/navigation/ios-sdk/reference/objc/Enums/GMSNavigationLightingMode
 */
export enum NavigationNightMode {
  /** Let the SDK automatically determine day or night. */
  AUTO = 0,
  /** Force day mode regardless of time or location. */
  FORCE_DAY = 1,
  /** Force night mode regardless of time or location. */
  FORCE_NIGHT = 2,
}

/**
 * Allows you to access Navigator methods.
 */
export interface NavigationViewController {
  /**
   * Shows an overview of the remaining route.
   */
  showRouteOverview(): void;

  /**
   * Enables or disables the navigation UI.
   * @param enabled - True to enable navigation UI, false to disable it.
   */
  setNavigationUIEnabled(enabled: boolean): Promise<void>;

  /**
   * Sets the camera perspective for navigation.
   */
  setFollowingPerspective(perspective: CameraPerspective): Promise<void>;
}
