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

#import "ObjectTranslationUtil.h"

@implementation ObjectTranslationUtil

#pragma mark - Transformation Methods

+ (NSDictionary *)transformCoordinateToDictionary:(CLLocationCoordinate2D)coordinate {
  return @{
    @"lat" : @(coordinate.latitude),
    @"lng" : @(coordinate.longitude),
  };
}

+ (NSDictionary *)transformNavigationWaypointToDictionary:(GMSNavigationWaypoint *)waypoint {
  NSMutableDictionary *dictionary = [[NSMutableDictionary alloc] init];

  dictionary[@"position"] =
      [ObjectTranslationUtil transformCoordinateToDictionary:waypoint.coordinate];
  dictionary[@"preferredHeading"] = @(waypoint.preferredHeading);
  dictionary[@"vehicleStopover"] = @(waypoint.vehicleStopover);
  dictionary[@"preferSameSideOfRoad"] = @(waypoint.preferSameSideOfRoad);

  if (waypoint.title != nil) {
    dictionary[@"title"] = waypoint.title;
  }

  if (waypoint.placeID != nil) {
    dictionary[@"placeId"] = waypoint.placeID;
  }

  return dictionary;
}

+ (NSDictionary *)transformCLLocationToDictionary:(CLLocation *)location {
  NSTimeInterval seconds = [location.timestamp timeIntervalSince1970];
  double time = seconds * 1000;

  NSMutableDictionary *locationDict = [@{
    @"lat" : @(location.coordinate.latitude),
    @"lng" : @(location.coordinate.longitude),
    @"time" : @(time),
    @"speed" : @(location.speed),
  } mutableCopy];

  if (location.horizontalAccuracy >= 0) {
    locationDict[@"accuracy"] = @(location.horizontalAccuracy);
  }

  if (location.course >= 0) {
    locationDict[@"bearing"] = @(location.course);
  }

  if (location.verticalAccuracy > 0) {
    locationDict[@"verticalAccuracy"] = @(location.verticalAccuracy);
    locationDict[@"altitude"] = @(location.altitude);
  }

  return [locationDict copy];
}

+ (NSDictionary *)transformRouteSegmentToDictionary:(GMSRouteLeg *)routeLeg {
  return @{
    @"destinationLatLng" :
        [ObjectTranslationUtil transformCoordinateToDictionary:routeLeg.destinationCoordinate],
    @"destinationWaypoint" : [ObjectTranslationUtil
        transformNavigationWaypointToDictionary:routeLeg.destinationWaypoint],
    @"segmentLatLngList" : [ObjectTranslationUtil transformGMSPathToArray:routeLeg.path],
  };
}

+ (NSDictionary *)transformMarkerToDictionary:(GMSMarker *)marker {
  NSMutableDictionary *dictionary = [[NSMutableDictionary alloc] init];

  dictionary[@"position"] = [ObjectTranslationUtil transformCoordinateToDictionary:marker.position];
  dictionary[@"alpha"] = @(marker.opacity);
  dictionary[@"rotation"] = @(marker.rotation);
  dictionary[@"snippet"] = marker.snippet;
  dictionary[@"zIndex"] = @(marker.zIndex);

  if (marker.title != nil) {
    dictionary[@"title"] = marker.title;
  }

  if ([ObjectTranslationUtil isIdOnUserData:marker.userData]) {
    dictionary[@"id"] = marker.userData[0];
  }

  return dictionary;
}

+ (NSDictionary *)transformPolylineToDictionary:(GMSPolyline *)polyline {
  NSMutableDictionary *dictionary = [[NSMutableDictionary alloc] init];

  dictionary[@"points"] = [ObjectTranslationUtil transformGMSPathToArray:polyline.path];
  dictionary[@"width"] = @(polyline.strokeWidth);
  dictionary[@"zIndex"] = @(polyline.zIndex);

  if (polyline.strokeColor != nil) {
    dictionary[@"color"] = [polyline.strokeColor toColorInt];
  }

  if ([ObjectTranslationUtil isIdOnUserData:polyline.userData]) {
    dictionary[@"id"] = polyline.userData[0];
  }

  return dictionary;
}

+ (NSArray *)transformGMSPathToArray:(GMSPath *)path {
  NSMutableArray *array = [[NSMutableArray alloc] init];

  for (int j = 0; j < path.count; j++) {
    CLLocationCoordinate2D coordinate = [path coordinateAtIndex:j];
    [array addObject:[ObjectTranslationUtil transformCoordinateToDictionary:coordinate]];
  }

  return array;
}

