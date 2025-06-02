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
package com.google.maps.android.rn.navsdkexample

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.os.IBinder
import android.util.Log
import androidx.car.app.CarContext
import androidx.car.app.CarToast
import androidx.car.app.Screen
import androidx.car.app.Session
import androidx.car.app.SessionInfo
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleObserver
import androidx.lifecycle.LifecycleOwner

class SampleAndroidAutoSession(sessionInfo: SessionInfo) : Session() {
  private val mLifeCycleObserver: LifecycleObserver =
    object : DefaultLifecycleObserver {
      override fun onCreate(owner: LifecycleOwner) {
        Log.i(TAG, "In onCreate()")
        carContext.bindService(
          Intent(carContext, SampleAndroidAutoService::class.java),
          mServiceConnection,
          Context.BIND_AUTO_CREATE,
        )
      }

      override fun onStart(owner: LifecycleOwner) {
        Log.i(TAG, "In onStart()")
      }

      override fun onResume(owner: LifecycleOwner) {
        Log.i(TAG, "In onResume()")
      }

      override fun onPause(owner: LifecycleOwner) {
        Log.i(TAG, "In onPause()")
      }

      override fun onStop(owner: LifecycleOwner) {
        Log.i(TAG, "In onStop()")
      }

      override fun onDestroy(owner: LifecycleOwner) {
        Log.i(TAG, "In onDestroy()")
        carContext.unbindService(mServiceConnection)
      }
    }

  // Monitors the state of the connection to the Navigation service.
  val mServiceConnection: ServiceConnection =
    object : ServiceConnection {
      override fun onServiceConnected(name: ComponentName, service: IBinder) {
        Log.i(TAG, "In onServiceConnected() component:$name")
      }

      override fun onServiceDisconnected(name: ComponentName) {
        Log.i(TAG, "In onServiceDisconnected() component:$name")
      }
    }

  init {
    if (sessionInfo.displayType == SessionInfo.DISPLAY_TYPE_MAIN) {
      lifecycle.addObserver(mLifeCycleObserver)
    }
  }

  override fun onCreateScreen(intent: Intent): Screen {
    Log.i(TAG, "In onCreateScreen()")

    val action = intent.action
    if (action != null && CarContext.ACTION_NAVIGATE == action) {
      CarToast.makeText(carContext, "Navigation intent: " + intent.dataString, CarToast.LENGTH_LONG)
        .show()
    }

    return SampleAndroidAutoScreen(carContext)
  }

  companion object {
    val TAG: String = SampleAndroidAutoSession::class.java.simpleName
  }
}
