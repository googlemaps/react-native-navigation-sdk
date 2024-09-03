/*
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

package com.sampleapp;

import androidx.annotation.NonNull;
import androidx.car.app.CarAppService;
import androidx.car.app.Session;
import androidx.car.app.SessionInfo;
import androidx.car.app.validation.HostValidator;

public final class SampleAndroidAutoService extends CarAppService {
  @NonNull
  @Override
  public HostValidator createHostValidator() {
    // This sample allows all hosts to connect to the app.
    return HostValidator.ALLOW_ALL_HOSTS_VALIDATOR;
  }

  @Override
  @NonNull
  public Session onCreateSession(@NonNull SessionInfo sessionInfo) {
    return new SampleAndroidAutoSession(sessionInfo);
  }
}
