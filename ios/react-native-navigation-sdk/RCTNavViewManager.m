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
#import "CustomEventDispatcher.h"
#import "NavViewController.h"
#import "NavViewModule.h"
#import "ObjectTranslationUtil.h"

@implementation RCTNavViewManager
NavViewController *viewController;
CustomEventDispatcher *_eventDispatcher;
NavViewModule *_navViewModule;
NSDictionary *_stylingOptions = NULL;

RCT_EXPORT_MODULE();

- (instancetype)init {
  if (self = [super init]) {
  }
  return self;
}

- (UIView *)view {
  return [[UIView alloc] init];
}

+ (BOOL)requiresMainQueueSetup {
  return NO;
}


RCT_EXPORT_METHOD(createFragment: (nonnull NSNumber *)reactTag
                  height: (double)height
                  width: (double)width
                  stylingOptions: (NSDictionary *)stylingOptions
                  tosOptions: (NSDictionary *) tosOptions){
  [self.bridge.uiManager
      addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        UIView *view = viewRegistry[reactTag];
        if (!view || ![view isKindOfClass:[UIView class]]) {
          RCTLogError(@"Cannot find NativeView with tag #%@", reactTag);
          return;
        }

        viewController = [[NavViewController alloc] initWithSize:height width:width];

        [viewController setNavigationCallbacks:self];
        [viewController setTosParams: tosOptions];
        if (stylingOptions != nil && [stylingOptions count] > 0) {
            _stylingOptions = stylingOptions;
        }

        [view addSubview:viewController.view];


        [view setFrame:CGRectMake(0, 0, width, height)];
        _eventDispatcher = [CustomEventDispatcher allocWithZone:nil];
        _navViewModule = [NavViewModule allocWithZone:nil];
        _navViewModule.viewController = viewController;
      }];
}


RCT_EXPORT_METHOD(deleteFragment : (nonnull NSNumber *)reactTag) {
  [self.bridge.uiManager
      addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        UIView *view = viewRegistry[reactTag];
        if (!view || ![view isKindOfClass:[UIView class]]) {
          RCTLogError(@"Cannot find NativeView with tag #%@", reactTag);
          return;
        } 
        [viewController removeNavigationListeners];

        [view removeReactSubview:viewController.view];
      }];
}

RCT_EXPORT_METHOD(setTurnByTurnLoggingEnabled : (nonnull NSNumber *)reactTag isEnabled : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController setTurnByTurnLoggingEnabled:isEnabled];
  });
}

RCT_EXPORT_METHOD(moveCamera : (nonnull NSNumber *)reactTag cameraPosition: (NSDictionary *) cameraPosition) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController moveCamera:cameraPosition];
  });
}

RCT_EXPORT_METHOD(setTripProgressBarEnabled : (nonnull NSNumber *)reactTag isEnabled : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController setTripProgressBarEnabled:isEnabled];
  });
}

RCT_EXPORT_METHOD(setNavigationUIEnabled : (nonnull NSNumber *)reactTag isEnabled : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController setNavigationUIEnabled:isEnabled];
  });
}

RCT_EXPORT_METHOD(setFollowingPerspective
                  : (nonnull NSNumber *)reactTag index
                  : (nonnull NSNumber *)index) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController setFollowingPerspective:index];
  });
}

RCT_EXPORT_METHOD(setNightMode : (nonnull NSNumber *)reactTag index : (nonnull NSNumber *)index) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController setNightMode:index];
  });
}

RCT_EXPORT_METHOD(setAudioGuidanceType : (nonnull NSNumber *)reactTag index : (nonnull NSNumber *)index) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController setAudioGuidanceType:index];
  });
}

RCT_EXPORT_METHOD(setSpeedometerEnabled : (nonnull NSNumber *)reactTag isEnabled : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController setSpeedometerEnabled:isEnabled];
  });
}

RCT_EXPORT_METHOD(setSpeedLimitIconEnabled : (nonnull NSNumber *)reactTag isEnabled : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController setSpeedLimitIconEnabled:isEnabled];
  });
}

