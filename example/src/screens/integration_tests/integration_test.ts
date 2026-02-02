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
  NavigationSessionStatus,
  type ArrivalEvent,
  type MapViewController,
  type NavigationController,
  type NavigationViewController,
  type TimeAndDistance,
} from '@googlemaps/react-native-navigation-sdk';
import { Platform } from 'react-native';
import { delay, roundDown } from './utils';

interface TestTools {
  navigationController: NavigationController;
  mapViewController: MapViewController | null;
  navigationViewController: NavigationViewController | null;
  setOnNavigationReady: (listener: (() => void) | null | undefined) => void;
  setOnArrival: (
    listener: ((arrivalEvent: ArrivalEvent) => void) | null | undefined
  ) => void;
  setOnRemainingTimeOrDistanceChanged: (
    listener: ((timeAndDistance: TimeAndDistance) => void) | null | undefined
  ) => void;
  setOnRouteChanged: (listener: (() => void) | null | undefined) => void;
  passTest: () => void;
  failTest: (message: string) => void;
  setDetoxStep: (stepNumber: number) => void;
  expectFalseError: (expectation: string) => void;
  expectTrueError: (expectation: string) => void;
  // UI settings setters for props-based testing
  setCompassEnabled: (enabled: boolean | undefined) => void;
  setRotateGesturesEnabled: (enabled: boolean | undefined) => void;
  setScrollGesturesEnabled: (enabled: boolean | undefined) => void;
  setScrollGesturesDuringRotateOrZoomEnabled: (
    enabled: boolean | undefined
  ) => void;
  setTiltGesturesEnabled: (enabled: boolean | undefined) => void;
  setZoomGesturesEnabled: (enabled: boolean | undefined) => void;
  setZoomControlsEnabled: (enabled: boolean | undefined) => void;
  setMapToolbarEnabled: (enabled: boolean | undefined) => void;
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

/**
 * Helper function to reset and show the ToS dialog.
 * This should be called at the start of tests that require ToS acceptance.
 * The dialog will block until the user (or Detox) accepts it.
 *
 * @param navigationController - The navigation controller
 * @param failTest - Function to call if acceptance fails
 * @returns true if ToS was accepted, false otherwise
 */
const acceptToS = async (
  navigationController: NavigationController,
  failTest: (message: string) => void
): Promise<boolean> => {
  // Reset ToS acceptance state to ensure dialog is shown
  await navigationController.resetTermsAccepted();

  // Show the ToS dialog - Detox will tap the accept button
  const accepted = await navigationController.showTermsAndConditionsDialog();

  if (!accepted) {
    failTest('Terms and Conditions were not accepted');
    return false;
  }

  return true;
};

/**
 * Helper function to initialize navigation after ToS is accepted.
 *
 * @param navigationController - The navigation controller
 * @param failTest - Function to call if initialization fails
 * @returns true if initialization succeeded, false otherwise
 */
const initializeNavigation = async (
  navigationController: NavigationController,
  failTest: (message: string) => void
): Promise<boolean> => {
  const status = await navigationController.init();
  if (status !== NavigationSessionStatus.OK) {
    failTest(`Navigation initialization failed with status: ${status}`);
    return false;
  }
  return true;
};

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
    setOnNavigationReady,
    passTest,
    failTest,
    expectTrueError,
  } = testTools;

  // Accept ToS first
  if (!(await acceptToS(navigationController, failTest))) {
    return;
  }

  const checkDefaults = async () => {
    // After successful init, terms should be accepted
    if (!(await navigationController.areTermsAccepted())) {
      return expectTrueError('navigationController.areTermsAccepted()');
    }
    passTest();
  };

  setOnNavigationReady(() => {
    disableVoiceGuidanceForTests(navigationController);
    checkDefaults();
  });

  // Now initialize navigation
  await initializeNavigation(navigationController, failTest);
};

