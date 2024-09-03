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
import android.app.Presentation;
import android.graphics.Point;
import android.hardware.display.DisplayManager;
import android.hardware.display.VirtualDisplay;

import androidx.annotation.NonNull;
import androidx.car.app.AppManager;
import androidx.car.app.CarContext;
import androidx.car.app.Screen;
import androidx.car.app.SurfaceCallback;
import androidx.car.app.SurfaceContainer;
import androidx.car.app.model.Action;
import androidx.car.app.model.ActionStrip;
import androidx.car.app.model.Distance;
import androidx.car.app.model.Pane;
import androidx.car.app.model.PaneTemplate;
import androidx.car.app.model.Row;
import androidx.car.app.model.Template;
import androidx.car.app.navigation.model.Maneuver;
import androidx.car.app.navigation.model.NavigationTemplate;
import androidx.car.app.navigation.model.RoutingInfo;
import androidx.car.app.navigation.model.Step;
import androidx.lifecycle.DefaultLifecycleObserver;
import androidx.lifecycle.Lifecycle;
import androidx.lifecycle.LifecycleObserver;
import androidx.lifecycle.LifecycleOwner;

import com.google.android.gms.maps.CameraUpdate;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.model.CircleOptions;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.libraries.mapsplatform.turnbyturn.model.NavInfo;
import com.google.android.libraries.mapsplatform.turnbyturn.model.StepInfo;
import com.google.android.libraries.navigation.NavigationViewForAuto;

import com.google.android.libraries.navigation.StylingOptions;
import com.google.android.react.navsdk.NavAutoModule;
import com.google.android.react.navsdk.INavigationViewController;
import com.google.android.react.navsdk.MapViewController;
import com.google.android.react.navsdk.NavInfoReceivingService;
import com.google.android.react.navsdk.NavModule;

public class SampleAndroidAutoScreen extends Screen implements SurfaceCallback, INavigationViewController {
  private static final String VIRTUAL_DISPLAY_NAME = "SampleAppNavScreen";

  private NavigationViewForAuto mNavigationView;
  private VirtualDisplay mVirtualDisplay;
  private Presentation mPresentation;
  private GoogleMap mGoogleMap;
  private boolean mNavigationInitialized = false;
  private RoutingInfo mCurrentRoutingInfo;
  private MapViewController mMapViewController;

  private boolean mAndroidAutoModuleInitialized = false;
  private boolean mNavModuleInitialized = false;
  private final SampleAndroidAutoScreen screenInstance = this;

  @Override
  public void setStylingOptions(StylingOptions stylingOptions) {
    // TODO(jokerttu): set styling to the navigationView
  }

  public void onNavigationReady(boolean ready) {
    mNavigationInitialized = ready;
    invalidate();
  }

  public SampleAndroidAutoScreen(
    @NonNull CarContext carContext) {

    super(carContext);

    NavAutoModule.setModuleReadyListener(() -> {
      mAndroidAutoModuleInitialized = true;
      registerControllersForAndroidAutoModule();
    });

    NavModule.setModuleReadyListener(() -> {
      mNavModuleInitialized = true;
      NavModule.getInstance().registerNavigationReadyListener(this::onNavigationReady);
    });

    carContext.getCarService(AppManager.class).setSurfaceCallback(this);
    NavInfoReceivingService.getNavInfoLiveData().observe(this, this::processNextStep);

    Lifecycle lifecycle = getLifecycle();
    lifecycle.addObserver(mLifeCycleObserver);
  }


  private final LifecycleObserver mLifeCycleObserver =
    new DefaultLifecycleObserver() {
      @Override
      public void onDestroy(@NonNull LifecycleOwner lifecycleOwner) {
        if (mNavModuleInitialized) {
          try {
            NavModule.getInstance().unRegisterNavigationReadyListener(screenInstance::onNavigationReady);
          } catch (Exception e) {}
        }
      }
    };



  private void registerControllersForAndroidAutoModule() {
    if (mAndroidAutoModuleInitialized && mMapViewController != null) {
      NavAutoModule.getInstance().androidAutoNavigationScreenInitialized(mMapViewController, this);
    }
  }

