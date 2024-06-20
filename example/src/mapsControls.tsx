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

import { Button, Switch, Text, TextInput, View } from 'react-native';

import SelectDropdown from 'react-native-select-dropdown';
import styles from './styles';
import {
  type MapViewController,
  MapType,
  type Marker,
  type Circle,
  type Polyline,
  type Polygon,
} from 'react-native-navigation-sdk';

export interface MapControlsProps {
  readonly mapViewController: MapViewController;
}

const MapsControls: React.FC<MapControlsProps> = ({ mapViewController }) => {
  const mapTypeOptions = ['None', 'Normal', 'Satellite', 'Terrain', 'Hybrid'];
  const [zoom, setZoom] = useState(15);
  const [enableLocationMarker, setEnableLocationMarker] = useState(true);
  const [latitude, onLatChanged] = useState('');
  const [longitude, onLngChanged] = useState('');

  useEffect(() => {
    mapViewController.setZoomLevel(zoom);
  }, [mapViewController, zoom]);

  const setMyLocationButtonEnabled = (isOn: boolean) => {
    console.log('setMyLocationButtonEnabled', isOn);
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
    console.log('setMapType', mapType);
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
        return MapType.TERRAIN;
      case 4:
        return MapType.HYBRID;
      default:
        return MapType.NONE;
    }
  };

  const getCameraPositionClicked = async () => {
    const result = await mapViewController.getCameraPosition();
    console.log(result);
  };

  const getUiSettings = async () => {
    const result = await mapViewController.getUiSettings();
    console.log(result);
  };

  const getIsMyLocationEnabled = async () => {
    const result = await mapViewController.isMyLocationEnabled();
    console.log(result);
  };

  const getMyLocation = async () => {
    const result = await mapViewController.getMyLocation();
    console.log(result);
  };

  const addMarker = async () => {
    const cameraPosition = await mapViewController.getCameraPosition();

    const marker: Marker = await mapViewController.addMarker({
      position: cameraPosition.target,
      visible: true,
      title: 'Marker test',
      snippet: 'Marker test',
      alpha: 0.8,
      rotation: 20,
      flat: false,
      draggable: true,
    });

    console.log(marker);
  };

  const addCircle = async () => {
    const cameraPosition = await mapViewController.getCameraPosition();

    const circle: Circle = await mapViewController.addCircle({
      center: cameraPosition.target,
      radius: 100,
      fillColor: '#FFFFFF',
      strokeColor: '#000000',
      strokeWidth: 100,
      visible: true,
      clickable: true,
    });

    console.log(circle);
  };

  const addPolyline = async () => {
    const cameraPosition = await mapViewController.getCameraPosition();

    const latLngs = [];

    for (let idx = 0; idx < 100; idx++) {
      latLngs.push({
        lat: cameraPosition.target.lat + idx / 10000,
        lng: cameraPosition.target.lng + idx / 10000,
      });
    }

    console.log(latLngs.length);
    const polyline: Polyline = await mapViewController.addPolyline({
      points: latLngs,
      width: 10,
      color: '#f52525',
      visible: true,
      clickable: true,
    });

    console.log(polyline);
  };

  const addPolygon = async () => {
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

    console.log(polygon);
  };

  const clearMapView = () => {
    mapViewController.clearMapView();
  };

  return (
    <View>
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
      <Button title="Move camera" onPress={moveCamera} />
      <Button
        title="Zoom in"
        onPress={() => {
          setZoom(zoom + 1);
        }}
      />
      <Button
        title="Zoom Out"
        onPress={() => {
          setZoom(zoom - 1);
        }}
      />
      <Button title="Add marker" onPress={addMarker} />
      <Button title="Add circle" onPress={addCircle} />
      <Button title="Add polyline" onPress={addPolyline} />
      <Button title="Add polygon" onPress={addPolygon} />
      <Button title="Clear map view" onPress={clearMapView} />
      <Button title="Get UI Settings" onPress={getUiSettings} />
      <Button title="Get My location" onPress={getMyLocation} />
      <Button
        title="Get My location enabled"
        onPress={getIsMyLocationEnabled}
      />
      <Button title="Get camera position" onPress={getCameraPositionClicked} />
      <View style={styles.rowContainer}>
        <Text>Location marker</Text>
        <Switch
          value={enableLocationMarker}
          onValueChange={() => {
            setEnableLocationMarker(!enableLocationMarker);
            setMyLocationButtonEnabled(!enableLocationMarker);
          }}
        />
      </View>
      <View style={styles.rowContainer}>
        <Text>Map type</Text>
        <SelectDropdown
          data={mapTypeOptions}
          onSelect={(_selectedItem, index) => {
            setMapType(getDropdownIndexToMapType(index));
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

export default MapsControls;