export const testMapInitialization = async (testTools: TestTools) => {
  const {
    mapViewController,
    passTest,
    failTest,
    expectFalseError,
    setCompassEnabled,
    setRotateGesturesEnabled,
    setScrollGesturesEnabled,
    setScrollGesturesDuringRotateOrZoomEnabled,
    setTiltGesturesEnabled,
    setZoomGesturesEnabled,
    setZoomControlsEnabled,
    setMapToolbarEnabled,
  } = testTools;
  if (!mapViewController) {
    return failTest('mapViewController was expected to exist');
  }

  // Disable all UI settings via props
  setCompassEnabled(false);
  setRotateGesturesEnabled(false);
  setScrollGesturesEnabled(false);
  setScrollGesturesDuringRotateOrZoomEnabled(false);
  setTiltGesturesEnabled(false);
  setZoomGesturesEnabled(false);

  if (Platform.OS === 'android') {
    setZoomControlsEnabled(false);
    setMapToolbarEnabled(false);
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

  // Enable all UI settings via props
  setCompassEnabled(true);
  setRotateGesturesEnabled(true);
  setScrollGesturesEnabled(true);
  setScrollGesturesDuringRotateOrZoomEnabled(true);
  setTiltGesturesEnabled(true);
  setZoomGesturesEnabled(true);

  if (Platform.OS === 'android') {
    setZoomControlsEnabled(true);
    setMapToolbarEnabled(true);
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
  const {
    navigationController,
    setOnNavigationReady,
    setOnArrival,
    passTest,
    failTest,
  } = testTools;

  // Accept ToS first
  if (!(await acceptToS(navigationController, failTest))) {
    return;
  }

  setOnNavigationReady(async () => {
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
  });
  setOnArrival(async () => {
    navigationController.cleanup();
    return passTest();
  });
  await initializeNavigation(navigationController, failTest);
};

export const testNavigationToMultipleDestination = async (
  testTools: TestTools
) => {
  const {
    navigationController,
    setOnNavigationReady,
    setOnArrival,
    passTest,
    failTest,
  } = testTools;

  // Accept ToS first
  if (!(await acceptToS(navigationController, failTest))) {
    return;
  }

  let onArrivalCount = 0;
  setOnNavigationReady(async () => {
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
  });
  setOnArrival(async () => {
    onArrivalCount += 1;
    if (onArrivalCount > 1) {
      navigationController.cleanup();
      return passTest();
    }
    await navigationController.continueToNextDestination();
    await navigationController.simulator.simulateLocationsAlongExistingRoute({
      speedMultiplier: Platform.OS === 'ios' ? 5 : 10,
    });
  });

  await initializeNavigation(navigationController, failTest);
};

export const testRouteSegments = async (testTools: TestTools) => {
  const {
    navigationController,
    setOnNavigationReady,
    setOnArrival,
    passTest,
    failTest,
    expectFalseError,
  } = testTools;

  // Accept ToS first
  if (!(await acceptToS(navigationController, failTest))) {
    return;
  }
  let beginTraveledPath;
  setOnNavigationReady(async () => {
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
  });
  setOnArrival(async () => {
    const endTraveledPath = await navigationController.getTraveledPath();
    if (endTraveledPath.length <= beginTraveledPath.length) {
      return expectFalseError(
        'endTraveledPath.length <= beginTraveledPath.length'
      );
    }
    navigationController.cleanup();
    passTest();
  });
  await initializeNavigation(navigationController, failTest);
};

export const testGetCurrentTimeAndDistance = async (testTools: TestTools) => {
  const {
    navigationController,
    setOnNavigationReady,
    setOnArrival,
    passTest,
    failTest,
    expectFalseError,
  } = testTools;

  // Accept ToS first
  if (!(await acceptToS(navigationController, failTest))) {
    return;
  }

  let beginTimeAndDistance: TimeAndDistance | null = null;
  setOnNavigationReady(async () => {
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
  });
  setOnArrival(async () => {
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
  });
  await initializeNavigation(navigationController, failTest);
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

export const testMapMarkers = async (testTools: TestTools) => {
  const { mapViewController, passTest, failTest, expectFalseError } = testTools;
  if (!mapViewController) {
    return failTest('mapViewController was expected to exist');
  }

  // Test adding a marker
  const marker = await mapViewController.addMarker({
    position: { lat: 37.7749, lng: -122.4194 },
    title: 'San Francisco',
    snippet: 'Test marker snippet',
    alpha: 0.8,
    rotation: 45,
  });

  if (!marker.id) {
    return expectFalseError('marker.id should exist');
  }
  if (marker.position.lat !== 37.7749 || marker.position.lng !== -122.4194) {
    return expectFalseError('marker.position should match input');
  }
  if (marker.title !== 'San Francisco') {
    return expectFalseError('marker.title should be "San Francisco"');
  }

  // Test getMarkers returns the marker
  let markers = await mapViewController.getMarkers();
  if (markers.length !== 1) {
    return expectFalseError('getMarkers should return 1 marker');
  }
  if (markers[0]!.id !== marker.id) {
    return expectFalseError('getMarkers should return marker with correct id');
  }

  // Test updating marker with same ID (should update, not create new)
  const updatedMarker = await mapViewController.addMarker({
    id: marker.id,
    position: { lat: 37.7849, lng: -122.4294 },
    title: 'Updated San Francisco',
    snippet: 'Updated snippet',
    alpha: 1.0,
    rotation: 90,
  });

  if (updatedMarker.id !== marker.id) {
    return expectFalseError('updatedMarker.id should match original marker.id');
  }
  if (updatedMarker.title !== 'Updated San Francisco') {
    return expectFalseError(
      'updatedMarker.title should be "Updated San Francisco"'
    );
  }

  // Verify only one marker exists (update, not add)
  markers = await mapViewController.getMarkers();
  if (markers.length !== 1) {
    return expectFalseError(
      'getMarkers should still return 1 marker after update'
    );
  }

  // Test removing marker
  await mapViewController.removeMarker(marker.id);

  // Verify marker was removed
  markers = await mapViewController.getMarkers();
  if (markers.length !== 0) {
    return expectFalseError('getMarkers should return 0 markers after removal');
  }

  // Test adding marker with custom image
  const markerWithIcon = await mapViewController.addMarker({
    position: { lat: 37.7849, lng: -122.4094 },
    title: 'Marker with Icon',
    imgPath: 'circle.png',
  });

  if (!markerWithIcon.id) {
    return expectFalseError('markerWithIcon.id should exist');
  }
  await mapViewController.removeMarker(markerWithIcon.id);

  passTest();
};

export const testMapCircles = async (testTools: TestTools) => {
  const { mapViewController, passTest, failTest, expectFalseError } = testTools;
  if (!mapViewController) {
    return failTest('mapViewController was expected to exist');
  }

  // Test adding a circle
  const circle = await mapViewController.addCircle({
    center: { lat: 37.7749, lng: -122.4194 },
    radius: 1000,
    strokeWidth: 2,
    strokeColor: '#FF0000',
    fillColor: '#00FF0080',
    clickable: true,
  });

  if (!circle.id) {
    return expectFalseError('circle.id should exist');
  }
  if (circle.center.lat !== 37.7749 || circle.center.lng !== -122.4194) {
    return expectFalseError('circle.center should match input');
  }
  if (circle.radius !== 1000) {
    return expectFalseError('circle.radius should be 1000');
  }

  // Test getCircles returns the circle
  let circles = await mapViewController.getCircles();
  if (circles.length !== 1) {
    return expectFalseError('getCircles should return 1 circle');
  }
  if (circles[0]!.id !== circle.id) {
    return expectFalseError('getCircles should return circle with correct id');
  }

  // Test updating circle with same ID (should update, not create new)
  const updatedCircle = await mapViewController.addCircle({
    id: circle.id,
    center: { lat: 37.7849, lng: -122.4294 },
    radius: 2000,
    strokeWidth: 4,
    strokeColor: '#00FF00',
    fillColor: '#FF000080',
    clickable: false,
  });

  if (updatedCircle.id !== circle.id) {
    return expectFalseError('updatedCircle.id should match original circle.id');
  }
  if (updatedCircle.radius !== 2000) {
    return expectFalseError('updatedCircle.radius should be 2000');
  }

  // Verify only one circle exists (update, not add)
  circles = await mapViewController.getCircles();
  if (circles.length !== 1) {
    return expectFalseError(
      'getCircles should still return 1 circle after update'
    );
  }

  // Test removing circle
  await mapViewController.removeCircle(circle.id);

  // Verify circle was removed
  circles = await mapViewController.getCircles();
  if (circles.length !== 0) {
    return expectFalseError('getCircles should return 0 circles after removal');
  }

  passTest();
};

export const testMapPolylines = async (testTools: TestTools) => {
  const { mapViewController, passTest, failTest, expectFalseError } = testTools;
  if (!mapViewController) {
    return failTest('mapViewController was expected to exist');
  }

  // Test adding a polyline
  const polyline = await mapViewController.addPolyline({
    points: [
      { lat: 37.7749, lng: -122.4194 },
      { lat: 37.7849, lng: -122.4094 },
      { lat: 37.7949, lng: -122.3994 },
    ],
    width: 5,
    color: '#0000FF',
    clickable: true,
  });

  if (!polyline.id) {
    return expectFalseError('polyline.id should exist');
  }
  if (!polyline.points || polyline.points.length !== 3) {
    return expectFalseError('polyline.points should have 3 points');
  }

  // Test getPolylines returns the polyline
  let polylines = await mapViewController.getPolylines();
  if (polylines.length !== 1) {
    return expectFalseError('getPolylines should return 1 polyline');
  }
  if (polylines[0]!.id !== polyline.id) {
    return expectFalseError(
      'getPolylines should return polyline with correct id'
    );
  }

  // Test updating polyline with same ID (should update, not create new)
  const updatedPolyline = await mapViewController.addPolyline({
    id: polyline.id,
    points: [
      { lat: 37.7749, lng: -122.4194 },
      { lat: 37.7949, lng: -122.3994 },
    ],
    width: 10,
    color: '#FF0000',
    clickable: false,
  });

  if (updatedPolyline.id !== polyline.id) {
    return expectFalseError(
      'updatedPolyline.id should match original polyline.id'
    );
  }
  if (!updatedPolyline.points || updatedPolyline.points.length !== 2) {
    return expectFalseError('updatedPolyline.points should have 2 points');
  }

  // Verify only one polyline exists (update, not add)
  polylines = await mapViewController.getPolylines();
  if (polylines.length !== 1) {
    return expectFalseError(
      'getPolylines should still return 1 polyline after update'
    );
  }

  // Test removing polyline
  await mapViewController.removePolyline(polyline.id);

  // Verify polyline was removed
  polylines = await mapViewController.getPolylines();
  if (polylines.length !== 0) {
    return expectFalseError(
      'getPolylines should return 0 polylines after removal'
    );
  }

  passTest();
};

export const testMapPolygons = async (testTools: TestTools) => {
  const { mapViewController, passTest, failTest, expectFalseError } = testTools;
  if (!mapViewController) {
    return failTest('mapViewController was expected to exist');
  }

  // Test adding a polygon
  const polygon = await mapViewController.addPolygon({
    points: [
      { lat: 37.7749, lng: -122.4194 },
      { lat: 37.7849, lng: -122.4094 },
      { lat: 37.7849, lng: -122.4294 },
    ],
    holes: [],
    strokeWidth: 2,
    strokeColor: '#FF0000',
    fillColor: '#00FF0080',
    clickable: true,
    geodesic: false,
  });

  if (!polygon.id) {
    return expectFalseError('polygon.id should exist');
  }
  // Note: Android SDK may return 4 points (including closing point), iOS returns 3
  // We check for at least 3 points to account for platform differences
  if (!polygon.points || polygon.points.length < 3) {
    return expectFalseError('polygon.points should have at least 3 points');
  }

  // Test getPolygons returns the polygon
  let polygons = await mapViewController.getPolygons();
  if (polygons.length !== 1) {
    return expectFalseError('getPolygons should return 1 polygon');
  }
  if (polygons[0]!.id !== polygon.id) {
    return expectFalseError(
      'getPolygons should return polygon with correct id'
    );
  }

  // Test updating polygon with same ID (should update, not create new)
  const updatedPolygon = await mapViewController.addPolygon({
    id: polygon.id,
    points: [
      { lat: 37.7749, lng: -122.4194 },
      { lat: 37.7949, lng: -122.4094 },
      { lat: 37.7949, lng: -122.4394 },
      { lat: 37.7749, lng: -122.4394 },
    ],
    holes: [],
    strokeWidth: 4,
    strokeColor: '#00FF00',
    fillColor: '#FF000080',
    clickable: false,
    geodesic: true,
  });

  if (updatedPolygon.id !== polygon.id) {
    return expectFalseError(
      'updatedPolygon.id should match original polygon.id'
    );
  }
  // Note: Android SDK may return 5 points (including closing point), iOS returns 4
  // We check for at least 4 points to account for platform differences
  if (!updatedPolygon.points || updatedPolygon.points.length < 4) {
    return expectFalseError(
      'updatedPolygon.points should have at least 4 points'
    );
  }

  // Verify only one polygon exists (update, not add)
  polygons = await mapViewController.getPolygons();
  if (polygons.length !== 1) {
    return expectFalseError(
      'getPolygons should still return 1 polygon after update'
    );
  }

  // Test removing polygon
  await mapViewController.removePolygon(polygon.id);

  // Verify polygon was removed
  polygons = await mapViewController.getPolygons();
  if (polygons.length !== 0) {
    return expectFalseError(
      'getPolygons should return 0 polygons after removal'
    );
  }

  passTest();
};

export const testMapGroundOverlays = async (testTools: TestTools) => {
  const { mapViewController, passTest, failTest, expectFalseError } = testTools;
  if (!mapViewController) {
    return failTest('mapViewController was expected to exist');
  }

  // Test adding ground overlay with position-based method
  const overlayWithPosition = await mapViewController.addGroundOverlay({
    imgPath: 'circle.png',
    location: { lat: 37.7749, lng: -122.4194 },
    width: 1000, // meters
    height: 1000, // meters
    zoomLevel: 14, // for iOS
    bearing: 0,
    transparency: 0,
    clickable: true,
  });

  if (!overlayWithPosition.id) {
    return expectFalseError('overlayWithPosition.id should exist');
  }

  // Test getGroundOverlays returns the overlay
  let overlays = await mapViewController.getGroundOverlays();
  if (overlays.length !== 1) {
    return expectFalseError('getGroundOverlays should return 1 overlay');
  }
  if (overlays[0]!.id !== overlayWithPosition.id) {
    return expectFalseError(
      'getGroundOverlays should return overlay with correct id'
    );
  }

  // Test removing ground overlay
  await mapViewController.removeGroundOverlay(overlayWithPosition.id);

  // Verify overlay was removed
  overlays = await mapViewController.getGroundOverlays();
  if (overlays.length !== 0) {
    return expectFalseError(
      'getGroundOverlays should return 0 overlays after removal'
    );
  }

  // Test adding ground overlay with bounds-based method
  const overlayWithBounds = await mapViewController.addGroundOverlay({
    imgPath: 'circle.png',
    bounds: {
      northEast: { lat: 37.78, lng: -122.41 },
      southWest: { lat: 37.77, lng: -122.43 },
    },
    bearing: 45,
    transparency: 0.2,
    clickable: true,
  });

  if (!overlayWithBounds.id) {
    return expectFalseError('overlayWithBounds.id should exist');
  }
  if (!overlayWithBounds.bounds) {
    return expectFalseError('overlayWithBounds.bounds should exist');
  }

  // Test updating ground overlay with same ID (note: position/bounds cannot be
  // changed, so this will recreate the overlay)
  const updatedOverlay = await mapViewController.addGroundOverlay({
    id: overlayWithBounds.id,
    imgPath: 'circle.png',
    bounds: {
      northEast: { lat: 37.79, lng: -122.4 },
      southWest: { lat: 37.76, lng: -122.44 },
    },
    bearing: 90,
    transparency: 0.5,
    clickable: false,
  });

  if (updatedOverlay.id !== overlayWithBounds.id) {
    return expectFalseError(
      'updatedOverlay.id should match original overlay id'
    );
  }

  // Verify only one overlay exists
  overlays = await mapViewController.getGroundOverlays();
  if (overlays.length !== 1) {
    return expectFalseError(
      'getGroundOverlays should return 1 overlay after update'
    );
  }

  // Test removing ground overlay
  await mapViewController.removeGroundOverlay(overlayWithBounds.id);

  passTest();
};

export const testOnRemainingTimeOrDistanceChanged = async (
  testTools: TestTools
) => {
  const {
    navigationController,
    setOnNavigationReady,
    setOnRemainingTimeOrDistanceChanged,
    passTest,
    failTest,
  } = testTools;

  // Accept ToS first
  if (!(await acceptToS(navigationController, failTest))) {
    return;
  }

  setOnRemainingTimeOrDistanceChanged(async timeAndDistance => {
    if (timeAndDistance.meters > 0 && timeAndDistance.seconds > 0) {
      navigationController.cleanup();
      return passTest();
    }
  });

  setOnNavigationReady(async () => {
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
  });

  await initializeNavigation(navigationController, failTest);
};

export const testOnArrival = async (testTools: TestTools) => {
  const {
    navigationController,
    setOnNavigationReady,
    setOnArrival,
    passTest,
    failTest,
  } = testTools;

  // Accept ToS first
  if (!(await acceptToS(navigationController, failTest))) {
    return;
  }

  setOnArrival(async () => {
    navigationController.cleanup();
    passTest();
  });
  setOnNavigationReady(async () => {
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
  });

  await initializeNavigation(navigationController, failTest);
};

export const testOnRouteChanged = async (testTools: TestTools) => {
  const {
    navigationController,
    setOnNavigationReady,
    setOnRouteChanged,
    passTest,
    failTest,
  } = testTools;

  // Accept ToS first
  if (!(await acceptToS(navigationController, failTest))) {
    return;
  }
  setOnRouteChanged(async () => {
    navigationController.cleanup();
    passTest();
  });
  setOnNavigationReady(async () => {
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
  });
  await initializeNavigation(navigationController, failTest);
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
  const { navigationController, setOnNavigationReady, passTest, failTest } =
    testTools;

  // Accept ToS first
  if (!(await acceptToS(navigationController, failTest))) {
    return;
  }

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

  setOnNavigationReady(async () => {
    disableVoiceGuidanceForTests(navigationController);
    if (!(await expectNoDestinationsError())) {
      return;
    }

    try {
      await navigationController.cleanup();
    } catch (error) {
      console.error('Cleanup failed', error);
      failTest('navigationController.cleanup() failed');
      return;
    }

    passTest();
  });
  await initializeNavigation(navigationController, failTest);
};

/**
 * Tests that providing both routingOptions and routeTokenOptions
 * throws an error.
 * These options are mutually exclusive and should not be used together.
 */
export const testRouteTokenOptionsValidation = async (testTools: TestTools) => {
  const { navigationController, setOnNavigationReady, passTest, failTest } =
    testTools;

  // Accept ToS first
  if (!(await acceptToS(navigationController, failTest))) {
    return;
  }

  setOnNavigationReady(async () => {
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
          console.error('Cleanup failed', cleanupError);
        }
        passTest();
      } else {
        failTest(`Unexpected error: ${error}`);
      }
    }
  });
  await initializeNavigation(navigationController, failTest);
};
