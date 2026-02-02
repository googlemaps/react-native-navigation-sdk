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
#import "NavAutoModule.h"
#import "NavViewModule.h"
#import "ObjectTranslationUtil.h"

using namespace JS::NativeNavModule;

static NSString *const kNoNavigatorErrorCode = @"NO_NAVIGATOR_ERROR_CODE";
static NSString *const kNoNavigatorErrorMessage =
    @"Make sure to initialize the navigator is ready before executing.";
static NSString *const kNoDestinationsErrorCode = @"NO_DESTINATIONS";
static NSString *const kNoDestinationsErrorMessage = @"Destinations not set";

@implementation NavModule {
  GMSNavigationSession *_session;
  NSMutableArray<GMSNavigationMutableWaypoint *> *_destinations;
  RCTPromiseResolveBlock _pendingInitResolve;
  RCTPromiseRejectBlock _pendingInitReject;
}

@synthesize enableUpdateInfo = _enableUpdateInfo;
static NavigationSessionReadyCallback _navigationSessionReadyCallback;
static NavigationSessionDisposedCallback _navigationSessionDisposedCallback;
static NavModule *sharedInstance = nil;

RCT_EXPORT_MODULE(NavModule);

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeNavModuleSpecJSI>(params);
}

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

- (BOOL)hasSession {
  return _session != nil;
}

- (BOOL)isNavigatorAvailable {
  return self->_session != nil && self->_session.navigator != nil;
}

- (GMSNavigationSession *)getSession {
  return _session;
}

- (BOOL)checkNavigatorWithError:(RCTPromiseRejectBlock)reject navigator:(GMSNavigator **)navigator {
  if (![self isNavigatorAvailable]) {
    reject(kNoNavigatorErrorCode, kNoNavigatorErrorMessage, nil);
    return NO;
  }
  *navigator = self->_session.navigator;
  return YES;
}

