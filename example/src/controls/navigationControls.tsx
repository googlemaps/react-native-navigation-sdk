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

import React, { useState } from 'react';
import { Alert, Button, Switch, Text, TextInput, View } from 'react-native';
import {
  CameraPerspective,
  type NavigationViewController,
  type RoutingOptions,
  TravelMode,
  type Waypoint,
  type CameraPosition,
  type NavigationController,
  type DisplayOptions,
  RouteStatus,
} from '@googlemaps/react-native-navigation-sdk';
import SelectDropdown from 'react-native-select-dropdown';

import {
  type MapNavControlsState,
  type MapNavControlsAction,
} from './mapNavControlsReducer';
import styles from '../styles';

export interface NavigationControlsProps {
  readonly navigationController: NavigationController;
  readonly navigationViewController: NavigationViewController;
  readonly onNavigationDispose?: () => void;
  readonly getCameraPosition: undefined | (() => Promise<CameraPosition>);
  readonly state: MapNavControlsState;
  readonly dispatch: React.Dispatch<MapNavControlsAction>;
  readonly onRouteStatusResult: (status: RouteStatus) => void;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  navigationController,
  navigationViewController,
  onNavigationDispose,
  getCameraPosition,
  state: {
    navigationUIEnabled,
    tripProgressBarEnabled,
    speedLimitIconEnabled,
    speedometerEnabled,
    trafficIncidentsCardEnabled,
    reportIncidentButtonEnabled,
    recenterButtonEnabled,
    headerEnabled,
    footerEnabled,
    followingPerspective,
    nightMode,
  },
  dispatch,
  onRouteStatusResult,
}) => {
  const perspectiveOptions = ['Tilted', 'North up', 'Heading up'];
  const nightModeOptions = ['Auto', 'Force Day', 'Force Night'];
  const audioGuidanceOptions = ['Silent', 'Alerts only', 'Alerts and guidance'];
  const [latitude, onLatChanged] = useState('');
  const [longitude, onLngChanged] = useState('');

  const disposeNavigation = async () => {
    try {
      await navigationController.cleanup();
      if (onNavigationDispose) {
        onNavigationDispose();
      }
    } catch (e) {
      console.error('Error cleaning up navigation controller:', e);
    }
  };

  // single destination:
  const initWaypoint = async () => {
    if (!latitude.trim() || !longitude.trim()) {
      Alert.alert('Set lat lng values first');
      return;
    }
    const waypoint: Waypoint = {
      title: 'Town hall',
      position: {
        lat: Number(latitude),
        lng: Number(longitude),
      },
    };

    const routingOptions: RoutingOptions = {
      travelMode: TravelMode.DRIVING,
      avoidFerries: true,
      avoidTolls: false,
    };

    const displayOptions: DisplayOptions = {
      showDestinationMarkers: true,
      showStopSigns: true,
      showTrafficLights: true,
    };

    navigationController.setDestination(
      waypoint,
      routingOptions,
      displayOptions
    );
  };

  const setLocationFromCameraLocation = async () => {
    if (getCameraPosition) {
      const cameraPosition = await getCameraPosition();
      if (cameraPosition) {
        onLatChanged(cameraPosition.target.lat.toString());
        onLngChanged(cameraPosition.target.lng.toString());
      }
    }
  };

  const initWaypoints = async () => {
    const wp1 = {
      placeId: 'ChIJw____96GhYARCVVwg5cT7c0', // Golden gate, SF
    };
    const wp2 = {
      placeId: 'ChIJkXCsHWSAhYARsGBBQYcj-V0', // 1 Market st, SF
    };

    const waypoints = [wp1, wp2];

    const routingOptions: RoutingOptions = {
      travelMode: TravelMode.DRIVING,
      avoidFerries: true,
      avoidTolls: false,
    };

    const displayOptions: DisplayOptions = {
      showDestinationMarkers: true,
      showStopSigns: true,
      showTrafficLights: true,
    };

    const routeStatus = await navigationController.setDestinations(
      waypoints,
      routingOptions,
      displayOptions
    );
    console.log('Route status: ', routeStatus);
    onRouteStatusResult(routeStatus);
  };

  const continueToNextDestination = () => {
    navigationController.continueToNextDestination();
  };

  const startGuidance = async () => {
    return navigationController.startGuidance();
  };

  const stopGuidance = async () => {
    return navigationController.stopGuidance();
  };

  const clearDestinations = async () => {
    return navigationController.clearDestinations();
  };

  const startSimulation = async () => {
    return navigationController.simulator.simulateLocationsAlongExistingRoute({
      speedMultiplier: 5,
    });
  };

  const stopSimulation = async () => {
    return navigationController.simulator.stopLocationSimulation();
  };

  const pauseSimulation = async () => {
    return navigationController.simulator.pauseLocationSimulation();
  };

  const resumeSimulation = async () => {
    return navigationController.simulator.resumeLocationSimulation();
  };

  const simulateLocation = async () => {
    if (!latitude.trim() || !longitude.trim()) {
      Alert.alert('Set lat lng values first');
      return;
    }

    return navigationController.simulator.simulateLocation({
      lat: Number(latitude),
      lng: Number(longitude),
    });
  };

  const showRouteOverview = () => {
    console.log('showRouteOverview');
    navigationViewController.showRouteOverview();
  };

  const setAudioGuidanceType = (index: number) => {
    console.log('setAudioGuidanceType: ', index);
    navigationController.setAudioGuidanceType(index);
  };

  const getCurrentRouteSegment = async () => {
    const result = await navigationController.getCurrentRouteSegment();
    console.log(result);
  };

  const getRouteSegments = async () => {
    const result = await navigationController.getRouteSegments();
    console.log(result);
  };

  const getTraveledPath = async () => {
    const result = await navigationController.getTraveledPath();
    console.log(result);
  };

  const getCurrentTimeAndDistanceClicked = async () => {
    const result = await navigationController.getCurrentTimeAndDistance();
    console.log(result);
  };

  const startUpdatingLocation = async () => {
    return navigationController.startUpdatingLocation();
  };

  const stopUpdatingLocation = async () => {
    return navigationController.stopUpdatingLocation();
  };

  const getNavSDKVersion = async () => {
    console.log(await navigationController.getNavSDKVersion());
  };

  const getAreTermsAccepted = async () => {
    console.log(await navigationController.areTermsAccepted());
  };

  const setSpeedAlertOptions = () => {
    navigationController.setSpeedAlertOptions({
      minorSpeedAlertPercentThreshold: 1,
      majorSpeedAlertPercentThreshold: 50,
      severityUpgradeDurationSeconds: 5,
    });
  };

  return (
    <View>
      <Text>Target</Text>
      <TextInput
        style={styles.input}
        onChangeText={onLatChanged}
        value={latitude}
        placeholder="Latitude"
        placeholderTextColor="#000"
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        onChangeText={onLngChanged}
        value={longitude}
        placeholder="Longitude"
        placeholderTextColor="#000"
        keyboardType="numeric"
      />
      <Button
        title="Set target from Camera Location"
        onPress={setLocationFromCameraLocation}
      />
      <Button
        title="Simulate location from target"
        onPress={simulateLocation}
      />
      <Button title="Set target as Destination" onPress={initWaypoint} />
      <View style={styles.controlButtonGap} />
      <Button title="Multiple Destination" onPress={initWaypoints} />
      <Button title="Dispose navigation" onPress={disposeNavigation} />
      <Button
        title="Continue to next destination"
        onPress={continueToNextDestination}
      />
      <Button title="Clear Destination" onPress={clearDestinations} />
      <Button title="Start guidance" onPress={startGuidance} />
      <Button title="Stop guidance" onPress={stopGuidance} />
      <Button title="Start updating location" onPress={startUpdatingLocation} />
      <Button title="Stop updating location" onPress={stopUpdatingLocation} />
      <Button title="Start simulation" onPress={startSimulation} />
      <Button title="Stop simulation" onPress={stopSimulation} />
      <Button title="Pause simulation" onPress={pauseSimulation} />
      <Button title="Resume simulation" onPress={resumeSimulation} />
      <Button title="Show route overview" onPress={showRouteOverview} />
      <Button title="NavSDK version" onPress={getNavSDKVersion} />
      <Button title="Are terms accepted?" onPress={getAreTermsAccepted} />
      <Button title="Set speed alert options" onPress={setSpeedAlertOptions} />
      <Button
        title="Get current time and distance"
        onPress={getCurrentTimeAndDistanceClicked}
      />
      <Button
        title="Get current route segment"
        onPress={getCurrentRouteSegment}
      />
      <Button title="Get route segments" onPress={getRouteSegments} />
      <Button title="Get traveled path" onPress={getTraveledPath} />
      <View style={styles.rowContainer}>
        <Text>Navigation UI</Text>
        <Switch
          value={navigationUIEnabled}
          onValueChange={(v) =>
            dispatch({ type: 'setNavigationUIEnabled', value: v })
          }
        />
      </View>
      <View style={styles.rowContainer}>
        <Text>Trip progress</Text>
        <Switch
          value={tripProgressBarEnabled}
          onValueChange={(v) =>
            dispatch({ type: 'setTripProgressBarEnabled', value: v })
          }
        />
      </View>
      <View style={styles.rowContainer}>
        <Text>Speed limit icon</Text>
        <Switch
          value={speedLimitIconEnabled}
          onValueChange={(v) =>
            dispatch({ type: 'setSpeedLimitIconEnabled', value: v })
          }
        />
      </View>
      <View style={styles.rowContainer}>
        <Text>Speedometer</Text>
        <Switch
          value={speedometerEnabled}
          onValueChange={(v) =>
            dispatch({ type: 'setSpeedometerEnabled', value: v })
          }
        />
      </View>
      <View style={styles.rowContainer}>
        <Text>Traffic incidents card</Text>
        <Switch
          value={trafficIncidentsCardEnabled}
          onValueChange={(v) =>
            dispatch({ type: 'setTrafficIncidentsCardEnabled', value: v })
          }
        />
      </View>
      <View style={styles.rowContainer}>
        <Text>Report incident button</Text>
        <Switch
          value={reportIncidentButtonEnabled}
          onValueChange={(v) =>
            dispatch({ type: 'setReportIncidentButtonEnabled', value: v })
          }
        />
      </View>
      <View style={styles.rowContainer}>
        <Text>Recenter button</Text>
        <Switch
          value={recenterButtonEnabled}
          onValueChange={(v) =>
            dispatch({ type: 'setRecenterButtonEnabled', value: v })
          }
        />
      </View>
      <View style={styles.rowContainer}>
        <Text>Header enabled</Text>
        <Switch
          value={headerEnabled}
          onValueChange={(v) =>
            dispatch({ type: 'setHeaderEnabled', value: v })
          }
        />
      </View>
      <View style={styles.rowContainer}>
        <Text>Footer enabled</Text>
        <Switch
          value={footerEnabled}
          onValueChange={(v) =>
            dispatch({ type: 'setFooterEnabled', value: v })
          }
        />
      </View>
      <View style={styles.rowContainer}>
        <Text>Night mode</Text>
        <SelectDropdown
          data={nightModeOptions}
          defaultValue={nightModeOptions[nightMode]}
          onSelect={(_selectedItem, index) => {
            dispatch({ type: 'setNightMode', value: index });
          }}
          renderButton={(selectedItem, _isOpened) => {
            return (
              <View style={styles.dropdownButtonStyle}>
                <Text style={styles.dropdownButtonTxtStyle}>
                  {selectedItem || 'Select'}
                </Text>
              </View>
            );
          }}
          renderItem={(item, _index, isSelected) => {
            return (
              <View
                style={{
                  ...styles.dropdownItemStyle,
                  ...(isSelected && { backgroundColor: '#D2D9DF' }),
                }}
              >
                <Text style={styles.dropdownItemTxtStyle}>{item}</Text>
              </View>
            );
          }}
          dropdownStyle={styles.dropdownMenuStyle}
        />
      </View>
      <View style={styles.rowContainer}>
        <Text>Audio guidance type</Text>
        <SelectDropdown
          data={audioGuidanceOptions}
          onSelect={(_selectedItem, index) => {
            setAudioGuidanceType(index);
          }}
          renderButton={(selectedItem, _isOpened) => {
            return (
              <View style={styles.dropdownButtonStyle}>
                <Text style={styles.dropdownButtonTxtStyle}>
                  {selectedItem || 'Select'}
                </Text>
              </View>
            );
          }}
          renderItem={(item, _index, isSelected) => {
            return (
              <View
                style={{
                  ...styles.dropdownItemStyle,
                  ...(isSelected && { backgroundColor: '#D2D9DF' }),
                }}
              >
                <Text style={styles.dropdownItemTxtStyle}>{item}</Text>
              </View>
            );
          }}
          dropdownStyle={styles.dropdownMenuStyle}
        />
      </View>
      <View style={styles.rowContainer}>
        <Text>Camera perspective</Text>
        <SelectDropdown
          data={perspectiveOptions}
          defaultValue={
            !followingPerspective
              ? null
              : perspectiveOptions[followingPerspective]
          }
          onSelect={(_selectedItem, index) => {
            let perspective: CameraPerspective;
            if (index === 0) {
              perspective = CameraPerspective.TILTED;
            } else if (index === 1) {
              perspective = CameraPerspective.TOP_DOWN_NORTH_UP;
            } else {
              perspective = CameraPerspective.TOP_DOWN_HEADING_UP;
            }
            dispatch({ type: 'setFollowingPerspective', value: perspective });
          }}
          renderButton={(selectedItem, _isOpened) => {
            return (
              <View style={styles.dropdownButtonStyle}>
                <Text style={styles.dropdownButtonTxtStyle}>
                  {selectedItem || 'Select'}
                </Text>
              </View>
            );
          }}
          renderItem={(item, _index, isSelected) => {
            return (
              <View
                style={{
                  ...styles.dropdownItemStyle,
                  ...(isSelected && { backgroundColor: '#D2D9DF' }),
                }}
              >
                <Text style={styles.dropdownItemTxtStyle}>{item}</Text>
              </View>
            );
          }}
          dropdownStyle={styles.dropdownMenuStyle}
        />
      </View>
    </View>
  );
};

export default NavigationControls;
