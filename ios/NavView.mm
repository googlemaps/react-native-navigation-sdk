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
#import "FabricObjectTranslationUtil.h"
#import "NavViewController.h"
#import "NavViewModule.h"
#import "ObjectTranslationUtil.h"

#import "generated/RNNavigationSdkSpec/ComponentDescriptors.h"
#import "generated/RNNavigationSdkSpec/EventEmitters.h"
#import "generated/RNNavigationSdkSpec/Props.h"
#import "generated/RNNavigationSdkSpec/RCTComponentViewHelpers.h"
#import <GoogleMaps/GoogleMaps.h>
#import <React/RCTViewComponentView.h>

using namespace facebook::react;

@interface NavView () <RCTNavViewViewProtocol>

@property(nonatomic, strong) NavViewController *viewController;
@property(nonatomic, assign) BOOL initialized;

@end

@implementation NavView
- (instancetype)init {
  if (self = [super init]) {
    static const auto defaultProps = std::make_shared<const NavViewProps>();
    _props = defaultProps;
    _initialized = NO;

    _viewController = [[NavViewController alloc] init];
    // This default value will be changed on updateProps if needed.
    const auto &localDefaultProps =
        *std::static_pointer_cast<const NavViewProps>(defaultProps);
    _viewController.isNavigationView = localDefaultProps.viewType == NAVIGATION;
    [_viewController setNavigationViewCallbacks:self];

    [self addSubview:_viewController.view];
  }
  return self;
}
// View recycling is not supported for this at the moment.
// If view recycling is needed, we the prepareForRecycle method
// needs to be implemented to handle the view recycling logic.
+ (BOOL)shouldBeRecycled {
  return NO;
}

- (void)dealloc {
  [self unregisterView];
}

- (void)unregisterView {
  const auto &currentProps =
      *std::static_pointer_cast<NavViewProps const>(_props);

  if (!currentProps.nativeID.empty()) {
    NSInteger nativeIDAsInteger = @(currentProps.nativeID.c_str()).integerValue;
    [[NavViewModule viewControllersRegistry]
        removeObjectForKey:@(nativeIDAsInteger)];
  }
}

