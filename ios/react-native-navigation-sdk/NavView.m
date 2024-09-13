// Copyright 2024 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#import "NavView.h"
#import "NavViewController.h"

@interface NavView ()

@property(nonatomic, strong) NavViewController *viewController;

@end

@implementation NavView

- (void)layoutSubviews {
  [super layoutSubviews];
  if (self.superview) {
    self.translatesAutoresizingMaskIntoConstraints = NO;  // Disable auto-resizing mask
    [NSLayoutConstraint activateConstraints:@[
      [self.leadingAnchor constraintEqualToAnchor:self.superview.leadingAnchor],
      [self.trailingAnchor constraintEqualToAnchor:self.superview.trailingAnchor],
      [self.topAnchor constraintEqualToAnchor:self.superview.topAnchor],
      [self.bottomAnchor constraintEqualToAnchor:self.superview.bottomAnchor]
    ]];
  }
}

- (NavViewController *)initializeViewControllerWithStylingOptions:(NSDictionary *)stylingOptions
                                                     fragmentType:(FragmentType)fragmentType {
  _viewController = [[NavViewController alloc] init];
  // FragmentType 0 = MAP, 1 = NAVIGATION.
  _viewController.isNavigationEnabled = fragmentType == NAVIGATION;
  // Test if styling options is not nil
  if (stylingOptions != nil && [stylingOptions count] > 0) {
    [_viewController setStylingOptions:stylingOptions];
  }
  [_viewController setNavigationCallbacks:self];
  [self addSubview:_viewController.view];

  _viewController.view.translatesAutoresizingMaskIntoConstraints = NO;
  [NSLayoutConstraint activateConstraints:@[
    [_viewController.view.leadingAnchor constraintEqualToAnchor:self.leadingAnchor],
    [_viewController.view.trailingAnchor constraintEqualToAnchor:self.trailingAnchor],
    [_viewController.view.topAnchor constraintEqualToAnchor:self.topAnchor],
    [_viewController.view.bottomAnchor constraintEqualToAnchor:self.bottomAnchor]
  ]];

  return _viewController;
}

- (void)handleRecenterButtonClick {
  if (self.onRecenterButtonClick) {
    self.onRecenterButtonClick(nil);
  }
}

- (void)handleMapReady {
  if (self.onMapReady) {
    self.onMapReady(nil);
  }
}

- (NavViewController *)getViewController {
  return _viewController;
}

- (void)handleMapClick:(NSDictionary *)latLngMap {
  if (self.onMapClick) {
    self.onMapClick(latLngMap);
  }
}

- (void)handleMarkerInfoWindowTapped:(GMSMarker *)marker {
  if (self.onMarkerInfoWindowTapped) {
    self.onMarkerInfoWindowTapped([ObjectTranslationUtil transformMarkerToDictionary:marker]);
  }
}

- (void)handleMarkerClick:(GMSMarker *)marker {
  if (self.onMarkerClick) {
    self.onMarkerClick([ObjectTranslationUtil transformMarkerToDictionary:marker]);
  }
}

- (void)handlePolylineClick:(GMSPolyline *)polyline {
  if (self.onPolylineClick) {
    self.onPolylineClick([ObjectTranslationUtil transformPolylineToDictionary:polyline]);
  }
}

- (void)handlePolygonClick:(GMSPolygon *)polygon {
  if (self.onPolygonClick) {
    self.onPolygonClick([ObjectTranslationUtil transformPolygonToDictionary:polygon]);
  }
}

- (void)handleCircleClick:(GMSCircle *)circle {
  if (self.onCircleClick) {
    self.onCircleClick([ObjectTranslationUtil transformCircleToDictionary:circle]);
  }
}

- (void)handleGroundOverlayClick:(GMSGroundOverlay *)groundOverlay {
  if (self.onGroundOverlayClick) {
    self.onGroundOverlayClick(
        [ObjectTranslationUtil transformGroundOverlayToDictionary:groundOverlay]);
  }
}

@end
