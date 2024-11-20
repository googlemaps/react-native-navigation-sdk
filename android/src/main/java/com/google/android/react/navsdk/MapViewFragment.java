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
package com.google.android.react.navsdk;

import android.annotation.SuppressLint;
import android.os.Bundle;
import android.view.View;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.UIManagerHelper;
import com.facebook.react.uimanager.events.Event;
import com.facebook.react.uimanager.events.EventDispatcher;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.Circle;
import com.google.android.gms.maps.model.GroundOverlay;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.Polygon;
import com.google.android.gms.maps.model.Polyline;
import com.google.android.libraries.navigation.StylingOptions;
import java.util.ArrayList;
import java.util.List;

/**
 * A fragment that displays a view with a Google Map using MapFragment. This fragment's lifecycle is
 * managed by NavViewManager.
 */
@SuppressLint("ValidFragment")
public class MapViewFragment extends SupportMapFragment
    implements IMapViewFragment, INavigationViewCallback {
  private static final String TAG = "MapViewFragment";
  private GoogleMap mGoogleMap;
  private MapViewController mMapViewController;
  private StylingOptions mStylingOptions;

  private List<Marker> markerList = new ArrayList<>();
  private List<Polyline> polylineList = new ArrayList<>();
  private List<Polygon> polygonList = new ArrayList<>();
  private List<GroundOverlay> groundOverlayList = new ArrayList<>();
  private List<Circle> circleList = new ArrayList<>();
  private int viewTag; // React native view tag.
  private ReactApplicationContext reactContext;

  public MapViewFragment(ReactApplicationContext reactContext, int viewTag) {
    this.reactContext = reactContext;
    this.viewTag = viewTag;
  }
  ;

  private String style = "";

  @SuppressLint("MissingPermission")
  @Override
  public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
    super.onViewCreated(view, savedInstanceState);

    getMapAsync(
        new OnMapReadyCallback() {
          public void onMapReady(GoogleMap googleMap) {
            mGoogleMap = googleMap;

            mMapViewController = new MapViewController();
            mMapViewController.initialize(googleMap, () -> requireActivity());

            // Setup map listeners with the provided callback
            mMapViewController.setupMapListeners(MapViewFragment.this);

            emitEvent("onMapReady", null);
          }
        });
  }

  @Override
  public void onMapReady() {
    emitEvent("onMapReady", null);
  }

  @Override
  public void onRecenterButtonClick() {
    emitEvent("onRecenterButtonClick", null);
  }

  @Override
  public void onMarkerClick(Marker marker) {
    emitEvent("onMarkerClick", ObjectTranslationUtil.getMapFromMarker(marker));
  }

  @Override
  public void onPolylineClick(Polyline polyline) {
    emitEvent("onPolylineClick", ObjectTranslationUtil.getMapFromPolyline(polyline));
  }

  @Override
  public void onPolygonClick(Polygon polygon) {
    emitEvent("onPolygonClick", ObjectTranslationUtil.getMapFromPolygon(polygon));
  }

  @Override
  public void onCircleClick(Circle circle) {
    emitEvent("onCircleClick", ObjectTranslationUtil.getMapFromCircle(circle));
  }

  @Override
  public void onGroundOverlayClick(GroundOverlay groundOverlay) {
    emitEvent("onGroundOverlayClick", ObjectTranslationUtil.getMapFromGroundOverlay(groundOverlay));
  }

  @Override
  public void onMarkerInfoWindowTapped(Marker marker) {
    emitEvent("onMarkerInfoWindowTapped", ObjectTranslationUtil.getMapFromMarker(marker));
  }

  @Override
  public void onMapClick(LatLng latLng) {
    emitEvent("onMapClick", ObjectTranslationUtil.getMapFromLatLng(latLng));
  }

  public MapViewController getMapController() {
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

  private void emitEvent(String eventName, @Nullable WritableMap data) {
    if (reactContext != null) {
      EventDispatcher dispatcher =
          UIManagerHelper.getEventDispatcherForReactTag(reactContext, viewTag);

      if (dispatcher != null) {
        int surfaceId = UIManagerHelper.getSurfaceId(reactContext);
        dispatcher.dispatchEvent(new NavViewEvent(surfaceId, viewTag, eventName, data));
      }
    }
  }

  public static class NavViewEvent extends Event<NavViewEvent> {
    private final String eventName;
    private final @Nullable WritableMap eventData;

    public NavViewEvent(
        int surfaceId, int viewTag, String eventName, @Nullable WritableMap eventData) {
      super(surfaceId, viewTag);
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
