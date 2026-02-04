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

#import "NavViewController.h"
#import <GoogleNavigation/GoogleNavigation.h>
#import <React/RCTLog.h>
#import <UserNotifications/UserNotifications.h>
#import "CustomTypes.h"
#import "NavModule.h"
#import "ObjectTranslationUtil.h"

@implementation NavViewController {
  GMSMapView *_mapView;
  GMSMutableCameraPosition *_camera;
  GMSCameraPosition *_initialCameraPosition;
  NSMutableDictionary<NSString *, GMSMarker *> *_markerMap;
  NSMutableDictionary<NSString *, GMSPolyline *> *_polylineMap;
  NSMutableDictionary<NSString *, GMSPolygon *> *_polygonMap;
  NSMutableDictionary<NSString *, GMSCircle *> *_circleMap;
  NSMutableDictionary<NSString *, GMSGroundOverlay *> *_groundOverlayMap;
  NSDictionary *_stylingOptions;
  NSString *_mapId;
  NSNumber *_colorScheme;
  MapViewType *_mapViewType;  // Nullable - must be set before loadView
  id<INavigationViewCallback> _viewCallbacks;
  BOOL _isSessionAttached;
  NSNumber *_isNavigationUIEnabled;
  NSNumber *_navigationUIEnabledPreference;  // 0=AUTOMATIC, 1=DISABLED
  NSNumber *_navigationLightingMode;
  NSNumber *_trafficPromptsEnabled;
}

- (instancetype)init {
  self = [super init];
  if (self) {
    _mapViewType = NULL;  // Must be set before loadView
    _navigationLightingMode = nil;
  }
  return self;
}

- (void)setMapViewType:(MapViewType)mapViewType {
  if (_mapView != nil) {
    RCTLogWarn(@"Cannot change map view type after view is loaded");
    return;
  }
  if (_mapViewType != NULL) {
    free(_mapViewType);
  }
  _mapViewType = (MapViewType *)malloc(sizeof(MapViewType));
  *_mapViewType = mapViewType;
}

- (void)loadView {
  [super loadView];

  // Assert that mapViewType has been set before loading view
  NSCAssert(_mapViewType != NULL, @"mapViewType must be set before loadView is called. Call "
                                  @"setMapViewType: before accessing the view.");

  _markerMap = [[NSMutableDictionary alloc] init];
  _polylineMap = [[NSMutableDictionary alloc] init];
  _polygonMap = [[NSMutableDictionary alloc] init];
  _circleMap = [[NSMutableDictionary alloc] init];
  _groundOverlayMap = [[NSMutableDictionary alloc] init];

  GMSMapViewOptions *options = [[GMSMapViewOptions alloc] init];

  if (_mapId && ![_mapId isEqualToString:@""]) {
    options.mapID = [GMSMapID mapIDWithIdentifier:_mapId];
  }

  // Set initial camera position if provided
  if (_initialCameraPosition) {
    options.camera = _initialCameraPosition;
  }

  _mapView = [[GMSMapView alloc] initWithOptions:options];
  if (*_mapViewType == NAVIGATION) {
    _mapView.navigationEnabled = YES;
  }
  self.view = _mapView;
  _mapView.delegate = self;
  [self applyColorScheme];
  [self applyNavigationLighting];
}

- (void)viewDidLoad {
  [super viewDidLoad];

  // Defer to next run loop to ensure view props are set before calling onMapReady
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_viewCallbacks) {
      [self->_viewCallbacks handleMapReady];
    }
    // Notify state delegate that map view is ready
    if ([self.stateDelegate respondsToSelector:@selector(navigationViewDidLoad:)]) {
      [self.stateDelegate navigationViewDidLoad:self];
    }
  });
}

- (void)viewDidLayoutSubviews {
  [super viewDidLayoutSubviews];

  [self attachToNavigationSessionIfNeeded];
}

- (BOOL)attachToNavigationSessionIfNeeded {
  // Only attach if view has proper type, state and dimensions (not zero size)
  if (_mapViewType == NULL || *_mapViewType != NAVIGATION || _isSessionAttached ||
      _mapView.bounds.size.width == 0 || _mapView.bounds.size.height == 0) {
    return NO;
  }

  NavModule *navModule = [NavModule sharedInstance];
  if (navModule == nil || ![navModule hasSession]) {
    return NO;
  }

  GMSNavigationSession *session = [navModule getSession];
  if (_mapView == nil || session == nil) {
    return NO;
  }

  // `enableNavigationWithSession` returns false if TOS is not accepted.
  // This should not be possible in normal usage as the NavModule ensures TOS acceptance before
  // navigation session creation.
  BOOL result = [_mapView enableNavigationWithSession:session];

  if (result) {
    _isSessionAttached = YES;
    _mapView.navigationUIDelegate = self;
    [self applyStylingOptions];
    [self restoreNavigationUIState];
    [self applyTrafficPromptsSetting];
    [self forceInvalidateView];

    // Notify state delegate that session is attached
    if ([self.stateDelegate respondsToSelector:@selector(navigationViewDidAttachSession:)]) {
      [self.stateDelegate navigationViewDidAttachSession:self];
    }
  }

  return result;
}

