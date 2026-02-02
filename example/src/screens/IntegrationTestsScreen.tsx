/* eslint-disable react-native/no-inline-styles */
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

import React, { useState, useMemo, useCallback } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { ExampleAppButton } from '../controls/ExampleAppButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  type Circle,
  type LatLng,
  type MapViewController,
  type Marker,
  type NavigationViewController,
  type Polygon,
  type Polyline,
  NavigationView,
  useNavigation,
} from '@googlemaps/react-native-navigation-sdk';
import { CommonStyles, ControlStyles } from '../styles/components';
import OverlayModal from '../helpers/overlayModal';
import { showSnackbar } from '../helpers/snackbar';
import {
  testMapInitialization,
  testNavigationToSingleDestination,
  testNavigationSessionInitialization,
  testNavigationToMultipleDestination,
  testRouteSegments,
  testGetCurrentTimeAndDistance,
  testMoveCamera,
  testTiltZoomBearingCamera,
  testMapMarkers,
  testMapCircles,
  testMapPolylines,
  testMapPolygons,
  testMapGroundOverlays,
  testOnRemainingTimeOrDistanceChanged,
  testOnArrival,
  testOnRouteChanged,
  testNavigationStateGuards,
  testStartGuidanceWithoutDestinations,
  testRouteTokenOptionsValidation,
  NO_ERRORS_DETECTED_LABEL,
} from './integration_tests/integration_test';

enum TestRunStatus {
  NotRunning = 'Not running',
  TestRunning = 'Running...',
  WaitForDetox = 'Wait For Detox...',
  Finished = 'Finished',
}

enum TestResult {
  None = 'None',
  Success = 'Success',
  Failure = 'Failure',
}