- (void)initializeSession {
  // Try to create a navigation session.
  if (self->_session == nil && self->_session.navigator == nil) {
    GMSNavigationSession *session = [GMSNavigationServices createNavigationSession];
    if (session == nil) {
      // According to the API documentation, the only reason a nil session is
      // ever returned is due to terms and conditions not having been accepted
      // yet.
      if (self->_pendingInitReject) {
        self->_pendingInitReject(@"termsNotAccepted", @"Terms not accepted", nil);
        self->_pendingInitResolve = nil;
        self->_pendingInitReject = nil;
      }
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
  [navViewModule notifyNavigationSessionReady];

  // Resolve the pending init promise
  if (self->_pendingInitResolve) {
    self->_pendingInitResolve(nil);
    self->_pendingInitResolve = nil;
    self->_pendingInitReject = nil;
  }
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

- (void)showTermsAndConditionsDialog:(NSString *)title
                         companyName:(NSString *)companyName
                  showOnlyDisclaimer:(BOOL)showOnlyDisclaimer
                            uiParams:(TermsAndConditionsUIParamsSpec &)uiParams
                             resolve:(RCTPromiseResolveBlock)resolve
                              reject:(RCTPromiseRejectBlock)reject {
  // Copy values before async dispatch to prevent access to deallocated memory
  TermsAndConditionsUIParamsSpec uiParamsCopy(uiParams);

  dispatch_async(dispatch_get_main_queue(), ^{
    // If already accepted, return true immediately
    if (GMSNavigationServices.areTermsAndConditionsAccepted) {
      resolve(@(YES));
      return;
    }

    // Create options object (always use GMSNavigationTermsAndConditionsOptions)
    GMSNavigationTermsAndConditionsOptions *options =
        [[GMSNavigationTermsAndConditionsOptions alloc] initWithCompanyName:companyName];
    options.title = title;
    options.shouldOnlyShowDriverAwarenessDialog = showOnlyDisclaimer;

    // Check if uiParams are valid and add custom colors if provided
    if (uiParamsCopy.valid().value_or(false)) {
      // Create UI params with custom colors (convert from hex strings to UIColor)
      UIColor *bgColor = nil;
      UIColor *titleColor = nil;
      UIColor *mainColor = nil;
      UIColor *acceptColor = nil;
      UIColor *cancelColor = nil;

      auto bgColorOpt = uiParamsCopy.backgroundColor();
      if (bgColorOpt.has_value()) {
        NSNumber *bgColorInt = @(bgColorOpt.value());
        bgColor = [UIColor colorWithColorInt:bgColorInt];
      }

      auto titleColorOpt = uiParamsCopy.titleColor();
      if (titleColorOpt.has_value()) {
        NSNumber *titleColorInt = @(titleColorOpt.value());
        titleColor = [UIColor colorWithColorInt:titleColorInt];
      }

      auto mainColorOpt = uiParamsCopy.mainTextColor();
      if (mainColorOpt.has_value()) {
        NSNumber *mainColorInt = @(mainColorOpt.value());
        mainColor = [UIColor colorWithColorInt:mainColorInt];
      }

      auto acceptColorOpt = uiParamsCopy.acceptButtonTextColor();
      if (acceptColorOpt.has_value()) {
        NSNumber *acceptColorInt = @(acceptColorOpt.value());
        acceptColor = [UIColor colorWithColorInt:acceptColorInt];
      }

      auto cancelColorOpt = uiParamsCopy.cancelButtonTextColor();
      if (cancelColorOpt.has_value()) {
        NSNumber *cancelColorInt = @(cancelColorOpt.value());
        cancelColor = [UIColor colorWithColorInt:cancelColorInt];
      }

      // Create and set UI params with custom colors
      GMSNavigationTermsDialogUIParams *dialogUIParams =
          [[GMSNavigationTermsDialogUIParams alloc] initWithBackgroundColor:bgColor
                                                                  titleFont:nil
                                                                 titleColor:titleColor
                                                               mainTextFont:nil
                                                              mainTextColor:mainColor
                                                                buttonsFont:nil
                                                      cancelButtonTextColor:cancelColor
                                                      acceptButtonTextColor:acceptColor];

      options.uiParams = dialogUIParams;
    }

    // Always use the options-based API
    [GMSNavigationServices showTermsAndConditionsDialogIfNeededWithOptions:options
                                                                  callback:^(BOOL termsAccepted) {
                                                                    resolve(@(termsAccepted));
                                                                  }];
  });
}

- (void)initializeNavigationSession:(BOOL)abnormalTerminationReportingEnabled
                taskRemovedBehavior:(double)taskRemovedBehavior
                            resolve:(RCTPromiseResolveBlock)resolve
                             reject:(RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    // Check if terms are accepted first
    if (!GMSNavigationServices.areTermsAndConditionsAccepted) {
      reject(@"termsNotAccepted",
             @"The session initialization failed, because the user has not yet accepted the "
             @"navigation terms and conditions.",
             nil);
      return;
    }

    // Set abnormal termination reporting
    [GMSNavigationServices
        setAbnormalTerminationReportingEnabled:abnormalTerminationReportingEnabled];

    // Store the promise blocks to use in initialization callback
    self->_pendingInitResolve = [resolve copy];
    self->_pendingInitReject = [reject copy];

    // Initialize the session
    @try {
      [self initializeSession];
    } @catch (NSException *exception) {
      if (self->_pendingInitReject) {
        self->_pendingInitReject(@"initializationFailed", exception.reason, nil);
        self->_pendingInitResolve = nil;
        self->_pendingInitReject = nil;
      }
    }
  });
}

- (void)cleanup:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_session == nil) {
      reject(kNoNavigatorErrorCode, kNoNavigatorErrorMessage, nil);
      return;
    }

    if (self->_session.locationSimulator != nil) {
      [self->_session.locationSimulator stopSimulation];
    }

    if (self->_session.navigator != nil) {
      [self->_session.navigator removeListener:self];
      [self->_session.navigator clearDestinations];
      self->_session.navigator.guidanceActive = NO;
      self->_session.navigator.sendsBackgroundNotifications = NO;
    }

    if (self->_session.roadSnappedLocationProvider != nil) {
      [self->_session.roadSnappedLocationProvider removeListener:self];
    }

    self->_session.started = NO;
    self->_session = nil;

    NavViewModule *navViewModule = [NavViewModule sharedInstance];
    [navViewModule navigationSessionDestroyed];

    if (_navigationSessionDisposedCallback) {
      _navigationSessionDisposedCallback();
    }
    resolve(@(YES));
  });
}

