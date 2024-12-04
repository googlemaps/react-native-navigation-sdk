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
import {
  Alert,
  Button,
  Platform,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  CameraPerspective,
  type NavigationViewController,
  type RoutingOptions,
  TravelMode,
  type Waypoint,
  type CameraPosition,
  type NavigationController,
  type DisplayOptions,
} from '@googlemaps/react-native-navigation-sdk';
import SelectDropdown from 'react-native-select-dropdown';

import styles from '../styles';

export interface NavigationControlsProps {
  readonly navigationController: NavigationController;
  readonly navigationViewController: NavigationViewController;
  readonly onNavigationDispose?: () => void;
  readonly getCameraPosition: undefined | (() => Promise<CameraPosition>);
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  navigationController,
  navigationViewController,
  onNavigationDispose,
  getCameraPosition,
}) => {
  const perspectiveOptions = ['Tilted', 'North up', 'Heading up'];
  const nightModeOptions = ['Auto', 'Force Day', 'Force Night'];
  const audioGuidanceOptions = ['Silent', 'Alerts only', 'Alerts and guidance'];
  const [tripProgressBarEnabled, setTripProgressBarEnabled] = useState(false);
  const [navigationUiEnabled, setNavigationUIEnabled] = useState(true);
  const [turnByTurnLoggingEnabled, setTurnByTurnLoggingEnabled] =
    useState(false);
  const [speedLimitIconEnabled, setSpeedLimitIconEnabled] = useState(false);
  const [speedometerEnabled, setSpeedometerEnabled] = useState(false);
  const [trafficIncidentsCardEnabled, setTrafficIncidentsCardEnabled] =
    useState(false);
  const [recenterButtonEnabled, setRecenterButtonEnabled] = useState(true);
  const [
    backgroundLocationUpdatesEnabled,
    setBackgroundLocationUpdatesEnabled,
  ] = useState(false);
  const [footerEnabled, setFooterEnabled] = useState(true);
  const [headerEnabled, setHeaderEnabled] = useState(true);

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

    navigationController.setDestinations(
      waypoints,
      routingOptions,
      displayOptions
    );
  };

  const setFollowingPerspective = (index: CameraPerspective) => {
    navigationViewController.setFollowingPerspective(index);
  };

  const continueToNextDestination = () => {
    navigationController.continueToNextDestination();
  };

  const startGuidance = () => {
    navigationController.startGuidance();
  };

  const stopGuidance = () => {
    navigationController.stopGuidance();
  };

  const clearDestinations = () => {
    navigationController.clearDestinations();
  };

  const startSimulation = () => {
    navigationController.simulator.simulateLocationsAlongExistingRoute({
      speedMultiplier: 5,
    });
  };

  const stopSimulation = () => {
    navigationController.simulator.stopLocationSimulation();
  };

  const pauseSimulation = () => {
    navigationController.simulator.pauseLocationSimulation();
  };

  const resumeSimulation = () => {
    navigationController.simulator.resumeLocationSimulation();
  };

  const simulateLocation = () => {
    if (!latitude.trim() || !longitude.trim()) {
      Alert.alert('Set lat lng values first');
      return;
    }

    navigationController.simulator.simulateLocation({
      lat: Number(latitude),
      lng: Number(longitude),
    });
  };

  const toggleTripProgressBarEnabled = (isOn: boolean) => {
    console.log('setTripProgressBarEnabled', isOn);
    setTripProgressBarEnabled(isOn);
    navigationViewController.setTripProgressBarEnabled(isOn);
  };

  const toggleSpeedLimitIconEnabled = (isOn: boolean) => {
    console.log('setSpeedLimitIconEnabled', isOn);
    setSpeedLimitIconEnabled(isOn);
    navigationViewController.setSpeedLimitIconEnabled(isOn);
  };

  const toggleSpeedometerEnabled = (isOn: boolean) => {
    console.log('setSpeedometerEnabled', isOn);
    setSpeedometerEnabled(isOn);
    navigationViewController.setSpeedometerEnabled(isOn);
  };

  const toggleNavigationUiEnabled = (isOn: boolean) => {
    console.log('setNavigationUIEnabled', isOn);
    setNavigationUIEnabled(isOn);
    navigationViewController.setNavigationUIEnabled(isOn);
  };

  const toggleTurnByTurnLoggingEnabled = (isOn: boolean) => {
    console.log('setTurnByTurnLoggingEnabled', isOn);
    setTurnByTurnLoggingEnabled(isOn);
    navigationController.setTurnByTurnLoggingEnabled(isOn);
  };

  const toggleTrafficIncidentsCardEnabled = (isOn: boolean) => {
    console.log('toggleTrafficIncidentsCardEnabled:', isOn);
    setTrafficIncidentsCardEnabled(isOn);
    navigationViewController.setTrafficIncidentCardsEnabled(isOn);
  };

  const toggleBackgroundLocationUpdatesEnabled = (isOn: boolean) => {
    console.log('toggleBackgroundLocationUpdatesEnabled:', isOn);
    setBackgroundLocationUpdatesEnabled(isOn);
    navigationController.setBackgroundLocationUpdatesEnabled(isOn);
  };

  const toggleRecenterButtonEnabled = (isOn: boolean) => {
    console.log('toggleRecenterButtonEnabled:', isOn);
    setRecenterButtonEnabled(isOn);
    navigationViewController.setRecenterButtonEnabled(isOn);
  };

  const toggleHeaderEnabled = (isOn: boolean) => {
    console.log('toggleHeaderEnabled:', isOn);
    setHeaderEnabled(isOn);
    navigationViewController.setHeaderEnabled(isOn);
  };

  const toggleFooterEnabled = (isOn: boolean) => {
    console.log('toggleFooterEnabled:', isOn);
    setFooterEnabled(isOn);
    navigationViewController.setFooterEnabled(isOn);
  };

  const showRouteOverview = () => {
    console.log('showRouteOverview');
    navigationViewController.showRouteOverview();
  };

  const setNightMode = (index: number) => {
    console.log('setNightMode: ', index);
    navigationViewController.setNightMode(index);
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

  const startUpdatingLocation = () => {
    navigationController.startUpdatingLocation();
  };

  const stopUpdatingLocation = () => {
    navigationController.stopUpdatingLocation();
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
        <Text>Trip progress</Text>
        <Switch
          value={tripProgressBarEnabled}
          onValueChange={() => {
            toggleTripProgressBarEnabled(!tripProgressBarEnabled);
          }}
        />
      </View>
      <View style={styles.rowContainer}>
        <Text>Speed limit icon</Text>
        <Switch
          value={speedLimitIconEnabled}
          onValueChange={() => {
            toggleSpeedLimitIconEnabled(!speedLimitIconEnabled);
          }}
        />
      </View>
      <View style={styles.rowContainer}>
        <Text>Speedometer</Text>
        <Switch
          value={speedometerEnabled}
          onValueChange={() => {
            toggleSpeedometerEnabled(!speedometerEnabled);
          }}
        />
      </View>
      <View style={styles.rowContainer}>
        <Text>Traffic incidents card</Text>
        <Switch
          value={trafficIncidentsCardEnabled}
          onValueChange={() => {
            toggleTrafficIncidentsCardEnabled(!trafficIncidentsCardEnabled);
          }}
        />
      </View>
      <View style={styles.rowContainer}>
        <Text>Navigation UI</Text>
        <Switch
          value={navigationUiEnabled}
          onValueChange={() => {
            toggleNavigationUiEnabled(!navigationUiEnabled);
          }}
        />
      </View>
      <View style={styles.rowContainer}>
        <Text>Turn-by-turn logging</Text>
        <Switch
          value={turnByTurnLoggingEnabled}
          onValueChange={() => {
            toggleTurnByTurnLoggingEnabled(!turnByTurnLoggingEnabled);
          }}
        />
      </View>
      {Platform.OS === 'ios' ? (
        <View style={styles.rowContainer}>
          <Text>Background location updates</Text>
          <Switch
            value={backgroundLocationUpdatesEnabled}
            onValueChange={() => {
              toggleBackgroundLocationUpdatesEnabled(
                !backgroundLocationUpdatesEnabled
              );
            }}
          />
        </View>
      ) : null}
      <View style={styles.rowContainer}>
        <Text>Recenter button</Text>
        <Switch
          value={recenterButtonEnabled}
          onValueChange={() => {
            toggleRecenterButtonEnabled(!recenterButtonEnabled);
          }}
        />
      </View>
      <View style={styles.rowContainer}>
        <Text>Header enabled</Text>
        <Switch
          value={headerEnabled}
          onValueChange={() => {
            toggleHeaderEnabled(!headerEnabled);
          }}
        />
      </View>
      <View style={styles.rowContainer}>
        <Text>Footer enabled</Text>
        <Switch
          value={footerEnabled}
          onValueChange={() => {
            toggleFooterEnabled(!footerEnabled);
          }}
        />
      </View>
      <View style={styles.rowContainer}>
        <Text>Night mode </Text>
        <SelectDropdown
          data={nightModeOptions}
          onSelect={(_selectedItem, index) => {
            setNightMode(index);
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
        <Text>Audio guidance type </Text>
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
          onSelect={(_selectedItem, index) => {
            let perspective: CameraPerspective;
            if (index === 0) {
              perspective = CameraPerspective.TILTED;
            } else if (index === 1) {
              perspective = CameraPerspective.TOP_DOWN_NORTH_UP;
            } else {
              perspective = CameraPerspective.TOP_DOWN_HEADING_UP;
            }
            setFollowingPerspective(perspective);
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
