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
#import "CarSceneDelegate.h"
#import <CarPlay/CarPlay.h>
#import <Foundation/Foundation.h>
#import "NavAutoModule.h"
#import "NavModule.h"

@implementation CarSceneDelegate

- (CPMapTemplate *)getTemplate {
  CPMapTemplate *template = [[CPMapTemplate alloc] init];
  [template showPanningInterfaceAnimated:YES];

  CPBarButton *customButton = [[CPBarButton alloc]
      initWithTitle:@"Custom Event"
            handler:^(CPBarButton *_Nonnull button) {
              NSMutableDictionary *dictionary = [[NSMutableDictionary alloc] init];
              dictionary[@"sampleDataKey"] = @"sampleDataContent";
              [[NavAutoModule getOrCreateSharedInstance] onCustomNavigationAutoEvent:@"sampleEvent"
                                                                                data:dictionary];
            }];

  template.leadingNavigationBarButtons = @[ customButton ];
  template.trailingNavigationBarButtons = @[];
  return template;
}

@end
