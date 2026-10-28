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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.fail;
import static org.junit.Assume.assumeFalse;

import android.app.Application;
import android.util.Log;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import com.facebook.react.bridge.PromiseImpl;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.runtime.BridgelessReactContext;
import com.facebook.react.runtime.ReactHostImpl;
import com.google.android.libraries.navigation.NavigationApi;
import com.sampleapp.MainApplication;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(AndroidJUnit4.class)
public class NavModuleInitializationTest {
  @Test
  public void immediateTermsRejectionDoesNotRetainNavInfoObserver() {
    assumeFalse(InstrumentationRegistry.getArguments().containsKey("detoxServer"));
    var instrumentation = InstrumentationRegistry.getInstrumentation();
    Application application =
        (Application) instrumentation.getTargetContext().getApplicationContext();
    var rejection = new AtomicReference<String>();
    NavModule module =
        new NavModule(
            new BridgelessReactContext(
                application, (ReactHostImpl) ((MainApplication) application).getReactHost()),
            null) {
          @Override
          void requestNavigator(Application application, NavigationApi.NavigatorListener listener) {
            listener.onError(NavigationApi.ErrorCode.TERMS_NOT_ACCEPTED);
          }

          @Override
          public void logDebugInfo(String info) {
            // Capture diagnostics without requiring a running JavaScript event subscriber.
            Log.d("NavModuleInitializationTest", info);
          }
        };

    try {
      instrumentation.runOnMainSync(
          () -> {
            assertFalse(NavInfoReceivingService.getNavInfoLiveData().hasObservers());
            module.initializeNavigationSession(
                false,
                0,
                new PromiseImpl(
                    args -> fail("Initialization succeeded without accepting terms"),
                    args -> rejection.set(((ReadableMap) args[0]).getString("code"))));
            // Reject synchronously to exercise removal-before-registration ordering.
            assertEquals("termsNotAccepted", rejection.get());
          });
      instrumentation.waitForIdleSync();
      instrumentation.runOnMainSync(
          () -> {
            assertNull(module.getNavigator());
            assertFalse(
                "Rejected initialization must not retain a turn-by-turn observer",
                NavInfoReceivingService.getNavInfoLiveData().hasObservers());
          });
    } finally {
      module.onHostDestroy();
      instrumentation.waitForIdleSync();
    }
  }
}
