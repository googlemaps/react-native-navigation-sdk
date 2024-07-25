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

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
@import GoogleNavigation;

@interface ObjectTranslationUtil : NSObject

+ (NSDictionary *)transformNavigationWaypointToDictionary:(GMSNavigationWaypoint *)waypoint;
+ (NSDictionary *)transformCoordinateToDictionary:(CLLocationCoordinate2D)coordinate;
+ (NSDictionary *)transformCLLocationToDictionary:(CLLocation *)location;
+ (NSDictionary *)transformRouteSegmentToDictionary:(GMSRouteLeg *)routeLeg;
+ (NSArray *)transformGMSPathToArray:(GMSPath *)path;
+ (NSDictionary *)transformMarkerToDictionary:(GMSMarker *)marker;
+ (NSDictionary *)transformPolylineToDictionary:(GMSPolyline *)polyline;
+ (NSDictionary *)transformPolygonToDictionary:(GMSPolygon *)polygon;
+ (NSDictionary *)transformCircleToDictionary:(GMSCircle *)circle;
+ (NSDictionary *)transformGroundOverlayToDictionary:(GMSGroundOverlay *)groundOverlay;
+ (GMSPath *)transformToPath:(NSArray *)latLngs;
+ (CLLocationCoordinate2D)getLocationCoordinateFrom:(NSDictionary *)latLngMap;
+ (BOOL)isIdOnUserData:(nullable id)userData;
@end
