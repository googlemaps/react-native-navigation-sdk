/*
 * Copyright 2024 Google LLC
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

package com.sampleapp;

import com.google.android.libraries.mapsplatform.turnbyturn.model.Maneuver;
import com.google.common.collect.ImmutableMap;
import javax.annotation.Nullable;

/** Converter that converts between turn-by-turn and Android Auto Maneuvers. */
public final class ManeuverConverter {
  private ManeuverConverter() {}

  // Map from turn-by-turn Maneuver to Android Auto Maneuver.Type.
  private static final ImmutableMap<Integer, Integer> MANEUVER_TO_ANDROID_AUTO_MANEUVER_TYPE =
      ImmutableMap.<Integer, Integer>builder()
          .put(Maneuver.DEPART, androidx.car.app.navigation.model.Maneuver.TYPE_DEPART)
          .put(Maneuver.DESTINATION, androidx.car.app.navigation.model.Maneuver.TYPE_DESTINATION)
          .put(
              Maneuver.DESTINATION_LEFT,
              androidx.car.app.navigation.model.Maneuver.TYPE_DESTINATION_LEFT)
          .put(
              Maneuver.DESTINATION_RIGHT,
              androidx.car.app.navigation.model.Maneuver.TYPE_DESTINATION_RIGHT)
          .put(Maneuver.STRAIGHT, androidx.car.app.navigation.model.Maneuver.TYPE_STRAIGHT)
          .put(Maneuver.TURN_LEFT, androidx.car.app.navigation.model.Maneuver.TYPE_TURN_NORMAL_LEFT)
          .put(
              Maneuver.TURN_RIGHT,
              androidx.car.app.navigation.model.Maneuver.TYPE_TURN_NORMAL_RIGHT)
          .put(Maneuver.TURN_KEEP_LEFT, androidx.car.app.navigation.model.Maneuver.TYPE_KEEP_LEFT)
          .put(Maneuver.TURN_KEEP_RIGHT, androidx.car.app.navigation.model.Maneuver.TYPE_KEEP_RIGHT)
          .put(
              Maneuver.TURN_SLIGHT_LEFT,
              androidx.car.app.navigation.model.Maneuver.TYPE_TURN_SLIGHT_LEFT)
          .put(
              Maneuver.TURN_SLIGHT_RIGHT,
              androidx.car.app.navigation.model.Maneuver.TYPE_TURN_SLIGHT_RIGHT)
          .put(
              Maneuver.TURN_SHARP_LEFT,
              androidx.car.app.navigation.model.Maneuver.TYPE_TURN_SHARP_LEFT)
          .put(
              Maneuver.TURN_SHARP_RIGHT,
              androidx.car.app.navigation.model.Maneuver.TYPE_ON_RAMP_SHARP_RIGHT)
          .put(
              Maneuver.TURN_U_TURN_CLOCKWISE,
              androidx.car.app.navigation.model.Maneuver.TYPE_U_TURN_RIGHT)
          .put(
              Maneuver.TURN_U_TURN_COUNTERCLOCKWISE,
              androidx.car.app.navigation.model.Maneuver.TYPE_U_TURN_LEFT)
          .put(
              Maneuver.MERGE_UNSPECIFIED,
              androidx.car.app.navigation.model.Maneuver.TYPE_MERGE_SIDE_UNSPECIFIED)
          .put(Maneuver.MERGE_LEFT, androidx.car.app.navigation.model.Maneuver.TYPE_MERGE_LEFT)
          .put(Maneuver.MERGE_RIGHT, androidx.car.app.navigation.model.Maneuver.TYPE_MERGE_RIGHT)
          .put(Maneuver.FORK_LEFT, androidx.car.app.navigation.model.Maneuver.TYPE_FORK_LEFT)
          .put(Maneuver.FORK_RIGHT, androidx.car.app.navigation.model.Maneuver.TYPE_FORK_RIGHT)
          .put(
              Maneuver.ON_RAMP_UNSPECIFIED,
              androidx.car.app.navigation.model.Maneuver.TYPE_ON_RAMP_NORMAL_RIGHT)
          .put(
              Maneuver.ON_RAMP_LEFT,
              androidx.car.app.navigation.model.Maneuver.TYPE_ON_RAMP_NORMAL_LEFT)
          .put(
              Maneuver.ON_RAMP_RIGHT,
              androidx.car.app.navigation.model.Maneuver.TYPE_ON_RAMP_NORMAL_RIGHT)
          .put(
              Maneuver.ON_RAMP_KEEP_LEFT,
              androidx.car.app.navigation.model.Maneuver.TYPE_ON_RAMP_NORMAL_LEFT)
          .put(
              Maneuver.ON_RAMP_KEEP_RIGHT,
              androidx.car.app.navigation.model.Maneuver.TYPE_ON_RAMP_NORMAL_RIGHT)
          .put(
              Maneuver.ON_RAMP_SLIGHT_LEFT,
              androidx.car.app.navigation.model.Maneuver.TYPE_ON_RAMP_SLIGHT_LEFT)
          .put(
              Maneuver.ON_RAMP_SLIGHT_RIGHT,
              androidx.car.app.navigation.model.Maneuver.TYPE_ON_RAMP_SLIGHT_RIGHT)
          .put(
              Maneuver.ON_RAMP_SHARP_LEFT,
              androidx.car.app.navigation.model.Maneuver.TYPE_ON_RAMP_SHARP_LEFT)
          .put(
              Maneuver.ON_RAMP_SHARP_RIGHT,
              androidx.car.app.navigation.model.Maneuver.TYPE_ON_RAMP_SHARP_RIGHT)
          .put(
              Maneuver.ON_RAMP_U_TURN_CLOCKWISE,
              androidx.car.app.navigation.model.Maneuver.TYPE_ON_RAMP_U_TURN_RIGHT)
          .put(
              Maneuver.ON_RAMP_U_TURN_COUNTERCLOCKWISE,
              androidx.car.app.navigation.model.Maneuver.TYPE_ON_RAMP_U_TURN_LEFT)
          .put(
              Maneuver.OFF_RAMP_LEFT,
              androidx.car.app.navigation.model.Maneuver.TYPE_OFF_RAMP_NORMAL_LEFT)
          .put(
              Maneuver.OFF_RAMP_RIGHT,
              androidx.car.app.navigation.model.Maneuver.TYPE_OFF_RAMP_NORMAL_RIGHT)
          .put(
              Maneuver.OFF_RAMP_KEEP_LEFT,
              androidx.car.app.navigation.model.Maneuver.TYPE_OFF_RAMP_SLIGHT_LEFT)
          .put(
              Maneuver.OFF_RAMP_KEEP_RIGHT,
              androidx.car.app.navigation.model.Maneuver.TYPE_OFF_RAMP_SLIGHT_RIGHT)
          .put(
              Maneuver.OFF_RAMP_SLIGHT_LEFT,
              androidx.car.app.navigation.model.Maneuver.TYPE_OFF_RAMP_SLIGHT_LEFT)
          .put(
              Maneuver.OFF_RAMP_SLIGHT_RIGHT,
              androidx.car.app.navigation.model.Maneuver.TYPE_OFF_RAMP_SLIGHT_RIGHT)
          .put(
              Maneuver.OFF_RAMP_SHARP_LEFT,
              androidx.car.app.navigation.model.Maneuver.TYPE_OFF_RAMP_NORMAL_LEFT)
          .put(
              Maneuver.OFF_RAMP_SHARP_RIGHT,
              androidx.car.app.navigation.model.Maneuver.TYPE_OFF_RAMP_NORMAL_RIGHT)
          .put(
              Maneuver.ROUNDABOUT_CLOCKWISE,
              androidx.car.app.navigation.model.Maneuver.TYPE_ROUNDABOUT_ENTER_AND_EXIT_CW)
          .put(
              Maneuver.ROUNDABOUT_COUNTERCLOCKWISE,
              androidx.car.app.navigation.model.Maneuver.TYPE_ROUNDABOUT_ENTER_AND_EXIT_CCW)
          .put(
              Maneuver.ROUNDABOUT_STRAIGHT_CLOCKWISE,
              androidx.car.app.navigation.model.Maneuver.TYPE_ROUNDABOUT_ENTER_CW)
          .put(
              Maneuver.ROUNDABOUT_STRAIGHT_COUNTERCLOCKWISE,
              androidx.car.app.navigation.model.Maneuver.TYPE_ROUNDABOUT_ENTER_CCW)
          .put(
              Maneuver.ROUNDABOUT_LEFT_CLOCKWISE,
              androidx.car.app.navigation.model.Maneuver
                  .TYPE_ROUNDABOUT_ENTER_AND_EXIT_CW_WITH_ANGLE)
          .put(
              Maneuver.ROUNDABOUT_LEFT_COUNTERCLOCKWISE,
              androidx.car.app.navigation.model.Maneuver
                  .TYPE_ROUNDABOUT_ENTER_AND_EXIT_CCW_WITH_ANGLE)
          .put(
              Maneuver.ROUNDABOUT_RIGHT_CLOCKWISE,
              androidx.car.app.navigation.model.Maneuver
                  .TYPE_ROUNDABOUT_ENTER_AND_EXIT_CW_WITH_ANGLE)
          .put(
              Maneuver.ROUNDABOUT_RIGHT_COUNTERCLOCKWISE,
              androidx.car.app.navigation.model.Maneuver
                  .TYPE_ROUNDABOUT_ENTER_AND_EXIT_CCW_WITH_ANGLE)
          .put(
              Maneuver.ROUNDABOUT_SLIGHT_LEFT_CLOCKWISE,
              androidx.car.app.navigation.model.Maneuver
                  .TYPE_ROUNDABOUT_ENTER_AND_EXIT_CW_WITH_ANGLE)
          .put(
              Maneuver.ROUNDABOUT_SLIGHT_LEFT_COUNTERCLOCKWISE,
              androidx.car.app.navigation.model.Maneuver
                  .TYPE_ROUNDABOUT_ENTER_AND_EXIT_CCW_WITH_ANGLE)
          .put(
              Maneuver.ROUNDABOUT_SLIGHT_RIGHT_CLOCKWISE,
              androidx.car.app.navigation.model.Maneuver
                  .TYPE_ROUNDABOUT_ENTER_AND_EXIT_CW_WITH_ANGLE)
          .put(
              Maneuver.ROUNDABOUT_SLIGHT_RIGHT_COUNTERCLOCKWISE,
              androidx.car.app.navigation.model.Maneuver
                  .TYPE_ROUNDABOUT_ENTER_AND_EXIT_CCW_WITH_ANGLE)
          .put(
              Maneuver.ROUNDABOUT_SHARP_LEFT_CLOCKWISE,
              androidx.car.app.navigation.model.Maneuver
                  .TYPE_ROUNDABOUT_ENTER_AND_EXIT_CW_WITH_ANGLE)
          .put(
              Maneuver.ROUNDABOUT_SHARP_LEFT_COUNTERCLOCKWISE,
              androidx.car.app.navigation.model.Maneuver
                  .TYPE_ROUNDABOUT_ENTER_AND_EXIT_CCW_WITH_ANGLE)
          .put(
              Maneuver.ROUNDABOUT_SHARP_RIGHT_CLOCKWISE,
              androidx.car.app.navigation.model.Maneuver
                  .TYPE_ROUNDABOUT_ENTER_AND_EXIT_CW_WITH_ANGLE)
          .put(
              Maneuver.ROUNDABOUT_SHARP_RIGHT_COUNTERCLOCKWISE,
              androidx.car.app.navigation.model.Maneuver
                  .TYPE_ROUNDABOUT_ENTER_AND_EXIT_CCW_WITH_ANGLE)
          .put(
              Maneuver.ROUNDABOUT_U_TURN_CLOCKWISE,
              androidx.car.app.navigation.model.Maneuver
                  .TYPE_ROUNDABOUT_ENTER_AND_EXIT_CW_WITH_ANGLE)
          .put(
              Maneuver.ROUNDABOUT_U_TURN_COUNTERCLOCKWISE,
              androidx.car.app.navigation.model.Maneuver
                  .TYPE_ROUNDABOUT_ENTER_AND_EXIT_CCW_WITH_ANGLE)
          .put(
              Maneuver.ROUNDABOUT_EXIT_CLOCKWISE,
              androidx.car.app.navigation.model.Maneuver.TYPE_ROUNDABOUT_EXIT_CW)
          .put(
              Maneuver.ROUNDABOUT_EXIT_COUNTERCLOCKWISE,
              androidx.car.app.navigation.model.Maneuver.TYPE_ROUNDABOUT_EXIT_CCW)
          .put(Maneuver.FERRY_BOAT, androidx.car.app.navigation.model.Maneuver.TYPE_FERRY_BOAT)
          .put(Maneuver.FERRY_TRAIN, androidx.car.app.navigation.model.Maneuver.TYPE_FERRY_TRAIN)
          .put(Maneuver.NAME_CHANGE, androidx.car.app.navigation.model.Maneuver.TYPE_NAME_CHANGE)
          .buildOrThrow();

