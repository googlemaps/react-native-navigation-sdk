/*
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

package com.sampleapp

import android.os.Handler
import android.os.Looper
import androidx.car.app.CarContext
import androidx.car.app.model.ActionStrip
import androidx.car.app.model.CarIcon
import androidx.car.app.model.MessageTemplate
import androidx.car.app.navigation.model.MapController
import androidx.car.app.navigation.model.MapWithContentTemplate
import androidx.car.app.navigation.model.MessageInfo
import androidx.car.app.navigation.model.NavigationTemplate
import androidx.car.app.navigation.model.RoutingInfo
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.google.android.react.navsdk.AndroidAutoBaseScreen
import com.google.android.react.navsdk.NavInfoReceivingService
import org.json.JSONObject

class SampleAndroidAutoScreen(carContext: CarContext) : AndroidAutoBaseScreen(carContext) {
  protected var mNavInfo: NavigationTemplate.NavigationInfo? = null
  private var mCustomMessage: String? = null
  private val mHandler = Handler(Looper.getMainLooper())
  private var mClearMessageRunnable: Runnable? = null

  override fun setNightModeOption(nightMode: Int) {
    // Night mode is handled by the base class NavigationViewForAuto
    // This method is required by INavigationViewController interface
  }

  init {
    // Connect to the Turn-by-Turn Navigation service to receive navigation data.
    NavInfoReceivingService.getNavInfoLiveData()
      .observe(
        this,
        androidx.lifecycle.Observer {
          navInfo: com.google.android.libraries.mapsplatform.turnbyturn.model.NavInfo? ->
          this.buildNavInfo(navInfo)
        },
      )
  }

  private fun buildNavInfo(
    navInfo: com.google.android.libraries.mapsplatform.turnbyturn.model.NavInfo?
  ) {
    if (navInfo == null || navInfo.currentStep == null) {
      return
    }

    /**
     * Converts data received from the Navigation data feed into Android-Auto compatible data
     * structures.
     */
    val currentStep: androidx.car.app.navigation.model.Step =
      buildStepFromStepInfo(navInfo.currentStep!!)
    val distanceToStep: androidx.car.app.model.Distance =
      androidx.car.app.model.Distance.create(
        kotlin.math.max(navInfo.distanceToCurrentStepMeters?.toDouble() ?: 0.0, 0.0),
        androidx.car.app.model.Distance.UNIT_METERS,
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

  private fun buildStepFromStepInfo(
    stepInfo: com.google.android.libraries.mapsplatform.turnbyturn.model.StepInfo
  ): androidx.car.app.navigation.model.Step {
    val maneuver: Int = ManeuverConverter.getAndroidAutoManeuverType(stepInfo.maneuver)
    val maneuverBuilder: androidx.car.app.navigation.model.Maneuver.Builder =
      androidx.car.app.navigation.model.Maneuver.Builder(maneuver)
    val maneuverIcon: androidx.core.graphics.drawable.IconCompat =
      androidx.core.graphics.drawable.IconCompat.createWithBitmap(stepInfo.maneuverBitmap!!)
    val maneuverCarIcon: CarIcon = CarIcon.Builder(maneuverIcon).build()
    maneuverBuilder.setIcon(maneuverCarIcon)
    val stepBuilder: androidx.car.app.navigation.model.Step.Builder =
      androidx.car.app.navigation.model.Step.Builder()
        .setRoad(stepInfo.fullRoadName ?: "")
        .setCue(stepInfo.fullInstructionText ?: "")
        .setManeuver(maneuverBuilder.build())
    return stepBuilder.build()
  }

  override fun onGetTemplate(): androidx.car.app.model.Template {
    // Suppresses the missing permission check for the followMyLocation method, which requires
    // "android.permission.ACCESS_COARSE_LOCATION" or "android.permission.ACCESS_FINE_LOCATION", as
    // these permissions are already handled elsewhere.
    @android.annotation.SuppressLint("MissingPermission")

    // Use MapWithContentTemplate when navigation is not initialized to show a message
    // without requiring an ActionStrip. Once navigation is initialized, switch to
    // NavigationTemplate which supports turn-by-turn navigation info.
    if (!mNavigationInitialized) {
      return MapWithContentTemplate.Builder()
        .setContentTemplate(
          MessageTemplate.Builder("Start navigation on your phone to see directions here.")
            .setTitle("Navigation not started")
            .build()
        )
        .setMapController(
          MapController.Builder()
            .setMapActionStrip(
              ActionStrip.Builder().addAction(androidx.car.app.model.Action.PAN).build()
            )
            .build()
        )
        .build()
    }

    // Navigation is initialized, build NavigationTemplate.
    val actionStripBuilder = ActionStrip.Builder()

    // Add Re-center button
    actionStripBuilder.addAction(
      androidx.car.app.model.Action.Builder()
        .setTitle("Re-center")
        .setOnClickListener {
          mGoogleMap?.followMyLocation(
            com.google.android.gms.maps.GoogleMap.CameraPerspective.TILTED
          )
        }
        .build()
    )

    // Add Custom event button
    actionStripBuilder.addAction(
      androidx.car.app.model.Action.Builder()
        .setTitle("Custom event")
        .setOnClickListener {
          val map: WritableMap = Arguments.createMap()
          map.putString("sampleKey", "sampleValue")
          sendCustomEvent("sampleEvent", map)
        }
        .build()
    )

    val navigationTemplateBuilder: NavigationTemplate.Builder =
      NavigationTemplate.Builder()
        .setActionStrip(actionStripBuilder.build())
        .setMapActionStrip(
          ActionStrip.Builder().addAction(androidx.car.app.model.Action.PAN).build()
        )

    // Show custom message if available, otherwise show turn-by-turn navigation info.
    if (mCustomMessage != null) {
      navigationTemplateBuilder.setNavigationInfo(
        MessageInfo.Builder("Message from phone").setText(mCustomMessage!!).build()
      )
    } else {
      mNavInfo?.let { navigationTemplateBuilder.setNavigationInfo(it) }
    }

    return navigationTemplateBuilder.build()
  }

  override fun onCustomMessageReceived(type: String, data: JSONObject?) {
    android.util.Log.d(
      "SampleAndroidAutoScreen",
      "Received custom message - type: $type, data: $data",
    )

    // Show the message on the Android Auto screen
    val dataStr = data?.toString(2) ?: ""
    mCustomMessage = "Received: $type $dataStr"
    invalidate()

    // Cancel any pending clear message callback
    mClearMessageRunnable?.let { mHandler.removeCallbacks(it) }

    // Clear the message after 3 seconds
    mClearMessageRunnable = Runnable {
      mCustomMessage = null
      invalidate()
    }
    mHandler.postDelayed(mClearMessageRunnable!!, 3000)
  }
}
