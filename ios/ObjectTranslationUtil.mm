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
#import <GoogleNavigation/GoogleNavigation.h>  // Needed for GMS types
#import <UIKit/UIKit.h>                        // Needed for UIColor, UIImage

@implementation ObjectTranslationUtil

#pragma mark - Color Utility

+ (UIColor *)colorFromHexString:(NSString *)hexString {
  NSString *hexValueString = [hexString stringByReplacingOccurrencesOfString:@"#" withString:@""];
  NSUInteger length = [hexValueString length];
  NSScanner *scanner = [NSScanner scannerWithString:hexValueString];

  unsigned hexValue = 0;
  unsigned int r, g, b, a = 255;

  if (![scanner scanHexInt:&hexValue]) return nil;
  if (length == 3) {  // #RGB
    r = ((hexValue & 0xF00) >> 8) * 17;
    g = ((hexValue & 0x0F0) >> 4) * 17;
    b = (hexValue & 0x00F) * 17;
  } else if (length == 4) {  // #RGBA
    r = ((hexValue & 0xF000) >> 12) * 17;
    g = ((hexValue & 0x0F00) >> 8) * 17;
    b = ((hexValue & 0x00F0) >> 4) * 17;
    a = (hexValue & 0x000F) * 17;
  } else if (length == 6) {  // #RRGGBB
    r = (hexValue & 0xFF0000) >> 16;
    g = (hexValue & 0x00FF00) >> 8;
    b = hexValue & 0x0000FF;
  } else if (length == 8) {  // #RRGGBBAA
    r = (hexValue & 0xFF000000) >> 24;
    g = (hexValue & 0x00FF0000) >> 16;
    b = (hexValue & 0x0000FF00) >> 8;
    a = hexValue & 0x000000FF;
  } else {
    // Unsupported format
    return nil;
  }

  return [UIColor colorWithRed:(r / 255.0f)
                         green:(g / 255.0f)
                          blue:(b / 255.0f)
                         alpha:(a / 255.0f)];
}

+ (NSString *)hexStringFromColor:(UIColor *)color {
  CGFloat red, green, blue, alpha;
  if ([color getRed:&red green:&green blue:&blue alpha:&alpha]) {
    return
        [NSString stringWithFormat:@"#%02lX%02lX%02lX%02lX", lroundf(alpha * 255),
                                   lroundf(red * 255), lroundf(green * 255), lroundf(blue * 255)];
  }
  return nil;  // Return nil if color components cannot be extracted
}

#pragma mark - Creation Methods

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
  marker.tappable = YES;  // Defaulting to tappable
  marker.icon = icon;
  if (zIndex) {
    marker.zIndex = [zIndex intValue];
  }
  if (identifier) {
    marker.userData = @[ identifier ];
  } else {
    marker.userData = @[ [[NSUUID UUID] UUIDString] ];  // Assign a unique generated ID
  }
  return marker;
}