+ (NSDictionary *)transformPolygonToDictionary:(GMSPolygon *)polygon {
  NSMutableArray *holesArray = [[NSMutableArray alloc] init];
  // Each hole is a GMSPath (which is an array of coordinates), the output should be an array of
  // arrays.
  for (int j = 0; j < polygon.holes.count; j++) {
    GMSPath *hole = polygon.holes[j];

    [holesArray addObject:[ObjectTranslationUtil transformGMSPathToArray:hole]];
  }

  NSMutableDictionary *dictionary = [[NSMutableDictionary alloc] init];

  dictionary[@"points"] = [ObjectTranslationUtil transformGMSPathToArray:polygon.path];
  dictionary[@"holes"] = holesArray;
  dictionary[@"strokeWidth"] = @(polygon.strokeWidth);
  dictionary[@"zIndex"] = @(polygon.zIndex);

  if ([ObjectTranslationUtil isIdOnUserData:polygon.userData]) {
    dictionary[@"id"] = polygon.userData[0];
  }

  if (polygon.fillColor != nil) {
    dictionary[@"fillColor"] = [polygon.fillColor toColorInt];
  }

  if (polygon.strokeColor != nil) {
    dictionary[@"strokeColor"] = [polygon.strokeColor toColorInt];
  }

  dictionary[@"geodesic"] = @(polygon.geodesic);

  return dictionary;
}

+ (NSDictionary *)transformCircleToDictionary:(GMSCircle *)circle {
  NSMutableDictionary *dictionary = [[NSMutableDictionary alloc] init];

  dictionary[@"center"] = [ObjectTranslationUtil transformCoordinateToDictionary:circle.position];
  dictionary[@"strokeWidth"] = @(circle.strokeWidth);
  dictionary[@"radius"] = @(circle.radius);
  dictionary[@"zIndex"] = @(circle.zIndex);

  if (circle.strokeColor != nil) {
    dictionary[@"strokeColor"] = [circle.strokeColor toColorInt];
  }

  if (circle.fillColor != nil) {
    dictionary[@"fillColor"] = [circle.fillColor toColorInt];
  }

  if ([ObjectTranslationUtil isIdOnUserData:circle.userData]) {
    dictionary[@"id"] = circle.userData[0];
  }

  return dictionary;
}

+ (NSDictionary *)transformGroundOverlayToDictionary:(GMSGroundOverlay *)overlay {
  NSMutableDictionary *dictionary = [[NSMutableDictionary alloc] init];

  // Position may be nil for bounds-based overlays - calculate from bounds center if so
  if (CLLocationCoordinate2DIsValid(overlay.position)) {
    dictionary[@"position"] =
        [ObjectTranslationUtil transformCoordinateToDictionary:overlay.position];
  } else if (overlay.bounds) {
    // Calculate position from bounds center
    CLLocationCoordinate2D center = CLLocationCoordinate2DMake(
        (overlay.bounds.northEast.latitude + overlay.bounds.southWest.latitude) / 2.0,
        (overlay.bounds.northEast.longitude + overlay.bounds.southWest.longitude) / 2.0);
    dictionary[@"position"] = [ObjectTranslationUtil transformCoordinateToDictionary:center];
  }

  if (overlay.bounds) {
    dictionary[@"bounds"] = @{
      @"northEast" :
          [ObjectTranslationUtil transformCoordinateToDictionary:overlay.bounds.northEast],
      @"southWest" :
          [ObjectTranslationUtil transformCoordinateToDictionary:overlay.bounds.southWest],
      @"center" : [ObjectTranslationUtil
          transformCoordinateToDictionary:CLLocationCoordinate2DMake(
                                              (overlay.bounds.northEast.latitude +
                                               overlay.bounds.southWest.latitude) /
                                                  2.0,
                                              (overlay.bounds.northEast.longitude +
                                               overlay.bounds.southWest.longitude) /
                                                  2.0)],
    };
  }

  dictionary[@"bearing"] = @(overlay.bearing);
  dictionary[@"transparency"] = @(1.0 - overlay.opacity);
  dictionary[@"zIndex"] = @((int)overlay.zIndex);

  if ([ObjectTranslationUtil isIdOnUserData:overlay.userData]) {
    dictionary[@"id"] = overlay.userData[0];
  }

  return dictionary;
}

/** Converts an array of NSDictionary objects representing a LatLng into GMSPath. */
+ (GMSPath *)transformToPath:(NSArray *)latLngs {
  GMSMutablePath *path = [GMSMutablePath path];

  for (NSDictionary *latLngDictionary in latLngs) {
    [path addCoordinate:[ObjectTranslationUtil getLocationCoordinateFrom:latLngDictionary]];
  }

  return path;
}

+ (CLLocationCoordinate2D)getLocationCoordinateFrom:(NSDictionary *)latLngMap {
  double latitude = [[latLngMap objectForKey:@"lat"] doubleValue];
  double longitude = [[latLngMap objectForKey:@"lng"] doubleValue];

  return CLLocationCoordinate2DMake(latitude, longitude);
}