- (void)forceInvalidateView {
  if (_mapView) {
    // Defer to next run loop to ensure view is properly sized
    dispatch_async(dispatch_get_main_queue(), ^{
      if (self->_mapView) {
        [self->_mapView setNeedsLayout];
        [self->_mapView.layer setNeedsDisplay];
      }
    });
  }
}

- (void)restoreNavigationUIState {
  if (_mapView) {
    // Explicit setting via _isNavigationUIEnabled takes precedence
    if (_isNavigationUIEnabled != nil) {
      _mapView.navigationEnabled = [_isNavigationUIEnabled boolValue];
    } else if (_navigationUIEnabledPreference != nil) {
      // Apply navigation UI preference:
      // - AUTOMATIC (0): Enable if session is attached and view type is NAVIGATION
      // - DISABLED (1): Keep disabled
      if ([_navigationUIEnabledPreference intValue] == 0) {  // AUTOMATIC
        // Enable UI only if session is attached and view type is NAVIGATION
        _mapView.navigationEnabled = (_isSessionAttached);
      } else {  // DISABLED (1)
        _mapView.navigationEnabled = NO;
      }
    } else {
      // Default behavior: enable if view type is NAVIGATION
      _mapView.navigationEnabled = (_mapViewType != NULL && *_mapViewType == NAVIGATION);
    }
  }
}

- (void)applyTrafficPromptsSetting {
  if (_trafficPromptsEnabled == nil || _mapView == nil) {
    return;
  }

  GMSNavigator *navigator = _mapView.navigator;
  if (navigator == nil) {
    return;
  }

  navigator.shouldDisplayPrompts = [_trafficPromptsEnabled boolValue];
}

- (void)setTrafficPromptsEnabled:(BOOL)isEnabled {
  _trafficPromptsEnabled = @(isEnabled);
  [self applyTrafficPromptsSetting];
}

- (void)onNavigationSessionReady {
  // Called when navigation session becomes ready - attempt to attach
  [self attachToNavigationSessionIfNeeded];
}

- (void)detachFromNavigationSession {
  _isSessionAttached = NO;
  if (_mapView) {
    _mapView.navigationUIDelegate = nil;
    _mapView.navigationEnabled = NO;
  }
}

- (void)cleanup {
  _isSessionAttached = NO;

  // Remove all delegates to break retain cycles
  if (_mapView) {
    _mapView.delegate = nil;
    _mapView.navigationUIDelegate = nil;
    _mapView.navigationEnabled = NO;
    [_mapView clear];

    [_mapView removeFromSuperview];
    _mapView = nil;
  }

  // Clear local dictionaries and set to nil
  [_markerMap removeAllObjects];
  [_polylineMap removeAllObjects];
  [_polygonMap removeAllObjects];
  [_circleMap removeAllObjects];
  [_groundOverlayMap removeAllObjects];

  _markerMap = nil;
  _polylineMap = nil;
  _polygonMap = nil;
  _circleMap = nil;
  _groundOverlayMap = nil;

  // Free mapViewType
  if (_mapViewType != NULL) {
    free(_mapViewType);
    _mapViewType = NULL;
  }

  _trafficPromptsEnabled = nil;

  // Clear callbacks
  _viewCallbacks = nil;
}

- (void)dealloc {
  [self cleanup];
  [self.view removeFromSuperview];
  self.view = nil;
}

- (void)mapViewDidTapRecenterButton:(GMSMapView *)mapView {
  [_viewCallbacks handleRecenterButtonClick];
}

- (void)mapView:(GMSMapView *)mapView didTapInfoWindowOfMarker:(GMSMarker *)marker {
  [_viewCallbacks handleMarkerInfoWindowTapped:marker];
}

- (void)mapView:(GMSMapView *)mapView didTapAtCoordinate:(CLLocationCoordinate2D)coordinate {
  [_viewCallbacks
      handleMapClick:[ObjectTranslationUtil transformCoordinateToDictionary:coordinate]];
}

- (BOOL)mapView:(GMSMapView *)mapView didTapMarker:(GMSMarker *)marker {
  [_viewCallbacks handleMarkerClick:marker];
  return FALSE;
}

