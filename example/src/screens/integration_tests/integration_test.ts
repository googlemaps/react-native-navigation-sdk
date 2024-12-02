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
  // Timeout here is used to avoid issues on Android.
  await delay(3000);

  if ((await mapViewController.getUiSettings()).isCompassEnabled) {
    return expectFalseError(
      'mapViewController.getUiSettings()).isCompassEnabled'
    );
  }
  if ((await mapViewController.getUiSettings()).isRotateGesturesEnabled) {
    return expectFalseError(
      'mapViewController.getUiSettings()).isRotateGesturesEnabled'
    );
  }
  if ((await mapViewController.getUiSettings()).isScrollGesturesEnabled) {
    return expectFalseError(
      'mapViewController.getUiSettings()).isScrollGesturesEnabled'
    );
  }
  if (
    (await mapViewController.getUiSettings())
      .isScrollGesturesEnabledDuringRotateOrZoom
  ) {
    return expectFalseError(
      'mapViewController.getUiSettings()).isScrollGesturesEnabledDuringRotateOrZoom'
    );
  }
  if ((await mapViewController.getUiSettings()).isTiltGesturesEnabled) {
    return expectFalseError(
      'mapViewController.getUiSettings()).isTiltGesturesEnabled'
    );
  }
  if ((await mapViewController.getUiSettings()).isZoomGesturesEnabled) {
    return expectFalseError(
      'mapViewController.getUiSettings()).isZoomGesturesEnabled'
    );
  }

  if (Platform.OS === 'android') {
    if ((await mapViewController.getUiSettings()).isZoomControlsEnabled) {
      return expectFalseError(
        'mapViewController.getUiSettings()).isZoomControlsEnabled'
      );
    }
    if ((await mapViewController.getUiSettings()).isMapToolbarEnabled) {
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
  // Timeout here is used to avoid issues on Android.
  await delay(3000);

  if (!(await mapViewController.getUiSettings()).isCompassEnabled) {
    return expectFalseError(
      '!mapViewController.getUiSettings()).isCompassEnabled'
    );
  }
  if (!(await mapViewController.getUiSettings()).isRotateGesturesEnabled) {
    return expectFalseError(
      '!mapViewController.getUiSettings()).isRotateGesturesEnabled'
    );
  }
  if (!(await mapViewController.getUiSettings()).isScrollGesturesEnabled) {
    return expectFalseError(
      '!mapViewController.getUiSettings()).isScrollGesturesEnabled'
    );
  }
  if (
    !(await mapViewController.getUiSettings())
      .isScrollGesturesEnabledDuringRotateOrZoom
  ) {
    return expectFalseError(
      '!mapViewController.getUiSettings()).isScrollGesturesEnabledDuringRotateOrZoom'
    );
  }
  if (!(await mapViewController.getUiSettings()).isTiltGesturesEnabled) {
    return expectFalseError(
      '!mapViewController.getUiSettings()).isTiltGesturesEnabled'
    );
  }
  if (!(await mapViewController.getUiSettings()).isZoomGesturesEnabled) {
    return expectFalseError(
      '!mapViewController.getUiSettings()).isZoomGesturesEnabled'
    );
  }

  if (Platform.OS === 'android') {
    if (!(await mapViewController.getUiSettings()).isZoomControlsEnabled) {
      return expectFalseError(
        '!mapViewController.getUiSettings()).isZoomControlsEnabled'
      );
    }
    if (!(await mapViewController.getUiSettings()).isMapToolbarEnabled) {
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
      await navigationController.simulator.simulateLocation({
        lat: 37.4195823,
        lng: -122.0799018,
      });
      await navigationController.setDestinations(
        [
          {
            position: {
              lat: 37.4152112,
              lng: -122.0813741,
            },
          },
        ],
        {
          travelMode: TravelMode.DRIVING,
          avoidFerries: true,
          avoidTolls: false,
        }
      );
      await navigationController.startGuidance();

      // Timeout here is used to avoid issues on Android.
      setTimeout(() => {
        navigationController.simulator.simulateLocationsAlongExistingRoute({
          speedMultiplier: 5,
        });
      }, 3000);
    },
    onNavigationInitError: (errorCode: NavigationInitErrorCode) => {
      console.log(errorCode);
      failTest('onNavigatonInitError');
    },
    onArrival() {
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

export const testNavigationToMultipleDestination = async (
  testTools: TestTools
) => {
  const { navigationController, addListeners, passTest, failTest } = testTools;
  let onArrivalCount = 0;
  addListeners({
    onNavigationReady: async () => {
      await navigationController.simulator.simulateLocation({
        lat: 37.4195823,
        lng: -122.0799018,
      });
      await navigationController.setDestinations(
        [
          {
            position: {
              lat: 37.4178065,
              lng: -122.0812455,
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
          travelMode: TravelMode.DRIVING,
          avoidFerries: true,
          avoidTolls: false,
        }
      );
      await navigationController.startGuidance();

      // Timeout here is used to avoid issues on Android.
      setTimeout(() => {
        navigationController.simulator.simulateLocationsAlongExistingRoute({
          speedMultiplier: Platform.OS === 'ios' ? 5 : 10,
        });
      }, 3000);
    },
    onNavigationInitError: (errorCode: NavigationInitErrorCode) => {
      console.log(errorCode);
      failTest('onNavigatonInitError');
    },
    onArrival: async () => {
      onArrivalCount += 1;
      if (onArrivalCount > 1) {
        return passTest();
      }
      await navigationController.continueToNextDestination();
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

      // Timeout here is used to avoid issues on Android.
      setTimeout(async () => {
        const beginRouteSegments =
          await navigationController.getRouteSegments();
        const beginCurrentRouteSegment =
          await navigationController.getCurrentRouteSegment();
        beginTraveledPath = await navigationController.getTraveledPath();

        if (beginRouteSegments.length === 0) {
          expectFalseError('beginRouteSegments.length === 0');
          return;
        }
        if (!beginCurrentRouteSegment) {
          return expectFalseError('!beginCurrentRouteSegment');
        }
        navigationController.simulator.simulateLocationsAlongExistingRoute({
          speedMultiplier: 5,
        });
      }, 3000);
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
  let beginTimeAndDistance: TimeAndDistance;
  addListeners({
    onNavigationReady: async () => {
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

      // Timeout here is used to avoid issues on Android.
      setTimeout(async () => {
        beginTimeAndDistance =
          await navigationController.getCurrentTimeAndDistance();
        if (beginTimeAndDistance.seconds <= 0) {
          return expectFalseError('beginTimeAndDistance.seconds <= 0');
        }
        if (beginTimeAndDistance.meters <= 0) {
          return expectFalseError('beginTimeAndDistance.meters <= 0');
        }
        await navigationController.simulator.simulateLocationsAlongExistingRoute(
          {
            speedMultiplier: 5,
          }
        );
      }, 3000);
    },
    onNavigationInitError: (errorCode: NavigationInitErrorCode) => {
      console.log(errorCode);
      failTest('onNavigatonInitError');
    },
    onArrival: async () => {
      const endTimeAndDistance =
        await navigationController.getCurrentTimeAndDistance();
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

  // Timeout here is used to avoid issues on Android.
  await delay(3000);
  const hongKongPosition = await mapViewController.getCameraPosition();

  if (
    roundDown(hongKongPosition.target.lat) !== 22 ||
    roundDown(hongKongPosition.target.lng) !== 114
  ) {
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

  // Timeout here is used to avoid issues on Android.
  await delay(3000);
  const tokyoPosition = await mapViewController.getCameraPosition();

  if (
    roundDown(tokyoPosition.target.lat) !== 35 ||
    roundDown(tokyoPosition.target.lng) !== 139
  ) {
    expectFalseError(
      'roundDown(hongKongPosition.target.lat) !== 22 || roundDown(hongKongPosition.target.lng) !== 114'
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

  // Timeout here is used to avoid issues on Android.
  await delay(3000);
  const hongKongPosition = await mapViewController.getCameraPosition();

  if (
    hongKongPosition.bearing !== 270 ||
    hongKongPosition.tilt !== 20 ||
    hongKongPosition.zoom !== 6
  ) {
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
        return passTest();
      }
    },
    onNavigationReady: async () => {
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
      passTest();
    },
    onNavigationReady: async () => {
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
      // Timeout here is used to avoid issues on Android.
      await delay(3000);
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
      passTest();
    },
    onNavigationReady: async () => {
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