+ (BOOL)isIdOnUserData:(nullable id)userData {
  if (userData == nil) {
    return NO;
  }

  if (![userData isKindOfClass:[NSArray class]]) {
    return NO;
  }

  if (userData[0] == nil || ![userData[0] isKindOfClass:[NSString class]]) {
    return NO;
  }

  return YES;
}

#pragma mark - GMS Object Creation Methods

+ (GMSMarker *)createMarker:(CLLocationCoordinate2D)position
                      title:(nullable NSString *)title
                    snippet:(nullable NSString *)snippet
                      alpha:(float)alpha
                   rotation:(double)rotation
                       flat:(BOOL)flat
                  draggable:(BOOL)draggable
                       icon:(nullable UIImage *)icon
                     zIndex:(nullable NSNumber *)zIndex
                 identifier:(nullable NSString *)identifier {
  GMSMarker *marker = [GMSMarker markerWithPosition:position];
  marker.title = title;
  marker.snippet = snippet;
  marker.opacity = alpha;
  marker.rotation = rotation;
  marker.flat = flat;
  marker.draggable = draggable;
  if (icon) {
    marker.icon = icon;
  }
  if (zIndex) {
    marker.zIndex = [zIndex intValue];
  }
  if (identifier) {
    marker.userData = @[ identifier ];
  }
  return marker;
}

+ (GMSPolyline *)createPolyline:(GMSPath *)path
                          width:(float)width
                          color:(nullable UIColor *)color
                      clickable:(BOOL)clickable
                         zIndex:(nullable NSNumber *)zIndex
                     identifier:(nullable NSString *)identifier {
  GMSPolyline *polyline = [GMSPolyline polylineWithPath:path];
  polyline.strokeWidth = width;
  if (color) {
    polyline.strokeColor = color;
  }
  polyline.tappable = clickable;
  if (zIndex) {
    polyline.zIndex = [zIndex intValue];
  }
  if (identifier) {
    polyline.userData = @[ identifier ];
  }
  return polyline;
}

+ (GMSPolygon *)createPolygon:(GMSPath *)path
                        holes:(nullable NSArray<GMSPath *> *)holes
                    fillColor:(nullable UIColor *)fillColor
                  strokeColor:(nullable UIColor *)strokeColor
                  strokeWidth:(float)strokeWidth
                     geodesic:(BOOL)geodesic
                    clickable:(BOOL)clickable
                       zIndex:(nullable NSNumber *)zIndex
                   identifier:(nullable NSString *)identifier {
  GMSPolygon *polygon = [GMSPolygon polygonWithPath:path];
  if (holes && holes.count > 0) {
    polygon.holes = holes;
  }
  if (fillColor) {
    polygon.fillColor = fillColor;
  }
  if (strokeColor) {
    polygon.strokeColor = strokeColor;
  }
  polygon.strokeWidth = strokeWidth;
  polygon.geodesic = geodesic;
  polygon.tappable = clickable;
  if (zIndex) {
    polygon.zIndex = [zIndex intValue];
  }
  if (identifier) {
    polygon.userData = @[ identifier ];
  }
  return polygon;
}

+ (GMSCircle *)createCircle:(CLLocationCoordinate2D)center
                     radius:(double)radius
                strokeWidth:(float)strokeWidth
                strokeColor:(nullable UIColor *)strokeColor
                  fillColor:(nullable UIColor *)fillColor
                  clickable:(BOOL)clickable
                     zIndex:(nullable NSNumber *)zIndex
                 identifier:(nullable NSString *)identifier {
  GMSCircle *circle = [GMSCircle circleWithPosition:center radius:radius];
  circle.strokeWidth = strokeWidth;
  if (strokeColor) {
    circle.strokeColor = strokeColor;
  }
  if (fillColor) {
    circle.fillColor = fillColor;
  }
  circle.tappable = clickable;
  if (zIndex) {
    circle.zIndex = [zIndex intValue];
  }
  if (identifier) {
    circle.userData = @[ identifier ];
  }
  return circle;
}

+ (GMSGroundOverlay *)createGroundOverlayWithPosition:(CLLocationCoordinate2D)position
                                                 icon:(UIImage *)icon
                                            zoomLevel:(CGFloat)zoomLevel
                                              bearing:(CGFloat)bearing
                                         transparency:(CGFloat)transparency
                                               anchor:(CGPoint)anchor
                                            clickable:(BOOL)clickable
                                               zIndex:(nullable NSNumber *)zIndex
                                           identifier:(nullable NSString *)identifier {
  GMSGroundOverlay *overlay = [GMSGroundOverlay groundOverlayWithPosition:position
                                                                     icon:icon
                                                                zoomLevel:zoomLevel];
  overlay.bearing = bearing;
  overlay.opacity = 1.0 - transparency;
  overlay.anchor = anchor;
  overlay.tappable = clickable;
  if (zIndex) {
    overlay.zIndex = [zIndex intValue];
  }
  // Always set userData with an identifier (generate UUID if not provided)
  NSString *overlayId = identifier ?: [[NSUUID UUID] UUIDString];
  overlay.userData = @[ overlayId ];
  return overlay;
}