- (void)setTurnByTurnLoggingEnabled:(BOOL)isEnabled {
  dispatch_async(dispatch_get_main_queue(), ^{
    self.enableUpdateInfo = isEnabled;
  });
}

- (void)getCurrentTimeAndDistance:(RCTPromiseResolveBlock)resolve
                           reject:(RCTPromiseRejectBlock)reject {
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

- (void)startGuidance:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    GMSNavigator *navigator = nil;
    if (![self checkNavigatorWithError:reject navigator:&navigator]) {
      return;
    }
    if (self->_destinations != NULL) {
      navigator.guidanceActive = YES;
      [self onStartGuidance];
      navigator.sendsBackgroundNotifications = YES;
      resolve(@(YES));
    } else {
      reject(kNoDestinationsErrorCode, kNoDestinationsErrorMessage, nil);
    }
  });
}

- (void)stopGuidance:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    GMSNavigator *navigator = nil;
    if (![self checkNavigatorWithError:reject navigator:&navigator]) {
      return;
    }

    navigator.guidanceActive = NO;
    resolve(@(YES));
  });
}

- (void)simulateLocationsAlongExistingRoute:(LocationSimulationOptionsSpec &)options
                                    resolve:(RCTPromiseResolveBlock)resolve
                                     reject:(RCTPromiseRejectBlock)reject {
  LocationSimulationOptionsSpec optionsCopy(options);
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_destinations != nil && self->_session != nil) {
      [self->_session.locationSimulator setSpeedMultiplier:optionsCopy.speedMultiplier()];
      [self->_session.locationSimulator simulateLocationsAlongExistingRoute];
      resolve(@(YES));
    } else {
      reject(@"no_session", @"No navigation session available", nil);
    }
  });
}

- (void)stopLocationSimulation:(RCTPromiseResolveBlock)resolve
                        reject:(RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_session != nil) {
      [self->_session.locationSimulator stopSimulation];
      resolve(@(YES));
    } else {
      reject(@"no_session", @"No navigation session available", nil);
    }
  });
}

- (void)clearDestinations:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
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

- (void)continueToNextDestination:(RCTPromiseResolveBlock)resolve
                           reject:(RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    GMSNavigator *navigator = nil;
    if (![self checkNavigatorWithError:reject navigator:&navigator]) {
      return;
    }

    [navigator continueToNextDestination];
    resolve(@(YES));
  });
}