- (void)updateProps:(Props::Shared const &)props
           oldProps:(Props::Shared const &)oldProps {
  const auto &oldViewProps =
      *std::static_pointer_cast<NavViewProps const>(_props);
  const auto &newViewProps =
      *std::static_pointer_cast<NavViewProps const>(props);

  if (!_initialized && !newViewProps.nativeID.empty()) {
    NSInteger nativeIDAsInteger = @(newViewProps.nativeID.c_str()).integerValue;
    [NavViewModule viewControllersRegistry][@(nativeIDAsInteger)] =
        _viewController;
  }

  if (oldViewProps.viewType != newViewProps.viewType) {
    _viewController.isNavigationView = newViewProps.viewType == NAVIGATION;
  }

  if (oldViewProps.navigationViewStylingOptions !=
      newViewProps.navigationViewStylingOptions) {
    [_viewController
        setStylingOptions:convertFollyDynamicToId(
                              newViewProps.navigationViewStylingOptions)];
  }

  if (oldViewProps.mapType != newViewProps.mapType) {
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

  if (oldViewProps.mapPadding.top != newViewProps.mapPadding.top ||
      oldViewProps.mapPadding.left != newViewProps.mapPadding.left ||
      oldViewProps.mapPadding.bottom != newViewProps.mapPadding.bottom ||
      oldViewProps.mapPadding.right != newViewProps.mapPadding.right) {
    [_viewController
        setPadding:UIEdgeInsetsMake(newViewProps.mapPadding.top,
                                    newViewProps.mapPadding.left,
                                    newViewProps.mapPadding.bottom,
                                    newViewProps.mapPadding.right)];
  }

  if (oldViewProps.minZoomLevel != newViewProps.minZoomLevel ||
      oldViewProps.maxZoomLevel != newViewProps.maxZoomLevel) {
    [_viewController setMinZoomLevel:newViewProps.minZoomLevel
                             maxZoom:newViewProps.maxZoomLevel];
  }

  if (oldViewProps.nightMode != newViewProps.nightMode) {
    [_viewController setNightMode:@(newViewProps.nightMode)];
  }

  if (newViewProps.followingPerspective) {
    [_viewController
        setFollowingPerspective:@(newViewProps.followingPerspective)];
  }

  if (oldViewProps.mapStyle != newViewProps.mapStyle) {
    NSString *jsonString =
        [NSString stringWithUTF8String:newViewProps.mapStyle.c_str()];
    GMSMapStyle *style = [GMSMapStyle styleWithJSONString:jsonString error:nil];
    [_viewController setMapStyle:style];
  }

  // Flags are set without status check
  [_viewController setIndoorEnabled:newViewProps.indoorEnabled];
  [_viewController setTrafficEnabled:newViewProps.trafficEnabled];
  [_viewController setCompassEnabled:newViewProps.compassEnabled];
  [_viewController
      setMyLocationButtonEnabled:newViewProps.myLocationButtonEnabled];
  [_viewController setMyLocationEnabled:newViewProps.myLocationEnabled];
  [_viewController setRotateGesturesEnabled:newViewProps.rotateGesturesEnabled];
  [_viewController setScrollGesturesEnabled:newViewProps.scrollGesturesEnabled];
  [_viewController setScrollGesturesEnabledDuringRotateOrZoom:
                       newViewProps.scrollGesturesEnabledDuringRotateOrZoom];
  [_viewController setTiltGesturesEnabled:newViewProps.tiltGesturesEnabled];
  [_viewController setZoomGesturesEnabled:newViewProps.zoomGesturesEnabled];
  [_viewController setBuildingsEnabled:newViewProps.buildingsEnabled];
  [_viewController
      setTripProgressBarEnabled:newViewProps.tripProgressBarEnabled];
  [_viewController
      setTrafficIncidentCardsEnabled:newViewProps.trafficIncidentCardsEnabled];
  [_viewController setHeaderEnabled:newViewProps.headerEnabled];
  [_viewController setFooterEnabled:newViewProps.footerEnabled];
  [_viewController setSpeedometerEnabled:newViewProps.speedometerEnabled];
  [_viewController setSpeedLimitIconEnabled:newViewProps.speedLimitIconEnabled];
  [_viewController setRecenterButtonEnabled:newViewProps.recenterButtonEnabled];
  [_viewController
      setReportIncidentButtonEnabled:newViewProps.reportIncidentButtonEnabled];

  if (oldViewProps.navigationUIEnabled != newViewProps.navigationUIEnabled) {
    [_viewController setNavigationUIEnabled:newViewProps.navigationUIEnabled];
  }

  // Set initial camera position only if the view is not initialized yet.
  if (!_initialized && (oldViewProps.initialCameraPosition.target.lat !=
                            newViewProps.initialCameraPosition.target.lat ||
                        oldViewProps.initialCameraPosition.target.lng !=
                            newViewProps.initialCameraPosition.target.lng ||
                        oldViewProps.initialCameraPosition.bearing !=
                            newViewProps.initialCameraPosition.bearing ||
                        oldViewProps.initialCameraPosition.tilt !=
                            newViewProps.initialCameraPosition.tilt ||
                        oldViewProps.initialCameraPosition.zoom !=
                            newViewProps.initialCameraPosition.zoom)) {
    GMSMutableCameraPosition *position =
        [[GMSMutableCameraPosition alloc] init];

    position.target = CLLocationCoordinate2DMake(
        newViewProps.initialCameraPosition.target.lat,
        newViewProps.initialCameraPosition.target.lng);
    position.zoom = newViewProps.initialCameraPosition.zoom;
    position.bearing = newViewProps.initialCameraPosition.bearing;
    position.viewingAngle = newViewProps.initialCameraPosition.tilt;
    [_viewController moveCamera:position];
  }

  if (!_initialized) {
    _initialized = YES;
  }
  [super updateProps:props oldProps:oldProps];
}

Class<RCTNavViewViewProtocol> NavViewCls(void) { return NavView.class; }

- (void)layoutSubviews {
  [super layoutSubviews];
  _viewController.view.frame = self.bounds;
}

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

- (NavViewController *)getViewController {
  return _viewController;
}

- (void)handleMapClick:(double)lat lng:(double)lng {
  NavViewEventEmitter::OnMapClick result = {lat, lng};
  self.eventEmitter.onMapClick(result);
}

- (void)handleMarkerInfoWindowTapped:(GMSMarker *)marker {
  NavViewEventEmitter::OnMarkerInfoWindowTapped result = {
      {marker.position.latitude, marker.position.longitude},
      [ObjectTranslationUtil isIdOnUserData:marker.userData]
          ? [marker.userData[0] UTF8String]
          : "",
      marker.title != nil ? [marker.title UTF8String] : "",
      marker.opacity,
      marker.rotation,
      [marker.snippet UTF8String],
      marker.zIndex};
  self.eventEmitter.onMarkerInfoWindowTapped(result);
}

- (void)handleMarkerClick:(GMSMarker *)marker {
  NavViewEventEmitter::OnMarkerClick result = {
      {marker.position.latitude, marker.position.longitude},
      [ObjectTranslationUtil isIdOnUserData:marker.userData]
          ? [marker.userData[0] UTF8String]
          : "",
      marker.title != nil ? [marker.title UTF8String] : "",
      marker.opacity,
      marker.rotation,
      [marker.snippet UTF8String],
      marker.zIndex};
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
      [ObjectTranslationUtil isIdOnUserData:polyline.userData]
          ? [polyline.userData[0] UTF8String]
          : "",
      polyline.strokeColor
          ? [[ObjectTranslationUtil hexStringFromColor:polyline.strokeColor]
                UTF8String]
          : nil,
      (float)polyline.strokeWidth,
      0, // jointType
      (int32_t)polyline.zIndex};
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
      [ObjectTranslationUtil isIdOnUserData:polygon.userData]
          ? [polygon.userData[0] UTF8String]
          : "",
      polygon.fillColor ? [[ObjectTranslationUtil
                              hexStringFromColor:polygon.fillColor] UTF8String]
                        : nil,
      (float)polygon.strokeWidth,
      polygon.strokeColor
          ? [[ObjectTranslationUtil hexStringFromColor:polygon.strokeColor]
                UTF8String]
          : nil,
      0, // strokeJointType
      (int32_t)polygon.zIndex,
      polygon.geodesic};
  self.eventEmitter.onPolygonClick(result);
}

