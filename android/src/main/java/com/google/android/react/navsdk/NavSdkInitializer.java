/**
 * Copyright 2026 Google LLC
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
import androidx.annotation.NonNull;
import androidx.startup.Initializer;
import com.google.android.gms.maps.MapsApiSettings;
import java.util.Collections;
import java.util.List;

/** Registers the Navigation SDK internal usage attribution ID at application startup. */
public final class NavSdkInitializer implements Initializer<Void> {

  @NonNull
  @Override
  public Void create(@NonNull Context context) {
    MapsApiSettings.addInternalUsageAttributionId(
        context.getApplicationContext(), SdkVersion.ATTRIBUTION_ID);
    return null;
  }

  @NonNull
  @Override
  public List<Class<? extends Initializer<?>>> dependencies() {
    return Collections.emptyList();
  }
}
