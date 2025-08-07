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
  type NavigationController,
  NavigationInitializationStatus,
  type NavigationViewController,
  type TimeAndDistance,
  type Waypoint,
  type LatLng,
} from '@googlemaps/react-native-navigation-sdk';
import { Platform } from 'react-native';
import { delay, roundDown, simulateAndWaitForLocation } from './utils';
import type {
  MapNavControlsState,
  MapNavControlsAction,
} from '../../controls/mapNavControlsReducer';

export interface TestTools {
  navigationController: NavigationController;
  mapViewController: MapViewController | null;
  navigationViewController: NavigationViewController | null;
  passTest: () => void;
  failTest: (message: string) => void;
  setDetoxStep: (stepNumber: number) => void;
  expectFalseError: (expectation: string) => void;
  expectTrueError: (expectation: string) => void;
  mapNavControlsState: MapNavControlsState;
  dispatchMapNavControls: React.Dispatch<MapNavControlsAction>;
}

const simulatorSpeedMultiplier = 10;
const routes: LatLng[][] = [
  [
    {
      // 1936-1934 N Shoreline Blvd
      lat: 37.423257,
      lng: -122.07809,
    },
    {
      // 1860-1856 N Shoreline Blvd
      lat: 37.420028,
      lng: -122.07808,
    },
    {
      // 8315 Shorebird Way
      lat: 37.418519,
      lng: -122.075633,
    },
  ],
  [
    {
      // Google NYC - 9th Avenue
      lat: 40.741148211826086,
      lng: -74.00364910466568,
    },
    {
      // 300 W 14th St NYC
      lat: 40.739863525259324,
      lng: -74.00268986691397,
    },
    {
      // Life Underground NYC
      lat: 40.739817638935726,
      lng: -74.0026173344718,
    },
  ],
];
let currentRouteIndex = 0;
const getRoutePoints = (amount: number): LatLng[] => {
  currentRouteIndex = (currentRouteIndex + 1) % routes.length;
  return (routes[currentRouteIndex] as LatLng[]).slice(0, amount);
};

export const testNavigationSessionInitialization = async (
  testTools: TestTools
) => {
  const { navigationController, passTest, failTest, expectFalseError } =
    testTools;

  const checkDefaults = async () => {
    if (!(await navigationController.areTermsAccepted())) {
      return expectFalseError('navigationController.areTermsAccepted()');
    }
    passTest();
  };

  navigationController.setOnNavigationReadyListener(() => {
    checkDefaults();
  });

  try {
    let status: NavigationInitializationStatus =
      await navigationController.init();
    if (status !== NavigationInitializationStatus.OK) {
      failTest(`navigationController.init() status: ${status}`);
    }
  } catch (error) {
    console.error('Error initializing navigator', error);
    failTest('navigationController.init() exception');
  }
  // Tell detox to prepare to execute step 1: (confirm t&c dialog)
  testTools.setDetoxStep(1);
  testTools.navigationController.removeAllListeners(); // Ensure listeners are cleared
};

export const testMapInitialization = async (testTools: TestTools) => {
  const {
    mapViewController,
    passTest,
    failTest,
    expectFalseError,
    dispatchMapNavControls,
  } = testTools;
  if (!mapViewController) {
    return failTest('mapViewController was expected to exist');
  }

  dispatchMapNavControls({ type: 'setCompassEnabled', value: false });
  dispatchMapNavControls({ type: 'setRotateGesturesEnabled', value: false });
  dispatchMapNavControls({ type: 'setScrollGesturesEnabled', value: false });
  dispatchMapNavControls({
    type: 'setScrollGesturesEnabledDuringRotateOrZoom',
    value: false,
  });
  dispatchMapNavControls({ type: 'setTiltGesturesEnabled', value: false });
  dispatchMapNavControls({ type: 'setZoomGesturesEnabled', value: false });

  if (Platform.OS === 'android') {
    dispatchMapNavControls({ type: 'setZoomControlsEnabled', value: false });
    dispatchMapNavControls({ type: 'setMapToolbarEnabled', value: false });
  }

  await delay(250); // Wait for the UI settings to be applied

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

  // Set all UI controls to true via reducer
  dispatchMapNavControls({ type: 'setCompassEnabled', value: true });
  dispatchMapNavControls({ type: 'setRotateGesturesEnabled', value: true });
  dispatchMapNavControls({ type: 'setScrollGesturesEnabled', value: true });
  dispatchMapNavControls({
    type: 'setScrollGesturesEnabledDuringRotateOrZoom',
    value: true,
  });
  dispatchMapNavControls({ type: 'setTiltGesturesEnabled', value: true });
  dispatchMapNavControls({ type: 'setZoomGesturesEnabled', value: true });

  if (Platform.OS === 'android') {
    dispatchMapNavControls({ type: 'setZoomControlsEnabled', value: true });
    dispatchMapNavControls({ type: 'setMapToolbarEnabled', value: true });
  }

  await delay(250); // Wait for the UI settings to be applied

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
  testTools.navigationController.removeAllListeners(); // Ensure listeners are cleared
};

