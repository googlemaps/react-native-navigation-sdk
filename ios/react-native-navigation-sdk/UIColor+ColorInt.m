/**
 * Copyright 2026 Google LLC
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

#import "UIColor+ColorInt.h"

@implementation UIColor (ColorInt)

+ (nullable instancetype)colorWithColorInt:(nullable NSNumber *)colorInt {
  if (colorInt == nil) {
    return nil;
  }

  // Color integer is in AARRGGBB format (alpha first)
  unsigned int value = [colorInt unsignedIntValue];

  unsigned int a = (value >> 24) & 0xFF;
  unsigned int r = (value >> 16) & 0xFF;
  unsigned int g = (value >> 8) & 0xFF;
  unsigned int b = value & 0xFF;

  return [UIColor colorWithRed:(r / 255.0f)
                         green:(g / 255.0f)
                          blue:(b / 255.0f)
                         alpha:(a / 255.0f)];
}

- (nullable NSNumber *)toColorInt {
  CGFloat red, green, blue, alpha;
  if ([self getRed:&red green:&green blue:&blue alpha:&alpha]) {
    // Return in AARRGGBB format (alpha first)
    unsigned int a = lroundf(alpha * 255);
    unsigned int r = lroundf(red * 255);
    unsigned int g = lroundf(green * 255);
    unsigned int b = lroundf(blue * 255);

    unsigned int colorInt = (a << 24) | (r << 16) | (g << 8) | b;
    return @(colorInt);
  }
  return nil;
}

@end
