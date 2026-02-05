// Copyright 2026 Google LLC
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
#import "FabricObjectTranslationUtil.h"
#import "NavModule.h"
#import "NavViewController.h"
#import "NavViewModule.h"
#import "ObjectTranslationUtil.h"

#import <GoogleMaps/GoogleMaps.h>
#import <React/RCTConversions.h>
#import <react/renderer/components/RNNavigationSdkSpec/ComponentDescriptors.h>
#import <react/renderer/components/RNNavigationSdkSpec/EventEmitters.h>
#import <react/renderer/components/RNNavigationSdkSpec/Props.h>
#import <react/renderer/components/RNNavigationSdkSpec/RCTComponentViewHelpers.h>

using namespace facebook::react;

static const std::shared_ptr<const NavViewProps> kDefaultNavViewProps =
    std::make_shared<const NavViewProps>();

@interface NavView () <RCTNavViewViewProtocol>

@property(nonatomic, strong) NavViewController *viewController;
@property(nonatomic, assign) BOOL initialized;

@end

@implementation NavView

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    _props = kDefaultNavViewProps;
    _initialized = NO;
    _viewController = nil;  // Will be created when mapOptions are received
  }
  return self;
}

// View recycling is not supported for this component
+ (BOOL)shouldBeRecycled {
  return NO;
}

- (void)dealloc {
  [self unregisterView];
}

