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

#import "NavEventDispatcher.h"

@implementation NavEventDispatcher {
  bool hasListeners;
}

RCT_EXPORT_MODULE(NavEventDispatcher);

+ (id)allocWithZone:(NSZone *)zone {
  static NavEventDispatcher *sharedInstance = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedInstance = [super allocWithZone:zone];
  });
  return sharedInstance;
}

- (NSArray<NSString *> *)supportedEvents {
  return @[
    @"onRemainingTimeOrDistanceChanged",
    @"onRouteChanged",
    @"onTrafficUpdated",
    @"onArrival",
    @"onTurnByTurn",
    @"onNavigationReady",
    @"onNavigationInitError",
    @"onStartGuidance",
    @"onRecenterButtonClick",
    @"onRouteStatusResult",
    @"onReroutingRequestedByOffRoute",
    @"onLocationChanged",
    @"onRawLocationChanged",
    @"logDebugInfo",
  ];
}

// Will be called when this module's first listener is added.
- (void)startObserving {
  hasListeners = YES;
  // Set up any upstream listeners or background tasks as necessary
}

// Will be called when this module's last listener is removed, or on dealloc.
- (void)stopObserving {
  hasListeners = NO;
  // Remove upstream listeners, stop unnecessary background tasks
}

- (bool)hasListeners {
  return hasListeners;
}

- (void)sendEventName:(NSString *)eventName body:(id)body {
  if (hasListeners) {
    [self sendEventWithName:eventName body:body];
  } else {
    NSLog(@"NavEventDispatcher sendEventName called without listeners: %@", eventName);
  }
}

@end