- (void)mapView:(GMSMapView *)mapView didTapOverlay:(GMSOverlay *)overlay {
  if ([overlay isKindOfClass:[GMSPolyline class]]) {
    GMSPolyline *polyline = (GMSPolyline *)overlay;
    [_viewCallbacks handlePolylineClick:polyline];
  } else if ([overlay isKindOfClass:[GMSPolygon class]]) {
    GMSPolygon *polygon = (GMSPolygon *)overlay;
    [_viewCallbacks handlePolygonClick:polygon];
  } else if ([overlay isKindOfClass:[GMSCircle class]]) {
    GMSCircle *circle = (GMSCircle *)overlay;
    [_viewCallbacks handleCircleClick:circle];
  } else if ([overlay isKindOfClass:[GMSGroundOverlay class]]) {
    GMSGroundOverlay *groundOverlay = (GMSGroundOverlay *)overlay;
    [_viewCallbacks handleGroundOverlayClick:groundOverlay];
  }
}

- (void)setStylingOptions:(nonnull NSDictionary *)stylingOptions {
  _stylingOptions = stylingOptions;
  [self applyStylingOptions];
}

- (void)setMapId:(NSString *)mapId {
  if (_mapView != nil) {
    RCTLogWarn(@"Cannot change mapId after view is loaded");
    return;
  }
  _mapId = mapId;
}

- (void)setColorScheme:(NSNumber *)colorScheme {
  _colorScheme = colorScheme;
  [self applyColorScheme];
  [self applyNavigationLighting];
}

- (void)setInitialCameraPosition:(GMSCameraPosition *)cameraPosition {
  if (_mapView != nil) {
    RCTLogWarn(@"Cannot set initial camera position after view is loaded");
    return;
  }
  _initialCameraPosition = cameraPosition;
}

- (void)applyColorScheme {
  if (_mapView == nil) {
    return;
  }
  UIUserInterfaceStyle style = UIUserInterfaceStyleUnspecified;
  if (_colorScheme) {
    NSInteger colorSchemeValue = [_colorScheme integerValue];
    if (colorSchemeValue == 1) {
      style = UIUserInterfaceStyleLight;
    } else if (colorSchemeValue == 2) {
      style = UIUserInterfaceStyleDark;
    }
  }
  _mapView.overrideUserInterfaceStyle = style;
}

- (void)applyNavigationLighting {
  if (_mapViewType == NULL || *_mapViewType != NAVIGATION || _mapView == nil) {
    return;
  }

  if (_navigationLightingMode == nil) {
    // Allow the SDK to determine the lighting mode automatically.
    // Use performSelector to pass nil as it's not possible to pass nil directly in Objective-C++
    if ([_mapView respondsToSelector:@selector(setLightingMode:)]) {
      [_mapView performSelector:@selector(setLightingMode:) withObject:nil];
    }
    return;
  }

  GMSNavigationLightingMode mode =
      (GMSNavigationLightingMode)[_navigationLightingMode integerValue];

  [_mapView setLightingMode:mode];
}

