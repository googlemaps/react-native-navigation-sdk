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

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { ExampleAppButton } from './ExampleAppButton';
import {
  type NavigationController,
  type RoutingOptions,
  type DisplayOptions,
  TravelMode,
  RouteStatus,
} from '@googlemaps/react-native-navigation-sdk';
import { showSnackbar } from '../helpers/snackbar';
import { Colors, Spacing, Typography } from '../styles/theme';

// Waypoints for testing: Golden Gate to 1 Market St, San Francisco
const WAYPOINTS = [
  { placeId: 'ChIJw____96GhYARCVVwg5cT7c0' }, // Golden Gate, SF
  { placeId: 'ChIJkXCsHWSAhYARsGBBQYcj-V0' }, // 1 Market St, SF
];

// Simulated start location.
const SIMULATED_START_LOCATION = {
  lat: 37.7849,
  lng: -122.4394,
};

export enum ActionPathStep {
  NOT_INITIALIZED = 'not_initialized',
  INITIALIZED = 'initialized',
  DESTINATIONS_SET = 'destinations_set',
  GUIDANCE_STARTED = 'guidance_started',
}

interface NavigationActionPathProps {
  navigationController: NavigationController | null;
  navigationInitialized: boolean;
  onInitNavigation: () => Promise<void>;
  onNavigationCleanedUp: () => void;
  currentStep: ActionPathStep;
  onStepChange: (step: ActionPathStep) => void;
}

const NavigationActionPath: React.FC<NavigationActionPathProps> = ({
  navigationController,
  navigationInitialized,
  onInitNavigation,
  onNavigationCleanedUp,
  currentStep,
  onStepChange,
}) => {
  const handleInitNavigation = async () => {
    try {
      await onInitNavigation();
    } catch (error) {
      console.error('Error initializing navigation:', error);
      showSnackbar('Error initializing navigation');
    }
  };

  const handleSetDestinations = async () => {
    if (!navigationController) {
      showSnackbar('Navigation controller not available');
      return;
    }

    try {
      // First, simulate location near the start
      navigationController.simulator.simulateLocation(SIMULATED_START_LOCATION);
      showSnackbar(
        `Simulating location near Presidio: ${SIMULATED_START_LOCATION.lat.toFixed(4)}, ${SIMULATED_START_LOCATION.lng.toFixed(4)}`
      );

      // Wait a moment for location simulation to take effect
      await new Promise(resolve => setTimeout(resolve, 500));

      const routingOptions: RoutingOptions = {
        travelMode: TravelMode.DRIVING,
        avoidFerries: true,
        avoidTolls: false,
      };

      const displayOptions: DisplayOptions = {
        showDestinationMarkers: true,
        showStopSigns: true,
        showTrafficLights: true,
      };

      const routeStatus = await navigationController.setDestinations(
        WAYPOINTS,
        {
          routingOptions,
          displayOptions,
        }
      );

      if (routeStatus === RouteStatus.OK) {
        showSnackbar('Route created successfully');
        onStepChange(ActionPathStep.DESTINATIONS_SET);
      } else {
        showSnackbar(`Route error: ${routeStatus}`);
      }
    } catch (error) {
      console.error('Error setting destinations:', error);
      showSnackbar('Error setting destinations');
    }
  };

  const handleStartGuidanceAndSimulation = async () => {
    if (!navigationController) {
      showSnackbar('Navigation controller not available');
      return;
    }

    try {
      // Start guidance
      navigationController.startGuidance();

      // Start simulation along the route
      navigationController.simulator.simulateLocationsAlongExistingRoute({
        speedMultiplier: 5,
      });

      showSnackbar('Guidance and simulation started');
      onStepChange(ActionPathStep.GUIDANCE_STARTED);
    } catch (error) {
      console.error('Error starting guidance and simulation:', error);
      showSnackbar('Error starting guidance and simulation');
    }
  };

  const handleClear = async () => {
    if (!navigationController) {
      return;
    }

    try {
      // Stop simulation
      navigationController.simulator.stopLocationSimulation();

      // Stop guidance
      navigationController.stopGuidance();

      // Clear destinations
      navigationController.clearDestinations();
      navigationController.cleanup();
      navigationController.resetTermsAccepted();

      showSnackbar('Navigation cleaned up');
      // Notify parent that navigation has been cleared (session is no longer initialized)
      onNavigationCleanedUp();
      onStepChange(ActionPathStep.NOT_INITIALIZED);
    } catch (error) {
      console.error('Error clearing navigation:', error);
      showSnackbar('Error clearing navigation');
    }
  };

  const getStepNumber = (step: ActionPathStep): number => {
    switch (step) {
      case ActionPathStep.NOT_INITIALIZED:
        return 1;
      case ActionPathStep.INITIALIZED:
        return 2;
      case ActionPathStep.DESTINATIONS_SET:
        return 3;
      case ActionPathStep.GUIDANCE_STARTED:
        return 4;
      default:
        return 1;
    }
  };

  const renderStepIndicator = (stepNum: number, isActive: boolean) => (
    <View
      style={[styles.stepIndicator, isActive && styles.stepIndicatorActive]}
    >
      <Text style={[styles.stepNumber, isActive && styles.stepNumberActive]}>
        {stepNum}
      </Text>
    </View>
  );

  const currentStepNumber = getStepNumber(currentStep);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Quick Test Actions</Text>
        <View style={styles.stepIndicators}>
          {renderStepIndicator(1, currentStepNumber >= 1)}
          <View style={styles.stepConnector} />
          {renderStepIndicator(2, currentStepNumber >= 2)}
          <View style={styles.stepConnector} />
          {renderStepIndicator(3, currentStepNumber >= 3)}
        </View>
      </View>

      <View style={styles.actionsRow}>
        <View style={styles.mainActions}>
          {!navigationInitialized && (
            <ExampleAppButton
              title="Initialize Navigation"
              onPress={handleInitNavigation}
              testID="action-init-nav"
            />
          )}

          {navigationInitialized &&
            currentStep === ActionPathStep.INITIALIZED && (
              <ExampleAppButton
                title="Set Destinations"
                onPress={handleSetDestinations}
                testID="action-set-destinations"
              />
            )}

          {currentStep === ActionPathStep.DESTINATIONS_SET && (
            <ExampleAppButton
              title="Start Guidance & Simulation"
              onPress={handleStartGuidanceAndSimulation}
              testID="action-start-guidance"
            />
          )}

          {currentStep === ActionPathStep.GUIDANCE_STARTED && (
            <Text style={styles.statusText}>✓ Navigation Active</Text>
          )}
        </View>

        <ExampleAppButton
          title="Cleanup"
          onPress={handleClear}
          backgroundColor={Colors.error}
          pressedBackgroundColor="#b71c1c"
          disabled={!navigationController}
          testID="action-clear"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    margin: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
  },
  stepIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndicatorActive: {
    backgroundColor: Colors.primary,
  },
  stepNumber: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textDisabled,
  },
  stepNumberActive: {
    color: Colors.buttonText,
  },
  stepConnector: {
    width: 12,
    height: 2,
    backgroundColor: Colors.borderLight,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mainActions: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  statusText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.success,
    paddingVertical: Spacing.md,
  },
});

export default NavigationActionPath;
