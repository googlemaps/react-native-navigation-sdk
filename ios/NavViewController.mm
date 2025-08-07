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
#import "NavModule.h"
#import "ObjectTranslationUtil.h"

#import <GoogleNavigation/GoogleNavigation.h>

@implementation NavViewController {
  GMSMapView *_mapView;
  GMSMutableCameraPosition *_camera;
  NSMutableArray<GMSMarker *> *_markerList;
  NSMutableArray<GMSPolyline *> *_polylineList;
  NSMutableArray<GMSPolygon *> *_polygonList;
  NSMutableArray<GMSCircle *> *_circleList;
  NSMutableArray<GMSGroundOverlay *> *_groundOverlayList;
  NSDictionary *_stylingOptions;
}

@synthesize callbacks = _callbacks;

- (void)loadView {
  [super loadView];

  _markerList = [[NSMutableArray alloc] init];
  _polylineList = [[NSMutableArray alloc] init];
  _polygonList = [[NSMutableArray alloc] init];
  _circleList = [[NSMutableArray alloc] init];
  _groundOverlayList = [[NSMutableArray alloc] init];

  self->_mapView = [[GMSMapView alloc] initWithFrame:CGRectZero];

  self.view = self->_mapView;
  self->_mapView.delegate = self;

  NavModule *navModule = [NavModule sharedInstance];
  if (navModule != nil && [navModule hasSession]) {
    [self attachToNavigationSession:[navModule getSession]];
  }
  dispatch_async(dispatch_get_main_queue(), ^{
    [self.callbacks handleMapReady];
  });
}

- (void)mapViewDidTapRecenterButton:(GMSMapView *)mapView {
  [self.callbacks handleRecenterButtonClick];
}

- (void)mapView:(GMSMapView *)mapView didTapInfoWindowOfMarker:(GMSMarker *)marker {
  [self.callbacks handleMarkerInfoWindowTapped:marker];
}

- (void)mapView:(GMSMapView *)mapView didTapAtCoordinate:(CLLocationCoordinate2D)coordinate {
  [self.callbacks handleMapClick:coordinate.latitude lng:coordinate.longitude];
}

- (BOOL)mapView:(GMSMapView *)mapView didTapMarker:(GMSMarker *)marker {
  [self.callbacks handleMarkerClick:marker];
  return FALSE;
}

- (void)mapView:(GMSMapView *)mapView didTapOverlay:(GMSOverlay *)overlay {
  if ([overlay isKindOfClass:[GMSPolyline class]]) {
    GMSPolyline *polyline = (GMSPolyline *)overlay;
    [self.callbacks handlePolylineClick:polyline];
  } else if ([overlay isKindOfClass:[GMSPolygon class]]) {
    GMSPolygon *polygon = (GMSPolygon *)overlay;
    [self.callbacks handlePolygonClick:polygon];
  } else if ([overlay isKindOfClass:[GMSCircle class]]) {
    GMSCircle *circle = (GMSCircle *)overlay;
    [self.callbacks handleCircleClick:circle];
  } else if ([overlay isKindOfClass:[GMSGroundOverlay class]]) {
    GMSGroundOverlay *groundOverlay = (GMSGroundOverlay *)overlay;
    [self.callbacks handleGroundOverlayClick:groundOverlay];
  }
}

- (void)setStylingOptions:(nonnull NSDictionary *)stylingOptions {
  _stylingOptions = stylingOptions;
  [self applyStylingOptions];
}

