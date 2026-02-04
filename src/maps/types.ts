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

import type { StyleProp, ViewStyle, ColorValue } from 'react-native';
import type { LatLng } from '../shared/types';
import type { MapViewController, MapViewType, Padding } from './mapView/types';

/**
 * An immutable class that aggregates all camera position parameters such as
 * location, zoom level, tilt angle, and bearing.
 */
export interface CameraPosition {
  /** The location that the camera is pointing at. */
  target: LatLng;
  /** Direction that the camera is pointing in, in degrees clockwise from north. */
  bearing?: number;
  /** The angle, in degrees, of the camera angle from the nadir (directly facing the Earth). */
  tilt?: number;
  /** Zoom level near the center of the screen. */
  zoom?: number;
}

/**
 * An immutable class representing a latitude/longitude aligned rectangle.
 */
export interface LatLngBounds {
  /** Northeast corner of the bound. */
  northEast: LatLng;
  /** Southwest corner of the bound. */
  southWest: LatLng;
}

/**
 * A polygon on the earth's surface. A polygon can be convex or concave,
 * it may span the 180 meridian and it can have holes that are not filled in.
 */
export interface Polygon {
  /** An array of LatLngs that are the vertices of the polygon. */
  points: LatLng[];
  /** An array of holes, where a hole is an array of LatLngs. */
  holes: LatLng[][];
  /** Id of the polygon. The id will be unique amongst all polygons on a map. */
  id: string;
  /** The fill color of the polygon. */
  fillColor?: ColorValue;
  /** Sets the width of the stroke of the polygon. The width is defined in pixels. */
  strokeWidth?: number;
  /** Sets the stroke color of this polygon. */
  strokeColor?: ColorValue;
  /** The joint type for all vertices of the polygon's outline. Mitered join (default): 0, Bevel: 1, Round: 2. */
  strokeJointType?: number;
  /** The zIndex of the polygon. */
  zIndex?: number;
  /** Indicates whether the segments of the polygon should be drawn as geodesics, as opposed to straight lines on the Mercator projection. A geodesic is the shortest path between two points on the Earth's surface. The geodesic curve is constructed assuming the Earth is a sphere. */
  geodesic?: boolean;
}

/**
 * A circle on the earth's surface (spherical cap).
 */
export interface Circle {
  /** The center of the Circle is specified as a LatLng. */
  center: LatLng;
  /** Id of the circle. The id will be unique amongst all circles on a map. */
  id: string;
  /** The fill color of the circle. */
  fillColor?: ColorValue;
  /** The width of the stroke of the circle. The width is defined in pixels. */
  strokeWidth?: number;
  /** The stroke color of this circle. */
  strokeColor?: ColorValue;
  /** The radius of the circle, specified in meters. It should be zero or greater. */
  radius?: number;
  /** The zIndex of the circle. */
  zIndex?: number;
}

/**
 * A ground overlay is an image that is fixed to a map.
 * Ground overlays are oriented against the Earth's surface rather than the screen.
 */
export interface GroundOverlay {
  /** Id of the ground overlay. The id will be unique amongst all ground overlays on a map. */
  id: string;
  /** The location of the anchor point (the point that remains fixed to the position on the ground). */
  position?: LatLng;
  /** The bounds of the ground overlay. */
  bounds?: {
    /** Northeast corner of the bound. */
    northEast: LatLng;
    /** Southwest corner of the bound. */
    southWest: LatLng;
    /** Center of the bound. */
    center: LatLng;
  };
  /** The height of the ground overlay in meters. */
  height?: number;
  /** The width of the ground overlay in meters. */
  width?: number;
  /** The bearing of the ground overlay in degrees clockwise from north. */
  bearing: number;
  /** The transparency of the ground overlay (0.0 = opaque, 1.0 = fully transparent). */
  transparency: number;
  /** The zIndex of the ground overlay. */
  zIndex?: number;
}

/**
 * An icon placed at a particular point on the map's surface. A marker icon is drawn
 * oriented against the device's screen rather than the map's surface;
 * i.e., it will not necessarily change orientation due to map rotations, tilting, or zooming.
 */
