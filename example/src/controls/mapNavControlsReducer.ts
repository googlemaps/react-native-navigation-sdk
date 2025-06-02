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

import {
  MapType,
  CameraPerspective,
  NightModeOptions,
  type Padding,
} from '@googlemaps/react-native-navigation-sdk';

export interface MapNavControlsState {
  mapType: MapType;
  navigationUIEnabled: boolean;
  tripProgressBarEnabled: boolean;
  speedLimitIconEnabled: boolean;
  speedometerEnabled: boolean;
  trafficIncidentsCardEnabled: boolean;
  reportIncidentButtonEnabled: boolean;
  recenterButtonEnabled: boolean;
  headerEnabled: boolean;
  footerEnabled: boolean;
  followingPerspective?: CameraPerspective;
  nightMode: NightModeOptions;
  padding: Padding | null;
  myLocationEnabled: boolean;
  mapId?: string | null;
  mapToolbarEnabled: boolean;
  indoorEnabled: boolean;
  trafficEnabled: boolean;
  compassEnabled: boolean;
  myLocationButtonEnabled: boolean;
  buildingsEnabled: boolean;
  rotateGesturesEnabled: boolean;
  scrollGesturesEnabled: boolean;
  scrollGesturesEnabledDuringRotateOrZoom: boolean;
  tiltGesturesEnabled: boolean;
  zoomControlsEnabled: boolean;
  zoomGesturesEnabled: boolean;
}

export type MapNavControlsAction =
  | { type: 'setMapType'; value: MapType }
  | { type: 'setNavigationUIEnabled'; value: boolean }
  | { type: 'setTripProgressBarEnabled'; value: boolean }
  | { type: 'setSpeedLimitIconEnabled'; value: boolean }
  | { type: 'setSpeedometerEnabled'; value: boolean }
  | { type: 'setTrafficIncidentsCardEnabled'; value: boolean }
  | { type: 'setReportIncidentButtonEnabled'; value: boolean }
  | { type: 'setRecenterButtonEnabled'; value: boolean }
  | { type: 'setHeaderEnabled'; value: boolean }
  | { type: 'setFooterEnabled'; value: boolean }
  | { type: 'setFollowingPerspective'; value: CameraPerspective | undefined }
  | { type: 'setNightMode'; value: NightModeOptions }
  | { type: 'setPadding'; value: Padding | null }
  | { type: 'setMyLocationEnabled'; value: boolean }
  | { type: 'setMapId'; value: string | null }
  | { type: 'setMapToolbarEnabled'; value: boolean }
  | { type: 'setIndoorEnabled'; value: boolean }
  | { type: 'setTrafficEnabled'; value: boolean }
  | { type: 'setCompassEnabled'; value: boolean }
  | { type: 'setMyLocationButtonEnabled'; value: boolean }
  | { type: 'setBuildingsEnabled'; value: boolean }
  | { type: 'setRotateGesturesEnabled'; value: boolean }
  | { type: 'setScrollGesturesEnabled'; value: boolean }
  | { type: 'setScrollGesturesEnabledDuringRotateOrZoom'; value: boolean }
  | { type: 'setTiltGesturesEnabled'; value: boolean }
  | { type: 'setZoomControlsEnabled'; value: boolean }
  | { type: 'setZoomGesturesEnabled'; value: boolean }
  | { type: 'reset'; value?: Partial<MapNavControlsState> };

export const initialMapNavControlsState: MapNavControlsState = {
  mapType: MapType.NORMAL,
  navigationUIEnabled: true,
  tripProgressBarEnabled: false,
  speedLimitIconEnabled: true,
  speedometerEnabled: true,
  trafficIncidentsCardEnabled: true,
  reportIncidentButtonEnabled: true,
  recenterButtonEnabled: true,
  headerEnabled: true,
  footerEnabled: true,
  followingPerspective: undefined,
  nightMode: NightModeOptions.AUTO,
  padding: null,
  myLocationEnabled: true,
  mapId: null,
  mapToolbarEnabled: true,
  indoorEnabled: true,
  trafficEnabled: true,
  compassEnabled: true,
  myLocationButtonEnabled: true,
  buildingsEnabled: true,
  rotateGesturesEnabled: true,
  scrollGesturesEnabled: true,
  scrollGesturesEnabledDuringRotateOrZoom: true,
  tiltGesturesEnabled: true,
  zoomControlsEnabled: true,
  zoomGesturesEnabled: true,
};

export function mapNavControlsReducer(
  state: MapNavControlsState,
  action: MapNavControlsAction
): MapNavControlsState {
  switch (action.type) {
    case 'setMapType':
      return { ...state, mapType: action.value };
    case 'setNavigationUIEnabled':
      return { ...state, navigationUIEnabled: action.value };
    case 'setTripProgressBarEnabled':
      return { ...state, tripProgressBarEnabled: action.value };
    case 'setSpeedLimitIconEnabled':
      return { ...state, speedLimitIconEnabled: action.value };
    case 'setSpeedometerEnabled':
      return { ...state, speedometerEnabled: action.value };
    case 'setTrafficIncidentsCardEnabled':
      return { ...state, trafficIncidentsCardEnabled: action.value };
    case 'setReportIncidentButtonEnabled':
      return { ...state, reportIncidentButtonEnabled: action.value };
    case 'setRecenterButtonEnabled':
      return { ...state, recenterButtonEnabled: action.value };
    case 'setHeaderEnabled':
      return { ...state, headerEnabled: action.value };
    case 'setFooterEnabled':
      return { ...state, footerEnabled: action.value };
    case 'setFollowingPerspective':
      return { ...state, followingPerspective: action.value };
    case 'setNightMode':
      return { ...state, nightMode: action.value };
    case 'setPadding':
      return { ...state, padding: action.value };
    case 'setMyLocationEnabled':
      return { ...state, myLocationEnabled: action.value };
    case 'setMapId':
      return { ...state, mapId: action.value };
    case 'setMapToolbarEnabled':
      return { ...state, mapToolbarEnabled: action.value };
    case 'setIndoorEnabled':
      return { ...state, indoorEnabled: action.value };
    case 'setTrafficEnabled':
      return { ...state, trafficEnabled: action.value };
    case 'setCompassEnabled':
      return { ...state, compassEnabled: action.value };
    case 'setMyLocationButtonEnabled':
      return { ...state, myLocationButtonEnabled: action.value };
    case 'setBuildingsEnabled':
      return { ...state, buildingsEnabled: action.value };
    case 'setRotateGesturesEnabled':
      return { ...state, rotateGesturesEnabled: action.value };
    case 'setScrollGesturesEnabled':
      return { ...state, scrollGesturesEnabled: action.value };
    case 'setScrollGesturesEnabledDuringRotateOrZoom':
      return {
        ...state,
        scrollGesturesEnabledDuringRotateOrZoom: action.value,
      };
    case 'setTiltGesturesEnabled':
      return { ...state, tiltGesturesEnabled: action.value };
    case 'setZoomControlsEnabled':
      return { ...state, zoomControlsEnabled: action.value };
    case 'setZoomGesturesEnabled':
      return { ...state, zoomGesturesEnabled: action.value };
    case 'reset':
      return { ...initialMapNavControlsState, ...action.value };
    default:
      return state;
  }
}
