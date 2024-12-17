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

import React from 'react';
import {
  NavigationContainer,
  useIsFocused,
  useNavigation,
  type NavigationProp,
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Button, StyleSheet } from 'react-native';
import NavigationScreen from './screens/NavigationScreen';
import MultipleMapsScreen from './screens/MultipleMapsScreen';
import {
  NavigationProvider,
  TaskRemovedBehavior,
  type TermsAndConditionsDialogOptions,
} from '@googlemaps/react-native-navigation-sdk';
import IntegrationTestsScreen from './screens/IntegrationTestsScreen';

export type ScreenNames = [
  'Home',
  'Navigation',
  'Multiple maps',
  'Integration tests',
];

export type RootStackParamList = Record<ScreenNames[number], undefined>;
export type StackNavigation = NavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const { navigate } = useNavigation<StackNavigation>();
  const isFocused = useIsFocused();

  return (
    <View style={styles.container}>
      {/* Spacer */}
      <View style={styles.container} />
      <View style={styles.buttonContainer}>
        <Button
          title="Navigation"
          onPress={() => isFocused && navigate('Navigation')}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Multiple Maps"
          onPress={() => isFocused && navigate('Multiple maps')}
        />
      </View>
      {/* Spacer */}
      <View style={styles.container} />
      <View style={styles.buttonContainer}>
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

const termsAndConditionsDialogOptions: TermsAndConditionsDialogOptions = {
  title: 'RN NavSDK Sample',
  companyName: 'Sample Company',
  showOnlyDisclaimer: true,
};

const Stack = createStackNavigator();

/**
 * Root component of the application.
 * @return {NavigationProvider} The NavigationProvider as a root component.
 */
export default function App() {
  return (
    <NavigationProvider
      termsAndConditionsDialogOptions={termsAndConditionsDialogOptions}
      taskRemovedBehavior={TaskRemovedBehavior.CONTINUE_SERVICE}
    >
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Navigation" component={NavigationScreen} />
          <Stack.Screen name="Multiple maps" component={MultipleMapsScreen} />
          <Stack.Screen
            name="Integration tests"
            component={IntegrationTestsScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    width: '80%',
    marginVertical: 8,
  },
});
