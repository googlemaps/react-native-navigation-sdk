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

public class JsErrors {
  public static final String NO_NAVIGATOR_ERROR_CODE = "NO_NAVIGATOR_ERROR_CODE";
  public static final String NO_NAVIGATOR_ERROR_MESSAGE =
      "Make sure to initialize the navigator is ready before executing.";

  public static final String NO_MAP_ERROR_CODE = "NO_MAP_ERROR_CODE";
  public static final String NO_MAP_ERROR_MESSAGE =
      "Make sure to initialize the map view has been initialized before executing.";
}
