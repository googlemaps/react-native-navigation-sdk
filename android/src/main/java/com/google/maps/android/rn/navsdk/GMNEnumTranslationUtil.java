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
package com.google.maps.android.rn.navsdk;

import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.GoogleMap.CameraPerspective;
import com.google.android.libraries.navigation.AlternateRoutesStrategy;
import com.google.android.libraries.navigation.ForceNightMode;
import com.google.android.libraries.navigation.Navigator;

public class GMNEnumTranslationUtil {
  public static AlternateRoutesStrategy getAlternateRoutesStrategyFromJsValue(int jsValue) {
    return switch (jsValue) {
      case 1 -> AlternateRoutesStrategy.SHOW_NONE;
      case 2 -> AlternateRoutesStrategy.SHOW_ONE;
      default -> AlternateRoutesStrategy.SHOW_ALL;
    };
  }

  public static @Navigator.AudioGuidance int getAudioGuidanceFromJsValue(int jsValue) {
    return switch (jsValue) {
      case 0 -> Navigator.AudioGuidance.SILENT;
      case 1 -> Navigator.AudioGuidance.VOICE_ALERTS_ONLY;
      default -> Navigator.AudioGuidance.VOICE_ALERTS_AND_GUIDANCE;
    };
  }

  public static @Navigator.TaskRemovedBehavior int getTaskRemovedBehaviourFromJsValue(int jsValue) {
    return switch (jsValue) {
      case 0 -> Navigator.TaskRemovedBehavior.CONTINUE_SERVICE;
      case 1 -> Navigator.TaskRemovedBehavior.QUIT_SERVICE;
      default -> Navigator.TaskRemovedBehavior.CONTINUE_SERVICE;
    };
  }

  public static int getMapTypeFromJsValue(int jsValue) {
    return switch (jsValue) {
      case 1 -> GoogleMap.MAP_TYPE_NORMAL;
      case 2 -> GoogleMap.MAP_TYPE_SATELLITE;
      case 3 -> GoogleMap.MAP_TYPE_TERRAIN;
      case 4 -> GoogleMap.MAP_TYPE_HYBRID;
      default -> GoogleMap.MAP_TYPE_NONE;
    };
  }

  public static @ForceNightMode int getForceNightModeFromJsValue(int jsValue) {
    return switch (jsValue) {
      case 0 -> ForceNightMode.AUTO;
      case 1 -> ForceNightMode.FORCE_DAY;
      default -> ForceNightMode.FORCE_NIGHT;
    };
  }

  public static @CameraPerspective int getCameraPerspectiveFromJsValue(int jsValue) {
    return switch (jsValue) {
      case 1 -> CameraPerspective.TOP_DOWN_NORTH_UP;
      case 2 -> CameraPerspective.TOP_DOWN_HEADING_UP;
      default -> CameraPerspective.TILTED;
    };
  }

  public static GMNCustomTypes.MapViewType getMapViewTypeFromJsValue(int jsValue) {
    return switch (jsValue) {
      default -> GMNCustomTypes.MapViewType.MAP;
      case 1 -> GMNCustomTypes.MapViewType.NAVIGATION;
    };
  }
}