  /** Represents the roundabout turn angle for a slight turn in either right or left directions. */
  private static final int ROUNDABOUT_ANGLE_SLIGHT = 10;

  /** Represents the roundabout turn angle for a normal turn in either right or left directions. */
  private static final int ROUNDABOUT_ANGLE_NORMAL = 45;

  /** Represents the roundabout turn angle for a sharp turn in either right or left directions. */
  private static final int ROUNDABOUT_ANGLE_SHARP = 135;

  /** Represents the roundabout turn angle for a u-turn in either right or left directions. */
  private static final int ROUNDABOUT_ANGLE_U_TURN = 180;

  /**
   * Returns the corresponding {@link androidx.car.app.navigation.model.Maneuver.Type} for the given
   * direction {@link Maneuver}
   *
   * @throws {@link IllegalArgumentException} if the given maneuver does not have a corresponding
   *     Android Auto Maneuver type.
   */
  public static int getAndroidAutoManeuverType(@Maneuver int maneuver) {
    if (MANEUVER_TO_ANDROID_AUTO_MANEUVER_TYPE.containsKey(maneuver)) {
      return MANEUVER_TO_ANDROID_AUTO_MANEUVER_TYPE.get(maneuver);
    }
    throw new IllegalArgumentException(
        String.format(
            "Given turn-by-turn Maneuver %d cannot be converted to an Android Auto equivalent.",
            maneuver));
  }

