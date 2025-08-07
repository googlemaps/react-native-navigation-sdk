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

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import java.lang.reflect.Type;
import java.util.HashMap;

public class GMNJsonUtils {
  private static final Gson gson = new Gson();
  private static final Type TYPE = new TypeToken<HashMap<String, Object>>() {}.getType();

  /**
   * Converts a JSON string to a HashMap<String, Object>.
   *
   * @param jsonString JSON string to convert
   * @return HashMap representation of the JSON
   */
  public static HashMap<String, Object> jsonToMap(String jsonString) {
    if (jsonString == null || jsonString.trim().isEmpty()) {
      return new HashMap<>(); // Return empty map if input is null or empty
    }
    return gson.fromJson(jsonString, TYPE);
  }
}