const IntegrationTestsScreen = () => {
  const [mapViewController, setMapViewController] =
    useState<MapViewController | null>(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [activeTestId, setActiveTestId] = useState('');
  const [testStatus, setTestStatus] = useState<TestRunStatus>(
    TestRunStatus.NotRunning
  );
  const [testResult, setTestResult] = useState<TestResult>(TestResult.None);

  // Get navigationController and listener setters from useNavigation hook
  const {
    navigationController,
    setOnNavigationReady,
    setOnArrival,
    setOnRemainingTimeOrDistanceChanged,
    setOnRouteChanged,
  } = useNavigation();

  const [detoxStepNumber, setDetoxStepNumber] = useState(0);
  const [failureMessage, setFailuremessage] = useState(
    NO_ERRORS_DETECTED_LABEL
  );
  const [navigationViewController, setNavigationViewController] =
    useState<NavigationViewController | null>(null);
  const insets = useSafeAreaInsets();
  const windowDimensions = useWindowDimensions();

  // UI Settings state for props-based testing
  const [compassEnabled, setCompassEnabled] = useState<boolean | undefined>(
    undefined
  );
  const [rotateGesturesEnabled, setRotateGesturesEnabled] = useState<
    boolean | undefined
  >(undefined);
  const [scrollGesturesEnabled, setScrollGesturesEnabled] = useState<
    boolean | undefined
  >(undefined);
  const [
    scrollGesturesDuringRotateOrZoomEnabled,
    setScrollGesturesDuringRotateOrZoomEnabled,
  ] = useState<boolean | undefined>(undefined);
  const [tiltGesturesEnabled, setTiltGesturesEnabled] = useState<
    boolean | undefined
  >(undefined);
  const [zoomGesturesEnabled, setZoomGesturesEnabled] = useState<
    boolean | undefined
  >(undefined);
  const [zoomControlsEnabled, setZoomControlsEnabled] = useState<
    boolean | undefined
  >(undefined);
  const [mapToolbarEnabled, setMapToolbarEnabled] = useState<
    boolean | undefined
  >(undefined);

  const onMapReady = useCallback(async () => {
    try {
      // await navigationController.init();
    } catch (error) {
      console.error('Error initializing navigator', error);
      showSnackbar('Error initializing navigator');
    }
  }, []);

  const onMarkerClick = useCallback(
    (marker: Marker) => {
      showSnackbar('Marker clicked, removing...');
      mapViewController?.removeMarker(marker.id);
    },
    [mapViewController]
  );

  const onPolygonClick = useCallback(
    (polygon: Polygon) => {
      showSnackbar('Polygon clicked, removing...');
      mapViewController?.removePolygon(polygon.id);
    },
    [mapViewController]
  );

  const onCircleClick = useCallback(
    (circle: Circle) => {
      showSnackbar('Circle clicked, removing...');
      mapViewController?.removeCircle(circle.id);
    },
    [mapViewController]
  );

  const onPolylineClick = useCallback(
    (polyline: Polyline) => {
      showSnackbar('Polyline clicked, removing...');
      mapViewController?.removePolyline(polyline.id);
    },
    [mapViewController]
  );

  const onMarkerInfoWindowTapped = useCallback((_marker: Marker) => {
    showSnackbar('Marker info window tapped');
  }, []);

  const onMapClick = useCallback((latLng: LatLng) => {
    showSnackbar(
      `Clicked at ${latLng.lat.toFixed(4)}, ${latLng.lng.toFixed(4)}`
    );
  }, []);

  const passTest = () => {
    setTestStatus(TestRunStatus.Finished);
    setTestResult(TestResult.Success);
  };

  const failTest = (message: string) => {
    setTestStatus(TestRunStatus.Finished);
    setTestResult(TestResult.Failure);
    setFailuremessage(message);
  };

  const setDetoxStep = (stepNumber: number) => {
    setDetoxStepNumber(stepNumber);
    setTestStatus(TestRunStatus.WaitForDetox);
  };

  const resetTestState = () => {
    setActiveTestId('');
    setTestResult(TestResult.None);
    setTestStatus(TestRunStatus.NotRunning);
    setDetoxStepNumber(0);
    setFailuremessage('');
  };

  const expectFalseError = (expectation: string) => {
    failTest(`Expected ${expectation} to be false but it was true`);
  };

  const expectTrueError = (expectation: string) => {
    failTest(`Expected ${expectation} to be true but it was false`);
  };

  const getTestTools = () => {
    return {
      navigationController,
      mapViewController,
      navigationViewController,
      setOnNavigationReady,
      setOnArrival,
      setOnRemainingTimeOrDistanceChanged,
      setOnRouteChanged,
      passTest,
      failTest,
      setDetoxStep,
      expectFalseError,
      expectTrueError,
      // UI settings setters for props-based testing
      setCompassEnabled,
      setRotateGesturesEnabled,
      setScrollGesturesEnabled,
      setScrollGesturesDuringRotateOrZoomEnabled,
      setTiltGesturesEnabled,
      setZoomGesturesEnabled,
      setZoomControlsEnabled,
      setMapToolbarEnabled,
    };
  };

  const runTest = async (testId: string) => {
    setIsOverlayOpen(false);
    setActiveTestId(testId);
    setTestResult(TestResult.None);
    setTestStatus(TestRunStatus.TestRunning);
    switch (testId) {
      case 'testNavigationSessionInitialization':
        await testNavigationSessionInitialization(getTestTools());
        break;
      case 'testMapInitialization':
        await testMapInitialization(getTestTools());
        break;
      case 'testNavigationToSingleDestination':
        await testNavigationToSingleDestination(getTestTools());
        break;
      case 'testNavigationToMultipleDestination':
        await testNavigationToMultipleDestination(getTestTools());
        break;
      case 'testRouteSegments':
        await testRouteSegments(getTestTools());
        break;
      case 'testGetCurrentTimeAndDistance':
        await testGetCurrentTimeAndDistance(getTestTools());
        break;
      case 'testMoveCamera':
        await testMoveCamera(getTestTools());
        break;
      case 'testTiltZoomBearingCamera':
        await testTiltZoomBearingCamera(getTestTools());
        break;
      case 'testMapMarkers':
        await testMapMarkers(getTestTools());
        break;
      case 'testMapCircles':
        await testMapCircles(getTestTools());
        break;
      case 'testMapPolylines':
        await testMapPolylines(getTestTools());
        break;
      case 'testMapPolygons':
        await testMapPolygons(getTestTools());
        break;
      case 'testMapGroundOverlays':
        await testMapGroundOverlays(getTestTools());
        break;
      case 'testOnRemainingTimeOrDistanceChanged':
        await testOnRemainingTimeOrDistanceChanged(getTestTools());
        break;
      case 'testOnArrival':
        await testOnArrival(getTestTools());
        break;
      case 'testOnRouteChanged':
        await testOnRouteChanged(getTestTools());
        break;
      case 'testNavigationStateGuards':
        await testNavigationStateGuards(getTestTools());
        break;
      case 'testStartGuidanceWithoutDestinations':
        await testStartGuidanceWithoutDestinations(getTestTools());
        break;
      case 'testRouteTokenOptionsValidation':
        await testRouteTokenOptionsValidation(getTestTools());
        break;
      default:
        resetTestState();
        break;
    }
  };

  const testStatusString = useMemo(() => {
    if (testStatus === TestRunStatus.WaitForDetox) {
      return 'Step' + ' #' + detoxStepNumber;
    }
    return testStatus;
  }, [testStatus, detoxStepNumber]);

  const overlayMinHeight = useMemo(() => {
    return Math.max(0, windowDimensions.height - insets.top - insets.bottom);
  }, [windowDimensions.height, insets.top, insets.bottom]);

  return (
    <View style={[CommonStyles.container, { paddingBottom: insets.bottom }]}>
      <Text>See CONTRIBUTING.md to see how to run integration tests.</Text>
      <View style={{ flex: 6, margin: 5 }}>
        <NavigationView
          onMapReady={onMapReady}
          onMarkerClick={onMarkerClick}
          onPolygonClick={onPolygonClick}
          onCircleClick={onCircleClick}
          onPolylineClick={onPolylineClick}
          onMarkerInfoWindowTapped={onMarkerInfoWindowTapped}
          onMapClick={onMapClick}
          onMapViewControllerCreated={setMapViewController}
          onNavigationViewControllerCreated={setNavigationViewController}
          compassEnabled={compassEnabled}
          rotateGesturesEnabled={rotateGesturesEnabled}
          scrollGesturesEnabled={scrollGesturesEnabled}
          scrollGesturesDuringRotateOrZoomEnabled={
            scrollGesturesDuringRotateOrZoomEnabled
          }
          tiltGesturesEnabled={tiltGesturesEnabled}
          zoomGesturesEnabled={zoomGesturesEnabled}
          zoomControlsEnabled={zoomControlsEnabled}
          mapToolbarEnabled={mapToolbarEnabled}
        />
      </View>
      <View style={{ flex: 4 }}>
        <Text>Selected testId: {activeTestId}</Text>
        <Text testID="test_status_label">Test status: {testStatusString}</Text>
        <Text testID="test_result_label">Test result: {testResult}</Text>
        <Text testID="failure_message_label">{failureMessage}</Text>
        <ExampleAppButton
          title="Reset"
          onPress={() => {
            resetTestState();
          }}
        />
      </View>
      <View style={ControlStyles.controlButtons}>
        <ExampleAppButton
          title="Tests"
          onPress={() => {
            setIsOverlayOpen(true);
          }}
          testID="tests_menu_button"
        />
      </View>
      <OverlayModal
        visible={isOverlayOpen}
        closeOverlay={() => {
          setIsOverlayOpen(false);
        }}
        height={overlayMinHeight}
      >
        <ExampleAppButton
          title="testNavigationSessionInitialization"
          onPress={() => {
            runTest('testNavigationSessionInitialization');
          }}
          testID="testNavigationSessionInitialization"
        />
        <ExampleAppButton
          title="testMapInitialization"
          onPress={() => {
            runTest('testMapInitialization');
          }}
          testID="testMapInitialization"
        />
        <ExampleAppButton
          title="testNavigationToSingleDestination"
          onPress={() => {
            runTest('testNavigationToSingleDestination');
          }}
          testID="testNavigationToSingleDestination"
        />
        <ExampleAppButton
          title="testNavigationToMultipleDestination"
          onPress={() => {
            runTest('testNavigationToMultipleDestination');
          }}
          testID="testNavigationToMultipleDestination"
        />
        <ExampleAppButton
          title="testRouteSegments"
          onPress={() => {
            runTest('testRouteSegments');
          }}
          testID="testRouteSegments"
        />
        <ExampleAppButton
          title="testGetCurrentTimeAndDistance"
          onPress={() => {
            runTest('testGetCurrentTimeAndDistance');
          }}
          testID="testGetCurrentTimeAndDistance"
        />
        <ExampleAppButton
          title="testMoveCamera"
          onPress={() => {
            runTest('testMoveCamera');
          }}
          testID="testMoveCamera"
        />
        <ExampleAppButton
          title="testTiltZoomBearingCamera"
          onPress={() => {
            runTest('testTiltZoomBearingCamera');
          }}
          testID="testTiltZoomBearingCamera"
        />
        <ExampleAppButton
          title="testMapMarkers"
          onPress={() => {
            runTest('testMapMarkers');
          }}
          testID="testMapMarkers"
        />
        <ExampleAppButton
          title="testMapCircles"
          onPress={() => {
            runTest('testMapCircles');
          }}
          testID="testMapCircles"
        />
        <ExampleAppButton
          title="testMapPolylines"
          onPress={() => {
            runTest('testMapPolylines');
          }}
          testID="testMapPolylines"
        />
        <ExampleAppButton
          title="testMapPolygons"
          onPress={() => {
            runTest('testMapPolygons');
          }}
          testID="testMapPolygons"
        />
        <ExampleAppButton
          title="testMapGroundOverlays"
          onPress={() => {
            runTest('testMapGroundOverlays');
          }}
          testID="testMapGroundOverlays"
        />
        <ExampleAppButton
          title="testOnRemainingTimeOrDistanceChanged"
          onPress={() => {
            runTest('testOnRemainingTimeOrDistanceChanged');
          }}
          testID="testOnRemainingTimeOrDistanceChanged"
        />
        <ExampleAppButton
          title="testOnArrival"
          onPress={() => {
            runTest('testOnArrival');
          }}
          testID="testOnArrival"
        />
        <ExampleAppButton
          title="testOnRouteChanged"
          onPress={() => {
            runTest('testOnRouteChanged');
          }}
          testID="testOnRouteChanged"
        />
        <ExampleAppButton
          title="testNavigationStateGuards"
          onPress={() => {
            runTest('testNavigationStateGuards');
          }}
          testID="testNavigationStateGuards"
        />
        <ExampleAppButton
          title="testStartGuidanceWithoutDestinations"
          onPress={() => {
            runTest('testStartGuidanceWithoutDestinations');
          }}
          testID="testStartGuidanceWithoutDestinations"
        />
        <ExampleAppButton
          title="testRouteTokenOptionsValidation"
          onPress={() => {
            runTest('testRouteTokenOptionsValidation');
          }}
          testID="testRouteTokenOptionsValidation"
        />
      </OverlayModal>
    </View>
  );
};

export default IntegrationTestsScreen;
