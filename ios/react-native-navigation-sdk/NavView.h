/*
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#import <React/RCTBridge.h>
#import <React/RCTComponent.h>
#import <React/RCTViewManager.h>
#import "CustomTypes.h"
#import "INavigationViewCallback.h"

@class NavViewController;

@interface NavView : UIView <INavigationViewCallback>

@property(nonatomic, copy) RCTDirectEventBlock onRecenterButtonClick;
@property(nonatomic, copy) RCTDirectEventBlock onMapReady;
@property(nonatomic, copy) RCTDirectEventBlock onMapClick;
@property(nonatomic, copy) RCTDirectEventBlock onMarkerInfoWindowTapped;
@property(nonatomic, copy) RCTDirectEventBlock onMarkerClick;
@property(nonatomic, copy) RCTDirectEventBlock onPolylineClick;
@property(nonatomic, copy) RCTDirectEventBlock onPolygonClick;
@property(nonatomic, copy) RCTDirectEventBlock onCircleClick;
@property(nonatomic, copy) RCTDirectEventBlock onGroundOverlayClick;

- (NavViewController *)initializeViewControllerWithStylingOptions:(NSDictionary *)stylingOptions
                                                     fragmentType:(FragmentType)fragmentType;
- (NavViewController *)getViewController;

@end
