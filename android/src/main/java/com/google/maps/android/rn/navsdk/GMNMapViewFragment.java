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
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.libraries.navigation.StylingOptions;

/**
 * A fragment that displays a view with a Google Map using MapFragment. This fragment's lifecycle is
 * managed by NavViewManager.
 */
@SuppressLint("ValidFragment")
public class GMNMapViewFragment extends SupportMapFragment
    implements IGMNMapViewFragment, IGMNMapViewCallback {
  private static final String TAG = "MapViewFragment";
  private GoogleMap mGoogleMap;
  private GMNMapViewController mMapViewController;

  private final int viewId; // React native view tag.
  private final ReactContext reactContext;

  public GMNMapViewFragment(ReactContext reactContext, int viewId) {
    this.reactContext = reactContext;
    this.viewId = viewId;
  }

  private @Nullable Runnable mMapReadyListener;

  @SuppressLint("MissingPermission")
  @Override
  public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
    super.onViewCreated(view, savedInstanceState);

    getMapAsync(
        new OnMapReadyCallback() {
          public void onMapReady(GoogleMap googleMap) {
            mGoogleMap = googleMap;

            mMapViewController = new GMNMapViewController();
            mMapViewController.initialize(googleMap, () -> requireActivity());

            // Setup map listeners with the provided callback
            mMapViewController.setupMapListeners(GMNMapViewFragment.this);

            GMNMapViewFragment.this.onMapReady();
          }
        });
  }

  @Override
  public void setMapReadyListener(Runnable listener) {
    this.mMapReadyListener = listener;
    if (mGoogleMap != null) {
      listener.run();
    }
  }

  @Override
  public void onMapReady() {
    if (mMapReadyListener != null) {
      mMapReadyListener.run();
    }
    emitEvent("onMapReady", null);
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

  public GMNMapViewController getMapController() {
    return mMapViewController;
  }

  public void applyStylingOptions() {}

  public void setStylingOptions(StylingOptions stylingOptions) {}

  public void setMapStyle(String url) {
    mMapViewController.setMapStyle(url);
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
      view.requestLayout();
    }
  }

  @Override
  public void onLayout(int width, int height) {
    View view = getView();
    if (view != null) {
      view.layout(0, 0, width, height);
    }
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

    @NonNull
    @Override
    public WritableMap getEventData() {
      if (eventData == null) {
        return Arguments.createMap();
      }
      return eventData;
    }
  }
}
