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

import { NativeModules } from 'react-native';
import type { MapViewAutoController, NavigationAutoCallbacks } from './types';
import { useModuleListeners, type Location } from '../shared';
import type {
  MapType,
  CircleOptions,
  Circle,
  MarkerOptions,
  Marker,
  PolylineOptions,
  Polyline,
  PolygonOptions,
  Polygon,
  CameraPosition,
  UISettings,
} from '../maps';
import { useMemo } from 'react';

const { NavAutoEventDispatcher, NavAutoModule } = NativeModules;

const androidBridge: string = 'NavAutoJavascriptBridge';

export const useNavigationAuto = (): {
  mapViewAutoController: MapViewAutoController;
  addListeners: (listeners: Partial<NavigationAutoCallbacks>) => void;
  removeListeners: (listeners: Partial<NavigationAutoCallbacks>) => void;
  removeAllListeners: () => void;
} => {
  const moduleListenersHandler = useModuleListeners<NavigationAutoCallbacks>(
    NavAutoEventDispatcher,
    androidBridge,
    ['onCustomNavigationAutoEvent']
  );

  const mapViewAutoController = useMemo(
    () => ({
      cleanup: async () => {
        moduleListenersHandler.removeAllListeners();
      },

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

      removeMarker: (id: string) => {
        return NavAutoModule.removeMarker(id);
      },

      removePolyline: (id: string) => {
        return NavAutoModule.removePolyline(id);
      },

      removePolygon: (id: string) => {
        return NavAutoModule.removePolygon(id);
      },

      removeCircle: (id: string) => {
        return NavAutoModule.removeCircle(id);
      },

      setIndoorEnabled: (isOn: boolean) => {
        return NavAutoModule.setIndoorEnabled(isOn);
      },

      setTrafficEnabled: (isOn: boolean) => {
        return NavAutoModule.setTrafficEnabled(isOn);
      },

      setCompassEnabled: (isOn: boolean) => {
        return NavAutoModule.setCompassEnabled(isOn);
      },

      setMyLocationButtonEnabled: (isOn: boolean) => {
        return NavAutoModule.setMyLocationButtonEnabled(isOn);
      },

      setMyLocationEnabled: (isOn: boolean) => {
        return NavAutoModule.setMyLocationEnabled(isOn);
      },

      setRotateGesturesEnabled: (isOn: boolean) => {
        return NavAutoModule.setRotateGesturesEnabled(isOn);
      },

      setScrollGesturesEnabled: (isOn: boolean) => {
        return NavAutoModule.setScrollGesturesEnabled(isOn);
      },

      setScrollGesturesEnabledDuringRotateOrZoom: (isOn: boolean) => {
        return NavAutoModule.setScrollGesturesEnabledDuringRotateOrZoom(isOn);
      },

      // Android only.
      setZoomControlsEnabled: (isOn: boolean) => {
        return NavAutoModule.setZoomControlsEnabled(isOn);
      },

      setZoomLevel: async (level: number) => {
        return NavAutoModule.setZoomLevel(level);
      },

      setTiltGesturesEnabled: (isOn: boolean) => {
        return NavAutoModule.setTiltGesturesEnabled(isOn);
      },

      setZoomGesturesEnabled: (isOn: boolean) => {
        return NavAutoModule.setZoomGesturesEnabled(isOn);
      },

      setBuildingsEnabled: (isOn: boolean) => {
        return NavAutoModule.setBuildingsEnabled(isOn);
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

      moveCamera: (cameraPosition: CameraPosition) => {
        return NavAutoModule.moveCamera(cameraPosition);
      },
    }),
    [moduleListenersHandler]
  );

  return {
    mapViewAutoController,
    ...moduleListenersHandler,
  };
};
