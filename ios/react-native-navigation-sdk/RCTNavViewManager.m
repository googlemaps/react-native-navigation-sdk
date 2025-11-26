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
#import <React/RCTConvert.h>
#import <React/RCTUIManager.h>
#import "CustomTypes.h"
#import "NavView.h"
#import "NavViewController.h"
#import "NavViewModule.h"
#import "ObjectTranslationUtil.h"

// RCTNavViewManager is responsible for managing both the regular map fragment
// as well as the navigation map view fragment.
//
@implementation RCTNavViewManager
static NSMapTable<NSNumber *, NavViewController *> *_viewControllers;
static NavViewModule *_navViewModule;

RCT_EXPORT_MODULE();

- (instancetype)init {
  if (self = [super init]) {
    _viewControllers = [NSMapTable mapTableWithKeyOptions:NSPointerFunctionsStrongMemory
                                             valueOptions:NSPointerFunctionsWeakMemory];
    _navViewModule = [NavViewModule allocWithZone:nil];
    _navViewModule.viewControllers = _viewControllers;
  }
  return self;
}

- (void)dealloc {
  @synchronized(_viewControllers) {
    [_viewControllers removeAllObjects];
  }
}

- (UIView *)view {
  NavView *navView = [[NavView alloc] init];

  __weak typeof(self) weakSelf = self;
  navView.cleanupBlock = ^(NSNumber *reactTag) {
    __strong typeof(weakSelf) strongSelf = weakSelf;
    if (strongSelf && reactTag) {
      [strongSelf unregisterViewControllerForTag:reactTag];
    }
  };

  return navView;
}

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (NavViewController *)getViewControllerForTag:(NSNumber *)reactTag {
  @synchronized(_viewControllers) {
    return [_viewControllers objectForKey:reactTag];
  }
}

- (void)registerViewController:(NavViewController *)viewController forTag:(NSNumber *)reactTag {
  @synchronized(_viewControllers) {
    [_viewControllers setObject:viewController forKey:reactTag];
  }
}

- (void)unregisterViewControllerForTag:(NSNumber *)reactTag {
  @synchronized(_viewControllers) {
    NavViewController *viewController = [_viewControllers objectForKey:reactTag];
    if (viewController) {
      // Explicitly cleanup the view controller to release resources
      dispatch_async(dispatch_get_main_queue(), ^{
        [viewController.view removeFromSuperview];
      });
    }
    [_viewControllers removeObjectForKey:reactTag];
  }
}

RCT_EXPORT_VIEW_PROPERTY(onRecenterButtonClick, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onMapReady, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onMapClick, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onMarkerInfoWindowTapped, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onMarkerClick, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onPolylineClick, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onPolygonClick, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onCircleClick, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onGroundOverlayClick, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onPromptVisibilityChanged, RCTDirectEventBlock);

RCT_CUSTOM_VIEW_PROPERTY(mapOptions, NSDictionary *, NavView) {
  if (json && json != (id)kCFNull) {
    NSDictionary *mapOptions = [RCTConvert NSDictionary:json];

    // Extract all properties and pass them to initialization method
    id mapIdValue = mapOptions[@"mapId"];
    NSString *mapId = [mapIdValue isKindOfClass:[NSNull class]] ? nil : mapIdValue;
    id stylingValue = mapOptions[@"navigationStylingOptions"];
    NSDictionary *stylingOptions =
        [stylingValue isKindOfClass:[NSNull class]] ? nil : (NSDictionary *)stylingValue;
    NSNumber *mapViewTypeNumber = mapOptions[@"mapViewType"];
    id colorSchemeValue = mapOptions[@"mapColorScheme"];
    NSNumber *mapColorScheme =
        [colorSchemeValue isKindOfClass:[NSNull class]] ? nil : colorSchemeValue;
    id nightModeValue = mapOptions[@"navigationNightMode"];
    NSNumber *nightMode = [nightModeValue isKindOfClass:[NSNull class]] ? nil : nightModeValue;

    NavViewController *existingViewController = [view getViewController];
    if (existingViewController) {
      [view applyStylingOptions:stylingOptions];
      [view applyMapColorScheme:mapColorScheme];
      [view applyNightMode:nightMode];
    } else if (mapViewTypeNumber) {
      MapViewType mapViewType = (MapViewType)[mapViewTypeNumber integerValue];
      NavViewController *viewController =
          [view initializeViewControllerWithMapViewType:mapViewType
                                                  mapId:mapId
                                         stylingOptions:stylingOptions
                                         mapColorScheme:mapColorScheme
                                              nightMode:nightMode];
      [self registerViewController:viewController forTag:view.reactTag];
    }
  }
}

