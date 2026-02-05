// Copyright 2026 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#import "NavAutoModule.h"
#import <RNNavigationSdkSpec/RNNavigationSdkSpec.h>
#import "BaseCarSceneDelegate.h"
#import "NavViewController.h"
#import "ObjectTranslationUtil.h"

using namespace JS::NativeNavAutoModule;

@implementation NavAutoModule

RCT_EXPORT_MODULE(NavAutoModule);

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

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeNavAutoModuleSpecJSI>(params);
}

// Get or create the shared instance
+ (instancetype)getOrCreateSharedInstance {
  if (sharedInstance == nil) {
    sharedInstance = [[NavAutoModule allocWithZone:nil] init];
  }
  return sharedInstance;
}

- (void)registerViewController:(NavViewController *)vc {
  [self registerViewController:vc delegate:nil];
}

- (void)registerViewController:(NavViewController *)vc
                      delegate:(nullable BaseCarSceneDelegate *)delegate {
  self.viewController = vc;
  self.carSceneDelegate = delegate;
  [self onScreenStateChange:true];
}

- (void)unRegisterViewController {
  self.viewController = nil;
  self.carSceneDelegate = nil;
  [self onScreenStateChange:false];
}

+ (void)registerNavAutoModuleReadyCallback:(NavAutoModuleReadyCallback)callback {
  _navAutoModuleReadyCallback = [callback copy];
}

+ (void)unregisterNavAutoModuleReadyCallback {
  _navAutoModuleReadyCallback = nil;
}

- (void)setMapType:(double)mapType {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_viewController) {
      GMSMapViewType mapViewType;
      NSInteger type = (NSInteger)mapType;
      switch (type) {
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
    }
  });
}

- (void)setMapStyle:(NSString *)mapStyle {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_viewController) {
      NSError *error;
      GMSMapStyle *style = [GMSMapStyle styleWithJSONString:mapStyle error:&error];
      if (!style) {
        return;
      }
      [self->_viewController setMapStyle:style];
    }
  });
}

- (void)clearMapView:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_viewController) {
      [self->_viewController clearMapView];
      resolve(@YES);
    } else {
      reject(@"NO_VIEW_CONTROLLER", @"No view controller found", nil);
    }
  });
}

- (void)addMarker:(MarkerOptionsSpec &)options
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject {
  MarkerOptionsSpec optionsCopy(options);
  if (_viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      CLLocationCoordinate2D position =
          CLLocationCoordinate2DMake(optionsCopy.position().lat(), optionsCopy.position().lng());
      NSString *imgPath = optionsCopy.imgPath();
      UIImage *icon = nil;
      if (imgPath && [imgPath isKindOfClass:[NSString class]] && imgPath.length > 0) {
        icon = [UIImage imageNamed:imgPath];
        if (!icon) {
          reject(@"INVALID_IMAGE", @"Failed to load image from the provided path", nil);
          return;
        }
      }

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
    reject(@"NO_VIEW_CONTROLLER", @"No view controller found", nil);
  }
}

