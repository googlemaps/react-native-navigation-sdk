/**
 * Copyright 2026 Google LLC
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

import type { CameraPerspective, NavigationViewController } from './types';
import NavViewModule from '../../native/NativeNavViewModule';

/**
 * Creates a NavigationViewController for a specific view instance.
 *
 * @param nativeID - The string-based nativeID that identifies the view instance.
 * @returns A NavigationViewController with methods to control the navigation view.
 */
export const getNavigationViewController = (
  nativeID: string
): NavigationViewController => {
  return {
    showRouteOverview: async () => {
      try {
        await NavViewModule.showRouteOverview(nativeID);
      } catch (error) {
        console.error('Error calling showRouteOverview:', error);
      }
    },
    setNavigationUIEnabled: async (enabled: boolean) => {
      try {
        await NavViewModule.setNavigationUIEnabled(nativeID, enabled);
      } catch (error) {
        console.error('Error calling setNavigationUIEnabled:', error);
      }
    },
    setFollowingPerspective: async (perspective: CameraPerspective) => {
      try {
        await NavViewModule.setFollowingPerspective(nativeID, perspective);
      } catch (error) {
        console.error('Error calling setFollowingPerspective:', error);
      }
    },
  };
};
