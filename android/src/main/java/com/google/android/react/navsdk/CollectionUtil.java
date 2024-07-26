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
package com.google.android.react.navsdk;

import java.util.HashMap;
import java.util.Map;

public class CollectionUtil {

  private static Map<String, Object> mObjectMap = new HashMap<>();

  public static int getInt(String name, Map map, int defaultValue) {
    if (map.containsKey(name) && map.get(name) != null) {
      return ((Double) map.get(name)).intValue();
    }
    return defaultValue;
  }

  public static boolean getBool(String name, Map map, boolean defaultValue) {
    if (map.containsKey(name) && map.get(name) != null) {
      return ((Boolean) map.get(name)).booleanValue();
    }
    return defaultValue;
  }

  public static String getString(String name, Map map) {
    if (map.containsKey(name) && map.get(name) != null) return map.get(name).toString();
    return null;
  }

  public static double getDouble(String name, Map map, double defaultValue) {
    if (map.containsKey(name) && map.get(name) != null) {
      return ((Double) map.get(name));
    }
    return defaultValue;
  }

  public static void setValue(String name, Object value) {
    mObjectMap.put(name, value);
  }

  public static Map getMap() {
    return mObjectMap;
  }
}
