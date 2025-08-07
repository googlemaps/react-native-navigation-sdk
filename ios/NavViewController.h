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
#ifndef NavViewController_h
#define NavViewController_h

#import <GoogleNavigation/GoogleNavigation.h>
#import <UIKit/UIKit.h>
#import "INavigationViewCallback.h"
#import "ObjectTranslationUtil.h"

NS_ASSUME_NONNULL_BEGIN

@interface NavViewController : UIViewController <GMSMapViewNavigationUIDelegate, GMSMapViewDelegate>

@property(weak, nonatomic) id<INavigationViewCallback> callbacks;
@property(nonatomic, assign) BOOL isNavigationView;
typedef void (^RouteStatusCallback)(GMSRouteStatus routeStatus);
typedef void (^OnStringResult)(NSString *result);
typedef void (^OnBooleanResult)(BOOL result);
typedef void (^OnDictionaryResult)(NSDictionary *_Nullable result);
typedef void (^OnArrayResult)(NSArray *_Nullable result);
- (void)setStylingOptions:(nonnull NSDictionary *)stylingOptions;
- (void)getCameraPosition:(OnDictionaryResult)completionBlock;
- (void)getMyLocation:(OnDictionaryResult)completionBlock;
- (void)getUiSettings:(OnDictionaryResult)completionBlock;
- (void)isMyLocationEnabled:(OnBooleanResult)completionBlock;
- (void)moveCamera:(GMSMutableCameraPosition *)cameraPositionMap;
- (void)setTripProgressBarEnabled:(BOOL)isEnabled;
- (void)setNavigationUIEnabled:(BOOL)isEnabled;
- (void)setFollowingPerspective:(NSNumber *)index;
- (void)setNightMode:(NSNumber *)index;
- (void)setSpeedometerEnabled:(BOOL)isEnabled;
- (void)setSpeedLimitIconEnabled:(BOOL)isEnabled;
- (void)setZoomLevel:(NSNumber *)level result:(OnBooleanResult)completionBlock;
- (void)setNavigationViewCallbacks:(id<INavigationViewCallback>)fn;
- (void)setIndoorEnabled:(BOOL)isEnabled;
- (void)setTrafficEnabled:(BOOL)isEnabled;
- (void)setCompassEnabled:(BOOL)isEnabled;
- (void)setMyLocationButtonEnabled:(BOOL)isEnabled;
- (void)setMyLocationEnabled:(BOOL)isEnabled;
- (void)setShowDestinationMarkersEnabled:(BOOL)isEnabled;
- (void)setShowTrafficLightsEnabled:(BOOL)isEnabled;
- (void)setShowStopSignsEnabled:(BOOL)isEnabled;
- (void)setRotateGesturesEnabled:(BOOL)isEnabled;
- (void)setScrollGesturesEnabled:(BOOL)isEnabled;
- (void)setScrollGesturesEnabledDuringRotateOrZoom:(BOOL)isEnabled;
- (void)setTiltGesturesEnabled:(BOOL)isEnabled;
- (void)setZoomGesturesEnabled:(BOOL)isEnabled;
- (void)setBuildingsEnabled:(BOOL)isEnabled;
- (void)setTrafficIncidentCardsEnabled:(BOOL)isEnabled;
- (void)setHeaderEnabled:(BOOL)isEnabled;
- (void)setFooterEnabled:(BOOL)isEnabled;
- (void)setRecenterButtonEnabled:(BOOL)isEnabled;
- (void)setReportIncidentButtonEnabled:(BOOL)isEnabled;
- (void)animateCamera:(GMSCameraUpdate *)update;
- (void)setMapStyle:(GMSMapStyle *)mapStyle;
- (void)setMapType:(GMSMapViewType)mapType;
- (void)setMinZoomLevel:(float)minLevel maxZoom:(float)level;
- (void)clearMapView:(OnBooleanResult)completionBlock;
- (void)addGroundOverlay:(GMSGroundOverlay *)overlay
                 visible:(BOOL)visible
                  result:(OnDictionaryResult)completionBlock;
- (void)addCircle:(GMSCircle *)circle
          visible:(BOOL)visible
           result:(OnDictionaryResult)completionBlock;
- (void)addMarker:(GMSMarker *)marker
          visible:(BOOL)visible
           result:(OnDictionaryResult)completionBlock;
- (void)addPolygon:(GMSPolygon *)polygon
           visible:(BOOL)visible
            result:(OnDictionaryResult)completionBlock;
- (void)addPolyline:(GMSPolyline *)polyline
            visible:(BOOL)visible
             result:(OnDictionaryResult)completionBlock;
- (GMSMapView *)mapView;
- (void)showRouteOverview:(OnBooleanResult)completionBlock;
;
- (void)removeMarker:(NSString *)markerId result:(OnBooleanResult)completionBlock;
- (void)removePolyline:(NSString *)polylineId result:(OnBooleanResult)completionBlock;
- (void)removePolygon:(NSString *)polygonId result:(OnBooleanResult)completionBlock;
- (void)removeCircle:(NSString *)circleId result:(OnBooleanResult)completionBlock;
- (void)removeGroundOverlay:(NSString *)overlayId result:(OnBooleanResult)completionBlock;
- (BOOL)attachToNavigationSession:(GMSNavigationSession *)session;
- (void)onPromptVisibilityChange:(BOOL)visible;
- (void)setTravelMode:(GMSNavigationTravelMode)travelMode;
- (void)setPadding:(UIEdgeInsets)insets;
@end

NS_ASSUME_NONNULL_END

#endif /* NavViewController_h */
