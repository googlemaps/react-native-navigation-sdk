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

import { NativeModules } from 'react-native';
import type {
  CameraPosition,
  Circle,
  CircleOptions,
  MapType,
  MapViewController,
  Marker,
  MarkerOptions,
  Polygon,
  PolygonOptions,
  Polyline,
  PolylineOptions,
  UISettings,
} from '../maps';
import type { Location } from '../shared';
const { NavAutoModule } = NativeModules;

export const getMapViewAutoController = (): MapViewController => {
  return {
    setMapType: (mapType: MapType) => {
      NavAutoModule.setMapType(mapType);
    },

    setMapStyle: (mapStyle: string) => {
      NavAutoModule.setMapStyle(mapStyle);
    },

    // Android only.
    setMapToolbarEnabled: (enabled: boolean) => {
      NavAutoModule.setMapToolbarEnabled(enabled);
    },

    clearMapView: () => {
      NavAutoModule.clearMapView();
    },

    addCircle: async (circleOptions: CircleOptions): Promise<Circle> => {
      return await NavAutoModule.addCircle(circleOptions);
    },

    addMarker: async (markerOptions: MarkerOptions): Promise<Marker> => {
      return await NavAutoModule.addMarker(markerOptions);
    },

    addPolyline: async (
      polylineOptions: PolylineOptions
    ): Promise<Polyline> => {
      return await NavAutoModule.addPolyline({
        ...polylineOptions,
        points: polylineOptions.points || [],
      });
    },

    addPolygon: async (polygonOptions: PolygonOptions): Promise<Polygon> => {
      return await NavAutoModule.addPolygon({
        ...polygonOptions,
        holes: polygonOptions.holes || [],
        points: polygonOptions.points || [],
      });
    },

    removeMarker: (_id: string) => {
      return NavAutoModule.removeMarker(_id);
    },

    removePolyline: (_id: string) => {
      return NavAutoModule.removePolyline(_id);
    },

    removePolygon: (_id: string) => {
      return NavAutoModule.removePolygon(_id);
    },

    removeCircle: (_id: string) => {
      return NavAutoModule.removeCircle(_id);
    },

    setIndoorEnabled: (_isOn: boolean) => {
      return NavAutoModule.setIndoorEnabled(_isOn);
    },

    setTrafficEnabled: (_isOn: boolean) => {
      return NavAutoModule.setTrafficEnabled(_isOn);
    },

    setCompassEnabled: (_isOn: boolean) => {
      return NavAutoModule.setCompassEnabled(_isOn);
    },

    setMyLocationButtonEnabled: (_isOn: boolean) => {
      return NavAutoModule.setMyLocationButtonEnabled(_isOn);
    },

    setMyLocationEnabled: (_isOn: boolean) => {
      return NavAutoModule.setMyLocationEnabled(_isOn);
    },

    setRotateGesturesEnabled: (_isOn: boolean) => {
      return NavAutoModule.setRotateGesturesEnabled(_isOn);
    },

    setScrollGesturesEnabled: (_isOn: boolean) => {
      return NavAutoModule.setScrollGesturesEnabled(_isOn);
    },

    setScrollGesturesEnabledDuringRotateOrZoom: (_isOn: boolean) => {
      return NavAutoModule.setScrollGesturesEnabledDuringRotateOrZoom(_isOn);
    },

    // Android only.
    setZoomControlsEnabled: (_isOn: boolean) => {
      return NavAutoModule.setZoomControlsEnabled(_isOn);
    },

    setZoomLevel: async (level: number) => {
      return NavAutoModule.setZoomLevel(level);
    },

    setTiltGesturesEnabled: (_isOn: boolean) => {
      return NavAutoModule.setTiltGesturesEnabled(_isOn);
    },

    setZoomGesturesEnabled: (_isOn: boolean) => {
      return NavAutoModule.setZoomGesturesEnabled(_isOn);
    },

    setBuildingsEnabled: (_isOn: boolean) => {
      return NavAutoModule.setBuildingsEnabled(_isOn);
    },

    getCameraPosition: async (): Promise<CameraPosition> => {
      return await NavAutoModule.getCameraPosition();
    },

    getMyLocation: async (): Promise<Location> => {
      return await NavAutoModule.getMyLocation();
    },

    getUiSettings: async (): Promise<UISettings> => {
      return await NavAutoModule.getUiSettings();
    },

    isMyLocationEnabled: async (): Promise<boolean> => {
      return await NavAutoModule.isMyLocationEnabled();
    },

    moveCamera: (_cameraPosition: CameraPosition) => {
      return NavAutoModule.moveCamera(_cameraPosition);
    },
  };
};
