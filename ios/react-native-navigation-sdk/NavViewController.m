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
#import "UIColor+Util.h"
#import <React/RCTLog.h>

@import GoogleNavigation;
@import UserNotifications;

@implementation NavViewController {
    GMSMapView *_mapView;
    GMSMutableCameraPosition *_camera;
    NSMutableArray<GMSMarker *> *_markerList;
    NSMutableArray<GMSPolyline *> *_polylineList;
    NSMutableArray<GMSPolygon *> *_polygonList;
    NSMutableArray<GMSCircle *> *_circleList;
    NSMutableArray<GMSGroundOverlay *> *_groundOverlayList;
}

@synthesize callbacks = _callbacks;
@synthesize height = _height;
@synthesize width = _width;

- (void)loadView {
    [super loadView];
    
    _markerList = [[NSMutableArray alloc] init];
    _polylineList = [[NSMutableArray alloc] init];
    _polygonList = [[NSMutableArray alloc] init];
    _circleList = [[NSMutableArray alloc] init];
    _groundOverlayList = [[NSMutableArray alloc] init];
    
    dispatch_async(dispatch_get_main_queue(), ^{
        self->_mapView = [[GMSMapView alloc] initWithFrame:CGRectZero];
        [self.callbacks onMapReady];
        
        self.view = self->_mapView;
        self->_mapView.delegate = self;
        
        NavModule *navModule = [NavModule sharedInstance];
        if (navModule != nil && [navModule hasSession]) {
            [self attachToNavigationSession:[navModule getSession]];
        }
    });
}

- (void)mapViewDidTapRecenterButton:(GMSMapView *)mapView {
    [self.callbacks onRecenterButtonClick];
}

- (void)mapView:(GMSMapView *)mapView
didTapInfoWindowOfMarker:(GMSMarker *)marker {
    [self.callbacks onMarkerInfoWindowTapped:marker];
}

- (void)mapView:(GMSMapView *)mapView
didTapAtCoordinate:(CLLocationCoordinate2D)coordinate {
    [self.callbacks onMapClick:[ObjectTranslationUtil
                                transformCoordinateToDictionary:coordinate]];
}

- (BOOL)mapView:(GMSMapView *)mapView didTapMarker:(GMSMarker *)marker {
    [self.callbacks onMarkerClick:marker];
    return FALSE;
}

- (void)mapView:(GMSMapView *)mapView didTapOverlay:(GMSOverlay *)overlay {
    if ([overlay isKindOfClass:[GMSPolyline class]]) {
        GMSPolyline *polyline = (GMSPolyline *)overlay;
        [self.callbacks onPolylineClick:polyline];
    } else if ([overlay isKindOfClass:[GMSPolygon class]]) {
        GMSPolygon *polygon = (GMSPolygon *)overlay;
        [self.callbacks onPolygonClick:polygon];
    } else if ([overlay isKindOfClass:[GMSCircle class]]) {
        GMSCircle *circle = (GMSCircle *)overlay;
        [self.callbacks onCircleClick:circle];
    } else if ([overlay isKindOfClass:[GMSGroundOverlay class]]) {
        GMSGroundOverlay *groundOverlay = (GMSGroundOverlay *)overlay;
        [self.callbacks onGroundOverlayClick:groundOverlay];
    }
}

