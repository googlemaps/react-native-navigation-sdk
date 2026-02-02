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

import com.facebook.proguard.annotations.DoNotStrip;
import com.facebook.react.BaseReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.model.ReactModuleInfo;
import com.facebook.react.module.model.ReactModuleInfoProvider;
import com.facebook.react.uimanager.ViewManager;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@DoNotStrip
public class Package extends BaseReactPackage {

  @Override
  public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
    List<ViewManager> viewManagers = new ArrayList<>();
    viewManagers.add(NavViewManager.getInstance(reactContext));
    return viewManagers;
  }

  @Override
  public NativeModule getModule(String name, ReactApplicationContext reactContext) {
    NavViewManager viewManager = NavViewManager.getInstance(reactContext);

    switch (name) {
      case NavModule.REACT_CLASS:
        return NavModule.getInstance(reactContext, viewManager);
      case NavAutoModule.REACT_CLASS:
        return new NavAutoModule(reactContext);
      case NavViewModule.REACT_CLASS:
        return new NavViewModule(reactContext, viewManager);
      default:
        return null;
    }
  }

  @Override
  public ReactModuleInfoProvider getReactModuleInfoProvider() {
    return () -> {
      Map<String, ReactModuleInfo> moduleInfos = new HashMap<>();

      moduleInfos.put(
          NavModule.REACT_CLASS,
          new ReactModuleInfo(
              NavModule.REACT_CLASS,
              NavModule.REACT_CLASS,
              false, // canOverrideExistingModule
              false, // needsEagerInit
              false, // isCxxModule
              true // isTurboModule
              ));

      moduleInfos.put(
          NavAutoModule.REACT_CLASS,
          new ReactModuleInfo(
              NavAutoModule.REACT_CLASS,
              NavAutoModule.REACT_CLASS,
              false, // canOverrideExistingModule
              false, // needsEagerInit
              false, // isCxxModule
              true // isTurboModule
              ));

      moduleInfos.put(
          NavViewModule.REACT_CLASS,
          new ReactModuleInfo(
              NavViewModule.REACT_CLASS,
              NavViewModule.REACT_CLASS,
              false, // canOverrideExistingModule
              false, // needsEagerInit
              false, // isCxxModule
              true // isTurboModule
              ));

      return moduleInfos;
    };
  }
}
