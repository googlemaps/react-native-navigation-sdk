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
  CameraPosition,
  UISettings,
  GroundOverlay,
} from '../maps';
import type {
  Double,
  EventEmitter,
  Float,
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
  position: Readonly<{ lat: Float; lng: Float }>;
  id?: WithDefault<string, null>;
  imgPath?: WithDefault<string, null>;
  title?: WithDefault<string, null>;
  snippet?: WithDefault<string, null>;
  alpha?: WithDefault<Float, 0>;
  rotation?: WithDefault<Float, 0>;
  draggable?: WithDefault<boolean, false>;
  flat?: WithDefault<boolean, false>;
  visible?: WithDefault<boolean, true>;
  zIndex?: WithDefault<Double, null>;
}>;

type CircleOptionsSpec = Readonly<{
  center: Readonly<{ lat: Float; lng: Float }>;
  id?: WithDefault<string, null>;
  radius: Float;
  strokeWidth?: WithDefault<Float, 0>;
  strokeColor?: WithDefault<Double, null>;
  fillColor?: WithDefault<Double, null>;
  clickable?: WithDefault<boolean, true>;
  visible?: WithDefault<boolean, true>;
  zIndex?: WithDefault<Double, null>;
}>;

type PolygonOptionsSpec = Readonly<{
  points: ReadonlyArray<Readonly<{ lat: Float; lng: Float }>>;
  id?: WithDefault<string, null>;
  holes: ReadonlyArray<ReadonlyArray<Readonly<{ lat: Float; lng: Float }>>>;
  strokeWidth?: WithDefault<Float, 0>;
  strokeColor?: WithDefault<Double, null>;
  fillColor?: WithDefault<Double, null>;
  geodesic?: WithDefault<boolean, false>;
  /** Mitered join (default): 0, Bevel: 1, Round: 2. */
  //strokeJointType?: WithDefault<Double, 0>;
  clickable?: WithDefault<boolean, true>;
  visible?: WithDefault<boolean, true>;
  zIndex?: WithDefault<Double, null>;
}>;

type PolylineOptionsSpec = Readonly<{
  points: ReadonlyArray<Readonly<{ lat: Float; lng: Float }>>;
  id?: WithDefault<string, null>;
  color?: WithDefault<Double, null>;
  width?: WithDefault<Float, 1>;
  /** Mitered join (default): 0, Bevel: 1, Round: 2. */
  //jointType?: WithDefault<Double, 0>;
  clickable?: WithDefault<boolean, true>;
  visible?: WithDefault<boolean, true>;
  zIndex?: WithDefault<Double, null>;
}>;

type GroundOverlayOptionsSpec = Readonly<{
  imgPath: string;
  id?: WithDefault<string, null>;
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
  // Common options
  bearing?: WithDefault<Float, 0>;
  /** Transparency of the ground overlay (0 = opaque, 1 = fully transparent). Default is 0. */
  transparency?: WithDefault<Float, 0>;
  anchor?: Readonly<{ u: Float; v: Float }>;
  clickable?: WithDefault<boolean, false>;
  visible?: WithDefault<boolean, true>;
  zIndex?: WithDefault<Float, 0>;
}>;

type CustomNavigationAutoEventSpec = Readonly<{
  type: string;
  data?: string | null;
}>;

export interface Spec extends TurboModule {
  isAutoScreenAvailable(): Promise<boolean>;
  setMapType(mapType: Double): void;
  setMapStyle(mapStyle: string): void;
  clearMapView(): Promise<boolean>;
  addCircle(options: CircleOptionsSpec): Promise<Circle>;
  addMarker(options: MarkerOptionsSpec): Promise<Marker>;
  addPolyline(options: PolylineOptionsSpec): Promise<Polyline>;
  addPolygon(options: PolygonOptionsSpec): Promise<Polygon>;
  addGroundOverlay(options: GroundOverlayOptionsSpec): Promise<GroundOverlay>;
  moveCamera(cameraPosition: CameraPositionSpec): Promise<void>;
  removeMarker(id: string): Promise<boolean>;
  removePolyline(id: string): Promise<boolean>;
  removePolygon(id: string): Promise<boolean>;
  removeCircle(id: string): Promise<boolean>;
  removeGroundOverlay(id: string): Promise<boolean>;
  setIndoorEnabled(enabled: boolean): void;
  setTrafficEnabled(enabled: boolean): void;
  setCompassEnabled(enabled: boolean): void;
  setMyLocationEnabled(enabled: boolean): void;
  setMyLocationButtonEnabled(enabled: boolean): void;
  setMapColorScheme(colorScheme: Int32): void;
  setNightMode(nightMode: Int32): void;
  setFollowingPerspective(perspective: Int32): void;
  setBuildingsEnabled(enabled: boolean): void;
  setZoomLevel(zoomLevel: Double): Promise<void>;
  setMapPadding(top: Double, left: Double, bottom: Double, right: Double): void;
  getCameraPosition(): Promise<CameraPosition>;
  getMyLocation(): Promise<Location>;
  getUiSettings(): Promise<UISettings>;
  isMyLocationEnabled(): Promise<boolean>;
  getMarkers(): Promise<Marker[]>;
  getCircles(): Promise<Circle[]>;
  getPolylines(): Promise<Polyline[]>;
  getPolygons(): Promise<Polygon[]>;
  getGroundOverlays(): Promise<GroundOverlay[]>;
  sendCustomMessage(type: string, data: string | null): void;

  // Event emitters
  onAutoScreenAvailabilityChanged: EventEmitter<boolean>;
  onCustomNavigationAutoEvent: EventEmitter<CustomNavigationAutoEventSpec>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NavAutoModule');
export type { Spec as NavAutoModuleSpec };