- (void)applyStylingOptions {
  // Styling options only apply to navigation views
  if (_mapViewType == NULL || *_mapViewType != NAVIGATION || _mapView == nil) {
    return;
  }

  if (_stylingOptions && [_stylingOptions isKindOfClass:[NSDictionary class]]) {
    if (_stylingOptions[@"navigationHeaderPrimaryBackgroundColor"] != nil) {
      NSNumber *colorInt = _stylingOptions[@"navigationHeaderPrimaryBackgroundColor"];
      _mapView.settings.navigationHeaderPrimaryBackgroundColor =
          [UIColor colorWithColorInt:colorInt];
    }

    if (_stylingOptions[@"navigationHeaderSecondaryBackgroundColor"] != nil) {
      NSNumber *colorInt = _stylingOptions[@"navigationHeaderSecondaryBackgroundColor"];
      _mapView.settings.navigationHeaderSecondaryBackgroundColor =
          [UIColor colorWithColorInt:colorInt];
    }

    if (_stylingOptions[@"navigationHeaderPrimaryBackgroundColorNightMode"] != nil) {
      NSNumber *colorInt = _stylingOptions[@"navigationHeaderPrimaryBackgroundColorNightMode"];
      _mapView.settings.navigationHeaderPrimaryBackgroundColorNightMode =
          [UIColor colorWithColorInt:colorInt];
    }

    if (_stylingOptions[@"navigationHeaderSecondaryBackgroundColorNightMode"] != nil) {
      NSNumber *colorInt = _stylingOptions[@"navigationHeaderSecondaryBackgroundColorNightMode"];
      _mapView.settings.navigationHeaderSecondaryBackgroundColorNightMode =
          [UIColor colorWithColorInt:colorInt];
    }

    if (_stylingOptions[@"navigationHeaderLargeManeuverIconColor"] != nil) {
      NSNumber *colorInt = _stylingOptions[@"navigationHeaderLargeManeuverIconColor"];
      _mapView.settings.navigationHeaderLargeManeuverIconColor =
          [UIColor colorWithColorInt:colorInt];
    }

    if (_stylingOptions[@"navigationHeaderSmallManeuverIconColor"] != nil) {
      NSNumber *colorInt = _stylingOptions[@"navigationHeaderSmallManeuverIconColor"];
      _mapView.settings.navigationHeaderSmallManeuverIconColor =
          [UIColor colorWithColorInt:colorInt];
    }

    if (_stylingOptions[@"navigationHeaderGuidanceRecommendedLaneColor"] != nil) {
      NSNumber *colorInt = _stylingOptions[@"navigationHeaderGuidanceRecommendedLaneColor"];
      _mapView.settings.navigationHeaderGuidanceRecommendedLaneColor =
          [UIColor colorWithColorInt:colorInt];
    }

    if (_stylingOptions[@"navigationHeaderNextStepTextColor"] != nil) {
      NSNumber *colorInt = _stylingOptions[@"navigationHeaderNextStepTextColor"];
      _mapView.settings.navigationHeaderNextStepTextColor = [UIColor colorWithColorInt:colorInt];
    }

    if (_stylingOptions[@"navigationHeaderDistanceValueTextColor"] != nil) {
      NSNumber *colorInt = _stylingOptions[@"navigationHeaderDistanceValueTextColor"];
      _mapView.settings.navigationHeaderDistanceValueTextColor =
          [UIColor colorWithColorInt:colorInt];
    }

    if (_stylingOptions[@"navigationHeaderDistanceUnitsTextColor"] != nil) {
      NSNumber *colorInt = _stylingOptions[@"navigationHeaderDistanceUnitsTextColor"];
      _mapView.settings.navigationHeaderDistanceUnitsTextColor =
          [UIColor colorWithColorInt:colorInt];
    }

    if (_stylingOptions[@"navigationHeaderInstructionsTextColor"] != nil) {
      NSNumber *colorInt = _stylingOptions[@"navigationHeaderInstructionsTextColor"];
      _mapView.settings.navigationHeaderInstructionsTextColor =
          [UIColor colorWithColorInt:colorInt];
    }
  }
}

- (void)setZoomLevel:(nonnull NSNumber *)level {
  [_mapView animateToZoom:[level floatValue]];
}

- (void)setNavigationUIEnabled:(BOOL)isEnabled {
  if (_mapViewType == NULL || *_mapViewType != NAVIGATION) {
    return;
  }
  _isNavigationUIEnabled = @(isEnabled);
  _mapView.navigationEnabled = isEnabled;
}

- (void)setNavigationUIEnabledPreference:(int)preference {
  _navigationUIEnabledPreference = @(preference);
}

- (void)getCameraPosition:(OnDictionaryResult)completionBlock {
  GMSCameraPosition *cam = _mapView.camera;
  CLLocationCoordinate2D cameraPosition = _mapView.camera.target;

  NSMutableDictionary *map = [[NSMutableDictionary alloc] init];
  map[@"bearing"] = @(cam.bearing);
  map[@"tilt"] = @(cam.viewingAngle);
  map[@"zoom"] = @(cam.zoom);

  map[@"target"] = @{@"lat" : @(cameraPosition.latitude), @"lng" : @(cameraPosition.longitude)};

  completionBlock(map);
}

- (void)getMyLocation:(OnDictionaryResult)completionBlock {
  CLLocation *userLocation = _mapView.myLocation;

  if (userLocation != nil) {
    completionBlock([ObjectTranslationUtil transformCLLocationToDictionary:userLocation]);
  } else {
    completionBlock(nil);
  }
}

- (void)getUiSettings:(OnDictionaryResult)completionBlock {
  GMSUISettings *uiSettings = _mapView.settings;

  NSMutableDictionary *map = [[NSMutableDictionary alloc] init];
  map[@"isCompassEnabled"] = @(uiSettings.compassButton);
  map[@"isIndoorLevelPickerEnabled"] = @(uiSettings.indoorPicker);
  map[@"isRotateGesturesEnabled"] = @(uiSettings.rotateGestures);
  map[@"isScrollGesturesEnabled"] = @(uiSettings.scrollGestures);
  map[@"isScrollGesturesEnabledDuringRotateOrZoom"] =
      @(uiSettings.allowScrollGesturesDuringRotateOrZoom);
  map[@"isTiltGesturesEnabled"] = @(uiSettings.tiltGestures);
  map[@"isZoomGesturesEnabled"] = @(uiSettings.zoomGestures);

  completionBlock(map);
}

- (void)isMyLocationEnabled:(OnBooleanResult)completionBlock {
  completionBlock(_mapView.isMyLocationEnabled);
}

- (void)moveCamera:(GMSCameraPosition *)position {
  _mapView.camera = position;
}