export interface Marker {
  /** The LatLng value for the marker's position on the map. You can change this value at any time if you want to move the marker. */
  position: LatLng;
  /** Id of the marker. The id will be unique amongst all markers on a map. */
  id: string;
  /** A text string that's displayed in an info window when the user taps the marker. You can change this value at any time. */
  title?: string;
  /** Sets the opacity of the marker. Defaults to 1.0. */
  alpha?: number;
  /** The rotation of the marker in degrees clockwise about the marker's anchor point. The axis of rotation is perpendicular to the marker. A rotation of 0 corresponds to the default position of the marker. When the marker is flat on the map, the default position is North aligned and the rotation is such that the marker always remains flat on the map. When the marker is a billboard, the default position is pointing up and the rotation is such that the marker is always facing the camera. The default value is 0. */
  rotation?: number;
  /** Additional text that's displayed below the title. You can change this value at any time. */
  snippet?: string;
  /** The zIndex of the marker. */
  zIndex?: number;
}

/**
 * A polyline is a list of points, where line segments are drawn between consecutive points.
 */
export interface Polyline {
  /** An array of LatLngs that are the vertices of the polyline. */
  points: LatLng[];
  /** Id of the polyline. The id will be unique amongst all polylines on a map. */
  id: string;
  /** The color of this polyline. */
  color?: ColorValue;
  /** The width of the stroke of the polyline. The width is defined in pixels. */
  width?: number;
  /** The joint type for all vertices of the polyline. Mitered join (default): 0, Bevel: 1, Round: 2. */
  jointType?: number;
  /** The zIndex of the polyline. */
  zIndex?: number;
}

/**
 * Settings for the user interface of a GoogleMap.
 */
export interface UISettings {
  /** Defines whether the compass is enabled/disabled on the GoogleMap. */
  isCompassEnabled: boolean;
  /** Defines whether the Map Toolbar is enabled/disabled on the GoogleMap. */
  isMapToolbarEnabled: boolean;
  /** Defines whether the indoor level picker is enabled/disabled on the GoogleMap. That is, whether the level picker will appear when a building with indoor maps is focused. */
  isIndoorLevelPickerEnabled: boolean;
  /** Defines whether rotate gestures are enabled/disabled on the GoogleMap. */
  isRotateGesturesEnabled: boolean;
  /** Defines whether scroll gestures are enabled/disabled on the GoogleMap. */
  isScrollGesturesEnabled: boolean;
  /** Defines whether scroll gestures are enabled/disabled during rotation and zoom gestures on the GoogleMap. */
  isScrollGesturesEnabledDuringRotateOrZoom: boolean;
  /** Defines whether tilt gestures are enabled/disabled on the GoogleMap. */
  isTiltGesturesEnabled: boolean;
  /** Defines whether the zoom controls are enabled/disabled on the GoogleMap. */
  isZoomControlsEnabled: boolean;
  /** Defines zoom gestures are enabled/disabled on the GoogleMap. */
  isZoomGesturesEnabled: boolean;
}

/**
 * Defines the color scheme to be applied to the rendered map.
 */
export enum MapColorScheme {
  /** Follows the system or SDK default (automatic). */
  FOLLOW_SYSTEM = 0,
  /** Forces the light color scheme. */
  LIGHT = 1,
  /** Forces the dark color scheme. */
  DARK = 2,
}

/**
 * `MapViewProps` interface provides methods focused on managing map events and state changes.
 */
export interface MapViewProps {
  /**
   * Callback function invoked when GoogleMap is ready.
   */
  readonly onMapReady?: () => void;

  /**
   * Callback invoked when clicking a marker on the map.
   */
  readonly onMarkerClick?: (marker: Marker) => void;

  /**
   * Callback invoked when clicking a polyline on the map.
   */
  readonly onPolylineClick?: (polyline: Polyline) => void;

  /**
   * Callback invoked when clicking a polygon on the map.
   */
  readonly onPolygonClick?: (polygon: Polygon) => void;

  /**
   * Callback invoked when clicking a circle on the map.
   */
  readonly onCircleClick?: (circle: Circle) => void;

