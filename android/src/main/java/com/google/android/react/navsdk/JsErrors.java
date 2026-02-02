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

  public static final String NO_DESTINATIONS_ERROR_CODE = "NO_DESTINATIONS";
  public static final String NO_DESTINATIONS_ERROR_MESSAGE = "Destinations not set";

  public static final String NOT_NAV_VIEW_ERROR_CODE = "NOT_NAV_VIEW";
  public static final String NOT_NAV_VIEW_ERROR_MESSAGE =
      "Operation can only be called on a navigation view";

  public static final String NO_VIEW_CONTROLLER_ERROR_CODE = "NO_VIEW_CONTROLLER";
  public static final String NO_VIEW_CONTROLLER_ERROR_MESSAGE =
      "No view controller found for the specified nativeID";

  public static final String INVALID_OPTIONS_ERROR_CODE = "INVALID_OPTIONS";
  public static final String INVALID_GROUND_OVERLAY_OPTIONS_MESSAGE =
      "Either location (with width) or bounds must be provided for ground overlay";

  public static final String INVALID_IMAGE_ERROR_CODE = "INVALID_IMAGE";
  public static final String INVALID_IMAGE_ERROR_MESSAGE =
      "Failed to load image from the provided path";
}
