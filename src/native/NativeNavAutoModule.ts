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
  CameraPosition,
  UISettings,
  GroundOverlay,
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
  position: Readonly<{ lat: CodegenTypes.Float; lng: CodegenTypes.Float }>;
  id?: CodegenTypes.WithDefault<string, null>;
  imgPath?: CodegenTypes.WithDefault<string, null>;
  title?: CodegenTypes.WithDefault<string, null>;
  snippet?: CodegenTypes.WithDefault<string, null>;
  alpha?: CodegenTypes.WithDefault<CodegenTypes.Float, 0>;
  rotation?: CodegenTypes.WithDefault<CodegenTypes.Float, 0>;
  draggable?: CodegenTypes.WithDefault<boolean, false>;
  flat?: CodegenTypes.WithDefault<boolean, false>;
  anchor?: Readonly<{ u: CodegenTypes.Float; v: CodegenTypes.Float }>;
  visible?: CodegenTypes.WithDefault<boolean, true>;
  zIndex?: CodegenTypes.WithDefault<CodegenTypes.Double, null>;
}>;

type CircleOptionsSpec = Readonly<{
  center: Readonly<{ lat: CodegenTypes.Float; lng: CodegenTypes.Float }>;
  id?: CodegenTypes.WithDefault<string, null>;
  radius: CodegenTypes.Float;
  strokeWidth?: CodegenTypes.WithDefault<CodegenTypes.Float, 0>;
  strokeColor?: CodegenTypes.WithDefault<CodegenTypes.Double, null>;
  fillColor?: CodegenTypes.WithDefault<CodegenTypes.Double, null>;
  clickable?: CodegenTypes.WithDefault<boolean, true>;
  visible?: CodegenTypes.WithDefault<boolean, true>;
  zIndex?: CodegenTypes.WithDefault<CodegenTypes.Double, null>;
}>;

type PolygonOptionsSpec = Readonly<{
  points: ReadonlyArray<
    Readonly<{ lat: CodegenTypes.Float; lng: CodegenTypes.Float }>
  >;
  id?: CodegenTypes.WithDefault<string, null>;
  holes: ReadonlyArray<
    ReadonlyArray<
      Readonly<{ lat: CodegenTypes.Float; lng: CodegenTypes.Float }>
    >
  >;
  strokeWidth?: CodegenTypes.WithDefault<CodegenTypes.Float, 0>;
  strokeColor?: CodegenTypes.WithDefault<CodegenTypes.Double, null>;
  fillColor?: CodegenTypes.WithDefault<CodegenTypes.Double, null>;
  geodesic?: CodegenTypes.WithDefault<boolean, false>;
  /** Mitered join (default): 0, Bevel: 1, Round: 2. */
  //strokeJointType?: WithDefault<Double, 0>;
  clickable?: CodegenTypes.WithDefault<boolean, true>;
  visible?: CodegenTypes.WithDefault<boolean, true>;
  zIndex?: CodegenTypes.WithDefault<CodegenTypes.Double, null>;
}>;

type PolylineOptionsSpec = Readonly<{
  points: ReadonlyArray<
    Readonly<{ lat: CodegenTypes.Float; lng: CodegenTypes.Float }>
  >;
  id?: CodegenTypes.WithDefault<string, null>;
  color?: CodegenTypes.WithDefault<CodegenTypes.Double, null>;
  width?: CodegenTypes.WithDefault<CodegenTypes.Float, 1>;
  /** Mitered join (default): 0, Bevel: 1, Round: 2. */
  //jointType?: WithDefault<Double, 0>;
  clickable?: CodegenTypes.WithDefault<boolean, true>;
  visible?: CodegenTypes.WithDefault<boolean, true>;
  zIndex?: CodegenTypes.WithDefault<CodegenTypes.Double, null>;
}>;

type GroundOverlayOptionsSpec = Readonly<{
  imgPath: string;
  id?: CodegenTypes.WithDefault<string, null>;
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
  // Common options
  bearing?: CodegenTypes.WithDefault<CodegenTypes.Float, 0>;
  /** Transparency of the ground overlay (0 = opaque, 1 = fully transparent). Default is 0. */
  transparency?: CodegenTypes.WithDefault<CodegenTypes.Float, 0>;
  anchor?: Readonly<{ u: CodegenTypes.Float; v: CodegenTypes.Float }>;
  clickable?: CodegenTypes.WithDefault<boolean, false>;
  visible?: CodegenTypes.WithDefault<boolean, true>;
  zIndex?: CodegenTypes.WithDefault<CodegenTypes.Float, 0>;
}>;

type CustomNavigationAutoEventSpec = Readonly<{
  type: string;
  data?: string | null;
}>;

export interface Spec extends TurboModule {
  isAutoScreenAvailable(): Promise<boolean>;
  setMapType(mapType: CodegenTypes.Double): void;
  setMapStyle(mapStyle: string): void;
  clearMapView(): Promise<boolean>;
  addCircle(options: CircleOptionsSpec): Promise<Circle>;
  addMarker(options: MarkerOptionsSpec): Promise<Marker>;
  addPolyline(options: PolylineOptionsSpec): Promise<Polyline>;
  addPolygon(options: PolygonOptionsSpec): Promise<Polygon>;
  addGroundOverlay(options: GroundOverlayOptionsSpec): Promise<GroundOverlay>;
  moveCamera(cameraPosition: CameraPositionSpec): Promise<void>;
  animateCamera(
    cameraPosition: CameraPositionSpec,
    duration?: WithDefault<Double, null>
  ): Promise<void>;
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
  setMapColorScheme(colorScheme: CodegenTypes.Int32): void;
  setNightMode(nightMode: CodegenTypes.Int32): void;
  setFollowingPerspective(
    perspective: CodegenTypes.Int32,
    zoomLevel?: CodegenTypes.WithDefault<CodegenTypes.Float, null>
  ): void;
  setBuildingsEnabled(enabled: boolean): void;
  setZoomLevel(zoomLevel: CodegenTypes.Double): Promise<void>;
  setMapPadding(
    top: CodegenTypes.Double,
    left: CodegenTypes.Double,
    bottom: CodegenTypes.Double,
    right: CodegenTypes.Double
  ): void;
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
  onAutoScreenAvailabilityChanged: CodegenTypes.EventEmitter<boolean>;
  onCustomNavigationAutoEvent: CodegenTypes.EventEmitter<CustomNavigationAutoEventSpec>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NavAutoModule');
export type { Spec as NavAutoModuleSpec };
