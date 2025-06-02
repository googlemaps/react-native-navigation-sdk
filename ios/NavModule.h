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

#ifndef NavModule_h
#define NavModule_h

#import <GoogleNavigation/GoogleNavigation.h>
#import "INavigationCallback.h"
#import "generated/RNNavigationSdkSpec/RNNavigationSdkSpec.h"

NS_ASSUME_NONNULL_BEGIN

@interface NavModule : NativeNavModuleSpecBase <NativeNavModuleSpec,
                                                GMSNavigatorListener,
                                                GMSRoadSnappedLocationProviderListener,
                                                INavigationCallback>

typedef void (^NavigationSessionReadyCallback)(void);
typedef void (^NavigationSessionDisposedCallback)(void);

@property BOOL enableUpdateInfo;

- (BOOL)hasSession;
- (GMSNavigationSession *)getSession;
+ (void)unregisterNavigationSessionReadyCallback;
+ (void)registerNavigationSessionReadyCallback:(NavigationSessionReadyCallback)callback;
+ (void)unregisterNavigationSessionDisposedCallback;
+ (void)registerNavigationSessionDisposedCallback:(NavigationSessionDisposedCallback)callback;

// Class method to access the singleton instance
+ (instancetype)sharedInstance;

@end

NS_ASSUME_NONNULL_END

#endif /* NavModule_h */