- (void)setNightMode:(NSNumber *)index {
  NSInteger modeValue = index != nil ? [index integerValue] : 0;
  if (modeValue == 1) {
    _navigationLightingMode = @(GMSNavigationLightingModeNormal);
  } else if (modeValue == 2) {
    _navigationLightingMode = @(GMSNavigationLightingModeLowLight);
  } else {
    // Resets to SDK-managed lighting.
    _navigationLightingMode = nil;
  }
  [self applyNavigationLighting];
}

- (void)showRouteOverview {
  _mapView.cameraMode = GMSNavigationCameraModeOverview;
}

- (void)setTripProgressBarEnabled:(BOOL)isEnabled {
  [_mapView.settings setNavigationTripProgressBarEnabled:isEnabled];
}

- (void)setReportIncidentButtonEnabled:(BOOL)isEnabled {
  _mapView.settings.navigationReportIncidentButtonEnabled = isEnabled;
}

- (void)setMyLocationButtonEnabled:(BOOL)isEnabled {
  [_mapView.settings setMyLocationButton:isEnabled];
}

- (void)setShowDestinationMarkersEnabled:(BOOL)isEnabled {
  [_mapView.settings setShowsDestinationMarkers:isEnabled];
}

- (void)setShowTrafficLightsEnabled:(BOOL)isEnabled {
  // setShowsTrafficLights: is deprecated in Google Maps SDK 10.1.0+.
  // Traffic lights are shown by default.
  if ([_mapView.settings respondsToSelector:@selector(setShowsTrafficLights:)]) {
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
    [_mapView.settings setShowsTrafficLights:isEnabled];
#pragma clang diagnostic pop
  }
}

- (void)setShowStopSignsEnabled:(BOOL)isEnabled {
  // setShowStopSignsEnabled: is deprecated in Google Maps SDK 10.1.0+.
  // Stop signs are shown by default.
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
  [_mapView.settings setShowsStopSigns:isEnabled];
#pragma clang diagnostic pop
}

- (void)setMyLocationEnabled:(BOOL)isEnabled {
  _mapView.myLocationEnabled = isEnabled;
}

- (void)setFollowingPerspective:(NSNumber *)index {
  if ([index isEqual:@1]) {
    [_mapView setFollowingPerspective:GMSNavigationCameraPerspectiveTopDownNorthUp];
  } else if ([index isEqual:@2]) {
    [_mapView setFollowingPerspective:GMSNavigationCameraPerspectiveTopDownHeadingUp];
  } else {
    [_mapView setFollowingPerspective:GMSNavigationCameraPerspectiveTilted];
  }
  _mapView.cameraMode = GMSNavigationCameraModeFollowing;
}

- (void)setSpeedometerEnabled:(BOOL)isEnabled {
  NSLog(@"NavViewController setSpeedometerEnabled: %d, mapView: %@", isEnabled, _mapView);
  [_mapView setShouldDisplaySpeedometer:isEnabled];
}

- (void)setSpeedLimitIconEnabled:(BOOL)isEnabled {
  NSLog(@"NavViewController setSpeedLimitIconEnabled: %d, mapView: %@", isEnabled, _mapView);
  [_mapView setShouldDisplaySpeedLimit:isEnabled];
}

#pragma mark - View Controller functions

- (void)onPromptVisibilityChange:(BOOL)isVisible {
  [_viewCallbacks handlePromptVisibilityChanged:isVisible];
}

- (void)preferredContentSizeDidChangeForChildContentContainer:
    (nonnull id<UIContentContainer>)container {
}

- (void)viewWillTransitionToSize:(CGSize)size
       withTransitionCoordinator:(nonnull id<UIViewControllerTransitionCoordinator>)coordinator {
}

- (void)setNavigationViewCallbacks:(nonnull id<INavigationViewCallback>)fn {
  _viewCallbacks = fn;
}

// Maps SDK
- (void)setTravelMode:(GMSNavigationTravelMode)travelMode {
  [_mapView setTravelMode:travelMode];
}

- (void)setIndoorEnabled:(BOOL)isEnabled {
  [_mapView setIndoorEnabled:isEnabled];
}

- (void)setIndoorLevelPickerEnabled:(BOOL)isEnabled {
  [_mapView.settings setIndoorPicker:isEnabled];
}

- (void)setTrafficEnabled:(BOOL)isEnabled {
  [_mapView setTrafficEnabled:isEnabled];
}

- (void)setBuildingsEnabled:(BOOL)isEnabled {
  [_mapView setBuildingsEnabled:isEnabled];
}

- (void)setCompassEnabled:(BOOL)isEnabled {
  [_mapView.settings setCompassButton:isEnabled];
}

- (void)setRotateGesturesEnabled:(BOOL)isEnabled {
  [_mapView.settings setRotateGestures:isEnabled];
}

