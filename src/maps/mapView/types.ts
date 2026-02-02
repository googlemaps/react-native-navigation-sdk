/**
 * Copyright 2024 Google LLC
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

import type { ColorValue } from 'react-native';
import type { LatLng, Location } from '../../shared/types';
import type {
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
  /** Optional custom identifier for this circle. If provided, this ID will be used instead of the auto-generated one. Can be used to update/replace an existing circle with the same ID. */
  id?: string;
  /** The center of the circle defined as a LatLng. */
  center: LatLng;
  /** The radius of the circle in pixels. */
  radius: number;
  /** The width of the stroke of the circle. The width is defined in pixels. */
  strokeWidth?: number;
  /** Sets the stroke color of this circle. Supports all React Native color formats (ColorValue). */
  strokeColor?: ColorValue;
  /** The fill color of this circle. Supports all React Native color formats (ColorValue). */
  fillColor?: ColorValue;
  /** Defines whether the circle should receive click events */
  clickable?: boolean;
  /** Defines whether the circle should be rendered (displayed) in GoogleMap */
  visible?: boolean;
}

/**
 * Defines MarkerOptions for a marker.
 */
export interface MarkerOptions {
  /** Optional custom identifier for this marker. If provided, this ID will be used instead of the auto-generated one. Can be used to update/replace an existing marker with the same ID. */
  id?: string;
  /** The LatLng value for the marker's position on the map. You can change this value at any time if you want to move the marker. */
  position: LatLng;
  /** Path to a local image asset that should be displayed in the marker instead of using the default marker pin. */
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
  /** Optional custom identifier for this polygon. If provided, this ID will be used instead of the auto-generated one. Can be used to update/replace an existing polygon with the same ID. */
  id?: string;
  /** An array of LatLngs that are the vertices of the polygon. */
  points: LatLng[];
  /** An array of holes, where a hole is an array of LatLngs. */
  holes?: LatLng[][];
  /** Sets the width of the stroke of the polygon. The width is defined in pixels. */
  strokeWidth?: number;
  /** Sets the stroke color of this polygon. Supports all React Native color formats (ColorValue). */
  strokeColor?: ColorValue;
  /** The fill color of the polygon. Supports all React Native color formats (ColorValue). */
  fillColor?: ColorValue;
  /** Indicates whether the segments of the polygon should be drawn as geodesics, as opposed to straight lines on the Mercator projection. A geodesic is the shortest path between two points on the Earth's surface. The geodesic curve is constructed assuming the Earth is a sphere. */
  geodesic?: boolean;
  /** Indicates the clickability of the polygon. False by default. */
  clickable?: boolean;
  /** Indicates the visibility of the polygon. True by default. */
  visible?: boolean;
}

/**
 * Defines PolylineOptions for a Polyline.
 */
export interface PolylineOptions {
  /** Optional custom identifier for this polyline. If provided, this ID will be used instead of the auto-generated one. Can be used to update/replace an existing polyline with the same ID. */
  id?: string;
  /** An array of LatLngs that are the vertices of the polyline. */
  points: LatLng[];
  /** The color of this polyline. Supports all React Native color formats (ColorValue). */
  color?: ColorValue;
  /** The width of the stroke of the polyline. The width is defined in pixels. */
  width?: number;
  /** Indicates the clickability of the polyline. False by default. */
  clickable?: boolean;
  /** Indicates the visibility of the polyline. True by default. */
  visible?: boolean;
}

/**
 * Base options shared by all ground overlay positioning methods.
 */
interface GroundOverlayBaseOptions {
  /** Optional custom identifier for this ground overlay. If provided, this ID will be used instead of the auto-generated one. Can be used to update/replace an existing ground overlay with the same ID. */
  id?: string;
  /** Path to a local image asset to display as the ground overlay. Required. */
  imgPath: string;
  /** The bearing of the ground overlay in degrees clockwise from north. Default is 0. */
  bearing?: number;
  /** The transparency of the ground overlay (0.0 = opaque, 1.0 = fully transparent). Default is 0. */
  transparency?: number;
  /** Indicates whether the ground overlay should receive click events. Default is false. */
  clickable?: boolean;
  /** Indicates whether the ground overlay is visible. Default is true. */
  visible?: boolean;
  /** The zIndex of the ground overlay. */
  zIndex?: number;
  /** The anchor point of the image in normalized coordinates (0-1). Default is center (0.5, 0.5). */
  anchor?: { u: number; v: number };
}

/**
 * Options for creating a ground overlay using a position with dimensions.
 * The overlay is positioned at a specific location with width/height in meters.
 *
 * Note: This method is fully supported on Android. On iOS, the zoomLevel
 * parameter is used instead of width/height when creating the overlay.
 */
export interface GroundOverlayPositionOptions extends GroundOverlayBaseOptions {
  /** The location on the map (LatLng) to which the anchor point will remain fixed. */
  location: LatLng;
  /** The width of the overlay in meters. Required for Android; used with zoomLevel on iOS. */
  width: number;
  /** The height of the overlay in meters. If not specified, the aspect ratio of the image will be preserved. */
  height?: number;
  /**
   * The zoom level at which the image should appear at its native size.
   * Required for iOS when using position-based positioning.
   * On Android, this is optional and width/height are used instead.
   */
  zoomLevel?: number;
}

/**
 * Options for creating a ground overlay using bounds.
 * The overlay is stretched to fit within the specified LatLngBounds.
 * This is the most reliable cross-platform method for positioning ground overlays.
 */
