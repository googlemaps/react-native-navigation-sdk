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

#import "NavAutoModule.h"

using namespace JS::NativeNavAutoModule;

@implementation NavAutoModule

RCT_EXPORT_MODULE();

// Static instance of the NavAutoModule to allow access from another modules.
static NavAutoModule *sharedInstance = nil;

static NavAutoModuleReadyCallback _navAutoModuleReadyCallback;

+ (id)allocWithZone:(NSZone *)zone {
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedInstance = [super allocWithZone:zone];
  });
  if (_navAutoModuleReadyCallback) {
    _navAutoModuleReadyCallback();
  }
  return sharedInstance;
}

// Method to get the shared instance
+ (instancetype)sharedInstance {
  return sharedInstance;
}

// Get or create the shared instance
+ (instancetype)getOrCreateSharedInstance {
  if (sharedInstance == nil) {
    sharedInstance = [[NavAutoModule allocWithZone:nil] init];
  }
  return sharedInstance;
}

- (void)registerViewController:(NavViewController *)vc {
  self.viewController = vc;
  [self onScreenStateChange:true];
}

- (void)unRegisterViewController {
  self.viewController = nil;
  [self onScreenStateChange:false];
}

+ (void)registerNavAutoModuleReadyCallback:(NavAutoModuleReadyCallback)callback {
  _navAutoModuleReadyCallback = [callback copy];
}

+ (void)unregisterNavAutoModuleReadyCallback {
  _navAutoModuleReadyCallback = nil;
}

- (void)onScreenStateChange:(BOOL)available {
  [self emitOnAutoScreenAvailabilityChanged:available];
}

- (void)onCustomNavigationAutoEvent:(NSString *)type data:(nullable NSDictionary *)data {
  NSMutableDictionary *map = [NSMutableDictionary dictionary];
  [map setObject:type forKey:@"type"];
  [map setObject:(data != nil ? data : [NSNull null]) forKey:@"data"];

  [self emitOnCustomNavigationAutoEvent:map];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeNavAutoModuleSpecJSI>(params);
}

- (void)addCircle:(CircleOptionsSpec &)options
          resolve:(nonnull RCTPromiseResolveBlock)resolve
           reject:(nonnull RCTPromiseRejectBlock)reject {
  if (self->_viewController) {
    CircleOptionsSpec optionsCopy(options);
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

      [self->_viewController addCircle:circle
                               visible:optionsCopy.visible().value_or(YES)
                                result:^(NSDictionary *result) {
                                  resolve(result);
                                }];
    });
  } else {
    reject(@"no_view_controller", @"No viewController found", nil);
  }
}

- (void)addGroundOverlay:(SpecAddGroundOverlayOptions &)options
                 resolve:(nonnull RCTPromiseResolveBlock)resolve
                  reject:(nonnull RCTPromiseRejectBlock)reject {
  // Not implemented, just reject for now
  reject(@"not_implemented", @"addGroundOverlay not implemented", nil);
}

- (void)addMarker:(MarkerOptionsSpec &)options
          resolve:(nonnull RCTPromiseResolveBlock)resolve
           reject:(nonnull RCTPromiseRejectBlock)reject {
  MarkerOptionsSpec optionsCopy(options);
  if (self->_viewController) {
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

      [self->_viewController addMarker:marker
                               visible:optionsCopy.visible().value_or(YES)
                                result:^(NSDictionary *result) {
                                  resolve(result);
                                }];
    });
  } else {
    reject(@"no_view_controller", @"No viewController found", nil);
  }
}

- (void)addPolygon:(PolygonOptionsSpec &)options
           resolve:(nonnull RCTPromiseResolveBlock)resolve
            reject:(nonnull RCTPromiseRejectBlock)reject {
  if (self->_viewController) {
    PolygonOptionsSpec optionsCopy(options);
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

      [self->_viewController addPolygon:polygon
                                visible:options.visible().value_or(YES)
                                 result:^(NSDictionary *result) {
                                   resolve(result);
                                 }];
    });
  } else {
    reject(@"no_view_controller", @"No viewController found", nil);
  }
}

