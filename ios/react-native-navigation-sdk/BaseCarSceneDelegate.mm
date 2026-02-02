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
#import "BaseCarSceneDelegate.h"
#import <CarPlay/CarPlay.h>
#import <Foundation/Foundation.h>
#import "CustomTypes.h"
#import "NavAutoModule.h"
#import "NavModule.h"
#import "NavViewController.h"

@implementation BaseCarSceneDelegate

- (void)templateApplicationScene:(CPTemplateApplicationScene *)templateApplicationScene
    didConnectInterfaceController:(CPInterfaceController *)interfaceController
                         toWindow:(CPWindow *)window {
  self.interfaceController = interfaceController;
  self.carWindow = window;
  self.mapTemplate = [self getTemplate];
  self.mapTemplate.mapDelegate = self;

  self.navViewController = [[NavViewController alloc] init];
  [self.navViewController setMapViewType:NAVIGATION];
  self.navViewController.stateDelegate = self;

  self.carWindow.rootViewController = self.navViewController;
  [self.interfaceController setRootTemplate:self.mapTemplate animated:YES completion:nil];
  [NavModule registerNavigationSessionReadyCallback:^{
    [self attachSession];
  }];
  [NavModule registerNavigationSessionDisposedCallback:^{
    self->_sessionAttached = NO;
    [self.navViewController detachFromNavigationSession];
  }];
  [NavAutoModule registerNavAutoModuleReadyCallback:^{
    [self registerViewController];
  }];
}

- (CPMapTemplate *)getTemplate {
  CPMapTemplate *newTemplate = [[CPMapTemplate alloc] init];
  [newTemplate showPanningInterfaceAnimated:YES];
  return newTemplate;
}

- (void)templateApplicationScene:(CPTemplateApplicationScene *)templateApplicationScene
    didDisconnectInterfaceController:(CPInterfaceController *)interfaceController {
  [self unRegisterViewController];
  self.interfaceController = nil;
  self.carWindow = nil;
  self.mapTemplate = nil;
  self.navViewController = nil;
  self.viewControllerRegistered = NO;
  self.sessionAttached = NO;
}

- (void)sceneDidBecomeActive:(UIScene *)scene {
  [self attachSession];
  [self registerViewController];
}

- (void)attachSession {
  if ([NavModule sharedInstance] != nil && [[NavModule sharedInstance] hasSession] &&
      !_sessionAttached) {
    // Attempt to attach session - delegate methods will be called by NavViewController
    BOOL attached = [self.navViewController attachToNavigationSessionIfNeeded];
    if (attached) {
      _sessionAttached = YES;
    }
  }
}

#pragma mark - INavigationViewStateDelegate

- (void)navigationViewDidLoad:(NavViewController *)viewController {
  [self onMapViewReady];
}

- (void)navigationViewDidAttachSession:(NavViewController *)viewController {
  _sessionAttached = YES;
  [self onSessionAttached];
}

#pragma mark - CarPlay UI Configuration (Override in subclass)

- (void)onMapViewReady {
  // Apply map settings that don't require navigation session
  // These settings work as soon as the map view is loaded
  [self.navViewController setRecenterButtonEnabled:NO];
  [self.navViewController setSpeedometerEnabled:NO];
  [self.navViewController setReportIncidentButtonEnabled:NO];
}

- (void)onSessionAttached {
  // Apply navigation-specific UI settings
  // These settings require the navigation session to be attached
  [self.navViewController setHeaderEnabled:NO];
  [self.navViewController setFooterEnabled:NO];
  [self.navViewController setTrafficPromptsEnabled:NO];
}

- (void)registerViewController {
  if ([NavAutoModule sharedInstance] != nil && !_viewControllerRegistered) {
    [[NavAutoModule sharedInstance] registerViewController:self.navViewController delegate:self];
    _viewControllerRegistered = YES;
  }
}

- (void)unRegisterViewController {
  if ([NavAutoModule sharedInstance] != nil && _viewControllerRegistered) {
    [[NavAutoModule sharedInstance] unRegisterViewController];
    _viewControllerRegistered = NO;
  }
}

#pragma mark - CPMapTemplateDelegate

- (void)mapTemplate:(CPMapTemplate *)mapTemplate panWithDirection:(CPPanDirection)direction {
  CGPoint scrollAmount = [self scrollAmountForPanDirection:direction];
  GMSCameraUpdate *scroll = [GMSCameraUpdate scrollByX:scrollAmount.x Y:scrollAmount.y];
  [self.navViewController animateCamera:scroll];
}

- (CGPoint)scrollAmountForPanDirection:(CPPanDirection)direction {
  static const CGFloat scrollDistance = 80.;
  CGPoint scrollAmount = {0., 0.};
  if (direction & CPPanDirectionLeft) {
    scrollAmount.x = -scrollDistance;
  }
  if (direction & CPPanDirectionRight) {
    scrollAmount.x = scrollDistance;
  }
  if (direction & CPPanDirectionUp) {
    scrollAmount.y = -scrollDistance;
  }
  if (direction & CPPanDirectionDown) {
    scrollAmount.y = scrollDistance;
  }
  if (scrollAmount.x != 0 && scrollAmount.y != 0) {
    // Adjust length if scrolling diagonally.
    scrollAmount =
        CGPointMake(scrollAmount.x * (CGFloat)M_SQRT1_2, scrollAmount.y * (CGFloat)M_SQRT1_2);
  }
  return scrollAmount;
}

#pragma mark - Custom Message Handling

/**
 * Called when a custom message is received from React Native via sendCustomMessage.
 *
 * Override this method in your subclass to handle custom messages. Use this mechanism to:
 * - Control CarPlay view templates (e.g., switch between map, list, or grid templates)
 * - Update map behavior (e.g., change camera position, add/remove markers)
 * - Trigger navigation actions based on app state
 * - Synchronize UI state between the phone and CarPlay displays
 *
 * @param type The message type identifier used to distinguish different message categories.
 * @param data Optional dictionary containing additional message payload, or nil if no data was
 * provided.
 */
- (void)onCustomMessageReceived:(NSString *)type data:(nullable NSDictionary *)data {
  // Empty implementation. Override in subclass.
}

@end