- (void)setDestinations:(NSArray *)waypoints
         routingOptions:(RoutingOptionsSpec &)routingOptions
         displayOptions:(DisplayOptionsSpec &)displayOptions
      routeTokenOptions:(RouteTokenOptionsSpec &)routeTokenOptions
                resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject {
  // Copy values before async dispatch.
  // JS always sends objects with defaults (never null), so copies are safe.
  NSArray *waypointsCopy = [waypoints copy];
  RoutingOptionsSpec routingOptionsCopy(routingOptions);
  DisplayOptionsSpec displayOptionsCopy(displayOptions);
  RouteTokenOptionsSpec routeTokenOptionsCopy(routeTokenOptions);

  __weak __typeof(self) weakSelf = self;
  dispatch_async(dispatch_get_main_queue(), ^{
    __strong __typeof(weakSelf) strongSelf = weakSelf;
    if (!strongSelf) {
      reject(@"internal_error", @"An internal error occurred", nil);
      return;
    }

    GMSNavigator *navigator = nil;
    if (![strongSelf checkNavigatorWithError:reject navigator:&navigator]) {
      return;
    }

    // Apply display options to views (only if valid flag is set)
    if (displayOptionsCopy.valid().value_or(false)) {
      std::optional<bool> showDestinationMarkers = displayOptionsCopy.showDestinationMarkers();
      std::optional<bool> showStopSigns = displayOptionsCopy.showStopSigns();
      std::optional<bool> showTrafficLights = displayOptionsCopy.showTrafficLights();
      if (showDestinationMarkers.has_value() || showStopSigns.has_value() ||
          showTrafficLights.has_value()) {
        [strongSelf applyNavigationUISettingsShowDestinationMarkers:showDestinationMarkers
                                                      showStopSigns:showStopSigns
                                                  showTrafficLights:showTrafficLights];
      }
    }

    strongSelf->_destinations = [[NSMutableArray alloc] init];

    for (NSDictionary *wp in waypointsCopy) {
      GMSNavigationMutableWaypoint *w;

      NSString *placeId = wp[@"placeId"];

      if (placeId && ![placeId isEqual:@""]) {
        w = [[GMSNavigationMutableWaypoint alloc] initWithPlaceID:placeId title:wp[@"title"]];
      } else if (wp[@"position"]) {
        w = [[GMSNavigationMutableWaypoint alloc]
            initWithLocation:[ObjectTranslationUtil getLocationCoordinateFrom:wp[@"position"]]
                       title:wp[@"title"]];
      } else {
        continue;
      }

      if (wp[@"preferSameSideOfRoad"] != nil) {
        w.preferSameSideOfRoad = [wp[@"preferSameSideOfRoad"] boolValue];
      }

      if (wp[@"vehicleStopover"] != nil) {
        w.vehicleStopover = [wp[@"vehicleStopover"] boolValue];
      }

      if (wp[@"preferredHeading"] != nil) {
        w.preferredHeading = [wp[@"preferredHeading"] intValue];
      }

      [strongSelf->_destinations addObject:w];
    }

    void (^routeStatusCallback)(GMSRouteStatus) = ^(GMSRouteStatus routeStatus) {
      __strong __typeof(weakSelf) innerStrongSelf = weakSelf;
      if (!innerStrongSelf) return;
      // Return the route status string to match codegen RouteStatusSpec enum
      NSString *status = [NavModule routeStatusToString:routeStatus];
      resolve(status);
    };

    // If valid route token options are provided, use route token for navigation
    if (routeTokenOptionsCopy.valid().value_or(false)) {
      NSString *routeToken = routeTokenOptionsCopy.routeToken();
      std::optional<double> travelMode = routeTokenOptionsCopy.travelMode();
      [strongSelf configureNavigatorWithTravelMode:navigator travelMode:travelMode];
      [navigator setDestinations:strongSelf->_destinations
                      routeToken:routeToken
                        callback:routeStatusCallback];
    } else if (routingOptionsCopy.valid().value_or(false)) {
      // Use routing options if valid
      std::optional<double> travelMode = routingOptionsCopy.travelMode();
      std::optional<bool> avoidTolls = routingOptionsCopy.avoidTolls();
      std::optional<bool> avoidFerries = routingOptionsCopy.avoidFerries();
      std::optional<bool> avoidHighways = routingOptionsCopy.avoidHighways();
      std::optional<double> routingStrategy = routingOptionsCopy.routingStrategy();
      std::optional<double> alternateRoutesStrategy = routingOptionsCopy.alternateRoutesStrategy();

      [strongSelf configureNavigatorWithTravelMode:navigator travelMode:travelMode];
      [strongSelf configureNavigatorWithAvoidOptions:navigator
                                          avoidTolls:avoidTolls
                                        avoidFerries:avoidFerries
                                       avoidHighways:avoidHighways];
      GMSNavigationRoutingOptions *gmRoutingOptions =
          [NavModule routingOptionsWithStrategy:routingStrategy
                        alternateRoutesStrategy:alternateRoutesStrategy];
      [navigator setDestinations:strongSelf->_destinations
                  routingOptions:gmRoutingOptions
                        callback:routeStatusCallback];
    } else {
      // No valid options provided, use defaults
      [navigator setDestinations:strongSelf->_destinations callback:routeStatusCallback];
    }
  });
}

- (void)applyNavigationUISettingsShowDestinationMarkers:(std::optional<bool>)showDestinationMarkers
                                          showStopSigns:(std::optional<bool>)showStopSigns
                                      showTrafficLights:(std::optional<bool>)showTrafficLights {
  for (NavViewController *viewController in
       [[NavViewModule viewControllersRegistry] objectEnumerator]) {
    if (showDestinationMarkers.has_value()) {
      [viewController setShowDestinationMarkersEnabled:showDestinationMarkers.value()];
    }
    if (showStopSigns.has_value()) {
      [viewController setShowStopSignsEnabled:showStopSigns.value()];
    }
    if (showTrafficLights.has_value()) {
      [viewController setShowTrafficLightsEnabled:showTrafficLights.value()];
    }
  }
}

