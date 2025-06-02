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

public class GMNJsErrors {
  public static final String NO_ACTIVITY_ERROR_CODE = "NO_ACTIVITY_ERROR_CODE";
  public static final String NO_ACTIVITY_ERROR_MESSAGE =
      "Activity missing while processing the action";
  public static final String NO_NAVIGATOR_ERROR_CODE = "NO_NAVIGATOR_ERROR_CODE";
  public static final String NO_NAVIGATOR_ERROR_MESSAGE =
      "Make sure to initialize the navigator is ready before executing.";
  public static final String NO_MAP_ERROR_CODE = "NO_MAP_ERROR_CODE";
  public static final String NO_MAP_ERROR_MESSAGE =
      "Map view is not initialized or not found for the provided viewId.";
  public static final String VIEW_NOT_FOUND_ERROR_CODE = "VIEW_NOT_FOUND_ERROR_CODE";
  public static final String VIEW_NOT_FOUND_ERROR_MESSAGE =
      "View not found for the provided viewId.";
  public static final String NO_WAYPOINTS_GUIDANCE_ERROR_CODE = "NO_WAYPOINTS_GUIDANCE_ERROR_CODE";
  public static final String NO_WAYPOINTS_GUIDANCE_ERROR_MESSAGE =
      "No waypoints set. Ensure destinations are added before starting guidance.";
  public static final String FAILED_TO_CREATE_MAP_OBJECT_ERROR_CODE =
      "FAILED_TO_CREATE_MAP_OBJECT_ERROR_CODE";
  public static final String FAILED_TO_CREATE_MAP_OBJECT_ERROR_MESSAGE =
      "Error while adding map object to the map.";
  public static final String TERMS_NOT_ACCEPTED_ERROR_CODE = "TERMS_NOT_ACCEPTED_ERROR_CODE";
  public static final String TERMS_NOT_ACCEPTED_ERROR_MESSAGE =
      "Terms and conditions not accepted.";

  public static final String UNKNOWN_NATIVE_ERROR_CODE = "NATIVE_ERROR_CODE";
}
