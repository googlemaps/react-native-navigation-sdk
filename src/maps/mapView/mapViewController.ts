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
import type {
  Circle,
  Marker,
  Polyline,
  Polygon,
  CameraPosition,
  UISettings,
  GroundOverlay,
} from '../types';
import type {
  CircleOptions,
  GroundOverlayOptions,
  MapViewController,
  MarkerOptions,
  PolygonOptions,
  PolylineOptions,
} from './types';
import type { Location } from '../../shared';

import { NavViewModule } from '../../native';

export const getMapViewController = (nativeID: number): MapViewController => {
  return {
    clearMapView: async () => {
      console.log('clearMapView', nativeID);
      return await NavViewModule.clearMapView(nativeID);
    },
    addCircle: async (options: CircleOptions): Promise<Circle> => {
      return await NavViewModule.addCircle(nativeID, options);
    },
    addMarker: async (options: MarkerOptions): Promise<Marker> => {
      return await NavViewModule.addMarker(nativeID, options);
    },
    addPolyline: async (options: PolylineOptions): Promise<Polyline> => {
      return await NavViewModule.addPolyline(nativeID, {
        ...options,
        points: options.points || [],
      });
    },
    addPolygon: async (options: PolygonOptions): Promise<Polygon> => {
      return await NavViewModule.addPolygon(nativeID, {
        ...options,
        holes: options.holes || [],
        points: options.points || [],
      });
    },
    addGroundOverlay: async (
      options: GroundOverlayOptions
    ): Promise<GroundOverlay> => {
      return await NavViewModule.addGroundOverlay(nativeID, options);
    },
    removeMarker: async (id: string) => {
      return await NavViewModule.removeMarker(nativeID, id);
    },
    removePolyline: async (id: string) => {
      return await NavViewModule.removePolyline(nativeID, id);
    },
    removePolygon: async (id: string) => {
      return await NavViewModule.removePolygon(nativeID, id);
    },
    removeCircle: async (id: string) => {
      return await NavViewModule.removeCircle(nativeID, id);
    },
    removeGroundOverlay: async (id: string) => {
      return await NavViewModule.removeGroundOverlay(nativeID, id);
    },
    setZoomLevel: async (level: number) => {
      return await NavViewModule.setZoomLevel(nativeID, level);
    },
    getCameraPosition: async (): Promise<CameraPosition> => {
      return await NavViewModule.getCameraPosition(nativeID);
    },
    getMyLocation: async (): Promise<Location> => {
      return await NavViewModule.getMyLocation(nativeID);
    },
    getUiSettings: async (): Promise<UISettings> => {
      return await NavViewModule.getUiSettings(nativeID);
    },
    isMyLocationEnabled: async (): Promise<boolean> => {
      return await NavViewModule.isMyLocationEnabled(nativeID);
    },
    moveCamera: async (cameraPosition: CameraPosition) => {
      return await NavViewModule.moveCamera(nativeID, cameraPosition);
    },
  };
};
