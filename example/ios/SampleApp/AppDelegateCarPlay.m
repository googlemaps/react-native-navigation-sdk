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
#import "AppDelegateCarPlay.h"

#import <CarPlay/CarPlay.h>
#import <GoogleMaps/GoogleMaps.h>
#import <React/RCTBundleURLProvider.h>
#import <UIKit/UIKit.h>
#import "CarSceneDelegate.h"
#import "PhoneSceneDelegate.h"

@implementation AppDelegateCarPlay

- (BOOL)application:(UIApplication *)application
    didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  self.moduleName = @"SampleApp";

  // Note: Ensure that you have copied the Keys.plist.sample to Keys.plist
  // and have added the correct API_KEY value to the file.
  //
  // Get the path for the Keys.plist file in the main bundle and read API_KEY.
  NSString *path = [[NSBundle mainBundle] pathForResource:@"Keys" ofType:@"plist"];
  NSDictionary *keysDictionary = [NSDictionary dictionaryWithContentsOfFile:path];
  NSString *api_key = [keysDictionary objectForKey:@"API_KEY"];

  [GMSServices provideAPIKey:api_key];
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  self.rootView = [[RCTRootView alloc] initWithBridge:bridge
                                           moduleName:self.moduleName
                                    initialProperties:nil];
  return YES;
}

- (UISceneConfiguration *)application:(UIApplication *)application
    configurationForConnectingSceneSession:(UISceneSession *)connectingSceneSession
                                   options:(UISceneConnectionOptions *)options {
  if ([connectingSceneSession.role
          isEqualToString:@"CPTemplateApplicationSceneSessionRoleApplication"]) {
    UISceneConfiguration *scene =
        [[UISceneConfiguration alloc] initWithName:@"CarPlay"
                                       sessionRole:connectingSceneSession.role];
    scene.delegateClass = [CarSceneDelegate class];
    return scene;
  } else {
    UISceneConfiguration *scene =
        [[UISceneConfiguration alloc] initWithName:@"Phone"
                                       sessionRole:connectingSceneSession.role];
    scene.delegateClass = [PhoneSceneDelegate class];
    return scene;
  }
}

- (void)application:(UIApplication *)application
    didDiscardSceneSessions:(NSSet<UISceneSession *> *)sceneSessions {
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge {
  return [self bundleURL];
}

- (NSURL *)bundleURL {
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
