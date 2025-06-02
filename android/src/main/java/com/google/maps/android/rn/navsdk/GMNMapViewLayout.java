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

import android.annotation.SuppressLint;
import android.os.Bundle;
import android.util.Log;
import android.view.Choreographer;
import android.widget.FrameLayout;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentActivity;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.google.android.gms.maps.model.CameraPosition;

@SuppressLint("ViewConstructor")
public class GMNMapViewLayout extends FrameLayout {
  static final String TAG = "GMNMapViewLayout";

  private @Nullable IGMNMapViewFragment mFragment;

  private final ThemedReactContext reactContext;
  private Integer mNativeID = null;
  private boolean mIsFragmentRegistered = false;
  private GMNViewProps mInitialViewProps;

  private GMNCustomTypes.MapViewType mMapViewType;

  private boolean mIsMapReady = false;
  private boolean mLayoutLoopRunning = false;
  private Choreographer.FrameCallback mFrameCallback;

  public GMNMapViewLayout(@NonNull ThemedReactContext context) {
    super(context);
    mInitialViewProps = new GMNViewProps();
    this.reactContext = context;
  }

  @Override
  protected void onDetachedFromWindow() {
    super.onDetachedFromWindow();
    stopLayoutLoop();
  }

  private void maybeInitFragment() {
    if (mFragment == null
        && mMapViewType != null
        && mInitialViewProps != null
        && mInitialViewProps.hasPropsSetForViewInitialization()) {
      initFragment();
    }
  }

  public void initFragment() {
    assert mInitialViewProps != null;

    if (mFragment != null) {
      Log.w(TAG, "Attempted to initialize fragment multiple times!");
      return;
    }

    Fragment fragment;
    if (mMapViewType == GMNCustomTypes.MapViewType.MAP) {
      fragment = new GMNMapViewFragment(reactContext, getId());
    } else {
      fragment = new GMNNavViewFragment(reactContext, getId());
    }

    Bundle arguments = new Bundle();
    arguments.putParcelable("MapOptions", mInitialViewProps.buildMapOptions());
    fragment.setArguments(arguments);

    mFragment = (IGMNMapViewFragment) fragment;
    mFragment.setMapReadyListener(
        () -> {
          mIsMapReady = true;

          // Install custom invalidator for the map view.
          // installInvalidator();

          // Apply initial props for the view.
          applyInitialProps();

          // After view is added update fragment layout.
          startLayoutLoop();
        });

    post(
        () -> {
          int viewId = getId();
          FragmentActivity activity = (FragmentActivity) reactContext.getCurrentActivity();
          if (activity != null) {
            activity
                .getSupportFragmentManager()
                .beginTransaction()
                .replace(viewId, fragment, String.valueOf(viewId))
                .commit();
          }
          maybeRegisterFragment();
        });
  }

  public void setNativeID(int value) {
    if (this.mNativeID == null) {
      this.mNativeID = value;
      maybeRegisterFragment();
    } else {
      Log.w(TAG, "Attempted to change nativeID after initialization!");
    }
  }

  public void maybeRegisterFragment() {
    if (!mIsFragmentRegistered && mNativeID != null && mFragment != null) {
      GMNNavViewManager.getInstance().registerFragment(mNativeID, mFragment);
      mIsFragmentRegistered = true;
    }
  }

  public Integer getNativeID() {
    return mNativeID;
  }

  public IGMNMapViewFragment getFragment() {
    return mFragment;
  }

  public GMNMapViewController getMapController() {
    assert mFragment != null;
    return mFragment.getMapController();
  }

  private boolean isReady() {
    return mFragment != null && mIsMapReady;
  }

  private IGMNNavViewFragment getNavFragment() {
    if (mFragment instanceof IGMNNavViewFragment) {
      return (IGMNNavViewFragment) mFragment;
    }
    Log.w(TAG, "Attempting to access Nav specific property on a Map view");
    return null;
  }

