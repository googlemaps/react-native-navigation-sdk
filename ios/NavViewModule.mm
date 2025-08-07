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

using namespace JS::NativeNavViewModule;

// Static registry for viewControllers
static NSMutableDictionary<NSNumber *, NavViewController *> *NavViewControllersRegistry() {
  static NSMutableDictionary<NSNumber *, NavViewController *> *dict = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    dict = [NSMutableDictionary new];
  });
  return dict;
}

@implementation NavViewModule

RCT_EXPORT_MODULE();

// Static instance of the NavViewModule to allow access from another modules.
static NavViewModule *sharedInstance = nil;

+ (id)allocWithZone:(NSZone *)zone {
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedInstance = [super allocWithZone:zone];
  });
  return sharedInstance;
}

+ (NSMutableDictionary<NSNumber *, NavViewController *> *)viewControllersRegistry {
  return NavViewControllersRegistry();
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeNavViewModuleSpecJSI>(params);
}

// Method to get the shared instance
+ (instancetype)sharedInstance {
  return sharedInstance;
}

- (void)attachViewsToNavigationSession:(GMSNavigationSession *)session {
  for (NavViewController *viewController in [NavViewModule viewControllersRegistry].allValues) {
    [viewController attachToNavigationSession:session];
  }
}

- (void)informPromptVisibilityChange:(BOOL)visible {
  for (NavViewController *viewController in [NavViewModule viewControllersRegistry].allValues) {
    [viewController onPromptVisibilityChange:visible];
  }
}

- (void)setTravelMode:(GMSNavigationTravelMode)travelMode {
  for (NavViewController *viewController in [NavViewModule viewControllersRegistry].allValues) {
    [viewController setTravelMode:travelMode];
  }
}

- (NavViewController *)getViewControllerForNativeID:(NSNumber *)nativeID {
  NavViewController *viewController = [NavViewModule viewControllersRegistry][nativeID];
  return viewController;
}

- (void)addCircle:(double)viewId
          options:(CircleOptionsSpec &)options
          resolve:(nonnull RCTPromiseResolveBlock)resolve
           reject:(nonnull RCTPromiseRejectBlock)reject {
  NSNumber *nativeID = @(viewId);
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  CircleOptionsSpec optionsCopy(options);
  if (viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      CLLocationCoordinate2D center =
          CLLocationCoordinate2DMake(optionsCopy.center().lat(), optionsCopy.center().lng());

      GMSCircle *circle = [ObjectTranslationUtil
          createCircle:center
                radius:optionsCopy.radius()
           strokeWidth:optionsCopy.strokeWidth().value_or(0.0)
           strokeColor:optionsCopy.strokeColor() != nil
                           ? [ObjectTranslationUtil colorFromHexString:optionsCopy.strokeColor()]
                           : nil
             fillColor:optionsCopy.fillColor() != nil
                           ? [ObjectTranslationUtil colorFromHexString:optionsCopy.fillColor()]
                           : nil
             clickable:optionsCopy.clickable().value_or(YES)
                zIndex:optionsCopy.zIndex().has_value() ? @(optionsCopy.zIndex().value()) : nil
            identifier:optionsCopy.id_()];

      [viewController addCircle:circle
                        visible:optionsCopy.visible().value_or(YES)
                         result:^(NSDictionary *result) {
                           resolve(result);
                         }];
    });
  } else {
    reject(@"no_view_controller", @"No viewController found", nil);
  }
}

- (void)addGroundOverlay:(double)viewId
                 options:(SpecAddGroundOverlayOptions &)options
                 resolve:(nonnull RCTPromiseResolveBlock)resolve
                  reject:(nonnull RCTPromiseRejectBlock)reject {
  NSNumber *nativeID = @(viewId);
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  SpecAddGroundOverlayOptions optionsCopy(options);
  if (viewController) {
    dispatch_async(
        dispatch_get_main_queue(), ^{
            /*

            GMSGroundOverlay *overlay = [ObjectTranslationUtil
            createGroundOverlay:position icon:icon width:width
            height:height bearing:bearing transparency:transparency
                                                                         clickable:clickable
                                                                           visible:visible];

            [viewController addGroundOverlay:overlay visible:YES
                                      result:^(NSDictionary *result)
            { resolve(result);
                                      }];*/
        });
  } else {
    reject(@"no_view_controller", @"No viewController found", nil);
  }
}

