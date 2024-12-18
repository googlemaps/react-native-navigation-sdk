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

import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.filters.LargeTest;
import androidx.test.rule.ActivityTestRule;
import com.wix.detox.Detox;
import com.wix.detox.config.DetoxConfig;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(AndroidJUnit4.class)
@LargeTest
public class DetoxTest {
  @Rule // (2)
  public ActivityTestRule<MainActivity> mActivityRule =
      new ActivityTestRule<>(MainActivity.class, false, false);

  @Test
  public void runDetoxTests() {
    DetoxConfig detoxConfig = new DetoxConfig();
    detoxConfig.idlePolicyConfig.masterTimeoutSec = 90;
    detoxConfig.idlePolicyConfig.idleResourceTimeoutSec = 60;
    detoxConfig.rnContextLoadTimeoutSec = (BuildConfig.DEBUG ? 180 : 60);

    Detox.runTests(mActivityRule, detoxConfig);
  }
}