- (void)applyStylingOptions {
  if (_stylingOptions) {
    if (_stylingOptions[@"navigationHeaderPrimaryBackgroundColor"] != nil) {
      NSString *hexString = _stylingOptions[@"navigationHeaderPrimaryBackgroundColor"];
      _mapView.settings.navigationHeaderPrimaryBackgroundColor =
          [ObjectTranslationUtil colorFromHexString:hexString];
    }

    if (_stylingOptions[@"navigationHeaderSecondaryBackgroundColor"] != nil) {
      NSString *hexString = _stylingOptions[@"navigationHeaderSecondaryBackgroundColor"];
      _mapView.settings.navigationHeaderSecondaryBackgroundColor =
          [ObjectTranslationUtil colorFromHexString:hexString];
    }

    if (_stylingOptions[@"navigationHeaderPrimaryBackgroundColorNightMode"] != nil) {
      NSString *hexString = _stylingOptions[@"navigationHeaderPrimaryBackgroundColorNightMode"];
      _mapView.settings.navigationHeaderPrimaryBackgroundColorNightMode =
          [ObjectTranslationUtil colorFromHexString:hexString];
    }

    if (_stylingOptions[@"navigationHeaderSecondaryBackgroundColorNightMode"] != nil) {
      NSString *hexString = _stylingOptions[@"navigationHeaderSecondaryBackgroundColorNightMode"];
      _mapView.settings.navigationHeaderSecondaryBackgroundColorNightMode =
          [ObjectTranslationUtil colorFromHexString:hexString];
    }

    if (_stylingOptions[@"navigationHeaderLargeManeuverIconColor"] != nil) {
      NSString *hexString = _stylingOptions[@"navigationHeaderLargeManeuverIconColor"];
      _mapView.settings.navigationHeaderLargeManeuverIconColor =
          [ObjectTranslationUtil colorFromHexString:hexString];
    }

    if (_stylingOptions[@"navigationHeaderSmallManeuverIconColor"] != nil) {
      NSString *hexString = _stylingOptions[@"navigationHeaderSmallManeuverIconColor"];
      _mapView.settings.navigationHeaderSmallManeuverIconColor =
          [ObjectTranslationUtil colorFromHexString:hexString];
    }

    if (_stylingOptions[@"navigationHeaderGuidanceRecommendedLaneColor"] != nil) {
      NSString *hexString = _stylingOptions[@"navigationHeaderGuidanceRecommendedLaneColor"];
      _mapView.settings.navigationHeaderGuidanceRecommendedLaneColor =
          [ObjectTranslationUtil colorFromHexString:hexString];
    }

    if (_stylingOptions[@"navigationHeaderNextStepTextColor"] != nil) {
      NSString *hexString = _stylingOptions[@"navigationHeaderNextStepTextColor"];
      _mapView.settings.navigationHeaderNextStepTextColor =
          [ObjectTranslationUtil colorFromHexString:hexString];
    }

    if (_stylingOptions[@"navigationHeaderDistanceValueTextColor"] != nil) {
      NSString *hexString = _stylingOptions[@"navigationHeaderDistanceValueTextColor"];
      _mapView.settings.navigationHeaderDistanceValueTextColor =
          [ObjectTranslationUtil colorFromHexString:hexString];
    }

    if (_stylingOptions[@"navigationHeaderDistanceUnitsTextColor"] != nil) {
      NSString *hexString = _stylingOptions[@"navigationHeaderDistanceUnitsTextColor"];
      _mapView.settings.navigationHeaderDistanceUnitsTextColor =
          [ObjectTranslationUtil colorFromHexString:hexString];
    }

    if (_stylingOptions[@"navigationHeaderInstructionsTextColor"] != nil) {
      NSString *hexString = _stylingOptions[@"navigationHeaderInstructionsTextColor"];
      _mapView.settings.navigationHeaderInstructionsTextColor =
          [ObjectTranslationUtil colorFromHexString:hexString];
    }
  }
}

- (void)setZoomLevel:(nonnull NSNumber *)level result:(OnBooleanResult)completionBlock {
  [_mapView animateToZoom:[level floatValue]];
  completionBlock(YES);
}

