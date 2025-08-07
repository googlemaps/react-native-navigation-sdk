/**
 * Copyright 2025 Google LLC
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
  WithDefault,
} from 'react-native/Libraries/Types/CodegenTypes';

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
  strokeColor?: WithDefault<string, null>;
  fillColor?: WithDefault<string, null>;
  clickable?: WithDefault<boolean, true>;
  visible?: WithDefault<boolean, true>;
  zIndex?: WithDefault<Double, null>;
}>;

type PolygonOptionsSpec = Readonly<{
  points: ReadonlyArray<Readonly<{ lat: Float; lng: Float }>>;
  id?: WithDefault<string, null>;
  holes: ReadonlyArray<ReadonlyArray<Readonly<{ lat: Float; lng: Float }>>>;
  strokeWidth?: WithDefault<Float, 0>;
  strokeColor?: WithDefault<string, null>;
  fillColor?: WithDefault<string, null>;
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
  color?: WithDefault<string, null>;
  width?: WithDefault<Float, 1>;
  /** Mitered join (default): 0, Bevel: 1, Round: 2. */
  //jointType?: WithDefault<Double, 0>;
  clickable?: WithDefault<boolean, true>;
  visible?: WithDefault<boolean, true>;
  zIndex?: WithDefault<Double, null>;
}>;

type CustomNavigationAutoEventSpec = Readonly<{
  type: string;
  data: Object | null;
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
  addGroundOverlay(options: {}): Promise<GroundOverlay>;
  moveCamera(cameraPosition: CameraPositionSpec): Promise<void>;
  removeMarker(id: string): Promise<boolean>;
  removePolyline(id: string): Promise<boolean>;
  removePolygon(id: string): Promise<boolean>;
  removeCircle(id: string): Promise<boolean>;
  removeGroundOverlay(id: string): Promise<boolean>;
  setIndoorEnabled(isOn: boolean): void;
  setTrafficEnabled(isOn: boolean): void;
  setCompassEnabled(isOn: boolean): void;
  setMyLocationEnabled(isOn: boolean): void;
  setBuildingsEnabled(isOn: boolean): void;
  setZoomLevel(zoomLevel: Double): Promise<void>;
  setMapPadding(top: Double, left: Double, bottom: Double, right: Double): void;
  getCameraPosition(): Promise<CameraPosition>;
  getMyLocation(): Promise<Location>;
  getUiSettings(): Promise<UISettings>;
  isMyLocationEnabled(): Promise<boolean>;

  // Event emitters
  onAutoScreenAvailabilityChanged: EventEmitter<boolean>;
  onCustomNavigationAutoEvent: EventEmitter<CustomNavigationAutoEventSpec>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NavAutoModule');