- (void)setStylingOptions:(nonnull NSDictionary *)stylingOptions {
    if (stylingOptions[@"navigationHeaderPrimaryBackgroundColor"] != nil) {
        NSString *hexString =
        stylingOptions[@"navigationHeaderPrimaryBackgroundColor"];
        _mapView.settings.navigationHeaderPrimaryBackgroundColor =
        [UIColor colorWithHexString:hexString];
    }
    
    if (stylingOptions[@"navigationHeaderSecondaryBackgroundColor"] != nil) {
        NSString *hexString =
        stylingOptions[@"navigationHeaderSecondaryBackgroundColor"];
        _mapView.settings.navigationHeaderSecondaryBackgroundColor =
        [UIColor colorWithHexString:hexString];
    }
    
    if (stylingOptions[@"navigationHeaderPrimaryBackgroundColorNightMode"] !=
        nil) {
        NSString *hexString =
        stylingOptions[@"navigationHeaderPrimaryBackgroundColorNightMode"];
        _mapView.settings.navigationHeaderPrimaryBackgroundColorNightMode =
        [UIColor colorWithHexString:hexString];
    }
    
    if (stylingOptions[@"navigationHeaderSecondaryBackgroundColorNightMode"] !=
        nil) {
        NSString *hexString =
        stylingOptions[@"navigationHeaderSecondaryBackgroundColorNightMode"];
        _mapView.settings.navigationHeaderSecondaryBackgroundColorNightMode =
        [UIColor colorWithHexString:hexString];
    }
    
    if (stylingOptions[@"navigationHeaderLargeManeuverIconColor"] != nil) {
        NSString *hexString =
        stylingOptions[@"navigationHeaderLargeManeuverIconColor"];
        _mapView.settings.navigationHeaderLargeManeuverIconColor =
        [UIColor colorWithHexString:hexString];
    }
    
    if (stylingOptions[@"navigationHeaderSmallManeuverIconColor"] != nil) {
        NSString *hexString =
        stylingOptions[@"navigationHeaderSmallManeuverIconColor"];
        _mapView.settings.navigationHeaderSmallManeuverIconColor =
        [UIColor colorWithHexString:hexString];
    }
    
    if (stylingOptions[@"navigationHeaderGuidanceRecommendedLaneColor"] != nil) {
        NSString *hexString =
        stylingOptions[@"navigationHeaderGuidanceRecommendedLaneColor"];
        _mapView.settings.navigationHeaderGuidanceRecommendedLaneColor =
        [UIColor colorWithHexString:hexString];
    }
    
    if (stylingOptions[@"navigationHeaderNextStepTextColor"] != nil) {
        NSString *hexString = stylingOptions[@"navigationHeaderNextStepTextColor"];
        _mapView.settings.navigationHeaderNextStepTextColor =
        [UIColor colorWithHexString:hexString];
    }
    
    if (stylingOptions[@"navigationHeaderDistanceValueTextColor"] != nil) {
        NSString *hexString =
        stylingOptions[@"navigationHeaderDistanceValueTextColor"];
        _mapView.settings.navigationHeaderDistanceValueTextColor =
        [UIColor colorWithHexString:hexString];
    }
    
    if (stylingOptions[@"navigationHeaderDistanceUnitsTextColor"] != nil) {
        NSString *hexString =
        stylingOptions[@"navigationHeaderDistanceUnitsTextColor"];
        _mapView.settings.navigationHeaderDistanceUnitsTextColor =
        [UIColor colorWithHexString:hexString];
    }
    
    if (stylingOptions[@"navigationHeaderInstructionsTextColor"] != nil) {
        NSString *hexString =
        stylingOptions[@"navigationHeaderInstructionsTextColor"];
        _mapView.settings.navigationHeaderInstructionsTextColor =
        [UIColor colorWithHexString:hexString];
    }
}

- (void)setZoomLevel:(nonnull NSNumber *)level {
    _mapView.camera = [GMSMutableCameraPosition
                       cameraWithLatitude:_mapView.myLocation.coordinate.latitude
                       longitude:_mapView.myLocation.coordinate.longitude
                       zoom:[level floatValue]];
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
    
    map[@"target"] = @{
        @"lat" : @(cameraPosition.latitude),
        @"lng" : @(cameraPosition.longitude)
    };
    
    completionBlock(map);
}

