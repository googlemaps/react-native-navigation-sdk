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

import type {
  MapViewController,
  NavigationCallbacks,
  NavigationController,
  NavigationInitErrorCode,
} from '@googlemaps/react-native-navigation-sdk';

interface TestTools {
  navigationController: NavigationController;
  mapViewController: MapViewController | null;
  addListeners: (listeners: Partial<NavigationCallbacks>) => void;
  removeListeners: (listeners: Partial<NavigationCallbacks>) => void;
  passTest: () => void;
  failTest: (message: string) => void;
  setDetoxStep: (stepNumber: number) => void;
  expectFalseError: (expectation: string) => void;
  expectTrueError: (expectation: string) => void;
}

export const testNavigationSessionInitialization = async (
  testTools: TestTools
) => {
  const {
    navigationController,
    addListeners,
    passTest,
    failTest,
    setDetoxStep,
    expectFalseError,
  } = testTools;

  const checkDefaults = async () => {
    if (!(await navigationController.areTermsAccepted())) {
      return expectFalseError('navigationController.areTermsAccepted()');
    }
    passTest();
  };

  addListeners({
    onNavigationReady: () => {
      checkDefaults();
    },
    onNavigationInitError: (errorCode: NavigationInitErrorCode) => {
      console.log(errorCode);
      failTest('onNavigatonInitError');
    },
  });
  try {
    await navigationController.init();
  } catch (error) {
    console.error('Error initializing navigator', error);
    failTest('navigationController.init() exception');
  }
  // Tell detox to prepare to execute step 1: (confirm t&c dialog)
  setDetoxStep(1);
};

const expectFalseMessage = (expectation: string) => {
  return `Expected ${expectation} to be false but it was true`;
};

export const testMapInitialization = async (testTools: TestTools) => {
  const { mapViewController, passTest, failTest, expectFalseError } = testTools;
  if (!mapViewController) {
    return failTest('mapViewController was expected to exist');
  }
  if ((await mapViewController.getUiSettings()).isCompassEnabled) {
    return expectFalseError(
      'mapViewController.getUiSettings()).isCompassEnabled'
    );
  }
  if ((await mapViewController.getUiSettings()).isMapToolbarEnabled) {
    return failTest(
      expectFalseMessage(
        'mapViewController.getUiSettings()).isMapToolbarEnabled'
      )
    );
  }
  if (!(await mapViewController.getUiSettings()).isIndoorLevelPickerEnabled) {
    return failTest(
      expectFalseMessage(
        'mapViewController.getUiSettings()).isIndoorLevelPickerEnabled'
      )
    );
  }
  if ((await mapViewController.getUiSettings()).isMapToolbarEnabled) {
    return expectFalseError(
      'mapViewController.getUiSettings()).isMapToolbarEnabled'
    );
  }
  if (!(await mapViewController.getUiSettings()).isRotateGesturesEnabled) {
    return expectFalseError(
      'mapViewController.getUiSettings()).isRotateGesturesEnabled'
    );
  }
  if (!(await mapViewController.getUiSettings()).isScrollGesturesEnabled) {
    return expectFalseError(
      'mapViewController.getUiSettings()).isScrollGesturesEnabled'
    );
  }
  if (
    !(await mapViewController.getUiSettings())
      .isScrollGesturesEnabledDuringRotateOrZoom
  ) {
    return expectFalseError(
      'mapViewController.getUiSettings()).isScrollGesturesEnabledDuringRotateOrZoom'
    );
  }
  if (!(await mapViewController.getUiSettings()).isTiltGesturesEnabled) {
    return expectFalseError(
      'mapViewController.getUiSettings()).isTiltGesturesEnabled'
    );
  }
  if ((await mapViewController.getUiSettings()).isZoomControlsEnabled) {
    return expectFalseError(
      'mapViewController.getUiSettings()).isZoomControlsEnabled'
    );
  }
  if (!(await mapViewController.getUiSettings()).isZoomGesturesEnabled) {
    return expectFalseError(
      'mapViewController.getUiSettings()).isZoomGesturesEnabled'
    );
  }

  passTest();
};

export const runTest3 = async () => {};
