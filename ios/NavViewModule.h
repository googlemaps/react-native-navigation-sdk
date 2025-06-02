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
#ifndef NavViewModule_h
#define NavViewModule_h

#import "NavViewController.h"
#import "generated/RNNavigationSdkSpec/RNNavigationSdkSpec.h"

NS_ASSUME_NONNULL_BEGIN

@interface NavViewModule : NativeNavViewModuleSpecBase <NativeNavViewModuleSpec>
- (void)attachViewsToNavigationSession:(GMSNavigationSession *)session;
- (void)informPromptVisibilityChange:(BOOL)visible;
- (void)setTravelMode:(GMSNavigationTravelMode)travelMode;

// Class method to access the singleton instance
+ (instancetype)sharedInstance;

// Class method to access the static viewControllers registry
+ (NSMutableDictionary<NSNumber *, NavViewController *> *)viewControllersRegistry;

@end

NS_ASSUME_NONNULL_END

#endif /* NavViewModule_h */