+ (GMSGroundOverlay *)createGroundOverlayWithBounds:(GMSCoordinateBounds *)bounds
                                               icon:(UIImage *)icon
                                            bearing:(CGFloat)bearing
                                       transparency:(CGFloat)transparency
                                             anchor:(CGPoint)anchor
                                          clickable:(BOOL)clickable
                                             zIndex:(nullable NSNumber *)zIndex
                                         identifier:(nullable NSString *)identifier {
  GMSGroundOverlay *overlay = [GMSGroundOverlay groundOverlayWithBounds:bounds icon:icon];
  overlay.bearing = bearing;
  overlay.opacity = 1.0 - transparency;
  overlay.anchor = anchor;
  overlay.tappable = clickable;
  if (zIndex) {
    overlay.zIndex = [zIndex intValue];
  }
  // Always set userData with an identifier (generate UUID if not provided)
  NSString *overlayId = identifier ?: [[NSUUID UUID] UUIDString];
  overlay.userData = @[ overlayId ];
  return overlay;
}

#pragma mark - GMS Object Update Methods

+ (void)updateMarker:(GMSMarker *)marker
               title:(nullable NSString *)title
             snippet:(nullable NSString *)snippet
               alpha:(float)alpha
            rotation:(double)rotation
                flat:(BOOL)flat
           draggable:(BOOL)draggable
                icon:(nullable UIImage *)icon
              zIndex:(nullable NSNumber *)zIndex
            position:(CLLocationCoordinate2D)position {
  marker.position = position;
  marker.title = title;
  marker.snippet = snippet;
  marker.opacity = alpha;
  marker.rotation = rotation;
  marker.flat = flat;
  marker.draggable = draggable;
  if (icon) {
    marker.icon = icon;
  }
  if (zIndex) {
    marker.zIndex = [zIndex intValue];
  }
}

+ (void)updatePolyline:(GMSPolyline *)polyline
                  path:(GMSPath *)path
                 width:(float)width
                 color:(nullable UIColor *)color
             clickable:(BOOL)clickable
                zIndex:(nullable NSNumber *)zIndex {
  polyline.path = path;
  polyline.strokeWidth = width;
  if (color) {
    polyline.strokeColor = color;
  }
  polyline.tappable = clickable;
  if (zIndex) {
    polyline.zIndex = [zIndex intValue];
  }
}

+ (void)updatePolygon:(GMSPolygon *)polygon
                 path:(GMSPath *)path
                holes:(nullable NSArray<GMSPath *> *)holes
            fillColor:(nullable UIColor *)fillColor
          strokeColor:(nullable UIColor *)strokeColor
          strokeWidth:(float)strokeWidth
             geodesic:(BOOL)geodesic
            clickable:(BOOL)clickable
               zIndex:(nullable NSNumber *)zIndex {
  polygon.path = path;
  if (holes && holes.count > 0) {
    polygon.holes = holes;
  } else {
    polygon.holes = nil;
  }
  if (fillColor) {
    polygon.fillColor = fillColor;
  }
  if (strokeColor) {
    polygon.strokeColor = strokeColor;
  }
  polygon.strokeWidth = strokeWidth;
  polygon.geodesic = geodesic;
  polygon.tappable = clickable;
  if (zIndex) {
    polygon.zIndex = [zIndex intValue];
  }
}

+ (void)updateCircle:(GMSCircle *)circle
              center:(CLLocationCoordinate2D)center
              radius:(double)radius
         strokeWidth:(float)strokeWidth
         strokeColor:(nullable UIColor *)strokeColor
           fillColor:(nullable UIColor *)fillColor
           clickable:(BOOL)clickable
              zIndex:(nullable NSNumber *)zIndex {
  circle.position = center;
  circle.radius = radius;
  circle.strokeWidth = strokeWidth;
  if (strokeColor) {
    circle.strokeColor = strokeColor;
  }
  if (fillColor) {
    circle.fillColor = fillColor;
  }
  circle.tappable = clickable;
  if (zIndex) {
    circle.zIndex = [zIndex intValue];
  }
}

+ (void)updateGroundOverlay:(GMSGroundOverlay *)overlay
                    bearing:(CGFloat)bearing
               transparency:(CGFloat)transparency
                  clickable:(BOOL)clickable
                     zIndex:(nullable NSNumber *)zIndex {
  overlay.bearing = bearing;
  overlay.opacity = 1.0 - transparency;
  overlay.tappable = clickable;
  if (zIndex) {
    overlay.zIndex = [zIndex intValue];
  }
}

@end