- (void)setNavigationUIEnabled:(BOOL)isEnabled {
  _mapView.navigationEnabled = isEnabled;
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

- (void)moveCamera:(GMSMutableCameraPosition *)position {
  _mapView.camera = position;
}

- (void)setNightMode:(NSNumber *)index {
  // In case index = 0, that means we want to leave the calculation to the
  // native library depending on time.
  if ([index isEqual:@1]) {
    [_mapView setLightingMode:GMSNavigationLightingModeNormal];
  } else if ([index isEqual:@2]) {
    [_mapView setLightingMode:GMSNavigationLightingModeLowLight];
  }
}

- (void)setTripProgressBarEnabled:(BOOL)isEnabled {
  [_mapView.settings setNavigationTripProgressBarEnabled:isEnabled];
}

- (void)setMyLocationButtonEnabled:(BOOL)isEnabled {
  [_mapView.settings setMyLocationButton:isEnabled];
}

- (void)setShowDestinationMarkersEnabled:(BOOL)isEnabled {
  [_mapView.settings setShowsDestinationMarkers:isEnabled];
}

- (void)setShowTrafficLightsEnabled:(BOOL)isEnabled {
  [_mapView.settings setShowsTrafficLights:isEnabled];
}

- (void)setShowStopSignsEnabled:(BOOL)isEnabled {
  [_mapView.settings setShowsStopSigns:isEnabled];
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
  [_mapView setShouldDisplaySpeedometer:isEnabled];
}

- (void)setSpeedLimitIconEnabled:(BOOL)isEnabled {
  [_mapView setShouldDisplaySpeedLimit:isEnabled];
}

- (void)setReportIncidentButtonEnabled:(BOOL)isEnabled {
  _mapView.settings.navigationReportIncidentButtonEnabled = isEnabled;
}

#pragma mark - View Controller functions

- (BOOL)attachToNavigationSession:(GMSNavigationSession *)session {
  if (!_isNavigationView) {
    return NO;
  }
  BOOL result = [_mapView enableNavigationWithSession:session];
  _mapView.navigationUIDelegate = self;
  [self applyStylingOptions];
  return result;
}

- (void)onPromptVisibilityChange:(BOOL)isVisible {
  [self.callbacks handlePromptVisibilityChanged:isVisible];
}

- (void)preferredContentSizeDidChangeForChildContentContainer:
    (nonnull id<UIContentContainer>)container {
}

- (void)viewWillTransitionToSize:(CGSize)size
       withTransitionCoordinator:(nonnull id<UIViewControllerTransitionCoordinator>)coordinator {
}

- (void)setNavigationViewCallbacks:(nonnull id<INavigationViewCallback>)fn {
  self.callbacks = fn;
}

// Maps SDK
- (void)setTravelMode:(GMSNavigationTravelMode)travelMode {
  [_mapView setTravelMode:travelMode];
}

- (void)setIndoorEnabled:(BOOL)isEnabled {
  [_mapView setIndoorEnabled:isEnabled];
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

- (void)setMinZoomLevel:(float)minLevel maxZoom:(float)level {
  [_mapView setMinZoom:level maxZoom:level];
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
  [_mapView.settings setNavigationHeaderEnabled:isEnabled];
}

- (void)setFooterEnabled:(BOOL)isEnabled {
  [_mapView.settings setNavigationFooterEnabled:isEnabled];
}

- (void)setRecenterButtonEnabled:(BOOL)isEnabled {
  _mapView.settings.recenterButtonEnabled = isEnabled;
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

- (void)clearMapView:(OnBooleanResult)completionBlock {
  [_mapView clear];
  completionBlock(YES);
}

#pragma mark - Map Object Management

- (void)addGroundOverlay:(GMSGroundOverlay *)overlay
                 visible:(BOOL)visible
                  result:(OnDictionaryResult)completionBlock {
  if (visible) {
    overlay.map = _mapView;
  } else {
    overlay.map = nil;
  }
  [_groundOverlayList addObject:overlay];
  completionBlock([ObjectTranslationUtil transformGroundOverlayToDictionary:overlay]);
}

- (void)addCircle:(GMSCircle *)circle
          visible:(BOOL)visible
           result:(OnDictionaryResult)completionBlock {
  if (visible) {
    circle.map = _mapView;
  } else {
    circle.map = nil;
  }
  [_circleList addObject:circle];
  completionBlock([ObjectTranslationUtil transformCircleToDictionary:circle]);
}

- (void)addMarker:(GMSMarker *)marker
          visible:(BOOL)visible
           result:(OnDictionaryResult)completionBlock {
  if (visible) {
    marker.map = _mapView;
  } else {
    marker.map = nil;
  }
  [_markerList addObject:marker];
  completionBlock([ObjectTranslationUtil transformMarkerToDictionary:marker]);
}

- (void)addPolygon:(GMSPolygon *)polygon
           visible:(BOOL)visible
            result:(OnDictionaryResult)completionBlock {
  if (visible) {
    polygon.map = _mapView;
  } else {
    polygon.map = nil;
  }
  [_polygonList addObject:polygon];
  completionBlock([ObjectTranslationUtil transformPolygonToDictionary:polygon]);
}

- (void)addPolyline:(GMSPolyline *)polyline
            visible:(BOOL)visible
             result:(OnDictionaryResult)completionBlock {
  if (visible) {
    polyline.map = _mapView;
  } else {
    polyline.map = nil;
  }
  [_polylineList addObject:polyline];
  completionBlock([ObjectTranslationUtil transformPolylineToDictionary:polyline]);
}

- (void)removeMarker:(NSString *)markerId result:(OnBooleanResult)completionBlock {
  NSMutableArray *toDelete = [[NSMutableArray alloc] init];
  for (GMSMarker *marker in _markerList) {
    if ([self compare:marker.userData to:markerId]) {
      marker.map = nil;
      [toDelete addObject:marker];
    }
  }
  [_markerList removeObjectsInArray:toDelete];
  completionBlock(YES);
}

- (void)removePolyline:(NSString *)polylineId result:(OnBooleanResult)completionBlock {
  NSMutableArray *toDelete = [[NSMutableArray alloc] init];
  for (GMSPolyline *polyline in _polylineList) {
    if ([self compare:polyline.userData to:polylineId]) {
      polyline.map = nil;
      [toDelete addObject:polyline];
    }
  }
  [_polylineList removeObjectsInArray:toDelete];
  completionBlock(YES);
}

- (void)removePolygon:(NSString *)polygonId result:(OnBooleanResult)completionBlock {
  NSMutableArray *toDelete = [[NSMutableArray alloc] init];
  for (GMSPolygon *polygon in _polygonList) {
    if ([self compare:polygon.userData to:polygonId]) {
      polygon.map = nil;
      [toDelete addObject:polygon];
    }
  }
  [_polygonList removeObjectsInArray:toDelete];
  completionBlock(YES);
}

- (void)removeCircle:(NSString *)circleId result:(OnBooleanResult)completionBlock {
  NSMutableArray *toDelete = [[NSMutableArray alloc] init];
  for (GMSCircle *circle in _circleList) {
    if ([self compare:circle.userData to:circleId]) {
      circle.map = nil;
      [toDelete addObject:circle];
    }
  }
  [_circleList removeObjectsInArray:toDelete];
  completionBlock(YES);
}

- (void)removeGroundOverlay:(NSString *)overlayId result:(OnBooleanResult)completionBlock {
  NSMutableArray *toDelete = [[NSMutableArray alloc] init];
  for (GMSGroundOverlay *overlay in _groundOverlayList) {
    if ([self compare:overlay.userData to:overlayId]) {
      overlay.map = nil;
      [toDelete addObject:overlay];
    }
  }
  [_groundOverlayList removeObjectsInArray:toDelete];
  completionBlock(YES);
}

- (BOOL)compare:(nullable id)userData to:(NSString *)elementId {
  if (userData == nil) {
    return NO;
  }

  if (![userData isKindOfClass:[NSArray class]]) {
    return NO;
  }

  if (userData[0] == nil || ![userData[0] isKindOfClass:[NSString class]]) {
    return NO;
  }

  return [userData[0] isEqualToString:elementId];
}

- (void)setPadding:(UIEdgeInsets)insets {
  _mapView.padding = insets;
}

- (void)showRouteOverview:(nonnull OnBooleanResult)completionBlock {
  _mapView.cameraMode = GMSNavigationCameraModeOverview;
  completionBlock(YES);
}

@end
