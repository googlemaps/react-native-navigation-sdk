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
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;
import static org.junit.Assume.assumeFalse;

import android.app.Application;
import android.app.Instrumentation;
import android.util.Log;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import com.facebook.react.bridge.PromiseImpl;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.runtime.BridgelessReactContext;
import com.facebook.react.runtime.ReactHostImpl;
import com.google.android.libraries.navigation.NavigationApi;
import com.google.android.libraries.navigation.Navigator;
import com.sampleapp.MainApplication;
import java.lang.reflect.Proxy;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(AndroidJUnit4.class)
public class NavModuleInitializationTest {
  private Instrumentation instrumentation;
  private TestNavModule module;
  private int readyNotifications;

  @Before
  public void setUp() {
    assumeFalse(InstrumentationRegistry.getArguments().containsKey("detoxServer"));
    instrumentation = InstrumentationRegistry.getInstrumentation();
    instrumentation.runOnMainSync(
        () -> {
          Application application =
              (Application) instrumentation.getTargetContext().getApplicationContext();
          module = new TestNavModule(application);
          module.registerNavigationReadyListener(
              ready -> {
                if (ready) {
                  readyNotifications++;
                }
              });
          assertFalse(NavInfoReceivingService.getNavInfoLiveData().hasObservers());
        });
  }

  @After
  public void tearDown() {
    if (module != null) {
      instrumentation.runOnMainSync(module::onHostDestroy);
      instrumentation.waitForIdleSync();
    }
  }

  @Test
  public void immediateTermsRejectionDoesNotRetainNavInfoObserver() {
    module.rejectTermsImmediately = true;
    InitResult result = initialize();
    instrumentation.runOnMainSync(
        () -> {
          assertEquals("termsNotAccepted", result.rejection);
          assertFalse(result.resolved);
          assertNull(module.getNavigator());
          assertFalse(NavInfoReceivingService.getNavInfoLiveData().hasObservers());
          assertEquals(0, readyNotifications);
        });
  }

  @Test
  public void successfulCallbackAfterHostDestroyDoesNotPublishReadiness() {
    InitResult result = initialize();
    NavigationApi.NavigatorListener callback = module.callback;
    Navigator navigator = createNavigator();
    instrumentation.runOnMainSync(
        () -> {
          module.onHostDestroy();
          callback.onNavigatorReady(navigator);
        });
    instrumentation.waitForIdleSync();
    instrumentation.runOnMainSync(
        () -> {
          assertEquals("navigationInitializationCancelled", result.rejection);
          assertFalse(result.resolved);
          assertNull(module.getNavigator());
          assertFalse(NavInfoReceivingService.getNavInfoLiveData().hasObservers());
          assertEquals(0, readyNotifications);
        });
  }

  @Test
  public void initializationQueuedBeforeHostDestroyDoesNotAcquireNavigator() {
    InitResult result = new InitResult();
    instrumentation.runOnMainSync(
        () -> {
          module.initializeNavigationSession(false, 0, result.promise);
          module.onHostDestroy();
        });
    instrumentation.waitForIdleSync();
    instrumentation.runOnMainSync(
        () -> {
          assertEquals("navigationInitializationCancelled", result.rejection);
          assertFalse(result.resolved);
          assertNull(module.callback);
          assertNull(module.getNavigator());
          assertFalse(NavInfoReceivingService.getNavInfoLiveData().hasObservers());
          assertEquals(0, readyNotifications);
        });
  }

  @Test
  public void freshHeadlessInitializationRemainsObservedUntilHostDestroy() {
    instrumentation.runOnMainSync(module::onHostDestroy);
    InitResult result = initialize();
    NavigationApi.NavigatorListener callback = module.callback;
    Navigator navigator = createNavigator();
    boolean[] destroyed = {false};
    int[] staleNotifications = {0};
    instrumentation.runOnMainSync(
        () -> {
          assertNull(module.reactContext.getCurrentActivity());
          module.registerNavigationReadyListener(
              ready -> {
                if (ready && destroyed[0]) {
                  staleNotifications[0]++;
                }
              });
          callback.onNavigatorReady(navigator);
          assertTrue(result.resolved);
          assertNull(result.rejection);
          assertSame(navigator, module.getNavigator());
          assertTrue(NavInfoReceivingService.getNavInfoLiveData().hasActiveObservers());
          module.onHostPause();
          assertTrue(NavInfoReceivingService.getNavInfoLiveData().hasActiveObservers());
          destroyed[0] = true;
          module.onHostDestroy();
        });
    instrumentation.waitForIdleSync();
    instrumentation.runOnMainSync(
        () -> {
          assertEquals(1, readyNotifications);
          assertEquals(0, staleNotifications[0]);
          assertFalse(NavInfoReceivingService.getNavInfoLiveData().hasObservers());
        });
  }

  private InitResult initialize() {
    InitResult result = new InitResult();
    instrumentation.runOnMainSync(
        () -> module.initializeNavigationSession(false, 0, result.promise));
    instrumentation.waitForIdleSync();
    return result;
  }

  private static Navigator createNavigator() {
    return (Navigator)
        Proxy.newProxyInstance(
            Navigator.class.getClassLoader(),
            new Class<?>[] {Navigator.class},
            (proxy, method, args) -> null);
  }

  private static final class InitResult {
    boolean resolved;
    String rejection;
    final PromiseImpl promise =
        new PromiseImpl(
            args -> resolved = true, args -> rejection = ((ReadableMap) args[0]).getString("code"));
  }

  private static final class TestNavModule extends NavModule {
    NavigationApi.NavigatorListener callback;
    boolean rejectTermsImmediately;

    TestNavModule(Application application) {
      super(
          new BridgelessReactContext(
              application, (ReactHostImpl) ((MainApplication) application).getReactHost()),
          new NavViewManager());
    }

    @Override
    void requestNavigator(Application application, NavigationApi.NavigatorListener listener) {
      callback = listener;
      if (rejectTermsImmediately) {
        listener.onError(NavigationApi.ErrorCode.TERMS_NOT_ACCEPTED);
      }
    }

    @Override
    public void logDebugInfo(String info) {
      // Capture diagnostics without requiring a running JavaScript event subscriber.
      Log.d("NavModuleInitializationTest", info);
    }
  }
}
