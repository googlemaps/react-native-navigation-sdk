/**
 * Copyright 2025 Google LLC
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

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { CommonStyles, MapStyles } from '../styles/components';
import {
  NavigationView,
  MapView,
  type NavigationViewController,
  type NavigationCallbacks,
  type MapViewCallbacks,
  type NavigationViewCallbacks,
  useNavigation,
} from '@googlemaps/react-native-navigation-sdk';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import usePermissions from '../checkPermissions';

const MapIdScreen = () => {
  const [mapIdInput, setMapIdInput] = useState<string>('');
  const [confirmedMapId, setConfirmedMapId] = useState<string | null>(null);
  const [navigationViewController, setNavigationViewController] =
    useState<NavigationViewController | null>(null);
  const [navigationUiEnabled, setNavigationUIEnabled] = useState(true);
  const [nightMode, setNightMode] = useState<number>(0); // 0: Auto, 1: Force Day, 2: Force Night
  const insets = useSafeAreaInsets();
  const { arePermissionsApproved } = usePermissions();
  const { navigationController, addListeners, removeListeners } =
    useNavigation();

  const handleSetMapId = useCallback(() => {
    if (mapIdInput.trim() === '') {
      Alert.alert(
        'Empty Map ID',
        'Are you sure you want to use the default map styling?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Use Default',
            onPress: () => setConfirmedMapId(''),
          },
        ]
      );
    } else {
      setConfirmedMapId(mapIdInput.trim());
    }
  }, [mapIdInput]);

  const handleReset = useCallback(() => {
    setConfirmedMapId(null);
    setNavigationUIEnabled(false);
  }, []);

  const toggleNavigationUiEnabled = useCallback(
    (isOn: boolean) => {
      console.log('setNavigationUIEnabled', isOn);
      setNavigationUIEnabled(isOn);
      if (navigationViewController) {
        navigationViewController.setNavigationUIEnabled(isOn);
      }
    },
    [navigationViewController]
  );

  const toggleNightMode = useCallback(() => {
    // Cycle through: 0 (Auto) -> 1 (Force Day) -> 2 (Force Night) -> 0 (Auto)
    const newMode = (nightMode + 1) % 3;
    setNightMode(newMode);

    if (navigationViewController) {
      navigationViewController.setNightMode(newMode);
      console.log('setNightMode on NavigationView:', newMode);
    }
  }, [nightMode, navigationViewController]);

  const getNightModeLabel = () => {
    switch (nightMode) {
      case 0:
        return 'Auto';
      case 1:
        return 'Day';
      case 2:
        return 'Night';
      default:
        return 'Auto';
    }
  };

  const onNavigationReady = useCallback(async () => {
    if (navigationViewController != null) {
      await navigationViewController.setNavigationUIEnabled(true);
      console.log('Navigation ready with mapId:', confirmedMapId);
    }
  }, [navigationViewController, confirmedMapId]);

  const onNavigationMapReady = useCallback(async () => {
    console.log(
      'NavigationView map is ready, initializing navigation session...'
    );
    try {
      await navigationController.init();
      console.log('Navigation session initialized successfully');
    } catch (error) {
      console.error('Error initializing navigation session', error);
      Alert.alert(
        'Navigation Error',
        'Failed to initialize navigation session'
      );
    }
  }, [navigationController]);

  const navigationCallbacks: NavigationCallbacks = useMemo(
    () => ({
      onNavigationReady,
    }),
    [onNavigationReady]
  );

  const navigationMapViewCallbacks: MapViewCallbacks = useMemo(
    () => ({
      onMapReady: onNavigationMapReady,
    }),
    [onNavigationMapReady]
  );

  const navigationViewCallbacks: NavigationViewCallbacks = useMemo(
    () => ({
      onRecenterButtonClick: () => console.log('Recenter button clicked'),
      onPromptVisibilityChanged: visible =>
        console.log('Prompt visibility changed:', visible),
    }),
    []
  );

  useEffect(() => {
    addListeners(navigationCallbacks);
    return () => {
      removeListeners(navigationCallbacks);
    };
  }, [navigationCallbacks, addListeners, removeListeners]);

  if (!arePermissionsApproved) {
    return (
      <View style={CommonStyles.container}>
        <Text style={CommonStyles.errorText}>
          Location permissions are required to use this feature.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={CommonStyles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom }]}
    >
      {confirmedMapId === null ? (
        // Configuration screen
        <View style={styles.configContainer}>
          <Text style={CommonStyles.title}>
            Cloud-based Map Styling Example
          </Text>
          <Text style={CommonStyles.description}>
            Enter a Map ID from your Google Cloud Console to use custom map
            styling. Leave empty to use default styling.
          </Text>

          <View style={CommonStyles.inputContainer}>
            <Text style={CommonStyles.label}>Map ID:</Text>
            <TextInput
              style={CommonStyles.textInput}
              value={mapIdInput}
              onChangeText={setMapIdInput}
              placeholder="Enter your Map ID (optional)"
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={CommonStyles.buttonContainer}>
            <Button title="Set Map ID and Show Maps" onPress={handleSetMapId} />
          </View>

          <View style={CommonStyles.infoContainer}>
            <Text style={CommonStyles.infoTitle}>How to get a Map ID:</Text>
            <Text style={CommonStyles.infoText}>
              1. Go to Google Cloud Console{'\n'}
              2. Navigate to Maps Platform → Map Styles{'\n'}
              3. Create or select a map style{'\n'}
              4. Copy the Map ID
            </Text>
          </View>
        </View>
      ) : (
        // Maps display screen
        <View style={styles.mapsContainer}>
          <View style={CommonStyles.header}>
            <Text style={CommonStyles.headerText}>
              Map ID: {confirmedMapId || '(Default styling)'}
            </Text>
            <Button title="Change Map ID" onPress={handleReset} />
          </View>

          {/* NavigationView */}
          <View style={MapStyles.mapContainer}>
            <View style={styles.mapHeader}>
              <Text style={MapStyles.mapTitle}>Navigation View</Text>
              <View style={styles.headerButtons}>
                <Button
                  title={
                    navigationUiEnabled ? 'Disable Nav UI' : 'Enable Nav UI'
                  }
                  onPress={() =>
                    toggleNavigationUiEnabled(!navigationUiEnabled)
                  }
                />
                <Button
                  title={`Night: ${getNightModeLabel()}`}
                  onPress={toggleNightMode}
                />
              </View>
            </View>
            <NavigationView
              key={`navigation-${confirmedMapId}`}
              style={MapStyles.map}
              mapId={confirmedMapId || undefined}
              navigationViewCallbacks={navigationViewCallbacks}
              mapViewCallbacks={navigationMapViewCallbacks}
              onMapViewControllerCreated={_controller => {}}
              onNavigationViewControllerCreated={setNavigationViewController}
            />
          </View>

          {/* MapView */}
          <View style={MapStyles.mapContainer}>
            <Text style={MapStyles.mapTitle}>Map View</Text>
            <MapView
              key={`map-${confirmedMapId}`}
              style={MapStyles.map}
              mapId={confirmedMapId || undefined}
              onMapViewControllerCreated={_controller =>
                console.log('MapView controller created')
              }
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  configContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  mapsContainer: {
    flex: 1,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
});

export default MapIdScreen;
