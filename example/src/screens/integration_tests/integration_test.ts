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

import {
  AudioGuidance,
  TravelMode,
  type MapViewController,
  type NavigationCallbacks,
  type NavigationController,
  type NavigationInitErrorCode,
  type NavigationViewController,
  type TimeAndDistance,
} from '@googlemaps/react-native-navigation-sdk';
import { Platform } from 'react-native';
import { delay, roundDown } from './utils';

interface TestTools {
  navigationController: NavigationController;
  mapViewController: MapViewController | null;
  navigationViewController: NavigationViewController | null;
  addListeners: (listeners: Partial<NavigationCallbacks>) => void;
  removeListeners: (listeners: Partial<NavigationCallbacks>) => void;
  passTest: () => void;
  failTest: (message: string) => void;
  setDetoxStep: (stepNumber: number) => void;
  expectFalseError: (expectation: string) => void;
  expectTrueError: (expectation: string) => void;
}

const NAVIGATOR_NOT_READY_ERROR_CODE = 'NO_NAVIGATOR_ERROR_CODE';
const NO_DESTINATIONS_ERROR_CODE = 'NO_DESTINATIONS';
export const NO_ERRORS_DETECTED_LABEL = 'No errors detected';

type NativeModuleError = {
  code?: string;
};

const extractNativeErrorCode = (error: unknown): string | undefined => {
  if (typeof error === 'object' && error !== null) {
    const nativeError = error as NativeModuleError;
    if (typeof nativeError.code === 'string') {
      return nativeError.code;
    }
  }
  return undefined;
};

const isNavigatorUnavailableError = (code?: string): boolean =>
  code === NAVIGATOR_NOT_READY_ERROR_CODE;

const DEFAULT_TEST_WAYPOINT = {
  title: 'Grace Cathedral',
  position: {
    lat: 37.791957,
    lng: -122.412529,
  },
};

const DEFAULT_POLL_RETRY_COUNT = 10;
const DEFAULT_POLL_RETRY_DELAY_MS = 250;

const waitForCondition = async <T>(
  callFn: () => Promise<T>,
  predicate: (value: T) => boolean,
  attempts = DEFAULT_POLL_RETRY_COUNT,
  delayMs = DEFAULT_POLL_RETRY_DELAY_MS
): Promise<T | null> => {
  for (let attempt = 0; attempt < attempts; attempt++) {
    const result = await callFn();
    if (predicate(result)) {
      return result;
    }
    await delay(delayMs);
  }
  return null;
};

const waitForTimeAndDistance = async (
  navigationController: NavigationController,
  attempts = DEFAULT_POLL_RETRY_COUNT,
  delayMs = DEFAULT_POLL_RETRY_DELAY_MS
): Promise<TimeAndDistance | null> =>
  waitForCondition<TimeAndDistance | null>(
    () => navigationController.getCurrentTimeAndDistance(),
    result => result !== null,
    attempts,
    delayMs
  );

const disableVoiceGuidanceForTests = (
  navigationController: NavigationController
) => {
  navigationController.setAudioGuidanceType(AudioGuidance.SILENT);
};

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
      disableVoiceGuidanceForTests(navigationController);
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

