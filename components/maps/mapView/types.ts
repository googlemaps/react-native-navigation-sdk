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

import {LatLng, Location} from '../../shared/types';
import {
  CameraPosition,
  Circle,
  GroundOverlay,
  Marker,
  Polygon,
  Polyline,
  UISettings,
} from '../types';

/**
 * Defines options for a Circle.
 */
export interface CircleOptions {
  /** The center of the circle defined as a LatLng. */
  center: LatLng;
  /** The radius of the circle in pixels. */
  radius: number;
  /** The width of the stroke of the circle. The width is defined in pixels. */
  strokeWidth?: number;
  /** Sets the stroke color of this circle. The color in hex format (ie. #RRGGBB). */
  strokeColor?: string;
  /** The fill color of this circle. The color in hex format (ie. #RRGGBB). */
  fillColor?: string;
  /** Defines whether the circle should receive click events */
  clickable?: boolean;
  /** Defines whether the circle should be rendered (displayed) in GoogleMap */
  visible?: boolean;
}

/**
 * Defines MarkerOptions for a marker.
 */
export interface MarkerOptions {
  /** The LatLng value for the marker's position on the map. You can change this value at any time if you want to move the marker. */
  position: LatLng;
  /** URL that represents the image that should be displayed in the marker instead of using the default marker pin. */
  imgPath?: string;
  /** A text string that's displayed in an info window when the user taps the marker. You can change this value at any time. */
  title?: string;
  /** Additional text that's displayed below the title. You can change this value at any time. */
  snippet?: string;
  /** Sets the opacity of the marker. Defaults to 1.0. */
  alpha?: number;
  /** The rotation of the marker in degrees clockwise about the marker's anchor point. The axis of rotation is perpendicular to the marker. A rotation of 0 corresponds to the default position of the marker. When the marker is flat on the map, the default position is North aligned and the rotation is such that the marker always remains flat on the map. When the marker is a billboard, the default position is pointing up and the rotation is such that the marker is always facing the camera. The default value is 0. */
  rotation?: number;
  /** Indicates whether this marker is draggable. False by default. */
  draggable?: boolean;
  /** Indicates whether this marker should be flat against the map true or a billboard facing the camera false. */
  flat?: boolean;
  /** Indicates the visibility of the polygon. True by default. */
  visible?: boolean;
}

/**
 * Defines PolygonOptions for a polygon.
 */
export interface PolygonOptions {
  /** An array of LatLngs that are the vertices of the polygon. */
  points: LatLng[];
  /** An array of holes, where a hole is an array of LatLngs. */
  holes?: LatLng[][];
  /** Sets the width of the stroke of the polygon. The width is defined in pixels. */
  strokeWidth?: number;
  /** Sets the stroke color of this polygon. The color in hex format (ie. #RRGGBB). */
  strokeColor?: string;
  /** The fill color of the polygon. The color in hex format (ie. #RRGGBB). */
  fillColor?: string;
  /** Indicates whether the segments of the polygon should be drawn as geodesics, as opposed to straight lines on the Mercator projection. A geodesic is the shortest path between two points on the Earth's surface. The geodesic curve is constructed assuming the Earth is a sphere. */
  geodesic?: boolean;
  /** Indicates the clickability of the polygon. False by default. */
  clickable?: boolean;
  /** Indicates the visibility of the polygon. True by default. */
  visible?: boolean;
}

/**
 * Defines GroundOverlayOptions for a GroundOverlay.
 */
export interface GroundOverlayOptions {
  /** A LatLng to which the anchor will be fixed and the width of the overlay (in meters). The anchor is, by default, 50% from the top of the image and 50% from the left of the image. This can be changed. You can optionally provide the height of the overlay (in meters). If you do not provide the height of the overlay, it will be automatically calculated to preserve the proportions of the image. */
  location: LatLng;
  /** The URL that represents the path that represents the image that will be displayed on the GroundOverlay. */
  imgPath?: string;
  /** Width of the ground overlay in pixels. */
  width?: number;
  /** Height of the ground overlay in pixels. */
  height?: number;
  /** A float in the range [0..1] where 0 means that the ground overlay is opaque and 1 means that the ground overlay is transparent. */
  transparency?: number;
  /** The bearing of the ground overlay (the direction that the vertical axis of the ground overlay points) in degrees clockwise from north. The rotation is performed about the anchor point. */
  bearing?: number;
  /** Indicates the clickability of the overlay. False by default. */
  clickable?: boolean;
  /** Indicates the visibility of the overlay. True by default. */
  visible?: boolean;
}

/**
 * Defines PolylineOptions for a Polyline.
 */
