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

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { ExampleAppButton } from '../controls/ExampleAppButton';
import { CommonStyles, MapStyles } from '../styles/components';
import {
  NavigationView,
  TravelMode,
  type NavigationViewController,
  type NavigationCallbacks,
  type MapViewCallbacks,
  type NavigationViewCallbacks,
  type Waypoint,
  type RouteTokenOptions,
  type LatLng,
  RouteStatus,
  useNavigation,
} from '@googlemaps/react-native-navigation-sdk';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import usePermissions from '../checkPermissions';
import Snackbar from 'react-native-snackbar';
import { getRouteToken } from '../helpers/routesApi';

// Fixed locations for the route token example
const ORIGIN_LOCATION: LatLng = {
  lat: 37.422,
  lng: -122.084,
}; // Googleplex, Mountain View

const DESTINATION_LOCATION: LatLng = {
  lat: 37.7749,
  lng: -122.4194,
}; // San Francisco

const showSnackbar = (text: string, duration = Snackbar.LENGTH_SHORT) => {
  Snackbar.show({ text, duration });
};

const RouteTokenScreen = () => {
  const [routeTokenInput, setRouteTokenInput] = useState<string>('');
  const [confirmedRouteToken, setConfirmedRouteToken] = useState<string | null>(
    null
  );
  const [navigationViewController, setNavigationViewController] =
    useState<NavigationViewController | null>(null);
  // API key for Routes API
  const [apiKey, setApiKey] = useState<string>('');
  const [isFetchingToken, setIsFetchingToken] = useState<boolean>(false);
  const insets = useSafeAreaInsets();
  const { arePermissionsApproved } = usePermissions();
  const { navigationController, addListeners, removeListeners } =
    useNavigation();

  const handleFetchRouteToken = useCallback(async () => {
    if (apiKey.trim() === '') {
      Alert.alert('Missing API Key', 'Please enter your Google Maps API key.');
      return;
    }

    setIsFetchingToken(true);
    try {
      const token = await getRouteToken(
        apiKey.trim(),
        ORIGIN_LOCATION,
        DESTINATION_LOCATION
      );

      setRouteTokenInput(token);
      showSnackbar('Route token fetched successfully');
    } catch (error) {
      console.error('Error fetching route token:', error);
      Alert.alert(
        'Error',
        `Failed to fetch route token: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsFetchingToken(false);
    }
  }, [apiKey]);

  const handleSetRouteToken = useCallback(() => {
    if (routeTokenInput.trim() === '') {
      Alert.alert('Empty Route Token', 'Please enter a valid route token.');
      return;
    }
    setConfirmedRouteToken(routeTokenInput.trim());
  }, [routeTokenInput]);

  const handleReset = useCallback(() => {
    setConfirmedRouteToken(null);
  }, []);

  const onNavigationReady = useCallback(async () => {
    if (navigationViewController != null && confirmedRouteToken != null) {
      await navigationViewController.setNavigationUIEnabled(true);
      console.log('Navigation ready, setting route with token');

      // Simulate user location at origin before setting destination
      navigationController.simulator.simulateLocation(ORIGIN_LOCATION);

      // Set destination with route token using fixed destination
      const waypoint: Waypoint = {
        title: 'San Francisco',
        position: DESTINATION_LOCATION,
      };

      const routeTokenOptions: RouteTokenOptions = {
        routeToken: confirmedRouteToken,
        travelMode: TravelMode.DRIVING, // Route tokens only support driving mode.
      };

      try {
        await navigationController.setDestination(waypoint, {
          displayOptions: { showDestinationMarkers: true },
          routeTokenOptions,
        });
      } catch (error) {
        console.error('Error setting destination with route token:', error);
        Alert.alert(
          'Route Token Error',
          'Failed to set destination with route token. The token may be malformed or expired.'
        );
      }
    }
  }, [navigationViewController, confirmedRouteToken, navigationController]);

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

  const onRouteStatusResult = useCallback((routeStatus: RouteStatus) => {
    switch (routeStatus) {
      case RouteStatus.OK:
        showSnackbar('Route created from token');
        break;
      case RouteStatus.ROUTE_CANCELED:
        showSnackbar('Error: Route Cancelled');
        break;
      case RouteStatus.NO_ROUTE_FOUND:
        showSnackbar('Error: No Route Found');
        break;
      case RouteStatus.NETWORK_ERROR:
        showSnackbar('Error: Network Error');
        break;
      default:
        console.log('routeStatus: ' + routeStatus);
        showSnackbar('Error: Route creation failed');
    }
  }, []);

  const navigationCallbacks: NavigationCallbacks = useMemo(
    () => ({
      onNavigationReady,
      onRouteStatusResult,
    }),
    [onNavigationReady, onRouteStatusResult]
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
    }),
    []
  );

  useEffect(() => {
    addListeners(navigationCallbacks);
    return () => {
      removeListeners(navigationCallbacks);
    };
  }, [navigationCallbacks, addListeners, removeListeners]);

  const startGuidance = useCallback(async () => {
    try {
      await navigationController.startGuidance();
      // Start simulating location along the route
      navigationController.simulator.simulateLocationsAlongExistingRoute({
        speedMultiplier: 5,
      });
      showSnackbar('Guidance and simulation started');
    } catch (error) {
      console.error('Error starting guidance:', error);
      Alert.alert('Error', 'Failed to start guidance');
    }
  }, [navigationController]);

  const stopGuidance = useCallback(async () => {
    try {
      // Stop simulation and reset to start location
      navigationController.simulator.stopLocationSimulation();
      navigationController.simulator.simulateLocation(ORIGIN_LOCATION);
      await navigationController.stopGuidance();
      showSnackbar('Guidance stopped, location reset to origin');
    } catch (error) {
      console.error('Error stopping guidance:', error);
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
      {confirmedRouteToken === null ? (
        // Configuration screen
        <View style={styles.configContainer}>
          <Text style={CommonStyles.title}>Route Token Example</Text>
          <Text style={CommonStyles.description}>
            Fetch a route token from the Google Maps Routes API or paste an
            existing token to navigate using a pre-computed route.
          </Text>

          {/* Routes API Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Fetch Route Token</Text>

            <View style={CommonStyles.inputContainer}>
              <Text style={CommonStyles.label}>Maps API Key:</Text>
              <TextInput
                style={CommonStyles.textInput}
                value={apiKey}
                onChangeText={setApiKey}
                placeholder="Enter your Google Maps API key"
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
              />
            </View>

            {/* Fixed Route Info */}
            <View style={styles.routeInfoContainer}>
              <Text style={styles.routeInfoTitle}>Fixed Route:</Text>
              <Text style={styles.routeInfoText}>
                Origin: Googleplex, Mountain View ({ORIGIN_LOCATION.lat},{' '}
                {ORIGIN_LOCATION.lng})
              </Text>
              <Text style={styles.routeInfoText}>
                Destination: San Francisco ({DESTINATION_LOCATION.lat},{' '}
                {DESTINATION_LOCATION.lng})
              </Text>
            </View>

            <View style={CommonStyles.buttonContainer}>
              {isFetchingToken ? (
                <ActivityIndicator size="large" color="#4285F4" />
              ) : (
                <ExampleAppButton
                  title="Fetch Route Token"
                  onPress={handleFetchRouteToken}
                  disabled={apiKey.trim() === ''}
                />
              )}
            </View>
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Manual Token Entry Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Paste Route Token</Text>

            <View style={CommonStyles.inputContainer}>
              <Text style={CommonStyles.label}>Route Token:</Text>
              <TextInput
                style={[CommonStyles.textInput, styles.routeTokenInput]}
                value={routeTokenInput}
                onChangeText={setRouteTokenInput}
                placeholder="Paste your route token here"
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          <View style={CommonStyles.buttonContainer}>
            <ExampleAppButton
              title="Navigate with Route Token"
              onPress={handleSetRouteToken}
            />
          </View>

          <View style={CommonStyles.infoContainer}>
            <Text style={CommonStyles.infoTitle}>Note:</Text>
            <Text style={CommonStyles.infoText}>
              Route tokens only support driving mode.
              {'\n\n'}
              The user location will be simulated at the origin when navigation
              starts.
            </Text>
          </View>
        </View>
      ) : (
        // Navigation display screen
        <View style={styles.mapsContainer}>
          <View style={CommonStyles.header}>
            <Text style={CommonStyles.headerText}>Route Token Navigation</Text>
            <ExampleAppButton title="Change Token" onPress={handleReset} />
          </View>

          {/* NavigationView */}
          <View style={MapStyles.mapContainer}>
            <NavigationView
              style={MapStyles.map}
              navigationViewCallbacks={navigationViewCallbacks}
              mapViewCallbacks={navigationMapViewCallbacks}
              onNavigationViewControllerCreated={setNavigationViewController}
              onMapViewControllerCreated={() => {}}
            />
          </View>

          {/* Control buttons */}
          <View style={styles.controlsContainer}>
            <View style={styles.buttonRow}>
              <ExampleAppButton
                title="Start Guidance"
                onPress={startGuidance}
              />
              <ExampleAppButton title="Stop Guidance" onPress={stopGuidance} />
            </View>
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
  },
  mapsContainer: {
    flex: 1,
  },
  routeTokenInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  controlsContainer: {
    padding: 12,
    backgroundColor: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 10,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  routeInfoContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  routeInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  routeInfoText: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});

export default RouteTokenScreen;
