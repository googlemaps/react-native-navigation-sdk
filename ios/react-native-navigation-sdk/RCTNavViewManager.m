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

#import "RCTNavViewManager.h"
#import <React/RCTUIManager.h>
#import "CustomTypes.h"
#import "NavView.h"
#import "NavViewController.h"
#import "NavViewModule.h"
#import "ObjectTranslationUtil.h"

// RCTNavViewManager is responsible for managing both the regular map fragment as well as the
// navigation map view fragment.
//
@implementation RCTNavViewManager
static NSMutableDictionary<NSNumber *, NavViewController *> *_viewControllers;
static NavViewModule *_navViewModule;

RCT_EXPORT_MODULE();

RCT_EXPORT_VIEW_PROPERTY(onRecenterButtonClick, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onMapReady, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onMapClick, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onMarkerInfoWindowTapped, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onMarkerClick, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onPolylineClick, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onPolygonClick, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onCircleClick, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onGroundOverlayClick, RCTDirectEventBlock);

- (instancetype)init {
  if (self = [super init]) {
    _viewControllers = [NSMutableDictionary new];
    _navViewModule = [NavViewModule allocWithZone:nil];
    _navViewModule.viewControllers = _viewControllers;
  }
  return self;
}

- (UIView *)view {
  return [[NavView alloc] init];
}

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (NavViewController *)getViewControllerForTag:(NSNumber *)reactTag {
  return _viewControllers[reactTag];
}

- (void)registerViewController:(NavViewController *)viewController forTag:(NSNumber *)reactTag {
  @synchronized(_viewControllers) {
    _viewControllers[reactTag] = viewController;
  }
}

- (void)unregisterViewControllerForTag:(NSNumber *)reactTag {
  @synchronized(_viewControllers) {
    [_viewControllers removeObjectForKey:reactTag];
  }
}

RCT_EXPORT_METHOD(createFragment
                  : (nonnull NSNumber *)reactTag stylingOptions
                  : (NSDictionary *)stylingOptions fragmentType
                  : (NSInteger)fragmentType) {
  [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager,
                                      NSDictionary<NSNumber *, UIView *> *viewRegistry) {
    NavView *view = (NavView *)viewRegistry[reactTag];
    if (!view || ![view isKindOfClass:[NavView class]]) {
      RCTLogError(@"Cannot find NativeView with tag #%@", reactTag);
      return;
    }

    NavViewController *viewController =
        [view initializeViewControllerWithStylingOptions:stylingOptions fragmentType:fragmentType];

    [self registerViewController:viewController forTag:reactTag];
  }];
}

RCT_EXPORT_METHOD(deleteFragment : (nonnull NSNumber *)reactTag) {
  [self.bridge.uiManager
      addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        NavView *view = (NavView *)viewRegistry[reactTag];
        if (!view || ![view isKindOfClass:[NavView class]]) {
          RCTLogError(@"Cannot find NativeView with tag #%@", reactTag);
          return;
        }

        NavViewController *viewController = [self getViewControllerForTag:reactTag];
        if (viewController) {
          [view removeReactSubview:viewController.view];
          [self unregisterViewControllerForTag:reactTag];
        }
      }];
}

RCT_EXPORT_METHOD(moveCamera
                  : (nonnull NSNumber *)reactTag cameraPosition
                  : (NSDictionary *)cameraPosition) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    [viewController moveCamera:cameraPosition];
  });
}

RCT_EXPORT_METHOD(setTripProgressBarEnabled
                  : (nonnull NSNumber *)reactTag isEnabled
                  : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    [viewController setTripProgressBarEnabled:isEnabled];
  });
}

RCT_EXPORT_METHOD(setNavigationUIEnabled
                  : (nonnull NSNumber *)reactTag isEnabled
                  : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    [viewController setNavigationUIEnabled:isEnabled];
  });
}