export interface GroundOverlayBoundsOptions extends GroundOverlayBaseOptions {
  /** The bounds within which the ground overlay will be positioned. */
  bounds: {
    /** Northeast corner of the bounds. */
    northEast: LatLng;
    /** Southwest corner of the bounds. */
    southWest: LatLng;
  };
}

/**
 * Defines options for a GroundOverlay.
 * A ground overlay is an image that is fixed to a map.
 *
 * There are two ways to position a ground overlay:
 * 1. Using `location` with `width`/`height` (position-based): The overlay is anchored
 *    to a specific location with dimensions in meters.
 * 2. Using `bounds` (bounds-based): The overlay is stretched to fit within the
 *    specified LatLngBounds. This is the most reliable cross-platform method.
 *
 * You must specify either `location` or `bounds`, but not both.
 */
export type GroundOverlayOptions =
  | GroundOverlayPositionOptions
  | GroundOverlayBoundsOptions;

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

/**
 * Defines the padding options for a map.
 */
export interface Padding {
  /** Top padding in pixels. */
  top?: number;
  /** Left padding in pixels. */
  left?: number;
  /** Bottom padding in pixels. */
  bottom?: number;
  /** Right padding in pixels. */
  right?: number;
}

/**
 * Defines the type of the map view.
 */
export enum MapViewType {
  /** Regular Google map view without navigation */
  MAP = 0,
  /** Google map view with navigation */
  NAVIGATION = 1,
}

export interface MapViewController {
  /**
   * Clear all elements from the map view.
   */
  clearMapView(): void;

  /**
   * Add or update a circle overlay on the map.
   * If a circle with the same `id` already exists, it will be updated with the new options.
   * To update an existing circle, pass the `id` from the previously returned circle object.
   * @param circleOptions - Object specifying the properties of the circle,
   *                        including center coordinates, radius, and various
   *                        styling options.
   * @returns The created or updated circle, including its `id` for future updates.
   */
  addCircle(circleOptions: CircleOptions): Promise<Circle>;

  /**
   * Add or update a marker on the map.
   * If a marker with the same `id` already exists, it will be updated with the new options.
   * To update an existing marker, pass the `id` from the previously returned marker object.
   * @param markerOptions - Object specifying properties of the marker, including
   *                        coordinates, image path, title, snippet, opacity,
   *                        rotation, and various flags for other properties.
   * @returns The created or updated marker, including its `id` for future updates.
   */
  addMarker(markerOptions: MarkerOptions): Promise<Marker>;
  /**
   * Add or update a polyline on the map.
   * If a polyline with the same `id` already exists, it will be updated with the new options.
   * To update an existing polyline, pass the `id` from the previously returned polyline object.
   *
   * @param polylineOptions - Object specifying properties of the polyline,
   *                          including coordinates, color, width, and visibility.
   * @returns The created or updated polyline, including its `id` for future updates.
   */
  addPolyline(polylineOptions: PolylineOptions): Promise<Polyline>;

  /**
   * Add or update a polygon on the map.
   * If a polygon with the same `id` already exists, it will be updated with the new options.
   * To update an existing polygon, pass the `id` from the previously returned polygon object.
   *
   * @param polygonOptions - Object specifying properties of the polygon,
   *                         including coordinates, stroke color, fill color,
   *                         and visibility.
   * @returns The created or updated polygon, including its `id` for future updates.
   */
  addPolygon(polygonOptions: PolygonOptions): Promise<Polygon>;

  /**
   * Add or update a ground overlay on the map.
   * A ground overlay is an image that is fixed to a map.
   * If a ground overlay with the same `id` already exists, it will be updated with the new options.
   * To update an existing ground overlay, pass the `id` from the previously returned object.
   *
   * @param groundOverlayOptions - Object specifying properties of the ground overlay,
   *                               including image path, location, dimensions, bearing,
   *                               transparency, and visibility.
   * @returns The created or updated ground overlay, including its `id` for future updates.
   */
  addGroundOverlay(
    groundOverlayOptions: GroundOverlayOptions
  ): Promise<GroundOverlay>;

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
   * Sets the zoom level of the map.
   *
   * @param level - The desired zoom level.
   */
  setZoomLevel(level: number): void;

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

  /**
   * Sets padding to the map.
   *
   * @param padding - An object defining padding for each side.
   *                  Example: { top: 10, left: 5, bottom: 15, right: 10 }
   */
  setPadding(padding: Padding): void;

  /**
   * Get all markers currently on the map.
   *
   * @returns A promise that resolves to an array of Marker objects.
   */
  getMarkers(): Promise<Marker[]>;

  /**
   * Get all circles currently on the map.
   *
   * @returns A promise that resolves to an array of Circle objects.
   */
  getCircles(): Promise<Circle[]>;

  /**
   * Get all polylines currently on the map.
   *
   * @returns A promise that resolves to an array of Polyline objects.
   */
  getPolylines(): Promise<Polyline[]>;

  /**
   * Get all polygons currently on the map.
   *
   * @returns A promise that resolves to an array of Polygon objects.
   */
  getPolygons(): Promise<Polygon[]>;

  /**
   * Get all ground overlays currently on the map.
   *
   * @returns A promise that resolves to an array of GroundOverlay objects.
   */
  getGroundOverlays(): Promise<GroundOverlay[]>;
}
