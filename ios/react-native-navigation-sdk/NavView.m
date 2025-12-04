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
#import <GoogleMaps/GoogleMaps.h>
#import "NavViewController.h"
#import "ObjectTranslationUtil.h"

@interface NavView ()

@property(nonatomic, strong) NavViewController *viewController;

@end

@implementation NavView

- (instancetype)initWithFrame:(CGRect)frame {
  self = [super initWithFrame:frame];
  return self;
}

- (instancetype)initWithCoder:(NSCoder *)coder {
  self = [super initWithCoder:coder];
  return self;
}

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

- (NavViewController *)initializeViewControllerWithMapViewType:(MapViewType)mapViewType
                                                         mapId:(NSString *)mapId
                                                stylingOptions:(NSDictionary *)stylingOptions
                                                mapColorScheme:(NSNumber *)colorScheme
                                                     nightMode:(NSNumber *)nightMode {
  // Initialize view controller with the map view type
  _viewController = [[NavViewController alloc] initWithMapViewType:mapViewType];

  if (mapId) {
    [_viewController setMapId:mapId];
  }

  if (stylingOptions && [stylingOptions count] > 0) {
    [_viewController setStylingOptions:stylingOptions];
  }

  if (colorScheme) {
    [_viewController setColorScheme:colorScheme];
  }

  if (nightMode) {
    [_viewController setNightMode:nightMode];
  }

  [_viewController setNavigationViewCallbacks:self];
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

- (void)applyStylingOptions:(NSDictionary *)stylingOptions {
  if (stylingOptions != nil && [stylingOptions count] > 0) {
    [_viewController setStylingOptions:stylingOptions];
  }
}

- (void)applyMapColorScheme:(NSNumber *)colorScheme {
  [_viewController setColorScheme:colorScheme];
}

- (void)applyNightMode:(NSNumber *)nightMode {
  [_viewController setNightMode:nightMode];
}

- (void)handleRecenterButtonClick {
  if (self.onRecenterButtonClick) {
    self.onRecenterButtonClick(nil);
  }
}

- (void)handlePromptVisibilityChanged:(BOOL)visible {
  if (self.onPromptVisibilityChanged) {
    self.onPromptVisibilityChanged(@{
      @"visible" : @(visible),
    });
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

- (void)handleMapDrag:(GMSCameraPosition *)cameraPosition {
  if (self.onMapDrag) {
    self.onMapDrag(@{@"cameraPosition" : cameraPosition});
  }
}

- (void)handleMapDragEnd:(GMSCameraPosition *)cameraPosition {
  if (self.onMapDragEnd) {
    self.onMapDragEnd(@{@"cameraPosition" : cameraPosition});
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

- (void)willMoveToSuperview:(UIView *)newSuperview {
  [super willMoveToSuperview:newSuperview];
  if (newSuperview == nil && _viewController) {
    // View is being removed from hierarchy, cleanup the view controller
    [self cleanup];
  }
}

- (void)dealloc {
  [self cleanup];
}

- (void)cleanup {
  if (self.cleanupBlock) {
    self.cleanupBlock(self.reactTag);
    self.cleanupBlock = nil;
  }

  if (_viewController) {
    [_viewController.view removeFromSuperview];
    _viewController = nil;
  }
}

@end