- (void)addCircle:(CircleOptionsSpec &)options
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject {
  CircleOptionsSpec optionsCopy(options);
  if (_viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      CLLocationCoordinate2D center =
          CLLocationCoordinate2DMake(optionsCopy.center().lat(), optionsCopy.center().lng());

      UIColor *strokeColor = nil;
      auto strokeColorOpt = optionsCopy.strokeColor();
      if (strokeColorOpt.has_value()) {
        strokeColor = [UIColor colorWithColorInt:@(strokeColorOpt.value())];
      }

      UIColor *fillColor = nil;
      auto fillColorOpt = optionsCopy.fillColor();
      if (fillColorOpt.has_value()) {
        fillColor = [UIColor colorWithColorInt:@(fillColorOpt.value())];
      }

      GMSCircle *circle = [ObjectTranslationUtil
          createCircle:center
                radius:optionsCopy.radius()
           strokeWidth:optionsCopy.strokeWidth().value_or(0.0)
           strokeColor:strokeColor
             fillColor:fillColor
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
    reject(@"NO_VIEW_CONTROLLER", @"No view controller found", nil);
  }
}

- (void)addPolyline:(PolylineOptionsSpec &)options
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject {
  PolylineOptionsSpec optionsCopy(options);
  if (_viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      GMSMutablePath *path = [GMSMutablePath path];
      for (const auto &point : optionsCopy.points()) {
        CLLocationCoordinate2D coord = CLLocationCoordinate2DMake(point.lat(), point.lng());
        [path addCoordinate:coord];
      }

      UIColor *color = nil;
      auto colorOpt = optionsCopy.color();
      if (colorOpt.has_value()) {
        color = [UIColor colorWithColorInt:@(colorOpt.value())];
      }

      GMSPolyline *polyline = [ObjectTranslationUtil
          createPolyline:path
                   width:optionsCopy.width().value_or(1.0f)
                   color:color
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
    reject(@"NO_VIEW_CONTROLLER", @"No view controller found", nil);
  }
}

- (void)addPolygon:(PolygonOptionsSpec &)options
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject {
  PolygonOptionsSpec optionsCopy(options);
  if (_viewController) {
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

      UIColor *fillColor = nil;
      auto fillColorOpt = optionsCopy.fillColor();
      if (fillColorOpt.has_value()) {
        fillColor = [UIColor colorWithColorInt:@(fillColorOpt.value())];
      }

      UIColor *strokeColor = nil;
      auto strokeColorOpt = optionsCopy.strokeColor();
      if (strokeColorOpt.has_value()) {
        strokeColor = [UIColor colorWithColorInt:@(strokeColorOpt.value())];
      }

      GMSPolygon *polygon = [ObjectTranslationUtil
          createPolygon:path
                  holes:holePaths
              fillColor:fillColor
            strokeColor:strokeColor
            strokeWidth:optionsCopy.strokeWidth().value_or(1.0f)
               geodesic:optionsCopy.geodesic().value_or(NO)
              clickable:optionsCopy.clickable().value_or(YES)
                 zIndex:optionsCopy.zIndex().has_value() ? @(optionsCopy.zIndex().value()) : nil
             identifier:optionsCopy.id_()];

      [self->_viewController addPolygon:polygon
                                visible:optionsCopy.visible().value_or(YES)
                                 result:^(NSDictionary *result) {
                                   resolve(result);
                                 }];
    });
  } else {
    reject(@"NO_VIEW_CONTROLLER", @"No view controller found", nil);
  }
}

