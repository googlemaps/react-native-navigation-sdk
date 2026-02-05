/**
 * Copyright 2026 Google LLC
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

import React, { useState, useCallback } from 'react';
import { Text, TextInput, View, Switch } from 'react-native';
import { ExampleAppButton } from './ExampleAppButton';
import SelectDropdown from 'react-native-select-dropdown';
import { ControlStyles } from '../styles/components';
import {
  type MapViewAutoController,
  CameraPerspective,
  MapType,
  MapColorScheme,
  NavigationNightMode,
} from '@googlemaps/react-native-navigation-sdk';
import MapsControls from './mapsControls';
import { Accordion } from './Accordion';

export interface AutoControlsProps {
  readonly mapViewAutoController: MapViewAutoController;
}

const AutoControls: React.FC<AutoControlsProps> = ({
  mapViewAutoController,
}) => {
  const perspectiveOptions = ['Tilted', 'North up', 'Heading up'];
  const [selectedPerspectiveIndex, setSelectedPerspectiveIndex] = useState(0);
  const [customMessageType, setCustomMessageType] = useState('test_message');
  const [customMessageData, setCustomMessageData] =
    useState('{"key": "value"}');
  const [mapType, setMapType] = useState<MapType>(MapType.NORMAL);
  const [mapColorScheme, setMapColorScheme] = useState<MapColorScheme>(
    MapColorScheme.FOLLOW_SYSTEM
  );
  const [nightMode, setNightMode] = useState<NavigationNightMode>(
    NavigationNightMode.AUTO
  );
  const [myLocationEnabled, setMyLocationEnabled] = useState(false);

  // Map appearance settings
  const [indoorEnabled, setIndoorEnabled] = useState(false);
  const [trafficEnabled, setTrafficEnabled] = useState(false);
  const [compassEnabled, setCompassEnabled] = useState(false);
  const [buildingsEnabled, setBuildingsEnabled] = useState(true);

  const handleMapTypeChange = useCallback(
    (newMapType: MapType) => {
      setMapType(newMapType);
      mapViewAutoController.setMapType(newMapType);
    },
    [mapViewAutoController]
  );

  const handleMapColorSchemeChange = useCallback(
    (scheme: MapColorScheme) => {
      setMapColorScheme(scheme);
      mapViewAutoController.setMapColorScheme(scheme);
    },
    [mapViewAutoController]
  );

  const handleNightModeChange = useCallback(
    (mode: NavigationNightMode) => {
      setNightMode(mode);
      mapViewAutoController.setNightMode(mode);
    },
    [mapViewAutoController]
  );

  const handleMyLocationChange = useCallback(
    (enabled: boolean, buttonEnabled: boolean) => {
      setMyLocationEnabled(enabled);
      mapViewAutoController.setMyLocationEnabled(enabled);
      mapViewAutoController.setMyLocationButtonEnabled(buttonEnabled);
    },
    [mapViewAutoController]
  );

  // Map appearance toggle handlers
  const toggleIndoorEnabled = useCallback(() => {
    const newValue = !indoorEnabled;
    setIndoorEnabled(newValue);
    mapViewAutoController.setIndoorEnabled(newValue);
  }, [indoorEnabled, mapViewAutoController]);

  const toggleTrafficEnabled = useCallback(() => {
    const newValue = !trafficEnabled;
    setTrafficEnabled(newValue);
    mapViewAutoController.setTrafficEnabled(newValue);
  }, [trafficEnabled, mapViewAutoController]);

  const toggleCompassEnabled = useCallback(() => {
    const newValue = !compassEnabled;
    setCompassEnabled(newValue);
    mapViewAutoController.setCompassEnabled(newValue);
  }, [compassEnabled, mapViewAutoController]);

  const toggleBuildingsEnabled = useCallback(() => {
    const newValue = !buildingsEnabled;
    setBuildingsEnabled(newValue);
    mapViewAutoController.setBuildingsEnabled(newValue);
  }, [buildingsEnabled, mapViewAutoController]);

  const applySelectedPerspective = () => {
    let perspective: CameraPerspective;
    switch (selectedPerspectiveIndex) {
      case 1:
        perspective = CameraPerspective.TOP_DOWN_NORTH_UP;
        break;
      case 2:
        perspective = CameraPerspective.TOP_DOWN_HEADING_UP;
        break;
      default:
        perspective = CameraPerspective.TILTED;
    }
    mapViewAutoController.setFollowingPerspective(perspective);
  };

  const sendCustomMessage = () => {
    let data: Record<string, unknown> | undefined;
    try {
      data = customMessageData ? JSON.parse(customMessageData) : undefined;
    } catch (e) {
      console.error('Invalid JSON data:', e);
      return;
    }
    mapViewAutoController.sendCustomMessage(customMessageType, data);
  };

  const nightModeOptions = ['Auto', 'Force Day', 'Force Night'];

  return (
    <View>
      <Accordion title="Auto Navigation View Controls">
        <View style={ControlStyles.rowContainer}>
          <Text style={ControlStyles.rowLabel}>Follow My Location</Text>
          <SelectDropdown
            data={perspectiveOptions}
            defaultValueByIndex={selectedPerspectiveIndex}
            onSelect={(_item, index) => {
              setSelectedPerspectiveIndex(index);
            }}
            renderButton={(selectedItem, _isOpened) => (
              <View style={ControlStyles.dropdownButton}>
                <Text style={ControlStyles.dropdownButtonText}>
                  {selectedItem || 'Select perspective'}
                </Text>
              </View>
            )}
            renderItem={(item, _index, isSelected) => (
              <View
                style={[
                  ControlStyles.dropdownItem,
                  isSelected && ControlStyles.dropdownItemSelected,
                ]}
              >
                <Text style={ControlStyles.dropdownItemText}>{item}</Text>
              </View>
            )}
          />
        </View>

        <ExampleAppButton
          title="Apply Selected Perspective"
          onPress={applySelectedPerspective}
        />

        <View style={ControlStyles.rowContainer}>
          <Text style={ControlStyles.rowLabel}>Navigation Night Mode</Text>
          <SelectDropdown
            data={nightModeOptions}
            defaultValueByIndex={nightMode}
            onSelect={(_item, index) => {
              const mode =
                index === 1
                  ? NavigationNightMode.FORCE_DAY
                  : index === 2
                    ? NavigationNightMode.FORCE_NIGHT
                    : NavigationNightMode.AUTO;
              handleNightModeChange(mode);
            }}
            renderButton={(selectedItem, _isOpened) => (
              <View style={ControlStyles.dropdownButton}>
                <Text style={ControlStyles.dropdownButtonText}>
                  {selectedItem || nightModeOptions[nightMode]}
                </Text>
              </View>
            )}
            renderItem={(item, _index, isSelected) => (
              <View
                style={[
                  ControlStyles.dropdownItem,
                  isSelected && ControlStyles.dropdownItemSelected,
                ]}
              >
                <Text style={ControlStyles.dropdownItemText}>{item}</Text>
              </View>
            )}
            dropdownStyle={ControlStyles.dropdownMenu}
          />
        </View>

        <TextInput
          style={ControlStyles.input}
          onChangeText={setCustomMessageType}
          value={customMessageType}
          placeholder="Message Type"
          placeholderTextColor="#000"
        />
        <TextInput
          style={ControlStyles.input}
          onChangeText={setCustomMessageData}
          value={customMessageData}
          placeholder='Data (JSON): {"key": "value"}'
          placeholderTextColor="#000"
          multiline
        />
        <ExampleAppButton
          title="Send Custom Message to Native"
          onPress={sendCustomMessage}
        />
      </Accordion>

      {/* Map Appearance Settings */}
      <Accordion title="Auto Map Appearance">
        <View style={ControlStyles.rowContainer}>
          <Text style={ControlStyles.rowLabel}>Indoor Maps</Text>
          <Switch value={indoorEnabled} onValueChange={toggleIndoorEnabled} />
        </View>
        <View style={ControlStyles.rowContainer}>
          <Text style={ControlStyles.rowLabel}>Traffic Layer</Text>
          <Switch value={trafficEnabled} onValueChange={toggleTrafficEnabled} />
        </View>
        <View style={ControlStyles.rowContainer}>
          <Text style={ControlStyles.rowLabel}>Compass</Text>
          <Switch value={compassEnabled} onValueChange={toggleCompassEnabled} />
        </View>
        <View style={ControlStyles.rowContainer}>
          <Text style={ControlStyles.rowLabel}>3D Buildings</Text>
          <Switch
            value={buildingsEnabled}
            onValueChange={toggleBuildingsEnabled}
          />
        </View>
      </Accordion>

      <MapsControls
        mapViewController={mapViewAutoController}
        mapType={mapType}
        onMapTypeChange={handleMapTypeChange}
        mapColorScheme={mapColorScheme}
        onMapColorSchemeChange={handleMapColorSchemeChange}
        myLocationEnabled={myLocationEnabled}
        onMyLocationChange={handleMyLocationChange}
      />
    </View>
  );
};

export default AutoControls;