RCT_EXPORT_METHOD(setBackgroundLocationUpdatesEnabled : (nonnull NSNumber *)reactTag isEnabled : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController setBackgroundLocationUpdatesEnabled:isEnabled];
  });
}

RCT_EXPORT_METHOD(setRecenterButtonEnabled : (nonnull NSNumber *)reactTag isEnabled : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController setRecenterButtonEnabled:isEnabled];
  });
}

RCT_EXPORT_METHOD(startGuidance : (nonnull NSNumber *)reactTag) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController startGuidance];
  });
}

RCT_EXPORT_METHOD(stopGuidance : (nonnull NSNumber *)reactTag) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController stopGuidance];
  });
}

RCT_EXPORT_METHOD(simulateLocationsAlongExistingRoute : (nonnull NSNumber *)reactTag index : (nonnull NSNumber *)speedMultiplier) {
  dispatch_async(dispatch_get_main_queue(), ^{
      [viewController runSimulation: speedMultiplier];
  });
}

RCT_EXPORT_METHOD(stopLocationSimulation : (nonnull NSNumber *)reactTag) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController stopSimulation];
  });
}

RCT_EXPORT_METHOD(clearDestinations : (nonnull NSNumber *)reactTag) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController clearDestinations];
  });
}

RCT_EXPORT_METHOD(continueToNextDestination : (nonnull NSNumber *)reactTag) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController continueToNextDestination];
  });
}

RCT_EXPORT_METHOD(setZoomLevel : (nonnull NSNumber *)reactTag level : (nonnull NSNumber *)level) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController setZoomLevel:level];
  });
}

RCT_EXPORT_METHOD(setSpeedAlertOptions
                  : (nonnull NSNumber *)reactTag thresholds
                  : (NSDictionary *)thresholds) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController setSpeedAlertOptions:thresholds];
  });
}

RCT_EXPORT_METHOD(simulateLocation
                  : (nonnull NSNumber *)reactTag coordinates
                  : (NSDictionary *)coordinates) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController simulateLocation:coordinates];
  });
}

RCT_EXPORT_METHOD(pauseLocationSimulation
                  : (nonnull NSNumber *)reactTag
) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController pauseSimulation];
  });
}

RCT_EXPORT_METHOD(resumeLocationSimulation
                  : (nonnull NSNumber *)reactTag
) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController resumeSimulation];
  });
}

RCT_EXPORT_METHOD(removeMarker:(nonnull NSNumber *)reactTag params:(NSString *)markerId) {
  dispatch_async(dispatch_get_main_queue(), ^{
      [viewController removeMarker:markerId];
  });
}

RCT_EXPORT_METHOD(removePolyline:(nonnull NSNumber *)reactTag params:(NSString *)polylineId) {
  dispatch_async(dispatch_get_main_queue(), ^{
      [viewController removePolyline:polylineId];
  });
}

RCT_EXPORT_METHOD(removePolygon:(nonnull NSNumber *)reactTag params:(NSString *)polygonId) {
  dispatch_async(dispatch_get_main_queue(), ^{
      [viewController removePolygon:polygonId];
  });
}

RCT_EXPORT_METHOD(removeCircle:(nonnull NSNumber *)reactTag params:(NSString *)circleId) {
  dispatch_async(dispatch_get_main_queue(), ^{
      [viewController removeCircle:circleId];
  });
}

RCT_EXPORT_METHOD(removeGroundOverlay:(nonnull NSNumber *)reactTag params:(NSString *)overlayId) {
  dispatch_async(dispatch_get_main_queue(), ^{
      [viewController removeGroundOverlay:overlayId];
  });
}

RCT_EXPORT_METHOD(setDestinations: (nonnull NSNumber *)reactTag 
                  waypoints: (nonnull NSArray *)waypoints
                  routingOptions: (NSDictionary *)routingOptions) {
  dispatch_async(dispatch_get_main_queue(), ^{
      [viewController setDestinations:waypoints withRoutingOptions: routingOptions];
  });
}

RCT_EXPORT_METHOD(showRouteOverview: (nonnull NSNumber *)reactTag) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController showRouteOverview];
  });
}