- (void)setScrollGesturesEnabled:(BOOL)isEnabled {
  [_mapView.settings setScrollGestures:isEnabled];
}

- (void)setScrollGesturesEnabledDuringRotateOrZoom:(BOOL)isEnabled {
  [_mapView.settings setAllowScrollGesturesDuringRotateOrZoom:isEnabled];
}

- (void)setTiltGesturesEnabled:(BOOL)isEnabled {
  [_mapView.settings setTiltGestures:isEnabled];
}

- (void)setZoomGesturesEnabled:(BOOL)isEnabled {
  [_mapView.settings setZoomGestures:isEnabled];
}

- (void)setTrafficIncidentCardsEnabled:(BOOL)isEnabled {
  _mapView.settings.showsIncidentCards = isEnabled;
}

- (void)setHeaderEnabled:(BOOL)isEnabled {
  NSLog(@"NavViewController setHeaderEnabled: %d, mapView: %@, settings: %@", isEnabled, _mapView,
        _mapView.settings);
  [_mapView.settings setNavigationHeaderEnabled:isEnabled];
}

- (void)setFooterEnabled:(BOOL)isEnabled {
  NSLog(@"NavViewController setFooterEnabled: %d, mapView: %@, settings: %@", isEnabled, _mapView,
        _mapView.settings);
  [_mapView.settings setNavigationFooterEnabled:isEnabled];
}

- (void)setRecenterButtonEnabled:(BOOL)isEnabled {
  _mapView.settings.recenterButtonEnabled = isEnabled;
}

- (void)resetMinMaxZoomLevel {
  [_mapView setMinZoom:kGMSMinZoomLevel maxZoom:kGMSMaxZoomLevel];
}

- (void)animateCamera:(GMSCameraUpdate *)update {
  [_mapView animateWithCameraUpdate:update];
}

- (void)setMapStyle:(GMSMapStyle *)mapStyle {
  [_mapView setMapStyle:mapStyle];
}

- (GMSMapView *)mapView {
  return _mapView;
}

- (void)setMapType:(GMSMapViewType)mapType {
  [_mapView setMapType:mapType];
}

- (void)clearMapView {
  [_mapView clear];
  [_markerMap removeAllObjects];
  [_polylineMap removeAllObjects];
  [_polygonMap removeAllObjects];
  [_circleMap removeAllObjects];
  [_groundOverlayMap removeAllObjects];
}

- (NSString *)getEffectiveIdFromUserData:(id)userData {
  if ([ObjectTranslationUtil isIdOnUserData:userData]) {
    return userData[0];
  }
  return nil;
}

- (void)addCircle:(GMSCircle *)circle
          visible:(BOOL)visible
           result:(OnDictionaryResult)completionBlock {
  NSString *effectiveId = [self getEffectiveIdFromUserData:circle.userData];

  // If ID provided and object exists, update it instead of creating new
  if (effectiveId && _circleMap[effectiveId]) {
    GMSCircle *existingCircle = _circleMap[effectiveId];
    [ObjectTranslationUtil updateCircle:existingCircle
                                 center:circle.position
                                 radius:circle.radius
                            strokeWidth:circle.strokeWidth
                            strokeColor:circle.strokeColor
                              fillColor:circle.fillColor
                              clickable:circle.tappable
                                 zIndex:@(circle.zIndex)];
    existingCircle.map = visible ? _mapView : nil;
    completionBlock([ObjectTranslationUtil transformCircleToDictionary:existingCircle]);
    return;
  }

  // Create new circle
  circle.map = visible ? _mapView : nil;
  circle.tappable = YES;

  // Generate ID if not provided
  if (!effectiveId) {
    effectiveId = [[NSUUID UUID] UUIDString];
    circle.userData = @[ effectiveId ];
  }

  _circleMap[effectiveId] = circle;
  completionBlock([ObjectTranslationUtil transformCircleToDictionary:circle]);
}

- (void)addMarker:(GMSMarker *)marker
          visible:(BOOL)visible
           result:(OnDictionaryResult)completionBlock {
  NSString *effectiveId = [self getEffectiveIdFromUserData:marker.userData];

  // If ID provided and object exists, update it instead of creating new
  if (effectiveId && _markerMap[effectiveId]) {
    GMSMarker *existingMarker = _markerMap[effectiveId];
    [ObjectTranslationUtil updateMarker:existingMarker
                                  title:marker.title
                                snippet:marker.snippet
                                  alpha:marker.opacity
                               rotation:marker.rotation
                                   flat:marker.flat
                              draggable:marker.draggable
                                   icon:marker.icon
                                 zIndex:@(marker.zIndex)
                               position:marker.position];
    existingMarker.map = visible ? _mapView : nil;
    completionBlock([ObjectTranslationUtil transformMarkerToDictionary:existingMarker]);
    return;
  }

  // Create new marker
  marker.map = visible ? _mapView : nil;
  marker.tappable = YES;

  // Generate ID if not provided
  if (!effectiveId) {
    effectiveId = [[NSUUID UUID] UUIDString];
    marker.userData = @[ effectiveId ];
  }

  _markerMap[effectiveId] = marker;
  completionBlock([ObjectTranslationUtil transformMarkerToDictionary:marker]);
}

