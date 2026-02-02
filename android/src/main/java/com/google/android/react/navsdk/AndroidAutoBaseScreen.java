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
import androidx.annotation.Nullable;
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
import org.json.JSONObject;

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

  /**
   * Internal method called when navigation session state changes. Handles state management and
   * delegates to onNavigationReady for UI configuration.
   */
  private void onSessionAttached(boolean ready) {
    mNavigationInitialized = ready;
    onNavigationReady(ready);
  }

  /**
   * Called when the navigation session state changes. Override this method in your subclass to
   * handle navigation ready state changes.
   *
   * <p><b>Note:</b> Navigation UI controls like setHeaderEnabled, setFooterEnabled,
   * setSpeedometerEnabled, etc. are NOT supported on Android Auto's NavigationViewForAuto. These
   * controls are automatically managed by the Android Auto navigation template.
   *
   * <p>The navigation state ({@code mNavigationInitialized}) is already updated before this method
   * is called.
   *
   * @param ready true when navigation session is ready, false when it's no longer available.
   */
  protected void onNavigationReady(boolean ready) {
    // NavigationViewForAuto does not support direct UI control settings like
    // setHeaderEnabled, setFooterEnabled, setTrafficPromptsEnabled, etc.
    // These are automatically managed by the Android Auto navigation template.
    // Override this method in your subclass if you need custom behavior.
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
          try {
            NavModule.getInstance().registerNavigationReadyListener(this::onSessionAttached);
          } catch (IllegalStateException e) {
            // NavModule not yet initialized, will be registered later
          }
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
                  .unRegisterNavigationReadyListener(screenInstance::onSessionAttached);
            } catch (Exception e) {
              // Module may have been destroyed, safe to ignore.
            }
          }
        }
      };

  private void registerControllersForAndroidAutoModule() {
    if (mAndroidAutoModuleInitialized && mMapViewController != null) {
      try {
        NavAutoModule.getInstance()
            .androidAutoNavigationScreenInitialized(mMapViewController, this, this);
      } catch (IllegalStateException e) {
        // NavAutoModule not yet initialized, will be registered when module becomes ready
      }
    }
  }

  private void unRegisterControllersForAndroidAutoModule() {
    if (mAndroidAutoModuleInitialized) {
      try {
        NavAutoModule.getInstance().androidAutoNavigationScreenDisposed();
      } catch (IllegalStateException e) {
        // NavAutoModule not initialized, nothing to unregister
      }
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
          onMapViewReady();
          invalidate();
        });
  }

  /**
   * Called when the map view has been loaded and is ready. Override this method in your subclass to
   * configure map settings.
   *
   * <p><b>Note:</b> Navigation UI controls like setSpeedometerEnabled, setSpeedLimitIconEnabled,
   * etc. are NOT supported on Android Auto's NavigationViewForAuto. These controls are
   * automatically managed by the Android Auto navigation template.
   */
  protected void onMapViewReady() {
    // NavigationViewForAuto does not support direct UI control settings like
    // setSpeedometerEnabled, setSpeedLimitIconEnabled, etc.
    // These are automatically managed by the Android Auto navigation template.
    // Override this method in your subclass if you need custom behavior.
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

  /**
   * Called when a custom message is received from React Native via sendCustomMessage.
   *
   * <p>Override this method in your subclass to handle custom messages. Use this mechanism to:
   *
   * <ul>
   *   <li>Control Android Auto view templates (e.g., switch between map, list, or grid templates)
   *   <li>Update map behavior (e.g., change camera position, add/remove markers)
   *   <li>Trigger navigation actions based on app state
   *   <li>Synchronize UI state between the phone and Android Auto displays
   * </ul>
   *
   * @param type The message type identifier used to distinguish different message categories.
   * @param data The message data as a JSONObject, or null if no data was provided or parsing
   *     failed.
   */
  protected void onCustomMessageReceived(String type, @Nullable JSONObject data) {
    // Empty implementation. Override in subclass.
  }

  /**
   * Called by the host when the app needs to provide a template for display in Android Auto.
   *
   * <p>This method returns a default {@link NavigationTemplate} with basic map controls. Developers
   * can override this method to provide a custom template implementation with additional actions,
   * custom action strips, or other template configurations as needed for their specific use case.
   *
   * @return A {@link Template} to be displayed in Android Auto. The default implementation returns
   *     a {@link NavigationTemplate} with a map action strip containing a PAN action.
   */
  @NonNull
  @Override
  public Template onGetTemplate() {
    return new NavigationTemplate.Builder()
        .setMapActionStrip(new ActionStrip.Builder().addAction(Action.PAN).build())
        .build();
  }
}
