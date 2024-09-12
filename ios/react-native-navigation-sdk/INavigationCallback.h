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

#ifndef INavigationCallback_h
#define INavigationCallback_h

@import GoogleNavigation;

NS_ASSUME_NONNULL_BEGIN

@protocol INavigationCallback

@required

- (void)onRemainingTimeOrDistanceChanged;
- (void)onRouteChanged;
- (void)onArrival:(NSDictionary *)waypoint;
- (void)onTurnByTurn:(GMSNavigationNavInfo *)navInfo;
- (void)onTurnByTurn:(GMSNavigationNavInfo *)navInfo
    distanceToNextDestinationMeters:(double)distanceToNextDestinationMeters
       timeToNextDestinationSeconds:(double)timeToNextDestinationSeconds;
- (void)onNavigationReady;
- (void)onNavigationInitError:(NSNumber *)errorCode;
- (void)onStartGuidance;
- (void)onRouteStatusResult:(GMSRouteStatus)routeStatus;
- (void)onReroutingRequestedByOffRoute;
- (void)onLocationChanged:(NSDictionary *)location;
@end

#endif /* INavigationCallback_h */

NS_ASSUME_NONNULL_END
