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

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.IBinder;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.car.app.CarContext;
import androidx.car.app.CarToast;
import androidx.car.app.Screen;
import androidx.car.app.Session;
import androidx.car.app.SessionInfo;
import androidx.lifecycle.DefaultLifecycleObserver;
import androidx.lifecycle.Lifecycle;
import androidx.lifecycle.LifecycleObserver;
import androidx.lifecycle.LifecycleOwner;

public class SampleAndroidAutoSession extends Session {
  static final String TAG = SampleAndroidAutoSession.class.getSimpleName();

  public SampleAndroidAutoSession(SessionInfo sessionInfo) {
    if (sessionInfo.getDisplayType() == SessionInfo.DISPLAY_TYPE_MAIN) {
      Lifecycle lifecycle = getLifecycle();
      lifecycle.addObserver(mLifeCycleObserver);
    }
  }

  private final LifecycleObserver mLifeCycleObserver =
      new DefaultLifecycleObserver() {

        @Override
        public void onCreate(@NonNull LifecycleOwner lifecycleOwner) {
          Log.i(TAG, "In onCreate()");
          getCarContext()
              .bindService(
                  new Intent(getCarContext(), SampleAndroidAutoService.class),
                  mServiceConnection,
                  Context.BIND_AUTO_CREATE);
        }

        @Override
        public void onStart(@NonNull LifecycleOwner lifecycleOwner) {
          Log.i(TAG, "In onStart()");
        }

        @Override
        public void onResume(@NonNull LifecycleOwner lifecycleOwner) {
          Log.i(TAG, "In onResume()");
        }

        @Override
        public void onPause(@NonNull LifecycleOwner lifecycleOwner) {
          Log.i(TAG, "In onPause()");
        }

        @Override
        public void onStop(@NonNull LifecycleOwner lifecycleOwner) {
          Log.i(TAG, "In onStop()");
        }

        @Override
        public void onDestroy(@NonNull LifecycleOwner lifecycleOwner) {
          Log.i(TAG, "In onDestroy()");
          getCarContext().unbindService(mServiceConnection);
        }
      };

  // Monitors the state of the connection to the Navigation service.
  final ServiceConnection mServiceConnection =
      new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
          Log.i(TAG, "In onServiceConnected() component:" + name);
        }

        @Override
        public void onServiceDisconnected(ComponentName name) {
          Log.i(TAG, "In onServiceDisconnected() component:" + name);
        }
      };

  @Override
  @NonNull
  public Screen onCreateScreen(@NonNull Intent intent) {
    Log.i(TAG, "In onCreateScreen()");

    String action = intent.getAction();
    if (action != null && CarContext.ACTION_NAVIGATE.equals(action)) {
      CarToast.makeText(
              getCarContext(), "Navigation intent: " + intent.getDataString(), CarToast.LENGTH_LONG)
          .show();
    }

    return new SampleAndroidAutoScreen(getCarContext());
  }
}
