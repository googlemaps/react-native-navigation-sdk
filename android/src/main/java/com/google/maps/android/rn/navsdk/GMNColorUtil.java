/**
 * Copyright 2023 Google LLC
 *
 * <p>Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of the License at
 *
 * <p>http://www.apache.org/licenses/LICENSE-2.0
 *
 * <p>Unless required by applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.google.maps.android.rn.navsdk;

import android.graphics.Color;

public class GMNColorUtil {
  public static Color colorFromHexString(String hexString) {
    String hexValueString = hexString.replace("#", "");
    int length = hexValueString.length();

    int r, g, b, a = 255;

    try {
      if (length == 3) { // #RGB
        r = Integer.parseInt(hexValueString.substring(0, 1), 16) * 17;
        g = Integer.parseInt(hexValueString.substring(1, 2), 16) * 17;
        b = Integer.parseInt(hexValueString.substring(2, 3), 16) * 17;
      } else if (length == 4) { // #RGBA
        r = Integer.parseInt(hexValueString.substring(0, 1), 16) * 17;
        g = Integer.parseInt(hexValueString.substring(1, 2), 16) * 17;
        b = Integer.parseInt(hexValueString.substring(2, 3), 16) * 17;
        a = Integer.parseInt(hexValueString.substring(3, 4), 16) * 17;
      } else if (length == 6) { // #RRGGBB
        r = Integer.parseInt(hexValueString.substring(0, 2), 16);
        g = Integer.parseInt(hexValueString.substring(2, 4), 16);
        b = Integer.parseInt(hexValueString.substring(4, 6), 16);
      } else if (length == 8) { // #RRGGBBAA
        r = Integer.parseInt(hexValueString.substring(0, 2), 16);
        g = Integer.parseInt(hexValueString.substring(2, 4), 16);
        b = Integer.parseInt(hexValueString.substring(4, 6), 16);
        a = Integer.parseInt(hexValueString.substring(6, 8), 16);
      } else {
        throw new IllegalArgumentException("Unsupported color format");
      }
    } catch (NumberFormatException e) {
      throw new IllegalArgumentException("Invalid color format", e);
    }

    return Color.valueOf(r / 255f, g / 255f, b / 255f, a / 255f);
  }

  public static String hexStringFromColor(Color color) {
    int r = Math.round(color.red() * 255);
    int g = Math.round(color.green() * 255);
    int b = Math.round(color.blue() * 255);
    int a = Math.round(color.alpha() * 255);

    return String.format("#%02X%02X%02X%02X", a, r, g, b);
  }
}