- (void)addGroundOverlay:(GroundOverlayOptionsSpec &)options
                 resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject {
  GroundOverlayOptionsSpec optionsCopy(options);
  if (_viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      NSString *imgPath = optionsCopy.imgPath();
      UIImage *icon = (imgPath && [imgPath isKindOfClass:[NSString class]])
                          ? [UIImage imageNamed:imgPath]
                          : nil;

      if (!icon) {
        reject(@"INVALID_IMAGE", @"Failed to load image from the provided path", nil);
        return;
      }

      CGFloat bearing = optionsCopy.bearing().value_or(0.0);
      CGFloat transparency = optionsCopy.transparency().value_or(0.0);
      BOOL clickable = optionsCopy.clickable().value_or(NO);
      BOOL visible = optionsCopy.visible().value_or(YES);
      NSNumber *zIndex = optionsCopy.zIndex().has_value() ? @(optionsCopy.zIndex().value()) : nil;

      // Anchor point (default center: 0.5, 0.5)
      CGFloat anchorU = 0.5;
      CGFloat anchorV = 0.5;
      if (optionsCopy.anchor().has_value()) {
        auto anchor = optionsCopy.anchor().value();
        anchorU = anchor.u();
        anchorV = anchor.v();
      }
      CGPoint anchorPoint = CGPointMake(anchorU, anchorV);

      GMSGroundOverlay *groundOverlay = nil;

      // Check if bounds are provided (bounds-based positioning)
      if (optionsCopy.bounds().has_value()) {
        auto boundsSpec = optionsCopy.bounds().value();
        CLLocationCoordinate2D northEast =
            CLLocationCoordinate2DMake(boundsSpec.northEast().lat(), boundsSpec.northEast().lng());
        CLLocationCoordinate2D southWest =
            CLLocationCoordinate2DMake(boundsSpec.southWest().lat(), boundsSpec.southWest().lng());
        GMSCoordinateBounds *bounds = [[GMSCoordinateBounds alloc] initWithCoordinate:northEast
                                                                           coordinate:southWest];

        groundOverlay = [ObjectTranslationUtil createGroundOverlayWithBounds:bounds
                                                                        icon:icon
                                                                     bearing:bearing
                                                                transparency:transparency
                                                                      anchor:anchorPoint
                                                                   clickable:clickable
                                                                      zIndex:zIndex
                                                                  identifier:optionsCopy.id_()];
      } else if (optionsCopy.location().has_value()) {
        // Position-based positioning (requires zoomLevel on iOS)
        auto location = optionsCopy.location().value();
        CLLocationCoordinate2D position =
            CLLocationCoordinate2DMake(location.lat(), location.lng());
        CGFloat zoomLevel = optionsCopy.zoomLevel().value_or(10.0);

        groundOverlay = [ObjectTranslationUtil createGroundOverlayWithPosition:position
                                                                          icon:icon
                                                                     zoomLevel:zoomLevel
                                                                       bearing:bearing
                                                                  transparency:transparency
                                                                        anchor:anchorPoint
                                                                     clickable:clickable
                                                                        zIndex:zIndex
                                                                    identifier:optionsCopy.id_()];
      } else {
        reject(@"INVALID_OPTIONS",
               @"Either location (with zoomlevel) or bounds must be provided for ground overlay",
               nil);
        return;
      }

      [self->_viewController addGroundOverlay:groundOverlay
                                      visible:visible
                                       result:^(NSDictionary *result) {
                                         resolve(result);
                                       }];
    });
  } else {
    reject(@"NO_VIEW_CONTROLLER", @"No view controller found", nil);
  }
}

- (void)moveCamera:(CameraPositionSpec &)cameraPosition
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject {
  CameraPositionSpec positionCopy(cameraPosition);
  if (_viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      GMSMutableCameraPosition *position = [[GMSMutableCameraPosition alloc] init];

      if (positionCopy.target().has_value()) {
        auto target = positionCopy.target().value();
        position.target = CLLocationCoordinate2DMake(target.lat(), target.lng());
      }

      if (positionCopy.zoom().has_value()) {
        position.zoom = positionCopy.zoom().value();
      }

      if (positionCopy.bearing().has_value()) {
        position.bearing = positionCopy.bearing().value();
      }

      if (positionCopy.tilt().has_value()) {
        position.viewingAngle = positionCopy.tilt().value();
      }

      [self->_viewController moveCamera:position];
      resolve(nil);
    });
  } else {
    reject(@"NO_VIEW_CONTROLLER", @"No view controller found", nil);
  }
}

- (void)removeMarker:(NSString *)id
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_viewController) {
      [self->_viewController removeMarker:id];
      resolve(@YES);
    } else {
      reject(@"NO_VIEW_CONTROLLER", @"No view controller found", nil);
    }
  });
}

- (void)removePolygon:(NSString *)id
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_viewController) {
      [self->_viewController removePolygon:id];
      resolve(@YES);
    } else {
      reject(@"NO_VIEW_CONTROLLER", @"No view controller found", nil);
    }
  });
}

- (void)removePolyline:(NSString *)id
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_viewController) {
      [self->_viewController removePolyline:id];
      resolve(@YES);
    } else {
      reject(@"NO_VIEW_CONTROLLER", @"No view controller found", nil);
    }
  });
}

