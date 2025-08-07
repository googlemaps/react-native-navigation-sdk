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
  MapViewCallbacks,
  MapViewController,
} from '../../maps/mapView/types';
import type {
  AndroidStylingOptions,
  iOSStylingOptions,
} from './stylingOptions';
import type { CommonMapViewProps } from '../../shared/types';

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
   * A callback function invoked when the re-center button is clicked.
   */
  onRecenterButtonClick?(): void;

  /**
   * A callback function invoked before a Navigation SDK UI prompt
   * element is about to appear and as soon as the element is removed.
   */
  onPromptVisibilityChanged?(response: { visible: boolean }): void;
}

/**
 * `NavigationViewProps` interface extends `MapViewProps` to provide
 * additional methods focused on managing navigation events and state changes.
 */
export interface NavigationViewProps
  extends CommonMapViewProps,
    NavigationViewCallbacks,
    MapViewCallbacks {
  readonly androidStylingOptions?: AndroidStylingOptions;
  readonly iOSStylingOptions?: iOSStylingOptions;

  /**
   * Indicates whether to display (true) or hide (false) the navigation user interface.
   */
  readonly navigationUIEnabled?: boolean;

  /**
   * Indicates whether to display (true) or hide (false) the trip progress bar on the map.
   */
  readonly tripProgressBarEnabled?: boolean;

  /**
   * Indicates whether to display (true) or hide (false) traffic incident cards on the map.
   */
  readonly trafficIncidentCardsEnabled?: boolean;

  /**
   * Enable or disable the report incident button.
   *
   * This button allows users to report incidents on the map.
   */
  readonly reportIncidentButtonEnabled?: boolean;

  /**
   * Indicates whether to display (true) or hide (false) the navigation header on the map.
   */
  readonly headerEnabled?: boolean;

  /**
   * Indicates whether to display (true) or hide (false) the navigation footer on the map.
   */
  readonly footerEnabled?: boolean;

  /**
   * Indicates whether to enable (true) or disable (false) the speedometer display on the map.
   */
  readonly speedometerEnabled?: boolean;

  /**
   * Indicates whether to display (true) or hide (false) the speed limit icon on the map.
   */
  readonly speedLimitIconEnabled?: boolean;

  /**
   * Enables/disables the "Recenter" button on the map.
   */
  readonly recenterButtonEnabled?: boolean;

  /**
   * Sets the night mode setting according to the provided index.
   */
  readonly nightMode?: number;

  /**
   * Set the camera perspective mode for the map.
   *
   * If not set, the platform default will be used.
   */
  readonly followingPerspective?: CameraPerspective;

  /**
   * Callback invoked when the navigation view controller is created.
   */
  onNavigationViewControllerCreated(
    navigationViewController: NavigationViewController
  ): void;

  /**
   * Callback invoked when the map view controller is created.
   */
  onMapViewControllerCreated(mapViewController: MapViewController): void;
}

/**
 * Allows you to access Navigator methods.
 */
export interface NavigationViewController {
  /**
   * Shows an overview of the remaining route.
   */
  showRouteOverview(): void;
}
