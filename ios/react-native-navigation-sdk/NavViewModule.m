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

#import "NavViewModule.h"

@implementation NavViewModule

RCT_EXPORT_MODULE(NavViewModule);

+ (id)allocWithZone:(NSZone *)zone {
  static NavViewModule *sharedInstance = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedInstance = [super allocWithZone:zone];
  });
  return sharedInstance;
}

RCT_EXPORT_METHOD(getCurrentTimeAndDistance
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [self->_viewController getCurrentTimeAndDistance:^(NSDictionary *result) {
      resolve(result);
    }];
  });
}

RCT_EXPORT_METHOD(getCurrentRouteSegment
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [self->_viewController getCurrentRouteSegment:^(NSDictionary *result) {
      resolve(result);
    }];
  });
}

RCT_EXPORT_METHOD(getRouteSegments
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [self->_viewController getRouteSegments:^(NSArray *result) {
      resolve(result);
    }];
  });
}

RCT_EXPORT_METHOD(getTraveledPath
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [self->_viewController getTraveledPath:^(NSArray *_Nonnull result) {
      resolve(result);
    }];
  });
}

RCT_EXPORT_METHOD(getCameraPosition
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [self->_viewController getCameraPosition:^(NSDictionary *_Nonnull result) {
      resolve(result);
    }];
  });
}

RCT_EXPORT_METHOD(getMyLocation
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [self->_viewController getMyLocation:^(NSDictionary *_Nonnull result) {
      resolve(result);
    }];
  });
}

RCT_EXPORT_METHOD(getUiSettings
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [self->_viewController getUiSettings:^(NSDictionary *_Nonnull result) {
      resolve(result);
    }];
  });
}

RCT_EXPORT_METHOD(isMyLocationEnabled
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [self->_viewController isMyLocationEnabled:^(BOOL result) {
      if (result == NO) {
        resolve(@"false");
      } else {
        resolve(@"true");
      }
    }];
  });
}

RCT_EXPORT_METHOD(areTermsAccepted
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [self->_viewController areTermsAccepted:^(BOOL result) {
      if (result == NO) {
        resolve(@"false");
      } else {
        resolve(@"true");
      }
    }];
  });
}

RCT_EXPORT_METHOD(getNavSDKVersion
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [self->_viewController getNavSDKVersion:^(NSString *_Nonnull result) {
      resolve(result);
    }];
  });
}

RCT_EXPORT_METHOD(addMarker
                  : (NSDictionary *)markerOptions promise
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [self->_viewController addMarker:markerOptions
                              result:^(NSDictionary *_Nonnull result) {
                                resolve(result);
                              }];
  });
}

RCT_EXPORT_METHOD(addPolyline
                  : (NSDictionary *)polylineOptions promise
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [self->_viewController addPolyline:polylineOptions
                                result:^(NSDictionary *_Nonnull result) {
                                  resolve(result);
                                }];
  });
}

RCT_EXPORT_METHOD(addPolygon
                  : (NSDictionary *)polygonOptions promise
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [self->_viewController addPolygon:polygonOptions
                               result:^(NSDictionary *_Nonnull result) {
                                 resolve(result);
                               }];
  });
}

RCT_EXPORT_METHOD(addCircle
                  : (NSDictionary *)circleOptions promise
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [self->_viewController addCircle:circleOptions
                              result:^(NSDictionary *_Nonnull result) {
                                resolve(result);
                              }];
  });
}

RCT_EXPORT_METHOD(addGroundOverlay
                  : (NSDictionary *)overlayOptions promise
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [self->_viewController addGroundOverlay:overlayOptions
                                     result:^(NSDictionary *_Nonnull result) {
                                       resolve(result);
                                     }];
  });
}

@end
