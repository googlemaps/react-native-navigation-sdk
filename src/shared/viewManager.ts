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

import { Platform, UIManager, requireNativeComponent } from 'react-native';

export const viewManagerName =
  Platform.OS == 'android' ? 'NavViewManager' : 'RCTNavView';

export const sendCommand = (
  viewId: number,
  command: number | undefined,
  args?: any[]
) => {
  if (command == undefined) {
    throw new Error(
      'Command not found, please make sure you\'re using the referencing the right method'
    );
  }

  try {
    UIManager.dispatchViewManagerCommand(
      viewId,
      Platform.OS == 'android' ? command.toString() : command,
      args
    );
  } catch (exception) {
    console.error(exception);
  }
};

export const commands =
  UIManager.getViewManagerConfig(viewManagerName).Commands;

export const NavViewManager = requireNativeComponent(viewManagerName);