- (void)addMarker:(double)viewId
          options:(MarkerOptionsSpec &)options
          resolve:(nonnull RCTPromiseResolveBlock)resolve
           reject:(nonnull RCTPromiseRejectBlock)reject {
  NSNumber *nativeID = @(viewId);
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  MarkerOptionsSpec optionsCopy(options);
  if (viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      CLLocationCoordinate2D position =
          CLLocationCoordinate2DMake(optionsCopy.position().lat(), optionsCopy.position().lng());
      NSString *imgPath = optionsCopy.imgPath();
      UIImage *icon = (imgPath && [imgPath isKindOfClass:[NSString class]])
                          ? [UIImage imageNamed:imgPath]
                          : nil;

      GMSMarker *marker = [ObjectTranslationUtil
          createMarker:position
                 title:optionsCopy.title()
               snippet:optionsCopy.snippet()
                 alpha:(float)optionsCopy.alpha().value_or(1.0)
              rotation:optionsCopy.rotation().value_or(0.0)
                  flat:optionsCopy.flat().value_or(NO)
             draggable:optionsCopy.draggable().value_or(NO)
                  icon:icon
                zIndex:optionsCopy.zIndex().has_value() ? @(optionsCopy.zIndex().value()) : nil
            identifier:optionsCopy.id_()];

      [viewController addMarker:marker
                        visible:optionsCopy.visible().value_or(YES)
                         result:^(NSDictionary *result) {
                           resolve(result);
                         }];
    });
  } else {
    reject(@"no_view_controller", @"No viewController found", nil);
  }
}

- (void)addPolygon:(double)viewId
           options:(PolygonOptionsSpec &)options
           resolve:(nonnull RCTPromiseResolveBlock)resolve
            reject:(nonnull RCTPromiseRejectBlock)reject {
  NSNumber *nativeID = @(viewId);
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  PolygonOptionsSpec optionsCopy(options);
  if (viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      GMSMutablePath *path = [GMSMutablePath path];
      for (const auto &point : optionsCopy.points()) {
        CLLocationCoordinate2D coord = CLLocationCoordinate2DMake(point.lat(), point.lng());
        [path addCoordinate:coord];
      }

      NSMutableArray<GMSPath *> *holePaths = nil;
      if (optionsCopy.holes().size() > 0) {
        holePaths = [[NSMutableArray alloc] init];
        for (const auto &holePoints : optionsCopy.holes()) {
          GMSMutablePath *holePath = [GMSMutablePath path];
          for (const auto &point : holePoints) {
            CLLocationCoordinate2D coord = CLLocationCoordinate2DMake(point.lat(), point.lng());
            [holePath addCoordinate:coord];
          }
          [holePaths addObject:holePath];
        }
      }

      GMSPolygon *polygon = [ObjectTranslationUtil
          createPolygon:path
                  holes:holePaths
              fillColor:optionsCopy.fillColor() != nil
                            ? [ObjectTranslationUtil colorFromHexString:optionsCopy.fillColor()]
                            : nil
            strokeColor:optionsCopy.strokeColor() != nil
                            ? [ObjectTranslationUtil colorFromHexString:optionsCopy.strokeColor()]
                            : nil
            strokeWidth:optionsCopy.strokeWidth().value_or(1.0f)
               geodesic:optionsCopy.geodesic().value_or(NO)
              clickable:optionsCopy.clickable().value_or(YES)
                 zIndex:optionsCopy.zIndex().has_value() ? @(optionsCopy.zIndex().value()) : nil
             identifier:optionsCopy.id_()];

      [viewController addPolygon:polygon
                         visible:optionsCopy.visible().value_or(YES)
                          result:^(NSDictionary *result) {
                            resolve(result);
                          }];
    });
  } else {
    reject(@"no_view_controller", @"No viewController found", nil);
  }
}

