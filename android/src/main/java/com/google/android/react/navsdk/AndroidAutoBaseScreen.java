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

package com.google.android.react.navsdk;

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
import androidx.car.app.model.Template;
import androidx.car.app.navigation.model.NavigationTemplate;
import androidx.lifecycle.DefaultLifecycleObserver;
import androidx.lifecycle.Lifecycle;
import androidx.lifecycle.LifecycleObserver;
import androidx.lifecycle.LifecycleOwner;
import com.facebook.proguard.annotations.DoNotStrip;
import com.facebook.react.bridge.ReadableMap;
import com.google.android.gms.maps.CameraUpdate;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.libraries.navigation.NavigationViewForAuto;
import com.google.android.libraries.navigation.StylingOptions;

// This class streamlines the Android Auto setup process by managing initialization, teardown, and
// map rendering on the Android Auto display. You can create your own Screen class by extending this
// one and overriding its functions as needed.
//
// For more information on using Android Auto with the Google Navigation SDK, refer to the official
// documentation:
// https://developers.google.com/maps/documentation/navigation/android-sdk/android-auto
@DoNotStrip
public abstract class AndroidAutoBaseScreen extends Screen
    implements SurfaceCallback, INavigationViewController {
  private static final String VIRTUAL_DISPLAY_NAME = "AndroidAutoNavScreen";

  private NavigationViewForAuto mNavigationView;
  private VirtualDisplay mVirtualDisplay;
  private Presentation mPresentation;
  protected GoogleMap mGoogleMap;
  protected boolean mNavigationInitialized = false;
  private MapViewController mMapViewController;

  private boolean mAndroidAutoModuleInitialized = false;
  private boolean mNavModuleInitialized = false;
  private final AndroidAutoBaseScreen screenInstance = this;

  @Override
  public void setStylingOptions(StylingOptions stylingOptions) {
    // TODO(jokerttu): set styling to the navigationView
  }

  public void onNavigationReady(boolean ready) {
    mNavigationInitialized = ready;
  }

  public AndroidAutoBaseScreen(@NonNull CarContext carContext) {

    super(carContext);

    NavAutoModule.setModuleReadyListener(
        () -> {
          mAndroidAutoModuleInitialized = true;
          registerControllersForAndroidAutoModule();
        });

    NavModule.setModuleReadyListener(
        () -> {
          mNavModuleInitialized = true;
          NavModule.getInstance().registerNavigationReadyListener(this::onNavigationReady);
        });

    carContext.getCarService(AppManager.class).setSurfaceCallback(this);

    Lifecycle lifecycle = getLifecycle();
    lifecycle.addObserver(mLifeCycleObserver);
  }

  private final LifecycleObserver mLifeCycleObserver =
      new DefaultLifecycleObserver() {
        @Override
        public void onDestroy(@NonNull LifecycleOwner lifecycleOwner) {
          if (mNavModuleInitialized) {
            try {
              NavModule.getInstance()
                  .unRegisterNavigationReadyListener(screenInstance::onNavigationReady);
            } catch (Exception e) {
            }
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

    mNavigationView.getMapAsync(
        (GoogleMap googleMap) -> {
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
        CameraUpdateFactory.zoomBy((scaleFactor - 1), new Point((int) focusX, (int) focusY));
    mGoogleMap.animateCamera(update); // map is set in onSurfaceAvailable.
  }

  protected void sendCustomEvent(String type, ReadableMap data) {
    NavAutoModule.getInstance().onCustomNavigationAutoEvent(type, data);
  }

  @NonNull
  @Override
  public Template onGetTemplate() {
    return new NavigationTemplate.Builder()
        .setMapActionStrip(new ActionStrip.Builder().addAction(Action.PAN).build())
        .build();
  }
}
