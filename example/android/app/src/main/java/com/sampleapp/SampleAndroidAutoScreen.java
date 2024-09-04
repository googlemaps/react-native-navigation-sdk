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

import androidx.annotation.NonNull;
import androidx.car.app.CarContext;
import androidx.car.app.model.Action;
import androidx.car.app.model.ActionStrip;
import androidx.car.app.model.Pane;
import androidx.car.app.model.PaneTemplate;
import androidx.car.app.model.Row;
import androidx.car.app.model.Template;
import androidx.car.app.navigation.model.NavigationTemplate;

import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.model.CircleOptions;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.react.navsdk.AndroidAutoBaseScreen;

public class SampleAndroidAutoScreen extends AndroidAutoBaseScreen {

  public SampleAndroidAutoScreen(@NonNull CarContext carContext) {
    super(carContext);
  }

  @NonNull
  @Override
  public Template onGetTemplate() {
    if (!mNavigationInitialized) {
      return new PaneTemplate.Builder(
        new Pane.Builder().addRow(
          new Row.Builder()
            .setTitle("Nav SampleApp")
            .addText("Initialize navigation to see navigation view on the Android Auto screen")
            .build()
        ).build()
      ).build();
    }

    NavigationTemplate.Builder navigationTemplateBuilder = new NavigationTemplate.Builder()
      .setActionStrip(new ActionStrip.Builder().addAction(
          new Action.Builder()
            .setTitle("Re-center")
            .setOnClickListener(
              () -> {
                if (mGoogleMap == null)
                  return;
                mGoogleMap.followMyLocation(GoogleMap.CameraPerspective.TILTED);
              }
            )
            .build()).addAction(
          new Action.Builder()
            .setTitle("Add circle")
            .setOnClickListener(
              () -> {
                if (mGoogleMap == null)
                  return;

                CircleOptions options = new CircleOptions();
                options.strokeWidth(10);
                options.radius(100000);
                options.center(new LatLng(0, 0));
                mGoogleMap.addCircle(options);
              }
            )
            .build())
        .build())
      .setMapActionStrip(new ActionStrip.Builder().addAction(Action.PAN).build());

    if (mCurrentRoutingInfo != null) {
      navigationTemplateBuilder.setNavigationInfo(mCurrentRoutingInfo);
    }

    return navigationTemplateBuilder.build();
  }
}
