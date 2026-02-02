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
#import <CarPlay/CarPlay.h>
#import "INavigationViewStateDelegate.h"

NS_ASSUME_NONNULL_BEGIN

@class NavViewController;  // forward declaration

@interface BaseCarSceneDelegate : UIResponder <CPTemplateApplicationSceneDelegate,
                                               CPMapTemplateDelegate,
                                               INavigationViewStateDelegate>

@property(nonatomic, strong) CPInterfaceController *interfaceController;
@property(nonatomic, strong) CPWindow *carWindow;
@property(nonatomic, strong) CPMapTemplate *mapTemplate;
@property(nonatomic, strong) NavViewController *navViewController;
@property(nonatomic, assign) BOOL sessionAttached;
@property(nonatomic, assign) BOOL viewControllerRegistered;

- (CPMapTemplate *)getTemplate;

/**
 * Called when the navigation map view has been loaded and is ready.
 * Override this method in your subclass to configure map settings that don't require
 * a navigation session (e.g., recenter button visibility, speedometer).
 * The default implementation disables recenter button, speedometer, and report incident button.
 */
- (void)onMapViewReady;

/**
 * Called when the navigation session has been successfully attached to the CarPlay map view.
 * Override this method in your subclass to configure navigation-specific UI settings.
 * The default implementation disables header and footer, and traffic prompts.
 */
- (void)onSessionAttached;

/**
 * Called when a custom message is received from React Native via sendCustomMessage.
 * Override this method in your subclass to handle custom messages.
 *
 * @param type The message type identifier.
 * @param data The message data as a dictionary (parsed from JSON), or nil if no data was provided.
 */
- (void)onCustomMessageReceived:(NSString *)type data:(nullable NSDictionary *)data;

@end

NS_ASSUME_NONNULL_END
