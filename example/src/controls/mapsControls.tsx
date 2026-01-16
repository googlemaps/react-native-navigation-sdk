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

import React, { useEffect, useState } from 'react';

import { Text, TextInput, View } from 'react-native';
import { ExampleAppButton } from './ExampleAppButton';
import { Accordion } from './Accordion';

import SelectDropdown from 'react-native-select-dropdown';
import { ControlStyles } from '../styles/components';
import {
  MapColorScheme,
  type MapViewController,
  MapType,
  type Marker,
  type Circle,
  type Polyline,
  type Polygon,
} from '@googlemaps/react-native-navigation-sdk';

export type MapsControlsProps = {
  readonly mapViewController: MapViewController;
  readonly mapColorScheme?: MapColorScheme;
  readonly onMapColorSchemeChange?: (scheme: MapColorScheme) => void;
  readonly showMessage?: (message: string) => void;
};

export const defaultZoom: number = 15;

const MapsControls = ({
  mapViewController,
  mapColorScheme = MapColorScheme.FOLLOW_SYSTEM,
  onMapColorSchemeChange,
  showMessage,
}: MapsControlsProps) => {
  const log = (message: string) => {
    if (showMessage) {
      showMessage(message);
    } else {
      console.log(message);
    }
  };
  const mapTypeOptions = ['None', 'Normal', 'Satellite', 'Terrain', 'Hybrid'];
  const colorSchemeOptions = ['Follow System', 'Light', 'Dark'];
  const colorSchemeIndex =
    mapColorScheme === MapColorScheme.LIGHT
      ? 1
      : mapColorScheme === MapColorScheme.DARK
        ? 2
        : 0;
  const colorSchemeLabel = colorSchemeOptions[colorSchemeIndex];
  const [zoom, setZoom] = useState<number | null>(null);
  const [enableLocationMarker, setEnableLocationMarker] = useState(true);
  const [latitude, onLatChanged] = useState('');
  const [longitude, onLngChanged] = useState('');
  const [customPaddingEnabled, setCustomPaddingEnabled] = useState(false);

  useEffect(() => {
    if (zoom !== null) {
      mapViewController.setZoomLevel(zoom);
    }
  }, [mapViewController, zoom]);

  const setMyLocationButtonEnabled = (isOn: boolean) => {
    log(`setMyLocationButtonEnabled: ${isOn}`);
    mapViewController.setMyLocationEnabled(isOn);
    mapViewController.setMyLocationButtonEnabled(isOn);
  };

  const moveCamera = () => {
    mapViewController.moveCamera({
      target: { lat: Number(latitude), lng: Number(longitude) },
      zoom: 1,
      bearing: 60,
      tilt: 60,
    });
  };

  const setMapType = (mapType: MapType) => {
    log(`setMapType: ${mapType}`);
    mapViewController.setMapType(mapType);
  };

  const getDropdownIndexToMapType = (index: number) => {
    switch (index) {
      case 0:
        return MapType.NONE;
      case 1:
        return MapType.NORMAL;
      case 2:
        return MapType.SATELLITE;
      case 3:
        /** MapType.TERRAIN does not work during navigation. */
        return MapType.TERRAIN;
      case 4:
        return MapType.HYBRID;
      default:
        return MapType.NONE;
    }
  };

  const getCameraPositionClicked = async () => {
    const result = await mapViewController.getCameraPosition();
    log(`Camera position: ${JSON.stringify(result)}`);
  };

  const getUiSettings = async () => {
    const result = await mapViewController.getUiSettings();
    log(`UI Settings: ${JSON.stringify(result)}`);
  };

  const getIsMyLocationEnabled = async () => {
    const result = await mapViewController.isMyLocationEnabled();
    log(`My location enabled: ${result}`);
  };

  const getMyLocation = async () => {
    try {
      const result = await mapViewController.getMyLocation();
      log(`My location: ${JSON.stringify(result)}`);
    } catch (error) {
      log(`Error getting location: ${error}`);
    }
  };

  const addMarker = async (imgPath?: string) => {
    try {
      const cameraPosition = await mapViewController.getCameraPosition();

      const marker: Marker = await mapViewController.addMarker({
        position: cameraPosition.target,
        visible: true,
        title: 'Marker test',
        snippet: 'Marker test',
        alpha: 0.8,
        rotation: 0,
        flat: false,
        draggable: true,
        imgPath: imgPath,
      });

      log(`Added marker: ${marker.id}`);
    } catch (error) {
      log(`Error adding marker: ${error}`);
    }
  };

  const addCustomMarker = async () => {
    addMarker('circle.png');
  };

  const addCircle = async () => {
    try {
      const cameraPosition = await mapViewController.getCameraPosition();

      const circle: Circle = await mapViewController.addCircle({
        center: cameraPosition.target,
        radius: 100,
        fillColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 5,
        visible: true,
        clickable: true,
      });

      log(`Added circle: ${circle.id}`);
    } catch (error) {
      log(`Error adding circle: ${error}`);
    }
  };

  const addPolyline = async () => {
    try {
      const cameraPosition = await mapViewController.getCameraPosition();

      const latLngs = [];

      for (let idx = 0; idx < 100; idx++) {
        latLngs.push({
          lat: cameraPosition.target.lat + idx / 10000,
          lng: cameraPosition.target.lng + idx / 10000,
        });
      }

      const polyline: Polyline = await mapViewController.addPolyline({
        points: latLngs,
        width: 10,
        color: '#f52525',
        visible: true,
        clickable: true,
      });

      log(`Added polyline: ${polyline.id}`);
    } catch (error) {
      log(`Error adding polyline: ${error}`);
    }
  };

  const addPolygon = async () => {
    try {
      const cameraPosition = await mapViewController.getCameraPosition();
      const cameraLat = cameraPosition.target.lat;
      const cameraLng = cameraPosition.target.lng;
      const delta = 0.05;
      const bermudaTriangle = [
        { lat: cameraLat - delta, lng: cameraLng - delta },
        { lat: cameraLat - delta, lng: cameraLng + delta },
        { lat: cameraLat + delta, lng: cameraLng + delta },
        { lat: cameraLat - delta, lng: cameraLng - delta },
      ];

      const polygon: Polygon = await mapViewController.addPolygon({
        strokeColor: '#FF00FF',
        fillColor: '#f52525',
        strokeWidth: 10,
        visible: true,
        points: bermudaTriangle,
        clickable: true,
      });

      log(`Added polygon: ${polygon.id}`);
    } catch (error) {
      log(`Error adding polygon: ${error}`);
    }
  };

  const clearMapView = () => {
    mapViewController.clearMapView();
  };

  const toggleCustomPadding = () => {
    if (!customPaddingEnabled) {
      // Enable custom paddings: more on top and bottom
      mapViewController.setPadding({
        top: 60,
        bottom: 40,
        left: 10,
        right: 10,
      });
    } else {
      // Disable: reset paddings
      mapViewController.setPadding({ top: 0, bottom: 0, left: 0, right: 0 });
    }
    setCustomPaddingEnabled(!customPaddingEnabled);
  };

  const setMapColorScheme = (index: number) => {
    const scheme =
      index === 1
        ? MapColorScheme.LIGHT
        : index === 2
          ? MapColorScheme.DARK
          : MapColorScheme.FOLLOW_SYSTEM;
    onMapColorSchemeChange?.(scheme);
  };

  return (
    <View>
      {/* Camera Controls */}
      <Accordion title="Camera Controls">
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
        <ExampleAppButton title="Move camera" onPress={moveCamera} />
        <ExampleAppButton
          title="Zoom in"
          onPress={() => {
            setZoom((zoom ?? defaultZoom) + 1);
          }}
        />
        <ExampleAppButton
          title="Zoom Out"
          onPress={() => {
            setZoom((zoom ?? defaultZoom) - 1);
          }}
        />
        <ExampleAppButton
          title="Get camera position"
          onPress={getCameraPositionClicked}
        />
      </Accordion>

      {/* Map Overlays */}
      <Accordion title="Map Overlays">
        <ExampleAppButton title="Add marker" onPress={() => addMarker()} />
        <ExampleAppButton
          title="Add custom marker"
          onPress={() => addCustomMarker()}
        />
        <ExampleAppButton title="Add circle" onPress={addCircle} />
        <ExampleAppButton title="Add polyline" onPress={addPolyline} />
        <ExampleAppButton title="Add polygon" onPress={addPolygon} />
        <ExampleAppButton title="Clear map view" onPress={clearMapView} />
      </Accordion>

      {/* Map Appearance */}
      <Accordion title="Map Appearance">
        <View style={ControlStyles.rowContainer}>
          <Text style={ControlStyles.rowLabel}>Map type</Text>
          <SelectDropdown
            data={mapTypeOptions}
            onSelect={(_selectedItem, index) => {
              setMapType(getDropdownIndexToMapType(index));
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
          <Text style={ControlStyles.rowLabel}>Map color scheme</Text>
          <SelectDropdown
            data={colorSchemeOptions}
            defaultValueByIndex={colorSchemeIndex}
            onSelect={(_item, index) => {
              setMapColorScheme(index);
            }}
            renderButton={(selectedItem, _isOpened) => {
              return (
                <View style={ControlStyles.dropdownButton}>
                  <Text style={ControlStyles.dropdownButtonText}>
                    {selectedItem || colorSchemeLabel}
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
          <Text style={ControlStyles.rowLabel}>Custom map paddings</Text>
          <ExampleAppButton
            title={customPaddingEnabled ? 'Disable' : 'Enable'}
            onPress={toggleCustomPadding}
          />
        </View>
      </Accordion>

      {/* Location & UI */}
      <Accordion title="Location & UI Settings">
        <View style={ControlStyles.rowContainer}>
          <Text style={ControlStyles.rowLabel}>Location marker</Text>
          <ExampleAppButton
            title={enableLocationMarker ? 'Disable' : 'Enable'}
            onPress={() => {
              setEnableLocationMarker(!enableLocationMarker);
              setMyLocationButtonEnabled(!enableLocationMarker);
            }}
          />
        </View>
        <ExampleAppButton title="Get UI Settings" onPress={getUiSettings} />
        <ExampleAppButton title="Get My location" onPress={getMyLocation} />
        <ExampleAppButton
          title="Get My location enabled"
          onPress={getIsMyLocationEnabled}
        />
      </Accordion>
    </View>
  );
};

export default MapsControls;
