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

import * as React from 'react';
import {
  NavigationContainer,
  useNavigation,
  type NavigationProp,
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Button, StyleSheet } from 'react-native';
import NavigationScreen from './NavigationScreen';
import MultipleMapsScreen from './MultipleMapsScreen';
import {
  NavigationProvider,
  type TermsAndConditionsDialogOptions,
} from '@googlemaps/react-native-navigation-sdk';

export type ScreenNames = ['Home', 'Navigation', 'Multiple maps'];

export type RootStackParamList = Record<ScreenNames[number], undefined>;
export type StackNavigation = NavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const { navigate } = useNavigation<StackNavigation>();
  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button title="Navigation" onPress={() => navigate('Navigation')} />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Multiple Maps"
          onPress={() => navigate('Multiple maps')}
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
 * @return {NavigationContainer} The NavigationContainer as a root component.
 */
export default function App() {
  return (
    <NavigationProvider
      termsAndConditionsDialogOptions={termsAndConditionsDialogOptions}
    >
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Navigation" component={NavigationScreen} />
          <Stack.Screen name="Multiple maps" component={MultipleMapsScreen} />
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