  /**
   * Returns the corresponding Android Auto roundabout angle for the given turn {@link Maneuver}.
   * Returns {@code null} if given maneuver does not involve a roundabout with a turn.
   */
  @Nullable
  public static Integer getAndroidAutoRoundaboutAngle(@Maneuver int maneuver) {
    if (maneuver == Maneuver.ROUNDABOUT_LEFT_CLOCKWISE
        || maneuver == Maneuver.ROUNDABOUT_RIGHT_CLOCKWISE
        || maneuver == Maneuver.ROUNDABOUT_LEFT_COUNTERCLOCKWISE
        || maneuver == Maneuver.ROUNDABOUT_RIGHT_COUNTERCLOCKWISE) {
      return ROUNDABOUT_ANGLE_NORMAL;
    }
    if (maneuver == Maneuver.ROUNDABOUT_SHARP_LEFT_CLOCKWISE
        || maneuver == Maneuver.ROUNDABOUT_SHARP_RIGHT_CLOCKWISE
        || maneuver == Maneuver.ROUNDABOUT_SHARP_LEFT_COUNTERCLOCKWISE
        || maneuver == Maneuver.ROUNDABOUT_SHARP_RIGHT_COUNTERCLOCKWISE) {
      return ROUNDABOUT_ANGLE_SHARP;
    }
    if (maneuver == Maneuver.ROUNDABOUT_SLIGHT_LEFT_CLOCKWISE
        || maneuver == Maneuver.ROUNDABOUT_SLIGHT_RIGHT_CLOCKWISE
        || maneuver == Maneuver.ROUNDABOUT_SLIGHT_LEFT_COUNTERCLOCKWISE
        || maneuver == Maneuver.ROUNDABOUT_SLIGHT_RIGHT_COUNTERCLOCKWISE) {
      return ROUNDABOUT_ANGLE_SLIGHT;
    }
    if (maneuver == Maneuver.ROUNDABOUT_U_TURN_CLOCKWISE
        || maneuver == Maneuver.ROUNDABOUT_U_TURN_COUNTERCLOCKWISE) {
      return ROUNDABOUT_ANGLE_U_TURN;
    }
    return null;
  }
}
