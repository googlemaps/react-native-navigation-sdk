/*
 * Copyright 2024 Google LLC
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
#ifndef NavView_h
#define NavView_h

#import <React/RCTViewComponentView.h>
#import <UIKit/UIKit.h>
#import "CustomTypes.h"
#import "INavigationViewCallback.h"

NS_ASSUME_NONNULL_BEGIN

// Forward declaration of NavViewController to avoid circular dependencies.
@class NavViewController;

@interface NavView : RCTViewComponentView <INavigationViewCallback>

- (NavViewController *)getViewController;

@end

NS_ASSUME_NONNULL_END

#endif /* NavView_h */
