/**
 * Copyright 2024 Google LLC
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

import React, { useState, useEffect } from 'react';
import {
  NavigationContainer,
  useIsFocused,
  useNavigation as useAppNavigation,
  type NavigationProp,
} from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Button, Text } from 'react-native';
import { CommonStyles } from './styles/components';
import NavigationScreen from './screens/NavigationScreen';
import MultipleMapsScreen from './screens/MultipleMapsScreen';
import MapIdScreen from './screens/MapIdScreen';
import {
  NavigationProvider,
  TaskRemovedBehavior,
  useNavigation,
} from '@googlemaps/react-native-navigation-sdk';
import IntegrationTestsScreen from './screens/IntegrationTestsScreen';

export type ScreenNames = [
  'Home',
  'Navigation',
  'Multiple maps',
  'Map ID',
  'Integration tests',
];

export type RootStackParamList = Record<ScreenNames[number], undefined>;
export type StackNavigation = NavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const { navigate } = useAppNavigation<StackNavigation>();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const [sdkVersion, setSdkVersion] = useState<string>('');

  const { navigationController } = useNavigation();

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const version = await navigationController.getNavSDKVersion();
        setSdkVersion(version);
      } catch (error) {
        console.error('Failed to fetch SDK version:', error);
        setSdkVersion('Unknown');
      }
    };

    fetchVersion();
  }, [navigationController]);

  return (
    <View style={[CommonStyles.centered, { paddingBottom: insets.bottom }]}>
      {/* SDK Version Display */}
      <View style={{ padding: 16, alignItems: 'center' }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>
          Navigation SDK Version: {sdkVersion || 'Loading...'}
        </Text>
      </View>
      {/* Spacer */}
      <View style={CommonStyles.buttonContainer}>
        <Button
          title="Navigation"
          onPress={() => isFocused && navigate('Navigation')}
        />
      </View>
      <View style={CommonStyles.buttonContainer}>
        <Button
          title="Multiple Maps"
          onPress={() => isFocused && navigate('Multiple maps')}
        />
      </View>
      <View style={CommonStyles.buttonContainer}>
        <Button
          title="Map ID"
          onPress={() => isFocused && navigate('Map ID')}
        />
      </View>
      {/* Spacer */}
      <View style={CommonStyles.container} />
      <View style={CommonStyles.buttonContainer}>
        <Button
          color="grey"
          title="Integration Tests"
          testID="integration_tests_button"
          onPress={() => isFocused && navigate('Integration tests')}
        />
      </View>
    </View>
  );
};

const Stack = createStackNavigator();

/**
 * Root component of the application.
 * @return {NavigationProvider} The NavigationProvider as a root component.
 */
export default function App() {
  return (
    <NavigationProvider
      termsAndConditionsDialogOptions={{
        title: 'RN NavSDK Sample',
        companyName: 'Sample Company',
        showOnlyDisclaimer: true,
      }}
      taskRemovedBehavior={TaskRemovedBehavior.CONTINUE_SERVICE}
    >
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Navigation" component={NavigationScreen} />
          <Stack.Screen name="Multiple maps" component={MultipleMapsScreen} />
          <Stack.Screen name="Map ID" component={MapIdScreen} />
          <Stack.Screen
            name="Integration tests"
            component={IntegrationTestsScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationProvider>
  );
}