  /**
   * Callback invoked when tapping on a ground overlay.
   */
  readonly onGroundOverlayClick?: (groundOverlay: GroundOverlay) => void;

  /**
   * Callback invoked when tapping on a marker's info window.
   */
  readonly onMarkerInfoWindowTapped?: (marker: Marker) => void;

  /**
   * Callback invoked when there is a click on the map view.
   * @param latLng position where the click occurred.
   */
  readonly onMapClick?: (latLng: LatLng) => void;

  readonly style?: StyleProp<ViewStyle> | undefined;

  /**
   * The map ID is used to associate your map with a particular style in the Google Cloud Console.
   *
   * This enables Cloud-based map styling for both navigation and regular maps.
   * The map ID must be configured in your Google Cloud Console project before use.
   */
  readonly mapId?: string;

  /**
   * Sets the preferred color scheme for the map view.
   * Note if NavigationView is used, the `navigationNightMode` prop must be used to control night mode for navigation session.
   *
   * Defaults to `ColorScheme.FOLLOW_SYSTEM`.
   */
  readonly mapColorScheme?: MapColorScheme;

  /**
   * The type of map tiles to display.
   */
  readonly mapType?: MapViewType;

  /**
   * Sets padding on the map in pixels.
   */
  readonly mapPadding?: Padding;

  /**
   * Night mode setting for the map.
   * Only affects regular maps. For navigation maps, use `navigationNightMode`.
   * @deprecated Use mapColorScheme instead.
   */
  readonly nightMode?: number;

  /**
   * Custom map styling via JSON.
   */
  readonly mapStyle?: string;

  /**
   * Controls whether the map toolbar (Google Maps button) is enabled.
   * Defaults to true.
   */
  readonly mapToolbarEnabled?: boolean;

  /**
   * Controls whether indoor maps are shown.
   * Defaults to true.
   */
  readonly indoorEnabled?: boolean;

  /**
   * Controls whether the indoor level picker is shown when viewing indoor maps.
   * Defaults to true.
   */
  readonly indoorLevelPickerEnabled?: boolean;

  /**
   * Controls whether traffic data is shown on the map.
   * Defaults to false.
   */
  readonly trafficEnabled?: boolean;

  /**
   * Controls whether the compass is enabled.
   * Defaults to true.
   */
  readonly compassEnabled?: boolean;

  /**
   * Controls whether the my location button is enabled.
   * Defaults to true.
   */
  readonly myLocationButtonEnabled?: boolean;

  /**
   * Controls whether the my location indicator is enabled.
   * Requires location permissions.
   * Defaults to false.
   */
  readonly myLocationEnabled?: boolean;

  /**
   * Controls whether rotate gestures are enabled.
   * Defaults to true.
   */
  readonly rotateGesturesEnabled?: boolean;

  /**
   * Controls whether scroll gestures are enabled.
   * Defaults to true.
   */
  readonly scrollGesturesEnabled?: boolean;

  /**
   * Controls whether scroll gestures are enabled during rotate or zoom.
   * Defaults to true.
   */
  readonly scrollGesturesDuringRotateOrZoomEnabled?: boolean;

  /**
   * Controls whether tilt gestures are enabled.
   * Defaults to true.
   */
  readonly tiltGesturesEnabled?: boolean;

  /**
   * Controls whether zoom gestures are enabled.
   * Defaults to true.
   */
  readonly zoomGesturesEnabled?: boolean;

  /**
   * Controls whether zoom controls are shown.
   * Defaults to false.
   */
  readonly zoomControlsEnabled?: boolean;

  /**
   * Controls whether 3D buildings are shown.
   * Defaults to true.
   */
  readonly buildingsEnabled?: boolean;

  /**
   * Sets the minimum zoom level.
   */
  readonly minZoomLevel?: number;

  /**
   * Sets the maximum zoom level.
   */
  readonly maxZoomLevel?: number;

  /**
   * Initial camera position for the map.
   */
  readonly initialCameraPosition?: CameraPosition;

  /**
   * Callback invoked when the MapViewController is created.
   */
  readonly onMapViewControllerCreated?: (
    mapViewController: MapViewController
  ) => void;
}
