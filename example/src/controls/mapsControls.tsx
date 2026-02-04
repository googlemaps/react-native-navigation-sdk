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
import { showSnackbar } from '../helpers/snackbar';
import {
  MapColorScheme,
  type MapViewController,
  MapType,
  type Marker,
  type Circle,
  type Polyline,
  type Polygon,
  type GroundOverlay,
} from '@googlemaps/react-native-navigation-sdk';

export interface MapControlsProps {
  readonly mapViewController: MapViewController;
  readonly mapType?: MapType;
  readonly onMapTypeChange?: (mapType: MapType) => void;
  readonly mapColorScheme?: MapColorScheme;
  readonly onMapColorSchemeChange?: (scheme: MapColorScheme) => void;
  readonly myLocationEnabled?: boolean;
  readonly myLocationButtonEnabled?: boolean;
  readonly onMyLocationChange?: (
    enabled: boolean,
    buttonEnabled: boolean
  ) => void;
  // UI Settings
  readonly compassEnabled?: boolean;
  readonly onCompassEnabledChange?: (enabled: boolean) => void;
  readonly mapToolbarEnabled?: boolean;
  readonly onMapToolbarEnabledChange?: (enabled: boolean) => void;
  readonly indoorEnabled?: boolean;
  readonly onIndoorEnabledChange?: (enabled: boolean) => void;
  readonly indoorLevelPickerEnabled?: boolean;
  readonly onIndoorLevelPickerEnabledChange?: (enabled: boolean) => void;
  readonly rotateGesturesEnabled?: boolean;
  readonly onRotateGesturesEnabledChange?: (enabled: boolean) => void;
  readonly scrollGesturesEnabled?: boolean;
  readonly onScrollGesturesEnabledChange?: (enabled: boolean) => void;
  readonly scrollGesturesDuringRotateOrZoomEnabled?: boolean;
  readonly onScrollGesturesDuringRotateOrZoomEnabledChange?: (
    enabled: boolean
  ) => void;
  readonly tiltGesturesEnabled?: boolean;
  readonly onTiltGesturesEnabledChange?: (enabled: boolean) => void;
  readonly zoomControlsEnabled?: boolean;
  readonly onZoomControlsEnabledChange?: (enabled: boolean) => void;
  readonly zoomGesturesEnabled?: boolean;
  readonly onZoomGesturesEnabledChange?: (enabled: boolean) => void;
}

export const defaultZoom: number = 15;

