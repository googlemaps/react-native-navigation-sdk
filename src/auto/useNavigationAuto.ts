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

import { type EventSubscription } from 'react-native';
import type {
  CustomNavigationAutoEvent,
  MapViewAutoController,
  NavigationAutoCallbackListenerSetters,
} from './types';
import { MapType, type Location } from '../shared';
import type {
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
  GroundOverlayOptions,
  GroundOverlay,
  Padding,
} from '../maps';
import { useRef } from 'react';
import { NavAutoModule } from '../native';

export const useNavigationAuto = (): {
  mapViewAutoController: MapViewAutoController;
} => {
  const subscriptions = useRef<Record<string, EventSubscription | null>>({});
  const createSetter =
    <T extends (...args: any[]) => void>(eventName: string) =>
    (callback: T | null) => {
      subscriptions.current[eventName]?.remove();
      subscriptions.current[eventName] = null;

      if (callback && (NavAutoModule as any)[eventName] != null) {
        // Fix me
        subscriptions.current[eventName] = (NavAutoModule as any)[eventName](
          callback
        );
      }
    };

  const eventListenerControllers: NavigationAutoCallbackListenerSetters = {
    setOnAutoScreenAvailabilityChangedListener: createSetter<
      (available: boolean) => void
    >('onAutoScreenAvailabilityChanged'),
    setOnCustomNavigationAutoEventListener: createSetter<
      (event: CustomNavigationAutoEvent) => void
    >('onAutoScreenAvailabilityChanged'),

    removeAllListeners: () => {
      Object.keys(subscriptions.current).forEach((key) => {
        subscriptions.current[key]?.remove();
        subscriptions.current[key] = null;
      });
    },
  };

  const mapViewAutoController = {
    ...eventListenerControllers,
    cleanup: async () => {
      eventListenerControllers.removeAllListeners();
    },

    isAutoScreenAvailable: async () => {
      return await NavAutoModule.isAutoScreenAvailable();
    },

    setMapType: (mapType: MapType) => {
      NavAutoModule.setMapType(mapType);
    },

    setMapStyle: (mapStyle: string) => {
      NavAutoModule.setMapStyle(mapStyle);
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

    addGroundOverlay: async (
      groundOverlayOptions: GroundOverlayOptions
    ): Promise<GroundOverlay> => {
      return await NavAutoModule.addGroundOverlay(groundOverlayOptions);
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

    removeGroundOverlay: (id: string) => {
      return NavAutoModule.removeGroundOverlay(id);
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

    setMyLocationEnabled: (isOn: boolean) => {
      return NavAutoModule.setMyLocationEnabled(isOn);
    },

    setZoomLevel: async (level: number) => {
      return NavAutoModule.setZoomLevel(level);
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

    setPadding: (padding: Padding) => {
      const { top = 0, left = 0, bottom = 0, right = 0 } = padding;
      return NavAutoModule.setMapPadding(top, left, bottom, right);
    },
  };

  return {
    mapViewAutoController,
  };
};