+ (GMSPolyline *)createPolyline:(GMSPath *)path
                          width:(float)width
                          color:(UIColor *)color
                      clickable:(BOOL)clickable
                         zIndex:(nullable NSNumber *)zIndex
                     identifier:(nullable NSString *)identifier {
  GMSPolyline *polyline = [GMSPolyline polylineWithPath:path];
  polyline.strokeWidth = width;
  polyline.strokeColor = color;
  polyline.tappable = clickable;
  if (zIndex) {
    polyline.zIndex = [zIndex intValue];
  }
  if (identifier) {
    polyline.userData = @[ identifier ];
  } else {
    polyline.userData = @[ [[NSUUID UUID] UUIDString] ];  // Assign a unique generated ID
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
  polygon.holes = holes;
  polygon.fillColor = fillColor;
  polygon.strokeColor = strokeColor;
  polygon.strokeWidth = strokeWidth;
  polygon.geodesic = geodesic;
  polygon.tappable = clickable;
  if (zIndex) {
    polygon.zIndex = [zIndex intValue];
  }
  if (identifier) {
    polygon.userData = @[ identifier ];
  } else {
    polygon.userData = @[ [[NSUUID UUID] UUIDString] ];  // Assign a unique generated ID
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
  circle.strokeColor = strokeColor;
  circle.fillColor = fillColor;
  circle.tappable = clickable;
  if (zIndex) {
    circle.zIndex = [zIndex intValue];
  }
  if (identifier) {
    circle.userData = @[ identifier ];
  } else {
    circle.userData = @[ [[NSUUID UUID] UUIDString] ];  // Assign a unique generated ID
  }
  return circle;
}

+ (GMSGroundOverlay *)createGroundOverlay:(CLLocationCoordinate2D)position
                                     icon:(UIImage *)icon
                                    width:(CGFloat)width
                                   height:(CGFloat)height
                                  bearing:(CGFloat)bearing
                             transparency:(CGFloat)transparency
                                clickable:(BOOL)clickable
                               identifier:(nullable NSString *)identifier {
  // Calculate bounds based on center, width, height
  // Approximation: 1 degree latitude ~= 111111 meters
  // Approximation: 1 degree longitude ~= 111111 * cos(latitude) meters
  double latDelta = (height / 2.0) / 111111.0;
  double lonDelta = (width / 2.0) / (111111.0 * cos(position.latitude * M_PI / 180.0));

  CLLocationCoordinate2D northeast =
      CLLocationCoordinate2DMake(position.latitude + latDelta, position.longitude + lonDelta);
  CLLocationCoordinate2D southwest =
      CLLocationCoordinate2DMake(position.latitude - latDelta, position.longitude - lonDelta);

  GMSCoordinateBounds *overlayBounds = [[GMSCoordinateBounds alloc] initWithCoordinate:southwest
                                                                            coordinate:northeast];

  GMSGroundOverlay *overlay = [GMSGroundOverlay groundOverlayWithBounds:overlayBounds icon:icon];
  overlay.bearing = bearing;
  overlay.opacity = 1.0 - transparency;  // Convert transparency (0-1) to opacity (0-1)
  overlay.tappable = clickable;
  if (identifier) {
    overlay.userData = @[ identifier ];
  } else {
    overlay.userData = @[ [[NSUUID UUID] UUIDString] ];  // Assign a unique generated ID
  }
  return overlay;
}

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
    dictionary[@"color"] = [ObjectTranslationUtil hexStringFromColor:polyline.strokeColor];
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
  // Each hole is a GMSPath (which is an array of coordinates), the output
  // should be an array of arrays.
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
    dictionary[@"fillColor"] = [ObjectTranslationUtil hexStringFromColor:polygon.fillColor];
  }

  if (polygon.strokeColor != nil) {
    dictionary[@"strokeColor"] = [ObjectTranslationUtil hexStringFromColor:polygon.strokeColor];
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
    dictionary[@"strokeColor"] = [ObjectTranslationUtil hexStringFromColor:circle.strokeColor];
  }

  if (circle.fillColor != nil) {
    dictionary[@"fillColor"] = [ObjectTranslationUtil hexStringFromColor:circle.fillColor];
  }

  if ([ObjectTranslationUtil isIdOnUserData:circle.userData]) {
    dictionary[@"id"] = circle.userData[0];
  }

  return dictionary;
}

+ (NSDictionary *)transformGroundOverlayToDictionary:(GMSGroundOverlay *)overlay {
  NSMutableDictionary *dictionary = [[NSMutableDictionary alloc] init];

  dictionary[@"position"] =
      [ObjectTranslationUtil transformCoordinateToDictionary:overlay.position];
  dictionary[@"bounds"] = @{
    @"northEast" : [ObjectTranslationUtil transformCoordinateToDictionary:overlay.bounds.northEast],
    @"southWest" : [ObjectTranslationUtil transformCoordinateToDictionary:overlay.bounds.southWest],
  };

  dictionary[@"bearing"] = @(overlay.bearing);
  dictionary[@"transparency"] = @(overlay.opacity);
  dictionary[@"zIndex"] = @(overlay.zIndex);

  if ([ObjectTranslationUtil isIdOnUserData:overlay.userData]) {
    dictionary[@"id"] = overlay.userData[0];
  }

  return dictionary;
}

/** Converts an array of NSDictionary objects representing a LatLng into
 * GMSPath. */
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

@end
