/**
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

import { processColor, type ColorValue } from 'react-native';

/**
 * Converts a React Native ColorValue to a platform color integer.
 * Supports all React Native color formats: named colors, rgb(), rgba(), hex, etc.
 * Returns null if the color cannot be processed.
 *
 * The returned integer is in AARRGGBB format (alpha first) which can be used
 * directly by native code on both Android and iOS.
 *
 * @param color - Any valid React Native color format
 * @returns A color integer in AARRGGBB format, or null if invalid
 */
export function processColorValue(
  color: ColorValue | null | undefined
): number | null {
  if (color == null) {
    return null;
  }

  const processedColor = processColor(color);

  if (processedColor == null || typeof processedColor !== 'number') {
    return null;
  }

  return processedColor;
}

/**
 * Converts a color integer to an rgba string.
 * The input integer should be in AARRGGBB format (alpha first).
 *
 * @param colorInt - Color integer in AARRGGBB format
 * @returns An rgba color string like "rgba(255, 0, 0, 1.00)"
 */
export function colorIntToRGBA(colorInt: number): string {
  // Extract ARGB components (alpha first)
  const a = ((colorInt >>> 24) & 0xff) / 255;
  const r = (colorInt >>> 16) & 0xff;
  const g = (colorInt >>> 8) & 0xff;
  const b = colorInt & 0xff;

  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
}