- (void)onLocationChanged:(NSDictionary *)mappedLocation {
    [self sendCommandToReactNative:@"onLocationChanged" args: mappedLocation];
}

- (void)onArrival:(NSDictionary *)eventMap {
    [self sendCommandToReactNative:@"onArrival" args:eventMap];
}

- (void)onMapReady {
    [self sendCommandToReactNative:@"onMapReady"];
}

- (void)onNavigationReady {
    [viewController setStylingOptions:_stylingOptions];
        
    [self sendCommandToReactNative:@"onNavigationReady"];
}

- (void)onNavigationInitError:(NSNumber *)errorCode {
  [self sendCommandToReactNative:@"onNavigationInitError" args:errorCode];
}

- (void)onRemainingTimeOrDistanceChanged {
  [self sendCommandToReactNative:@"onRemainingTimeOrDistanceChanged"];
}

- (void)onRouteChanged {
  [self sendCommandToReactNative:@"onRouteChanged"];
}

- (void)onReroutingRequestedByOffRoute {
    [self sendCommandToReactNative:@"onReroutingRequestedByOffRoute"];
}

- (void)onStartGuidance {
  [self sendCommandToReactNative:@"onStartGuidance"];
}

- (void)onRecenterButtonClick {
  [self sendCommandToReactNative:@"mapViewDidTapRecenterButton"];
}

- (void)onRouteStatusResult:(GMSRouteStatus)routeStatus {
    NSString* status = @"";
    switch (routeStatus) {
        case GMSRouteStatusOK:
            status = @"OK";
            break;
        case GMSRouteStatusNetworkError:
            status = @"NETWORK_ERROR";
            break;
        case GMSRouteStatusNoRouteFound:
            status = @"NO_ROUTE_FOUND";
            break;
        case GMSRouteStatusQuotaExceeded:
            status = @"QUOTA_CHECK_FAILED";
            break;
        case GMSRouteStatusCanceled:
            status = @"ROUTE_CANCELED";
            break;
        case GMSRouteStatusLocationUnavailable:
            status = @"LOCATION_DISABLED";
            break;
        case GMSRouteStatusNoWaypointsError:
            status = @"WAYPOINT_ERROR";
            break;
        case GMSRouteStatusWaypointError:
            status = @"WAYPOINT_ERROR";
            break;
        default:
            status = @"";
            break;
    }
    [self sendCommandToReactNative:@"onRouteStatusResult" args:status];
}

- (void)onMarkerInfoWindowTapped:(GMSMarker *)marker {
    [self sendCommandToReactNative:@"onMarkerInfoWindowTapped" args:
      [ObjectTranslationUtil transformMarkerToDictionary: marker]
    ];
}

- (void)onMarkerClick:(GMSMarker *)marker {
    [self sendCommandToReactNative:@"onMarkerClick" args:
    [ObjectTranslationUtil transformMarkerToDictionary: marker]];
}

- (void)onPolylineClick: (GMSPolyline *)polyline {
    [self sendCommandToReactNative:@"onPolylineClick" args:
      [ObjectTranslationUtil transformPolylineToDictionary: polyline]
    ];
}

- (void)onPolygonClick: (GMSPolygon *)polygon {
    [self sendCommandToReactNative:@"onPolygonClick" args:
      [ObjectTranslationUtil transformPolygonToDictionary: polygon]
    ];
}

- (void)onCircleClick: (GMSCircle *)circle {
    [self sendCommandToReactNative:@"onCircleClick" args:
    [ObjectTranslationUtil transformCircleToDictionary: circle]
    ];
}

- (void)onGroundOverlayClick: (GMSGroundOverlay *)groundOverlay {
    [self sendCommandToReactNative:@"onGroundOverlayClick" args:
    [ObjectTranslationUtil transformGroundOverlayToDictionary: groundOverlay]
    ];
}