- (void)addPolygon:(GMSPolygon *)polygon
           visible:(BOOL)visible
            result:(OnDictionaryResult)completionBlock {
  NSString *effectiveId = [self getEffectiveIdFromUserData:polygon.userData];

  // If ID provided and object exists, update it instead of creating new
  if (effectiveId && _polygonMap[effectiveId]) {
    GMSPolygon *existingPolygon = _polygonMap[effectiveId];
    [ObjectTranslationUtil updatePolygon:existingPolygon
                                    path:polygon.path
                                   holes:polygon.holes
                               fillColor:polygon.fillColor
                             strokeColor:polygon.strokeColor
                             strokeWidth:polygon.strokeWidth
                                geodesic:polygon.geodesic
                               clickable:polygon.tappable
                                  zIndex:@(polygon.zIndex)];
    existingPolygon.map = visible ? _mapView : nil;
    completionBlock([ObjectTranslationUtil transformPolygonToDictionary:existingPolygon]);
    return;
  }

  // Create new polygon
  polygon.map = visible ? _mapView : nil;
  polygon.tappable = YES;

  // Generate ID if not provided
  if (!effectiveId) {
    effectiveId = [[NSUUID UUID] UUIDString];
    polygon.userData = @[ effectiveId ];
  }

  _polygonMap[effectiveId] = polygon;
  completionBlock([ObjectTranslationUtil transformPolygonToDictionary:polygon]);
}

- (void)addPolyline:(GMSPolyline *)polyline
            visible:(BOOL)visible
             result:(OnDictionaryResult)completionBlock {
  NSString *effectiveId = [self getEffectiveIdFromUserData:polyline.userData];

  // If ID provided and object exists, update it instead of creating new
  if (effectiveId && _polylineMap[effectiveId]) {
    GMSPolyline *existingPolyline = _polylineMap[effectiveId];
    [ObjectTranslationUtil updatePolyline:existingPolyline
                                     path:polyline.path
                                    width:polyline.strokeWidth
                                    color:polyline.strokeColor
                                clickable:polyline.tappable
                                   zIndex:@(polyline.zIndex)];
    existingPolyline.map = visible ? _mapView : nil;
    completionBlock([ObjectTranslationUtil transformPolylineToDictionary:existingPolyline]);
    return;
  }

  // Create new polyline
  polyline.map = visible ? _mapView : nil;
  polyline.tappable = YES;

  // Generate ID if not provided
  if (!effectiveId) {
    effectiveId = [[NSUUID UUID] UUIDString];
    polyline.userData = @[ effectiveId ];
  }

  _polylineMap[effectiveId] = polyline;
  completionBlock([ObjectTranslationUtil transformPolylineToDictionary:polyline]);
}

- (void)addGroundOverlay:(GMSGroundOverlay *)groundOverlay
                 visible:(BOOL)visible
                  result:(OnDictionaryResult)completionBlock {
  NSString *effectiveId = [self getEffectiveIdFromUserData:groundOverlay.userData];

  // If ID provided and object exists, update it
  // Note: GroundOverlay position/bounds/image cannot be changed after creation,
  // so we only update properties that can be modified
  if (effectiveId && _groundOverlayMap[effectiveId]) {
    GMSGroundOverlay *existingOverlay = _groundOverlayMap[effectiveId];

    // Check if position/bounds/image would need to change (requires recreation)
    // For now, we'll update mutable properties and recreate if bounds differ
    BOOL needsRecreation = NO;

    // Check if bounds differ (simplified check - bounds recreation needed)
    if (groundOverlay.bounds && existingOverlay.bounds) {
      if (groundOverlay.bounds.northEast.latitude != existingOverlay.bounds.northEast.latitude ||
          groundOverlay.bounds.northEast.longitude != existingOverlay.bounds.northEast.longitude ||
          groundOverlay.bounds.southWest.latitude != existingOverlay.bounds.southWest.latitude ||
          groundOverlay.bounds.southWest.longitude != existingOverlay.bounds.southWest.longitude) {
        needsRecreation = YES;
      }
    }

    if (needsRecreation) {
      // Remove old overlay and add new one
      existingOverlay.map = nil;
      [_groundOverlayMap removeObjectForKey:effectiveId];

      groundOverlay.map = visible ? _mapView : nil;
      groundOverlay.tappable = YES;
      _groundOverlayMap[effectiveId] = groundOverlay;
      completionBlock([ObjectTranslationUtil transformGroundOverlayToDictionary:groundOverlay]);
    } else {
      // Update mutable properties only
      [ObjectTranslationUtil updateGroundOverlay:existingOverlay
                                         bearing:groundOverlay.bearing
                                    transparency:(1.0 - groundOverlay.opacity)
                                       clickable:groundOverlay.tappable
                                          zIndex:@((int)groundOverlay.zIndex)];
      existingOverlay.map = visible ? _mapView : nil;
      completionBlock([ObjectTranslationUtil transformGroundOverlayToDictionary:existingOverlay]);
    }
    return;
  }

  // Create new ground overlay
  groundOverlay.map = visible ? _mapView : nil;
  groundOverlay.tappable = YES;

  // Generate ID if not provided
  if (!effectiveId) {
    effectiveId = [[NSUUID UUID] UUIDString];
    groundOverlay.userData = @[ effectiveId ];
  }

  _groundOverlayMap[effectiveId] = groundOverlay;
  completionBlock([ObjectTranslationUtil transformGroundOverlayToDictionary:groundOverlay]);
}