- (void)getMyLocation:(OnDictionaryResult)completionBlock {
    CLLocation *userLocation = _mapView.myLocation;
    
    if (userLocation != nil) {
        completionBlock(
                        [ObjectTranslationUtil transformCLLocationToDictionary:userLocation]);
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

- (void)moveCamera:(NSDictionary *)map {
    GMSMutableCameraPosition *position = [[GMSMutableCameraPosition alloc] init];
    position.target =
    [ObjectTranslationUtil getLocationCoordinateFrom:map[@"target"]];
    position.zoom = [[map objectForKey:@"zoom"] floatValue];
    position.bearing = [[map objectForKey:@"bearing"] doubleValue];
    position.viewingAngle = [[map objectForKey:@"tilt"] doubleValue];
    
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

- (void)showRouteOverview {
    _mapView.cameraMode = GMSNavigationCameraModeOverview;
}

- (void)setTripProgressBarEnabled:(BOOL)isEnabled {
    [_mapView.settings setNavigationTripProgressBarEnabled:isEnabled];
}

- (void)setMyLocationButtonEnabled:(BOOL)isEnabled {
    [_mapView.settings setMyLocationButton:isEnabled];
}

- (void)setMyLocationEnabled:(BOOL)isEnabled {
    _mapView.myLocationEnabled = isEnabled;
}

- (void)setFollowingPerspective:(NSNumber *)index {
    if ([index isEqual:@1]) {
        [_mapView
         setFollowingPerspective:GMSNavigationCameraPerspectiveTopDownNorthUp];
    } else if ([index isEqual:@2]) {
        [_mapView
         setFollowingPerspective:GMSNavigationCameraPerspectiveTopDownHeadingUp];
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

#pragma mark - View Controller functions

- (instancetype)initWithSize:(double)height width:(double)width {
    self = [super init];
    if (self) {
        self.height = height;
        self.width = width;
    }
    return self;
}

- (BOOL)attachToNavigationSession:(GMSNavigationSession *)session {
    BOOL result = [_mapView enableNavigationWithSession:session];
    _mapView.navigationUIDelegate = self;
    return result;
}

- (void)viewWillLayoutSubviews {
    [super viewWillLayoutSubviews];
    [self.view setFrame:CGRectMake(0, 0, self.width, self.height)];
}

- (void)preferredContentSizeDidChangeForChildContentContainer:
(nonnull id<UIContentContainer>)container {
}

- (void)viewWillTransitionToSize:(CGSize)size
       withTransitionCoordinator:
(nonnull id<UIViewControllerTransitionCoordinator>)coordinator {
}

- (void)setNavigationCallbacks:(nonnull id<INavigationViewCallback>)fn {
    self.callbacks = fn;
}

// Maps SDK
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
}

- (UIColor *)colorFromHexString:(NSString *)hexString {
    unsigned rgb = 0;
    NSScanner *scanner = [NSScanner scannerWithString:hexString];
    [scanner setScanLocation:1]; // bypass '#' character
    [scanner scanHexInt:&rgb];
    return [UIColor colorWithRed:((rgb & 0xFF0000) >> 16) / 255.0
                           green:((rgb & 0xFF00) >> 8) / 255.0
                            blue:(rgb & 0xFF) / 255.0
                           alpha:1.0];
}

- (void)addGroundOverlay:(NSDictionary *)overlayOptions
                  result:(OnDictionaryResult)completionBlock {
    NSDictionary *latLng = [overlayOptions objectForKey:@"location"];
    CLLocationCoordinate2D position =
    [ObjectTranslationUtil getLocationCoordinateFrom:latLng];
    
    NSString *imgPath = [overlayOptions objectForKey:@"imgPath"];
    UIImage *icon = [UIImage imageNamed:imgPath]; // Assuming local asset
    
    CGFloat widthInMeters = [[overlayOptions objectForKey:@"width"] doubleValue];
    CGFloat heightInMeters =
    [[overlayOptions objectForKey:@"height"] doubleValue];
    
    CLLocationCoordinate2D northeast = CLLocationCoordinate2DMake(
                                                                  position.latitude + (heightInMeters / 111111.0),
                                                                  position.longitude +
                                                                  (widthInMeters / (111111.0 * cos(position.latitude * M_PI / 180.0))));
    CLLocationCoordinate2D southwest = CLLocationCoordinate2DMake(
                                                                  position.latitude - (heightInMeters / 111111.0),
                                                                  position.longitude -
                                                                  (widthInMeters / (111111.0 * cos(position.latitude * M_PI / 180.0))));
    
    GMSCoordinateBounds *overlayBounds =
    [[GMSCoordinateBounds alloc] initWithCoordinate:southwest
                                         coordinate:northeast];
    GMSGroundOverlay *overlay =
    [GMSGroundOverlay groundOverlayWithBounds:overlayBounds icon:icon];
    overlay.bearing = [[overlayOptions objectForKey:@"bearing"] floatValue];
    overlay.opacity =
    1.0 - [[overlayOptions objectForKey:@"transparency"] floatValue];
    overlay.tappable = [[overlayOptions objectForKey:@"clickable"] boolValue];
    
    overlay.userData = @[ [[NSUUID UUID] UUIDString] ];
    
    BOOL visible = [[overlayOptions objectForKey:@"visible"] boolValue];
    if (visible) {
        overlay.map = _mapView;
    } else {
        overlay.map = nil;
    }
    
    [_groundOverlayList addObject:overlay];
    
    completionBlock(
                    [ObjectTranslationUtil transformGroundOverlayToDictionary:overlay]);
}

- (void)addCircle:(NSDictionary *)circleOptions
           result:(OnDictionaryResult)completionBlock {
    NSDictionary *latLng = [circleOptions objectForKey:@"center"];
    CLLocationCoordinate2D center =
    [ObjectTranslationUtil getLocationCoordinateFrom:latLng];
    
    GMSCircle *circle = [GMSCircle
                         circleWithPosition:center
                         radius:[[circleOptions objectForKey:@"radius"] doubleValue]];
    
    circle.strokeWidth = [[circleOptions objectForKey:@"strokeWidth"] floatValue];
    
    if (circleOptions[@"strokeColor"] != nil) {
        // Assuming strokeColor is a hex string
        circle.strokeColor =
        [self colorFromHexString:[circleOptions objectForKey:@"strokeColor"]];
    }
    
    NSString *fillColor = [circleOptions objectForKey:@"fillColor"];
    if (fillColor) {
        circle.fillColor = [self colorFromHexString:fillColor];
    }
    
    circle.tappable = [[circleOptions objectForKey:@"clickable"] boolValue];
    
    circle.userData = @[ [[NSUUID UUID] UUIDString] ];
    
    BOOL visible = [[circleOptions objectForKey:@"visible"] boolValue];
    if (visible) {
        circle.map = _mapView;
    } else {
        circle.map = nil;
    }
    
    [_circleList addObject:circle];
    
    completionBlock([ObjectTranslationUtil transformCircleToDictionary:circle]);
}

- (void)addMarker:(NSDictionary *)markerOptions
           result:(OnDictionaryResult)completionBlock {
    NSDictionary *position = [markerOptions objectForKey:@"position"];
    CLLocationCoordinate2D coordinatePosition =
    [ObjectTranslationUtil getLocationCoordinateFrom:position];
    
    GMSMarker *marker = [GMSMarker markerWithPosition:coordinatePosition];
    marker.title = [markerOptions objectForKey:@"title"];
    marker.snippet = [markerOptions objectForKey:@"snippet"];
    if ([markerOptions valueForKey:@"alpha"] != nil) {
        marker.opacity = [[markerOptions objectForKey:@"alpha"] floatValue];
    }
    if ([markerOptions valueForKey:@"rotation"] != nil) {
        marker.rotation = [[markerOptions objectForKey:@"rotation"] doubleValue];
    }
    marker.flat = [[markerOptions objectForKey:@"flat"] boolValue];
    marker.draggable = [[markerOptions objectForKey:@"draggable"] boolValue];
    marker.tappable = YES;
    
    marker.userData = @[ [[NSUUID UUID] UUIDString] ];
    
    marker.map = _mapView;
    
    if ([[markerOptions objectForKey:@"imgPath"]
         isKindOfClass:[NSString class]]) {
        NSString *imgPath = [markerOptions objectForKey:@"imgPath"];
        if (imgPath) {
            UIImage *icon = [UIImage imageNamed:imgPath]; // Assuming local asset
            marker.icon = icon;
        }
    }
    
    BOOL visible = [[markerOptions objectForKey:@"visible"] boolValue];
    if (!visible) {
        marker.map = nil; // Setting map to nil hides the marker
    }
    
    [_markerList addObject:marker];
    
    completionBlock([ObjectTranslationUtil transformMarkerToDictionary:marker]);
}

- (void)addPolygon:(NSDictionary *)polygonOptions
            result:(OnDictionaryResult)completionBlock {
    GMSPath *path =
    [ObjectTranslationUtil transformToPath:polygonOptions[@"points"]];
    
    GMSPolygon *polygon = [GMSPolygon polygonWithPath:path];
    
    NSArray<NSArray *> *holesArray = polygonOptions[@"holes"];
    NSMutableArray<GMSPath *> *holePaths = [[NSMutableArray alloc] init];
    
    for (id holeArray in holesArray) {
        [holePaths addObject:[ObjectTranslationUtil transformToPath:holeArray]];
    }
    
    [polygon setHoles:holePaths];
    
    polygon.tappable = [[polygonOptions objectForKey:@"clickable"] boolValue];
    
    NSString *fillColor = [polygonOptions objectForKey:@"fillColor"];
    
    if (fillColor) {
        polygon.fillColor = [self colorFromHexString:fillColor];
    }
    
    NSString *strokeColor = [polygonOptions objectForKey:@"strokeColor"];
    if (strokeColor) {
        polygon.strokeColor = [self colorFromHexString:strokeColor];
    }
    
    if ([polygonOptions objectForKey:@"strokeWidth"]) {
        polygon.strokeWidth =
        [[polygonOptions objectForKey:@"strokeWidth"] floatValue];
    }
    
    if ([polygonOptions objectForKey:@"geodesic"]) {
        polygon.geodesic = [[polygonOptions objectForKey:@"geodesic"] boolValue];
    }
    
    polygon.zIndex = 1;
    
    polygon.userData = @[ [[NSUUID UUID] UUIDString] ];
    
    BOOL visible = [[polygonOptions objectForKey:@"visible"] boolValue];
    if (visible) {
        polygon.map = _mapView;
    } else {
        polygon.map = nil;
    }
    
    [_polygonList addObject:polygon];
    
    completionBlock([ObjectTranslationUtil transformPolygonToDictionary:polygon]);
}

- (void)addPolyline:(NSDictionary *)options
             result:(OnDictionaryResult)completionBlock {
    GMSPath *path = [ObjectTranslationUtil transformToPath:options[@"points"]];
    GMSPolyline *polyline = [GMSPolyline polylineWithPath:path];
    
    polyline.strokeWidth = [[options objectForKey:@"width"] floatValue];
    polyline.strokeColor = [self
                            colorFromHexString:[options objectForKey:@"color"]]; // Assuming color is
    // a hex string
    polyline.tappable = [[options objectForKey:@"clickable"] boolValue];
    
    polyline.userData = @[ [[NSUUID UUID] UUIDString] ];
    
    if ([options objectForKey:@"visible"] != nil &&
        [[options objectForKey:@"visible"] boolValue]) {
        polyline.map = _mapView;
    } else {
        polyline.map = nil;
    }
    
    [_polylineList addObject:polyline];
    
    completionBlock(
                    [ObjectTranslationUtil transformPolylineToDictionary:polyline]);
}

- (void)removeMarker:(NSString *)markerId {
    NSMutableArray *toDelete = [[NSMutableArray alloc] init];
    for (GMSMarker *marker in _markerList) {
        if ([self compare:marker.userData to:markerId]) {
            marker.map = nil;
            [toDelete addObject:marker];
        }
    }
    [_markerList removeObjectsInArray:toDelete];
}

- (void)removePolyline:(NSString *)polylineId {
    NSMutableArray *toDelete = [[NSMutableArray alloc] init];
    for (GMSPolyline *polyline in _polylineList) {
        if ([self compare:polyline.userData to:polylineId]) {
            polyline.map = nil;
            [toDelete addObject:polyline];
        }
    }
    [_polylineList removeObjectsInArray:toDelete];
}

- (void)removePolygon:(NSString *)polygonId {
    NSMutableArray *toDelete = [[NSMutableArray alloc] init];
    for (GMSPolygon *polygon in _polygonList) {
        if ([self compare:polygon.userData to:polygonId]) {
            polygon.map = nil;
            [toDelete addObject:polygon];
        }
    }
    [_polygonList removeObjectsInArray:toDelete];
}

- (void)removeCircle:(NSString *)circleId {
    NSMutableArray *toDelete = [[NSMutableArray alloc] init];
    for (GMSCircle *circle in _circleList) {
        if ([self compare:circle.userData to:circleId]) {
            circle.map = nil;
            [toDelete addObject:circle];
        }
    }
    [_circleList removeObjectsInArray:toDelete];
}

- (void)removeGroundOverlay:(NSString *)overlayId {
    NSMutableArray *toDelete = [[NSMutableArray alloc] init];
    for (GMSGroundOverlay *overlay in _groundOverlayList) {
        if ([self compare:overlay.userData to:overlayId]) {
            overlay.map = nil;
            [toDelete addObject:overlay];
        }
    }
    [_groundOverlayList removeObjectsInArray:toDelete];
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

@end