export const testNavigationToSingleDestination = async (
  testTools: TestTools
) => {
  const { navigationController, passTest, failTest } = testTools;
  const route = getRoutePoints(2);

  navigationController.setOnNavigationReadyListener(async () => {
    if (!(await simulateAndWaitForLocation(testTools, route[0] as LatLng))) {
      return;
    }

    await navigationController.setDestinations(
      [
        {
          position: route[1] as LatLng,
        },
      ],
      {
        travelMode: TravelMode.DRIVING,
        avoidFerries: true,
        avoidTolls: false,
      }
    );

    await navigationController.startGuidance();

    navigationController.simulator.simulateLocationsAlongExistingRoute({
      speedMultiplier: simulatorSpeedMultiplier,
    });
  });

  navigationController.setOnArrivalListener(() => {
    testTools.navigationController.removeAllListeners(); // Ensure listeners are cleared after test
    passTest();
  });

  try {
    let status: NavigationInitializationStatus =
      await navigationController.init();
    if (status !== NavigationInitializationStatus.OK) {
      failTest(`navigationController.init() status: ${status}`);
    }
  } catch (error) {
    console.error('Error initializing navigator', error);
    failTest('navigationController.init() exception');
  }
};

export const testNavigationToMultipleDestination = async (
  testTools: TestTools
) => {
  const { navigationController, passTest, failTest } = testTools;
  let onArrivalCount = 0;
  const route = getRoutePoints(3);

  let waypoints: Waypoint[] = [
    {
      position: route[1] as LatLng,
    },
    {
      position: route[2] as LatLng,
    },
  ];

  navigationController.setOnNavigationReadyListener(async () => {
    if (!(await simulateAndWaitForLocation(testTools, route[0] as LatLng))) {
      return;
    }

    await navigationController.setDestinations(waypoints, {
      travelMode: TravelMode.DRIVING,
      avoidFerries: true,
      avoidTolls: false,
    });
    await navigationController.startGuidance();

    navigationController.simulator.simulateLocationsAlongExistingRoute({
      speedMultiplier: simulatorSpeedMultiplier,
    });
  });

  navigationController.setOnArrivalListener(async () => {
    onArrivalCount += 1;
    if (onArrivalCount > 1) {
      passTest();
      testTools.navigationController.removeAllListeners(); // Ensure listeners are cleared
      return;
    }

    // Remove the first waypoint and add call setDestinations again if there are waypoints left.
    waypoints = waypoints.slice(1);
    if (waypoints.length > 0) {
      await navigationController.setDestinations(waypoints, {
        travelMode: TravelMode.DRIVING,
        avoidFerries: true,
        avoidTolls: false,
      });
    }
  });

  try {
    let status: NavigationInitializationStatus =
      await navigationController.init();
    if (status !== NavigationInitializationStatus.OK) {
      failTest(`navigationController.init() status: ${status}`);
    }
  } catch (error) {
    console.error('Error initializing navigator', error);
    failTest('navigationController.init() exception');
  }
};

export const testRouteSegments = async (testTools: TestTools) => {
  const { navigationController, passTest, failTest, expectFalseError } =
    testTools;
  let beginTraveledPath: LatLng[] = [];
  const route = getRoutePoints(2);

  navigationController.setOnNavigationReadyListener(async () => {
    if (!(await simulateAndWaitForLocation(testTools, route[0] as LatLng))) {
      return;
    }

    await navigationController.setDestination({
      title: 'Target destination',
      position: route[1] as LatLng,
    });
    await navigationController.startGuidance();

    const beginRouteSegments = await navigationController.getRouteSegments();
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

    navigationController.setOnArrivalListener(async () => {
      const endTraveledPath = await navigationController.getTraveledPath();
      if (endTraveledPath.length <= beginTraveledPath.length) {
        return expectFalseError(
          'endTraveledPath.length <= beginTraveledPath.length'
        );
      }
      passTest();
      testTools.navigationController.removeAllListeners(); // Ensure listeners are cleared
    });

    navigationController.simulator.simulateLocationsAlongExistingRoute({
      speedMultiplier: simulatorSpeedMultiplier,
    });
  });

  try {
    let status: NavigationInitializationStatus =
      await navigationController.init();
    if (status !== NavigationInitializationStatus.OK) {
      failTest(`navigationController.init() status: ${status}`);
    }
  } catch (error) {
    console.error('Error initializing navigator', error);
    failTest('navigationController.init() exception');
  }
};