- (void)onTurnByTurn:(GMSNavigationNavInfo *)navInfo
    distanceToNextDestinationMeters:(double)distanceToNextDestinationMeters
       timeToNextDestinationSeconds:(double)timeToNextDestinationSeconds {
  NSMutableDictionary *obj = [[NSMutableDictionary alloc] init];

  [obj setValue:[NSNumber numberWithLong:navInfo.navState] forKey:@"navState"];
  [obj setValue:[NSNumber numberWithBool:navInfo.routeChanged] forKey:@"routeChanged"];
  if (navInfo.distanceToCurrentStepMeters) {
    [obj setValue:[NSNumber numberWithLong:navInfo.distanceToCurrentStepMeters]
           forKey:@"distanceToCurrentStepMeters"];
  }

  if (navInfo.distanceToFinalDestinationMeters) {
    [obj setValue:[NSNumber numberWithLong:navInfo.distanceToFinalDestinationMeters]
           forKey:@"distanceToFinalDestinationMeters"];
  }
  if (navInfo.timeToCurrentStepSeconds) {
    [obj setValue:[NSNumber numberWithLong:navInfo.timeToCurrentStepSeconds]
           forKey:@"timeToCurrentStepSeconds"];
  }

  if (distanceToNextDestinationMeters) {
    [obj setValue:[NSNumber numberWithLong:distanceToNextDestinationMeters]
           forKey:@"distanceToNextDestinationMeters"];
  }

  if (timeToNextDestinationSeconds) {
    [obj setValue:[NSNumber numberWithLong:timeToNextDestinationSeconds]
           forKey:@"timeToNextDestinationSeconds"];
  }

  if (navInfo.timeToFinalDestinationSeconds) {
    [obj setValue:[NSNumber numberWithLong:navInfo.timeToFinalDestinationSeconds]
           forKey:@"timeToFinalDestinationSeconds"];
  }

  if (navInfo.currentStep != NULL) {
    [obj setObject:[self getStepInfo:navInfo.currentStep] forKey:@"currentStep"];
  }

  NSMutableArray *steps = [[NSMutableArray alloc] init];

  if (navInfo.remainingSteps != NULL) {
    for (GMSNavigationStepInfo *step in navInfo.remainingSteps) {
      if (step != NULL) {
        [steps addObject:[self getStepInfo:step]];
      }
    }
  }

  [obj setObject:steps forKey:@"getRemainingSteps"];

  NSMutableArray *params = [NSMutableArray array];
  [params addObject:obj];
  [_eventDispatcher sendEventName:@"onTurnByTurn"
                             body:@{
                               @"args" : params,
                             }];
}


- (NSDictionary *)getStepInfo:(GMSNavigationStepInfo *)stepInfo {
  NSMutableDictionary *obj = [[NSMutableDictionary alloc] init];

  [obj setValue:[NSNumber numberWithInteger:stepInfo.distanceFromPrevStepMeters]
         forKey:@"distanceFromPrevStepMeters"];
  [obj setValue:[NSNumber numberWithInteger:stepInfo.timeFromPrevStepSeconds]
         forKey:@"timeFromPrevStepSeconds"];
  [obj setValue:[NSNumber numberWithInteger:stepInfo.drivingSide] forKey:@"drivingSide"];
  [obj setValue:[NSNumber numberWithInteger:stepInfo.stepNumber] forKey:@"stepNumber"];
  [obj setValue:[NSNumber numberWithInteger:stepInfo.maneuver] forKey:@"maneuver"];
  [obj setValue:stepInfo.exitNumber forKey:@"exitNumber"];
  [obj setValue:stepInfo.fullRoadName forKey:@"fullRoadName"];
  [obj setValue:stepInfo.fullInstructionText forKey:@"instruction"];

  return obj;
}

- (void)sendCommandToReactNative:(NSString *)command {
  if (_eventDispatcher != NULL) {
    [_eventDispatcher sendEventName:command
                               body:@{
                                 @"args" : @[],
                               }];
  }
}

- (void)sendCommandToReactNative:(NSString *)command args:(NSObject *)args {
  if (_eventDispatcher != NULL) {
    [_eventDispatcher sendEventName:command
                               body:args];
  }
}

// MAPS SDK
RCT_EXPORT_METHOD(setIndoorEnabled : (nonnull NSNumber *)reactTag isEnabled : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController setIndoorEnabled:isEnabled];
  });
}

