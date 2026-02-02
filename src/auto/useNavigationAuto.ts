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
import type { MapViewAutoController, CustomNavigationAutoEvent } from './types';
import {
  useEventSubscription,
  type Location,
  colorIntToRGBA,
  processColorValue,
} from '../shared';
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
  Padding,
  GroundOverlay,
  GroundOverlayOptions,
  GroundOverlayBoundsOptions,
  GroundOverlayPositionOptions,
  MapColorScheme,
} from '../maps';
import type { NavigationNightMode } from '../navigation';
import { useMemo, useCallback, useRef } from 'react';

const { NavAutoModule } = NativeModules;

/**
 * Individual listener setters type for auto events.
 */
export type NavigationAutoListenerSetters = {
  setOnAutoScreenAvailabilityChanged: (
    callback: ((available: boolean) => void) | null | undefined
  ) => void;
  setOnCustomNavigationAutoEvent: (
    callback: ((event: CustomNavigationAutoEvent) => void) | null | undefined
  ) => void;
};

/**
 * Hook result that provides auto controller and event setters.
 */
export interface UseNavigationAutoResult extends NavigationAutoListenerSetters {
  /** Controller for auto screen map operations */
  mapViewAutoController: MapViewAutoController;
  /** Removes all registered listeners */
  removeAllListeners: () => void;
}

/**
 * Hook to create and manage navigation auto (Android Auto/CarPlay) functionality.
 *
 * @returns Auto controller and event setter functions
 *
 * @example
 * ```tsx
 * const {
 *   mapViewAutoController,
 *   setOnAutoScreenAvailabilityChanged,
 *   setOnCustomNavigationAutoEvent,
 *   removeAllListeners,
 * } = useNavigationAuto();
 *
 * // Set up event listeners
 * useEffect(() => {
 *   setOnAutoScreenAvailabilityChanged((available) => {
 *     console.log('Auto screen available:', available);
 *   });
 *   setOnCustomNavigationAutoEvent((event) => {
 *     console.log('Custom event:', event.type, event.data);
 *   });
 *
 *   return () => removeAllListeners();
 * }, []);
 *
 * // Use auto controller
 * const available = await mapViewAutoController.isAutoScreenAvailable();
 * mapViewAutoController.setMapType(MapType.NORMAL);
 * ```
 */
