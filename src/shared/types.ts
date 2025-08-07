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

import type { StyleProp, ViewStyle } from 'react-native';
import type { CameraPosition } from '..';

/**
 * An immutable class representing a latitude/longitude pair.
 */
export interface LatLng {
  /** Value representing the latitude of the location in degrees. */
  lat: number;
  /** Value representing the longitude of the location in degrees. */
  lng: number;
}

/**
 * An immutable class representing the device location in Navigation SDK.
 */
export interface Location {
  /**
   * Value representing the latitude of the location in degrees.
   */
  lat: number;

  /**
   * Value representing the longitude of the location in degrees.
   */
  lng: number;

  /**
   * Number in meters that represents the altitude of the location.
   */
  altitude?: number;

  /**
   * The bearing at the time of this location in degrees.
   * Bearing is the horizontal direction of travel of this device and is
   * unrelated to the device orientation.
   */
  bearing?: number;

  /**
   * The speed at the time of this location in meters per second
   */
  speed: number;

  /**
   * Number in meters that represents the horizontal accuracy
   * of the location.
   */
  accuracy?: number;

  /**
   * Number in meters that represents the vertical accuracy of the location.
   */
  verticalAccuracy?: number;

  /**
   * The name of the provider associated with this location. Android only.
   */
  provider?: string;

  /**
   * Time when the location was sourced represented as
   * ellapse milliseconds since Unix Epoch.
   */
  time: number;
}

/**
 * Defines the styling of the base map.
 */
export enum MapType {
  /** No base map tiles. */
  NONE = 0,
  /** Default GoogleMap style - Basic maps. */
  NORMAL,
  /** Satellite maps with a transparent layer of major streets. */
  SATELLITE,
  /** Shows the terrain of the map only. This map type does not work during navigation. */
  TERRAIN,
  /** Satellite maps with a transparent layer of major streets. */
  HYBRID,
}

export interface CommonMapViewProps {
  readonly style?: StyleProp<ViewStyle> | undefined;

  /**
   * A map ID is a unique identifier that represents Google Map configuration settings that are stored in Google Cloud.
   *
   * See https://developers.google.com/maps/documentation/get-map-id
   */
  readonly mapId?: string | null;

  /**
   * Enable or disable the buildings layer on the map.
   */
  readonly buildingsEnabled?: boolean;

  /**
   * Enable or disable the indoor map layer.
   */
  readonly indoorEnabled?: boolean;

  /**
   * Enable or disable the traffic layer.
   */
  readonly trafficEnabled?: boolean;

  /**
   * Enable or disable the compass.
   */
  readonly compassEnabled?: boolean;

  /**
   * Enable or disable user location button.
   */
  readonly myLocationButtonEnabled?: boolean;

  /**
   * Show or hide a location marker on the map.
   */
  readonly myLocationEnabled?: boolean;

  /**
   * Enable or disable rotate gestures.
   */
  readonly rotateGesturesEnabled?: boolean;

  /**
   * Enable or disable scroll gestures on the map.
   */
  readonly scrollGesturesEnabled?: boolean;

  /**
   * Enable or disable scroll gestures during rotate or zoom actions.
   */
  readonly scrollGesturesEnabledDuringRotateOrZoom?: boolean;

  /**
   * Enable or disable tilt gestures on the map.
   */
  readonly tiltGesturesEnabled?: boolean;

  /**
   * Enable or disable zoom control.
   */
  readonly zoomControlsEnabled?: boolean;

  /**
   * Enable or disable zoom gestures on the map.
   */
  readonly zoomGesturesEnabled?: boolean;

  /**
   * Sets the visual style of the map.
   */
  readonly mapStyle?: string;

  /**
   * Enable or disable the map toolbar.
   */
  readonly mapToolbarEnabled?: boolean;

  /**
   * Sets the type of the map.
   * Possible values: NONE, NORMAL, SATELLITE, TERRAIN, HYBRID.
   */
  readonly mapType?: MapType | null;

  /**
   * Sets the minimum zoom level for the map.
   * This value is used to restrict the zoom level of the map.
   */
  readonly minZoomLevel?: number | null;

  /**
   * Sets the maximum zoom level for the map.
   * This value is used to restrict the zoom level of the map.
   */
  readonly maxZoomLevel?: number | null;

  /**
   * Sets the padding for the map view.
   * Example: { top: 10, left: 5, bottom: 15, right: 10 }
   */
  readonly mapPadding?: {
    top?: number;
    left?: number;
    bottom?: number;
    right?: number;
  } | null;

  /**
   * Enable or disable the recenter button on the map.
   * When enabled, this button allows users to recenter the map to their current location.
   */
  recenterButtonEnabled?: boolean;

  /**
   * Enable or disable night mode on the map.
   * A non-zero value indicates night mode is enabled.
   */
  nightMode?: number;

  /**
   * Sets the initial camera position for the map.
   * This defines the starting location and zoom level of the map.
   */
  initialCameraPosition?: CameraPosition;
}