- (void)addPolyline:(double)viewId
            options:(PolylineOptionsSpec &)options
            resolve:(nonnull RCTPromiseResolveBlock)resolve
             reject:(nonnull RCTPromiseRejectBlock)reject {
  NSNumber *nativeID = @(viewId);
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  PolylineOptionsSpec optionsCopy(options);
  if (viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      GMSMutablePath *path = [GMSMutablePath path];
      for (const auto &point : optionsCopy.points()) {
        CLLocationCoordinate2D coord = CLLocationCoordinate2DMake(point.lat(), point.lng());
        [path addCoordinate:coord];
      }

      GMSPolyline *polyline = [ObjectTranslationUtil
          createPolyline:path
                   width:optionsCopy.width().value_or(1.0f)
                   color:optionsCopy.color() != nil
                             ? [ObjectTranslationUtil colorFromHexString:optionsCopy.color()]
                             : nil
               clickable:optionsCopy.clickable().value_or(YES)
                  zIndex:optionsCopy.zIndex().has_value() ? @(optionsCopy.zIndex().value()) : nil
              identifier:optionsCopy.id_()];

      [viewController addPolyline:polyline
                          visible:optionsCopy.visible().value_or(YES)
                           result:^(NSDictionary *result) {
                             resolve(result);
                           }];
    });
  } else {
    reject(@"no_view_controller", @"No viewController found", nil);
  }
}

- (void)getCameraPosition:(double)viewId
                  resolve:(nonnull RCTPromiseResolveBlock)resolve
                   reject:(nonnull RCTPromiseRejectBlock)reject {
  NSNumber *nativeID = @(viewId);
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  if (viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [viewController getCameraPosition:^(NSDictionary *result) {
        resolve(result);
      }];
    });
  } else {
    reject(@"no_view_controller", @"No viewController found", nil);
  }
}

- (void)getMyLocation:(double)viewId
              resolve:(nonnull RCTPromiseResolveBlock)resolve
               reject:(nonnull RCTPromiseRejectBlock)reject {
  NSNumber *nativeID = @(viewId);
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  if (viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [viewController getMyLocation:^(NSDictionary *result) {
        resolve(result);
      }];
    });
  } else {
    reject(@"no_view_controller", @"No viewController found", nil);
  }
}

- (void)getUiSettings:(double)viewId
              resolve:(nonnull RCTPromiseResolveBlock)resolve
               reject:(nonnull RCTPromiseRejectBlock)reject {
  NSNumber *nativeID = @(viewId);
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  if (viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [viewController getUiSettings:^(NSDictionary *result) {
        resolve(result);
      }];
    });
  } else {
    reject(@"no_view_controller", @"No viewController found", nil);
  }
}

- (void)isMyLocationEnabled:(double)viewId
                    resolve:(nonnull RCTPromiseResolveBlock)resolve
                     reject:(nonnull RCTPromiseRejectBlock)reject {
  NSNumber *nativeID = @(viewId);
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  if (viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [viewController isMyLocationEnabled:^(BOOL result) {
        resolve(result ? @YES : @NO);
      }];
    });
  } else {
    reject(@"no_view_controller", @"No viewController found", nil);
  }
}

- (void)moveCamera:(double)viewId
    cameraPosition:(CameraPositionSpec &)cameraPosition
           resolve:(nonnull RCTPromiseResolveBlock)resolve
            reject:(nonnull RCTPromiseRejectBlock)reject {
  NSNumber *nativeID = @(viewId);
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  if (viewController) {
    GMSMutableCameraPosition *position = [[GMSMutableCameraPosition alloc] init];

    if (cameraPosition.target().has_value()) {
      auto target = cameraPosition.target().value();
      position.target = CLLocationCoordinate2DMake(target.lat(), target.lng());
    }

    if (cameraPosition.zoom().has_value()) {
      position.zoom = cameraPosition.zoom().value();
    }

    if (cameraPosition.bearing().has_value()) {
      position.bearing = cameraPosition.bearing().value();
    }

    if (cameraPosition.tilt().has_value()) {
      position.viewingAngle = cameraPosition.tilt().value();
    }
    dispatch_async(dispatch_get_main_queue(), ^{
      [viewController moveCamera:position];
    });
    resolve(nil);
  } else {
    reject(@"no_view_controller", @"No viewController found", nil);
  }
}