export const testMapInitialization = async (testTools: TestTools) => {
  const { mapViewController, passTest, failTest, expectFalseError } = testTools;
  if (!mapViewController) {
    return failTest('mapViewController was expected to exist');
  }
  mapViewController.setCompassEnabled(false);
  mapViewController.setRotateGesturesEnabled(false);
  mapViewController.setScrollGesturesEnabled(false);
  mapViewController.setScrollGesturesEnabledDuringRotateOrZoom(false);
  mapViewController.setTiltGesturesEnabled(false);
  mapViewController.setZoomGesturesEnabled(false);

  if (Platform.OS === 'android') {
    mapViewController.setZoomControlsEnabled(false);
    mapViewController.setMapToolbarEnabled(false);
  }
  const uiSettingsAfterDisable = await waitForCondition(
    () => mapViewController.getUiSettings(),
    settings =>
      !settings.isZoomGesturesEnabled &&
      (Platform.OS !== 'android' || !settings.isMapToolbarEnabled)
  );

  if (!uiSettingsAfterDisable) {
    return expectFalseError(
      'mapViewController UI settings did not disable as expected'
    );
  }

  if (uiSettingsAfterDisable.isCompassEnabled) {
    return expectFalseError(
      'mapViewController.getUiSettings()).isCompassEnabled'
    );
  }
  if (uiSettingsAfterDisable.isRotateGesturesEnabled) {
    return expectFalseError(
      'mapViewController.getUiSettings()).isRotateGesturesEnabled'
    );
  }
  if (uiSettingsAfterDisable.isScrollGesturesEnabled) {
    return expectFalseError(
      'mapViewController.getUiSettings()).isScrollGesturesEnabled'
    );
  }
  if (uiSettingsAfterDisable.isScrollGesturesEnabledDuringRotateOrZoom) {
    return expectFalseError(
      'mapViewController.getUiSettings()).isScrollGesturesEnabledDuringRotateOrZoom'
    );
  }
  if (uiSettingsAfterDisable.isTiltGesturesEnabled) {
    return expectFalseError(
      'mapViewController.getUiSettings()).isTiltGesturesEnabled'
    );
  }
  if (uiSettingsAfterDisable.isZoomGesturesEnabled) {
    return expectFalseError(
      'mapViewController.getUiSettings()).isZoomGesturesEnabled'
    );
  }

  if (Platform.OS === 'android') {
    if (uiSettingsAfterDisable.isZoomControlsEnabled) {
      return expectFalseError(
        'mapViewController.getUiSettings()).isZoomControlsEnabled'
      );
    }
    if (uiSettingsAfterDisable.isMapToolbarEnabled) {
      return expectFalseError(
        'mapViewController.getUiSettings()).isMapToolbarEnabled'
      );
    }
  }

  mapViewController.setCompassEnabled(true);
  mapViewController.setRotateGesturesEnabled(true);
  mapViewController.setScrollGesturesEnabled(true);
  mapViewController.setScrollGesturesEnabledDuringRotateOrZoom(true);
  mapViewController.setTiltGesturesEnabled(true);
  mapViewController.setZoomGesturesEnabled(true);

  if (Platform.OS === 'android') {
    mapViewController.setZoomControlsEnabled(true);
    mapViewController.setMapToolbarEnabled(true);
  }
  const uiSettingsAfterEnable = await waitForCondition(
    () => mapViewController.getUiSettings(),
    settings =>
      settings.isZoomGesturesEnabled &&
      (Platform.OS !== 'android' || settings.isMapToolbarEnabled)
  );

  if (!uiSettingsAfterEnable) {
    return expectFalseError(
      'mapViewController UI settings did not enable as expected'
    );
  }

  if (!uiSettingsAfterEnable.isCompassEnabled) {
    return expectFalseError(
      '!mapViewController.getUiSettings()).isCompassEnabled'
    );
  }
  if (!uiSettingsAfterEnable.isRotateGesturesEnabled) {
    return expectFalseError(
      '!mapViewController.getUiSettings()).isRotateGesturesEnabled'
    );
  }
  if (!uiSettingsAfterEnable.isScrollGesturesEnabled) {
    return expectFalseError(
      '!mapViewController.getUiSettings()).isScrollGesturesEnabled'
    );
  }
  if (!uiSettingsAfterEnable.isScrollGesturesEnabledDuringRotateOrZoom) {
    return expectFalseError(
      '!mapViewController.getUiSettings()).isScrollGesturesEnabledDuringRotateOrZoom'
    );
  }
  if (!uiSettingsAfterEnable.isTiltGesturesEnabled) {
    return expectFalseError(
      '!mapViewController.getUiSettings()).isTiltGesturesEnabled'
    );
  }
  if (!uiSettingsAfterEnable.isZoomGesturesEnabled) {
    return expectFalseError(
      '!mapViewController.getUiSettings()).isZoomGesturesEnabled'
    );
  }

  if (Platform.OS === 'android') {
    if (!uiSettingsAfterEnable.isZoomControlsEnabled) {
      return expectFalseError(
        '!mapViewController.getUiSettings()).isZoomControlsEnabled'
      );
    }
    if (!uiSettingsAfterEnable.isMapToolbarEnabled) {
      return expectFalseError(
        '!mapViewController.getUiSettings()).isMapToolbarEnabled'
      );
    }
  }

  passTest();
};