- (void)addPolyline:(PolylineOptionsSpec &)options
            resolve:(nonnull RCTPromiseResolveBlock)resolve
             reject:(nonnull RCTPromiseRejectBlock)reject {
  if (self->_viewController) {
    PolylineOptionsSpec optionsCopy(options);
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
      [self->_viewController addPolyline:polyline
                                 visible:optionsCopy.visible().value_or(YES)
                                  result:^(NSDictionary *result) {
                                    resolve(result);
                                  }];
    });
  } else {
    reject(@"no_view_controller", @"No viewController found", nil);
  }
}

- (void)getCameraPosition:(nonnull RCTPromiseResolveBlock)resolve
                   reject:(nonnull RCTPromiseRejectBlock)reject {
  if (self->_viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [self->_viewController getCameraPosition:^(NSDictionary *result) {
        resolve(result);
      }];
    });
  } else {
    reject(@"no_view_controller", @"No viewController found", nil);
  }
}

- (void)getMyLocation:(nonnull RCTPromiseResolveBlock)resolve
               reject:(nonnull RCTPromiseRejectBlock)reject {
  if (self->_viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [self->_viewController getMyLocation:^(NSDictionary *result) {
        resolve(result);
      }];
    });
  } else {
    reject(@"no_view_controller", @"No viewController found", nil);
  }
}

- (void)getUiSettings:(nonnull RCTPromiseResolveBlock)resolve
               reject:(nonnull RCTPromiseRejectBlock)reject {
  if (self->_viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [self->_viewController getUiSettings:^(NSDictionary *result) {
        resolve(result);
      }];
    });
  } else {
    reject(@"no_view_controller", @"No viewController found", nil);
  }
}

- (void)isAutoScreenAvailable:(nonnull RCTPromiseResolveBlock)resolve
                       reject:(nonnull RCTPromiseRejectBlock)reject {
  BOOL hasViewController = self->_viewController != nil;
  resolve([NSNumber numberWithBool:hasViewController]);
}

- (void)isMyLocationEnabled:(nonnull RCTPromiseResolveBlock)resolve
                     reject:(nonnull RCTPromiseRejectBlock)reject {
  if (self->_viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [self->_viewController isMyLocationEnabled:^(BOOL result) {
        resolve([NSNumber numberWithBool:result]);
      }];
    });
  } else {
    reject(@"no_view_controller", @"No viewController found", nil);
  }
}

- (void)moveCamera:(JS::NativeNavAutoModule::CameraPositionSpec &)cameraPosition
           resolve:(nonnull RCTPromiseResolveBlock)resolve
            reject:(nonnull RCTPromiseRejectBlock)reject {
  if (self->_viewController) {
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
      [self->_viewController moveCamera:position];
    });
    resolve(nil);
  } else {
    reject(@"no_view_controller", @"No viewController found", nil);
  }
}

- (void)removeCircle:(nonnull NSString *)id
             resolve:(nonnull RCTPromiseResolveBlock)resolve
              reject:(nonnull RCTPromiseRejectBlock)reject {
  if (self->_viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [self->_viewController removeCircle:id
                                   result:^(BOOL result) {
                                     resolve(result ? @YES : @NO);
                                   }];
    });
  } else {
    reject(@"no_view_controller", @"No viewController found", nil);
  }
}

- (void)removeGroundOverlay:(nonnull NSString *)id
                    resolve:(nonnull RCTPromiseResolveBlock)resolve
                     reject:(nonnull RCTPromiseRejectBlock)reject {
  if (self->_viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [self->_viewController removeGroundOverlay:id
                                          result:^(BOOL result) {
                                            resolve(result ? @YES : @NO);
                                          }];
    });
  } else {
    reject(@"no_view_controller", @"No viewController found", nil);
  }
}

