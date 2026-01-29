/**
 * Copyright 2023 Google LLC
 *
 * <p>Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of the License at
 *
 * <p>http://www.apache.org/licenses/LICENSE-2.0
 *
 * <p>Unless required by applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.google.android.react.navsdk;

import android.content.Context;
import android.util.DisplayMetrics;
import com.google.android.libraries.navigation.NavigationUpdatesOptions;
import com.google.android.libraries.navigation.NavigationUpdatesOptions.GeneratedStepImagesType;
import com.google.android.libraries.navigation.Navigator;

/** Starts and stops the forwarding of turn-by-turn nav info from Nav SDK. */
public class NavForwardingManager {
  /** Registers a service to receive navigation updates from nav info */
  public static void startNavForwarding(
      Navigator navigator, Context context, INavigationCallback navigationCallback) {

    DisplayMetrics metrics = context.getResources().getDisplayMetrics();

    NavigationUpdatesOptions options =
        NavigationUpdatesOptions.builder()
            .setNumNextStepsToPreview(Integer.MAX_VALUE)
            .setGeneratedStepImagesType(GeneratedStepImagesType.BITMAP)
            .setDisplayMetrics(metrics)
            .build();

    boolean success =
        navigator.registerServiceForNavUpdates(
            context.getPackageName(), NavInfoReceivingService.class.getName(), options);
    if (success) {
      navigationCallback.logDebugInfo("Successfully registered service for nav updates");
    } else {
      navigationCallback.logDebugInfo("Failed to register service for nav updates");
    }
  }

  /** Unregisters the service receiving navigation updates */
  public static void stopNavForwarding(
      Navigator navigator, Context context, INavigationCallback navigationCallback) {
    // Unregister the nav info receiving service.
    boolean success = navigator.unregisterServiceForNavUpdates();
    if (success) {
      navigationCallback.logDebugInfo("Unregistered service for nav updates");
    } else {
      // This may happen if no service had been registered.
      navigationCallback.logDebugInfo(
          "No service has been registered for nav updates. Turn by turn toggle is off.");
    }
  }
}
