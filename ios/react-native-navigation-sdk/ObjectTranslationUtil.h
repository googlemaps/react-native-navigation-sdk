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
#import <GoogleNavigation/GoogleNavigation.h>
#import <UIKit/UIKit.h>
#import "UIColor+ColorInt.h"

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

// Creation methods for map objects
+ (GMSMarker *)createMarker:(CLLocationCoordinate2D)position
                      title:(nullable NSString *)title
                    snippet:(nullable NSString *)snippet
                      alpha:(float)alpha
                   rotation:(double)rotation
                       flat:(BOOL)flat
                  draggable:(BOOL)draggable
                       icon:(nullable UIImage *)icon
                     zIndex:(nullable NSNumber *)zIndex
                 identifier:(nullable NSString *)identifier;

+ (GMSPolyline *)createPolyline:(GMSPath *)path
                          width:(float)width
                          color:(nullable UIColor *)color
                      clickable:(BOOL)clickable
                         zIndex:(nullable NSNumber *)zIndex
                     identifier:(nullable NSString *)identifier;

+ (GMSPolygon *)createPolygon:(GMSPath *)path
                        holes:(nullable NSArray<GMSPath *> *)holes
                    fillColor:(nullable UIColor *)fillColor
                  strokeColor:(nullable UIColor *)strokeColor
                  strokeWidth:(float)strokeWidth
                     geodesic:(BOOL)geodesic
                    clickable:(BOOL)clickable
                       zIndex:(nullable NSNumber *)zIndex
                   identifier:(nullable NSString *)identifier;

+ (GMSCircle *)createCircle:(CLLocationCoordinate2D)center
                     radius:(double)radius
                strokeWidth:(float)strokeWidth
                strokeColor:(nullable UIColor *)strokeColor
                  fillColor:(nullable UIColor *)fillColor
                  clickable:(BOOL)clickable
                     zIndex:(nullable NSNumber *)zIndex
                 identifier:(nullable NSString *)identifier;

// Ground overlay creation with position-based positioning (uses zoomLevel)
+ (GMSGroundOverlay *)createGroundOverlayWithPosition:(CLLocationCoordinate2D)position
                                                 icon:(UIImage *)icon
                                            zoomLevel:(CGFloat)zoomLevel
                                              bearing:(CGFloat)bearing
                                         transparency:(CGFloat)transparency
                                               anchor:(CGPoint)anchor
                                            clickable:(BOOL)clickable
                                               zIndex:(nullable NSNumber *)zIndex
                                           identifier:(nullable NSString *)identifier;

// Ground overlay creation with bounds-based positioning
+ (GMSGroundOverlay *)createGroundOverlayWithBounds:(GMSCoordinateBounds *)bounds
                                               icon:(UIImage *)icon
                                            bearing:(CGFloat)bearing
                                       transparency:(CGFloat)transparency
                                             anchor:(CGPoint)anchor
                                          clickable:(BOOL)clickable
                                             zIndex:(nullable NSNumber *)zIndex
                                         identifier:(nullable NSString *)identifier;

// Update methods for map objects
+ (void)updateMarker:(GMSMarker *)marker
               title:(nullable NSString *)title
             snippet:(nullable NSString *)snippet
               alpha:(float)alpha
            rotation:(double)rotation
                flat:(BOOL)flat
           draggable:(BOOL)draggable
                icon:(nullable UIImage *)icon
              zIndex:(nullable NSNumber *)zIndex
            position:(CLLocationCoordinate2D)position;

+ (void)updatePolyline:(GMSPolyline *)polyline
                  path:(GMSPath *)path
                 width:(float)width
                 color:(nullable UIColor *)color
             clickable:(BOOL)clickable
                zIndex:(nullable NSNumber *)zIndex;

+ (void)updatePolygon:(GMSPolygon *)polygon
                 path:(GMSPath *)path
                holes:(nullable NSArray<GMSPath *> *)holes
            fillColor:(nullable UIColor *)fillColor
          strokeColor:(nullable UIColor *)strokeColor
          strokeWidth:(float)strokeWidth
             geodesic:(BOOL)geodesic
            clickable:(BOOL)clickable
               zIndex:(nullable NSNumber *)zIndex;

+ (void)updateCircle:(GMSCircle *)circle
              center:(CLLocationCoordinate2D)center
              radius:(double)radius
         strokeWidth:(float)strokeWidth
         strokeColor:(nullable UIColor *)strokeColor
           fillColor:(nullable UIColor *)fillColor
           clickable:(BOOL)clickable
              zIndex:(nullable NSNumber *)zIndex;

+ (void)updateGroundOverlay:(GMSGroundOverlay *)overlay
                    bearing:(CGFloat)bearing
               transparency:(CGFloat)transparency
                  clickable:(BOOL)clickable
                     zIndex:(nullable NSNumber *)zIndex;

@end