RCT_EXPORT_METHOD(moveCamera
                  : (nonnull NSNumber *)reactTag cameraPosition
                  : (NSDictionary *)cameraPosition) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController moveCamera:cameraPosition];
    }
  });
}

RCT_EXPORT_METHOD(setTripProgressBarEnabled
                  : (nonnull NSNumber *)reactTag isEnabled
                  : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController setTripProgressBarEnabled:isEnabled];
    }
  });
}

RCT_EXPORT_METHOD(setReportIncidentButtonEnabled
                  : (nonnull NSNumber *)reactTag isEnabled
                  : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController setReportIncidentButtonEnabled:isEnabled];
    }
  });
}

RCT_EXPORT_METHOD(setNavigationUIEnabled
                  : (nonnull NSNumber *)reactTag isEnabled
                  : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController setNavigationUIEnabled:isEnabled];
    }
  });
}

RCT_EXPORT_METHOD(setFollowingPerspective
                  : (nonnull NSNumber *)reactTag index
                  : (nonnull NSNumber *)index) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController setFollowingPerspective:index];
    }
  });
}

RCT_EXPORT_METHOD(setNightMode : (nonnull NSNumber *)reactTag index : (nonnull NSNumber *)index) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController setNightMode:index];
    }
  });
}

RCT_EXPORT_METHOD(setSpeedometerEnabled
                  : (nonnull NSNumber *)reactTag isEnabled
                  : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController setSpeedometerEnabled:isEnabled];
    }
  });
}

RCT_EXPORT_METHOD(setSpeedLimitIconEnabled
                  : (nonnull NSNumber *)reactTag isEnabled
                  : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController setSpeedLimitIconEnabled:isEnabled];
    }
  });
}

RCT_EXPORT_METHOD(setRecenterButtonEnabled
                  : (nonnull NSNumber *)reactTag isEnabled
                  : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController setRecenterButtonEnabled:isEnabled];
    }
  });
}

RCT_EXPORT_METHOD(setZoomLevel : (nonnull NSNumber *)reactTag level : (nonnull NSNumber *)level) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController setZoomLevel:level];
    }
  });
}

RCT_EXPORT_METHOD(removeMarker : (nonnull NSNumber *)reactTag params : (NSString *)markerId) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController removeMarker:markerId];
    }
  });
}

RCT_EXPORT_METHOD(removePolyline : (nonnull NSNumber *)reactTag params : (NSString *)polylineId) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController removePolyline:polylineId];
    }
  });
}

RCT_EXPORT_METHOD(removePolygon : (nonnull NSNumber *)reactTag params : (NSString *)polygonId) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController removePolygon:polygonId];
    }
  });
}

RCT_EXPORT_METHOD(removeCircle : (nonnull NSNumber *)reactTag params : (NSString *)circleId) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController removeCircle:circleId];
    }
  });
}

RCT_EXPORT_METHOD(removeGroundOverlay
                  : (nonnull NSNumber *)reactTag params
                  : (NSString *)overlayId) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController removeGroundOverlay:overlayId];
    }
  });
}

RCT_EXPORT_METHOD(showRouteOverview : (nonnull NSNumber *)reactTag) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController showRouteOverview];
    }
  });
}

// MAPS SDK
RCT_EXPORT_METHOD(setIndoorEnabled : (nonnull NSNumber *)reactTag isEnabled : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController setIndoorEnabled:isEnabled];
    }
  });
}

