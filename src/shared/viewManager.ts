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

import {
  Platform,
  UIManager,
  requireNativeComponent,
  type HostComponent,
  type ViewProps,
} from 'react-native';
import type { LatLng } from '.';
import type { Circle, GroundOverlay, Marker, Polygon, Polyline } from '../maps';
import type {
  DirectEventHandler,
  Int32,
} from 'react-native/Libraries/Types/CodegenTypesNamespace';
import type { AndroidStylingOptions, iOSStylingOptions } from '../navigation';

// NavViewManager is responsible for managing both the regular map fragment as well as the navigation map view fragment.
export const viewManagerName =
  Platform.OS === 'android' ? 'NavViewManager' : 'RCTNavView';

export const sendCommand = (
  viewId: number,
  command: number | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args?: any[]
): void => {
  if (command === undefined) {
    throw new Error(
      "Command not found, please make sure you're using the referencing the right method"
    );
  }

  try {
    UIManager.dispatchViewManagerCommand(
      viewId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Platform.OS === 'android' ? (command.toString() as any) : command,
      args
    );
  } catch (exception) {
    console.error(exception);
  }
};

interface ViewManagerConfig {
  Commands: { [key: string]: number };
}

export const commands = (
  UIManager.getViewManagerConfig(viewManagerName) as ViewManagerConfig
).Commands;

export interface NativeNavViewProps extends ViewProps {
  flex?: number | undefined;
  mapInitializationOptions: {
    fragmentType: Int32;
    mapId?: string;
    navigationStylingOptions?: AndroidStylingOptions | iOSStylingOptions;
  };
  onMapReady?: DirectEventHandler<null>;
  onMapClick?: DirectEventHandler<LatLng>;
  onMarkerClick?: DirectEventHandler<Marker>;
  onPolylineClick?: DirectEventHandler<Polyline>;
  onPolygonClick?: DirectEventHandler<Polygon>;
  onCircleClick?: DirectEventHandler<Circle>;
  onGroundOverlayClick?: DirectEventHandler<GroundOverlay>;
  onMarkerInfoWindowTapped?: DirectEventHandler<Marker>;
  onRecenterButtonClick?: DirectEventHandler<null>;
  onPromptVisibilityChanged?: DirectEventHandler<{ visible: boolean }>;
}

type NativeNavViewManagerComponentType = HostComponent<NativeNavViewProps>;
export const NavViewManager = requireNativeComponent<NativeNavViewProps>(
  viewManagerName
) as NativeNavViewManagerComponentType;