export const testGetCurrentTimeAndDistance = async (testTools: TestTools) => {
  const { navigationController, passTest, failTest, expectFalseError } =
    testTools;
  let beginTimeAndDistance: TimeAndDistance;
  const route = getRoutePoints(2);

  navigationController.setOnNavigationReadyListener(async () => {
    if (!(await simulateAndWaitForLocation(testTools, route[0] as LatLng))) {
      return;
    }

    await navigationController.setDestination({
      title: 'Target destination',
      position: route[1] as LatLng,
    });
    await navigationController.startGuidance();

    beginTimeAndDistance =
      await navigationController.getCurrentTimeAndDistance();
    if (beginTimeAndDistance.seconds <= 0) {
      return expectFalseError('beginTimeAndDistance.seconds <= 0');
    }
    if (beginTimeAndDistance.meters <= 0) {
      return expectFalseError('beginTimeAndDistance.meters <= 0');
    }
    await navigationController.simulator.simulateLocationsAlongExistingRoute({
      speedMultiplier: simulatorSpeedMultiplier,
    });
  });

  navigationController.setOnArrivalListener(async () => {
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
    testTools.navigationController.removeAllListeners(); // Ensure listeners are cleared
  });

  try {
    let status: NavigationInitializationStatus =
      await navigationController.init();
    if (status !== NavigationInitializationStatus.OK) {
      failTest(`navigationController.init() status: ${status}`);
    }
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
    zoom: 12,
  });

  // Timeout here to wait simulator to settle before setting destination.
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
    zoom: 12,
  });

  await delay(1000);

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
  testTools.navigationController.removeAllListeners(); // Ensure listeners are cleared
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

  // Timeout here to wait simulator to settle before setting destination.
  await delay(1000);

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
  testTools.navigationController.removeAllListeners(); // Ensure listeners are cleared
};

export const testOnRemainingTimeOrDistanceChanged = async (
  testTools: TestTools
) => {
  const { navigationController, passTest, failTest } = testTools;
  const route = getRoutePoints(2);

  navigationController.setOnRemainingTimeOrDistanceChangedListener(async () => {
    const timeAndDistance =
      await navigationController.getCurrentTimeAndDistance();
    if (timeAndDistance.meters > 0 && timeAndDistance.seconds > 0) {
      passTest();
      testTools.navigationController.removeAllListeners(); // Ensure listeners are cleared
      return;
    }
  });

  navigationController.setOnNavigationReadyListener(async () => {
    if (!(await simulateAndWaitForLocation(testTools, route[0] as LatLng))) {
      return;
    }

    await navigationController.setDestination({
      title: 'Target destination',
      position: route[1] as LatLng,
    });
    await navigationController.startGuidance();
    await navigationController.simulator.simulateLocationsAlongExistingRoute({
      speedMultiplier: simulatorSpeedMultiplier,
    });
  });

  try {
    let status: NavigationInitializationStatus =
      await navigationController.init();
    if (status !== NavigationInitializationStatus.OK) {
      failTest(`navigationController.init() status: ${status}`);
    }
  } catch (error) {
    console.error('Error initializing navigator', error);
    failTest('navigationController.init() exception');
  }
};

export const testOnArrival = async (testTools: TestTools) => {
  const { navigationController, passTest, failTest } = testTools;
  const route = getRoutePoints(2);

  navigationController.setOnArrivalListener(() => {
    passTest();
    testTools.navigationController.removeAllListeners(); // Ensure listeners are cleared
  });

  navigationController.setOnNavigationReadyListener(async () => {
    if (!(await simulateAndWaitForLocation(testTools, route[0] as LatLng))) {
      return;
    }

    await navigationController.setDestination({
      title: 'Target destination',
      position: route[1] as LatLng,
    });
    await navigationController.startGuidance();

    await navigationController.simulator.simulateLocationsAlongExistingRoute({
      speedMultiplier: simulatorSpeedMultiplier,
    });
  });

  try {
    let status: NavigationInitializationStatus =
      await navigationController.init();
    if (status !== NavigationInitializationStatus.OK) {
      failTest(`navigationController.init() status: ${status}`);
    }
  } catch (error) {
    console.error('Error initializing navigator', error);
    failTest('navigationController.init() exception');
  }
};

export const testOnRouteChanged = async (testTools: TestTools) => {
  const { navigationController, passTest, failTest } = testTools;
  const route = getRoutePoints(2);

  navigationController.setOnRouteChangedListener(() => {
    passTest();
    testTools.navigationController.removeAllListeners(); // Ensure listeners are cleared
  });

  navigationController.setOnNavigationReadyListener(async () => {
    if (!(await simulateAndWaitForLocation(testTools, route[0] as LatLng))) {
      return;
    }

    await navigationController.setDestination({
      title: 'Target destination',
      position: route[1] as LatLng,
    });
    await navigationController.startGuidance();
    await navigationController.simulator.simulateLocationsAlongExistingRoute({
      speedMultiplier: simulatorSpeedMultiplier,
    });
  });

  try {
    let status: NavigationInitializationStatus =
      await navigationController.init();
    if (status !== NavigationInitializationStatus.OK) {
      failTest(`navigationController.init() status: ${status}`);
    }
  } catch (error) {
    console.error('Error initializing navigator', error);
    failTest('navigationController.init() exception');
  }
};