export const useNavigationAuto = (): UseNavigationAutoResult => {
  // Store callbacks in refs
  const onAutoScreenAvailabilityChangedRef = useRef<
    ((available: boolean) => void) | null
  >(null);
  const onCustomNavigationAutoEventRef = useRef<
    ((event: CustomNavigationAutoEvent) => void) | null
  >(null);

  // Subscribe to events at the top level, routing to refs
  useEventSubscription<boolean>(
    'NavAutoModule',
    'onAutoScreenAvailabilityChanged',
    available => {
      onAutoScreenAvailabilityChangedRef.current?.(available);
    }
  );

  useEventSubscription<{ type: string; data?: string | null }>(
    'NavAutoModule',
    'onCustomNavigationAutoEvent',
    payload => {
      if (onCustomNavigationAutoEventRef.current) {
        const event: CustomNavigationAutoEvent = {
          type: payload.type,
          data: payload.data ? JSON.parse(payload.data) : undefined,
        };
        onCustomNavigationAutoEventRef.current(event);
      }
    }
  );

  // Create setter functions
  const setOnAutoScreenAvailabilityChanged = useCallback(
    (callback: ((available: boolean) => void) | null | undefined) => {
      onAutoScreenAvailabilityChangedRef.current = callback ?? null;
    },
    []
  );

  const setOnCustomNavigationAutoEvent = useCallback(
    (
      callback: ((event: CustomNavigationAutoEvent) => void) | null | undefined
    ) => {
      onCustomNavigationAutoEventRef.current = callback ?? null;
    },
    []
  );

  const removeAllListeners = useCallback(() => {
    onAutoScreenAvailabilityChangedRef.current = null;
    onCustomNavigationAutoEventRef.current = null;
  }, []);

  const mapViewAutoController = useMemo(
    () => ({
      cleanup: async () => {
        removeAllListeners();
      },

      isAutoScreenAvailable: async () => {
        return await NavAutoModule.isAutoScreenAvailable();
      },

      setFollowingPerspective: (perspective: number) => {
        NavAutoModule.setFollowingPerspective(perspective);
      },

      sendCustomMessage: (
        type: string,
        data?: Record<string, unknown>
      ): void => {
        const dataString = data ? JSON.stringify(data) : null;
        NavAutoModule.sendCustomMessage(type, dataString);
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
        const circle = await NavAutoModule.addCircle({
          ...circleOptions,
          strokeColor:
            processColorValue(circleOptions.strokeColor) ?? undefined,
          fillColor: processColorValue(circleOptions.fillColor) ?? undefined,
        });
        return {
          ...circle,
          fillColor: circle.fillColor
            ? colorIntToRGBA(circle.fillColor as unknown as number)
            : undefined,
          strokeColor: circle.strokeColor
            ? colorIntToRGBA(circle.strokeColor as unknown as number)
            : undefined,
        };
      },

      addMarker: async (markerOptions: MarkerOptions): Promise<Marker> => {
        return await NavAutoModule.addMarker(markerOptions);
      },

      addPolyline: async (
        polylineOptions: PolylineOptions
      ): Promise<Polyline> => {
        const polyline = await NavAutoModule.addPolyline({
          ...polylineOptions,
          points: polylineOptions.points || [],
          color: processColorValue(polylineOptions.color) ?? undefined,
        });
        return {
          ...polyline,
          color: polyline.color
            ? colorIntToRGBA(polyline.color as unknown as number)
            : undefined,
        };
      },

      addPolygon: async (polygonOptions: PolygonOptions): Promise<Polygon> => {
        const polygon = await NavAutoModule.addPolygon({
          ...polygonOptions,
          holes: polygonOptions.holes || [],
          points: polygonOptions.points || [],
          strokeColor:
            processColorValue(polygonOptions.strokeColor) ?? undefined,
          fillColor: processColorValue(polygonOptions.fillColor) ?? undefined,
        });
        return {
          ...polygon,
          fillColor: polygon.fillColor
            ? colorIntToRGBA(polygon.fillColor as unknown as number)
            : undefined,
          strokeColor: polygon.strokeColor
            ? colorIntToRGBA(polygon.strokeColor as unknown as number)
            : undefined,
        };
      },

      addGroundOverlay: async (
        groundOverlayOptions: GroundOverlayOptions
      ): Promise<GroundOverlay> => {
        // Determine if using bounds-based or position-based positioning
        const isBoundsBased = 'bounds' in groundOverlayOptions;

        if (isBoundsBased) {
          // Bounds-based positioning
          const boundsOptions =
            groundOverlayOptions as GroundOverlayBoundsOptions;
          return await NavAutoModule.addGroundOverlay({
            imgPath: boundsOptions.imgPath,
            bounds: {
              northEast: boundsOptions.bounds.northEast,
              southWest: boundsOptions.bounds.southWest,
            },
            bearing: boundsOptions.bearing,
            transparency: boundsOptions.transparency,
            anchor: boundsOptions.anchor,
            clickable: boundsOptions.clickable,
            visible: boundsOptions.visible,
            zIndex: boundsOptions.zIndex,
          });
        } else {
          // Position-based positioning
          const positionOptions =
            groundOverlayOptions as GroundOverlayPositionOptions;
          return await NavAutoModule.addGroundOverlay({
            imgPath: positionOptions.imgPath,
            location: positionOptions.location,
            width: positionOptions.width,
            height: positionOptions.height,
            zoomLevel: positionOptions.zoomLevel,
            bearing: positionOptions.bearing,
            transparency: positionOptions.transparency,
            anchor: positionOptions.anchor,
            clickable: positionOptions.clickable,
            visible: positionOptions.visible,
            zIndex: positionOptions.zIndex,
          });
        }
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

      setIndoorEnabled: (enabled: boolean) => {
        return NavAutoModule.setIndoorEnabled(enabled);
      },

      setTrafficEnabled: (enabled: boolean) => {
        return NavAutoModule.setTrafficEnabled(enabled);
      },

      setCompassEnabled: (enabled: boolean) => {
        return NavAutoModule.setCompassEnabled(enabled);
      },

      setMyLocationEnabled: (enabled: boolean) => {
        return NavAutoModule.setMyLocationEnabled(enabled);
      },

      setMyLocationButtonEnabled: (enabled: boolean) => {
        return NavAutoModule.setMyLocationButtonEnabled(enabled);
      },

      setMapColorScheme: (colorScheme: MapColorScheme) => {
        return NavAutoModule.setMapColorScheme(colorScheme);
      },

      setNightMode: (nightMode: NavigationNightMode) => {
        return NavAutoModule.setNightMode(nightMode);
      },

      setZoomLevel: async (level: number) => {
        return NavAutoModule.setZoomLevel(level);
      },

      setBuildingsEnabled: (enabled: boolean) => {
        return NavAutoModule.setBuildingsEnabled(enabled);
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

      getMarkers: async (): Promise<Marker[]> => {
        return await NavAutoModule.getMarkers();
      },

      getCircles: async (): Promise<Circle[]> => {
        const circles = await NavAutoModule.getCircles();
        return circles.map((circle: Circle) => ({
          ...circle,
          fillColor: circle.fillColor
            ? colorIntToRGBA(circle.fillColor as unknown as number)
            : undefined,
          strokeColor: circle.strokeColor
            ? colorIntToRGBA(circle.strokeColor as unknown as number)
            : undefined,
        }));
      },

      getPolylines: async (): Promise<Polyline[]> => {
        const polylines = await NavAutoModule.getPolylines();
        return polylines.map((polyline: Polyline) => ({
          ...polyline,
          color: polyline.color
            ? colorIntToRGBA(polyline.color as unknown as number)
            : undefined,
        }));
      },

      getPolygons: async (): Promise<Polygon[]> => {
        const polygons = await NavAutoModule.getPolygons();
        return polygons.map((polygon: Polygon) => ({
          ...polygon,
          fillColor: polygon.fillColor
            ? colorIntToRGBA(polygon.fillColor as unknown as number)
            : undefined,
          strokeColor: polygon.strokeColor
            ? colorIntToRGBA(polygon.strokeColor as unknown as number)
            : undefined,
        }));
      },

      getGroundOverlays: async (): Promise<GroundOverlay[]> => {
        return await NavAutoModule.getGroundOverlays();
      },
    }),
    [removeAllListeners]
  );

  return {
    mapViewAutoController,
    removeAllListeners,
    setOnAutoScreenAvailabilityChanged,
    setOnCustomNavigationAutoEvent,
  };
};
