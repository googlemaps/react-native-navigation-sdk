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
import { showSnackbar, Snackbar } from '../helpers/snackbar';
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
  RouteStatus,
} from '@googlemaps/react-native-navigation-sdk';
import SelectDropdown from 'react-native-select-dropdown';

import { ControlStyles } from '../styles/components';

export interface NavigationControlsProps {
  readonly navigationController: NavigationController;
  readonly navigationViewController: NavigationViewController;
  readonly onNavigationDispose?: () => void;
  readonly getCameraPosition: undefined | (() => Promise<CameraPosition>);
  readonly onNavigationNightModeChange?: (mode: NavigationNightMode) => void;
  readonly navigationNightMode?: NavigationNightMode;
  readonly onTripProgressBarEnabledChange?: (enabled: boolean) => void;
  readonly onTrafficPromptsEnabledChange?: (enabled: boolean) => void;
  readonly onTrafficIncidentCardsEnabledChange?: (enabled: boolean) => void;
  readonly onHeaderEnabledChange?: (enabled: boolean) => void;
  readonly onFooterEnabledChange?: (enabled: boolean) => void;
  readonly onSpeedometerEnabledChange?: (enabled: boolean) => void;
  readonly onSpeedLimitIconEnabledChange?: (enabled: boolean) => void;
  readonly onRecenterButtonEnabledChange?: (enabled: boolean) => void;
  readonly onReportIncidentButtonEnabledChange?: (enabled: boolean) => void;
  readonly onFollowingPerspectiveChange?: (
    perspective: CameraPerspective
  ) => void;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  navigationController,
  navigationViewController,
  onNavigationDispose,
  getCameraPosition,
  onNavigationNightModeChange,
  navigationNightMode = NavigationNightMode.AUTO,
  onTripProgressBarEnabledChange,
  onTrafficPromptsEnabledChange,
  onTrafficIncidentCardsEnabledChange,
  onHeaderEnabledChange,
  onFooterEnabledChange,
  onSpeedometerEnabledChange,
  onSpeedLimitIconEnabledChange,
  onRecenterButtonEnabledChange,
  onReportIncidentButtonEnabledChange,
  onFollowingPerspectiveChange,
}) => {
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
  const [trafficPromptsEnabled, setTrafficPromptsEnabled] = useState(true);
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

  const handleRouteStatus = (routeStatus: RouteStatus) => {
    switch (routeStatus) {
      case RouteStatus.OK:
        showSnackbar('Route created successfully');
        break;
      case RouteStatus.ROUTE_CANCELED:
        Alert.alert('Error', 'Route Cancelled');
        break;
      case RouteStatus.NO_ROUTE_FOUND:
        Alert.alert('Error', 'No Route Found');
        break;
      case RouteStatus.NETWORK_ERROR:
        Alert.alert('Error', 'Network Error');
        break;
      case RouteStatus.LOCATION_DISABLED:
        Alert.alert('Error', 'Location Disabled');
        break;
      case RouteStatus.LOCATION_UNKNOWN:
        Alert.alert('Error', 'Location Unknown');
        break;
      case RouteStatus.DUPLICATE_WAYPOINTS_ERROR:
        Alert.alert('Error', 'Consecutive duplicate waypoints are not allowed');
        break;
      default:
        showSnackbar('Route status: ' + routeStatus);
        Alert.alert('Error', 'Starting Guidance Error');
    }
  };

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

    const routeStatus = await navigationController.setDestination(waypoint, {
      routingOptions,
      displayOptions,
    });
    handleRouteStatus(routeStatus);
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

    const routeStatus = await navigationController.setDestinations(waypoints, {
      routingOptions,
      displayOptions,
    });
    handleRouteStatus(routeStatus);
  };

  const setFollowingPerspective = (_index: CameraPerspective) => {
    onFollowingPerspectiveChange?.(_index);
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

  const simulateLocation = async () => {
    if (getCameraPosition) {
      const cameraPosition = await getCameraPosition();
      if (cameraPosition) {
        navigationController.simulator.simulateLocation({
          lat: cameraPosition.target.lat,
          lng: cameraPosition.target.lng,
        });
        showSnackbar(
          `Simulating location: ${cameraPosition.target.lat.toFixed(4)}, ${cameraPosition.target.lng.toFixed(4)}`
        );
      } else {
        Alert.alert('Error', 'Could not get camera position');
      }
    } else {
      Alert.alert('Error', 'Camera position not available');
    }
  };

  const toggleSpeedLimitIconEnabled = (isOn: boolean) => {
    setSpeedLimitIconEnabled(isOn);
    onSpeedLimitIconEnabledChange?.(isOn);
  };

  const toggleSpeedometerEnabled = (isOn: boolean) => {
    setSpeedometerEnabled(isOn);
    onSpeedometerEnabledChange?.(isOn);
  };

  const toggleNavigationUiEnabled = (isOn: boolean) => {
    setNavigationUIEnabled(isOn);
    navigationViewController.setNavigationUIEnabled(isOn);
  };

  const toggleTurnByTurnLoggingEnabled = (isOn: boolean) => {
    setTurnByTurnLoggingEnabled(isOn);
    navigationController.setTurnByTurnLoggingEnabled(isOn);
  };

  const toggleTrafficIncidentCardsEnabled = (isOn: boolean) => {
    setTrafficIncidentCardsEnabled(isOn);
    onTrafficIncidentCardsEnabledChange?.(isOn);
  };

  const toggleBackgroundLocationUpdatesEnabled = (isOn: boolean) => {
    setBackgroundLocationUpdatesEnabled(isOn);
    navigationController.setBackgroundLocationUpdatesEnabled(isOn);
  };

  const toggleRecenterButtonEnabled = (isOn: boolean) => {
    setRecenterButtonEnabled(isOn);
    onRecenterButtonEnabledChange?.(isOn);
  };

  const toggleHeaderEnabled = (isOn: boolean) => {
    setHeaderEnabled(isOn);
    onHeaderEnabledChange?.(isOn);
  };

  const toggleFooterEnabled = (isOn: boolean) => {
    setFooterEnabled(isOn);
    onFooterEnabledChange?.(isOn);
  };

  const showRouteOverview = () => {
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
    navigationController.setAudioGuidanceType(index);
  };

  const getCurrentRouteSegment = async () => {
    const result = await navigationController.getCurrentRouteSegment();
    if (result) {
      showSnackbar(
        `Route segment: ${result.destinationWaypoint?.title ?? 'Unknown'} - ${result.segmentLatLngList?.length ?? 0} points`,
        Snackbar.LENGTH_LONG
      );
    } else {
      showSnackbar('No current route segment');
    }
  };

  const getRouteSegments = async () => {
    const result = await navigationController.getRouteSegments();
    showSnackbar(`Route segments: ${result?.length ?? 0} segment(s)`);
  };

  const getTraveledPath = async () => {
    const result = await navigationController.getTraveledPath();
    showSnackbar(`Traveled path: ${result?.length ?? 0} point(s)`);
  };

  const getCurrentTimeAndDistanceClicked = async () => {
    const result = await navigationController.getCurrentTimeAndDistance();
    if (result) {
      const minutes = Math.round((result.seconds ?? 0) / 60);
      const km = ((result.meters ?? 0) / 1000).toFixed(1);
      showSnackbar(
        `Time: ${minutes} min, Distance: ${km} km`,
        Snackbar.LENGTH_LONG
      );
    } else {
      showSnackbar('No time/distance data');
    }
  };

  const startUpdatingLocation = () => {
    navigationController.startUpdatingLocation();
  };

  const stopUpdatingLocation = () => {
    navigationController.stopUpdatingLocation();
  };

  const getNavSDKVersion = async () => {
    const version = await navigationController.getNavSDKVersion();
    showSnackbar(`NavSDK version: ${version}`, Snackbar.LENGTH_LONG);
  };

  const getAreTermsAccepted = async () => {
    const accepted = await navigationController.areTermsAccepted();
    showSnackbar(`Terms accepted: ${accepted ? 'Yes' : 'No'}`);
  };

  const resetTerms = async () => {
    try {
      await navigationController.resetTermsAccepted();
      showSnackbar('Terms of Service have been reset');
    } catch (e) {
      showSnackbar(`Error resetting terms: ${e}`);
    }
  };

  const showTermsDialog = async () => {
    try {
      const accepted =
        await navigationController.showTermsAndConditionsDialog();
      showSnackbar(
        `Terms dialog result: ${accepted ? 'Accepted' : 'Not accepted'}`
      );
    } catch (e) {
      showSnackbar(`Error showing terms dialog: ${e}`);
    }
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
          title="Simulate location from Camera Location"
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
              const newValue = !tripProgressBarEnabled;
              setTripProgressBarEnabled(newValue);
              onTripProgressBarEnabledChange?.(newValue);
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
              const newValue = !reportIncidentButtonEnabled;
              setReportIncidentButtonEnabled(newValue);
              onReportIncidentButtonEnabledChange?.(newValue);
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
        <View style={ControlStyles.rowContainer}>
          <Text style={ControlStyles.rowLabel}>Traffic prompts & callouts</Text>
          <ExampleAppButton
            title={trafficPromptsEnabled ? 'Disable' : 'Enable'}
            onPress={() => {
              const newValue = !trafficPromptsEnabled;
              setTrafficPromptsEnabled(newValue);
              onTrafficPromptsEnabledChange?.(newValue);
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
        <ExampleAppButton title="Reset terms" onPress={resetTerms} />
        <ExampleAppButton title="Show terms dialog" onPress={showTermsDialog} />
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