- (void)handleCircleClick:(GMSCircle *)circle {
  NavViewEventEmitter::OnCircleClick result = {
      {circle.position.latitude, circle.position.longitude},
      [ObjectTranslationUtil isIdOnUserData:circle.userData]
          ? [circle.userData[0] UTF8String]
          : "",
      circle.fillColor ? [[ObjectTranslationUtil
                             hexStringFromColor:circle.fillColor] UTF8String]
                       : nil,
      (float)circle.strokeWidth,
      circle.strokeColor
          ? [[ObjectTranslationUtil hexStringFromColor:circle.strokeColor]
                UTF8String]
          : nil,
      (float)circle.radius,
      (int32_t)circle.zIndex};
  self.eventEmitter.onCircleClick(result);
}

- (void)handleGroundOverlayClick:(GMSGroundOverlay *)groundOverlay {
  NavViewEventEmitter::OnGroundOverlayClick result = {
      [ObjectTranslationUtil isIdOnUserData:groundOverlay.userData]
          ? [groundOverlay.userData[0] UTF8String]
          : ""};
  self.eventEmitter.onGroundOverlayClick(result);
}

- (const NavViewEventEmitter &)eventEmitter {
  return static_cast<const NavViewEventEmitter &>(*_eventEmitter);
}

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<NavViewComponentDescriptor>();
}

@end
