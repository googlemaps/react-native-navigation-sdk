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
#import "PhoneSceneDelegate.h"
#import <React/RCTRootView.h>
#import <UIKit/UIKit.h>
#import "AppDelegateCarPlay.h"

@implementation PhoneSceneDelegate

- (void)scene:(UIScene *)scene
    willConnectToSession:(UISceneSession *)session
                 options:(UISceneConnectionOptions *)connectionOptions {
  AppDelegateCarPlay *appDelegate =
      (AppDelegateCarPlay *)[UIApplication sharedApplication].delegate;
  if (!appDelegate) {
    return;
  }

  UIWindowScene *windowScene = (UIWindowScene *)scene;
  if (!windowScene) {
    return;
  }

  UIViewController *rootViewController = [[UIViewController alloc] init];
  rootViewController.view = appDelegate.rootView;

  UIWindow *window = [[UIWindow alloc] initWithWindowScene:windowScene];
  window.rootViewController = rootViewController;
  self.window = window;
  [appDelegate setWindow:window];
  [window makeKeyAndVisible];
}

@end