RCT_EXPORT_METHOD(setFollowingPerspective
                  : (nonnull NSNumber *)reactTag index
                  : (nonnull NSNumber *)index) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    [viewController setFollowingPerspective:index];
  });
}

RCT_EXPORT_METHOD(setNightMode : (nonnull NSNumber *)reactTag index : (nonnull NSNumber *)index) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    [viewController setNightMode:index];
  });
}

RCT_EXPORT_METHOD(setSpeedometerEnabled
                  : (nonnull NSNumber *)reactTag isEnabled
                  : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    [viewController setSpeedometerEnabled:isEnabled];
  });
}

RCT_EXPORT_METHOD(setSpeedLimitIconEnabled
                  : (nonnull NSNumber *)reactTag isEnabled
                  : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    [viewController setSpeedLimitIconEnabled:isEnabled];
  });
}

RCT_EXPORT_METHOD(setRecenterButtonEnabled
                  : (nonnull NSNumber *)reactTag isEnabled
                  : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    [viewController setRecenterButtonEnabled:isEnabled];
  });
}

RCT_EXPORT_METHOD(setZoomLevel : (nonnull NSNumber *)reactTag level : (nonnull NSNumber *)level) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    [viewController setZoomLevel:level];
  });
}

RCT_EXPORT_METHOD(removeMarker : (nonnull NSNumber *)reactTag params : (NSString *)markerId) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    [viewController removeMarker:markerId];
  });
}

RCT_EXPORT_METHOD(removePolyline : (nonnull NSNumber *)reactTag params : (NSString *)polylineId) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    [viewController removePolyline:polylineId];
  });
}

RCT_EXPORT_METHOD(removePolygon : (nonnull NSNumber *)reactTag params : (NSString *)polygonId) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    [viewController removePolygon:polygonId];
  });
}

RCT_EXPORT_METHOD(removeCircle : (nonnull NSNumber *)reactTag params : (NSString *)circleId) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    [viewController removeCircle:circleId];
  });
}

RCT_EXPORT_METHOD(removeGroundOverlay
                  : (nonnull NSNumber *)reactTag params
                  : (NSString *)overlayId) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    [viewController removeGroundOverlay:overlayId];
  });
}

RCT_EXPORT_METHOD(showRouteOverview : (nonnull NSNumber *)reactTag) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    [viewController showRouteOverview];
  });
}

// MAPS SDK
RCT_EXPORT_METHOD(setIndoorEnabled : (nonnull NSNumber *)reactTag isEnabled : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    [viewController setIndoorEnabled:isEnabled];
  });
}

RCT_EXPORT_METHOD(setTrafficEnabled : (nonnull NSNumber *)reactTag isEnabled : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    [viewController setTrafficEnabled:isEnabled];
  });
}

RCT_EXPORT_METHOD(setCompassEnabled : (nonnull NSNumber *)reactTag isEnabled : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    [viewController setCompassEnabled:isEnabled];
  });
}

RCT_EXPORT_METHOD(setMyLocationButtonEnabled
                  : (nonnull NSNumber *)reactTag isEnabled
                  : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    [viewController setMyLocationButtonEnabled:isEnabled];
  });
}

RCT_EXPORT_METHOD(setMyLocationEnabled : (nonnull NSNumber *)reactTag isEnabled : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    [viewController setMyLocationEnabled:isEnabled];
  });
}

RCT_EXPORT_METHOD(setRotateGesturesEnabled
                  : (nonnull NSNumber *)reactTag isEnabled
                  : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    [viewController setRotateGesturesEnabled:isEnabled];
  });
}

RCT_EXPORT_METHOD(setScrollGesturesEnabled
                  : (nonnull NSNumber *)reactTag isEnabled
                  : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    [viewController setScrollGesturesEnabled:isEnabled];
  });
}

RCT_EXPORT_METHOD(setScrollGesturesEnabledDuringRotateOrZoom
                  : (nonnull NSNumber *)reactTag isEnabled
                  : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    [viewController setScrollGesturesEnabledDuringRotateOrZoom:isEnabled];
  });
}

