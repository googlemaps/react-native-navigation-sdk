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
#import <Foundation/Foundation.h>
#import <CarPlay/CarPlay.h>
#import "CarSceneDelegate.h"
#import "NavModule.h"
#import "NavAutoModule.h"

@implementation CarSceneDelegate

- (void)templateApplicationScene:(CPTemplateApplicationScene *)templateApplicationScene didConnectInterfaceController:(CPInterfaceController *)interfaceController toWindow:(CPWindow *)window {
  self.interfaceController = interfaceController;
  self.carWindow = window;

  self.mapTemplate = [[CPMapTemplate alloc] init];
  self.navViewController = [[NavViewController alloc] initWithSize:self.carWindow.frame.size.height width:self.carWindow.frame.size.width];
  self.carWindow.rootViewController = self.navViewController;
  [self.interfaceController setRootTemplate:self.mapTemplate animated:YES completion:nil];
  [NavModule registerNavigationSessionReadyCallback:^{
    [self attachSession];
    [NavModule unregisterNavigationSessionReadyCallback];
  }];
  [NavAutoModule registerNavAutoModuleReadyCallback:^{
    [self registerViewController];
    [NavAutoModule unregisterNavAutoModuleReadyCallback];
  }];
}

- (void)templateApplicationScene:(CPTemplateApplicationScene *)templateApplicationScene
didDisconnectInterfaceController:(CPInterfaceController *)interfaceController {
  self.interfaceController = nil;
  self.carWindow = nil;
  self.mapTemplate = nil;
  self.navViewController = nil;
  self.viewcontrollerRegistered = NO;
  self.sessionAttached = NO;
}

- (void)sceneDidBecomeActive:(UIScene *)scene {
  [self attachSession];
  [self registerViewController];
}

- (void)attachSession {
  if ([NavModule sharedInstance] != nil && !_sessionAttached) {
    [self.navViewController attachToNavigationSession:[[NavModule sharedInstance] getSession]];
    _sessionAttached = YES;
  }
}

- (void)registerViewController {
  if ([NavAutoModule sharedInstance] != nil && !_viewcontrollerRegistered) {
    [[NavAutoModule sharedInstance] registerViewController:self.navViewController];
    _viewcontrollerRegistered = YES;
  }
}


@end
