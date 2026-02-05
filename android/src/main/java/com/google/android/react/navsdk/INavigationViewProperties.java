/*
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

package com.google.android.react.navsdk;

import com.google.android.libraries.navigation.ForceNightMode;
import com.google.android.libraries.navigation.StylingOptions;

/**
 * Write-only interface for navigation view fragment-level properties. These are properties set
 * directly on the navigation fragment (not via controller). Extends IMapViewProperties since
 * NavigationView includes all map properties plus navigation-specific ones.
 */
public interface INavigationViewProperties extends IMapViewProperties {
  void setNightModeOption(@ForceNightMode int nightMode);

  void setStylingOptions(StylingOptions options);

  void setTripProgressBarEnabled(boolean enabled);

  void setTrafficPromptsEnabled(boolean enabled);

  void setTrafficIncidentCardsEnabled(boolean enabled);

  void setHeaderEnabled(boolean enabled);

  void setFooterEnabled(boolean enabled);

  void setSpeedometerEnabled(boolean enabled);

  void setSpeedLimitIconEnabled(boolean enabled);

  void setRecenterButtonEnabled(boolean enabled);

  void setReportIncidentButtonEnabled(boolean enabled);
}