RCT_EXPORT_METHOD(setTiltGesturesEnabled
                  : (nonnull NSNumber *)reactTag isEnabled
                  : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    [viewController setTiltGesturesEnabled:isEnabled];
  });
}

RCT_EXPORT_METHOD(setZoomGesturesEnabled
                  : (nonnull NSNumber *)reactTag isEnabled
                  : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    [viewController setZoomGesturesEnabled:isEnabled];
  });
}

RCT_EXPORT_METHOD(setBuildingsEnabled : (nonnull NSNumber *)reactTag isEnabled : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    [viewController setBuildingsEnabled:isEnabled];
  });
}

RCT_EXPORT_METHOD(setTrafficIncidentCardsEnabled
                  : (nonnull NSNumber *)reactTag isEnabled
                  : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    [viewController setTrafficIncidentCardsEnabled:isEnabled];
  });
}

RCT_EXPORT_METHOD(setHeaderEnabled : (nonnull NSNumber *)reactTag isEnabled : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    [viewController setHeaderEnabled:isEnabled];
  });
}

RCT_EXPORT_METHOD(setFooterEnabled : (nonnull NSNumber *)reactTag isEnabled : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    [viewController setFooterEnabled:isEnabled];
  });
}

RCT_EXPORT_METHOD(resetMinMaxZoomLevel : (nonnull NSNumber *)reactTag) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    [viewController resetMinMaxZoomLevel];
  });
}

RCT_EXPORT_METHOD(animateCamera
                  : (nonnull NSNumber *)reactTag latitude
                  : (nonnull NSNumber *)latitude longitude
                  : (nonnull NSNumber *)longitude) {
  dispatch_async(dispatch_get_main_queue(), ^{
    GMSCameraPosition *cameraPosition =
        [GMSCameraPosition cameraWithLatitude:[latitude doubleValue]
                                    longitude:[longitude doubleValue]
                                         zoom:10];
    GMSCameraUpdate *update = [GMSCameraUpdate setCamera:cameraPosition];
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    [viewController animateCamera:update];
  });
}

RCT_EXPORT_METHOD(setMapStyle
                  : (nonnull NSNumber *)reactTag jsonStyleString
                  : (NSString *)jsonStyleString debugCallback
                  : (RCTResponseSenderBlock)debugCallback) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NSError *error;
    GMSMapStyle *mapStyle = [GMSMapStyle styleWithJSONString:jsonStyleString error:&error];

    if (!mapStyle) {
      // Send error message through debugCallback instead of logging it
      debugCallback(@[ [NSString
          stringWithFormat:@"One or more of the map styles failed to load. Error: %@", error] ]);
      return;
    }

    NavViewController *viewController = [self getViewControllerForTag:reactTag];

    if (!viewController) {
      debugCallback(@[ @"ViewController is null" ]);
      return;
    }

    [viewController setMapStyle:mapStyle];
    debugCallback(@[ @"Map style set successfully" ]);
  });
}

RCT_EXPORT_METHOD(setMapType : (nonnull NSNumber *)reactTag mapType : (NSInteger)mapType) {
  dispatch_async(dispatch_get_main_queue(), ^{
    GMSMapViewType mapViewType;
    switch (mapType) {
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

    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    [viewController setMapType:mapViewType];
  });
}

RCT_EXPORT_METHOD(clearMapView : (nonnull NSNumber *)reactTag) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    [viewController clearMapView];
  });
}

RCT_EXPORT_METHOD(setPadding
                  : (nonnull NSNumber *)reactTag top
                  : (nonnull NSNumber *)top left
                  : (nonnull NSNumber *)left bottom
                  : (nonnull NSNumber *)bottom right
                  : (nonnull NSNumber *)right) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    [viewController setPadding:UIEdgeInsetsMake(top.floatValue, left.floatValue, bottom.floatValue,
                                                right.floatValue)];
  });
}

@end
