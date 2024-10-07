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

import static java.lang.Double.max;

import android.annotation.SuppressLint;
import androidx.annotation.NonNull;
import androidx.car.app.CarContext;
import androidx.car.app.model.Action;
import androidx.car.app.model.ActionStrip;
import androidx.car.app.model.CarIcon;
import androidx.car.app.model.Distance;
import androidx.car.app.model.Pane;
import androidx.car.app.model.PaneTemplate;
import androidx.car.app.model.Row;
import androidx.car.app.model.Template;
import androidx.car.app.navigation.model.Maneuver;
import androidx.car.app.navigation.model.NavigationTemplate;
import androidx.car.app.navigation.model.RoutingInfo;
import androidx.car.app.navigation.model.Step;
import androidx.core.graphics.drawable.IconCompat;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.libraries.mapsplatform.turnbyturn.model.NavInfo;
import com.google.android.libraries.mapsplatform.turnbyturn.model.StepInfo;
import com.google.android.react.navsdk.AndroidAutoBaseScreen;
import com.google.android.react.navsdk.NavInfoReceivingService;

public class SampleAndroidAutoScreen extends AndroidAutoBaseScreen {
  protected RoutingInfo mNavInfo;

  public SampleAndroidAutoScreen(@NonNull CarContext carContext) {
    super(carContext);

    // Connect to the Turn-by-Turn Navigation service to receive navigation data.
    NavInfoReceivingService.getNavInfoLiveData().observe(this, this::buildNavInfo);
  }

  private void buildNavInfo(NavInfo navInfo) {
    if (navInfo == null || navInfo.getCurrentStep() == null) {
      return;
    }

    /**
     * Converts data received from the Navigation data feed into Android-Auto compatible data
     * structures.
     */
    Step currentStep = buildStepFromStepInfo(navInfo.getCurrentStep());
    Distance distanceToStep =
        Distance.create(max(navInfo.getDistanceToCurrentStepMeters(), 0), Distance.UNIT_METERS);

    mNavInfo = new RoutingInfo.Builder().setCurrentStep(currentStep, distanceToStep).build();

    // Invalidate the current template which leads to another onGetTemplate call.
    invalidate();
  }

  @Override
  public void onNavigationReady(boolean ready) {
    super.onNavigationReady(ready);
    // Invalidate template layout because of conditional rendering in the
    // onGetTemplate method.
    invalidate();
  }

  private Step buildStepFromStepInfo(StepInfo stepInfo) {
    int maneuver = ManeuverConverter.getAndroidAutoManeuverType(stepInfo.getManeuver());
    Maneuver.Builder maneuverBuilder = new Maneuver.Builder(maneuver);
    IconCompat maneuverIcon = IconCompat.createWithBitmap(stepInfo.getManeuverBitmap());
    CarIcon maneuverCarIcon = new CarIcon.Builder(maneuverIcon).build();
    maneuverBuilder.setIcon(maneuverCarIcon);
    Step.Builder stepBuilder =
        new Step.Builder()
            .setRoad(stepInfo.getFullRoadName())
            .setCue(stepInfo.getFullInstructionText())
            .setManeuver(maneuverBuilder.build());
    return stepBuilder.build();
  }

  @NonNull
  @Override
  public Template onGetTemplate() {
    if (!mNavigationInitialized) {
      return new PaneTemplate.Builder(
              new Pane.Builder()
                  .addRow(
                      new Row.Builder()
                          .setTitle("Nav SampleApp")
                          .addText(
                              "Initialize navigation to see navigation view on the Android Auto"
                                  + " screen")
                          .build())
                  .build())
          .build();
    }

    // Suppresses the missing permission check for the followMyLocation method, which requires
    // "android.permission.ACCESS_COARSE_LOCATION" or "android.permission.ACCESS_FINE_LOCATION", as
    // these permissions are already handled elsewhere.
    @SuppressLint("MissingPermission")
    NavigationTemplate.Builder navigationTemplateBuilder =
        new NavigationTemplate.Builder()
            .setActionStrip(
                new ActionStrip.Builder()
                    .addAction(
                        new Action.Builder()
                            .setTitle("Re-center")
                            .setOnClickListener(
                                () -> {
                                  if (mGoogleMap == null) return;
                                  mGoogleMap.followMyLocation(GoogleMap.CameraPerspective.TILTED);
                                })
                            .build())
                    .addAction(
                        new Action.Builder()
                            .setTitle("Custom event")
                            .setOnClickListener(
                                () -> {
                                  WritableMap map = Arguments.createMap();
                                  map.putString("sampleKey", "sampleValue");
                                  sendCustomEvent("sampleEvent", map);
                                })
                            .build())
                    .build())
            .setMapActionStrip(new ActionStrip.Builder().addAction(Action.PAN).build());

    // Show turn-by-turn navigation information if available.
    if (mNavInfo != null) {
      navigationTemplateBuilder.setNavigationInfo(mNavInfo);
    }

    return navigationTemplateBuilder.build();
  }
}
