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

import { Button, Switch, Text, TextInput, View } from 'react-native';

import SelectDropdown from 'react-native-select-dropdown';
import styles from '../styles';
import {
  type MapViewController,
  MapType,
  type Marker,
  type Circle,
  type Polyline,
  type Polygon,
} from '@googlemaps/react-native-navigation-sdk';
import {
  type MapNavControlsState,
  type MapNavControlsAction,
} from './mapNavControlsReducer';

export interface MapControlsProps {
  readonly mapViewController: MapViewController;
  readonly state: MapNavControlsState;
  readonly dispatch: React.Dispatch<MapNavControlsAction>;
}

export const defaultZoom: number = 15;

const MapsControls: React.FC<MapControlsProps> = ({
  mapViewController,
  state: {
    mapType,
    tripProgressBarEnabled,
    padding,
    mapId,
    mapToolbarEnabled,
    indoorEnabled,
    trafficEnabled,
    compassEnabled,
    myLocationButtonEnabled,
    buildingsEnabled,
    rotateGesturesEnabled,
    scrollGesturesEnabled,
    scrollGesturesEnabledDuringRotateOrZoom,
    tiltGesturesEnabled,
    zoomControlsEnabled,
    zoomGesturesEnabled,
  },
  dispatch,
}) => {
  const mapTypeOptions = ['None', 'Normal', 'Satellite', 'Terrain', 'Hybrid'];

  const [latitude, onLatChanged] = useState<string>('');
  const [longitude, onLngChanged] = useState<string>('');
  const [localMapId, setLocalMapId] = useState<string | null>(mapId || null);

  const moveCamera = () => {
    if (!latitude || !longitude) {
      return;
    }
    mapViewController.moveCamera({
      target: { lat: Number(latitude), lng: Number(longitude) },
      zoom: 1,
      bearing: 60,
      tilt: 60,
    });
  };

  const zoomIn = () => {
    mapViewController.getCameraPosition().then((cameraPosition) => {
      const newZoom = (cameraPosition.zoom ?? defaultZoom) + 1;
      mapViewController.setZoomLevel(newZoom);
    });
  };

  const zoomOut = () => {
    mapViewController.getCameraPosition().then((cameraPosition) => {
      const newZoom = (cameraPosition.zoom ?? defaultZoom) - 1;
      mapViewController.setZoomLevel(newZoom);
    });
  };

  const getDropdownIndexToMapType = (index: number) => {
    switch (index) {
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
        id: getNextMarkerId(),
        zIndex: 1,
      });

      console.log('Marker added', marker);
    } catch (e) {
      console.error('Error adding marker:', e);
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
        fillColor: '#55E5', // #RGBA
        strokeColor: '#000', // #RGB
        strokeWidth: 5,
        visible: true,
        clickable: true,
        id: getNextCircleId(),
        zIndex: 1,
      });

      console.log('Circle added', circle);
    } catch (e) {
      console.error('Error adding circle:', e);
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
        color: '#f52525ee', // #RRGGBBAA
        visible: true,
        clickable: true,
        id: getNextPolylineId(),
      });

      console.log('Polyline added', polyline);
    } catch (e) {
      console.error('Error adding polyline:', e);
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
        strokeColor: '#F8F',
        fillColor: '#f52525aa', // #RRGGBBAA
        strokeWidth: 10,
        visible: true,
        points: bermudaTriangle,
        clickable: true,
        id: getNextPolygonId(),
      });

      console.log('Polygon added', polygon);
    } catch (e) {
      console.error('Error adding polygon:', e);
    }
  };

  const clearMapView = () => {
    try {
      mapViewController.clearMapView();
    } catch (e) {
      console.error('Error while clearing map view', e);
    }
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
      <Button
        title="Move camera"
        onPress={moveCamera}
        disabled={!latitude || !longitude}
      />
      <Button
        title="Zoom in"
        onPress={() => {
          zoomIn();
        }}
      />
      <Button
        title="Zoom Out"
        onPress={() => {
          zoomOut();
        }}
      />
      <Button title="Add marker" onPress={() => addMarker()} />
      <Button title="Add custom marker" onPress={() => addCustomMarker()} />
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
          value={tripProgressBarEnabled}
          onValueChange={(value: boolean) => {
            dispatch({ type: 'setMyLocationEnabled', value });
            dispatch({ type: 'setTripProgressBarEnabled', value });
          }}
        />
      </View>
      <Button
        title="Toggle padding"
        onPress={() =>
          dispatch({
            type: 'setPadding',
            value: padding
              ? null
              : { top: 100, bottom: 100, left: 0, right: 0 },
          })
        }
      />
      <View style={styles.rowContainer}>
        <Text>Map type</Text>
        <SelectDropdown
          data={mapTypeOptions}
          defaultValue={mapTypeOptions[mapType]}
          onSelect={(_selectedItem, index) => {
            dispatch({
              type: 'setMapType',
              value: getDropdownIndexToMapType(index),
            });
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
      <View style={styles.controlButtonGap} />
      <TextInput
        style={styles.input}
        onChangeText={setLocalMapId}
        value={localMapId ?? ''}
        placeholder="MapId"
        placeholderTextColor="#000"
      />
      <Button
        title="Use mapId"
        onPress={() =>
          dispatch({
            type: 'setMapId',
            value: localMapId !== '' ? localMapId : null,
          })
        }
      />
      <View style={styles.rowContainer}>
        <Text>Map Toolbar</Text>
        <Switch
          value={mapToolbarEnabled}
          onValueChange={(value) =>
            dispatch({ type: 'setMapToolbarEnabled', value })
          }
        />
      </View>
      <View style={styles.rowContainer}>
        <Text>Indoor Enabled</Text>
        <Switch
          value={indoorEnabled}
          onValueChange={(value) =>
            dispatch({ type: 'setIndoorEnabled', value })
          }
        />
      </View>
      <View style={styles.rowContainer}>
        <Text>Traffic Enabled</Text>
        <Switch
          value={trafficEnabled}
          onValueChange={(value) =>
            dispatch({ type: 'setTrafficEnabled', value })
          }
        />
      </View>
      <View style={styles.rowContainer}>
        <Text>Compass Enabled</Text>
        <Switch
          value={compassEnabled}
          onValueChange={(value) =>
            dispatch({ type: 'setCompassEnabled', value })
          }
        />
      </View>
      <View style={styles.rowContainer}>
        <Text>My Location Button</Text>
        <Switch
          value={myLocationButtonEnabled}
          onValueChange={(value) =>
            dispatch({ type: 'setMyLocationButtonEnabled', value })
          }
        />
      </View>
      <View style={styles.rowContainer}>
        <Text>Buildings Enabled</Text>
        <Switch
          value={buildingsEnabled}
          onValueChange={(value) =>
            dispatch({ type: 'setBuildingsEnabled', value })
          }
        />
      </View>
      <View style={styles.rowContainer}>
        <Text>Rotate Gestures</Text>
        <Switch
          value={rotateGesturesEnabled}
          onValueChange={(value) =>
            dispatch({ type: 'setRotateGesturesEnabled', value })
          }
        />
      </View>
      <View style={styles.rowContainer}>
        <Text>Scroll Gestures</Text>
        <Switch
          value={scrollGesturesEnabled}
          onValueChange={(value) =>
            dispatch({ type: 'setScrollGesturesEnabled', value })
          }
        />
      </View>
      <View style={styles.rowContainer}>
        <Text>Scroll Gestures During Rotate/Zoom</Text>
        <Switch
          value={scrollGesturesEnabledDuringRotateOrZoom}
          onValueChange={(value) =>
            dispatch({
              type: 'setScrollGesturesEnabledDuringRotateOrZoom',
              value,
            })
          }
        />
      </View>
      <View style={styles.rowContainer}>
        <Text>Tilt Gestures</Text>
        <Switch
          value={tiltGesturesEnabled}
          onValueChange={(value) =>
            dispatch({ type: 'setTiltGesturesEnabled', value })
          }
        />
      </View>
      <View style={styles.rowContainer}>
        <Text>Zoom Controls</Text>
        <Switch
          value={zoomControlsEnabled}
          onValueChange={(value) =>
            dispatch({ type: 'setZoomControlsEnabled', value })
          }
        />
      </View>
      <View style={styles.rowContainer}>
        <Text>Zoom Gestures</Text>
        <Switch
          value={zoomGesturesEnabled}
          onValueChange={(value) =>
            dispatch({ type: 'setZoomGesturesEnabled', value })
          }
        />
      </View>
    </View>
  );
};

// Helpers to keep track of the custom ids for markers and circles.
let markerIndex = 0;
let circleIndex = 0;
let polylineIndex = 0;
let polygonIndex = 0;

const getNextMarkerId = () => {
  markerIndex += 1;
  return `marker_${markerIndex}`;
};
const getNextCircleId = () => {
  circleIndex += 1;
  return `circle_${circleIndex}`;
};
const getNextPolylineId = () => {
  polylineIndex += 1;
  return `polyline_${polylineIndex}`;
};
const getNextPolygonId = () => {
  polygonIndex += 1;
  return `polygon_${polygonIndex}`;
};

export default MapsControls;
