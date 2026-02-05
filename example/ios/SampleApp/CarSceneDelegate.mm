// Copyright 2026 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#import "CarSceneDelegate.h"

#import <CarPlay/CarPlay.h>
#import <Foundation/Foundation.h>
#import <ReactNativeGoogleMapsNavigation/NavAutoModule.h>
#import <ReactNativeGoogleMapsNavigation/NavModule.h>

@implementation CarSceneDelegate {
  // Nonce to track dismiss custom message callbacks.
  NSInteger _dismissNonce;
}

- (CPMapTemplate *)getTemplate {
  CPMapTemplate *mapTemplate = [[CPMapTemplate alloc] init];
  [mapTemplate showPanningInterfaceAnimated:YES];

  CPBarButton *customButton = [[CPBarButton alloc]
      initWithTitle:@"Custom Event"
            handler:^(CPBarButton *_Nonnull button) {
              NSMutableDictionary *dictionary = [[NSMutableDictionary alloc] init];
              dictionary[@"sampleDataKey"] = @"sampleDataContent";
              [[NavAutoModule getOrCreateSharedInstance] onCustomNavigationAutoEvent:@"sampleEvent"
                                                                                data:dictionary];
            }];

  mapTemplate.leadingNavigationBarButtons = @[ customButton ];
  mapTemplate.trailingNavigationBarButtons = @[];
  return mapTemplate;
}

/**
 * Handles custom messages sent from React Native via sendCustomMessage.
 *
 * This example implementation simply displays the received message as an alert on the CarPlay
 * screen. In a production application, you should use this mechanism to:
 * - Control CarPlay view templates (e.g., switch between map, list, or grid templates)
 * - Update map behavior (e.g., change camera position, add/remove markers)
 * - Trigger navigation actions based on app state
 * - Synchronize UI state between the phone and CarPlay displays
 *
 * @param type The message type identifier used to distinguish different message categories
 * @param data Optional dictionary containing additional message payload
 */
- (void)onCustomMessageReceived:(NSString *)type data:(nullable NSDictionary *)data {
  NSLog(@"CarSceneDelegate: Received custom message - type: %@, data: %@", type, data);

  // Show an alert on the CarPlay screen with the message
  NSString *dataStr = data ? [data description] : @"";
  NSString *message = [NSString stringWithFormat:@"Received: %@ %@", type, dataStr];

  CPAlertAction *dismissAction = [[CPAlertAction alloc]
      initWithTitle:@"OK"
              style:CPAlertActionStyleDefault
            handler:^(CPAlertAction *_Nonnull action) {
              [self.interfaceController dismissTemplateAnimated:YES completion:nil];
            }];

  CPAlertTemplate *alertTemplate =
      [[CPAlertTemplate alloc] initWithTitleVariants:@[ message, type ] actions:@[ dismissAction ]];

  // Increment nonce to invalidate any pending dismiss callbacks
  _dismissNonce++;
  NSInteger currentNonce = _dismissNonce;

  // Dismiss any existing presented template before presenting the new one
  [self.interfaceController dismissTemplateAnimated:NO
                                         completion:^(BOOL success, NSError *_Nullable error) {
                                           [self.interfaceController presentTemplate:alertTemplate
                                                                            animated:YES
                                                                          completion:nil];
                                         }];

  // Auto-dismiss after 3 seconds (only if nonce still matches)
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(3.0 * NSEC_PER_SEC)),
                 dispatch_get_main_queue(), ^{
                   if (self->_dismissNonce == currentNonce) {
                     [self.interfaceController dismissTemplateAnimated:YES completion:nil];
                   }
                 });
}

@end
