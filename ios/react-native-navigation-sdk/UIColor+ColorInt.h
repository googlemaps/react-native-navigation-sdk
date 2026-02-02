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

#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

/**
 * Category on UIColor to convert between color integers and UIColor objects.
 * Color integers are in AARRGGBB format (alpha first, same as Android).
 */
@interface UIColor (ColorInt)

/**
 * Creates a UIColor from a color integer in AARRGGBB format.
 *
 * @param colorInt An NSNumber containing a color integer in AARRGGBB format
 * @return A UIColor instance, or nil if colorInt is nil
 */
+ (nullable instancetype)colorWithColorInt:(nullable NSNumber *)colorInt;

/**
 * Converts this UIColor to a color integer in AARRGGBB format.
 *
 * @return An NSNumber containing the color integer, or nil if conversion fails
 */
- (nullable NSNumber *)toColorInt;

@end

NS_ASSUME_NONNULL_END
