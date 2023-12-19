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

import {Button, ScrollView, Switch, Text, TextInput, View} from 'react-native';

import {
  MapType,
  MapViewController,
} from 'react-native-navigation-sdk/components/maps/mapView/types';
import {
  Circle,
  Marker,
  Polygon,
  Polyline,
} from 'react-native-navigation-sdk/components/maps/types';
import SelectDropdown from 'react-native-select-dropdown';
import styles from './styles';

export interface MapControlsProps {
  readonly mapViewController: MapViewController;
  readonly visible: boolean;
}

const MapsControls: React.FC<MapControlsProps> = ({
  mapViewController,
  visible,
}) => {
  const mapTypeOptions = ['None', 'Normal', 'Satellite', 'Terrain', 'Hybrid'];
  const [zoom, setZoom] = useState(15);
  const [enableLocationMarker, setEnableLocationMarker] = useState(true);
  const [latitude, onLatChanged] = useState('');
  const [longitude, onLngChanged] = useState('');

  const setZoomLevel = (zoomValue: number) => {
    mapViewController.setZoomLevel(zoomValue);
  };

  const setMyLocationButtonEnabled = (isOn: boolean) => {
    console.log('setMyLocationButtonEnabled', isOn);
    mapViewController.setMyLocationEnabled(isOn);
    mapViewController.setMyLocationButtonEnabled(isOn);
  };

  const moveCamera = () => {
    mapViewController.moveCamera({
      target: {lat: Number(latitude), lng: Number(longitude)},
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
    let result = await mapViewController.getCameraPosition();
    console.log(result);
  };

  const getUiSettings = async () => {
    let result = await mapViewController.getUiSettings();
    console.log(result);
  };

  const getIsMyLocationEnabled = async () => {
    let result = await mapViewController.isMyLocationEnabled();
    console.log(result);
  };

  const getMyLocation = async () => {
    let result = await mapViewController.getMyLocation();
    console.log(result);
  };

  const addMarker = async () => {
    const cameraPosition = await mapViewController.getCameraPosition();

    const marker: Marker = await mapViewController.addMarker({
      position: cameraPosition.target,
      title: 'Marker test',
      visible: true,
      //snippet: markerOptions.snippet,
      //alpha: markerOptions.alpha,
      //rotation: markerOptions.rotation,
      //isFlat: markerOptions.flat,
      //isDraggable: markerOptions.draggable,
      //isVisible: markerOptions.visible,
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
    console.log('addpolyline');
    const cameraPosition = await mapViewController.getCameraPosition();

    console.log('cameraPosition:', cameraPosition);
    const latLngs = [];

    for (let idx = 0; idx < 100; idx++) {
      latLngs.push({
        lat: cameraPosition.target.lat + idx / 10000,
        lng: cameraPosition.target.lng + idx / 10000,
      });
    }
    console.log();

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
    const bermudaTriangle = [
      {lat: 25.774, lng: -80.19},
      {lat: 18.466, lng: -66.118},
      {lat: 32.321, lng: -64.757},
      {lat: 25.774, lng: -80.19},
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
      <Button title="Move camera" onPress={moveCamera} />
      <Button
        title="Zoom in"
        onPress={() => {
          setZoom(zoom + 1);
          setZoomLevel(zoom);
        }}
      />
      <Button
        title="Zoom Out"
        onPress={() => {
          setZoom(zoom - 1);
          setZoomLevel(zoom);
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
          onSelect={(selectedItem, index) => {
            setMapType(getDropdownIndexToMapType(index));
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

export default MapsControls;