- (void)clearMapView:(double)viewId
             resolve:(nonnull RCTPromiseResolveBlock)resolve
              reject:(nonnull RCTPromiseRejectBlock)reject {
  NSNumber *nativeID = @(viewId);
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  if (viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [viewController clearMapView:^(BOOL result) {
        resolve(result ? @YES : @NO);
      }];
    });
  } else {
    reject(@"no_view_controller", @"No viewController found", nil);
  }
}

- (void)removeCircle:(double)viewId
                  id:(nonnull NSString *)id
             resolve:(nonnull RCTPromiseResolveBlock)resolve
              reject:(nonnull RCTPromiseRejectBlock)reject {
  NSNumber *nativeID = @(viewId);
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  if (viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [viewController removeCircle:id
                            result:^(BOOL result) {
                              resolve(result ? @YES : @NO);
                            }];
    });
  } else {
    reject(@"no_view_controller", @"No viewController found", nil);
  }
}

- (void)removeGroundOverlay:(double)viewId
                         id:(nonnull NSString *)id
                    resolve:(nonnull RCTPromiseResolveBlock)resolve
                     reject:(nonnull RCTPromiseRejectBlock)reject {
  NSNumber *nativeID = @(viewId);
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  if (viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [viewController removeGroundOverlay:id
                                   result:^(BOOL result) {
                                     resolve(result ? @YES : @NO);
                                   }];
    });
  } else {
    reject(@"no_view_controller", @"No viewController found", nil);
  }
}

- (void)removeMarker:(double)viewId
                  id:(nonnull NSString *)id
             resolve:(nonnull RCTPromiseResolveBlock)resolve
              reject:(nonnull RCTPromiseRejectBlock)reject {
  NSNumber *nativeID = @(viewId);
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  if (viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [viewController removeMarker:id
                            result:^(BOOL result) {
                              resolve(result ? @YES : @NO);
                            }];
    });
  } else {
    reject(@"no_view_controller", @"No viewController found", nil);
  }
}

- (void)removePolygon:(double)viewId
                   id:(nonnull NSString *)id
              resolve:(nonnull RCTPromiseResolveBlock)resolve
               reject:(nonnull RCTPromiseRejectBlock)reject {
  NSNumber *nativeID = @(viewId);
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  if (viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [viewController removePolygon:id
                             result:^(BOOL result) {
                               resolve(result ? @YES : @NO);
                             }];
    });
  } else {
    reject(@"no_view_controller", @"No viewController found", nil);
  }
}

- (void)removePolyline:(double)viewId
                    id:(nonnull NSString *)id
               resolve:(nonnull RCTPromiseResolveBlock)resolve
                reject:(nonnull RCTPromiseRejectBlock)reject {
  NSNumber *nativeID = @(viewId);
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  if (viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [viewController removePolyline:id
                              result:^(BOOL result) {
                                resolve(result ? @YES : @NO);
                              }];
    });

  } else {
    reject(@"no_view_controller", @"No viewController found", nil);
  }
}

- (void)setZoomLevel:(double)viewId
               level:(double)level
             resolve:(nonnull RCTPromiseResolveBlock)resolve
              reject:(nonnull RCTPromiseRejectBlock)reject {
  NSNumber *nativeID = @(viewId);
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  if (viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [viewController setZoomLevel:@(level)
                            result:^(BOOL result) {
                              resolve(result ? @YES : @NO);
                            }];
    });
  } else {
    reject(@"no_view_controller", @"No viewController found", nil);
  }
}

- (void)showRouteOverview:(double)viewId
                  resolve:(nonnull RCTPromiseResolveBlock)resolve
                   reject:(nonnull RCTPromiseRejectBlock)reject {
  NSNumber *nativeID = @(viewId);
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  if (viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [viewController showRouteOverview:^(BOOL result) {
        resolve(result ? @YES : @NO);
      }];
    });
  } else {
    reject(@"no_view_controller", @"No viewController found", nil);
  }
}

@end
