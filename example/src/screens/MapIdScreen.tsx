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

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { ExampleAppButton } from '../controls/ExampleAppButton';
import { CommonStyles, MapStyles } from '../styles/components';
import {
  NavigationView,
  MapView,
  MapColorScheme,
  NavigationNightMode,
  NavigationSessionStatus,
  type NavigationViewController,
  useNavigation,
  NavigationUIEnabledPreference,
} from '@googlemaps/react-native-navigation-sdk';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import usePermissions from '../checkPermissions';

const MapIdScreen = () => {
  const [mapIdInput, setMapIdInput] = useState<string>('');
  const [confirmedMapId, setConfirmedMapId] = useState<string | null>(null);
  const [navigationViewController, setNavigationViewController] =
    useState<NavigationViewController | null>(null);
  const [navigationUiEnabled, setNavigationUIEnabled] = useState(true);
  const [navigationNightMode, setNavigationNightMode] =
    useState<NavigationNightMode>(NavigationNightMode.AUTO);
  const [mapColorScheme, setMapColorScheme] = useState<MapColorScheme>(
    MapColorScheme.FOLLOW_SYSTEM
  );
  const insets = useSafeAreaInsets();
  const { arePermissionsApproved } = usePermissions();
  const { navigationController } = useNavigation();

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
    setMapColorScheme(MapColorScheme.FOLLOW_SYSTEM);
    setNavigationNightMode(NavigationNightMode.AUTO);
  }, []);

  const toggleNavigationUiEnabled = useCallback(
    (isOn: boolean) => {
      setNavigationUIEnabled(isOn);
      navigationViewController?.setNavigationUIEnabled(isOn);
    },
    [navigationViewController]
  );

  const cycleMapColorScheme = useCallback(() => {
    const nextScheme =
      mapColorScheme === MapColorScheme.FOLLOW_SYSTEM
        ? MapColorScheme.LIGHT
        : mapColorScheme === MapColorScheme.LIGHT
          ? MapColorScheme.DARK
          : MapColorScheme.FOLLOW_SYSTEM;
    setMapColorScheme(nextScheme);
  }, [mapColorScheme]);

  const getMapColorSchemeLabel = () => {
    switch (mapColorScheme) {
      case MapColorScheme.LIGHT:
        return 'Light';
      case MapColorScheme.DARK:
        return 'Dark';
      default:
        return 'Auto';
    }
  };

  const cycleNavigationNightMode = useCallback(() => {
    const nextMode =
      navigationNightMode === NavigationNightMode.AUTO
        ? NavigationNightMode.FORCE_DAY
        : navigationNightMode === NavigationNightMode.FORCE_DAY
          ? NavigationNightMode.FORCE_NIGHT
          : NavigationNightMode.AUTO;
    setNavigationNightMode(nextMode);
  }, [navigationNightMode]);

  const getNavigationNightModeLabel = () => {
    switch (navigationNightMode) {
      case NavigationNightMode.FORCE_DAY:
        return 'Force Day';
      case NavigationNightMode.FORCE_NIGHT:
        return 'Force Night';
      default:
        return 'Auto';
    }
  };

  const onNavigationMapReady = useCallback(async () => {
    const termsAccepted =
      await navigationController.showTermsAndConditionsDialog();

    if (!termsAccepted) {
      Alert.alert('Terms Required', 'Terms and conditions not accepted');
      return;
    }

    const status = await navigationController.init();
    if (status !== NavigationSessionStatus.OK) {
      console.error('Error initializing navigation session:', status);
      Alert.alert(
        'Navigation Error',
        `Failed to initialize navigation session: ${status}`
      );
    }
  }, [navigationController]);

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
            <ExampleAppButton
              title="Set Map ID and Show Maps"
              onPress={handleSetMapId}
            />
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
            <ExampleAppButton title="Change Map ID" onPress={handleReset} />
          </View>

          {/* NavigationView */}
          <View style={MapStyles.mapContainer}>
            <View style={styles.mapHeader}>
              <Text style={MapStyles.mapTitle}>Navigation View</Text>
              <View style={styles.headerButtons}>
                <ExampleAppButton
                  title={
                    navigationUiEnabled ? 'Disable Nav UI' : 'Enable Nav UI'
                  }
                  onPress={() =>
                    toggleNavigationUiEnabled(!navigationUiEnabled)
                  }
                />
                <ExampleAppButton
                  title={getNavigationNightModeLabel()}
                  onPress={cycleNavigationNightMode}
                />
              </View>
            </View>
            <NavigationView
              key={`navigation-${confirmedMapId}`}
              style={MapStyles.map}
              mapId={confirmedMapId || undefined}
              mapColorScheme={mapColorScheme}
              navigationNightMode={navigationNightMode}
              navigationUIEnabledPreference={
                NavigationUIEnabledPreference.AUTOMATIC
              }
              onMapReady={onNavigationMapReady}
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
              mapColorScheme={mapColorScheme}
            />
          </View>

          <View style={styles.mapColorSchemeCard}>
            <ExampleAppButton
              title={`Map Color Scheme: ${getMapColorSchemeLabel()}`}
              onPress={cycleMapColorScheme}
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
  mapColorSchemeCard: {
    padding: 12,
    backgroundColor: '#fff',
    alignItems: 'flex-end',
  },
});

export default MapIdScreen;
