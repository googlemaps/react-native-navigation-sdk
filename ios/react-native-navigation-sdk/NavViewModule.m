/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#import "NavViewModule.h"
#import "NavView.h"

@implementation NavViewModule

RCT_EXPORT_MODULE(NavViewModule);

// Static instance of the NavViewModule to allow access from another modules.
static NavViewModule *sharedInstance = nil;

+ (id)allocWithZone:(NSZone *)zone {
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedInstance = [super allocWithZone:zone];
  });
  return sharedInstance;
}

// Method to get the shared instance
+ (instancetype)sharedInstance {
  return sharedInstance;
}

- (void)attachViewsToNavigationSession {
  for (NavViewController *viewController in self.viewControllers.objectEnumerator) {
    [viewController attachToNavigationSessionIfNeeded];
  }
}

- (void)navigationSessionDestroyed {
  for (NavViewController *viewController in self.viewControllers.objectEnumerator) {
    [viewController navigationSessionDestroyed];
  }
}

- (void)informPromptVisibilityChange:(BOOL)visible {
  for (NavViewController *viewController in self.viewControllers.objectEnumerator) {
    [viewController onPromptVisibilityChange:visible];
  }
}

- (void)setTravelMode:(GMSNavigationTravelMode)travelMode {
  for (NavViewController *viewController in self.viewControllers.objectEnumerator) {
    [viewController setTravelMode:travelMode];
  }
}

- (NavViewController *)getViewControllerForTag:(NSNumber *)reactTag {
  NavViewController *viewController = [self.viewControllers objectForKey:reactTag];
  return viewController;
}

RCT_EXPORT_METHOD(getCameraPosition : (nonnull NSNumber *)reactTag resolver : (
    RCTPromiseResolveBlock)resolve rejecter : (RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController getCameraPosition:^(NSDictionary *result) {
        resolve(result);
      }];
    } else {
      reject(@"no_view_controller", @"No viewController found", nil);
    }
  });
}

RCT_EXPORT_METHOD(getMyLocation : (nonnull NSNumber *)reactTag resolver : (RCTPromiseResolveBlock)
                      resolve rejecter : (RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController getMyLocation:^(NSDictionary *result) {
        resolve(result);
      }];
    } else {
      reject(@"no_view_controller", @"No viewController found", nil);
    }
  });
}

RCT_EXPORT_METHOD(getUiSettings : (nonnull NSNumber *)reactTag resolver : (RCTPromiseResolveBlock)
                      resolve rejecter : (RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController getUiSettings:^(NSDictionary *result) {
        resolve(result);
      }];
    } else {
      reject(@"no_view_controller", @"No viewController found", nil);
    }
  });
}

RCT_EXPORT_METHOD(isMyLocationEnabled : (nonnull NSNumber *)reactTag resolver : (
    RCTPromiseResolveBlock)resolve rejecter : (RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController isMyLocationEnabled:^(BOOL result) {
        resolve(result ? @"true" : @"false");
      }];
    } else {
      reject(@"no_view_controller", @"No viewController found", nil);
    }
  });
}

RCT_EXPORT_METHOD(addMarker : (nonnull NSNumber *)reactTag markerOptions : (NSDictionary *)
                      markerOptions resolver : (RCTPromiseResolveBlock)
                          resolve rejecter : (RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController addMarker:markerOptions
                         result:^(NSDictionary *result) {
                           resolve(result);
                         }];
    } else {
      reject(@"no_view_controller", @"No viewController found", nil);
    }
  });
}

RCT_EXPORT_METHOD(addPolyline : (nonnull NSNumber *)reactTag polylineOptions : (NSDictionary *)
                      polylineOptions resolver : (RCTPromiseResolveBlock)
                          resolve rejecter : (RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController addPolyline:polylineOptions
                           result:^(NSDictionary *result) {
                             resolve(result);
                           }];
    } else {
      reject(@"no_view_controller", @"No viewController found", nil);
    }
  });
}

RCT_EXPORT_METHOD(addPolygon : (nonnull NSNumber *)reactTag polygonOptions : (NSDictionary *)
                      polygonOptions resolver : (RCTPromiseResolveBlock)
                          resolve rejecter : (RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController addPolygon:polygonOptions
                          result:^(NSDictionary *result) {
                            resolve(result);
                          }];
    } else {
      reject(@"no_view_controller", @"No viewController found", nil);
    }
  });
}

RCT_EXPORT_METHOD(addCircle : (nonnull NSNumber *)reactTag circleOptions : (NSDictionary *)
                      circleOptions resolver : (RCTPromiseResolveBlock)
                          resolve rejecter : (RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController addCircle:circleOptions
                         result:^(NSDictionary *result) {
                           resolve(result);
                         }];
    } else {
      reject(@"no_view_controller", @"No viewController found", nil);
    }
  });
}

RCT_EXPORT_METHOD(addGroundOverlay : (nonnull NSNumber *)reactTag overlayOptions : (NSDictionary *)
                      overlayOptions resolver : (RCTPromiseResolveBlock)
                          resolve rejecter : (RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController addGroundOverlay:overlayOptions
                                result:^(NSDictionary *result) {
                                  resolve(result);
                                }];
    } else {
      reject(@"no_view_controller", @"No viewController found", nil);
    }
  });
}

@end