+ (GMSNavigationRoutingOptions *)routingOptionsWithStrategy:(std::optional<double>)routingStrategy
                                    alternateRoutesStrategy:
                                        (std::optional<double>)alternateRoutesStrategy {
  GMSNavigationRoutingStrategy strategy = GMSNavigationRoutingStrategyDefaultBest;
  if (routingStrategy.has_value()) {
    strategy = (GMSNavigationRoutingStrategy)routingStrategy.value();
  }

  GMSNavigationMutableRoutingOptions *routingOptions =
      [[GMSNavigationMutableRoutingOptions alloc] initWithRoutingStrategy:strategy];

  if (alternateRoutesStrategy.has_value()) {
    [routingOptions setAlternateRoutesStrategy:(GMSNavigationAlternateRoutesStrategy)
                                                   alternateRoutesStrategy.value()];
  }

  return routingOptions;
}

- (void)configureNavigatorWithTravelMode:(GMSNavigator *)navigator
                              travelMode:(std::optional<double>)travelMode {
  if (travelMode.has_value()) {
    NavViewModule *navViewModule = [NavViewModule sharedInstance];
    [navViewModule setTravelMode:(GMSNavigationTravelMode)travelMode.value()];
  }
}

- (void)configureNavigatorWithAvoidOptions:(GMSNavigator *)navigator
                                avoidTolls:(std::optional<bool>)avoidTolls
                              avoidFerries:(std::optional<bool>)avoidFerries
                             avoidHighways:(std::optional<bool>)avoidHighways {
  if (avoidTolls.has_value()) {
    [navigator setAvoidsTolls:avoidTolls.value()];
  }
  if (avoidFerries.has_value()) {
    [navigator setAvoidsFerries:avoidFerries.value()];
  }
  if (avoidHighways.has_value()) {
    [navigator setAvoidsHighways:avoidHighways.value()];
  }
}

- (void)setBackgroundLocationUpdatesEnabled:(BOOL)isEnabled {
  dispatch_async(dispatch_get_main_queue(), ^{
    self->_session.roadSnappedLocationProvider.allowsBackgroundLocationUpdates = isEnabled;
  });
}

- (void)getCurrentRouteSegment:(RCTPromiseResolveBlock)resolve
                        reject:(RCTPromiseRejectBlock)reject {
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

- (void)getRouteSegments:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
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

- (void)getTraveledPath:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
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

- (void)setSpeedAlertOptions:(SpeedAlertOptionsSpec &)alertOptions
                     resolve:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject {
  SpeedAlertOptionsSpec alertOptionsCopy(alertOptions);
  dispatch_async(dispatch_get_main_queue(), ^{
    GMSNavigator *navigator = nil;
    if (![self checkNavigatorWithError:reject navigator:&navigator]) {
      return;
    }

    // Check if valid options were provided
    if (!alertOptionsCopy.valid()) {
      navigator.speedAlertOptions = nil;
      resolve(@(YES));
      return;
    }

    double minor = alertOptionsCopy.minorSpeedAlertPercentThreshold();
    double major = alertOptionsCopy.majorSpeedAlertPercentThreshold();
    double severity = alertOptionsCopy.severityUpgradeDurationSeconds();

    CGFloat minorSpeedAlertThresholdPercentage = minor;
    CGFloat majorSpeedAlertThresholdPercentage = major;
    NSTimeInterval severityUpgradeDurationSeconds = severity;

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

- (void)simulateLocation:(LatLngSpec &)location
                 resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject {
  LatLngSpec locationCopy(location);
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_session != nil) {
      CLLocationCoordinate2D coordinate =
          CLLocationCoordinate2DMake(locationCopy.lat(), locationCopy.lng());
      [self->_session.locationSimulator simulateLocationAtCoordinate:coordinate];
      resolve(@(YES));
    } else {
      reject(@"no_session", @"No navigation session available", nil);
    }
  });
}

- (void)pauseLocationSimulation:(RCTPromiseResolveBlock)resolve
                         reject:(RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_session != nil) {
      self->_session.locationSimulator.paused = YES;
      resolve(@(YES));
    } else {
      reject(@"no_session", @"No navigation session available", nil);
    }
  });
}

