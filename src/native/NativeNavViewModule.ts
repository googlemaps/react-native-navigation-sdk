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

import type { CodegenTypes, TurboModule } from 'react-native';
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

// Note: Using Double instead of Int32 as codegen for TurboModules currently
// fails to unbox values to Integer on iOS. Transporting the value to integer is
// done in the native code.

type CameraPositionSpec = Readonly<{
  target?: Readonly<{
    lat: CodegenTypes.Float;
    lng: CodegenTypes.Float;
  }> | null;
  bearing?: CodegenTypes.WithDefault<CodegenTypes.Float, null>;
  tilt?: CodegenTypes.WithDefault<CodegenTypes.Float, null>;
  zoom?: CodegenTypes.WithDefault<CodegenTypes.Float, null>;
}>;

type MarkerOptionsSpec = Readonly<{
  alpha?: CodegenTypes.WithDefault<CodegenTypes.Float, 0>;
  anchor?: Readonly<{ u: CodegenTypes.Float; v: CodegenTypes.Float }>;
  draggable?: CodegenTypes.WithDefault<boolean, false>;
  flat?: CodegenTypes.WithDefault<boolean, false>;
  id?: CodegenTypes.WithDefault<string, null>;
  imgPath?: CodegenTypes.WithDefault<string, null>;
  position: Readonly<{ lat: CodegenTypes.Float; lng: CodegenTypes.Float }>;
  rotation?: CodegenTypes.WithDefault<CodegenTypes.Float, 0>;
  snippet?: CodegenTypes.WithDefault<string, null>;
  title?: CodegenTypes.WithDefault<string, null>;
  visible?: CodegenTypes.WithDefault<boolean, true>;
  zIndex?: CodegenTypes.WithDefault<CodegenTypes.Double, null>;
}>;

type CircleOptionsSpec = Readonly<{
  center: Readonly<{ lat: CodegenTypes.Float; lng: CodegenTypes.Float }>;
  clickable?: CodegenTypes.WithDefault<boolean, true>;
  fillColor?: CodegenTypes.WithDefault<CodegenTypes.Double, null>;
  id?: CodegenTypes.WithDefault<string, null>;
  radius: CodegenTypes.Float;
  strokeColor?: CodegenTypes.WithDefault<CodegenTypes.Double, null>;
  strokeWidth?: CodegenTypes.WithDefault<CodegenTypes.Float, 0>;
  visible?: CodegenTypes.WithDefault<boolean, true>;
  zIndex?: CodegenTypes.WithDefault<CodegenTypes.Double, null>;
}>;

type PolygonOptionsSpec = Readonly<{
  clickable?: CodegenTypes.WithDefault<boolean, true>;
  fillColor?: CodegenTypes.WithDefault<CodegenTypes.Double, null>;
  geodesic?: CodegenTypes.WithDefault<boolean, false>;
  holes: ReadonlyArray<
    ReadonlyArray<
      Readonly<{ lat: CodegenTypes.Float; lng: CodegenTypes.Float }>
    >
  >;
  id?: CodegenTypes.WithDefault<string, null>;
  points: ReadonlyArray<
    Readonly<{ lat: CodegenTypes.Float; lng: CodegenTypes.Float }>
  >;
  strokeColor?: CodegenTypes.WithDefault<CodegenTypes.Double, null>;
  strokeWidth?: CodegenTypes.WithDefault<CodegenTypes.Float, 0>;
  visible?: CodegenTypes.WithDefault<boolean, true>;
  zIndex?: CodegenTypes.WithDefault<CodegenTypes.Double, null>;
  /** Mitered join (default): 0, Bevel: 1, Round: 2. */
  //strokeJointType?: WithDefault<Double, 0>;
}>;

type PolylineOptionsSpec = Readonly<{
  clickable?: CodegenTypes.WithDefault<boolean, true>;
  color?: CodegenTypes.WithDefault<CodegenTypes.Double, null>;
  id?: CodegenTypes.WithDefault<string, null>;
  points: ReadonlyArray<
    Readonly<{ lat: CodegenTypes.Float; lng: CodegenTypes.Float }>
  >;
  visible?: CodegenTypes.WithDefault<boolean, true>;
  width?: CodegenTypes.WithDefault<CodegenTypes.Float, 1>;
  zIndex?: CodegenTypes.WithDefault<CodegenTypes.Double, null>;
  /** Mitered join (default): 0, Bevel: 1, Round: 2. */
  //jointType?: WithDefault<Double, 0>;
}>;

type GroundOverlayOptionsSpec = Readonly<{
  id?: CodegenTypes.WithDefault<string, null>;
  imgPath: string;
  // Position-based positioning (use location + width/height)
  location?: Readonly<{ lat: CodegenTypes.Float; lng: CodegenTypes.Float }>;
  width?: CodegenTypes.WithDefault<CodegenTypes.Float, null>;
  height?: CodegenTypes.WithDefault<CodegenTypes.Float, null>;
  zoomLevel?: CodegenTypes.WithDefault<CodegenTypes.Float, null>;
  // Bounds-based positioning (alternative to location)
  bounds?: Readonly<{
    northEast: Readonly<{ lat: CodegenTypes.Float; lng: CodegenTypes.Float }>;
    southWest: Readonly<{ lat: CodegenTypes.Float; lng: CodegenTypes.Float }>;
  }>;
  bearing?: CodegenTypes.WithDefault<CodegenTypes.Float, 0>;
  /** Transparency of the ground overlay (0 = opaque, 1 = fully transparent). Default is 0. */
  transparency?: CodegenTypes.WithDefault<CodegenTypes.Float, 0>;
  anchor?: Readonly<{ u: CodegenTypes.Float; v: CodegenTypes.Float }>;
  clickable?: CodegenTypes.WithDefault<boolean, false>;
  visible?: CodegenTypes.WithDefault<boolean, true>;
  zIndex?: CodegenTypes.WithDefault<CodegenTypes.Float, 0>;
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
  setFollowingPerspective(
    nativeID: string,
    perspective: CodegenTypes.Int32,
    zoomLevel?: CodegenTypes.WithDefault<CodegenTypes.Float, null>
  ): Promise<void>;
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
  setZoomLevel(nativeID: string, level: CodegenTypes.Double): Promise<boolean>;
  getMarkers(nativeID: string): Promise<Marker[]>;
  getCircles(nativeID: string): Promise<Circle[]>;
  getPolylines(nativeID: string): Promise<Polyline[]>;
  getPolygons(nativeID: string): Promise<Polygon[]>;
  getGroundOverlays(nativeID: string): Promise<GroundOverlay[]>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NavViewModule');
export type { Spec as NavViewModuleSpec };
