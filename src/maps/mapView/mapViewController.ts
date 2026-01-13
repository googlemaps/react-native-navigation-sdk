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

import { findNodeHandle, NativeModules } from 'react-native';
import type { Location } from '../../shared/types';
import { commands, createControllerContext } from '../../shared/viewManager';
import type {
  CameraPosition,
  Circle,
  Marker,
  Polygon,
  Polyline,
  UISettings,
} from '../types';
import type {
  CircleOptions,
  MapType,
  MapViewController,
  MarkerOptions,
  Padding,
  PolygonOptions,
  PolylineOptions,
} from './types';
const { NavViewModule } = NativeModules;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ViewRef = React.RefObject<any>;

export const getMapViewController = (viewRef: ViewRef): MapViewController => {
  const { sendCommand } = createControllerContext(viewRef, 'MapViewController');

  // Helper to get viewId, throws if view no longer exists
  const getViewId = (methodName: string): number => {
    const viewId = findNodeHandle(viewRef.current) ?? null;
    if (viewId == null) {
      throw new Error(
        `MapViewController.${methodName}() failed - view no longer exists`
      );
    }
    return viewId;
  };

  const controller: MapViewController = {
    setMapType: (mapType: MapType) => {
      sendCommand('setMapType', commands.setMapType, [mapType]);
    },
    setMapStyle: (mapStyle: string) => {
      sendCommand('setMapStyle', commands.setMapStyle, [mapStyle]);
    },
    setMapToolbarEnabled: (index: boolean) => {
      sendCommand('setMapToolbarEnabled', commands.setMapToolbarEnabled, [
        index,
      ]);
    },
    clearMapView: () => {
      sendCommand('clearMapView', commands.clearMapView, []);
    },

    addCircle: async (circleOptions: CircleOptions): Promise<Circle> => {
      const viewId = getViewId('addCircle');
      return await NavViewModule.addCircle(viewId, circleOptions);
    },

    addMarker: async (markerOptions: MarkerOptions): Promise<Marker> => {
      const viewId = getViewId('addMarker');
      return await NavViewModule.addMarker(viewId, markerOptions);
    },

    addPolyline: async (
      polylineOptions: PolylineOptions
    ): Promise<Polyline> => {
      const viewId = getViewId('addPolyline');
      return await NavViewModule.addPolyline(viewId, {
        ...polylineOptions,
        points: polylineOptions.points || [],
      });
    },

    addPolygon: async (polygonOptions: PolygonOptions): Promise<Polygon> => {
      const viewId = getViewId('addPolygon');
      return await NavViewModule.addPolygon(viewId, {
        ...polygonOptions,
        holes: polygonOptions.holes || [],
        points: polygonOptions.points || [],
      });
    },

    removeMarker: (id: string) => {
      sendCommand('removeMarker', commands.removeMarker, [id]);
    },

    removePolyline: (id: string) => {
      sendCommand('removePolyline', commands.removePolyline, [id]);
    },

    removePolygon: (id: string) => {
      sendCommand('removePolygon', commands.removePolygon, [id]);
    },

    removeCircle: (id: string) => {
      sendCommand('removeCircle', commands.removeCircle, [id]);
    },

    setIndoorEnabled: (isOn: boolean) => {
      sendCommand('setIndoorEnabled', commands.setIndoorEnabled, [isOn]);
    },

    setTrafficEnabled: (isOn: boolean) => {
      sendCommand('setTrafficEnabled', commands.setTrafficEnabled, [isOn]);
    },

    setCompassEnabled: (isOn: boolean) => {
      sendCommand('setCompassEnabled', commands.setCompassEnabled, [isOn]);
    },

    setMyLocationButtonEnabled: (isOn: boolean) => {
      sendCommand(
        'setMyLocationButtonEnabled',
        commands.setMyLocationButtonEnabled,
        [isOn]
      );
    },

    setMyLocationEnabled: (isOn: boolean) => {
      sendCommand('setMyLocationEnabled', commands.setMyLocationEnabled, [
        isOn,
      ]);
    },

    setRotateGesturesEnabled: (isOn: boolean) => {
      sendCommand(
        'setRotateGesturesEnabled',
        commands.setRotateGesturesEnabled,
        [isOn]
      );
    },

    setScrollGesturesEnabled: (isOn: boolean) => {
      sendCommand(
        'setScrollGesturesEnabled',
        commands.setScrollGesturesEnabled,
        [isOn]
      );
    },

    setScrollGesturesEnabledDuringRotateOrZoom: (isOn: boolean) => {
      sendCommand(
        'setScrollGesturesEnabledDuringRotateOrZoom',
        commands.setScrollGesturesEnabledDuringRotateOrZoom,
        [isOn]
      );
    },

    setZoomControlsEnabled: (isOn: boolean) => {
      sendCommand('setZoomControlsEnabled', commands.setZoomControlsEnabled, [
        isOn,
      ]);
    },

    setZoomLevel: (level: number) => {
      sendCommand('setZoomLevel', commands.setZoomLevel, [level]);
    },

    setTiltGesturesEnabled: (isOn: boolean) => {
      sendCommand('setTiltGesturesEnabled', commands.setTiltGesturesEnabled, [
        isOn,
      ]);
    },

    setZoomGesturesEnabled: (isOn: boolean) => {
      sendCommand('setZoomGesturesEnabled', commands.setZoomGesturesEnabled, [
        isOn,
      ]);
    },

    setBuildingsEnabled: (isOn: boolean) => {
      sendCommand('setBuildingsEnabled', commands.setBuildingsEnabled, [isOn]);
    },

    getCameraPosition: async (): Promise<CameraPosition> => {
      const viewId = getViewId('getCameraPosition');
      return await NavViewModule.getCameraPosition(viewId);
    },

    getMyLocation: async (): Promise<Location> => {
      const viewId = getViewId('getMyLocation');
      return await NavViewModule.getMyLocation(viewId);
    },

    getUiSettings: async (): Promise<UISettings> => {
      const viewId = getViewId('getUiSettings');
      return await NavViewModule.getUiSettings(viewId);
    },

    isMyLocationEnabled: async (): Promise<boolean> => {
      const viewId = getViewId('isMyLocationEnabled');
      return await NavViewModule.isMyLocationEnabled(viewId);
    },

    moveCamera: (cameraPosition: CameraPosition) => {
      sendCommand('moveCamera', commands.moveCamera, [cameraPosition]);
    },

    setPadding: (padding: Padding) => {
      const { top = 0, left = 0, bottom = 0, right = 0 } = padding;
      sendCommand('setPadding', commands.setPadding, [
        top,
        left,
        bottom,
        right,
      ]);
    },
  };

  return controller;
};