- (void)resumeLocationSimulation:(RCTPromiseResolveBlock)resolve
                          reject:(RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_session != nil) {
      self->_session.locationSimulator.paused = NO;
      resolve(@(YES));
    } else {
      reject(@"no_session", @"No navigation session available", nil);
    }
  });
}

- (void)areTermsAccepted:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    resolve(@(GMSNavigationServices.areTermsAndConditionsAccepted));
  });
}

- (void)getNavSDKVersion:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    resolve(GMSNavigationServices.navSDKVersion);
  });
}

- (void)setAbnormalTerminatingReportingEnabled:(BOOL)enabled {
  dispatch_async(dispatch_get_main_queue(), ^{
    [GMSNavigationServices setAbnormalTerminationReportingEnabled:enabled];
  });
}

- (void)startUpdatingLocation:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    [self->_session.roadSnappedLocationProvider startUpdatingLocation];
    resolve(@(YES));
  });
}

- (void)stopUpdatingLocation:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    [self->_session.roadSnappedLocationProvider stopUpdatingLocation];
    resolve(@(YES));
  });
}

- (void)resetTermsAccepted:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_main_queue(), ^{
    // Check if navigation session is active
    if (self->_session != nil) {
      reject(@"termsResetNotAllowed",
             @"The terms acceptance cannot be reset while the navigation session is active.", nil);
      return;
    }

    [GMSNavigationServices resetTermsAndConditionsAccepted];
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
  [self onRemainingTimeOrDistanceChangedWithNavigator:navigator];
}

// Listener for distance to next destination.
- (void)navigator:(GMSNavigator *)navigator
    didUpdateRemainingDistance:(CLLocationDistance)distance {
  [self onRemainingTimeOrDistanceChangedWithNavigator:navigator];
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
  [self emitOnLocationChanged:@{@"location" : mappedLocation}];
}

- (void)onArrival:(NSDictionary *)eventMap {
  [self emitOnArrival:@{@"arrivalEvent" : eventMap}];
}

- (void)onPromptVisibilityChange:(BOOL)visible {
  NavViewModule *navViewModule = [NavViewModule sharedInstance];
  [navViewModule informPromptVisibilityChange:visible];
}

- (void)onRemainingTimeOrDistanceChanged {
  // This method is kept for backwards compatibility
  // Use onRemainingTimeOrDistanceChangedWithNavigator: instead
}

- (void)onRemainingTimeOrDistanceChangedWithNavigator:(GMSNavigator *)navigator {
  if (!navigator.currentRouteLeg) {
    return;
  }

  GMSNavigationDelayCategory severity = navigator.delayCategoryToNextDestination;
  NSTimeInterval time = navigator.timeToNextDestination;
  CLLocationDistance distance = navigator.distanceToNextDestination;

  NSDictionary *timeAndDistance =
      @{@"delaySeverity" : @(severity), @"meters" : @(distance), @"seconds" : @(time)};

  [self emitOnRemainingTimeOrDistanceChanged:@{@"timeAndDistance" : timeAndDistance}];
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

+ (NSString *)routeStatusToString:(GMSRouteStatus)routeStatus {
  switch (routeStatus) {
    case GMSRouteStatusOK:
      return @"OK";
    case GMSRouteStatusNoRouteFound:
      return @"NO_ROUTE_FOUND";
    case GMSRouteStatusNetworkError:
      return @"NETWORK_ERROR";
    case GMSRouteStatusQuotaExceeded:
      return @"QUOTA_CHECK_FAILED";
    case GMSRouteStatusCanceled:
      return @"ROUTE_CANCELED";
    case GMSRouteStatusLocationUnavailable:
      return @"LOCATION_DISABLED";
    case GMSRouteStatusNoWaypointsError:
      return @"WAYPOINT_ERROR";
    case GMSRouteStatusWaypointError:
      return @"WAYPOINT_ERROR";
    default:
      return @"UNKNOWN";
  }
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