- (void)removeMarker:(NSString *)markerId {
  GMSMarker *marker = _markerMap[markerId];
  if (marker) {
    marker.map = nil;
    [_markerMap removeObjectForKey:markerId];
  }
}

- (void)removePolyline:(NSString *)polylineId {
  GMSPolyline *polyline = _polylineMap[polylineId];
  if (polyline) {
    polyline.map = nil;
    [_polylineMap removeObjectForKey:polylineId];
  }
}

- (void)removePolygon:(NSString *)polygonId {
  GMSPolygon *polygon = _polygonMap[polygonId];
  if (polygon) {
    polygon.map = nil;
    [_polygonMap removeObjectForKey:polygonId];
  }
}

- (void)removeCircle:(NSString *)circleId {
  GMSCircle *circle = _circleMap[circleId];
  if (circle) {
    circle.map = nil;
    [_circleMap removeObjectForKey:circleId];
  }
}

- (void)removeGroundOverlay:(NSString *)overlayId {
  GMSGroundOverlay *overlay = _groundOverlayMap[overlayId];
  if (overlay) {
    overlay.map = nil;
    [_groundOverlayMap removeObjectForKey:overlayId];
  }
}

- (void)setPadding:(UIEdgeInsets)insets {
  _mapView.padding = insets;
}

- (void)setMinZoomLevel:(float)minLevel maxZoom:(float)maxLevel {
  // Use default values if -1 is provided
  float effectiveMinLevel = (minLevel < 0.0f) ? kGMSMinZoomLevel : minLevel;
  float effectiveMaxLevel = (maxLevel < 0.0f) ? kGMSMaxZoomLevel : maxLevel;
  [_mapView setMinZoom:effectiveMinLevel maxZoom:effectiveMaxLevel];
}

- (void)animateCamera:(GMSCameraUpdate *)update result:(OnBooleanResult)completionBlock {
  [_mapView animateWithCameraUpdate:update];
  if (completionBlock) {
    completionBlock(YES);
  }
}

- (NSArray<NSDictionary *> *)getMarkers {
  NSMutableArray<NSDictionary *> *result = [[NSMutableArray alloc] init];
  for (NSString *key in _markerMap) {
    [result addObject:[ObjectTranslationUtil transformMarkerToDictionary:_markerMap[key]]];
  }
  return result;
}

- (NSArray<NSDictionary *> *)getCircles {
  NSMutableArray<NSDictionary *> *result = [[NSMutableArray alloc] init];
  for (NSString *key in _circleMap) {
    [result addObject:[ObjectTranslationUtil transformCircleToDictionary:_circleMap[key]]];
  }
  return result;
}

- (NSArray<NSDictionary *> *)getPolylines {
  NSMutableArray<NSDictionary *> *result = [[NSMutableArray alloc] init];
  for (NSString *key in _polylineMap) {
    [result addObject:[ObjectTranslationUtil transformPolylineToDictionary:_polylineMap[key]]];
  }
  return result;
}

- (NSArray<NSDictionary *> *)getPolygons {
  NSMutableArray<NSDictionary *> *result = [[NSMutableArray alloc] init];
  for (NSString *key in _polygonMap) {
    [result addObject:[ObjectTranslationUtil transformPolygonToDictionary:_polygonMap[key]]];
  }
  return result;
}

- (NSArray<NSDictionary *> *)getGroundOverlays {
  NSMutableArray<NSDictionary *> *result = [[NSMutableArray alloc] init];
  for (NSString *key in _groundOverlayMap) {
    [result addObject:[ObjectTranslationUtil
                          transformGroundOverlayToDictionary:_groundOverlayMap[key]]];
  }
  return result;
}

@end
