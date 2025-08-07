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
package com.google.maps.android.rn.navsdkexample

import android.annotation.SuppressLint
import androidx.car.app.CarContext
import androidx.car.app.model.Action
import androidx.car.app.model.ActionStrip
import androidx.car.app.model.CarIcon
import androidx.car.app.model.Distance
import androidx.car.app.model.Pane
import androidx.car.app.model.PaneTemplate
import androidx.car.app.model.Row
import androidx.car.app.model.Template
import androidx.car.app.navigation.model.Maneuver
import androidx.car.app.navigation.model.NavigationTemplate
import androidx.car.app.navigation.model.RoutingInfo
import androidx.car.app.navigation.model.Step
import androidx.core.graphics.drawable.IconCompat
import com.facebook.react.bridge.Arguments
import com.google.android.gms.maps.GoogleMap
import com.google.android.libraries.mapsplatform.turnbyturn.model.NavInfo
import com.google.android.libraries.mapsplatform.turnbyturn.model.StepInfo
import com.google.maps.android.rn.navsdk.GMNAndroidAutoBaseScreen
import com.google.maps.android.rn.navsdk.GMNNavInfoReceivingService
import com.google.maps.android.rn.navsdkexample.ManeuverConverter.getAndroidAutoManeuverType

class SampleAndroidAutoScreen(carContext: CarContext) : GMNAndroidAutoBaseScreen(carContext) {
  protected var mNavInfo: RoutingInfo? = null

  init {
    // Connect to the Turn-by-Turn Navigation service to receive navigation data.
    GMNNavInfoReceivingService.getNavInfoLiveData().observe(this) { navInfo: NavInfo? ->
      this.buildNavInfo(navInfo)
    }
  }

  private fun buildNavInfo(navInfo: NavInfo?) {
    if (navInfo == null || navInfo.currentStep == null) {
      return
    }

    /**
     * Converts data received from the Navigation data feed into Android-Auto compatible data
     * structures.
     */
    val currentStep = buildStepFromStepInfo(navInfo.currentStep)
    val distanceToStep =
      Distance.create(
        java.lang.Double.max(navInfo.distanceToCurrentStepMeters.toDouble(), 0.0),
        Distance.UNIT_METERS,
      )

    mNavInfo = RoutingInfo.Builder().setCurrentStep(currentStep, distanceToStep).build()

    // Invalidate the current template which leads to another onGetTemplate call.
    invalidate()
  }

  override fun onNavigationReady(ready: Boolean) {
    super.onNavigationReady(ready)
    // Invalidate template layout because of conditional rendering in the
    // onGetTemplate method.
    invalidate()
  }

  private fun buildStepFromStepInfo(stepInfo: StepInfo): Step {
    val maneuver = getAndroidAutoManeuverType(stepInfo.maneuver)
    val maneuverBuilder = Maneuver.Builder(maneuver)
    val maneuverIcon = IconCompat.createWithBitmap(stepInfo.maneuverBitmap)
    val maneuverCarIcon = CarIcon.Builder(maneuverIcon).build()
    maneuverBuilder.setIcon(maneuverCarIcon)
    val stepBuilder =
      Step.Builder()
        .setRoad(stepInfo.fullRoadName)
        .setCue(stepInfo.fullInstructionText)
        .setManeuver(maneuverBuilder.build())
    return stepBuilder.build()
  }

  override fun onGetTemplate(): Template {
    if (!mNavigationInitialized) {
      return PaneTemplate.Builder(
          Pane.Builder()
            .addRow(
              Row.Builder()
                .setTitle("Nav SampleApp")
                .addText(
                  "Initialize navigation to see navigation view on the Android Auto" + " screen"
                )
                .build()
            )
            .build()
        )
        .build()
    }

    // Suppresses the missing permission check for the followMyLocation method, which requires
    // "android.permission.ACCESS_COARSE_LOCATION" or "android.permission.ACCESS_FINE_LOCATION", as
    // these permissions are already handled elsewhere.
    @SuppressLint("MissingPermission")
    val navigationTemplateBuilder =
      NavigationTemplate.Builder()
        .setActionStrip(
          ActionStrip.Builder()
            .addAction(
              Action.Builder()
                .setTitle("Re-center")
                .setOnClickListener {
                  if (mGoogleMap == null) return@setOnClickListener
                  mGoogleMap.followMyLocation(GoogleMap.CameraPerspective.TILTED)
                }
                .build()
            )
            .addAction(
              Action.Builder()
                .setTitle("Custom event")
                .setOnClickListener {
                  val map = Arguments.createMap()
                  map.putString("sampleKey", "sampleValue")
                  sendCustomEvent("sampleEvent", map)
                }
                .build()
            )
            .build()
        )
        .setMapActionStrip(ActionStrip.Builder().addAction(Action.PAN).build())

    // Show turn-by-turn navigation information if available.
    if (mNavInfo != null) {
      navigationTemplateBuilder.setNavigationInfo(mNavInfo!!)
    }

    return navigationTemplateBuilder.build()
  }
}
