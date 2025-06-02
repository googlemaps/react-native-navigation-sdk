/**
 * Copyright 2024 Google LLC
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

#import "NavModule.h"
#import <React/RCTConvert.h>
#import <React/RCTLog.h>
#import "NavAutoModule.h"
#import "NavViewModule.h"
#import "ObjectTranslationUtil.h"

using namespace JS::NativeNavModule;

@implementation NavModule {
  GMSNavigationSession *_session;
  NSMutableArray<GMSNavigationMutableWaypoint *> *_destinations;
  TOSDialogOptionsSpec *_tosParams;
}

typedef NS_ENUM(NSInteger, NavSessionStatus) {
  NavSessionStatusOK = 0,
  NavSessionStatusNotAuthorized = 1,
  NavSessionStatusTermsNotAccepted = 2,
  NavSessionStatusNetworkError = 3,
  NavSessionStatusLocationPermissionMissing = 4,
};

RCT_EXPORT_MODULE();

@synthesize enableUpdateInfo = _enableUpdateInfo;
static NavigationSessionReadyCallback _navigationSessionReadyCallback;
static NavigationSessionDisposedCallback _navigationSessionDisposedCallback;

// Static instance of the NavViewModule to allow access from another modules.
static NavModule *sharedInstance = nil;

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

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeNavModuleSpecJSI>(params);
}

- (BOOL)hasSession {
  return _session != nil;
}

- (GMSNavigationSession *)getSession {
  return _session;
}

- (GMSNavigator *)getNavigatorWithError:(NSString **)error {
  if (self->_session == nil) {
    if (error) {
      *error = @"Navigation session not initialized";
    }
    return nil;
  }

  return self->_session.navigator;
}

- (BOOL)checkNavigatorWithError:(RCTPromiseRejectBlock)reject navigator:(GMSNavigator **)navigator {
  NSString *error = nil;
  *navigator = [self getNavigatorWithError:&error];

  if (error) {
    reject(@"session_not_initialized", error, nil);
    return NO;
  }
  return YES;
}

- (void)initializeSession:(nonnull RCTPromiseResolveBlock)resolve
                   reject:(nonnull RCTPromiseRejectBlock)reject {
  // Try to create a navigation session.
  if (self->_session == nil && self->_session.navigator == nil) {
    GMSNavigationSession *session = [GMSNavigationServices createNavigationSession];
    if (session == nil) {
      // According to the API documentation, the only reason a nil session is
      // ever returned is due to terms and conditions not having been accepted
      // yet.
      //
      // At this point, this should not happen due to the earlier check.
      // Define a local enum for session status
      resolve(@(NavSessionStatusTermsNotAccepted));
      return;
    }
    self->_session = session;
    if (_navigationSessionReadyCallback) {
      _navigationSessionReadyCallback();
    }
  }

  _session.started = YES;

  if (self->_session.navigator) {
    [self->_session.navigator addListener:self];
    self->_session.navigator.stopGuidanceAtArrival = NO;
  }

  [self->_session.roadSnappedLocationProvider addListener:self];

  NavViewModule *navViewModule = [NavViewModule sharedInstance];
  [navViewModule attachViewsToNavigationSession:_session];

  [self onNavigationReady];
  resolve(@(NavSessionStatusOK));
}

+ (void)registerNavigationSessionReadyCallback:(NavigationSessionReadyCallback)callback {
  _navigationSessionReadyCallback = [callback copy];
}

+ (void)unregisterNavigationSessionReadyCallback {
  _navigationSessionReadyCallback = nil;
}

+ (void)registerNavigationSessionDisposedCallback:(NavigationSessionDisposedCallback)callback {
  _navigationSessionDisposedCallback = [callback copy];
}

+ (void)unregisterNavigationSessionDisposedCallback {
  _navigationSessionDisposedCallback = nil;
}

- (void)showTermsAndConditionsDialog:(nonnull RCTPromiseResolveBlock)resolve
                              reject:(nonnull RCTPromiseRejectBlock)reject {
  GMSNavigationTermsAndConditionsOptions *options = [[GMSNavigationTermsAndConditionsOptions alloc]
      initWithCompanyName:_tosParams->companyName()];
  options.title = _tosParams->title();

  std::optional<bool> showOnlyDisclaimerOpt = _tosParams->showOnlyDisclaimer();
  BOOL showAwareness = showOnlyDisclaimerOpt.has_value() ? showOnlyDisclaimerOpt.value() : NO;
  options.shouldOnlyShowDriverAwarenessDialog = showAwareness;

  [GMSNavigationServices showTermsAndConditionsDialogIfNeededWithOptions:options
                                                                callback:^(BOOL termsAccepted) {
                                                                  if (termsAccepted) {
                                                                    [self initializeSession:resolve
                                                                                     reject:reject];
                                                                  } else {
                                                                    reject(@"TERMS_NOT_ACCEPTED",
                                                                           @"Terms and conditions "
                                                                           @"not accepted.",
                                                                           nil);
                                                                    return;
                                                                  }
                                                                }];
}

- (void)setDisplayOptionsToViews:(const DisplayOptionsSpec &)options {
  for (NavViewController *viewController in [NavViewModule viewControllersRegistry].allValues) {
    if (options.showDestinationMarkers().has_value()) {
      [viewController setShowDestinationMarkersEnabled:options.showDestinationMarkers().value()];
    }
    if (options.showStopSigns().has_value()) {
      [viewController setShowStopSignsEnabled:options.showStopSigns().value()];
    }
    if (options.showTrafficLights().has_value()) {
      [viewController setShowTrafficLightsEnabled:options.showTrafficLights().has_value()];
    }
  }
}

+ (GMSNavigationRoutingOptions *)getRoutingOptions:(const RoutingOptionsSpec &)options {
  GMSNavigationMutableRoutingOptions *routingOptions = [[GMSNavigationMutableRoutingOptions alloc]
      initWithRoutingStrategy:
          (GMSNavigationRoutingStrategy)(options.routingStrategy().has_value()
                                             ? options.routingStrategy().value()
                                             : GMSNavigationRoutingStrategyDefaultBest)];

  if (options.alternateRoutesStrategy().has_value()) {
    [routingOptions setAlternateRoutesStrategy:(GMSNavigationAlternateRoutesStrategy)options
                                                   .alternateRoutesStrategy()
                                                   .value()];
  }
  return routingOptions;
}

- (void)configureNavigator:(GMSNavigator *)navigator
        withRoutingOptions:(const RoutingOptionsSpec &)routingOptions {
  if (routingOptions.travelMode().has_value()) {
    NavViewModule *navViewModule = [NavViewModule sharedInstance];
    [navViewModule setTravelMode:(GMSNavigationTravelMode)routingOptions.travelMode().value()];
  }

  if (routingOptions.avoidTolls().has_value()) {
    [navigator setAvoidsTolls:routingOptions.avoidTolls().value()];
  }

  if (routingOptions.avoidFerries().has_value()) {
    [navigator setAvoidsFerries:routingOptions.avoidFerries().value()];
  }

  if (routingOptions.avoidHighways().has_value()) {
    [navigator setAvoidsHighways:routingOptions.avoidHighways().value()];
  }
}

- (void)areTermsAccepted:(nonnull RCTPromiseResolveBlock)resolve
                  reject:(nonnull RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (GMSNavigationServices.areTermsAndConditionsAccepted == NO) {
      resolve(@NO);
    } else {
      resolve(@YES);
    }
  });
}

- (void)cleanup:(nonnull RCTPromiseResolveBlock)resolve
         reject:(nonnull RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_session == nil) {
      reject(@"session_not_initialized", @"Navigation session not initialized", nil);
      return;
    }

    if (self->_session.locationSimulator != nil) {
      [self->_session.locationSimulator stopSimulation];
    }

    if (self->_session.navigator != nil) {
      [self->_session.navigator clearDestinations];
      self->_session.navigator.guidanceActive = NO;
      self->_session.navigator.sendsBackgroundNotifications = NO;
    }

    if (self->_session.roadSnappedLocationProvider != nil) {
      [self->_session.roadSnappedLocationProvider removeListener:self];
    }

    self->_session.started = NO;
    self->_session = nil;
    if (_navigationSessionDisposedCallback) {
      _navigationSessionDisposedCallback();
    }
    resolve(@(YES));
  });
}

- (void)clearDestinations:(nonnull RCTPromiseResolveBlock)resolve
                   reject:(nonnull RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    GMSNavigator *navigator = nil;
    if (![self checkNavigatorWithError:reject navigator:&navigator]) {
      return;
    }

    [navigator clearDestinations];
    self->_destinations = NULL;
    resolve(@(YES));
  });
}

- (void)continueToNextDestination:(nonnull RCTPromiseResolveBlock)resolve
                           reject:(nonnull RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    GMSNavigator *navigator = nil;
    if (![self checkNavigatorWithError:reject navigator:&navigator]) {
      return;
    }

    [navigator continueToNextDestination];
    resolve(@(YES));
  });
}

- (void)getCurrentRouteSegment:(nonnull RCTPromiseResolveBlock)resolve
                        reject:(nonnull RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    GMSNavigator *navigator = nil;
    if (![self checkNavigatorWithError:reject navigator:&navigator]) {
      return;
    }

    GMSRouteLeg *currentSegment = navigator.currentRouteLeg;
    if (!currentSegment) {
      reject(@"route_not_available", @"No current route available", nil);
      return;
    }

    resolve(@{
      @"destinationLatLng" : [ObjectTranslationUtil
          transformCoordinateToDictionary:currentSegment.destinationCoordinate],
      @"destinationWaypoint" : [ObjectTranslationUtil
          transformNavigationWaypointToDictionary:currentSegment.destinationWaypoint],
      @"segmentLatLngList" : [ObjectTranslationUtil transformGMSPathToArray:currentSegment.path]
    });
  });
}

- (void)getCurrentTimeAndDistance:(nonnull RCTPromiseResolveBlock)resolve
                           reject:(nonnull RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    GMSNavigator *navigator = nil;
    if (![self checkNavigatorWithError:reject navigator:&navigator]) {
      return;
    }

    if (!navigator.currentRouteLeg) {
      reject(@"route_not_available", @"No current route available", nil);
      return;
    }

    GMSNavigationDelayCategory severity = navigator.delayCategoryToNextDestination;
    NSTimeInterval time = navigator.timeToNextDestination;
    CLLocationDistance distance = navigator.distanceToNextDestination;

    resolve(@{@"delaySeverity" : @(severity), @"meters" : @(distance), @"seconds" : @(time)});
  });
}

- (void)getNavSDKVersion:(nonnull RCTPromiseResolveBlock)resolve
                  reject:(nonnull RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    resolve(GMSNavigationServices.navSDKVersion);
  });
}

- (void)getRouteSegments:(nonnull RCTPromiseResolveBlock)resolve
                  reject:(nonnull RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    GMSNavigator *navigator = nil;
    if (![self checkNavigatorWithError:reject navigator:&navigator]) {
      return;
    }

    NSArray<GMSRouteLeg *> *routeSegmentList = navigator.routeLegs;
    if (!routeSegmentList) {
      reject(@"route_not_available", @"No current route available", nil);
      return;
    }

    NSMutableArray *arr = [[NSMutableArray alloc] init];

    for (int i = 0; i < routeSegmentList.count; i++) {
      [arr addObject:[ObjectTranslationUtil transformRouteSegmentToDictionary:routeSegmentList[i]]];
    }

    resolve(arr);
  });
}

- (void)getTraveledPath:(nonnull RCTPromiseResolveBlock)resolve
                 reject:(nonnull RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    GMSNavigator *navigator = nil;
    if (![self checkNavigatorWithError:reject navigator:&navigator]) {
      return;
    }

    GMSPath *traveledPath = navigator.traveledPath;

    if (traveledPath != nil) {
      resolve([ObjectTranslationUtil transformGMSPathToArray:traveledPath]);
    } else {
      resolve(nil);
    }
  });
}

- (void)initializeNavigator:(TOSDialogOptionsSpec &)termsAndConditionsDialogOptions
        taskRemovedBehavior:(double)taskRemovedBehavior
                    resolve:(nonnull RCTPromiseResolveBlock)resolve
                     reject:(nonnull RCTPromiseRejectBlock)reject {
  TOSDialogOptionsSpec termsAndConditionsDialogOptionsCopy(termsAndConditionsDialogOptions);

  dispatch_async(dispatch_get_main_queue(), ^{
    self->_tosParams = self->_tosParams =
        new TOSDialogOptionsSpec(termsAndConditionsDialogOptionsCopy);
    [self showTermsAndConditionsDialog:resolve reject:reject];
  });
}

- (void)resetTermsAccepted {
  [GMSNavigationServices resetTermsAndConditionsAccepted];
}

- (void)setAudioGuidanceType:(double)index
                     resolve:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    GMSNavigator *navigator = nil;
    if (![self checkNavigatorWithError:reject navigator:&navigator]) {
      return;
    }

    if (index == 0) {
      [navigator setVoiceGuidance:GMSNavigationVoiceGuidanceSilent];
    } else if (index == 1) {
      [navigator setVoiceGuidance:GMSNavigationVoiceGuidanceAlertsOnly];
    } else {
      [navigator setVoiceGuidance:GMSNavigationVoiceGuidanceAlertsAndGuidance];
    }

    resolve(@(YES));
  });
}

- (void)setDestinations:(nonnull NSArray *)waypoints
         routingOptions:(RoutingOptionsSpec &)routingOptions
         displayOptions:(DisplayOptionsSpec &)displayOptions
                resolve:(nonnull RCTPromiseResolveBlock)resolve
                 reject:(nonnull RCTPromiseRejectBlock)reject {
  NSArray *waypointsCopy = [waypoints copy];
  RoutingOptionsSpec routingOptionsCopy(routingOptions);
  DisplayOptionsSpec displayOptionsCopy(displayOptions);

  __weak __typeof(self) weakSelf = self;
  dispatch_async(dispatch_get_main_queue(), ^{
    __strong __typeof(self) strongSelf = weakSelf;
    if (!strongSelf) {
      reject(@"E_NAV_INSTANCE_NIL", @"Navigation module instance lost", nil);
      return;
    }

    GMSNavigator *navigator = nil;
    if (![strongSelf checkNavigatorWithError:reject navigator:&navigator]) {
      return;
    }

    if (displayOptionsCopy.showDestinationMarkers().has_value() ||
        displayOptionsCopy.showStopSigns().has_value() ||
        displayOptionsCopy.showTrafficLights().has_value()) {
      [strongSelf setDisplayOptionsToViews:displayOptionsCopy];
    }

    NSMutableArray<GMSNavigationMutableWaypoint *> *nativeWaypoints = [[NSMutableArray alloc] init];
    BOOL encounteredInvalidWaypoint = NO;

    for (NSDictionary *wp in waypointsCopy) {
      if (![wp isKindOfClass:[NSDictionary class]]) {
        RCTLogWarn(@"[NavModule] Waypoint item is not a dictionary, skipping.");
        encounteredInvalidWaypoint = YES;
        continue;
      }

      GMSNavigationMutableWaypoint *w = nil;
      NSString *placeId = [RCTConvert NSString:wp[@"placeId"]];
      NSString *title = [RCTConvert NSString:wp[@"title"]];

      if (placeId && ![placeId isEqualToString:@""]) {
        w = [[GMSNavigationMutableWaypoint alloc] initWithPlaceID:placeId title:title];
      } else if (wp[@"position"]) {
        @try {
          CLLocationCoordinate2D coordinate =
              [ObjectTranslationUtil getLocationCoordinateFrom:wp[@"position"]];
          if (CLLocationCoordinate2DIsValid(coordinate)) {
            w = [[GMSNavigationMutableWaypoint alloc] initWithLocation:coordinate title:title];
          } else {
            RCTLogWarn(@"[NavModule] Invalid coordinates in waypoint position, "
                       @"skipping: %@",
                       wp[@"position"]);
            encounteredInvalidWaypoint = YES;
          }
        } @catch (NSException *exception) {
          RCTLogWarn(@"[NavModule] Error parsing waypoint position, skipping: %@",
                     exception.reason);
          encounteredInvalidWaypoint = YES;
        }
      }

      if (!w) {
        // Skip if neither valid placeId nor valid position was found
        if (!encounteredInvalidWaypoint) {
          RCTLogWarn(@"[NavModule] Waypoint skipped: Missing valid placeId or "
                     @"position. %@",
                     wp);
        }
        encounteredInvalidWaypoint = YES;
        continue;
      }

      NSNumber *preferSameSide = [RCTConvert NSNumber:wp[@"preferSameSideOfRoad"]];
      if (preferSameSide != nil) {
        w.preferSameSideOfRoad = [preferSameSide boolValue];
      }

      NSNumber *vehicleStopover = [RCTConvert NSNumber:wp[@"vehicleStopover"]];
      if (vehicleStopover != nil) {
        w.vehicleStopover = [vehicleStopover boolValue];
      }

      NSNumber *preferredHeading = [RCTConvert NSNumber:wp[@"preferredHeading"]];
      if (preferredHeading != nil) {
        w.preferredHeading = [preferredHeading doubleValue];
      }

      [nativeWaypoints addObject:w];
    }  // End waypoint loop

    strongSelf->_destinations = nativeWaypoints;

    void (^routeStatusCallback)(GMSRouteStatus) = ^(GMSRouteStatus routeStatus) {
      __strong __typeof(weakSelf) strongSelfInner = weakSelf;
      if (!strongSelfInner) return;

      // Let a helper method handle the status and resolve/reject *once*
      [strongSelfInner handleRouteStatusResult:routeStatus resolve:resolve reject:reject];
    };

    // Check if routing options were provided
    BOOL hasRoutingOptions = routingOptionsCopy.travelMode().has_value() ||
                             routingOptionsCopy.routingStrategy().has_value() ||
                             routingOptionsCopy.alternateRoutesStrategy().has_value() ||
                             routingOptionsCopy.avoidFerries().has_value() ||
                             routingOptionsCopy.avoidTolls().has_value() ||
                             routingOptionsCopy.avoidHighways().has_value();

    if (hasRoutingOptions) {
      [strongSelf configureNavigator:navigator withRoutingOptions:routingOptionsCopy];

      GMSNavigationRoutingOptions *gmsRoutingOptions =
          [NavModule getRoutingOptions:routingOptionsCopy];

      [navigator setDestinations:nativeWaypoints
                  routingOptions:gmsRoutingOptions
                        callback:routeStatusCallback];
    } else {
      [navigator setDestinations:nativeWaypoints callback:routeStatusCallback];
    }
  });
}

- (void)handleRouteStatusResult:(GMSRouteStatus)routeStatus
                        resolve:(RCTPromiseResolveBlock)resolve
                         reject:(RCTPromiseRejectBlock)reject {
  switch (routeStatus) {
    case GMSRouteStatusOK:
      resolve(@(YES));
      break;

    case GMSRouteStatusAPIKeyNotAuthorized:
      reject(@"E_API_KEY_NOT_AUTHORIZED",
             @"A route could not be calculated because the provided key does not "
             @"have permission "
             @"to use the Navigation SDK.",
             nil);
      break;

    case GMSRouteStatusNetworkError:
      reject(@"E_NETWORK_ERROR",
             @"A route to the destination could not be calculated because of a "
             @"network error.",
             nil);
      break;

    case GMSRouteStatusInternalError:
      reject(@"E_INTERNAL_ERROR", @"A route to the destination could not be calculated.", nil);
      break;

    case GMSRouteStatusNoRouteFound:
      reject(@"E_NO_ROUTE_FOUND", @"A route to the destination could not be calculated.", nil);
      break;

    case GMSRouteStatusQuotaExceeded:
      reject(@"E_QUOTA_CHECK_FAILED",
             @"A route to the destination could not be calculated because of "
             @"insufficient quota.",
             nil);
      break;

    case GMSRouteStatusCanceled:
      reject(@"E_ROUTE_CANCELLED", @"The route calculation was canceled in favor of a newer one",
             nil);
      break;

    case GMSRouteStatusLocationUnavailable:
      reject(@"E_LOCATION_DISABLED",
             @"A route could not be calculated because the user's location is "
             @"not available. This "
             @"could be because the user hasn't granted location permissions for "
             @"the app.",
             nil);
      break;

    case GMSRouteStatusNoWaypointsError:
      reject(@"E_WAYPOINT_ERROR",
             @"A route could not be calculated because no waypoints were provided.", nil);
      break;

    case GMSRouteStatusDuplicateWaypointsError:
      reject(@"E_WAYPOINT_ERROR",
             @"A route could not be calculated because there were duplicate "
             @"waypoints present in "
             @"the request.",
             nil);
      break;

    case GMSRouteStatusWaypointError:
      reject(@"E_WAYPOINT_ERROR",
             @"A route could not be generated because there was a problem with "
             @"the waypoints provided "
             @"in the request. For example, a stale or invalid Place ID may have "
             @"been provided.",
             nil);
      break;

    case GMSRouteStatusTravelModeUnsupported:
      reject(@"E_UNSUPPORTED_TRAVELMODE",
             @"A route could not be generated if given an unsupported travel "
             @"mode. For example, if "
             @"you are setting destinations with a route token, only Driving and "
             @"TwoWheeler travel "
             @"mode are supported.",
             nil);
      break;

    default:
      NSLog(@"[NavModule] Received unhandled route status: %ld", (long)routeStatus);
      reject(@"E_ROUTE_UNKNOWN",
             [NSString stringWithFormat:@"Route calculation failed with unknown status code: %ld",
                                        (long)routeStatus],
             nil);
      break;
  }
}

- (void)setSpeedAlertOptions:(SpeedAlertOptionsSpec &)alertOptions
                     resolve:(nonnull RCTPromiseResolveBlock)resolve
                      reject:(nonnull RCTPromiseRejectBlock)reject {
  SpeedAlertOptionsSpec alertOptionsCopy(alertOptions);
  dispatch_async(dispatch_get_main_queue(), ^{
    GMSNavigator *navigator = nil;
    if (![self checkNavigatorWithError:reject navigator:&navigator]) {
      return;
    }

    CGFloat minorSpeedAlertThresholdPercentage = alertOptionsCopy.minorSpeedAlertPercentThreshold();
    CGFloat majorSpeedAlertThresholdPercentage = alertOptionsCopy.majorSpeedAlertPercentThreshold();
    NSTimeInterval severityUpgradeDurationSeconds =
        alertOptionsCopy.severityUpgradeDurationSeconds();

    GMSNavigationMutableSpeedAlertOptions *mutableSpeedAlertOptions =
        [[GMSNavigationMutableSpeedAlertOptions alloc] init];

    [mutableSpeedAlertOptions
        setSpeedAlertThresholdPercentage:minorSpeedAlertThresholdPercentage
                   forSpeedAlertSeverity:GMSNavigationSpeedAlertSeverityMinor];
    [mutableSpeedAlertOptions
        setSpeedAlertThresholdPercentage:majorSpeedAlertThresholdPercentage
                   forSpeedAlertSeverity:GMSNavigationSpeedAlertSeverityMajor];
    [mutableSpeedAlertOptions setSeverityUpgradeDurationSeconds:severityUpgradeDurationSeconds];

    // Set SpeedAlertOptions to Navigator
    navigator.speedAlertOptions = mutableSpeedAlertOptions;
    resolve(@(YES));
  });
}

- (void)startGuidance:(nonnull RCTPromiseResolveBlock)resolve
               reject:(nonnull RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_destinations != NULL) {
      GMSNavigator *navigator = nil;
      if (![self checkNavigatorWithError:reject navigator:&navigator]) {
        return;
      }

      navigator.guidanceActive = YES;
      [self onStartGuidance];
      navigator.sendsBackgroundNotifications = YES;
      resolve(@(YES));
    } else {
      reject(@"no_destinations", @"Destinations not set", nil);
    }
  });
}

- (void)stopGuidance:(nonnull RCTPromiseResolveBlock)resolve
              reject:(nonnull RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    GMSNavigator *navigator = nil;
    if (![self checkNavigatorWithError:reject navigator:&navigator]) {
      return;
    }

    navigator.guidanceActive = NO;
    resolve(@(YES));
  });
}

- (void)pauseLocationSimulation:(nonnull RCTPromiseResolveBlock)resolve
                         reject:(nonnull RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    self->_session.locationSimulator.paused = YES;
    resolve(nil);
  });
}

- (void)resumeLocationSimulation:(nonnull RCTPromiseResolveBlock)resolve
                          reject:(nonnull RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    self->_session.locationSimulator.paused = NO;
    resolve(nil);
  });
}

- (void)setAbnormalTerminatingReportingEnabled:(BOOL)enabled {
  [GMSNavigationServices setAbnormalTerminationReportingEnabled:enabled];
}

- (void)setBackgroundLocationUpdatesEnabled:(BOOL)isEnabled {
  dispatch_async(dispatch_get_main_queue(), ^{
    self->_session.roadSnappedLocationProvider.allowsBackgroundLocationUpdates = isEnabled;
  });
}

- (void)setTurnByTurnLoggingEnabled:(BOOL)isEnabled {
  self.enableUpdateInfo = isEnabled;
}

- (void)simulateLocation:(JS::NativeNavModule::LatLngSpec &)location
                 resolve:(nonnull RCTPromiseResolveBlock)resolve
                  reject:(nonnull RCTPromiseRejectBlock)reject {
  LatLngSpec locationCopy(location);
  dispatch_async(dispatch_get_main_queue(), ^{
    [self->_session.locationSimulator
        simulateLocationAtCoordinate:CLLocationCoordinate2DMake(locationCopy.lat(),
                                                                locationCopy.lng())];
    resolve(nil);
  });
}

- (void)simulateLocationsAlongExistingRoute:
            (JS::NativeNavModule::LocationSimulationOptionsSpec &)options
                                    resolve:(nonnull RCTPromiseResolveBlock)resolve
                                     reject:(nonnull RCTPromiseRejectBlock)reject {
  LocationSimulationOptionsSpec optionsCopy(options);
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_destinations != nil && self->_session != nil) {
      [self->_session.locationSimulator setSpeedMultiplier:optionsCopy.speedMultiplier()];
      [self->_session.locationSimulator simulateLocationsAlongExistingRoute];
      resolve(nil);
    }
  });
}

- (void)startUpdatingLocation:(nonnull RCTPromiseResolveBlock)resolve
                       reject:(nonnull RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    [self->_session.roadSnappedLocationProvider startUpdatingLocation];
    resolve(nil);
  });
}

- (void)stopUpdatingLocation:(nonnull RCTPromiseResolveBlock)resolve
                      reject:(nonnull RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    [self->_session.roadSnappedLocationProvider stopUpdatingLocation];
    resolve(nil);
  });
}

- (void)stopLocationSimulation:(nonnull RCTPromiseResolveBlock)resolve
                        reject:(nonnull RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    [self->_session.locationSimulator stopSimulation];
    resolve(nil);
  });
}

#pragma mark - GMSNavigatorListener
// Listener for continuous location updates.
- (void)locationProvider:(GMSRoadSnappedLocationProvider *)locationProvider
       didUpdateLocation:(CLLocation *)location {
  [self onLocationChanged:[ObjectTranslationUtil transformCLLocationToDictionary:location]];
}

- (void)navigatorWillPresentPrompt:(GMSNavigator *)navigator {
  [self onPromptVisibilityChange:YES];
}

- (void)navigatorDidDismissPrompt:(GMSNavigator *)navigator {
  [self onPromptVisibilityChange:NO];
}

// Listener to handle arrival events.
- (void)navigator:(GMSNavigator *)navigator didArriveAtWaypoint:(GMSNavigationWaypoint *)waypoint {
  NSMutableDictionary *eventMap = [[NSMutableDictionary alloc] init];

  eventMap[@"waypoint"] = [ObjectTranslationUtil transformNavigationWaypointToDictionary:waypoint];
  eventMap[@"isFinalDestination"] = @(navigator.routeLegs != nil && navigator.routeLegs.count == 1);

  [self onArrival:eventMap];
}

// Listener for route change events.
- (void)navigatorDidChangeRoute:(GMSNavigator *)navigator {
  [self onRouteChanged];
}

// Listener for time to next destination.
- (void)navigator:(GMSNavigator *)navigator didUpdateRemainingTime:(NSTimeInterval)time {
  [self onRemainingTimeOrDistanceChanged];
}

// Listener for distance to next destination.
- (void)navigator:(GMSNavigator *)navigator
    didUpdateRemainingDistance:(CLLocationDistance)distance {
  [self onRemainingTimeOrDistanceChanged];
}

- (void)navigator:(GMSNavigator *)navigator didUpdateNavInfo:(GMSNavigationNavInfo *)navInfo {
  if (self.enableUpdateInfo == TRUE && navInfo.navState == GMSNavigationNavStateEnroute) {
    [self onTurnByTurn:navInfo
        distanceToNextDestinationMeters:navigator.distanceToNextDestination
           timeToNextDestinationSeconds:navigator.timeToNextDestination];
  }
}

#pragma mark - INavigationCallback
- (void)onLocationChanged:(NSDictionary *)mappedLocation {
  [self emitOnLocationChanged:mappedLocation];
}

- (void)onArrival:(NSDictionary *)eventMap {
  [self emitOnArrival:eventMap];
}

- (void)onPromptVisibilityChange:(BOOL)visible {
  NavViewModule *navViewModule = [NavViewModule sharedInstance];
  [navViewModule informPromptVisibilityChange:visible];
}

- (void)onNavigationReady {
  [self emitOnNavigationReady];
}

- (void)onRemainingTimeOrDistanceChanged {
  [self emitOnRemainingTimeOrDistanceChanged];
}

- (void)onRouteChanged {
  [self emitOnRouteChanged];
}

- (void)onReroutingRequestedByOffRoute {
  [self emitOnReroutingRequestedByOffRoute];
}

- (void)onStartGuidance {
  [self emitOnStartGuidance];
}

- (void)onTurnByTurn:(nonnull GMSNavigationNavInfo *)navInfo {
  [self onTurnByTurn:navInfo distanceToNextDestinationMeters:0 timeToNextDestinationSeconds:0];
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

  [self emitOnTurnByTurn:@{@"turnByTurnEvents" : params}];
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

@end