export interface PolylineOptions {
  /** An array of LatLngs that are the vertices of the polyline. */
  points: LatLng[];
  /** The color of this polyline. The color in hex format (ie. #RRGGBB). */
  color?: string;
  /** The width of the stroke of the polyline. The width is defined in pixels. */
  width?: number;
  /** Indicates the clickability of the polyline. False by default. */
  clickable?: boolean;
  /** Indicates the visibility of the polyline. True by default. */
  visible?: boolean;
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
  /** Shows the terrain of the map only */
  TERRAIN,
  /** Satellite maps with a transparent layer of major streets. */
  HYBRID,
}

/**
 * `MapViewProps` interface provides a set of method definitions
 * for managing map events and debug information.
 */
export interface MapViewCallbacks {
  /**
   * Logs debug information.
   * @param args - The debug information to be logged. While it's specified
   *               as a string in the function, ensure that the actual
   *               data type corresponds to the usage within your application.
   */
  logDebugInfo?(args: string): void;

  /**
   * Callback function invoked when GoogleMap is ready.
   */
  onMapReady?(): void;

  /**
   * Callback invoked when clicking a marker on the map.
   */
  onMarkerClick?(args: Marker): void;

  /**
   * Callback invoked when clicking a polyline on the map.
   */
  onPolylineClick?(args: Polyline): void;

  /**
   * Callback invoked when clicking a polygon on the map.
   */
  onPolygonClick?(args: Polygon): void;

  /**
   * Callback invoked when clicking a circle on the map.
   */
  onCircleClick?(args: Circle): void;

  /**
   * Callback invoked when clicking a ground overlay on the map.
   */
  onGroundOverlayClick?(args: GroundOverlay): void;

  /**
   * Callback invoked when tapping on a marker's info window.
   */
  onMarkerInfoWindowTapped?(args: Marker): void;
}

export interface MapViewController {
  /**
   * Set the type of the map.
   * @param mapType - A `MapType` enumeration representing
   * the desired map type.
   */
  setMapType(mapType: MapType): void;

  /**
   * Set the visual style of the map.
   * @param mapStyle - A string representing the desired visual
   * style for the map.
   */
  setMapStyle(mapStyle: string): void;
  /**
   * Toggle the map toolbar's enabled state.
   *
   * Sends a command to the native side to enable or disable the map toolbar,
   * based on the provided index. Typically, a non-zero value enables the
   * toolbar, while a value of 0 disables it.
   *
   * @param index - A number indicating the desired state of the map toolbar.
   */
  setMapToolbarEnabled(index: boolean): void;

  /**
   * Clear all elements from the map view.
   */
  clearMapView(): void;

  /**
   * Animate the map's camera to a specified position over a given duration.
   * @param cameraPosition - Object specifying the target position, zoom level,
   *                         tilt, and bearing for the camera.
   * @param duration - The duration of the camera animation, in milliseconds.
   */
  animateCamera(cameraPosition: CameraPosition, duration: number): void;

  /**
   * Add a circle overlay to the map.
   * @param circleOptions - Object specifying the properties of the circle,
   *                        including center coordinates, radius, and various
   *                        styling options.
   */
  addCircle(circleOptions: CircleOptions): Promise<Circle>;

  /**
   * Add a ground overlay to the map.
   * @param overlayOptions - Object specifying properties of the overlay,
   *                         including coordinates, image path, dimensions,
   *                         transparency, and visibility flags.
   */
  addGroundOverlay(
    overlayOptions: GroundOverlayOptions,
  ): Promise<GroundOverlay>;
  /**
   * Add a marker to the map.
   * @param markerOptions - Object specifying properties of the marker, including
   *                        coordinates, image path, title, snippet, opacity,
   *                        rotation, and various flags for other properties.
   */
  addMarker(markerOptions: MarkerOptions): Promise<Marker>;
  /**
   * Add a polyline to the map.
   *
   * @param polylineOptions - Object specifying properties of the polyline,
   *                          including coordinates, color, width, and visibility.
   */
  addPolyline(polylineOptions: PolylineOptions): Promise<Polyline>;

  /**
   * Add a polygon to the map.
   *
   * @param polygonOptions - Object specifying properties of the polygon,
   *                         including coordinates, stroke color, fill color,
   *                         and visibility.
   */

  addPolygon(polygonOptions: PolygonOptions): Promise<Polygon>;

  /**
   * Removes a marker from the map.
   *
   * @param id - String specifying the id property of the marker
   */
  removeMarker(id: string): void;

  /**
   * Removes a polyline from the map.
   *
   * @param id - String specifying the id property of the polyline
   */
  removePolyline(id: string): void;

  /**
   * Removes a polygon from the map.
   *
   * @param id - String specifying the id property of the polygon
   */
  removePolygon(id: string): void;

  /**
   * Removes a circle from the map.
   *
   * @param id - String specifying the id property of the circle
   */
  removeCircle(id: string): void;

