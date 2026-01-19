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
import { Alert, Platform, Text, TextInput, View } from 'react-native';
import { ExampleAppButton } from './ExampleAppButton';
import { Accordion } from './Accordion';
import {
  CameraPerspective,
  NavigationNightMode,
  type NavigationViewController,
  type RoutingOptions,
  TravelMode,
  type Waypoint,
  type CameraPosition,
  type NavigationController,
  type DisplayOptions,
} from '@googlemaps/react-native-navigation-sdk';
import SelectDropdown from 'react-native-select-dropdown';

import { ControlStyles } from '../styles/components';

export type NavigationControlsProps = {
  readonly navigationController: NavigationController;
  readonly navigationViewController: NavigationViewController;
  readonly onNavigationDispose?: () => void;
  readonly getCameraPosition: undefined | (() => Promise<CameraPosition>);
  readonly onNavigationNightModeChange?: (mode: NavigationNightMode) => void;
  readonly navigationNightMode?: NavigationNightMode;
  readonly showMessage?: (message: string) => void;
};

const NavigationControls = ({
  navigationController,
  navigationViewController,
  onNavigationDispose,
  getCameraPosition,
  onNavigationNightModeChange,
  navigationNightMode = NavigationNightMode.AUTO,
  showMessage,
}: NavigationControlsProps) => {
  const log = (message: string) => {
    if (showMessage) {
      showMessage(message);
    } else {
      console.log(message);
    }
  };
  const perspectiveOptions = ['Tilted', 'North up', 'Heading up'];
  const nightModeOptions = ['Auto', 'Force Day', 'Force Night'];
  const nightModeIndex =
    navigationNightMode === NavigationNightMode.FORCE_DAY
      ? 1
      : navigationNightMode === NavigationNightMode.FORCE_NIGHT
        ? 2
        : 0;
  const nightModeLabel = nightModeOptions[nightModeIndex];
  const audioGuidanceOptions = ['Silent', 'Alerts only', 'Alerts and guidance'];
  const [tripProgressBarEnabled, setTripProgressBarEnabled] = useState(false);
  const [reportIncidentButtonEnabled, setReportIncidentButtonEnabled] =
    useState(true);
  const [navigationUiEnabled, setNavigationUIEnabled] = useState(true);
  const [turnByTurnLoggingEnabled, setTurnByTurnLoggingEnabled] =
    useState(false);
  const [speedLimitIconEnabled, setSpeedLimitIconEnabled] = useState(false);
  const [speedometerEnabled, setSpeedometerEnabled] = useState(false);
  const [trafficIncidentCardsEnabled, setTrafficIncidentCardsEnabled] =
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

    navigationController.setDestination(waypoint, {
      routingOptions,
      displayOptions,
    });
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

    navigationController.setDestinations(waypoints, {
      routingOptions,
      displayOptions,
    });
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

  const toggleSpeedLimitIconEnabled = (isOn: boolean) => {
    log(`Speed limit icon: ${isOn ? 'enabled' : 'disabled'}`);
    setSpeedLimitIconEnabled(isOn);
    navigationViewController.setSpeedLimitIconEnabled(isOn);
  };

  const toggleSpeedometerEnabled = (isOn: boolean) => {
    log(`Speedometer: ${isOn ? 'enabled' : 'disabled'}`);
    setSpeedometerEnabled(isOn);
    navigationViewController.setSpeedometerEnabled(isOn);
  };

  const toggleNavigationUiEnabled = (isOn: boolean) => {
    log(`Navigation UI: ${isOn ? 'enabled' : 'disabled'}`);
    setNavigationUIEnabled(isOn);
    navigationViewController.setNavigationUIEnabled(isOn);
  };

  const toggleTurnByTurnLoggingEnabled = (isOn: boolean) => {
    log(`Turn-by-turn logging: ${isOn ? 'enabled' : 'disabled'}`);
    setTurnByTurnLoggingEnabled(isOn);
    navigationController.setTurnByTurnLoggingEnabled(isOn);
  };

  const toggleTrafficIncidentCardsEnabled = (isOn: boolean) => {
    log(`Traffic incident cards: ${isOn ? 'enabled' : 'disabled'}`);
    setTrafficIncidentCardsEnabled(isOn);
    navigationViewController.setTrafficIncidentCardsEnabled(isOn);
  };

  const toggleBackgroundLocationUpdatesEnabled = (isOn: boolean) => {
    log(`Background location updates: ${isOn ? 'enabled' : 'disabled'}`);
    setBackgroundLocationUpdatesEnabled(isOn);
    navigationController.setBackgroundLocationUpdatesEnabled(isOn);
  };

  const toggleRecenterButtonEnabled = (isOn: boolean) => {
    log(`Recenter button: ${isOn ? 'enabled' : 'disabled'}`);
    setRecenterButtonEnabled(isOn);
    navigationViewController.setRecenterButtonEnabled(isOn);
  };

  const toggleHeaderEnabled = (isOn: boolean) => {
    log(`Header: ${isOn ? 'enabled' : 'disabled'}`);
    setHeaderEnabled(isOn);
    navigationViewController.setHeaderEnabled(isOn);
  };

  const toggleFooterEnabled = (isOn: boolean) => {
    log(`Footer: ${isOn ? 'enabled' : 'disabled'}`);
    setFooterEnabled(isOn);
    navigationViewController.setFooterEnabled(isOn);
  };

  const showRouteOverview = () => {
    log('Showing route overview');
    navigationViewController.showRouteOverview();
  };

  const setNightMode = (index: number) => {
    const mode =
      index === 1
        ? NavigationNightMode.FORCE_DAY
        : index === 2
          ? NavigationNightMode.FORCE_NIGHT
          : NavigationNightMode.AUTO;
    onNavigationNightModeChange?.(mode);
  };

  const setAudioGuidanceType = (index: number) => {
    const types = ['Silent', 'Alerts only', 'Alerts and guidance'];
    log(`Audio guidance: ${types[index] || index}`);
    navigationController.setAudioGuidanceType(index);
  };

  const getCurrentRouteSegment = async () => {
    const result = await navigationController.getCurrentRouteSegment();
    log(`Route segment: ${JSON.stringify(result)}`);
  };

  const getRouteSegments = async () => {
    const result = await navigationController.getRouteSegments();
    log(`Route segments: ${result.length} segments`);
  };

  const getTraveledPath = async () => {
    const result = await navigationController.getTraveledPath();
    log(`Traveled path: ${result.length} points`);
  };

  const getCurrentTimeAndDistanceClicked = async () => {
    const result = await navigationController.getCurrentTimeAndDistance();
    log(`Time: ${result.seconds}s, Distance: ${result.meters}m`);
  };

  const startUpdatingLocation = () => {
    navigationController.startUpdatingLocation();
  };

  const stopUpdatingLocation = () => {
    navigationController.stopUpdatingLocation();
  };

  const getNavSDKVersion = async () => {
    const version = await navigationController.getNavSDKVersion();
    log(`NavSDK version: ${version}`);
  };

  const getAreTermsAccepted = async () => {
    const accepted = await navigationController.areTermsAccepted();
    log(`Terms accepted: ${accepted}`);
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
      {/* Destination & Routes */}
      <Accordion title="Destination & Routes">
        <Text style={{ marginLeft: 16, marginTop: 8 }}>Target Coordinates</Text>
        <TextInput
          style={ControlStyles.input}
          onChangeText={onLatChanged}
          value={latitude}
          placeholder="Latitude"
          placeholderTextColor="#000"
          keyboardType="numeric"
        />
        <TextInput
          style={ControlStyles.input}
          onChangeText={onLngChanged}
          value={longitude}
          placeholder="Longitude"
          placeholderTextColor="#000"
          keyboardType="numeric"
        />
        <ExampleAppButton
          title="Set target from Camera Location"
          onPress={setLocationFromCameraLocation}
        />
        <ExampleAppButton
          title="Set target as Destination"
          onPress={initWaypoint}
        />
        <ExampleAppButton
          title="Set multiple destinations"
          onPress={initWaypoints}
        />
        <ExampleAppButton
          title="Continue to next destination"
          onPress={continueToNextDestination}
        />
        <ExampleAppButton
          title="Clear Destination"
          onPress={clearDestinations}
        />
      </Accordion>

      {/* Navigation Control */}
      <Accordion title="Navigation Control">
        <ExampleAppButton title="Start guidance" onPress={startGuidance} />
        <ExampleAppButton title="Stop guidance" onPress={stopGuidance} />
        <ExampleAppButton
          title="Dispose navigation"
          onPress={disposeNavigation}
        />
        <ExampleAppButton
          title="Show route overview"
          onPress={showRouteOverview}
        />
      </Accordion>

      {/* Simulation */}
      <Accordion title="Simulation">
        <ExampleAppButton
          title="Simulate location from target"
          onPress={simulateLocation}
        />
        <ExampleAppButton title="Start simulation" onPress={startSimulation} />
        <ExampleAppButton title="Stop simulation" onPress={stopSimulation} />
        <ExampleAppButton title="Pause simulation" onPress={pauseSimulation} />
        <ExampleAppButton
          title="Resume simulation"
          onPress={resumeSimulation}
        />
      </Accordion>

      {/* Location Updates */}
      <Accordion title="Location Updates">
        <ExampleAppButton
          title="Start updating location"
          onPress={startUpdatingLocation}
        />
        <ExampleAppButton
          title="Stop updating location"
          onPress={stopUpdatingLocation}
        />
        {Platform.OS === 'ios' && (
          <View style={ControlStyles.rowContainer}>
            <Text style={ControlStyles.rowLabel}>
              Background location updates
            </Text>
            <ExampleAppButton
              title={backgroundLocationUpdatesEnabled ? 'Disable' : 'Enable'}
              onPress={() => {
                toggleBackgroundLocationUpdatesEnabled(
                  !backgroundLocationUpdatesEnabled
                );
              }}
            />
          </View>
        )}
      </Accordion>

      {/* UI Display Options */}
      <Accordion title="UI Display Options">
        <View style={ControlStyles.rowContainer}>
          <Text style={ControlStyles.rowLabel}>Navigation UI</Text>
          <ExampleAppButton
            title={navigationUiEnabled ? 'Disable' : 'Enable'}
            onPress={() => {
              toggleNavigationUiEnabled(!navigationUiEnabled);
            }}
          />
        </View>
        <View style={ControlStyles.rowContainer}>
          <Text style={ControlStyles.rowLabel}>Header enabled</Text>
          <ExampleAppButton
            title={headerEnabled ? 'Disable' : 'Enable'}
            onPress={() => {
              toggleHeaderEnabled(!headerEnabled);
            }}
          />
        </View>
        <View style={ControlStyles.rowContainer}>
          <Text style={ControlStyles.rowLabel}>Footer enabled</Text>
          <ExampleAppButton
            title={footerEnabled ? 'Disable' : 'Enable'}
            onPress={() => {
              toggleFooterEnabled(!footerEnabled);
            }}
          />
        </View>
        <View style={ControlStyles.rowContainer}>
          <Text style={ControlStyles.rowLabel}>Trip progress bar</Text>
          <ExampleAppButton
            title={tripProgressBarEnabled ? 'Disable' : 'Enable'}
            onPress={() => {
              setTripProgressBarEnabled(!tripProgressBarEnabled);
              navigationViewController.setTripProgressBarEnabled(
                !tripProgressBarEnabled
              );
            }}
          />
        </View>
        <View style={ControlStyles.rowContainer}>
          <Text style={ControlStyles.rowLabel}>Recenter button</Text>
          <ExampleAppButton
            title={recenterButtonEnabled ? 'Disable' : 'Enable'}
            onPress={() => {
              toggleRecenterButtonEnabled(!recenterButtonEnabled);
            }}
          />
        </View>
        <View style={ControlStyles.rowContainer}>
          <Text style={ControlStyles.rowLabel}>Report incident button</Text>
          <ExampleAppButton
            title={reportIncidentButtonEnabled ? 'Disable' : 'Enable'}
            onPress={() => {
              setReportIncidentButtonEnabled(!reportIncidentButtonEnabled);
              navigationViewController.setReportIncidentButtonEnabled(
                !reportIncidentButtonEnabled
              );
            }}
          />
        </View>
        <View style={ControlStyles.rowContainer}>
          <Text style={ControlStyles.rowLabel}>Traffic incidents card</Text>
          <ExampleAppButton
            title={trafficIncidentCardsEnabled ? 'Disable' : 'Enable'}
            onPress={() => {
              toggleTrafficIncidentCardsEnabled(!trafficIncidentCardsEnabled);
            }}
          />
        </View>
      </Accordion>

      {/* Speed & Safety */}
      <Accordion title="Speed & Safety">
        <View style={ControlStyles.rowContainer}>
          <Text style={ControlStyles.rowLabel}>Speed limit icon</Text>
          <ExampleAppButton
            title={speedLimitIconEnabled ? 'Disable' : 'Enable'}
            onPress={() => {
              toggleSpeedLimitIconEnabled(!speedLimitIconEnabled);
            }}
          />
        </View>
        <View style={ControlStyles.rowContainer}>
          <Text style={ControlStyles.rowLabel}>Speedometer</Text>
          <ExampleAppButton
            title={speedometerEnabled ? 'Disable' : 'Enable'}
            onPress={() => {
              toggleSpeedometerEnabled(!speedometerEnabled);
            }}
          />
        </View>
        <ExampleAppButton
          title="Set speed alert options"
          onPress={setSpeedAlertOptions}
        />
      </Accordion>

      {/* Appearance */}
      <Accordion title="Appearance">
        <View style={ControlStyles.rowContainer}>
          <Text style={ControlStyles.rowLabel}>Night mode</Text>
          <SelectDropdown
            data={nightModeOptions}
            defaultValueByIndex={nightModeIndex}
            onSelect={(_selectedItem, index) => {
              setNightMode(index);
            }}
            renderButton={(selectedItem, _isOpened) => {
              return (
                <View style={ControlStyles.dropdownButton}>
                  <Text style={ControlStyles.dropdownButtonText}>
                    {selectedItem || nightModeLabel}
                  </Text>
                </View>
              );
            }}
            renderItem={(item, _index, isSelected) => {
              return (
                <View
                  style={[
                    ControlStyles.dropdownItem,
                    isSelected && ControlStyles.dropdownItemSelected,
                  ]}
                >
                  <Text style={ControlStyles.dropdownItemText}>{item}</Text>
                </View>
              );
            }}
            dropdownStyle={ControlStyles.dropdownMenu}
          />
        </View>
        <View style={ControlStyles.rowContainer}>
          <Text style={ControlStyles.rowLabel}>Camera perspective</Text>
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
                <View style={ControlStyles.dropdownButton}>
                  <Text style={ControlStyles.dropdownButtonText}>
                    {selectedItem || 'Select'}
                  </Text>
                </View>
              );
            }}
            renderItem={(item, _index, isSelected) => {
              return (
                <View
                  style={[
                    ControlStyles.dropdownItem,
                    isSelected && ControlStyles.dropdownItemSelected,
                  ]}
                >
                  <Text style={ControlStyles.dropdownItemText}>{item}</Text>
                </View>
              );
            }}
            dropdownStyle={ControlStyles.dropdownMenu}
          />
        </View>
      </Accordion>

      {/* Audio & Logging */}
      <Accordion title="Audio & Logging">
        <View style={ControlStyles.rowContainer}>
          <Text style={ControlStyles.rowLabel}>Audio guidance type</Text>
          <SelectDropdown
            data={audioGuidanceOptions}
            onSelect={(_selectedItem, index) => {
              setAudioGuidanceType(index);
            }}
            renderButton={(selectedItem, _isOpened) => {
              return (
                <View style={ControlStyles.dropdownButton}>
                  <Text style={ControlStyles.dropdownButtonText}>
                    {selectedItem || 'Select'}
                  </Text>
                </View>
              );
            }}
            renderItem={(item, _index, isSelected) => {
              return (
                <View
                  style={[
                    ControlStyles.dropdownItem,
                    isSelected && ControlStyles.dropdownItemSelected,
                  ]}
                >
                  <Text style={ControlStyles.dropdownItemText}>{item}</Text>
                </View>
              );
            }}
            dropdownStyle={ControlStyles.dropdownMenu}
          />
        </View>
        <View style={ControlStyles.rowContainer}>
          <Text style={ControlStyles.rowLabel}>Turn-by-turn logging</Text>
          <ExampleAppButton
            title={turnByTurnLoggingEnabled ? 'Disable' : 'Enable'}
            onPress={() => {
              toggleTurnByTurnLoggingEnabled(!turnByTurnLoggingEnabled);
            }}
          />
        </View>
      </Accordion>

      {/* Debug & Info */}
      <Accordion title="Debug & Info">
        <ExampleAppButton title="NavSDK version" onPress={getNavSDKVersion} />
        <ExampleAppButton
          title="Are terms accepted?"
          onPress={getAreTermsAccepted}
        />
        <ExampleAppButton
          title="Get current time and distance"
          onPress={getCurrentTimeAndDistanceClicked}
        />
        <ExampleAppButton
          title="Get current route segment"
          onPress={getCurrentRouteSegment}
        />
        <ExampleAppButton
          title="Get route segments"
          onPress={getRouteSegments}
        />
        <ExampleAppButton title="Get traveled path" onPress={getTraveledPath} />
      </Accordion>
    </View>
  );
};

export default NavigationControls;