export const testNavigationToSingleDestination = async (
  testTools: TestTools
) => {
  const { navigationController, addListeners, passTest, failTest } = testTools;
  addListeners({
    onNavigationReady: async () => {
      disableVoiceGuidanceForTests(navigationController);
      await navigationController.simulator.simulateLocation({
        lat: 37.4195823,
        lng: -122.0799018,
      });
      await navigationController.setDestinations(
        [
          {
            position: {
              lat: 37.418761,
              lng: -122.080484,
            },
          },
        ],
        {
          routingOptions: {
            travelMode: TravelMode.DRIVING,
            avoidFerries: true,
            avoidTolls: false,
          },
        }
      );
      await navigationController.startGuidance();

      const routeSegments = await waitForCondition(
        () => navigationController.getRouteSegments(),
        segments => segments.length > 0
      );
      if (!routeSegments) {
        return failTest(
          'Timed out waiting for route segments before starting simulation'
        );
      }
      await navigationController.simulator.simulateLocationsAlongExistingRoute({
        speedMultiplier: Platform.OS === 'ios' ? 5 : 10,
      });
    },
    onNavigationInitError: (errorCode: NavigationInitErrorCode) => {
      console.log(errorCode);
      failTest('onNavigatonInitError');
    },
    onArrival: async () => {
      navigationController.cleanup();
      return passTest();
    },
  });
  try {
    await navigationController.init();
  } catch (error) {
    console.error('Error initializing navigator', error);
    failTest('navigationController.init() exception');
  }
};

export const testNavigationToMultipleDestination = async (
  testTools: TestTools
) => {
  const { navigationController, addListeners, passTest, failTest } = testTools;
  let onArrivalCount = 0;
  addListeners({
    onNavigationReady: async () => {
      disableVoiceGuidanceForTests(navigationController);
      await navigationController.simulator.simulateLocation({
        lat: 37.4195823,
        lng: -122.0799018,
      });
      await navigationController.setDestinations(
        [
          {
            position: {
              lat: 37.418761,
              lng: -122.080484,
            },
          },
          {
            position: {
              lat: 37.4177952,
              lng: -122.0817198,
            },
          },
        ],
        {
          routingOptions: {
            travelMode: TravelMode.DRIVING,
            avoidFerries: true,
            avoidTolls: false,
          },
        }
      );
      await navigationController.startGuidance();

      const routeSegments = await waitForCondition(
        () => navigationController.getRouteSegments(),
        segments => segments.length > 0
      );
      if (!routeSegments) {
        return failTest(
          'Timed out waiting for route segments before starting simulation'
        );
      }
      await navigationController.simulator.simulateLocationsAlongExistingRoute({
        speedMultiplier: Platform.OS === 'ios' ? 5 : 10,
      });
    },
    onNavigationInitError: (errorCode: NavigationInitErrorCode) => {
      console.log(errorCode);
      failTest('onNavigatonInitError');
    },
    onArrival: async () => {
      onArrivalCount += 1;
      if (onArrivalCount > 1) {
        navigationController.cleanup();
        return passTest();
      }
      await navigationController.continueToNextDestination();
      await navigationController.simulator.simulateLocationsAlongExistingRoute({
        speedMultiplier: Platform.OS === 'ios' ? 5 : 10,
      });
    },
  });
  try {
    await navigationController.init();
  } catch (error) {
    console.error('Error initializing navigator', error);
    failTest('navigationController.init() exception');
  }
};

export const testRouteSegments = async (testTools: TestTools) => {
  const {
    navigationController,
    addListeners,
    passTest,
    failTest,
    expectFalseError,
  } = testTools;
  let beginTraveledPath;
  addListeners({
    onNavigationReady: async () => {
      disableVoiceGuidanceForTests(navigationController);
      await navigationController.simulator.simulateLocation({
        lat: 37.79136614772824,
        lng: -122.41565900473043,
      });
      await navigationController.setDestination({
        title: 'Grace Cathedral',
        position: {
          lat: 37.791957,
          lng: -122.412529,
        },
      });
      await navigationController.startGuidance();

      const beginRouteSegments = await waitForCondition(
        () => navigationController.getRouteSegments(),
        segments => segments.length > 0
      );
      if (!beginRouteSegments) {
        expectFalseError('beginRouteSegments.length === 0');
        return;
      }
      const beginCurrentRouteSegment = await waitForCondition(
        () => navigationController.getCurrentRouteSegment(),
        segment => segment !== null
      );
      if (!beginCurrentRouteSegment) {
        return expectFalseError('!beginCurrentRouteSegment');
      }
      beginTraveledPath = await navigationController.getTraveledPath();
      await navigationController.simulator.simulateLocationsAlongExistingRoute({
        speedMultiplier: 5,
      });
    },
    onNavigationInitError: (errorCode: NavigationInitErrorCode) => {
      console.log(errorCode);
      failTest('onNavigatonInitError');
    },
    onArrival: async () => {
      const endTraveledPath = await navigationController.getTraveledPath();
      if (endTraveledPath.length <= beginTraveledPath.length) {
        return expectFalseError(
          'endTraveledPath.length <= beginTraveledPath.length'
        );
      }
      navigationController.cleanup();
      passTest();
    },
  });
  try {
    await navigationController.init();
  } catch (error) {
    console.error('Error initializing navigator', error);
    failTest('navigationController.init() exception');
  }
};