const MapsControls: React.FC<MapControlsProps> = ({
  mapViewController,
  mapType = MapType.NORMAL,
  onMapTypeChange,
  mapColorScheme = MapColorScheme.FOLLOW_SYSTEM,
  onMapColorSchemeChange,
  myLocationEnabled = false,
  myLocationButtonEnabled: _myLocationButtonEnabled = true,
  onMyLocationChange,
  // UI Settings
  compassEnabled = true,
  onCompassEnabledChange,
  mapToolbarEnabled = true,
  onMapToolbarEnabledChange,
  indoorEnabled = true,
  onIndoorEnabledChange,
  indoorLevelPickerEnabled = true,
  onIndoorLevelPickerEnabledChange,
  rotateGesturesEnabled = true,
  onRotateGesturesEnabledChange,
  scrollGesturesEnabled = true,
  onScrollGesturesEnabledChange,
  scrollGesturesDuringRotateOrZoomEnabled = true,
  onScrollGesturesDuringRotateOrZoomEnabledChange,
  tiltGesturesEnabled = true,
  onTiltGesturesEnabledChange,
  zoomControlsEnabled = true,
  onZoomControlsEnabledChange,
  zoomGesturesEnabled = true,
  onZoomGesturesEnabledChange,
}) => {
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
  const [latitude, onLatChanged] = useState('');
  const [longitude, onLngChanged] = useState('');
  const [customPaddingEnabled, setCustomPaddingEnabled] = useState(false);

  useEffect(() => {
    if (zoom !== null) {
      mapViewController.setZoomLevel(zoom);
    }
  }, [mapViewController, zoom]);

  const setMyLocationButtonEnabled = (isOn: boolean) => {
    onMyLocationChange?.(isOn, isOn);
  };

  const moveCamera = () => {
    mapViewController.moveCamera({
      target: { lat: Number(latitude), lng: Number(longitude) },
      zoom: 1,
      bearing: 60,
      tilt: 60,
    });
  };

  const setMapType = (newMapType: MapType) => {
    onMapTypeChange?.(newMapType);
  };

  const getMapTypeToDropdownIndex = (type: MapType) => {
    switch (type) {
      case MapType.NONE:
        return 0;
      case MapType.NORMAL:
        return 1;
      case MapType.SATELLITE:
        return 2;
      case MapType.TERRAIN:
        return 3;
      case MapType.HYBRID:
        return 4;
      default:
        return 1;
    }
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
    showSnackbar(
      `Camera: ${result.target.lat.toFixed(4)}, ${result.target.lng.toFixed(4)} zoom:${result.zoom}`
    );
  };

  const getUiSettings = async () => {
    const result = await mapViewController.getUiSettings();
    showSnackbar(
      `UI Settings:\n` +
        `- Compass: ${result.isCompassEnabled}\n` +
        `- Map Toolbar: ${result.isMapToolbarEnabled}\n` +
        `- Indoor Picker: ${result.isIndoorLevelPickerEnabled}\n` +
        `- Rotate: ${result.isRotateGesturesEnabled}\n` +
        `- Scroll: ${result.isScrollGesturesEnabled}\n` +
        `- Scroll (rotate/zoom): ${result.isScrollGesturesEnabledDuringRotateOrZoom}\n` +
        `- Tilt: ${result.isTiltGesturesEnabled}\n` +
        `- Zoom Controls: ${result.isZoomControlsEnabled}\n` +
        `- Zoom Gestures: ${result.isZoomGesturesEnabled}`,
      5000,
      true,
      12
    );
  };

  const getIsMyLocationEnabled = async () => {
    const result = await mapViewController.isMyLocationEnabled();
    showSnackbar(`My location enabled: ${result}`);
  };

  const getMyLocation = async () => {
    const result = await mapViewController.getMyLocation();
    if (result) {
      showSnackbar(
        `My location: ${result.lat.toFixed(4)}, ${result.lng.toFixed(4)}`
      );
    } else {
      showSnackbar('My location not available');
    }
  };

  const addMarker = async (imgPath?: string) => {
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

    showSnackbar(`Marker added: ${marker.id}`);
  };

  const addCustomMarker = async () => {
    addMarker('circle.png');
  };

  const addCircle = async () => {
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

    showSnackbar(`Circle added: ${circle.id}`);
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

    const polyline: Polyline = await mapViewController.addPolyline({
      points: latLngs,
      width: 10,
      color: 'rgba(0,0,255,0.7)',
      visible: true,
      clickable: true,
    });

    showSnackbar(`Polyline added: ${polyline.id}`);
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
      strokeColor: '#ff66',
      fillColor: '#f52525',
      strokeWidth: 10,
      visible: true,
      points: bermudaTriangle,
      clickable: true,
    });

    showSnackbar(`Polygon added: ${polygon.id}`);
  };

  /**
   * Add a ground overlay using location-based positioning.
   * This uses a location with width/height in meters.
   * Note: On iOS, zoomLevel is required for location-based overlays.
   */
  const addGroundOverlayWithPosition = async () => {
    const cameraPosition = await mapViewController.getCameraPosition();

    const groundOverlay: GroundOverlay =
      await mapViewController.addGroundOverlay({
        imgPath: 'circle.png',
        location: cameraPosition.target,
        width: 500, // 500 meters width
        height: 500, // 500 meters height (optional - preserves aspect ratio if omitted)
        zoomLevel: 14, // Required for iOS, optional for Android
        bearing: 0,
        transparency: 0.3, // 30% transparent
        clickable: true,
        visible: true,
      });

    showSnackbar(`Ground overlay added: ${groundOverlay.id}`);
  };

  /**
   * Add a ground overlay using bounds-based positioning.
   * This stretches the overlay to fit within the specified LatLngBounds.
   * This is the most reliable cross-platform method.
   */
  const addGroundOverlayWithBounds = async () => {
    const cameraPosition = await mapViewController.getCameraPosition();
    const cameraLat = cameraPosition.target.lat;
    const cameraLng = cameraPosition.target.lng;
    const delta = 0.005; // Approximately 500m at mid-latitudes

    const groundOverlay: GroundOverlay =
      await mapViewController.addGroundOverlay({
        imgPath: 'circle.png',
        bounds: {
          southWest: { lat: cameraLat - delta, lng: cameraLng - delta },
          northEast: { lat: cameraLat + delta, lng: cameraLng + delta },
        },
        bearing: 0,
        transparency: 0.3, // 30% transparent
        clickable: true,
        visible: true,
      });

    showSnackbar(`Ground overlay added: ${groundOverlay.id}`);
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
        <ExampleAppButton
          title="Add ground overlay (position)"
          onPress={addGroundOverlayWithPosition}
        />
        <ExampleAppButton
          title="Add ground overlay (bounds)"
          onPress={addGroundOverlayWithBounds}
        />
        <ExampleAppButton title="Clear map view" onPress={clearMapView} />
      </Accordion>

      {/* Map Appearance */}
      <Accordion title="Map Appearance">
        <View style={ControlStyles.rowContainer}>
          <Text style={ControlStyles.rowLabel}>Map type</Text>
          <SelectDropdown
            data={mapTypeOptions}
            defaultValueByIndex={getMapTypeToDropdownIndex(mapType)}
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
            title={myLocationEnabled ? 'Disable' : 'Enable'}
            onPress={() => {
              setMyLocationButtonEnabled(!myLocationEnabled);
            }}
          />
        </View>
        <View style={ControlStyles.rowContainer}>
          <Text style={ControlStyles.rowLabel}>Compass</Text>
          <ExampleAppButton
            title={compassEnabled ? 'Disable' : 'Enable'}
            onPress={() => onCompassEnabledChange?.(!compassEnabled)}
          />
        </View>
        <View style={ControlStyles.rowContainer}>
          <Text style={ControlStyles.rowLabel}>Map Toolbar</Text>
          <ExampleAppButton
            title={mapToolbarEnabled ? 'Disable' : 'Enable'}
            onPress={() => onMapToolbarEnabledChange?.(!mapToolbarEnabled)}
          />
        </View>
        <View style={ControlStyles.rowContainer}>
          <Text style={ControlStyles.rowLabel}>Indoor Maps</Text>
          <ExampleAppButton
            title={indoorEnabled ? 'Disable' : 'Enable'}
            onPress={() => onIndoorEnabledChange?.(!indoorEnabled)}
          />
        </View>
        <View style={ControlStyles.rowContainer}>
          <Text style={ControlStyles.rowLabel}>Indoor Picker</Text>
          <ExampleAppButton
            title={indoorLevelPickerEnabled ? 'Disable' : 'Enable'}
            onPress={() =>
              onIndoorLevelPickerEnabledChange?.(!indoorLevelPickerEnabled)
            }
          />
        </View>
        <ExampleAppButton title="Get UI Settings" onPress={getUiSettings} />
        <ExampleAppButton title="Get My location" onPress={getMyLocation} />
        <ExampleAppButton
          title="Get My location enabled"
          onPress={getIsMyLocationEnabled}
        />
      </Accordion>

      {/* Gestures */}
      <Accordion title="Gesture Settings">
        <View style={ControlStyles.rowContainer}>
          <Text style={ControlStyles.rowLabel}>Rotate gestures</Text>
          <ExampleAppButton
            title={rotateGesturesEnabled ? 'Disable' : 'Enable'}
            onPress={() =>
              onRotateGesturesEnabledChange?.(!rotateGesturesEnabled)
            }
          />
        </View>
        <View style={ControlStyles.rowContainer}>
          <Text style={ControlStyles.rowLabel}>Scroll gestures</Text>
          <ExampleAppButton
            title={scrollGesturesEnabled ? 'Disable' : 'Enable'}
            onPress={() =>
              onScrollGesturesEnabledChange?.(!scrollGesturesEnabled)
            }
          />
        </View>
        <View style={ControlStyles.rowContainer}>
          <Text style={ControlStyles.rowLabel}>Scroll during rotate/zoom</Text>
          <ExampleAppButton
            title={
              scrollGesturesDuringRotateOrZoomEnabled ? 'Disable' : 'Enable'
            }
            onPress={() =>
              onScrollGesturesDuringRotateOrZoomEnabledChange?.(
                !scrollGesturesDuringRotateOrZoomEnabled
              )
            }
          />
        </View>
        <View style={ControlStyles.rowContainer}>
          <Text style={ControlStyles.rowLabel}>Tilt gestures</Text>
          <ExampleAppButton
            title={tiltGesturesEnabled ? 'Disable' : 'Enable'}
            onPress={() => onTiltGesturesEnabledChange?.(!tiltGesturesEnabled)}
          />
        </View>
        <View style={ControlStyles.rowContainer}>
          <Text style={ControlStyles.rowLabel}>Zoom controls</Text>
          <ExampleAppButton
            title={zoomControlsEnabled ? 'Disable' : 'Enable'}
            onPress={() => onZoomControlsEnabledChange?.(!zoomControlsEnabled)}
          />
        </View>
        <View style={ControlStyles.rowContainer}>
          <Text style={ControlStyles.rowLabel}>Zoom gestures</Text>
          <ExampleAppButton
            title={zoomGesturesEnabled ? 'Disable' : 'Enable'}
            onPress={() => onZoomGesturesEnabledChange?.(!zoomGesturesEnabled)}
          />
        </View>
      </Accordion>
    </View>
  );
};

export default MapsControls;
