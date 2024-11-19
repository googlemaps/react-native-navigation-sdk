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

import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import {
  PERMISSIONS,
  requestMultiple,
  RESULTS,
} from 'react-native-permissions';
import Snackbar from 'react-native-snackbar';

const usePermissions = () => {
  const [arePermissionsApproved, setArePermissionsApproved] = useState(false);

  useEffect(() => {
    const check = async () => {
      const toRequestPermissions =
        Platform.OS === 'android'
          ? [PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]
          : [PERMISSIONS.IOS.LOCATION_ALWAYS];

      try {
        const permissionStatuses = await requestMultiple(toRequestPermissions);
        const result = permissionStatuses[toRequestPermissions[0]!];

        if (result === RESULTS.GRANTED) {
          setArePermissionsApproved(true);
        } else {
          Snackbar.show({
            text: 'Location permissions are needed to proceed with the app. Please re-open and accept.',
            duration: Snackbar.LENGTH_SHORT,
          });
        }
      } catch (error) {
        console.error('Error requesting permissions', error);
      }
    };

    check();
  }, []);

  return { arePermissionsApproved };
};

export default usePermissions;
