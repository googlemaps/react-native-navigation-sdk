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

import NavViewModule from '../../native/NativeNavViewModule';
import { processColorValue, colorIntToRGBA } from '../../shared';
import type { Location } from '../../shared/types';
import type {
  CameraPosition,
  Circle,
  GroundOverlay,
  Marker,
  Polygon,
  Polyline,
  UISettings,
} from '../types';
import type {
  CircleOptions,
  GroundOverlayBoundsOptions,
  GroundOverlayOptions,
  GroundOverlayPositionOptions,
  MapViewController,
  MarkerOptions,
  PolygonOptions,
  PolylineOptions,
} from './types';

/**
 * Creates a MapViewController for a specific view instance.
 *
 * @param nativeID - The string-based nativeID that identifies the view instance.
 *                   This is used by the TurboModule to look up the view in the native registry.
 * @returns A MapViewController with methods to control the map view.
 */
export const getMapViewController = (nativeID: string): MapViewController => {
  return {
    clearMapView: async () => {
      return await NavViewModule.clearMapView(nativeID);
    },

    addCircle: async (circleOptions: CircleOptions): Promise<Circle> => {
      const circle = await NavViewModule.addCircle(nativeID, {
        ...circleOptions,
        strokeColor: processColorValue(circleOptions.strokeColor) ?? undefined,
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
      return await NavViewModule.addMarker(nativeID, markerOptions);
    },

    addPolyline: async (
      polylineOptions: PolylineOptions
    ): Promise<Polyline> => {
      const polyline = await NavViewModule.addPolyline(nativeID, {
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
      const polygon = await NavViewModule.addPolygon(nativeID, {
        ...polygonOptions,
        holes: polygonOptions.holes || [],
        points: polygonOptions.points || [],
        strokeColor: processColorValue(polygonOptions.strokeColor) ?? undefined,
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
        return await NavViewModule.addGroundOverlay(nativeID, {
          id: boundsOptions.id,
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
        return await NavViewModule.addGroundOverlay(nativeID, {
          id: positionOptions.id,
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

    setPadding: async _padding => {
      console.warn('setPadding should be set via props in new architecture');
    },

    getMarkers: async (): Promise<Marker[]> => {
      return await NavViewModule.getMarkers(nativeID);
    },

    getCircles: async (): Promise<Circle[]> => {
      const circles = await NavViewModule.getCircles(nativeID);
      return circles.map(circle => ({
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
      const polylines = await NavViewModule.getPolylines(nativeID);
      return polylines.map(polyline => ({
        ...polyline,
        color: polyline.color
          ? colorIntToRGBA(polyline.color as unknown as number)
          : undefined,
      }));
    },

    getPolygons: async (): Promise<Polygon[]> => {
      const polygons = await NavViewModule.getPolygons(nativeID);
      return polygons.map(polygon => ({
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
      return await NavViewModule.getGroundOverlays(nativeID);
    },
  };
};
