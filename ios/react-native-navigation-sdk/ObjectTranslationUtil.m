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
    dictionary[@"color"] = polyline.strokeColor;
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
    dictionary[@"fillColor"] = polygon.fillColor;
  }

  if (polygon.strokeColor != nil) {
    dictionary[@"strokeColor"] = polygon.strokeColor;
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
    dictionary[@"strokeColor"] = circle.strokeColor;
  }

  if (circle.fillColor != nil) {
    dictionary[@"fillColor"] = circle.fillColor;
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

@end