export const testGetCurrentTimeAndDistance = async (testTools: TestTools) => {
  const {
    navigationController,
    addListeners,
    passTest,
    failTest,
    expectFalseError,
  } = testTools;
  let beginTimeAndDistance: TimeAndDistance | null = null;
  addListeners({
    onNavigationReady: async () => {
      disableVoiceGuidanceForTests(navigationController);
      await navigationController.simulator.simulateLocation({
        lat: 37.79136614772824,
        lng: -122.41565900473043,
      });
      await navigationController.setDestination({
        title: 'Grace Cathedral',
        position: {
          lat: 37.791957,
          lng: -122.412529,
        },
      });
      await navigationController.startGuidance();

      beginTimeAndDistance = await waitForTimeAndDistance(navigationController);
      if (!beginTimeAndDistance) {
        return failTest(
          'initialTimeAndDistance is null (navigationController.getCurrentTimeAndDistance())'
        );
      }
      if (beginTimeAndDistance.seconds <= 0) {
        return expectFalseError('beginTimeAndDistance.seconds <= 0');
      }
      if (beginTimeAndDistance.meters <= 0) {
        return expectFalseError('beginTimeAndDistance.meters <= 0');
      }
      await navigationController.simulator.simulateLocationsAlongExistingRoute({
        speedMultiplier: 5,
      });
    },
    onNavigationInitError: (errorCode: NavigationInitErrorCode) => {
      console.log(errorCode);
      failTest('onNavigatonInitError');
    },
    onArrival: async () => {
      const endTimeAndDistance =
        await waitForTimeAndDistance(navigationController);
      if (!endTimeAndDistance) {
        return expectFalseError(
          'endTimeAndDistance is null (navigationController.getCurrentTimeAndDistance())'
        );
      }
      if (!beginTimeAndDistance) {
        return expectFalseError('beginTimeAndDistance is null');
      }
      if (endTimeAndDistance.meters >= beginTimeAndDistance.meters) {
        return expectFalseError(
          'endTimeAndDistance.meters >= beginTimeAndDistance.meters'
        );
      }
      if (endTimeAndDistance.seconds >= beginTimeAndDistance.seconds) {
        return expectFalseError(
          'endTimeAndDistance.seconds >= beginTimeAndDistance.seconds'
        );
      }
      navigationController.cleanup();
      passTest();
    },
  });
  try {
    await navigationController.init();
  } catch (error) {
    console.error('Error initializing navigator', error);
    failTest('navigationController.init() exception');
  }
};

export const testMoveCamera = async (testTools: TestTools) => {
  const { mapViewController, passTest, failTest, expectFalseError } = testTools;
  if (!mapViewController) {
    return failTest('mapViewController was expected to exist');
  }

  // Move camera to Hong Kong
  mapViewController.moveCamera({
    target: {
      lat: 22.2987849,
      lng: 114.1719271,
    },
  });

  const hongKongPosition = await waitForCondition(
    () => mapViewController.getCameraPosition(),
    position =>
      roundDown(position.target.lat) === 22 &&
      roundDown(position.target.lng) === 114
  );
  if (!hongKongPosition) {
    expectFalseError(
      'roundDown(hongKongPosition.target.lat) !== 22 || roundDown(hongKongPosition.target.lng) !== 114'
    );
  }

  // Move camera to Tokyo
  mapViewController.moveCamera({
    target: {
      lat: 35.6805707,
      lng: 139.7658596,
    },
  });

  const tokyoPosition = await waitForCondition(
    () => mapViewController.getCameraPosition(),
    position =>
      roundDown(position.target.lat) === 35 &&
      roundDown(position.target.lng) === 139
  );
  if (!tokyoPosition) {
    expectFalseError(
      'roundDown(tokyoPosition.target.lat) !== 35 || roundDown(tokyoPosition.target.lng) !== 139'
    );
  }

  passTest();
};

