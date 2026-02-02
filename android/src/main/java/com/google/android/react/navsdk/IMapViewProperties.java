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

import com.google.android.gms.maps.model.MapColorScheme;

/**
 * Write-only interface for map view fragment-level properties. These are properties set directly on
 * the fragment (not via controller). This interface is implemented by both the property sink
 * (buffers data before fragment ready) and the fragment adapter (delegates to real fragment).
 */
public interface IMapViewProperties {
  void setMapColorScheme(@MapColorScheme int colorScheme);
}