  @Override
  protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
    super.onMeasure(widthMeasureSpec, heightMeasureSpec);
    updateFragmentMeasures();
  }

  @Override
  protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
    super.onLayout(changed, left, top, right, bottom);
    updateFragmentLayout();
  }

  // Measure the fragment's view to fit within this GMNMapViewLayout.
  // These dimensions (getMeasuredWidth(), getMeasuredHeight()) are determined
  // by React Native's Fabric layout pass for GMNMapViewLayout.
  private void updateFragmentMeasures() {
    if (mFragment != null) {
      mFragment.onMeasure(getMeasuredWidth(), getMeasuredHeight());
    }
  }

  // Layout the fragment's view to fill this GMNMapViewLayout.
  private void updateFragmentLayout() {
    if (mFragment != null) {
      mFragment.onLayout(getWidth(), getHeight());
    }
  }

  // Applies the initial props to the map view after it is ready.
  // Note: Some props are passed to the map view via GoogleMapsOptions before it is ready,
  // but are also updated here to ensure the map view is in a consistent state.
  private void applyInitialProps() {
    if (mInitialViewProps == null) return;

    // Apply all props after map is ready
    if (mInitialViewProps.navigationUIEnabled != null) {
      setNavigationUIEnabled(mInitialViewProps.navigationUIEnabled);
    }

    if (mInitialViewProps.mapType != null) {
      setMapType(mInitialViewProps.mapType);
    }

    setMapPadding(mInitialViewProps.mapPadding);

    if (mInitialViewProps.tripProgressBarEnabled != null) {
      setTripProgressBarEnabled(mInitialViewProps.tripProgressBarEnabled);
    }
    if (mInitialViewProps.trafficIncidentsCardEnabled != null) {
      setTrafficIncidentsCardEnabled(mInitialViewProps.trafficIncidentsCardEnabled);
    }
    if (mInitialViewProps.headerEnabled != null) {
      setHeaderEnabled(mInitialViewProps.headerEnabled);
    }
    if (mInitialViewProps.footerEnabled != null) {
      setFooterEnabled(mInitialViewProps.footerEnabled);
    }
    if (mInitialViewProps.speedometerEnabled != null) {
      setSpeedometerEnabled(mInitialViewProps.speedometerEnabled);
    }
    if (mInitialViewProps.speedLimitIconEnabled != null) {
      setSpeedLimitIconEnabled(mInitialViewProps.speedLimitIconEnabled);
    }
    if (mInitialViewProps.recenterButtonEnabled != null) {
      setRecenterButtonEnabled(mInitialViewProps.recenterButtonEnabled);
    }
    if (mInitialViewProps.navigationViewStylingOptions != null) {
      setNavigationViewStylingOptions(mInitialViewProps.navigationViewStylingOptions);
    }
    if (mInitialViewProps.nightMode != null) {
      setNightMode(mInitialViewProps.nightMode);
    }
    if (mInitialViewProps.followingPerspective != null) {
      setFollowingPerspective(mInitialViewProps.followingPerspective);
    }
    if (mInitialViewProps.mapStyle != null) {
      setMapStyle(mInitialViewProps.mapStyle);
    }
    if (mInitialViewProps.mapToolbarEnabled != null) {
      setMapToolbarEnabled(mInitialViewProps.mapToolbarEnabled);
    }
    if (mInitialViewProps.indoorEnabled != null) {
      setIndoorEnabled(mInitialViewProps.indoorEnabled);
    }
    if (mInitialViewProps.trafficEnabled != null) {
      setTrafficEnabled(mInitialViewProps.trafficEnabled);
    }
    if (mInitialViewProps.compassEnabled != null) {
      setCompassEnabled(mInitialViewProps.compassEnabled);
    }
    if (mInitialViewProps.myLocationButtonEnabled != null) {
      setMyLocationButtonEnabled(mInitialViewProps.myLocationButtonEnabled);
    }
    if (mInitialViewProps.myLocationEnabled != null) {
      setMyLocationEnabled(mInitialViewProps.myLocationEnabled);
    }
    if (mInitialViewProps.rotateGesturesEnabled != null) {
      setRotateGesturesEnabled(mInitialViewProps.rotateGesturesEnabled);
    }
    if (mInitialViewProps.scrollGesturesEnabled != null) {
      setScrollGesturesEnabled(mInitialViewProps.scrollGesturesEnabled);
    }
    if (mInitialViewProps.scrollGesturesEnabledDuringRotateOrZoom != null) {
      setScrollGesturesEnabledDuringRotateOrZoom(
          mInitialViewProps.scrollGesturesEnabledDuringRotateOrZoom);
    }
    if (mInitialViewProps.tiltGesturesEnabled != null) {
      setTiltGesturesEnabled(mInitialViewProps.tiltGesturesEnabled);
    }
    if (mInitialViewProps.zoomControlsEnabled != null) {
      setZoomControlsEnabled(mInitialViewProps.zoomControlsEnabled);
    }
    if (mInitialViewProps.zoomGesturesEnabled != null) {
      setZoomGesturesEnabled(mInitialViewProps.zoomGesturesEnabled);
    }
    if (mInitialViewProps.buildingsEnabled != null) {
      setBuildingsEnabled(mInitialViewProps.buildingsEnabled);
    }
    if (mInitialViewProps.maxZoomPreference != null) {
      setMinZoomLevel(mInitialViewProps.maxZoomPreference);
    }
    if (mInitialViewProps.minZoomPreference != null) {
      setMaxZoomLevel(mInitialViewProps.minZoomPreference);
    }
    if (mInitialViewProps.initialCameraPosition != null) {
      setInitialCameraPosition(mInitialViewProps.initialCameraPosition);
    }

    // Clear props after applying
    mInitialViewProps = null;
  }

  // --- Prop Setters ---
  public void setMapViewType(GMNCustomTypes.MapViewType mapViewType) {
    mMapViewType = mapViewType;
    maybeInitFragment();
  }

  public void setNavigationUIEnabled(@Nullable Boolean value) {
    if (isReady() && value != null) {
      IGMNNavViewFragment navFragment = getNavFragment();
      if (navFragment != null) {
        navFragment.setNavigationUiEnabled(value);
      }
    } else if (mInitialViewProps != null) mInitialViewProps.navigationUIEnabled = value;
  }

  public void setMapType(int value) {
    if (isReady()) {
      getMapController().setMapType(value);
    } else if (mInitialViewProps != null) {
      mInitialViewProps.initialMapTypeSet = true;
      mInitialViewProps.mapType = value;
      maybeInitFragment();
    }
  }

  public void setMapPadding(@Nullable ReadableMap value) {
    if (isReady()) {
      if (value != null) {
        getMapController()
            .setPadding(
                (int) value.getDouble("left"),
                (int) value.getDouble("top"),
                (int) value.getDouble("right"),
                (int) value.getDouble("bottom"));
      } else {
        getMapController().setPadding(0, 0, 0, 0);
      }
    } else if (mInitialViewProps != null) mInitialViewProps.mapPadding = value;
  }

  public void setTripProgressBarEnabled(boolean value) {
    if (isReady()) {
      IGMNNavViewFragment navFragment = getNavFragment();
      if (navFragment != null) {
        navFragment.setTripProgressBarEnabled(value);
      }
    } else if (mInitialViewProps != null) mInitialViewProps.tripProgressBarEnabled = value;
  }

  public void setTrafficIncidentsCardEnabled(boolean value) {
    if (isReady()) {
      IGMNNavViewFragment navFragment = getNavFragment();
      if (navFragment != null) {
        navFragment.setTrafficIncidentCardsEnabled(value);
      }
    } else if (mInitialViewProps != null) mInitialViewProps.trafficIncidentsCardEnabled = value;
  }

  public void setHeaderEnabled(boolean value) {
    if (isReady()) {
      IGMNNavViewFragment navFragment = getNavFragment();
      if (navFragment != null) {
        navFragment.setHeaderEnabled(value);
      }
    } else if (mInitialViewProps != null) mInitialViewProps.headerEnabled = value;
  }

  public void setFooterEnabled(boolean value) {

    if (isReady()) {
      IGMNNavViewFragment navFragment = getNavFragment();
      if (navFragment != null) {
        navFragment.setEtaCardEnabled(value);
      }
    } else if (mInitialViewProps != null) mInitialViewProps.footerEnabled = value;
  }

  public void setSpeedometerEnabled(boolean value) {

    if (isReady()) {
      IGMNNavViewFragment navFragment = getNavFragment();
      if (navFragment != null) {
        navFragment.setSpeedometerEnabled(value);
      }
    } else if (mInitialViewProps != null) mInitialViewProps.speedometerEnabled = value;
  }

  public void setSpeedLimitIconEnabled(boolean value) {
    if (isReady()) {
      IGMNNavViewFragment navFragment = getNavFragment();
      if (navFragment != null) {
        navFragment.setSpeedLimitIconEnabled(value);
      }
    } else if (mInitialViewProps != null) mInitialViewProps.speedLimitIconEnabled = value;
  }

  public void setRecenterButtonEnabled(boolean value) {
    if (isReady()) {
      IGMNNavViewFragment navFragment = getNavFragment();
      if (navFragment != null) {
        navFragment.setRecenterButtonEnabled(value);
      }
    } else if (mInitialViewProps != null) mInitialViewProps.recenterButtonEnabled = value;
  }

  public void setNavigationViewStylingOptions(@Nullable ReadableMap value) {
    if (isReady() && value != null) {
      IGMNNavViewFragment navFragment = getNavFragment();
      if (navFragment != null) {
        navFragment.setStylingOptions(
            new GMNStylingOptionsBuilder.Builder(value.toHashMap()).build());
      }
    } else if (mInitialViewProps != null) mInitialViewProps.navigationViewStylingOptions = value;
  }

  public void setNightMode(int value) {
    if (isReady()) {
      IGMNNavViewFragment navFragment = getNavFragment();
      if (navFragment != null) {
        navFragment.setNightModeOption(value);
      }
    } else if (mInitialViewProps != null) mInitialViewProps.nightMode = value;
  }

  public void setFollowingPerspective(int value) {
    if (isReady()) {
      getMapController().setFollowingPerspective(value);
    } else if (mInitialViewProps != null) mInitialViewProps.followingPerspective = value;
  }

  public void setMapStyle(@Nullable String value) {
    if (isReady()) {
      getMapController().setMapStyle(value);
    } else if (mInitialViewProps != null) mInitialViewProps.mapStyle = value;
  }

  public void setMapToolbarEnabled(boolean value) {
    if (isReady()) {
      getMapController().setMapToolbarEnabled(value);
    } else if (mInitialViewProps != null) mInitialViewProps.mapToolbarEnabled = value;
  }

  public void setIndoorEnabled(boolean value) {
    if (isReady()) {
      getMapController().setIndoorEnabled(value);
    } else if (mInitialViewProps != null) mInitialViewProps.indoorEnabled = value;
  }

  public void setTrafficEnabled(boolean value) {
    if (isReady()) {
      getMapController().setTrafficEnabled(value);
    } else if (mInitialViewProps != null) mInitialViewProps.trafficEnabled = value;
  }

  public void setCompassEnabled(boolean value) {
    if (isReady()) {
      getMapController().setCompassEnabled(value);
    } else if (mInitialViewProps != null) {
      mInitialViewProps.initialCompassEnabledSet = true;
      mInitialViewProps.compassEnabled = value;
      maybeInitFragment();
    }
  }

  public void setMyLocationButtonEnabled(boolean value) {
    if (isReady()) {
      getMapController().setMyLocationButtonEnabled(value);
    } else if (mInitialViewProps != null) mInitialViewProps.myLocationButtonEnabled = value;
  }

  public void setMyLocationEnabled(boolean value) {
    if (isReady()) {
      getMapController().setMyLocationEnabled(value);
    } else if (mInitialViewProps != null) mInitialViewProps.myLocationEnabled = value;
  }

  public void setRotateGesturesEnabled(boolean value) {
    if (isReady()) {
      getMapController().setRotateGesturesEnabled(value);
    } else if (mInitialViewProps != null) {
      mInitialViewProps.initialRotateGesturesEnabledSet = true;
      mInitialViewProps.rotateGesturesEnabled = value;
      maybeInitFragment();
    }
  }

  public void setScrollGesturesEnabled(boolean value) {
    if (isReady()) {
      getMapController().setScrollGesturesEnabled(value);
    } else if (mInitialViewProps != null) {
      mInitialViewProps.initialScrollGesturesEnabledSet = true;
      mInitialViewProps.scrollGesturesEnabled = value;
      maybeInitFragment();
    }
  }

  public void setScrollGesturesEnabledDuringRotateOrZoom(boolean value) {
    if (isReady()) {
      getMapController().setScrollGesturesEnabledDuringRotateOrZoom(value);
    } else if (mInitialViewProps != null) {
      mInitialViewProps.initialScrollGesturesEnabledDuringRotateOrZoomSet = true;
      mInitialViewProps.scrollGesturesEnabledDuringRotateOrZoom = value;
      maybeInitFragment();
    }
  }

  public void setTiltGesturesEnabled(boolean value) {
    if (isReady()) {
      getMapController().setTiltGesturesEnabled(value);
    } else if (mInitialViewProps != null) {
      mInitialViewProps.initialTiltGesturesEnabledSet = true;
      mInitialViewProps.tiltGesturesEnabled = value;
      maybeInitFragment();
    }
  }

  public void setZoomControlsEnabled(boolean value) {
    if (isReady()) {
      getMapController().setZoomControlsEnabled(value);
    } else if (mInitialViewProps != null) {
      mInitialViewProps.initialZoomControlsEnabledSet = true;
      mInitialViewProps.zoomControlsEnabled = value;
      maybeInitFragment();
    }
  }

  public void setZoomGesturesEnabled(boolean value) {
    if (isReady()) {
      getMapController().setZoomGesturesEnabled(value);
    } else if (mInitialViewProps != null) {
      mInitialViewProps.initialZoomGesturesEnabledSet = true;
      mInitialViewProps.zoomGesturesEnabled = value;
      maybeInitFragment();
    }
  }

  public void setBuildingsEnabled(boolean value) {
    if (isReady()) {
      getMapController().setBuildingsEnabled(value);
    } else if (mInitialViewProps != null) mInitialViewProps.buildingsEnabled = value;
  }

  public void setReportIncidentButtonEnabled(boolean value) {
    if (isReady()) {
      IGMNNavViewFragment navFragment = getNavFragment();
      if (navFragment != null) {
        navFragment.setReportIncidentButtonEnabled(value);
      }
    } else if (mInitialViewProps != null) mInitialViewProps.reportIncidentButtonEnabled = value;
  }

  public void setMinZoomLevel(@Nullable Float value) {
    if (isReady() && value != null) {
      getMapController().setMinZoomPreference(value);
    } else if (mInitialViewProps != null) {
      mInitialViewProps.initialMinZoomPreferenceSet = true;
      mInitialViewProps.minZoomPreference = value;
      maybeInitFragment();
    }
  }

  public void setMaxZoomLevel(@Nullable Float value) {
    if (isReady() && value != null) {
      getMapController().setMaxZoomPreference(value);
    } else if (mInitialViewProps != null) {
      mInitialViewProps.initialMaxZoomPreferenceSet = true;
      mInitialViewProps.maxZoomPreference = value;
      maybeInitFragment();
    }
  }

  public void setInitialCameraPosition(@Nullable CameraPosition value) {
    if (mInitialViewProps != null) {
      mInitialViewProps.initialCameraPositionSet = true;
      mInitialViewProps.initialCameraPosition = value;
      maybeInitFragment();
    }
  }

  public void setMapId(@Nullable String value) {
    if (mInitialViewProps != null) {
      mInitialViewProps.initialMapIdSet = true;
      mInitialViewProps.mapId = value;
      maybeInitFragment();
    }
  }

  private void startLayoutLoop() {
    assert !mLayoutLoopRunning;
    assert mFragment != null;

    if (mFrameCallback == null) {
      mFrameCallback =
          new Choreographer.FrameCallback() {
            @Override
            public void doFrame(long frameTimeNanos) {
              if (!isReady() || mFragment.getView() == null || !mFragment.isAdded()) {
                mLayoutLoopRunning = false;
                return;
              }

              // Update fragments measures and layout.
              updateFragmentMeasures();
              updateFragmentLayout();

              // Dispatch global layout event for this GMNMapViewLayout.
              // This signals that this view's layout (including its children) is complete for this
              // frame.
              if (getViewTreeObserver().isAlive()) {
                getViewTreeObserver().dispatchOnGlobalLayout();
              }

              if (isReady()) {
                // Continue the loop for the next frame.
                Choreographer.getInstance().postFrameCallback(this);
              } else {
                mLayoutLoopRunning = false;
              }
            }
          };
    }

    // Start the loop.
    Choreographer.getInstance().removeFrameCallback(mFrameCallback);
    Choreographer.getInstance().postFrameCallback(mFrameCallback);
    mLayoutLoopRunning = true;
  }

  private void stopLayoutLoop() {
    mIsMapReady = false;
    if (mFrameCallback != null && mLayoutLoopRunning) {
      Choreographer.getInstance().removeFrameCallback(mFrameCallback);
    }
    mLayoutLoopRunning = false;
  }
}
