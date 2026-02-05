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
 * Interface for navigation view controller properties that can be set on auto views. These are
 * navigation-specific UI controls that are separate from map controller properties.
 */
public interface INavigationViewController {
  void setStylingOptions(StylingOptions stylingOptions);

  void setNightModeOption(@ForceNightMode int nightMode);
}
