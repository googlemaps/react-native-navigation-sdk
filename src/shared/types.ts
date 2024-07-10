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
