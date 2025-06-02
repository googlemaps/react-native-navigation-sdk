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

import { useState, useMemo, useReducer } from 'react';
import { Button, Text, View } from 'react-native';

import {
  type Circle,
  type GroundOverlay,
  type LatLng,
  type MapViewController,
  type Marker,
  type NavigationViewController,
  type Polygon,
  type Polyline,
  NavigationView,
  useNavigation,
} from '@googlemaps/react-native-navigation-sdk';
import styles from '../styles';
import OverlayModal from '../helpers/overlayModal';
import {
  testMapInitialization,
  testNavigationToSingleDestination,
  testNavigationSessionInitialization,
  testNavigationToMultipleDestination,
  testRouteSegments,
  testGetCurrentTimeAndDistance,
  testMoveCamera,
  testTiltZoomBearingCamera,
  testOnRemainingTimeOrDistanceChanged,
  testOnArrival,
  testOnRouteChanged,
  type TestTools,
} from './integration_tests/integration_test';
import {
  initialMapNavControlsState,
  mapNavControlsReducer,
} from '../controls/mapNavControlsReducer';

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
  const { navigationController } = useNavigation();
  const [detoxStepNumber, setDetoxStepNumber] = useState(0);
  const [failureMessage, setFailuremessage] = useState('');
  const [navigationViewController, setNavigationViewController] =
    useState<NavigationViewController | null>(null);
  const [mapNavControlsState, dispatchMapNavControls] = useReducer(
    mapNavControlsReducer,
    initialMapNavControlsState
  );

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

  const resetTestState = async () => {
    try {
      navigationController.removeAllListeners();
      await navigationController.cleanup();
    } catch (e) {}
    setActiveTestId('');
    setTestResult(TestResult.None);
    setTestStatus(TestRunStatus.NotRunning);
    setDetoxStepNumber(0);
    setFailuremessage('');
    dispatchMapNavControls({
      type: 'reset',
    });
  };

  const expectFalseError = (expectation: string) => {
    failTest(`Expected ${expectation} to be false but it was true`);
  };

  const expectTrueError = (expectation: string) => {
    failTest(`Expected ${expectation} to be true but it was false`);
  };

  const getTestTools = (): TestTools => {
    return {
      navigationController,
      mapViewController,
      navigationViewController,
      passTest,
      failTest,
      setDetoxStep,
      expectFalseError,
      expectTrueError,
      dispatchMapNavControls,
      mapNavControlsState,
    };
  };

  const runTest = async (testId: string) => {
    navigationController.removeAllListeners();
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
      case 'testOnRemainingTimeOrDistanceChanged':
        await testOnRemainingTimeOrDistanceChanged(getTestTools());
        break;
      case 'testOnArrival':
        await testOnArrival(getTestTools());
        break;
      case 'testOnRouteChanged':
        await testOnRouteChanged(getTestTools());
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

  return (
    <View style={styles.container}>
      <Text>See CONTRIBUTING.md to see how to run integration tests.</Text>
      <View style={{ flex: 6, margin: 5 }}>
        <NavigationView
          onMarkerClick={(marker: Marker) => {
            console.log('Map, onMarkerClick:', marker);
          }}
          onPolygonClick={(polygon: Polygon) => {
            console.log('Map, onPolygonClick:', polygon);
          }}
          onCircleClick={(circle: Circle) => {
            console.log('Map, onCircleClick:', circle);
          }}
          onPolylineClick={(polyline: Polyline) => {
            console.log('Map, onPolylineClick:', polyline);
          }}
          onMarkerInfoWindowTapped={(marker: Marker) => {
            console.log('Map, onMarkerInfoWindowTapped:', marker);
          }}
          onMapClick={(latLng: LatLng) => {
            console.log('Map, onMapClick:', latLng);
          }}
          onGroundOverlayClick={(groundOverlay: GroundOverlay) => {
            console.log('Map, onGroundOverlayClick:', groundOverlay);
          }}
          onMapReady={() => {
            console.log('Map, onMapReady');
          }}
          onRecenterButtonClick={() => {
            console.log('Map, onRecenterButtonClick');
          }}
          onMapViewControllerCreated={setMapViewController}
          onNavigationViewControllerCreated={setNavigationViewController}
          mapType={mapNavControlsState.mapType}
          mapPadding={mapNavControlsState.padding}
          mapToolbarEnabled={mapNavControlsState.mapToolbarEnabled}
          indoorEnabled={mapNavControlsState.indoorEnabled}
          myLocationEnabled={mapNavControlsState.myLocationEnabled}
          trafficEnabled={mapNavControlsState.trafficEnabled}
          compassEnabled={mapNavControlsState.compassEnabled}
          myLocationButtonEnabled={mapNavControlsState.myLocationButtonEnabled}
          buildingsEnabled={mapNavControlsState.buildingsEnabled}
          rotateGesturesEnabled={mapNavControlsState.rotateGesturesEnabled}
          scrollGesturesEnabled={mapNavControlsState.scrollGesturesEnabled}
          scrollGesturesEnabledDuringRotateOrZoom={
            mapNavControlsState.scrollGesturesEnabledDuringRotateOrZoom
          }
          tiltGesturesEnabled={mapNavControlsState.tiltGesturesEnabled}
          zoomControlsEnabled={mapNavControlsState.zoomControlsEnabled}
          zoomGesturesEnabled={mapNavControlsState.zoomGesturesEnabled}
          followingPerspective={mapNavControlsState.followingPerspective}
          nightMode={mapNavControlsState.nightMode}
          navigationUIEnabled={mapNavControlsState.navigationUIEnabled}
          tripProgressBarEnabled={mapNavControlsState.tripProgressBarEnabled}
          speedLimitIconEnabled={mapNavControlsState.speedLimitIconEnabled}
          speedometerEnabled={mapNavControlsState.speedometerEnabled}
          trafficIncidentsCardEnabled={
            mapNavControlsState.trafficIncidentsCardEnabled
          }
          reportIncidentButtonEnabled={
            mapNavControlsState.reportIncidentButtonEnabled
          }
          recenterButtonEnabled={mapNavControlsState.recenterButtonEnabled}
          headerEnabled={mapNavControlsState.headerEnabled}
          footerEnabled={mapNavControlsState.footerEnabled}
        />
      </View>
      <View style={{ flex: 4 }}>
        <Text>Selected testId: {activeTestId}</Text>
        <Text testID="test_status_label">Test status: {testStatusString}</Text>
        <Text testID="test_result_label">Test result: {testResult}</Text>
        <Text testID="failure_message_label">{failureMessage}</Text>
        <Button
          title="Reset"
          onPress={() => {
            resetTestState();
          }}
        />
      </View>
      <View style={styles.controlButtons}>
        <Button
          title="Tests"
          testID="tests_menu_button"
          onPress={() => {
            setIsOverlayOpen(true);
          }}
        />
      </View>
      <OverlayModal
        visible={isOverlayOpen}
        closeOverlay={() => {
          setIsOverlayOpen(false);
        }}
      >
        <Button
          title="testNavigationSessionInitialization"
          testID="testNavigationSessionInitialization"
          onPress={() => {
            runTest('testNavigationSessionInitialization');
          }}
        />
        <Button
          title="testMapInitialization"
          testID="testMapInitialization"
          onPress={() => {
            runTest('testMapInitialization');
          }}
        />
        <Button
          title="testNavigationToSingleDestination"
          testID="testNavigationToSingleDestination"
          onPress={() => {
            runTest('testNavigationToSingleDestination');
          }}
        />
        <Button
          title="testNavigationToMultipleDestination"
          testID="testNavigationToMultipleDestination"
          onPress={() => {
            runTest('testNavigationToMultipleDestination');
          }}
        />
        <Button
          title="testRouteSegments"
          testID="testRouteSegments"
          onPress={() => {
            runTest('testRouteSegments');
          }}
        />
        <Button
          title="testGetCurrentTimeAndDistance"
          testID="testGetCurrentTimeAndDistance"
          onPress={() => {
            runTest('testGetCurrentTimeAndDistance');
          }}
        />
        <Button
          title="testMoveCamera"
          testID="testMoveCamera"
          onPress={() => {
            runTest('testMoveCamera');
          }}
        />
        <Button
          title="testTiltZoomBearingCamera"
          testID="testTiltZoomBearingCamera"
          onPress={() => {
            runTest('testTiltZoomBearingCamera');
          }}
        />
        <Button
          title="testOnRemainingTimeOrDistanceChanged"
          testID="testOnRemainingTimeOrDistanceChanged"
          onPress={() => {
            runTest('testOnRemainingTimeOrDistanceChanged');
          }}
        />
        <Button
          title="testOnArrival"
          testID="testOnArrival"
          onPress={() => {
            runTest('testOnArrival');
          }}
        />
        <Button
          title="testOnRouteChanged"
          testID="testOnRouteChanged"
          onPress={() => {
            runTest('testOnRouteChanged');
          }}
        />
      </OverlayModal>
    </View>
  );
};

export default IntegrationTestsScreen;