export const testTiltZoomBearingCamera = async (testTools: TestTools) => {
  const { mapViewController, passTest, failTest, expectFalseError } = testTools;
  if (!mapViewController) {
    return failTest('mapViewController was expected to exist');
  }

  // Move camera to Hong Kong and set bearing, tilt and zoom.
  mapViewController.moveCamera({
    target: {
      lat: 22.2987849,
      lng: 114.1719271,
    },
    bearing: 270,
    tilt: 20,
    zoom: 6,
  });

  const hongKongPosition = await waitForCondition(
    () => mapViewController.getCameraPosition(),
    position =>
      position.bearing === 270 && position.tilt === 20 && position.zoom === 6
  );

  if (!hongKongPosition) {
    expectFalseError(
      'hongKongPosition.bearing !== 270 || hongKongPosition.tilt !== 20 || hongKongPosition.zoom !== 6'
    );
  }

  passTest();
};

export const testOnRemainingTimeOrDistanceChanged = async (
  testTools: TestTools
) => {
  const { navigationController, addListeners, passTest, failTest } = testTools;
  addListeners({
    onRemainingTimeOrDistanceChanged: async () => {
      const timeAndDistance =
        await navigationController.getCurrentTimeAndDistance();
      if (timeAndDistance.meters > 0 && timeAndDistance.seconds > 0) {
        navigationController.cleanup();
        return passTest();
      }
    },
    onNavigationReady: async () => {
      disableVoiceGuidanceForTests(navigationController);
      await navigationController.simulator.simulateLocation({
        lat: 37.79136614772824,
        lng: -122.41565900473043,
      });
      await navigationController.setDestination({
        title: 'Grace Cathedral',
        position: {
          lat: 37.791957,
          lng: -122.412529,
        },
      });
      await navigationController.startGuidance();
      await navigationController.simulator.simulateLocationsAlongExistingRoute({
        speedMultiplier: 5,
      });
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
};

export const testOnArrival = async (testTools: TestTools) => {
  const { navigationController, addListeners, passTest, failTest } = testTools;
  addListeners({
    onArrival: async () => {
      navigationController.cleanup();
      passTest();
    },
    onNavigationReady: async () => {
      disableVoiceGuidanceForTests(navigationController);
      await navigationController.simulator.simulateLocation({
        lat: 37.79136614772824,
        lng: -122.41565900473043,
      });
      await navigationController.setDestination({
        title: 'Grace Cathedral',
        position: {
          lat: 37.791957,
          lng: -122.412529,
        },
      });
      await navigationController.startGuidance();
      const routeSegments = await waitForCondition(
        () => navigationController.getRouteSegments(),
        segments => segments.length > 0
      );
      if (!routeSegments) {
        return failTest(
          'Timed out waiting for route segments before starting simulation'
        );
      }
      await navigationController.simulator.simulateLocationsAlongExistingRoute({
        speedMultiplier: 5,
      });
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
};

export const testOnRouteChanged = async (testTools: TestTools) => {
  const { navigationController, addListeners, passTest, failTest } = testTools;
  addListeners({
    onRouteChanged: async () => {
      navigationController.cleanup();
      passTest();
    },
    onNavigationReady: async () => {
      disableVoiceGuidanceForTests(navigationController);
      await navigationController.simulator.simulateLocation({
        lat: 37.79136614772824,
        lng: -122.41565900473043,
      });
      await navigationController.setDestination({
        title: 'Grace Cathedral',
        position: {
          lat: 37.791957,
          lng: -122.412529,
        },
      });
      await navigationController.startGuidance();
      await navigationController.simulator.simulateLocationsAlongExistingRoute({
        speedMultiplier: 5,
      });
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
};

export const testNavigationStateGuards = async (testTools: TestTools) => {
  const { navigationController, passTest, failTest } = testTools;

  const expectNavigatorUnavailableError = async (
    operationName: string,
    action: () => Promise<unknown>
  ): Promise<boolean> => {
    try {
      await action();
      failTest(
        `Expected ${operationName} to reject when navigator is unavailable`
      );
      return false;
    } catch (error) {
      const code = extractNativeErrorCode(error);
      if (!isNavigatorUnavailableError(code)) {
        failTest(
          `${operationName} rejected with unexpected error code ${
            code ?? 'undefined'
          }`
        );
        return false;
      }
    }
    return true;
  };

  if (
    !(await expectNavigatorUnavailableError('setDestination', () =>
      navigationController.setDestination(DEFAULT_TEST_WAYPOINT)
    ))
  ) {
    return;
  }

  if (
    !(await expectNavigatorUnavailableError('setDestinations', () =>
      navigationController.setDestinations([DEFAULT_TEST_WAYPOINT])
    ))
  ) {
    return;
  }

  if (
    !(await expectNavigatorUnavailableError('startGuidance', () =>
      navigationController.startGuidance()
    ))
  ) {
    return;
  }

  if (
    !(await expectNavigatorUnavailableError('stopGuidance', () =>
      navigationController.stopGuidance()
    ))
  ) {
    return;
  }

  if (
    !(await expectNavigatorUnavailableError('clearDestinations', () =>
      navigationController.clearDestinations()
    ))
  ) {
    return;
  }

  if (
    !(await expectNavigatorUnavailableError('continueToNextDestination', () =>
      navigationController.continueToNextDestination()
    ))
  ) {
    return;
  }

  if (
    !(await expectNavigatorUnavailableError('cleanup', () =>
      navigationController.cleanup()
    ))
  ) {
    return;
  }
  passTest();
};

export const testStartGuidanceWithoutDestinations = async (
  testTools: TestTools
) => {
  const { navigationController, addListeners, passTest, failTest } = testTools;

  const expectNoDestinationsError = async (): Promise<boolean> => {
    try {
      await navigationController.startGuidance();
      failTest('Expected startGuidance to reject without destinations');
      return false;
    } catch (error) {
      const code = extractNativeErrorCode(error);
      if (code !== NO_DESTINATIONS_ERROR_CODE) {
        failTest(
          `startGuidance rejected with unexpected error code ${
            code ?? 'undefined'
          }`
        );
        return false;
      }
    }
    return true;
  };

  addListeners({
    onNavigationReady: async () => {
      disableVoiceGuidanceForTests(navigationController);
      if (!(await expectNoDestinationsError())) {
        return;
      }

      try {
        await navigationController.cleanup();
      } catch (error) {
        console.error('cleanup failed', error);
        failTest('navigationController.cleanup() failed');
        return;
      }

      passTest();
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
};

/**
 * Tests that providing both routingOptions and routeTokenOptions throws an error.
 * These options are mutually exclusive and should not be used together.
 */
export const testRouteTokenOptionsValidation = async (testTools: TestTools) => {
  const { navigationController, addListeners, passTest, failTest } = testTools;

  addListeners({
    onNavigationReady: async () => {
      disableVoiceGuidanceForTests(navigationController);

      try {
        // Attempt to provide both routingOptions and routeTokenOptions
        await navigationController.setDestinations([DEFAULT_TEST_WAYPOINT], {
          routingOptions: { travelMode: TravelMode.DRIVING },
          routeTokenOptions: {
            routeToken: 'some-token',
            travelMode: TravelMode.DRIVING,
          },
        });
        failTest(
          'Expected error when both routingOptions and routeTokenOptions provided'
        );
      } catch (error) {
        // Should throw JS error about mutual exclusivity
        if (
          error instanceof Error &&
          error.message.includes(
            'Only one of routingOptions or routeTokenOptions'
          )
        ) {
          try {
            await navigationController.cleanup();
          } catch (cleanupError) {
            console.error('cleanup failed', cleanupError);
          }
          passTest();
        } else {
          failTest(`Unexpected error: ${error}`);
        }
      }
    },
    onNavigationInitError: (errorCode: NavigationInitErrorCode) => {
      console.log(errorCode);
      failTest(`onNavigationInitError: ${errorCode}`);
    },
  });

  try {
    await navigationController.init();
  } catch (error) {
    console.error('Error initializing navigator', error);
    failTest('navigationController.init() exception');
  }
};