RCT_EXPORT_METHOD(setTrafficEnabled : (nonnull NSNumber *)reactTag isEnabled : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController setTrafficEnabled:isEnabled];
  });
}

RCT_EXPORT_METHOD(setCompassEnabled : (nonnull NSNumber *)reactTag isEnabled : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController setCompassEnabled:isEnabled];
  });
}

RCT_EXPORT_METHOD(setMyLocationButtonEnabled : (nonnull NSNumber *)reactTag isEnabled : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController setMyLocationButtonEnabled:isEnabled];
  });
}


RCT_EXPORT_METHOD(setMyLocationEnabled : (nonnull NSNumber *)reactTag isEnabled : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController setMyLocationEnabled:isEnabled];
  });
}

RCT_EXPORT_METHOD(setRotateGesturesEnabled : (nonnull NSNumber *)reactTag isEnabled : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController setRotateGesturesEnabled:isEnabled];
  });
}

RCT_EXPORT_METHOD(setScrollGesturesEnabled : (nonnull NSNumber *)reactTag isEnabled : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController setScrollGesturesEnabled:isEnabled];
  });
}

RCT_EXPORT_METHOD(setScrollGesturesEnabledDuringRotateOrZoom
                  : (nonnull NSNumber *)reactTag isEnabled
                  : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController setScrollGesturesEnabledDuringRotateOrZoom:isEnabled];
  });
}

RCT_EXPORT_METHOD(setTiltGesturesEnabled : (nonnull NSNumber *)reactTag isEnabled : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController setTiltGesturesEnabled:isEnabled];
  });
}

RCT_EXPORT_METHOD(setZoomGesturesEnabled : (nonnull NSNumber *)reactTag isEnabled : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController setZoomGesturesEnabled:isEnabled];
  });
}

RCT_EXPORT_METHOD(setBuildingsEnabled : (nonnull NSNumber *)reactTag isEnabled : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController setBuildingsEnabled:isEnabled];
  });
}

RCT_EXPORT_METHOD(setAbnormalTerminatingReportingEnabled : (nonnull NSNumber *)reactTag isEnabled : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController setAbnormalTerminatingReportingEnabled:isEnabled];
  });
}

RCT_EXPORT_METHOD(setTrafficIncidentCardsEnabled : (nonnull NSNumber *)reactTag isEnabled : (BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController setTrafficIncidentCardsEnabled:isEnabled];
  });
}

RCT_EXPORT_METHOD(resetMinMaxZoomLevel) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController resetMinMaxZoomLevel];
  });
}

RCT_EXPORT_METHOD(animateCamera
                  : (nonnull NSNumber *)latitude longitude
                  : (nonnull NSNumber *)longitude) {
  dispatch_async(dispatch_get_main_queue(), ^{
    GMSCameraPosition *cameraPosition =
        [GMSCameraPosition cameraWithLatitude:[latitude doubleValue]
                                    longitude:[longitude doubleValue]
                                         zoom:10];
    GMSCameraUpdate *update = [GMSCameraUpdate setCamera:cameraPosition];
    [viewController animateCamera:update];
  });
}

RCT_EXPORT_METHOD(setMapStyle
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

    if (!viewController) {
      debugCallback(@[ @"ViewController is null" ]);
      return;
    }

    [viewController setMapStyle:mapStyle];
    debugCallback(@[ @"Map style set successfully" ]);
  });
}

RCT_EXPORT_METHOD(setMapType :(nonnull NSNumber *)reactTag mapType: (NSInteger)mapType) {
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
    [viewController setMapType:mapViewType];
  });
}


RCT_EXPORT_METHOD(clearMapView:(nonnull NSNumber *)reactTag) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController clearMapView];
  });
}

RCT_EXPORT_METHOD(startUpdatingLocation:(nonnull NSNumber *)reactTag) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController startUpdatingLocation];
  });
}

RCT_EXPORT_METHOD(stopUpdatingLocation:(nonnull NSNumber *)reactTag) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [viewController stopUpdatingLocation];
  });
}

@end
