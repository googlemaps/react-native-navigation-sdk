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
#import "ObjectTranslationUtil.h"

using namespace JS::NativeNavViewModule;

// Static registry for viewControllers (string-based nativeID)
static NSMutableDictionary<NSString *, NavViewController *> *NavViewControllersRegistry() {
  static NSMutableDictionary<NSString *, NavViewController *> *dict = nil;
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

+ (NSMutableDictionary<NSString *, NavViewController *> *)viewControllersRegistry {
  return NavViewControllersRegistry();
}

// Method to get the shared instance
+ (instancetype)sharedInstance {
  return sharedInstance;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeNavViewModuleSpecJSI>(params);
}

- (NavViewController *)getViewControllerForNativeID:(NSString *)nativeID {
  NavViewController *viewController = [NavViewModule viewControllersRegistry][nativeID];
  return viewController;
}

- (void)notifyNavigationSessionReady {
  // Notify all views that navigation session is ready
  for (NavViewController *viewController in [NavViewModule viewControllersRegistry].allValues) {
    [viewController onNavigationSessionReady];
  }
}

- (void)navigationSessionDestroyed {
  for (NavViewController *viewController in [NavViewModule viewControllersRegistry].allValues) {
    [viewController detachFromNavigationSession];
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

// TurboModule method implementations

- (void)addCircle:(NSString *)nativeID
          options:(CircleOptionsSpec &)options
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject {
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  CircleOptionsSpec optionsCopy(options);
  if (viewController) {
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

      [viewController addCircle:circle
                        visible:optionsCopy.visible().value_or(YES)
                         result:^(NSDictionary *result) {
                           resolve(result);
                         }];
    });
  } else {
    reject(@"NO_VIEW_CONTROLLER", @"No view controller found for the specified nativeID", nil);
  }
}

- (void)addMarker:(NSString *)nativeID
          options:(MarkerOptionsSpec &)options
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject {
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  MarkerOptionsSpec optionsCopy(options);
  if (viewController) {
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

      [viewController addMarker:marker
                        visible:optionsCopy.visible().value_or(YES)
                         result:^(NSDictionary *result) {
                           resolve(result);
                         }];
    });
  } else {
    reject(@"NO_VIEW_CONTROLLER", @"No view controller found for the specified nativeID", nil);
  }
}

- (void)addPolyline:(NSString *)nativeID
            options:(PolylineOptionsSpec &)options
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject {
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  PolylineOptionsSpec optionsCopy(options);
  if (viewController) {
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

      [viewController addPolyline:polyline
                          visible:optionsCopy.visible().value_or(YES)
                           result:^(NSDictionary *result) {
                             resolve(result);
                           }];
    });
  } else {
    reject(@"NO_VIEW_CONTROLLER", @"No view controller found for the specified nativeID", nil);
  }
}

- (void)addPolygon:(NSString *)nativeID
           options:(PolygonOptionsSpec &)options
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject {
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

      [viewController addPolygon:polygon
                         visible:optionsCopy.visible().value_or(YES)
                          result:^(NSDictionary *result) {
                            resolve(result);
                          }];
    });
  } else {
    reject(@"NO_VIEW_CONTROLLER", @"No view controller found for the specified nativeID", nil);
  }
}

- (void)addGroundOverlay:(NSString *)nativeID
                 options:(GroundOverlayOptionsSpec &)options
                 resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject {
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  GroundOverlayOptionsSpec optionsCopy(options);
  if (viewController) {
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
               @"Either location (with width) or bounds must be provided for ground overlay", nil);
        return;
      }

      [viewController addGroundOverlay:groundOverlay
                               visible:visible
                                result:^(NSDictionary *result) {
                                  resolve(result);
                                }];
    });
  } else {
    reject(@"NO_VIEW_CONTROLLER", @"No view controller found for the specified nativeID", nil);
  }
}

- (void)moveCamera:(NSString *)nativeID
    cameraPosition:(CameraPositionSpec &)cameraPosition
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject {
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  CameraPositionSpec positionCopy(cameraPosition);
  if (viewController) {
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

      [viewController moveCamera:position];
      resolve(@YES);
    });
  } else {
    reject(@"NO_VIEW_CONTROLLER", @"No view controller found for the specified nativeID", nil);
  }
}

- (void)getCameraPosition:(NSString *)nativeID
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject {
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  if (viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [viewController getCameraPosition:^(NSDictionary *result) {
        resolve(result);
      }];
    });
  } else {
    reject(@"NO_VIEW_CONTROLLER", @"No view controller found for the specified nativeID", nil);
  }
}

- (void)getMyLocation:(NSString *)nativeID
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject {
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  if (viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [viewController getMyLocation:^(NSDictionary *result) {
        resolve(result);
      }];
    });
  } else {
    reject(@"NO_VIEW_CONTROLLER", @"No view controller found for the specified nativeID", nil);
  }
}

- (void)getUiSettings:(NSString *)nativeID
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject {
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  if (viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [viewController getUiSettings:^(NSDictionary *result) {
        resolve(result);
      }];
    });
  } else {
    reject(@"NO_VIEW_CONTROLLER", @"No view controller found for the specified nativeID", nil);
  }
}

