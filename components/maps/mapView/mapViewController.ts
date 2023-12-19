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

import {NativeModules} from 'react-native';
import {Location} from '../../shared/types';
import {commands, sendCommand} from '../../shared/viewManager';
import {
  CameraPosition,
  Circle,
  Marker,
  Polygon,
  Polyline,
  UISettings,
} from '../types';
import {
  CircleOptions,
  MapType,
  MapViewController,
  MarkerOptions,
  PolygonOptions,
  PolylineOptions,
} from './types';
const {NavViewModule} = NativeModules;

export const getMapViewController = (viewId: number): MapViewController => {
  return {
    setMapType: (mapType: MapType) => {
      sendCommand(viewId, commands.setMapType, [mapType]);
    },
    setMapStyle: (mapStyle: string) => {
      sendCommand(viewId, commands.setMapStyle, [mapStyle]);
    },
    setMapToolbarEnabled: (index: boolean) => {
      sendCommand(viewId, commands.setMapToolbarEnabled, [index]);
    },
    clearMapView: () => {
      sendCommand(viewId, commands.clearMapView, []);
    },

    addCircle: async (circleOptions: CircleOptions): Promise<Circle> => {
      return await NavViewModule.addCircle(circleOptions);
    },

    addMarker: async (markerOptions: MarkerOptions): Promise<Marker> => {
      return await NavViewModule.addMarker(markerOptions);
    },

    addPolyline: async (
      polylineOptions: PolylineOptions,
    ): Promise<Polyline> => {
      return await NavViewModule.addPolyline({
        ...polylineOptions,
        points: polylineOptions.points || [],
      });
    },

    addPolygon: async (polygonOptions: PolygonOptions): Promise<Polygon> => {
      return await NavViewModule.addPolygon({
        ...polygonOptions,
        holes: polygonOptions.holes || [],
        points: polygonOptions.points || [],
      });
    },

    removeMarker: (id: string) => {
      sendCommand(viewId, commands.removeMarker, [id]);
    },

    removePolyline: (id: string) => {
      sendCommand(viewId, commands.removePolyline, [id]);
    },

    removePolygon: (id: string) => {
      sendCommand(viewId, commands.removePolygon, [id]);
    },

    removeCircle: (id: string) => {
      sendCommand(viewId, commands.removeCircle, [id]);
    },

    setIndoorEnabled: (isOn: boolean) => {
      sendCommand(viewId, commands.setIndoorEnabled, [isOn]);
    },

    setTrafficEnabled: (isOn: boolean) => {
      sendCommand(viewId, commands.setTrafficEnabled, [isOn]);
    },

    setCompassEnabled: (isOn: boolean) => {
      sendCommand(viewId, commands.setCompassEnabled, [isOn]);
    },

    setMyLocationButtonEnabled: (isOn: boolean) => {
      sendCommand(viewId, commands.setMyLocationButtonEnabled, [isOn]);
    },

    setMyLocationEnabled: (isOn: boolean) => {
      sendCommand(viewId, commands.setMyLocationEnabled, [isOn]);
    },

    setRotateGesturesEnabled: (isOn: boolean) => {
      sendCommand(viewId, commands.setRotateGesturesEnabled, [isOn]);
    },

    setScrollGesturesEnabled: (isOn: boolean) => {
      sendCommand(viewId, commands.setScrollGesturesEnabled, [isOn]);
    },

    setScrollGesturesEnabledDuringRotateOrZoom: (isOn: boolean) => {
      sendCommand(viewId, commands.setScrollGesturesEnabledDuringRotateOrZoom, [
        isOn,
      ]);
    },

    setZoomControlsEnabled: (isOn: boolean) => {
      sendCommand(viewId, commands.setZoomControlsEnabled, [isOn]);
    },

    setZoomLevel: (level: number) => {
      sendCommand(viewId, commands.setZoomLevel, [level]);
    },

    setTiltGesturesEnabled: (isOn: boolean) => {
      sendCommand(viewId, commands.setTiltGesturesEnabled, [isOn]);
    },

    setZoomGesturesEnabled: (isOn: boolean) => {
      sendCommand(viewId, commands.setZoomGesturesEnabled, [isOn]);
    },

    setBuildingsEnabled: (isOn: boolean) => {
      sendCommand(viewId, commands.setBuildingsEnabled, [isOn]);
    },

    getCameraPosition: async (): Promise<CameraPosition> => {
      return await NavViewModule.getCameraPosition();
    },

    getMyLocation: async (): Promise<Location> => {
      return await NavViewModule.getMyLocation();
    },

    getUiSettings: async (): Promise<UISettings> => {
      return await NavViewModule.getUiSettings();
    },

    isMyLocationEnabled: async (): Promise<boolean> => {
      return await NavViewModule.isMyLocationEnabled();
    },

    moveCamera: (cameraPosition: CameraPosition) => {
      sendCommand(viewId, commands.moveCamera, [cameraPosition]);
    },
  };
};