RCT_EXPORT_METHOD(setTrafficEnabled : (nonnull NSNumber *)reactTag isEnabled : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController setTrafficEnabled:isEnabled];
    }
  });
}

RCT_EXPORT_METHOD(setCompassEnabled : (nonnull NSNumber *)reactTag isEnabled : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController setCompassEnabled:isEnabled];
    }
  });
}

RCT_EXPORT_METHOD(setMyLocationButtonEnabled
                  : (nonnull NSNumber *)reactTag isEnabled
                  : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController setMyLocationButtonEnabled:isEnabled];
    }
  });
}

RCT_EXPORT_METHOD(setMyLocationEnabled : (nonnull NSNumber *)reactTag isEnabled : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController setMyLocationEnabled:isEnabled];
    }
  });
}

RCT_EXPORT_METHOD(setRotateGesturesEnabled
                  : (nonnull NSNumber *)reactTag isEnabled
                  : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController setRotateGesturesEnabled:isEnabled];
    }
  });
}

RCT_EXPORT_METHOD(setScrollGesturesEnabled
                  : (nonnull NSNumber *)reactTag isEnabled
                  : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController setScrollGesturesEnabled:isEnabled];
    }
  });
}

RCT_EXPORT_METHOD(setScrollGesturesEnabledDuringRotateOrZoom
                  : (nonnull NSNumber *)reactTag isEnabled
                  : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController setScrollGesturesEnabledDuringRotateOrZoom:isEnabled];
    }
  });
}

RCT_EXPORT_METHOD(setTiltGesturesEnabled
                  : (nonnull NSNumber *)reactTag isEnabled
                  : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController setTiltGesturesEnabled:isEnabled];
    }
  });
}

RCT_EXPORT_METHOD(setZoomGesturesEnabled
                  : (nonnull NSNumber *)reactTag isEnabled
                  : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController setZoomGesturesEnabled:isEnabled];
    }
  });
}

RCT_EXPORT_METHOD(setBuildingsEnabled : (nonnull NSNumber *)reactTag isEnabled : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController setBuildingsEnabled:isEnabled];
    }
  });
}

RCT_EXPORT_METHOD(setTrafficIncidentCardsEnabled
                  : (nonnull NSNumber *)reactTag isEnabled
                  : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController setTrafficIncidentCardsEnabled:isEnabled];
    }
  });
}

RCT_EXPORT_METHOD(setHeaderEnabled : (nonnull NSNumber *)reactTag isEnabled : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController setHeaderEnabled:isEnabled];
    }
  });
}

RCT_EXPORT_METHOD(setFooterEnabled : (nonnull NSNumber *)reactTag isEnabled : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController setFooterEnabled:isEnabled];
    }
  });
}

RCT_EXPORT_METHOD(resetMinMaxZoomLevel : (nonnull NSNumber *)reactTag) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController resetMinMaxZoomLevel];
    }
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
    if (viewController) {
      [viewController animateCamera:update];
    }
  });
}

RCT_EXPORT_METHOD(setMapStyle
                  : (nonnull NSNumber *)reactTag jsonStyleString
                  : (NSString *)jsonStyleString) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NSError *error;
    GMSMapStyle *mapStyle = [GMSMapStyle styleWithJSONString:jsonStyleString error:&error];

    NavViewController *viewController = [self getViewControllerForTag:reactTag];

    if (viewController) {
      [viewController setMapStyle:mapStyle];
    }
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
    if (viewController) {
      [viewController setMapType:mapViewType];
    }
  });
}

RCT_EXPORT_METHOD(clearMapView : (nonnull NSNumber *)reactTag) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NavViewController *viewController = [self getViewControllerForTag:reactTag];
    if (viewController) {
      [viewController clearMapView];
    }
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
    if (viewController) {
      [viewController setPadding:UIEdgeInsetsMake(top.floatValue, left.floatValue,
                                                  bottom.floatValue, right.floatValue)];
    }
  });
}
@end
