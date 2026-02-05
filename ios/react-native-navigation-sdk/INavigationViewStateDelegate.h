/*
 * Copyright 2026 Google LLC
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

#ifndef INavigationViewStateDelegate_h
#define INavigationViewStateDelegate_h

NS_ASSUME_NONNULL_BEGIN

@class NavViewController;

/**
 * Protocol for receiving navigation view state change notifications.
 * Implement this protocol to be notified when the map view is ready
 * and when the navigation session is attached.
 *
 * This is primarily used by CarPlay's BaseCarSceneDelegate to configure
 * navigation UI settings at the appropriate times.
 */
@protocol INavigationViewStateDelegate <NSObject>

@optional

/**
 * Called when the map view has been loaded and is ready.
 * This is the appropriate time to configure map settings that don't require
 * a navigation session (e.g., recenter button, speedometer visibility).
 *
 * @param viewController The NavViewController whose map view is ready.
 */
- (void)navigationViewDidLoad:(NavViewController *)viewController;

/**
 * Called when the navigation session has been successfully attached to the map view.
 * This is the appropriate time to configure navigation-specific UI settings
 * (e.g., header, footer, traffic prompts).
 *
 * @param viewController The NavViewController whose session was attached.
 */
- (void)navigationViewDidAttachSession:(NavViewController *)viewController;

@end

NS_ASSUME_NONNULL_END

#endif /* INavigationViewStateDelegate_h */