- (void)removeCircle:(NSString *)id
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_viewController) {
      [self->_viewController removeCircle:id];
      resolve(@YES);
    } else {
      reject(@"NO_VIEW_CONTROLLER", @"No view controller found", nil);
    }
  });
}

- (void)removeGroundOverlay:(NSString *)id
                    resolve:(RCTPromiseResolveBlock)resolve
                     reject:(RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    reject(@"not_implemented", @"Ground overlay is not implemented yet", nil);
  });
}

- (void)setIndoorEnabled:(BOOL)enabled {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_viewController) {
      [self->_viewController setIndoorEnabled:enabled];
    }
  });
}

- (void)setTrafficEnabled:(BOOL)enabled {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_viewController) {
      [self->_viewController setTrafficEnabled:enabled];
    }
  });
}

- (void)setCompassEnabled:(BOOL)enabled {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_viewController) {
      [self->_viewController setCompassEnabled:enabled];
    }
  });
}

- (void)setMyLocationEnabled:(BOOL)enabled {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_viewController) {
      [self->_viewController setMyLocationEnabled:enabled];
    }
  });
}

- (void)setMyLocationButtonEnabled:(BOOL)enabled {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_viewController) {
      [self->_viewController setMyLocationButtonEnabled:enabled];
    }
  });
}

- (void)setMapColorScheme:(NSInteger)colorScheme {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_viewController) {
      [self->_viewController setColorScheme:@(colorScheme)];
    }
  });
}

- (void)setNightMode:(NSInteger)nightMode {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_viewController) {
      [self->_viewController setNightMode:@(nightMode)];
    }
  });
}

- (void)setFollowingPerspective:(NSInteger)perspective {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_viewController) {
      [self->_viewController setFollowingPerspective:[NSNumber numberWithInteger:perspective]];
    }
  });
}

- (void)sendCustomMessage:(NSString *)type data:(nullable NSString *)data {
  dispatch_async(dispatch_get_main_queue(), ^{
    NSDictionary *parsedData = nil;
    if (data != nil && ![data isEqual:[NSNull null]]) {
      NSError *error = nil;
      NSData *jsonData = [data dataUsingEncoding:NSUTF8StringEncoding];
      parsedData = [NSJSONSerialization JSONObjectWithData:jsonData options:0 error:&error];
      if (error) {
        NSLog(@"NavAutoModule: Error parsing custom message data: %@", error);
      }
    }

    // Call the delegate's handler method if registered
    if (self.carSceneDelegate) {
      [self.carSceneDelegate onCustomMessageReceived:type data:parsedData];
    }
  });
}

- (void)setZoomLevel:(double)zoomLevel
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_viewController) {
      [self->_viewController setZoomLevel:[NSNumber numberWithDouble:zoomLevel]];
      resolve(@YES);
    } else {
      reject(@"NO_VIEW_CONTROLLER", @"No view controller found", nil);
    }
  });
}

- (void)setBuildingsEnabled:(BOOL)enabled {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_viewController) {
      [self->_viewController setBuildingsEnabled:enabled];
    }
  });
}

- (void)getCameraPosition:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_viewController) {
      [self->_viewController getCameraPosition:^(NSDictionary *result) {
        resolve(result);
      }];
    } else {
      reject(@"NO_VIEW_CONTROLLER", @"No view controller found", nil);
    }
  });
}

- (void)getMyLocation:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_viewController) {
      [self->_viewController getMyLocation:^(NSDictionary *_Nullable result) {
        resolve(result);
      }];
    } else {
      reject(@"NO_VIEW_CONTROLLER", @"No view controller found", nil);
    }
  });
}

- (void)getUiSettings:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_viewController) {
      [self->_viewController getUiSettings:^(NSDictionary *_Nullable result) {
        resolve(result);
      }];
    } else {
      reject(@"NO_VIEW_CONTROLLER", @"No view controller found", nil);
    }
  });
}

