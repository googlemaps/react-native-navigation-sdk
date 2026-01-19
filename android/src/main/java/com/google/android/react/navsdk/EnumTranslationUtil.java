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

import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.GoogleMap.CameraPerspective;
import com.google.android.gms.maps.model.MapColorScheme;
import com.google.android.libraries.navigation.AlternateRoutesStrategy;
import com.google.android.libraries.navigation.ForceNightMode;
import com.google.android.libraries.navigation.Navigator;
import com.google.android.libraries.navigation.RoutingOptions;

public class EnumTranslationUtil {
  public static AlternateRoutesStrategy getAlternateRoutesStrategyFromJsValue(int jsValue) {
    switch (jsValue) {
      case 1:
        return AlternateRoutesStrategy.SHOW_NONE;
      case 2:
        return AlternateRoutesStrategy.SHOW_ONE;
      default:
        return AlternateRoutesStrategy.SHOW_ALL;
    }
  }

  public static @Navigator.AudioGuidance int getAudioGuidanceFromJsValue(int jsValue) {
    switch (jsValue) {
      case 0:
        return Navigator.AudioGuidance.SILENT;
      case 1:
        return Navigator.AudioGuidance.VOICE_ALERTS_ONLY;
      case 2:
      default:
        return Navigator.AudioGuidance.VOICE_ALERTS_AND_GUIDANCE;
    }
  }

  public static @Navigator.TaskRemovedBehavior int getTaskRemovedBehaviourFromJsValue(int jsValue) {
    return switch (jsValue) {
      case 0 -> Navigator.TaskRemovedBehavior.CONTINUE_SERVICE;
      case 1 -> Navigator.TaskRemovedBehavior.QUIT_SERVICE;
      default -> Navigator.TaskRemovedBehavior.CONTINUE_SERVICE;
    };
  }

  public static int getMapTypeFromJsValue(int jsValue) {
    switch (jsValue) {
      case 1:
        return GoogleMap.MAP_TYPE_NORMAL;
      case 2:
        return GoogleMap.MAP_TYPE_SATELLITE;
      case 3:
        return GoogleMap.MAP_TYPE_TERRAIN;
      case 4:
        return GoogleMap.MAP_TYPE_HYBRID;
      default:
        return GoogleMap.MAP_TYPE_NONE;
    }
  }

  public static @ForceNightMode int getForceNightModeFromJsValue(int jsValue) {
    switch (jsValue) {
      case 0:
        return ForceNightMode.AUTO;
      case 1:
        return ForceNightMode.FORCE_DAY;
      case 2:
      default:
        return ForceNightMode.FORCE_NIGHT;
    }
  }

  public static @CameraPerspective int getCameraPerspectiveFromJsValue(int jsValue) {
    switch (jsValue) {
      case 1:
        return CameraPerspective.TOP_DOWN_NORTH_UP;
      case 2:
        return CameraPerspective.TOP_DOWN_HEADING_UP;
      default:
        return CameraPerspective.TILTED;
    }
  }

  public static CustomTypes.MapViewType getMapViewTypeFromJsValue(int jsValue) {
    return switch (jsValue) {
      case 0 -> CustomTypes.MapViewType.MAP;
      case 1 -> CustomTypes.MapViewType.NAVIGATION;
      default -> throw new IllegalStateException("Unexpected MapViewType value: " + jsValue);
    };
  }

  public static @MapColorScheme int getMapColorSchemeFromJsValue(int jsValue) {
    switch (jsValue) {
      case 1:
        return MapColorScheme.LIGHT;
      case 2:
        return MapColorScheme.DARK;
      default:
        return MapColorScheme.FOLLOW_SYSTEM;
    }
  }

  public static @RoutingOptions.TravelMode int getTravelModeFromJsValue(int jsValue) {
    switch (jsValue) {
      case 1:
        return RoutingOptions.TravelMode.CYCLING;
      case 2:
        return RoutingOptions.TravelMode.WALKING;
      case 3:
        return RoutingOptions.TravelMode.TWO_WHEELER;
      case 4:
        return RoutingOptions.TravelMode.TAXI;
      default:
        return RoutingOptions.TravelMode.DRIVING;
    }
  }
}
