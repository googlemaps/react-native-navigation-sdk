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

import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useNavigation } from '@googlemaps/react-native-navigation-sdk';
import { ExampleAppButton } from './ExampleAppButton';
import { showSnackbar } from '../helpers/snackbar';

export const TermsOfServiceControls: React.FC = () => {
  const { navigationController } = useNavigation();
  const [termsAccepted, setTermsAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    const checkTermsStatus = async () => {
      try {
        const accepted = await navigationController.areTermsAccepted();
        setTermsAccepted(accepted);
      } catch (error) {
        console.error('Failed to check terms status:', error);
      }
    };

    checkTermsStatus();
  }, [navigationController]);

  const handleResetTerms = async () => {
    try {
      await navigationController.resetTermsAccepted();
      setTermsAccepted(false);
      showSnackbar('Terms of Service have been reset');
    } catch (error) {
      Alert.alert(
        'Error',
        'Cannot reset terms. Make sure you have not navigated to any screen yet: ' +
          error
      );
    }
  };

  const handleShowTermsDialog = async () => {
    try {
      const accepted =
        await navigationController.showTermsAndConditionsDialog();
      setTermsAccepted(accepted);
      showSnackbar(
        `Terms dialog result: ${accepted ? 'Accepted' : 'Not accepted'}`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to show terms dialog:' + error);
    }
  };

  const handleShowCustomTermsDialog = async () => {
    try {
      const accepted = await navigationController.showTermsAndConditionsDialog({
        showOnlyDisclaimer: false,
        uiParams: {
          backgroundColor: '#828aff5a',
          titleColor: '#eedfff',
          mainTextColor: '#eedfff',
          acceptButtonTextColor: '#4ecca3',
          cancelButtonTextColor: '#ee6c4d',
        },
      });
      setTermsAccepted(accepted);
      showSnackbar(
        `Custom TOS dialog result: ${accepted ? 'Accepted' : 'Not accepted'}`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to show custom terms dialog: ' + error);
    }
  };

  const handleCheckTermsAccepted = async () => {
    try {
      const accepted = await navigationController.areTermsAccepted();
      setTermsAccepted(accepted);
      showSnackbar(`Terms accepted: ${accepted ? 'Yes' : 'No'}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to check terms status:' + error);
    }
  };

  return (
    <View style={{ padding: 8, alignItems: 'center' }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: 'bold',
          color: '#666',
          marginBottom: 8,
        }}
      >
        Terms of Service (Reset before navigation)
      </Text>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <ExampleAppButton
          title="Reset TOS"
          onPress={handleResetTerms}
          backgroundColor="#d32f2fff"
          disabled={!termsAccepted}
        />
        <ExampleAppButton
          title="Show TOS"
          onPress={handleShowTermsDialog}
          disabled={termsAccepted === true}
        />
        <ExampleAppButton
          title="Custom TOS"
          onPress={handleShowCustomTermsDialog}
          disabled={termsAccepted === true}
        />
        <ExampleAppButton
          title="Check terms accepted"
          onPress={handleCheckTermsAccepted}
        />
      </View>
    </View>
  );
};
