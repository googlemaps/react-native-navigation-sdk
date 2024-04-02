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

import React, {useState} from 'react';
import {
  Alert,
  Button,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  CameraPerspective,
  NavigationViewController,
  RoutingOptions,
} from 'react-native-navigation-sdk/components/navigation/navigationView/types';
import {
  TravelMode,
  Waypoint,
} from 'react-native-navigation-sdk/components/navigation/types';
import SelectDropdown from 'react-native-select-dropdown';

import styles from './styles';

export interface NavigationControlsProps {
  readonly navigationViewController: NavigationViewController;
  readonly visible: boolean;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  navigationViewController,
  visible,
}) => {
  const perspectiveOptions = ['Tilted', 'North up', 'Heading up'];
  const nightModeOptions = ['Auto', 'Force Day', 'Force Night'];
  const audioGuidanceOptions = ['Silent', 'Alerts only', 'Alerts and guidance'];
  const [tripProgressBarEnabled, setTripProgressBarEnabled] = useState(false);
  const [navigationUiEnabled, setNavigationUIEnabled] = useState(true);
  const [speedLimitIconEnabled, setSpeedLimitIconEnabled] = useState(false);
  const [speedometerEnabled, setSpeedometerEnabled] = useState(false);
  const [trafficIncidentsCardEnabled, setTrafficIncidentsCardEnabled] =
    useState(false);
  const [recenterButtonEnabled, setRecenterButtonEnabled] =
    useState(true);
  const [backgroundLocationUpdatesEnabled, setBackgroundLocationUpdatesEnabled] =
    useState(false);

  const [latitude, onLatChanged] = useState('');
  const [longitude, onLngChanged] = useState('');

  // single destination:
  const initWaypoint = async () => {
    if (!latitude.trim() || !longitude.trim()) {
      Alert.alert('Invalid destination');
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

    navigationViewController.setDestination(waypoint, routingOptions);
  };

  // multi destination:
  // set your device (emulator) location to new new york timesquare
  const initWaypoints = async () => {
    const wp1 = {
      placeId: 'ChIJw____96GhYARCVVwg5cT7c0', // Golden gate, SF
    };
    const wp2 = {
      placeId: 'ChIJkXCsHWSAhYARsGBBQYcj-V0', // 1 Market st, SF
    };

    const map = [wp1, wp2];

    const routingOptions: RoutingOptions = {
      travelMode: TravelMode.DRIVING,
      avoidFerries: true,
      avoidTolls: false,
    };

    navigationViewController.setDestinations(map, routingOptions);
  };

  const setFollowingPerspective = (index: CameraPerspective) => {
    navigationViewController.setFollowingPerspective(index);
  };

  const continueToNextDestination = () => {
    navigationViewController.continueToNextDestination();
  };

  const startGuidance = () => {
    navigationViewController.startGuidance();
  };

  const stopGuidance = () => {
    navigationViewController.stopGuidance();
  };

  const clearDestinations = () => {
    navigationViewController.clearDestinations();
  };

  const startSimulation = () => {
    navigationViewController.simulator.simulateLocationsAlongExistingRoute({
      speedMultiplier: 5,
    });
  };

  const stopSimulation = () => {
    navigationViewController.simulator.stopLocationSimulation();
  };

  const pauseSimulation = () => {
    navigationViewController.simulator.pauseLocationSimulation();
  };

  const simulateLocation = () => {
    if (!latitude.trim() || !longitude.trim()) {
      Alert.alert('Invalid destination');
      return;
    }

    navigationViewController.simulator.simulateLocation({
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

  const toggleTrafficIncidentsCardEnabled = (isOn: boolean) => {
    console.log('toggleTrafficIncidentsCardEnabled:', isOn);
    setTrafficIncidentsCardEnabled(isOn);
    navigationViewController.setTrafficIncidentCardsEnabled(isOn);
  };

  const toggleBackgroundLocationUpdatesEnabled = (isOn: boolean) => {
    console.log('toggleBackgroundLocationUpdatesEnabled:', isOn);
    setBackgroundLocationUpdatesEnabled(isOn);
    navigationViewController.setBackgroundLocationUpdatesEnabled(isOn);
  };

  const toggleRecenterButtonEnabled = (isOn: boolean) => {
    console.log('toggleRecenterButtonEnabled:', isOn);
    setRecenterButtonEnabled(isOn);
    navigationViewController.setRecenterButtonEnabled(isOn);
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
    navigationViewController.setAudioGuidanceType(index);
  };

  const getCurrentRouteSegment = async () => {
    let result = await navigationViewController.getCurrentRouteSegment();
    console.log(result);
  };

  const getRouteSegments = async () => {
    let result = await navigationViewController.getRouteSegments();
    console.log(result);
  };

  const getTraveledPath = async () => {
    let result = await navigationViewController.getTraveledPath();
    console.log(result);
  };

  const getCurrentTimeAndDistanceClicked = async () => {
    let result = await navigationViewController.getCurrentTimeAndDistance();
    console.log(result);
  };

  const startUpdatingLocation = () => {
    navigationViewController.startUpdatingLocation();
  };

  const stopUpdatingLocation = () => {
    navigationViewController.stopUpdatingLocation();
  };

  const getNavSDKVersion = async () => {
    console.log(await navigationViewController.getNavSDKVersion());
  };

  const getAreTermsAccepted = async () => {
    console.log(await navigationViewController.areTermsAccepted());
  };

  const setSpeedAlertOptions = () => {
    navigationViewController.setSpeedAlertOptions({
      minorSpeedAlertPercentThreshold: 1,
      majorSpeedAlertPercentThreshold: 50,
      severityUpgradeDurationSeconds: 5,
    });
  };

  if (!visible) {
    return null;
  }

  return (
    <ScrollView
      style={{
        backgroundColor: 'white',
        height: '80%',
      }}>
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

      <Button title="Single Destination" onPress={initWaypoint} />
      <Button title="Multiple Destination" onPress={initWaypoints} />
      <Button
        title="Continue to next destination"
        onPress={continueToNextDestination}
      />
      <Button title="Clear Destination" onPress={clearDestinations} />
      <Button title="Start guidance" onPress={startGuidance} />
      <Button title="Stop guidance" onPress={stopGuidance} />
      <Button title="Start updating location" onPress={startUpdatingLocation} />
      <Button title="Stop updating location" onPress={stopUpdatingLocation} />
      <Button title="Simulate location" onPress={simulateLocation} />
      <Button title="Start simulation" onPress={startSimulation} />
      <Button title="Stop simulation" onPress={stopSimulation} />
      <Button title="Pause simulation" onPress={pauseSimulation} />
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
        <Text>Background location updates</Text>
        <Switch
          value={backgroundLocationUpdatesEnabled}
          onValueChange={() => {
            toggleBackgroundLocationUpdatesEnabled(!backgroundLocationUpdatesEnabled);
          }}
        />
      </View>
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
        <Text>Night mode </Text>
        <SelectDropdown
          data={nightModeOptions}
          onSelect={(selectedItem, index) => {
            setNightMode(index);
          }}
          buttonTextAfterSelection={(selectedItem, index) => {
            return selectedItem;
          }}
          rowTextForSelection={(item, index) => {
            return item;
          }}
        />
      </View>
      <View style={styles.rowContainer}>
        <Text>Audio guidance type </Text>
        <SelectDropdown
          data={audioGuidanceOptions}
          onSelect={(selectedItem, index) => {
            setAudioGuidanceType(index);
          }}
          buttonTextAfterSelection={(selectedItem, index) => {
            return selectedItem;
          }}
          rowTextForSelection={(item, index) => {
            return item;
          }}
        />
      </View>
      <View style={styles.rowContainer}>
        <Text>Camera perspective</Text>
        <SelectDropdown
          data={perspectiveOptions}
          onSelect={(selectedItem, index) => {
            let perspective: CameraPerspective;
            if (index == 0) {
              perspective = CameraPerspective.TILTED;
            } else if (index == 1) {
              perspective = CameraPerspective.TOP_DOWN_NORTH_UP;
            } else {
              perspective = CameraPerspective.TOP_DOWN_HEADING_UP;
            }
            setFollowingPerspective(perspective);
          }}
          buttonTextAfterSelection={(selectedItem, index) => {
            return selectedItem;
          }}
          rowTextForSelection={(item, index) => {
            return item;
          }}
        />
      </View>
    </ScrollView>
  );
};

export default NavigationControls;
