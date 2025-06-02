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
import android.view.View;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.UIManagerHelper;
import com.facebook.react.uimanager.events.Event;
import com.facebook.react.uimanager.events.EventDispatcher;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.libraries.navigation.NavigationView;
import com.google.android.libraries.navigation.PromptVisibilityChangedListener;
import com.google.android.libraries.navigation.StylingOptions;
import com.google.android.libraries.navigation.SupportNavigationFragment;

/**
 * A fragment that displays a navigation view with a Google Map using SupportNavigationFragment.
 * This fragment's lifecycle is managed by NavViewManager.
 */
public class GMNNavViewFragment extends SupportNavigationFragment
    implements IGMNNavViewFragment, IGMNNavigationViewCallback {
  private static final String TAG = "NavViewFragment";
  private GMNMapViewController mMapViewController;
  private GoogleMap mGoogleMap;
  private StylingOptions mStylingOptions;

  private final int viewId; // React native view tag.
  private final ReactContext reactContext;

  public GMNNavViewFragment(ReactContext reactContext, int viewId) {
    this.reactContext = reactContext;
    this.viewId = viewId;
  }

  private final NavigationView.OnRecenterButtonClickedListener onRecenterButtonClickedListener =
      new NavigationView.OnRecenterButtonClickedListener() {
        @Override
        public void onRecenterButtonClick() {
          GMNNavViewFragment.this.onRecenterButtonClick();
        }
      };

  private final PromptVisibilityChangedListener onPromptVisibilityChangedListener =
      new PromptVisibilityChangedListener() {
        @Override
        public void onVisibilityChanged(boolean isVisible) {
          GMNNavViewFragment.this.onPromptVisibilityChanged(isVisible);
        }
      };

  private @Nullable Runnable mMapReadyListener;

  @SuppressLint("MissingPermission")
  @Override
  public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
    super.onViewCreated(view, savedInstanceState);

    setNavigationUiEnabled(
        GMNNavModule.hasInstance() && GMNNavModule.getInstance().getNavigator() != null);

    getMapAsync(
        new OnMapReadyCallback() {
          public void onMapReady(GoogleMap googleMap) {
            mGoogleMap = googleMap;

            mMapViewController = new GMNMapViewController();
            mMapViewController.initialize(googleMap, () -> requireActivity());

            // Setup map listeners with the provided callback
            mMapViewController.setupMapListeners(GMNNavViewFragment.this);

            setNavigationUiEnabled(
                GMNNavModule.hasInstance() && GMNNavModule.getInstance().getNavigator() != null);
            applyStylingOptions();

            addOnRecenterButtonClickedListener(onRecenterButtonClickedListener);
            addPromptVisibilityChangedListener(onPromptVisibilityChangedListener);

            GMNNavViewFragment.this.onMapReady();
          }
        });
  }

  @Override
  public void setMapReadyListener(Runnable listener) {
    if (mGoogleMap != null) {
      listener.run();
    } else {
      this.mMapReadyListener = listener;
    }
  }

  @Override
  public void onMapReady() {
    if (mMapReadyListener != null) {
      mMapReadyListener.run();
      mMapReadyListener = null;
    }
    emitEvent("onMapReady", null);
  }

  public GMNMapViewController getMapController() {
    return mMapViewController;
  }

  public void setMapStyle(String url) {
    mMapViewController.setMapStyle(url);
  }

  public void applyStylingOptions() {
    if (mStylingOptions != null) {
      super.setStylingOptions(mStylingOptions);
    }
  }

  public void setStylingOptions(StylingOptions stylingOptions) {
    mStylingOptions = stylingOptions;
  }

  @Override
  public void setNightModeOption(int jsValue) {
    super.setForceNightMode(GMNEnumTranslationUtil.getForceNightModeFromJsValue(jsValue));
  }

  @Override
  public void setReportIncidentButtonEnabled(boolean enabled) {
    super.setReportIncidentButtonEnabled(enabled);
  }

  @Override
  public void onRecenterButtonClick() {
    emitEvent("onRecenterButtonClick", null);
  }

  @Override
  public void onPromptVisibilityChanged(boolean isVisible) {
    WritableMap map = Arguments.createMap();
    map.putBoolean("visible", isVisible);
    emitEvent("onPromptVisibilityChanged", map);
  }

  @Override
  public void onMarkerClick(GMNMarker marker) {
    emitEvent("onMarkerClick", GMNObjectTranslationUtil.getMapFromMarker(marker));
  }

  @Override
  public void onPolylineClick(GMNPolyline polyline) {
    emitEvent("onPolylineClick", GMNObjectTranslationUtil.getMapFromPolyline(polyline));
  }

  @Override
  public void onPolygonClick(GMNPolygon polygon) {
    emitEvent("onPolygonClick", GMNObjectTranslationUtil.getMapFromPolygon(polygon));
  }

  @Override
  public void onCircleClick(GMNCircle circle) {
    emitEvent("onCircleClick", GMNObjectTranslationUtil.getMapFromCircle(circle));
  }

  @Override
  public void onGroundOverlayClick(GMNGroundOverlay groundOverlay) {
    emitEvent(
        "onGroundOverlayClick", GMNObjectTranslationUtil.getMapFromGroundOverlay(groundOverlay));
  }

  @Override
  public void onMarkerInfoWindowTapped(GMNMarker marker) {
    emitEvent("onMarkerInfoWindowTapped", GMNObjectTranslationUtil.getMapFromMarker(marker));
  }

  @Override
  public void onMapClick(LatLng latLng) {
    emitEvent("onMapClick", GMNObjectTranslationUtil.getMapFromLatLng(latLng));
  }

  @Override
  public void onDestroy() {
    super.onDestroy();
    cleanup();
  }

  @Override
  public void onDestroyView() {
    super.onDestroyView();
    cleanup();
  }

  public GoogleMap getGoogleMap() {
    return mGoogleMap;
  }

  @Override
  public void onMeasure(int measuredWidth, int measuredHeight) {
    View view = getView();
    if (view != null) {
      view.measure(
          View.MeasureSpec.makeMeasureSpec(measuredWidth, View.MeasureSpec.EXACTLY),
          View.MeasureSpec.makeMeasureSpec(measuredHeight, View.MeasureSpec.EXACTLY));
    }
  }

  @Override
  public void onLayout(int width, int height) {
    View view = getView();
    if (view != null) {
      view.layout(0, 0, width, height);
    }
  }

  private void cleanup() {
    removeOnRecenterButtonClickedListener(onRecenterButtonClickedListener);
    removePromptVisibilityChangedListener(onPromptVisibilityChangedListener);
  }

  private void emitEvent(String eventName, @Nullable WritableMap data) {
    if (reactContext != null) {
      EventDispatcher dispatcher =
          UIManagerHelper.getEventDispatcherForReactTag(reactContext, viewId);

      if (dispatcher != null) {
        int surfaceId = UIManagerHelper.getSurfaceId(reactContext);
        dispatcher.dispatchEvent(new NavViewEvent(surfaceId, viewId, eventName, data));
      }
    }
  }

  public static class NavViewEvent extends Event<NavViewEvent> {
    private final String eventName;
    private final @Nullable WritableMap eventData;

    public NavViewEvent(
        int surfaceId, int viewId, String eventName, @Nullable WritableMap eventData) {
      super(surfaceId, viewId);
      this.eventName = eventName;
      this.eventData = eventData;
    }

    @NonNull
    @Override
    public String getEventName() {
      return eventName;
    }

    @Override
    public WritableMap getEventData() {
      if (eventData == null) {
        return Arguments.createMap();
      }
      return eventData;
    }
  }
}
