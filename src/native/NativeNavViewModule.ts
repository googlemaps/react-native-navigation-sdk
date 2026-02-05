/**
 * Copyright 2026 Google LLC
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

import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

import type { Location } from '../shared';
import type {
  Circle,
  Marker,
  Polyline,
  Polygon,
  GroundOverlay,
  CameraPosition,
  UISettings,
} from '../maps';
import type {
  Float,
  Double,
  Int32,
  WithDefault,
} from 'react-native/Libraries/Types/CodegenTypesNamespace';

// Note: Using Double instead of Int32 as codegen for TurboModules currently
// fails to unbox values to Integer on iOS. Transporting the value to integer is
// done in the native code.

type CameraPositionSpec = Readonly<{
  target?: Readonly<{ lat: Float; lng: Float }> | null;
  bearing?: WithDefault<Float, null>;
  tilt?: WithDefault<Float, null>;
  zoom?: WithDefault<Float, null>;
}>;

type MarkerOptionsSpec = Readonly<{
  alpha?: WithDefault<Float, 0>;
  draggable?: WithDefault<boolean, false>;
  flat?: WithDefault<boolean, false>;
  id?: WithDefault<string, null>;
  imgPath?: WithDefault<string, null>;
  position: Readonly<{ lat: Float; lng: Float }>;
  rotation?: WithDefault<Float, 0>;
  snippet?: WithDefault<string, null>;
  title?: WithDefault<string, null>;
  visible?: WithDefault<boolean, true>;
  zIndex?: WithDefault<Double, null>;
}>;

type CircleOptionsSpec = Readonly<{
  center: Readonly<{ lat: Float; lng: Float }>;
  clickable?: WithDefault<boolean, true>;
  fillColor?: WithDefault<Double, null>;
  id?: WithDefault<string, null>;
  radius: Float;
  strokeColor?: WithDefault<Double, null>;
  strokeWidth?: WithDefault<Float, 0>;
  visible?: WithDefault<boolean, true>;
  zIndex?: WithDefault<Double, null>;
}>;

type PolygonOptionsSpec = Readonly<{
  clickable?: WithDefault<boolean, true>;
  fillColor?: WithDefault<Double, null>;
  geodesic?: WithDefault<boolean, false>;
  holes: ReadonlyArray<ReadonlyArray<Readonly<{ lat: Float; lng: Float }>>>;
  id?: WithDefault<string, null>;
  points: ReadonlyArray<Readonly<{ lat: Float; lng: Float }>>;
  strokeColor?: WithDefault<Double, null>;
  strokeWidth?: WithDefault<Float, 0>;
  visible?: WithDefault<boolean, true>;
  zIndex?: WithDefault<Double, null>;
  /** Mitered join (default): 0, Bevel: 1, Round: 2. */
  //strokeJointType?: WithDefault<Double, 0>;
}>;

type PolylineOptionsSpec = Readonly<{
  clickable?: WithDefault<boolean, true>;
  color?: WithDefault<Double, null>;
  id?: WithDefault<string, null>;
  points: ReadonlyArray<Readonly<{ lat: Float; lng: Float }>>;
  visible?: WithDefault<boolean, true>;
  width?: WithDefault<Float, 1>;
  zIndex?: WithDefault<Double, null>;
  /** Mitered join (default): 0, Bevel: 1, Round: 2. */
  //jointType?: WithDefault<Double, 0>;
}>;

type GroundOverlayOptionsSpec = Readonly<{
  id?: WithDefault<string, null>;
  imgPath: string;
  // Position-based positioning (use location + width/height)
  location?: Readonly<{ lat: Float; lng: Float }>;
  width?: WithDefault<Float, null>;
  height?: WithDefault<Float, null>;
  zoomLevel?: WithDefault<Float, null>;
  // Bounds-based positioning (alternative to location)
  bounds?: Readonly<{
    northEast: Readonly<{ lat: Float; lng: Float }>;
    southWest: Readonly<{ lat: Float; lng: Float }>;
  }>;
  bearing?: WithDefault<Float, 0>;
  /** Transparency of the ground overlay (0 = opaque, 1 = fully transparent). Default is 0. */
  transparency?: WithDefault<Float, 0>;
  anchor?: Readonly<{ u: Float; v: Float }>;
  clickable?: WithDefault<boolean, false>;
  visible?: WithDefault<boolean, true>;
  zIndex?: WithDefault<Float, 0>;
}>;

/**
 * TurboModule for map view operations.
 *
 * All methods take a `nativeID` string parameter to identify which view instance
 * to operate on. The native implementation maintains a registry mapping nativeIDs
 * to view instances.
 */
export interface Spec extends TurboModule {
  addCircle(nativeID: string, options: CircleOptionsSpec): Promise<Circle>;
  addMarker(nativeID: string, options: MarkerOptionsSpec): Promise<Marker>;
  addPolyline(
    nativeID: string,
    options: PolylineOptionsSpec
  ): Promise<Polyline>;
  addPolygon(nativeID: string, options: PolygonOptionsSpec): Promise<Polygon>;
  addGroundOverlay(
    nativeID: string,
    options: GroundOverlayOptionsSpec
  ): Promise<GroundOverlay>;
  setFollowingPerspective(nativeID: string, perspective: Int32): Promise<void>;
  moveCamera(
    nativeID: string,
    cameraPosition: CameraPositionSpec
  ): Promise<void>;
  getCameraPosition(nativeID: string): Promise<CameraPosition>;
  getMyLocation(nativeID: string): Promise<Location>;
  getUiSettings(nativeID: string): Promise<UISettings>;
  isMyLocationEnabled(nativeID: string): Promise<boolean>;
  setNavigationUIEnabled(nativeID: string, enabled: boolean): Promise<void>;
  showRouteOverview(nativeID: string): Promise<boolean>;
  clearMapView(nativeID: string): Promise<boolean>;
  removeMarker(nativeID: string, id: string): Promise<boolean>;
  removePolyline(nativeID: string, id: string): Promise<boolean>;
  removePolygon(nativeID: string, id: string): Promise<boolean>;
  removeCircle(nativeID: string, id: string): Promise<boolean>;
  removeGroundOverlay(nativeID: string, id: string): Promise<boolean>;
  setZoomLevel(nativeID: string, level: Double): Promise<boolean>;
  getMarkers(nativeID: string): Promise<Marker[]>;
  getCircles(nativeID: string): Promise<Circle[]>;
  getPolylines(nativeID: string): Promise<Polyline[]>;
  getPolygons(nativeID: string): Promise<Polygon[]>;
  getGroundOverlays(nativeID: string): Promise<GroundOverlay[]>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NavViewModule');
export type { Spec as NavViewModuleSpec };