- (void)isMyLocationEnabled:(NSString *)nativeID
                    resolve:(RCTPromiseResolveBlock)resolve
                     reject:(RCTPromiseRejectBlock)reject {
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  if (viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [viewController isMyLocationEnabled:^(BOOL result) {
        resolve(@(result));
      }];
    });
  } else {
    reject(@"NO_VIEW_CONTROLLER", @"No view controller found for the specified nativeID", nil);
  }
}

- (void)setNavigationUIEnabled:(NSString *)nativeID
                       enabled:(BOOL)enabled
                       resolve:(RCTPromiseResolveBlock)resolve
                        reject:(RCTPromiseRejectBlock)reject {
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  if (viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [viewController setNavigationUIEnabled:enabled];
      resolve(nil);
    });
  } else {
    reject(@"NO_VIEW_CONTROLLER", @"No view controller found for the specified nativeID", nil);
  }
}

- (void)setFollowingPerspective:(NSString *)nativeID
                    perspective:(double)perspective
                        resolve:(RCTPromiseResolveBlock)resolve
                         reject:(RCTPromiseRejectBlock)reject {
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  if (viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [viewController setFollowingPerspective:@((NSInteger)perspective)];
      resolve(nil);
    });
  } else {
    reject(@"NO_VIEW_CONTROLLER", @"No view controller found for the specified nativeID", nil);
  }
}

- (void)showRouteOverview:(NSString *)nativeID
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject {
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  if (viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [viewController showRouteOverview];
      resolve(@YES);
    });
  } else {
    reject(@"NO_VIEW_CONTROLLER", @"No view controller found for the specified nativeID", nil);
  }
}

- (void)clearMapView:(NSString *)nativeID
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject {
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  if (viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [viewController clearMapView];
      resolve(@YES);
    });
  } else {
    reject(@"NO_VIEW_CONTROLLER", @"No view controller found for the specified nativeID", nil);
  }
}

- (void)removeMarker:(NSString *)nativeID
                  id:(NSString *)id
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject {
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  if (viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [viewController removeMarker:id];
      resolve(@YES);
    });
  } else {
    reject(@"NO_VIEW_CONTROLLER", @"No view controller found for the specified nativeID", nil);
  }
}

- (void)removePolyline:(NSString *)nativeID
                    id:(NSString *)id
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject {
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  if (viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [viewController removePolyline:id];
      resolve(@YES);
    });
  } else {
    reject(@"NO_VIEW_CONTROLLER", @"No view controller found for the specified nativeID", nil);
  }
}

- (void)removePolygon:(NSString *)nativeID
                   id:(NSString *)id
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject {
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  if (viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [viewController removePolygon:id];
      resolve(@YES);
    });
  } else {
    reject(@"NO_VIEW_CONTROLLER", @"No view controller found for the specified nativeID", nil);
  }
}

- (void)removeCircle:(NSString *)nativeID
                  id:(NSString *)id
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject {
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  if (viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [viewController removeCircle:id];
      resolve(@YES);
    });
  } else {
    reject(@"NO_VIEW_CONTROLLER", @"No view controller found for the specified nativeID", nil);
  }
}

- (void)removeGroundOverlay:(NSString *)nativeID
                         id:(NSString *)id
                    resolve:(RCTPromiseResolveBlock)resolve
                     reject:(RCTPromiseRejectBlock)reject {
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  if (viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [viewController removeGroundOverlay:id];
      resolve(@YES);
    });
  } else {
    reject(@"NO_VIEW_CONTROLLER", @"No view controller found for the specified nativeID", nil);
  }
}

- (void)setZoomLevel:(NSString *)nativeID
               level:(double)level
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject {
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  if (viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [viewController setZoomLevel:@(level)];
      resolve(@YES);
    });
  } else {
    reject(@"NO_VIEW_CONTROLLER", @"No view controller found for the specified nativeID", nil);
  }
}

- (void)getMarkers:(NSString *)nativeID
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject {
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  if (viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      resolve([viewController getMarkers]);
    });
  } else {
    reject(@"NO_VIEW_CONTROLLER", @"No view controller found for the specified nativeID", nil);
  }
}

- (void)getCircles:(NSString *)nativeID
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject {
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  if (viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      resolve([viewController getCircles]);
    });
  } else {
    reject(@"NO_VIEW_CONTROLLER", @"No view controller found for the specified nativeID", nil);
  }
}

- (void)getPolylines:(NSString *)nativeID
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject {
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  if (viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      resolve([viewController getPolylines]);
    });
  } else {
    reject(@"NO_VIEW_CONTROLLER", @"No view controller found for the specified nativeID", nil);
  }
}

- (void)getPolygons:(NSString *)nativeID
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject {
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  if (viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      resolve([viewController getPolygons]);
    });
  } else {
    reject(@"NO_VIEW_CONTROLLER", @"No view controller found for the specified nativeID", nil);
  }
}

- (void)getGroundOverlays:(NSString *)nativeID
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject {
  NavViewController *viewController = [self getViewControllerForNativeID:nativeID];
  if (viewController) {
    dispatch_async(dispatch_get_main_queue(), ^{
      resolve([viewController getGroundOverlays]);
    });
  } else {
    reject(@"NO_VIEW_CONTROLLER", @"No view controller found for the specified nativeID", nil);
  }
}

@end