  private void unRegisterControllersForAndroidAutoModule() {
    if (mAndroidAutoModuleInitialized) {
      NavAutoModule.getInstance().androidAutoNavigationScreenDisposed();
    }
  }

  private void processNextStep(NavInfo navInfo) {
    if (navInfo == null || navInfo.getCurrentStep() == null) {
      return;
    }

    /**
     *   Converts data received from the Navigation data feed
     *   into Android-Auto compatible data structures. For more information
     *   see the "Ensure correct maneuver types" below.
     */
    Step currentStep = buildStepFromStepInfo(navInfo.getCurrentStep());
    Distance distanceToStep = Distance.create(max(navInfo.getDistanceToCurrentStepMeters(),0), Distance.UNIT_METERS);

    mCurrentRoutingInfo =
      new RoutingInfo.Builder().setCurrentStep(currentStep, distanceToStep).build();

    // Invalidate the current template which leads to another onGetTemplate call.
    invalidate();
  }

  private Step buildStepFromStepInfo(StepInfo stepInfo) {
    Maneuver.Builder
      maneuverBuilder = new Maneuver.Builder(
      stepInfo.getManeuver());
    Step.Builder stepBuilder =
      new Step.Builder()
        .setRoad(stepInfo.getFullRoadName())
        .setCue(stepInfo.getFullInstructionText())
        .setManeuver(maneuverBuilder.build());
    return stepBuilder.build();
  }

  private boolean isSurfaceReady(SurfaceContainer surfaceContainer) {
    return surfaceContainer.getSurface() != null
      && surfaceContainer.getDpi() != 0
      && surfaceContainer.getHeight() != 0
      && surfaceContainer.getWidth() != 0;
  }

  @Override
  public void onSurfaceAvailable(@NonNull SurfaceContainer surfaceContainer) {
    if (!isSurfaceReady(surfaceContainer)) {
      return;
    }
    mVirtualDisplay =
      getCarContext()
        .getSystemService(DisplayManager.class)
        .createVirtualDisplay(
          VIRTUAL_DISPLAY_NAME,
          surfaceContainer.getWidth(),
          surfaceContainer.getHeight(),
          surfaceContainer.getDpi(),
          surfaceContainer.getSurface(),
          DisplayManager.VIRTUAL_DISPLAY_FLAG_OWN_CONTENT_ONLY);
    mPresentation = new Presentation(getCarContext(), mVirtualDisplay.getDisplay());

    mNavigationView = new NavigationViewForAuto(getCarContext());
    mNavigationView.onCreate(null);
    mNavigationView.onStart();
    mNavigationView.onResume();

    mPresentation.setContentView(mNavigationView);
    mPresentation.show();

    mNavigationView.getMapAsync((GoogleMap googleMap) -> {
      mGoogleMap = googleMap;
      mMapViewController = new MapViewController();
      mMapViewController.initialize(googleMap, () -> null);
      registerControllersForAndroidAutoModule();
      invalidate();
    });
  }

  @Override
  public void onSurfaceDestroyed(@NonNull SurfaceContainer surfaceContainer) {
    unRegisterControllersForAndroidAutoModule();
    mNavigationView.onPause();
    mNavigationView.onStop();
    mNavigationView.onDestroy();
    mGoogleMap = null;

    mPresentation.dismiss();
    mVirtualDisplay.release();
  }


  @Override
  public void onScroll(float distanceX, float distanceY) {
    if (mGoogleMap == null) {
      return;
    }
    mGoogleMap.moveCamera(CameraUpdateFactory.scrollBy(distanceX, distanceY));
  }

  @Override
  public void onScale(float focusX, float focusY, float scaleFactor) {
    if (mGoogleMap == null) {
      return;
    }
    CameraUpdate update =
      CameraUpdateFactory.zoomBy((scaleFactor - 1),
        new Point((int) focusX, (int) focusY));
    mGoogleMap.animateCamera(update); // map is set in onSurfaceAvailable.
  }

  @NonNull
  @Override
  @SuppressLint("MissingPermission")
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