- (void)removeMarker:(nonnull NSString *)id
             resolve:(nonnull RCTPromiseResolveBlock)resolve
              reject:(nonnull RCTPromiseRejectBlock)reject {
  if (self->_viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [self->_viewController removeMarker:id
                                   result:^(BOOL result) {
                                     resolve(result ? @YES : @NO);
                                   }];
    });
  } else {
    reject(@"no_view_controller", @"No viewController found", nil);
  }
}

- (void)removePolygon:(nonnull NSString *)id
              resolve:(nonnull RCTPromiseResolveBlock)resolve
               reject:(nonnull RCTPromiseRejectBlock)reject {
  if (self->_viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [self->_viewController removePolygon:id
                                    result:^(BOOL result) {
                                      resolve(result ? @YES : @NO);
                                    }];
    });
  } else {
    reject(@"no_view_controller", @"No viewController found", nil);
  }
}

- (void)removePolyline:(nonnull NSString *)id
               resolve:(nonnull RCTPromiseResolveBlock)resolve
                reject:(nonnull RCTPromiseRejectBlock)reject {
  if (self->_viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [self->_viewController removePolyline:id
                                     result:^(BOOL result) {
                                       resolve(result ? @YES : @NO);
                                     }];
    });

  } else {
    reject(@"no_view_controller", @"No viewController found", nil);
  }
}

- (void)clearMapView:(nonnull RCTPromiseResolveBlock)resolve
              reject:(nonnull RCTPromiseRejectBlock)reject {
  if (self->_viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [self->_viewController clearMapView:^(BOOL result) {
        resolve(result ? @YES : @NO);
      }];
    });
  } else {
    reject(@"no_view_controller", @"No viewController found", nil);
  }
}

- (void)setBuildingsEnabled:(BOOL)isOn {
  if (self->_viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [self->_viewController setBuildingsEnabled:isOn];
    });
  }
}

- (void)setCompassEnabled:(BOOL)isOn {
  if (self->_viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [self->_viewController setCompassEnabled:isOn];
    });
  }
}

- (void)setIndoorEnabled:(BOOL)isOn {
  if (self->_viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [self->_viewController setIndoorEnabled:isOn];
    });
  }
}

- (void)setMapPadding:(double)top left:(double)left bottom:(double)bottom right:(double)right {
  if (self->_viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [self->_viewController setPadding:UIEdgeInsetsMake(top, left, bottom, right)];
    });
  }
}

- (void)setMapStyle:(nonnull NSString *)mapStyle {
  if (self->_viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      NSError *error;
      GMSMapStyle *style = [GMSMapStyle styleWithJSONString:mapStyle error:&error];
      if (!style) {
        return;
      }
      [self->_viewController setMapStyle:style];
    });
  }
}

- (void)setMapType:(double)mapType {
  if (self->_viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      GMSMapViewType mapViewType;
      switch ((NSInteger)mapType) {
        case 1:
          mapViewType = kGMSTypeNormal;
          break;
        case 2:
          mapViewType = kGMSTypeSatellite;
          break;
        case 3:
          mapViewType = kGMSTypeTerrain;
          break;
        case 4:
          mapViewType = kGMSTypeHybrid;
          break;
        default:
          mapViewType = kGMSTypeNone;
          break;
      }
      [self->_viewController setMapType:mapViewType];
    });
  }
}

- (void)setMyLocationEnabled:(BOOL)isOn {
  if (self->_viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [self->_viewController setMyLocationEnabled:isOn];
    });
  }
}

- (void)setTrafficEnabled:(BOOL)isOn {
  if (self->_viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [self->_viewController setTrafficEnabled:isOn];
    });
  }
}

- (void)setZoomLevel:(double)zoomLevel
             resolve:(nonnull RCTPromiseResolveBlock)resolve
              reject:(nonnull RCTPromiseRejectBlock)reject {
  if (self->_viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [self->_viewController setZoomLevel:@(zoomLevel)
                                   result:^(BOOL result) {
                                     resolve(result ? @YES : @NO);
                                   }];
    });
  } else {
    reject(@"no_view_controller", @"No viewController found", nil);
  }
}

@end
