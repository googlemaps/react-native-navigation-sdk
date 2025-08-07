/*
 * Copyright 2025 Google LLC
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

package com.google.maps.android.rn.navsdk

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager
import java.util.HashMap

class GMNNavPackage : BaseReactPackage() {
  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    val viewManagers: MutableList<ViewManager<*, *>> = ArrayList()
    viewManagers.add(GMNNavViewManager.getInstance(reactContext))
    return viewManagers
  }

  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    return when (name) {
      GMNNavModule.NAME -> {
        GMNNavModule.getInstance(reactContext, GMNNavViewManager.getInstance(reactContext))
      }
      GMNNavAutoModule.NAME -> {
        GMNNavAutoModule(reactContext)
      }
      GMNNavViewModule.NAME -> {
        GMNNavViewModule(reactContext, GMNNavViewManager.getInstance(reactContext))
      }
      else -> {
        null
      }
    }
  }

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
    return ReactModuleInfoProvider {
      val moduleInfos: MutableMap<String, ReactModuleInfo> = HashMap()
      moduleInfos[GMNNavModule.NAME] =
        ReactModuleInfo(
          name = GMNNavModule.NAME,
          className = GMNNavModule.NAME,
          canOverrideExistingModule = false,
          needsEagerInit = false,
          isCxxModule = false,
          isTurboModule = true,
        )
      moduleInfos[GMNNavAutoModule.NAME] =
        ReactModuleInfo(
          name = GMNNavAutoModule.NAME,
          className = GMNNavAutoModule.NAME,
          canOverrideExistingModule = false,
          needsEagerInit = false,
          isCxxModule = false,
          isTurboModule = true,
        )
      moduleInfos[GMNNavViewModule.NAME] =
        ReactModuleInfo(
          name = GMNNavViewModule.NAME,
          className = GMNNavViewModule.NAME,
          canOverrideExistingModule = false,
          needsEagerInit = false,
          isCxxModule = false,
          isTurboModule = true,
        )
      moduleInfos
    }
  }
}
