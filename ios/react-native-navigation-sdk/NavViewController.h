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

#import <UIKit/UIKit.h>
#import "INavigationCallback.h"
#import "ObjectTranslationUtil.h"
@import GoogleNavigation;

NS_ASSUME_NONNULL_BEGIN

@interface NavViewController
    : UIViewController <GMSNavigatorListener, GMSRoadSnappedLocationProviderListener, GMSMapViewNavigationUIDelegate, GMSMapViewDelegate>

@property(weak, nonatomic) id<INavigationCallback> callbacks;
@property double height;
@property double width;
@property BOOL enableUpdateInfo;

typedef void (^RouteStatusCallback)(GMSRouteStatus routeStatus);
typedef void (^OnStringResult)(NSString *result);
typedef void (^OnBooleanResult)(BOOL result);
typedef void (^OnDictionaryResult)(NSDictionary *result);
typedef void (^OnArrayResult)(NSArray *result);
- (instancetype)initWithSize:(double)height width:(double)width;
- (void)setTosParams: (NSDictionary*) options;
- (void)setStylingOptions:(nonnull NSDictionary *)stylingOptions;
- (void)getCurrentRouteSegment:(OnDictionaryResult)completionBlock;
- (void)getRouteSegments:(OnArrayResult)completionBlock;
- (void)getCurrentTimeAndDistance:(OnDictionaryResult)completionBlock;
- (void)getTraveledPath:(OnArrayResult)completionBlock;
- (void)getCameraPosition:(OnDictionaryResult)completionBlock;
- (void)getMyLocation:(OnDictionaryResult)completionBlock;
- (void)getUiSettings:(OnDictionaryResult)completionBlock;
- (void)isMyLocationEnabled:(OnBooleanResult)completionBlock;
- (void)areTermsAccepted:(OnBooleanResult)completionBlock;
- (void)setTurnByTurnLoggingEnabled:(BOOL)isEnabled;
- (void)moveCamera:(NSDictionary *) cameraPositionMap;
- (void)setTripProgressBarEnabled:(BOOL)isEnabled;
- (void)setNavigationUIEnabled:(BOOL)isEnabled;
- (void)setAbnormalTerminatingReportingEnabled:(BOOL)isEnabled;
- (void)setFollowingPerspective:(NSNumber *)index;
- (void)setNightMode:(NSNumber *)index;
- (void)setAudioGuidanceType:(NSNumber *)index;
- (void)setSpeedometerEnabled:(BOOL)isEnabled;
- (void)setSpeedLimitIconEnabled:(BOOL)isEnabled;
- (void)setDestinations:
    (nonnull NSArray *)waypoints 
    withRoutingOptions: (nullable NSDictionary *) routingOptionsMap;
- (void)startGuidance;
- (void)stopGuidance;
- (void)runSimulation:(NSNumber *)speedMultiplier;
- (void)stopSimulation;
- (void)clearDestinations;
- (void)continueToNextDestination;
- (void)setZoomLevel:(NSNumber *)level;
- (void)setSpeedAlertOptions:(NSDictionary *)options;
- (void)simulateLocation:(NSDictionary *)coordinates;
- (void)pauseSimulation;
- (void)resumeSimulation;
- (void)setNavigationCallbacks:(id<INavigationCallback>)fn;
- (void)setIndoorEnabled:(BOOL)isEnabled;
- (void)setTrafficEnabled:(BOOL)isEnabled;
- (void)setCompassEnabled:(BOOL)isEnabled;
- (void)setMyLocationButtonEnabled:(BOOL)isEnabled;
- (void)setMyLocationEnabled:(BOOL)isEnabled;
- (void)setRotateGesturesEnabled:(BOOL)isEnabled;
- (void)setScrollGesturesEnabled:(BOOL)isEnabled;
- (void)setScrollGesturesEnabledDuringRotateOrZoom:(BOOL)isEnabled;
- (void)setTiltGesturesEnabled:(BOOL)isEnabled;
- (void)setZoomGesturesEnabled:(BOOL)isEnabled;
- (void)setBuildingsEnabled:(BOOL)isEnabled;
- (void)setTrafficIncidentCardsEnabled:(BOOL)isEnabled;
- (void)setBackgroundLocationUpdatesEnabled:(BOOL)isEnabled;
- (void)setRecenterButtonEnabled:(BOOL)isEnabled;
- (void)resetMinMaxZoomLevel;
- (void)animateCamera:(GMSCameraUpdate *)update;
- (void)setMapStyle:(GMSMapStyle *)mapStyle;
- (void)setMapType:(GMSMapViewType)mapType;
- (void)clearMapView;
- (void)addGroundOverlay:(NSDictionary *)overlayOptions result: (OnDictionaryResult)completionBlock;
- (void)addCircle:(NSDictionary *)circleOptions result: (OnDictionaryResult)completionBlock;
- (void)addMarker:(NSDictionary *)markerOptions result: (OnDictionaryResult)completionBlock;
- (void)addPolygon:(NSDictionary *)polygonOptions result:(OnDictionaryResult)completionBlock;
- (void)addPolyline:(NSDictionary *)options result:(OnDictionaryResult)completionBlock;
- (GMSMapView *)mapView;
- (void)getNavSDKVersion:(OnStringResult)completionBlock;
- (void)showRouteOverview;
- (void)removeMarker:(NSString *)markerId;
- (void)removePolyline:(NSString *)polylineId;
- (void)removePolygon:(NSString *)polygonId;
- (void)removeCircle:(NSString *)circleId;
- (void)removeGroundOverlay:(NSString *)overlayId;
- (void)removeNavigationListeners;
- (void)startUpdatingLocation;
- (void)stopUpdatingLocation;
@end

NS_ASSUME_NONNULL_END