  /**
   * Removes a ground overlay from the map.
   *
   * @param id - String specifying the id property of the ground overlay
   */
  removeGroundOverlay(id: string): void;

  /**
   * Enable or disable the indoor map layer.
   *
   * @param isOn - Boolean indicating whether to enable (true) or disable (false)
   *               the indoor map layer.
   */
  setIndoorEnabled(isOn: boolean): void;

  /**
   * Enable or disable the traffic layer.
   *
   * @param isOn - Boolean indicating whether to enable (true) or disable (false)
   *               the traffic layer on the map.
   */

  setTrafficEnabled(isOn: boolean): void;

  /**
   * Enable or disable the compass.
   *
   * @param isOn - Boolean indicating whether to enable (true) or disable (false)
   *               the compass on the map.
   */
  setCompassEnabled(isOn: boolean): void;

  /**
   * Enable or disable user location
   *
   * @param isOn - Boolean indicating whether to display (true) or hide (false)
   *               the user's location.
   */
  setMyLocationButtonEnabled(isOn: boolean): void;
  /**
   * Show or hide a location marker on the map.
   *
   * @param isOn - Indicates whether to display (true) or hide (false) the
   *               location marker.
   */
  setMyLocationEnabled(isOn: boolean): void;

  /**
   * Enable or disable rotate gestures.
   *
   * @param isOn - Boolean indicating whether to enable (true) or disable (false)
   *               rotate gestures on the map.
   */
  setRotateGesturesEnabled(isOn: boolean): void;

  /**
   * Enable or disable scroll gestures on the map.
   *
   * @param isOn - Boolean indicating whether to enable (true) or disable (false)
   *               scroll gestures.
   */
  setScrollGesturesEnabled(isOn: boolean): void;

  /**
   * Enable or disable scroll gestures during rotate or zoom actions.
   *
   * @param isOn - Boolean indicating whether to allow (true) or disallow (false)
   *               scroll gestures while rotating or zooming the map.
   */
  setScrollGesturesEnabledDuringRotateOrZoom(isOn: boolean): void;

  /**
   * Enable or disable zoom control.
   * Only available for Android
   * @param isOn - Boolean indicating whether to allow (true) or disallow (false)
   *               of zoom control.
   */
  setZoomControlsEnabled(isOn: boolean): void;

  /**
   * Sets the zoom level of the map.
   *
   * @param level - The desired zoom level.
   */
  setZoomLevel(level: number): void;

  /**
   * Enable or disable tilt gestures on the map.
   *
   * @param isOn - Boolean indicating whether to enable (true) or disable (false)
   *               tilt gestures.
   */
  setTiltGesturesEnabled(isOn: boolean): void;

  /**
   * Enable or disable zoom gestures on the map.
   *
   * @param isOn - Boolean indicating whether to enable (true) or disable (false)
   *               zoom gestures.
   */
  setZoomGesturesEnabled(isOn: boolean): void;

  /**
   * Enable or disable the buildings layer on the map.
   *
   * @param isOn - Boolean indicating whether to display (true) or hide (false)
   *               the buildings layer.
   */
  setBuildingsEnabled(isOn: boolean): void;

  /**
   * Getter trigger functions for MapsSDK
   *
   * @returns the current map camera position. If map instance is null
   * this function returns an error message and can be accessed using the 'error' key
   * Response includes target_latitude (double), target_longitude (double), zoom (float),
   * tilt (float) and bearing (float)
   */
  getCameraPosition(): Promise<CameraPosition>;
  /**
   *
   * @returns the current user location. If map instance is null
   * this function returns an error message and can be accessed using the 'error' key
   * Response includes: latitude (double), longitude (double), accuracy (float)
   * altitude (double), bearing (float), speed (float), time (long), provider (String)
   */
  getMyLocation(): Promise<Location>;
  /**
   *
   * @returns the map uisettings that includes boolean values. If map instance is null
   * this function returns an error message and can be accessed using the 'error' key
   * Response includes isCompassEnabled, isMapToolbarEnabled, isIndoorLevelPickerEnabled, isRotateGesturesEnabled
   * isScrollGesturesEnabled, isScrollGesturesEnabledDuringRotateOrZoom, isTiltGesturesEnabled, isZoomControlsEnabled
   * isZoomGesturesEnabled
   */
  getUiSettings(): Promise<UISettings>;
  /**
   * Check if user location is enabled on the map.
   *
   * @returns A promise that resolves to a boolean indicating whether user
   *          location is enabled (true) or disabled (false).
   */
  isMyLocationEnabled(): Promise<boolean>;
  /**
   * Move the camera to a new position based on the object given.
   *
   * @param cameraPosition - Defines the position the camera will take with the move.
   */
  moveCamera(cameraPosition: CameraPosition): void;
}