- (void)unregisterView {
  const auto &currentProps = *std::static_pointer_cast<NavViewProps const>(_props);

  if (!currentProps.nativeID.empty()) {
    NSString *nativeIDString = [NSString stringWithUTF8String:currentProps.nativeID.c_str()];
    [[NavViewModule viewControllersRegistry] removeObjectForKey:nativeIDString];
  }
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps {
  const auto &newViewProps = *std::static_pointer_cast<NavViewProps const>(props);

  // Initialize view controller on first update with viewInitializationParams
  // Check if params are actually set by checking viewType >= 0 (defaults to -1)
  if (!_initialized && _viewController == nil && !newViewProps.nativeID.empty() &&
      newViewProps.viewInitializationParams.viewType >= 0) {
    const auto &initParams = newViewProps.viewInitializationParams;

    _viewController = [[NavViewController alloc] init];

    // Set map view type (MAP vs NAVIGATION) before loading view
    // viewType: MAP=0, NAVIGATION=1
    MapViewType mapViewType =
        (initParams.viewType == static_cast<int>(NAVIGATION)) ? NAVIGATION : MAP;
    [_viewController setMapViewType:mapViewType];

    // Set mapId before loading view (required for GMSMapView initialization)
    if (!initParams.mapId.empty()) {
      NSString *mapId = [NSString stringWithUTF8String:initParams.mapId.c_str()];
      [_viewController setMapId:mapId];
    }

    // Set color scheme before loading view
    [_viewController setColorScheme:@(initParams.mapColorScheme)];

    // Set navigation night mode before loading view
    [_viewController setNightMode:@(initParams.navigationNightMode)];

    // Store navigation UI enabled preference (will be applied after session attachment)
    // AUTOMATIC (0): Enable UI when session is attached
    // DISABLED (1): Keep UI disabled
    [_viewController setNavigationUIEnabledPreference:initParams.navigationUIEnabledPreference];

    // Set initial camera position if provided
    if (initParams.hasCameraPosition && initParams.cameraPosition.hasTarget) {
      const auto &camPos = initParams.cameraPosition;
      GMSMutableCameraPosition *initialCamera = [[GMSMutableCameraPosition alloc] init];

      // Set target if provided
      if (camPos.target.lat != 0.0 || camPos.target.lng != 0.0) {
        initialCamera.target = CLLocationCoordinate2DMake(camPos.target.lat, camPos.target.lng);
      }

      // Set camera properties
      initialCamera.zoom = camPos.zoom;
      initialCamera.bearing = camPos.bearing;
      initialCamera.viewingAngle = camPos.tilt;

      [_viewController setInitialCameraPosition:initialCamera];
    }

    // Load the view (this calls loadView internally which uses all set properties)
    [_viewController setNavigationViewCallbacks:self];
    [self addSubview:_viewController.view];

    // Set up constraints for proper layout
    _viewController.view.translatesAutoresizingMaskIntoConstraints = NO;
    [NSLayoutConstraint activateConstraints:@[
      [_viewController.view.leadingAnchor constraintEqualToAnchor:self.leadingAnchor],
      [_viewController.view.trailingAnchor constraintEqualToAnchor:self.trailingAnchor],
      [_viewController.view.topAnchor constraintEqualToAnchor:self.topAnchor],
      [_viewController.view.bottomAnchor constraintEqualToAnchor:self.bottomAnchor]
    ]];

    // Register view controller with nativeID in the registry
    NSString *nativeIDString = [NSString stringWithUTF8String:newViewProps.nativeID.c_str()];
    [NavViewModule viewControllersRegistry][nativeIDString] = _viewController;

    // If navigation session is already initialized, trigger attachment check
    NavModule *navModule = [NavModule sharedInstance];
    if (navModule && [navModule hasSession]) {
      [_viewController onNavigationSessionReady];
    }
  }

  // Skip updates if view controller not yet created
  if (_viewController == nil) {
    // Call super to update props even if no controller yet, to keep RN internal state consistent.
    [super updateProps:props oldProps:oldProps];
    return;
  }

  // Use the incoming params as the source of truth
  // Before _initialized use default props for previous comparison to be sure all props are applied,
  // even those that were set before init.
  const auto &previousViewProps =
      (!_initialized ? *kDefaultNavViewProps
                     : *std::static_pointer_cast<NavViewProps const>(oldProps ? oldProps : _props));

  // Update dynamic props that can change after initialization

  // Update navigation styling options
  if (previousViewProps.navigationViewStylingOptions != newViewProps.navigationViewStylingOptions) {
    id stylingOptions = convertFollyDynamicToId(newViewProps.navigationViewStylingOptions);
    // Convert NSNull to nil before passing to native code
    if ([stylingOptions isKindOfClass:[NSNull class]]) {
      stylingOptions = nil;
    }
    [_viewController setStylingOptions:stylingOptions];
  }

  // Update map type (can change after init)
  if (previousViewProps.mapType != newViewProps.mapType) {
    GMSMapViewType mapViewType;
    switch (newViewProps.mapType) {
      case 1:
        mapViewType = kGMSTypeNormal;
        break;
      case 2:
        mapViewType = kGMSTypeSatellite;
        break;
      case 3:
        mapViewType = kGMSTypeTerrain;
        break;
      case 4:
        mapViewType = kGMSTypeHybrid;
        break;
      default:
        mapViewType = kGMSTypeNone;
        break;
    }
    [_viewController setMapType:mapViewType];
  }

  // Update map padding
  if (previousViewProps.mapPadding.top != newViewProps.mapPadding.top ||
      previousViewProps.mapPadding.left != newViewProps.mapPadding.left ||
      previousViewProps.mapPadding.bottom != newViewProps.mapPadding.bottom ||
      previousViewProps.mapPadding.right != newViewProps.mapPadding.right) {
    [_viewController
        setPadding:UIEdgeInsetsMake(newViewProps.mapPadding.top, newViewProps.mapPadding.left,
                                    newViewProps.mapPadding.bottom, newViewProps.mapPadding.right)];
  }

  // Update zoom levels
  if (previousViewProps.minZoomLevel != newViewProps.minZoomLevel ||
      previousViewProps.maxZoomLevel != newViewProps.maxZoomLevel) {
    [_viewController setMinZoomLevel:newViewProps.minZoomLevel maxZoom:newViewProps.maxZoomLevel];
  }

  // Update map color scheme (can change after init)
  if (previousViewProps.mapColorScheme != newViewProps.mapColorScheme) {
    [_viewController setColorScheme:@(newViewProps.mapColorScheme)];
  }

  // Update navigation night mode (can change after init)
  if (previousViewProps.navigationNightMode != newViewProps.navigationNightMode) {
    [_viewController setNightMode:@(newViewProps.navigationNightMode)];
  }

  // Update map style
  if (previousViewProps.mapStyle != newViewProps.mapStyle) {
    NSString *jsonString = [NSString stringWithUTF8String:newViewProps.mapStyle.c_str()];
    GMSMapStyle *style = [GMSMapStyle styleWithJSONString:jsonString error:nil];
    [_viewController setMapStyle:style];
  }

  if (previousViewProps.indoorEnabled != newViewProps.indoorEnabled) {
    [_viewController setIndoorEnabled:newViewProps.indoorEnabled];
  }
  if (previousViewProps.indoorLevelPickerEnabled != newViewProps.indoorLevelPickerEnabled) {
    [_viewController setIndoorLevelPickerEnabled:newViewProps.indoorLevelPickerEnabled];
  }
  if (previousViewProps.trafficEnabled != newViewProps.trafficEnabled) {
    [_viewController setTrafficEnabled:newViewProps.trafficEnabled];
  }
  if (previousViewProps.compassEnabled != newViewProps.compassEnabled) {
    [_viewController setCompassEnabled:newViewProps.compassEnabled];
  }
  if (previousViewProps.myLocationButtonEnabled != newViewProps.myLocationButtonEnabled) {
    [_viewController setMyLocationButtonEnabled:newViewProps.myLocationButtonEnabled];
  }
  if (previousViewProps.myLocationEnabled != newViewProps.myLocationEnabled) {
    [_viewController setMyLocationEnabled:newViewProps.myLocationEnabled];
  }
  if (previousViewProps.rotateGesturesEnabled != newViewProps.rotateGesturesEnabled) {
    [_viewController setRotateGesturesEnabled:newViewProps.rotateGesturesEnabled];
  }
  if (previousViewProps.scrollGesturesEnabled != newViewProps.scrollGesturesEnabled) {
    [_viewController setScrollGesturesEnabled:newViewProps.scrollGesturesEnabled];
  }
  if (previousViewProps.scrollGesturesEnabledDuringRotateOrZoom !=
      newViewProps.scrollGesturesEnabledDuringRotateOrZoom) {
    [_viewController
        setScrollGesturesEnabledDuringRotateOrZoom:newViewProps
                                                       .scrollGesturesEnabledDuringRotateOrZoom];
  }
  if (previousViewProps.tiltGesturesEnabled != newViewProps.tiltGesturesEnabled) {
    [_viewController setTiltGesturesEnabled:newViewProps.tiltGesturesEnabled];
  }
  if (previousViewProps.zoomGesturesEnabled != newViewProps.zoomGesturesEnabled) {
    [_viewController setZoomGesturesEnabled:newViewProps.zoomGesturesEnabled];
  }
  if (previousViewProps.buildingsEnabled != newViewProps.buildingsEnabled) {
    [_viewController setBuildingsEnabled:newViewProps.buildingsEnabled];
  }
  if (previousViewProps.tripProgressBarEnabled != newViewProps.tripProgressBarEnabled) {
    [_viewController setTripProgressBarEnabled:newViewProps.tripProgressBarEnabled];
  }
  if (previousViewProps.trafficPromptsEnabled != newViewProps.trafficPromptsEnabled) {
    [_viewController setTrafficPromptsEnabled:newViewProps.trafficPromptsEnabled];
  }
  if (previousViewProps.trafficIncidentCardsEnabled != newViewProps.trafficIncidentCardsEnabled) {
    [_viewController setTrafficIncidentCardsEnabled:newViewProps.trafficIncidentCardsEnabled];
  }
  if (previousViewProps.headerEnabled != newViewProps.headerEnabled) {
    [_viewController setHeaderEnabled:newViewProps.headerEnabled];
  }
  if (previousViewProps.footerEnabled != newViewProps.footerEnabled) {
    [_viewController setFooterEnabled:newViewProps.footerEnabled];
  }
  if (previousViewProps.speedometerEnabled != newViewProps.speedometerEnabled) {
    [_viewController setSpeedometerEnabled:newViewProps.speedometerEnabled];
  }
  if (previousViewProps.speedLimitIconEnabled != newViewProps.speedLimitIconEnabled) {
    [_viewController setSpeedLimitIconEnabled:newViewProps.speedLimitIconEnabled];
  }
  if (previousViewProps.recenterButtonEnabled != newViewProps.recenterButtonEnabled) {
    [_viewController setRecenterButtonEnabled:newViewProps.recenterButtonEnabled];
  }
  if (previousViewProps.reportIncidentButtonEnabled != newViewProps.reportIncidentButtonEnabled) {
    [_viewController setReportIncidentButtonEnabled:newViewProps.reportIncidentButtonEnabled];
  }

  if (!_initialized) {
    _initialized = YES;
  }

  [super updateProps:props oldProps:oldProps];
}

- (void)layoutSubviews {
  [super layoutSubviews];
  _viewController.view.frame = self.bounds;
}

// Event handler implementations using Fabric EventEmitter
- (void)handleRecenterButtonClick {
  NavViewEventEmitter::OnRecenterButtonClick result = {};
  self.eventEmitter.onRecenterButtonClick(result);
}

- (void)handlePromptVisibilityChanged:(BOOL)visible {
  NavViewEventEmitter::OnPromptVisibilityChanged result = {visible};
  self.eventEmitter.onPromptVisibilityChanged(result);
}

- (void)handleMapReady {
  NavViewEventEmitter::OnMapReady result = {};
  self.eventEmitter.onMapReady(result);
}

- (void)handleMapClick:(NSDictionary *)latLngMap {
  double lat = [latLngMap[@"lat"] doubleValue];
  double lng = [latLngMap[@"lng"] doubleValue];
  NavViewEventEmitter::OnMapClick result = {lat, lng};
  self.eventEmitter.onMapClick(result);
}

- (void)handleMarkerInfoWindowTapped:(GMSMarker *)marker {
  NavViewEventEmitter::OnMarkerInfoWindowTapped result = {
      {marker.position.latitude, marker.position.longitude},
      [ObjectTranslationUtil isIdOnUserData:marker.userData] ? [marker.userData[0] UTF8String] : "",
      marker.title != nil ? [marker.title UTF8String] : "",
      marker.opacity,
      marker.rotation,
      [marker.snippet UTF8String],
      (int)marker.zIndex};
  self.eventEmitter.onMarkerInfoWindowTapped(result);
}

- (void)handleMarkerClick:(GMSMarker *)marker {
  NavViewEventEmitter::OnMarkerClick result = {
      {marker.position.latitude, marker.position.longitude},
      [ObjectTranslationUtil isIdOnUserData:marker.userData] ? [marker.userData[0] UTF8String] : "",
      marker.title != nil ? [marker.title UTF8String] : "",
      marker.opacity,
      marker.rotation,
      [marker.snippet UTF8String],
      (int)marker.zIndex};
  self.eventEmitter.onMarkerClick(result);
}

- (void)handlePolylineClick:(GMSPolyline *)polyline {
  std::vector<NavViewEventEmitter::OnPolylineClickPoints> points;
  for (int i = 0; i < polyline.path.count; i++) {
    CLLocationCoordinate2D point = [polyline.path coordinateAtIndex:i];
    points.push_back({point.latitude, point.longitude});
  }

  NavViewEventEmitter::OnPolylineClick result = {
      std::move(points),
      [ObjectTranslationUtil isIdOnUserData:polyline.userData] ? [polyline.userData[0] UTF8String]
                                                               : "",
      polyline.strokeColor ? [[[polyline.strokeColor toColorInt] stringValue] UTF8String] : "",
      (float)polyline.strokeWidth,
      0,  // jointType
      (int)polyline.zIndex};
  self.eventEmitter.onPolylineClick(result);
}

- (void)handlePolygonClick:(GMSPolygon *)polygon {
  std::vector<NavViewEventEmitter::OnPolygonClickPoints> points;
  std::vector<std::vector<NavViewEventEmitter::OnPolygonClickHoles>> holes;

  // Convert path points
  for (int i = 0; i < polygon.path.count; i++) {
    CLLocationCoordinate2D point = [polygon.path coordinateAtIndex:i];
    points.push_back({point.latitude, point.longitude});
  }

  // Convert holes
  for (GMSPath *hole in polygon.holes) {
    std::vector<NavViewEventEmitter::OnPolygonClickHoles> holePath;
    for (int i = 0; i < hole.count; i++) {
      CLLocationCoordinate2D point = [hole coordinateAtIndex:i];
      holePath.push_back({point.latitude, point.longitude});
    }
    holes.push_back(std::move(holePath));
  }

  NavViewEventEmitter::OnPolygonClick result = {
      std::move(points),
      std::move(holes),
      [ObjectTranslationUtil isIdOnUserData:polygon.userData] ? [polygon.userData[0] UTF8String]
                                                              : "",
      polygon.fillColor ? [[[polygon.fillColor toColorInt] stringValue] UTF8String] : "",
      (float)polygon.strokeWidth,
      polygon.strokeColor ? [[[polygon.strokeColor toColorInt] stringValue] UTF8String] : "",
      0,  // strokeJointType
      (int)polygon.zIndex,
      polygon.geodesic};
  self.eventEmitter.onPolygonClick(result);
}

- (void)handleCircleClick:(GMSCircle *)circle {
  NavViewEventEmitter::OnCircleClick result = {
      {circle.position.latitude, circle.position.longitude},
      [ObjectTranslationUtil isIdOnUserData:circle.userData] ? [circle.userData[0] UTF8String] : "",
      circle.fillColor ? [[[circle.fillColor toColorInt] stringValue] UTF8String] : "",
      (float)circle.strokeWidth,
      circle.strokeColor ? [[[circle.strokeColor toColorInt] stringValue] UTF8String] : "",
      (float)circle.radius,
      (int)circle.zIndex};
  self.eventEmitter.onCircleClick(result);
}

- (void)handleGroundOverlayClick:(GMSGroundOverlay *)groundOverlay {
  NavViewEventEmitter::OnGroundOverlayClick result = {
      [ObjectTranslationUtil isIdOnUserData:groundOverlay.userData]
          ? [groundOverlay.userData[0] UTF8String]
          : ""};
  self.eventEmitter.onGroundOverlayClick(result);
}

- (NavViewController *)getViewController {
  return _viewController;
}

- (const NavViewEventEmitter &)eventEmitter {
  return static_cast<const NavViewEventEmitter &>(*_eventEmitter);
}

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<NavViewComponentDescriptor>();
}

// Required method from RCTNavViewViewProtocol
Class<RCTNavViewViewProtocol> NavViewCls(void) { return NavView.class; }

@end