- (void)isMyLocationEnabled:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_viewController) {
      [self->_viewController isMyLocationEnabled:^(BOOL result) {
        resolve([NSNumber numberWithBool:result]);
      }];
    } else {
      reject(@"NO_VIEW_CONTROLLER", @"No view controller found", nil);
    }
  });
}

- (void)isAutoScreenAvailable:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    BOOL hasViewController = self->_viewController != nil;
    resolve([NSNumber numberWithBool:hasViewController]);
  });
}

- (void)setMapPadding:(double)top left:(double)left bottom:(double)bottom right:(double)right {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_viewController) {
      [self->_viewController setPadding:UIEdgeInsetsMake(top, left, bottom, right)];
    }
  });
}

- (void)getMarkers:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_viewController) {
      resolve([self->_viewController getMarkers]);
    } else {
      reject(@"NO_VIEW_CONTROLLER", @"No view controller found", nil);
    }
  });
}

- (void)getCircles:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_viewController) {
      resolve([self->_viewController getCircles]);
    } else {
      reject(@"NO_VIEW_CONTROLLER", @"No view controller found", nil);
    }
  });
}

- (void)getPolylines:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_viewController) {
      resolve([self->_viewController getPolylines]);
    } else {
      reject(@"NO_VIEW_CONTROLLER", @"No view controller found", nil);
    }
  });
}

- (void)getPolygons:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_viewController) {
      resolve([self->_viewController getPolygons]);
    } else {
      reject(@"NO_VIEW_CONTROLLER", @"No view controller found", nil);
    }
  });
}

- (void)getGroundOverlays:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_viewController) {
      resolve([self->_viewController getGroundOverlays]);
    } else {
      reject(@"NO_VIEW_CONTROLLER", @"No view controller found", nil);
    }
  });
}

- (void)onScreenStateChange:(BOOL)available {
  // Check if the event emitter callback is set before emitting events.
  // This prevents crashes when CarPlay connects before React Native is ready.
  if (!_eventEmitterCallback) {
    NSLog(@"NavAutoModule: Cannot send screen state - event emitter not ready, storing pending "
          @"state");
    if (available) {
      self.pendingScreenAvailable = YES;
    }
    return;
  }

  self.pendingScreenAvailable = NO;
  [self emitOnAutoScreenAvailabilityChanged:available];
}

- (void)setEventEmitterCallback:(EventEmitterCallbackWrapper *)eventEmitterCallbackWrapper {
  [super setEventEmitterCallback:eventEmitterCallbackWrapper];

  // Send any pending screen availability state now that the emitter is ready
  if (self.pendingScreenAvailable && self.viewController != nil) {
    NSLog(@"NavAutoModule: Event emitter ready, sending pending screen available state");
    self.pendingScreenAvailable = NO;
    [self emitOnAutoScreenAvailabilityChanged:YES];
  }
}

- (void)onCustomNavigationAutoEvent:(NSString *)type data:(nullable NSDictionary *)data {
  // Check if the event emitter callback is set before emitting events.
  if (!_eventEmitterCallback) {
    NSLog(@"NavAutoModule: Cannot send custom event - event emitter not ready");
    return;
  }

  NSMutableDictionary *map = [NSMutableDictionary dictionary];
  [map setObject:type forKey:@"type"];

  if (data != nil) {
    NSError *error;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:data options:0 error:&error];
    if (jsonData && !error) {
      NSString *jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
      [map setObject:jsonString forKey:@"data"];
    } else {
      NSLog(@"NavAutoModule: Failed to serialize custom event data to JSON: %@", error);
      [map setObject:[NSNull null] forKey:@"data"];
    }
  } else {
    [map setObject:[NSNull null] forKey:@"data"];
  }

  [self emitOnCustomNavigationAutoEvent:map];
}

@end
