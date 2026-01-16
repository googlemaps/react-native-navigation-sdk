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
import { commands, createControllerContext } from '../../shared/viewManager';
import type { CameraPerspective, NavigationViewController } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ViewRef = React.RefObject<any>;

export const getNavigationViewController = (
  viewRef: ViewRef
): NavigationViewController => {
  const { sendCommand } = createControllerContext(
    viewRef,
    'NavigationViewController'
  );

  return {
    setNavigationUIEnabled: (isOn: boolean) => {
      sendCommand('setNavigationUIEnabled', commands.setNavigationUIEnabled, [
        isOn,
      ]);
    },

    setTripProgressBarEnabled: (isOn: boolean) => {
      sendCommand(
        'setTripProgressBarEnabled',
        commands.setTripProgressBarEnabled,
        [isOn]
      );
    },

    setReportIncidentButtonEnabled: (isOn: boolean) => {
      sendCommand(
        'setReportIncidentButtonEnabled',
        commands.setReportIncidentButtonEnabled,
        [isOn]
      );
    },

    setSpeedometerEnabled: (isOn: boolean) => {
      sendCommand('setSpeedometerEnabled', commands.setSpeedometerEnabled, [
        isOn,
      ]);
    },

    setSpeedLimitIconEnabled: (isOn: boolean) => {
      sendCommand(
        'setSpeedLimitIconEnabled',
        commands.setSpeedLimitIconEnabled,
        [isOn]
      );
    },

    setTrafficIncidentCardsEnabled: (isOn: boolean) => {
      sendCommand(
        'setTrafficIncidentCardsEnabled',
        commands.setTrafficIncidentCardsEnabled,
        [isOn]
      );
    },

    setHeaderEnabled: (isOn: boolean) => {
      sendCommand('setHeaderEnabled', commands.setHeaderEnabled, [isOn]);
    },

    setFooterEnabled: (isOn: boolean) => {
      sendCommand('setFooterEnabled', commands.setFooterEnabled, [isOn]);
    },

    showRouteOverview: () => {
      sendCommand('showRouteOverview', commands.showRouteOverview, []);
    },

    /**
     * @deprecated Prefer the `navigationNightMode` prop on `NavigationView`.
     */
    setNightMode: (index: number) => {
      sendCommand('setNightMode', commands.setNightMode, [index]);
    },

    setRecenterButtonEnabled(isEnabled: boolean) {
      sendCommand(
        'setRecenterButtonEnabled',
        commands.setRecenterButtonEnabled,
        [isEnabled]
      );
    },

    setFollowingPerspective: (perspective: CameraPerspective) => {
      sendCommand('setFollowingPerspective', commands.setFollowingPerspective, [
        perspective,
      ]);
    },
  };
};
