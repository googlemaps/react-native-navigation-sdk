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

import com.facebook.react.bridge.UiThreadUtil;
import android.Manifest.permission;
import android.annotation.SuppressLint;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.location.Location;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.Observer;

import com.facebook.react.bridge.ReadableArray;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.UiSettings;
import com.google.android.gms.maps.model.BitmapDescriptor;
import com.google.android.gms.maps.model.BitmapDescriptorFactory;
import com.google.android.gms.maps.model.CameraPosition;
import com.google.android.gms.maps.model.Circle;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.Polygon;
import com.google.android.gms.maps.model.Polyline;
import com.google.android.gms.maps.model.GroundOverlay;
import com.google.android.gms.maps.model.CircleOptions;
import com.google.android.gms.maps.model.GroundOverlayOptions;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.MapStyleOptions;
import com.google.android.gms.maps.model.MarkerOptions;
import com.google.android.gms.maps.model.PolygonOptions;
import com.google.android.gms.maps.model.PolylineOptions;
import com.google.android.libraries.mapsplatform.turnbyturn.model.NavInfo;
import com.google.android.libraries.navigation.ArrivalEvent;
import com.google.android.libraries.navigation.ListenableResultFuture;
import com.google.android.libraries.navigation.NavigationApi;
import com.google.android.libraries.navigation.NavigationApi.OnTermsResponseListener;
import com.google.android.libraries.navigation.NavigationView;
import com.google.android.libraries.navigation.Navigator;
import com.google.android.libraries.navigation.RoadSnappedLocationProvider;
import com.google.android.libraries.navigation.RoadSnappedLocationProvider.LocationListener;
import com.google.android.libraries.navigation.RouteSegment;
import com.google.android.libraries.navigation.RoutingOptions;
import com.google.android.libraries.navigation.SimulationOptions;
import com.google.android.libraries.navigation.SpeedAlertOptions;
import com.google.android.libraries.navigation.SpeedAlertSeverity;
import com.google.android.libraries.navigation.StylingOptions;
import com.google.android.libraries.navigation.SupportNavigationFragment;
import com.google.android.libraries.navigation.TermsAndConditionsCheckOption;
import com.google.android.libraries.navigation.TimeAndDistance;
import com.google.android.libraries.navigation.Waypoint;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Executors;

/**
 * A simple {@link Fragment} subclass. Use the {@link NavViewFragment#newInstance} factory method to
 * create an instance of this fragment.
 */
public class NavViewFragment extends Fragment {
  private static final String TAG = "NavViewFragment";
  private GoogleMap mGoogleMap;
  private Navigator mNavigator;
  private SupportNavigationFragment mNavFragment;
  private INavigationCallback navigationCallback;
  private StylingOptions mStylingOptions;
  private String mCompanyName;
  private String mTitle;
  private String mCheckOption;
  private ArrayList<Waypoint> mWaypoints = new ArrayList<>();
  private ListenableResultFuture<Navigator.RouteStatus> pendingRoute;

  private RoadSnappedLocationProvider mRoadSnappedLocationProvider;

  private Map tocParamsMap;

  private List<Marker> markerList = new ArrayList<>();
  private List<Polyline> polylineList = new ArrayList<>();
  private List<Polygon> polygonList = new ArrayList<>();
  private List<GroundOverlay> groundOverlayList = new ArrayList<>();
  private List<Circle> circleList = new ArrayList<>();

  private Navigator.ArrivalListener mArrivalListener =
      new Navigator.ArrivalListener() {
        @Override
        public void onArrival(ArrivalEvent arrivalEvent) {
          navigationCallback.onArrival(arrivalEvent);
        }
      };

  private NavigationView.OnRecenterButtonClickedListener onRecenterButtonClickedListener =
      new NavigationView.OnRecenterButtonClickedListener() {
        @Override
        public void onRecenterButtonClick() {
          if (navigationCallback != null) navigationCallback.onRecenterButtonClick();
        }
      };

  private LocationListener mLocationListener =
      new LocationListener() {
        @Override
        public void onLocationChanged(final Location location) {
          navigationCallback.onLocationChanged(location);
        }

        @Override
        public void onRawLocationUpdate(final Location location) {
          navigationCallback.onRawLocationUpdate(location);
        }
      };

  private Navigator.RouteChangedListener mRouteChangedListener =
      new Navigator.RouteChangedListener() {
        @Override
        public void onRouteChanged() {
          navigationCallback.onRouteChanged();
        }
      };

  private Navigator.TrafficUpdatedListener mTrafficUpdatedListener =
      new Navigator.TrafficUpdatedListener() {
        @Override
        public void onTrafficUpdated() {
          navigationCallback.onTrafficUpdated();
        }
      };

  private Navigator.ReroutingListener mReroutingListener =
      new Navigator.ReroutingListener() {
        @Override
        public void onReroutingRequestedByOffRoute() {
          navigationCallback.onReroutingRequestedByOffRoute();
        }
      };

  private Navigator.RemainingTimeOrDistanceChangedListener mRemainingTimeOrDistanceChangedListener =
      new Navigator.RemainingTimeOrDistanceChangedListener() {
        @Override
        public void onRemainingTimeOrDistanceChanged() {
          navigationCallback.onRemainingTimeOrDistanceChanged();
        }
      };

  private String style = "";

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
  }

  @Override
  @SuppressLint("MissingPermission")
  public View onCreateView(
      LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
    return inflater.inflate(R.layout.fragment_nav_view, container, false);
  }

  @SuppressLint("MissingPermission")
  @Override
  public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
    super.onViewCreated(view, savedInstanceState);

    mNavFragment =
        (SupportNavigationFragment)
            getChildFragmentManager().findFragmentById(R.id.navigation_fragment2);

    if (areTermsAccepted()) {
      initializeNavigationApi();
    } else {
      this.showTermsAndConditionsDialog();
    }

    // Observe live data for nav info updates.
    Observer<NavInfo> navInfoObserver = this::showNavInfo;
    NavInfoReceivingService.getNavInfoLiveData()
        .observe(this.getViewLifecycleOwner(), navInfoObserver);
  }

  public void applyStylingOptions() {
    if (mStylingOptions != null) {
      mNavFragment.setStylingOptions(mStylingOptions);
    }
  }

  public void setStylingOptions(Map stylingOptions) {
    mStylingOptions = new StylingOptionsBuilder.Builder(stylingOptions).build();
  }

  public void setSpeedAlertOptions(@Nullable Map options) {
    if (options == null) {
      mNavigator.setSpeedAlertOptions(null);
      return;
    }

    float minorThresholdPercentage =
        (float) CollectionUtil.getDouble("minorSpeedAlertPercentThreshold", options, -1);
    float majorThresholdPercentage =
        (float) CollectionUtil.getDouble("majorSpeedAlertPercentThreshold", options, -1);
    float severityUpgradeDurationSeconds =
        (float) CollectionUtil.getDouble("severityUpgradeDurationSeconds", options, -1);

    // The JS layer will validate the values before calling.
    SpeedAlertOptions alertOptions =
        new SpeedAlertOptions.Builder()
            .setSpeedAlertThresholdPercentage(SpeedAlertSeverity.MINOR, minorThresholdPercentage)
            .setSpeedAlertThresholdPercentage(SpeedAlertSeverity.MAJOR, majorThresholdPercentage)
            .setSeverityUpgradeDurationSeconds(severityUpgradeDurationSeconds)
            .build();

    mNavigator.setSpeedAlertOptions(alertOptions);
  }

  private void showNavInfo(NavInfo navInfo) {
    if (navInfo == null) {
      return;
    }
    navigationCallback.onTurnByTurn(navInfo);
  }

  @SuppressLint("MissingPermission")
  public void setFollowingPerspective(int jsValue) {
    if (mGoogleMap == null) {
      return;
    }

    mGoogleMap.followMyLocation(EnumTranslationUtil.getCameraPerspectiveFromJsValue(jsValue));
  }

  public void setNightModeOption(int jsValue) {
    if (mNavFragment == null) {
      return;
    }

    mNavFragment.setForceNightMode(EnumTranslationUtil.getForceNightModeFromJsValue(jsValue));
  }

  public void setAudioGuidanceType(int jsValue) {
    if (mNavigator == null) {
      return;
    }

    mNavigator.setAudioGuidance(EnumTranslationUtil.getAudioGuidanceFromJsValue(jsValue));
  }

  public void setRecenterButtonEnabled(boolean isEnabled) {
    if (mNavFragment == null) {
      return;
    }

    mNavFragment.setRecenterButtonEnabled(isEnabled);
  }

  public void setMapType(int jsValue) {
    if (mGoogleMap == null) {
      return;
    }

    mGoogleMap.setMapType(EnumTranslationUtil.getMapTypeFromJsValue(jsValue));
  }

  public void clearMapView() {
    if (mGoogleMap == null) {
      return;
    }

    mGoogleMap.clear();
  }

  public void resetMinMaxZoomLevel() {
    if (mGoogleMap == null) {
      return;
    }

    mGoogleMap.resetMinMaxZoomPreference();
  }

  public void animateCamera(Map map) {
    if (mGoogleMap != null) {
      int zoom = CollectionUtil.getInt("zoom", map, 0);
      int tilt = CollectionUtil.getInt("tilt", map, 0);
      int bearing = CollectionUtil.getInt("bearing", map, 0);
      int animationDuration = CollectionUtil.getInt("duration", map, 0);

      CameraPosition cameraPosition =
          new CameraPosition.Builder()
              .target(
                  ObjectTranslationUtil.getLatLngFromMap(
                      (Map) map.get("target"))) // Set the target location
              .zoom(zoom) // Set the desired zoom level
              .tilt(tilt) // Set the desired tilt angle (0 for straight down, 90 for straight up)
              .bearing(bearing) // Set the desired bearing (rotation angle in degrees)
              .build();

      mGoogleMap.animateCamera(
          CameraUpdateFactory.newCameraPosition(cameraPosition), animationDuration, null);
    }
  }

  public Circle addCircle(Map optionsMap) {
    if (mGoogleMap == null) {
      return null;
    }

    CircleOptions options = new CircleOptions();

    float strokeWidth =
        Double.valueOf(CollectionUtil.getDouble("strokeWidth", optionsMap, 0)).floatValue();
    options.strokeWidth(strokeWidth);

    double radius = CollectionUtil.getDouble("radius", optionsMap, 0.0);
    options.radius(radius);

    boolean visible = CollectionUtil.getBool("visible", optionsMap, true);
    options.visible(visible);

    options.center(ObjectTranslationUtil.getLatLngFromMap((Map) optionsMap.get("center")));

    boolean clickable = CollectionUtil.getBool("clickable", optionsMap, false);
    options.clickable(clickable);

    String strokeColor = CollectionUtil.getString("strokeColor", optionsMap);
    if (strokeColor != null) {
      options.strokeColor(Color.parseColor(strokeColor));
    }

    String fillColor = CollectionUtil.getString("fillColor", optionsMap);
    if (fillColor != null) {
      options.fillColor(Color.parseColor(fillColor));
    }

    Circle circle = mGoogleMap.addCircle(options);
    circleList.add(circle);

    return circle;
  }

  public Marker addMarker(Map optionsMap) {
    if (mGoogleMap == null) {
      return null;
    }

    String imagePath = CollectionUtil.getString("imgPath", optionsMap);
    String title = CollectionUtil.getString("title", optionsMap);
    String snippet = CollectionUtil.getString("snippet", optionsMap);
    float alpha = Double.valueOf(CollectionUtil.getDouble("alpha", optionsMap, 1)).floatValue();
    float rotation =
        Double.valueOf(CollectionUtil.getDouble("rotation", optionsMap, 0)).floatValue();
    boolean draggable = CollectionUtil.getBool("draggable", optionsMap, false);
    boolean flat = CollectionUtil.getBool("flat", optionsMap, false);
    boolean visible = CollectionUtil.getBool("visible", optionsMap, true);

    MarkerOptions options = new MarkerOptions();
    if (imagePath != null && !imagePath.isEmpty()) {
      BitmapDescriptor icon = BitmapDescriptorFactory.fromPath(imagePath);
      options.icon(icon);
    }

    options.position(ObjectTranslationUtil.getLatLngFromMap((Map) optionsMap.get("position")));

    if (title != null) {
      options.title(title);
    }

    if (snippet != null) {
      options.snippet(snippet);
    }

    options.flat(flat);
    options.alpha(alpha);
    options.rotation(rotation);
    options.draggable(draggable);
    options.visible(visible);

    Marker marker = mGoogleMap.addMarker(options);

    markerList.add(marker);

    return marker;
  }

  public Polyline addPolyline(Map optionsMap) {
    if (mGoogleMap == null) {
      return null;
    }

    float width = Double.valueOf(CollectionUtil.getDouble("width", optionsMap, 0)).floatValue();
    boolean clickable = CollectionUtil.getBool("clickable", optionsMap, false);
    boolean visible = CollectionUtil.getBool("visible", optionsMap, true);

    ArrayList latLngArr = (ArrayList) optionsMap.get("points");

    PolylineOptions options = new PolylineOptions();
    for (int i = 0; i < latLngArr.size(); i++) {
      Map latLngMap = (Map) latLngArr.get(i);
      LatLng latLng = createLatLng(latLngMap);
      options.add(latLng);
    }

    String color = CollectionUtil.getString("color", optionsMap);
    if (color != null) {
      options.color(Color.parseColor(color));
    }

    options.width(width);
    options.clickable(clickable);
    options.visible(visible);

    Polyline polyline = mGoogleMap.addPolyline(options);
    polylineList.add(polyline);

    return polyline;
  }

  public Polygon addPolygon(Map optionsMap) {
    if (mGoogleMap == null) {
      return null;
    }

    String strokeColor = CollectionUtil.getString("strokeColor", optionsMap);
    String fillColor = CollectionUtil.getString("fillColor", optionsMap);
    float strokeWidth =
        Double.valueOf(CollectionUtil.getDouble("strokeWidth", optionsMap, 0)).floatValue();
    boolean clickable = CollectionUtil.getBool("clickable", optionsMap, false);
    boolean geodesic = CollectionUtil.getBool("geodesic", optionsMap, false);
    boolean visible = CollectionUtil.getBool("visible", optionsMap, true);

    ArrayList latLngArr = (ArrayList) optionsMap.get("points");

    PolygonOptions options = new PolygonOptions();
    for (int i = 0; i < latLngArr.size(); i++) {
      Map latLngMap = (Map) latLngArr.get(i);
      LatLng latLng = createLatLng(latLngMap);
      options.add(latLng);
    }

    ArrayList holesArr = (ArrayList) optionsMap.get("holes");

    for (int i = 0; i < holesArr.size(); i++) {
      ArrayList arr = (ArrayList) holesArr.get(i);

      List<LatLng> listHoles = new ArrayList<>();

      for (int j = 0; j < arr.size(); j++) {
        Map latLngMap = (Map) arr.get(j);
        LatLng latLng = createLatLng(latLngMap);

        listHoles.add(latLng);
      }

      options.addHole(listHoles);
    }

    if (fillColor != null) {
      options.fillColor(Color.parseColor(fillColor));
    }

    if (strokeColor != null) {
      options.strokeColor(Color.parseColor(strokeColor));
    }

    options.strokeWidth(strokeWidth);
    options.visible(visible);
    options.geodesic(geodesic);
    options.clickable(clickable);

    Polygon polygon = mGoogleMap.addPolygon(options);
    polygonList.add(polygon);

    return polygon;
  }

  public void removeMarker(String id) {
    UiThreadUtil.runOnUiThread(
        () -> {
          for (Marker m : markerList) {
            if (m.getId().equals(id)) {
              m.remove();
              markerList.remove(m);
              return;
            }
          }
        });
  }

  public void removePolyline(String id) {
    for (Polyline p : polylineList) {
      if (p.getId().equals(id)) {
        p.remove();
        polylineList.remove(p);
        return;
      }
    }
  }

  public void removePolygon(String id) {
    for (Polygon p : polygonList) {
      if (p.getId().equals(id)) {
        p.remove();
        polygonList.remove(p);
        return;
      }
    }
  }

  public void removeCircle(String id) {
    for (Circle c : circleList) {
      if (c.getId().equals(id)) {
        c.remove();
        circleList.remove(c);
        return;
      }
    }
  }

  public void removeGroundOverlay(String id) {
    for (GroundOverlay g : groundOverlayList) {
      if (g.getId().equals(id)) {
        g.remove();
        groundOverlayList.remove(g);
        return;
      }
    }
  }

  private LatLng createLatLng(Map map) {
    Double lat = null;
    Double lng = null;
    if (map.containsKey("lat") && map.containsKey("lng")) {
      if (map.get("lat") != null) lat = Double.parseDouble(map.get("lat").toString());
      if (map.get("lng") != null) lng = Double.parseDouble(map.get("lng").toString());
    }

    return new LatLng(lat, lng);
  }

  public GroundOverlay addGroundOverlay(Map map) {
    if (mGoogleMap == null) {
      return null;
    }

    String imagePath = CollectionUtil.getString("imgPath", map);
    float width = Double.valueOf(CollectionUtil.getDouble("width", map, 0)).floatValue();
    float height = Double.valueOf(CollectionUtil.getDouble("height", map, 0)).floatValue();
    float transparency =
        Double.valueOf(CollectionUtil.getDouble("transparency", map, 0)).floatValue();
    boolean clickable = CollectionUtil.getBool("clickable", map, false);
    boolean visible = CollectionUtil.getBool("visible", map, true);

    Double lat = null;
    Double lng = null;
    if (map.containsKey("location")) {
      Map latlng = (Map) map.get("location");
      if (latlng.get("lat") != null) lat = Double.parseDouble(latlng.get("lat").toString());
      if (latlng.get("lng") != null) lng = Double.parseDouble(latlng.get("lng").toString());
    }

    GroundOverlayOptions options = new GroundOverlayOptions();
    if (imagePath != null && !imagePath.isEmpty()) {
      BitmapDescriptor bitmapDescriptor = BitmapDescriptorFactory.fromPath(imagePath);
      options.image(bitmapDescriptor);
    }
    options.position(new LatLng(lat, lng), width, height);
    options.transparency(transparency);
    options.clickable(clickable);
    options.visible(visible);
    GroundOverlay groundOverlay = mGoogleMap.addGroundOverlay(options);
    groundOverlayList.add(groundOverlay);
    return groundOverlay;
  }

  public void setMapStyle(String url) {
    Executors.newSingleThreadExecutor()
        .execute(
            () -> {
              try {
                style = fetchJsonFromUrl(url);
              } catch (IOException e) {
                throw new RuntimeException(e);
              }
              requireActivity()
                  .runOnUiThread(
                      (Runnable)
                          () -> {
                            MapStyleOptions options = new MapStyleOptions(style);
                            mGoogleMap.setMapStyle(options);
                          });
            });
  }

  public String fetchJsonFromUrl(String urlString) throws IOException {
    URL url = new URL(urlString);
    HttpURLConnection connection = (HttpURLConnection) url.openConnection();
    connection.setRequestMethod("GET");

    int responseCode = connection.getResponseCode();
    if (responseCode == HttpURLConnection.HTTP_OK) {
      InputStream inputStream = connection.getInputStream();
      BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
      StringBuilder stringBuilder = new StringBuilder();
      String line;
      while ((line = reader.readLine()) != null) {
        stringBuilder.append(line);
      }
      reader.close();
      inputStream.close();
      return stringBuilder.toString();
    } else {
      // Handle error response
      throw new IOException("Error response: " + responseCode);
    }
  }

  /** Starts the Navigation API, saving a reference to the ready Navigator instance. */
  private void initializeNavigationApi() {
    NavigationApi.getNavigator(
        getActivity().getApplication(),
        new NavigationApi.NavigatorListener() {
          @Override
          public void onNavigatorReady(Navigator navigator) {
            // Keep a reference to the Navigator (used to configure and start nav)
            mNavigator = navigator;
            navigationCallback.onNavigationReady();
            mRoadSnappedLocationProvider =
                NavigationApi.getRoadSnappedLocationProvider(getActivity().getApplication());
          }

          @Override
          public void onError(@NavigationApi.ErrorCode int errorCode) {
            String errMsg;
            switch (errorCode) {
              case NavigationApi.ErrorCode.NOT_AUTHORIZED:
                errMsg =
                    "Error loading Navigation API: Your API key is invalid or not authorized to use"
                        + " Navigation.";
                logDebugInfo(errMsg);
                break;
              case NavigationApi.ErrorCode.TERMS_NOT_ACCEPTED:
                errMsg =
                    "Error loading Navigation API: User did not accept the Navigation Terms of"
                        + " Use.";
                logDebugInfo(errMsg);
                break;
              case NavigationApi.ErrorCode.NETWORK_ERROR:
                errMsg = "Error loading Navigation API: Network error";
                logDebugInfo(errMsg);
                break;
              default:
                errMsg = "Error loading Navigation API: Location permission is not granted";
                logDebugInfo(errMsg);
            }

            navigationCallback.onNavigationInitError(errorCode);
          }
        });

    mNavFragment.getMapAsync(
        new OnMapReadyCallback() {
          public void onMapReady(GoogleMap googleMap) {
            mGoogleMap = googleMap;
            navigationCallback.onMapReady();

            mGoogleMap.setOnMarkerClickListener(
                new GoogleMap.OnMarkerClickListener() {
                  @Override
                  public boolean onMarkerClick(Marker marker) {
                    navigationCallback.onMarkerClick(marker);
                    return false;
                  }
                });
            mGoogleMap.setOnPolylineClickListener(
                new GoogleMap.OnPolylineClickListener() {
                  @Override
                  public void onPolylineClick(Polyline polyline) {
                    navigationCallback.onPolylineClick(polyline);
                  }
                });
            mGoogleMap.setOnPolygonClickListener(
                new GoogleMap.OnPolygonClickListener() {
                  @Override
                  public void onPolygonClick(Polygon polygon) {
                    navigationCallback.onPolygonClick(polygon);
                  }
                });
            mGoogleMap.setOnCircleClickListener(
                new GoogleMap.OnCircleClickListener() {
                  @Override
                  public void onCircleClick(Circle circle) {
                    navigationCallback.onCircleClick(circle);
                  }
                });
            mGoogleMap.setOnGroundOverlayClickListener(
                new GoogleMap.OnGroundOverlayClickListener() {
                  @Override
                  public void onGroundOverlayClick(GroundOverlay groundOverlay) {
                    navigationCallback.onGroundOverlayClick(groundOverlay);
                  }
                });

            mGoogleMap.setOnInfoWindowClickListener(
                new GoogleMap.OnInfoWindowClickListener() {
                  @Override
                  public void onInfoWindowClick(Marker marker) {
                    navigationCallback.onMarkerInfoWindowTapped(marker);
                  }
                });
          }
        });

    Executors.newSingleThreadExecutor()
        .execute(
            () -> {
              requireActivity()
                  .runOnUiThread(
                      (Runnable)
                          () -> {
                            mNavFragment.addOnRecenterButtonClickedListener(
                                onRecenterButtonClickedListener);
                          });
            });
  }

  /**
   * Registers a number of example event listeners that show an on screen message when certain
   * navigation events occur (e.g. the driver's route changes or the destination is reached).
   */
  private void registerNavigationListeners() {
    mNavigator.addArrivalListener(mArrivalListener);
    mNavigator.addRouteChangedListener(mRouteChangedListener);
    mNavigator.addTrafficUpdatedListener(mTrafficUpdatedListener);
    mNavigator.addReroutingListener(mReroutingListener);
    mNavigator.addRemainingTimeOrDistanceChangedListener(
        0, 0, mRemainingTimeOrDistanceChangedListener);
  }

  private void removeNavigationListeners() {
    mNavigator.removeArrivalListener(mArrivalListener);
    mNavigator.removeRouteChangedListener(mRouteChangedListener);
    mNavigator.removeTrafficUpdatedListener(mTrafficUpdatedListener);
    mNavigator.removeReroutingListener(mReroutingListener);
    mNavigator.removeRemainingTimeOrDistanceChangedListener(
        mRemainingTimeOrDistanceChangedListener);
  }

  /** Moves the position of the camera to hover over Melbourne. */
  public void moveCamera(Map map) {
    LatLng latLng = ObjectTranslationUtil.getLatLngFromMap((Map) map.get("target"));

    float zoom = (float) CollectionUtil.getDouble("zoom", map, 0);
    float tilt = (float) CollectionUtil.getDouble("tilt", map, 0);
    float bearing = (float) CollectionUtil.getDouble("bearing", map, 0);

    CameraPosition cameraPosition =
        CameraPosition.builder().target(latLng).zoom(zoom).tilt(tilt).bearing(bearing).build();

    mGoogleMap.moveCamera(CameraUpdateFactory.newCameraPosition(cameraPosition));
  }

  private void createWaypoint(Map map) {
    String placeId = CollectionUtil.getString("placeId", map);
    String title = CollectionUtil.getString("title", map);

    Double lat = null;
    Double lng = null;

    if (map.containsKey("position")) {
      Map latlng = (Map) map.get("position");
      if (latlng.get("lat") != null) lat = Double.parseDouble(latlng.get("lat").toString());
      if (latlng.get("lng") != null) lng = Double.parseDouble(latlng.get("lng").toString());
    }

    boolean vehicleStopover = CollectionUtil.getBool("vehicleStopover", map, false);
    boolean preferSameSideOfRoad = CollectionUtil.getBool("preferSameSideOfRoad", map, false);

    try {
      Waypoint.Builder waypointBuilder =
          Waypoint.builder()
              .setTitle(title)
              .setVehicleStopover(vehicleStopover)
              .setPreferSameSideOfRoad(preferSameSideOfRoad);

      if (map.containsKey("preferredHeading")) {
        int preferredHeading = (int) map.get("preferredHeading");
        waypointBuilder.setPreferredHeading(preferredHeading);
      }

      if (placeId == null || placeId.isEmpty() && lat != null && lng != null) {
        mWaypoints.add(waypointBuilder.setLatLng(lat, lng).build());
      } else {
        mWaypoints.add(waypointBuilder.setPlaceIdString(placeId).build());
      }
    } catch (Waypoint.UnsupportedPlaceIdException e) {
      logDebugInfo("Error starting navigation: Place ID is not supported: " + placeId);
    } catch (Waypoint.InvalidSegmentHeadingException e) {
      logDebugInfo("Error starting navigation: Preferred heading has to be between 0 and 360");
    }
  }

  public void setDestination(Map waypoint, @Nullable Map routingOptions) {
    pendingRoute = null; // reset pendingRoute.
    mWaypoints.clear(); // reset waypoints
    createWaypoint(waypoint);

    if (routingOptions != null) {
      pendingRoute =
          mNavigator.setDestination(
              mWaypoints.get(0), ObjectTranslationUtil.getRoutingOptionsFromMap(routingOptions));
    } else {
      pendingRoute = mNavigator.setDestination(mWaypoints.get(0));
    }

    setOnResultListener(
        new IRouteStatusResult() {
          @Override
          public void onResult(Navigator.RouteStatus code) {
            navigationCallback.onRouteStatusResult(code);
          }
        });
  }

  public void setDestinations(ReadableArray args, @Nullable Map routingOptions) {
    pendingRoute = null; // reset pendingRoute.
    mWaypoints.clear(); // reset waypoints

    // Set up a waypoint for each place that we want to go to.
    for (int i = 0; i < args.size(); i++) {
      Map map = args.getMap(i).toHashMap();
      createWaypoint(map);
    }

    if (routingOptions != null) {
      pendingRoute =
          mNavigator.setDestinations(
              mWaypoints, ObjectTranslationUtil.getRoutingOptionsFromMap(routingOptions));
    } else {
      pendingRoute = mNavigator.setDestinations(mWaypoints);
    }

    setOnResultListener(
        new IRouteStatusResult() {
          @Override
          public void onResult(Navigator.RouteStatus code) {
            navigationCallback.onRouteStatusResult(code);
          }
        });
  }

  private void setOnResultListener(IRouteStatusResult listener) {
    // Set an action to perform when a route is determined to the destination
    if (pendingRoute != null)
      pendingRoute.setOnResultListener(
          new ListenableResultFuture.OnResultListener<Navigator.RouteStatus>() {
            @Override
            public void onResult(Navigator.RouteStatus code) {
              listener.onResult(code);
              switch (code) {
                case OK:
                  removeNavigationListeners();
                  registerNavigationListeners();
                  break;
                default:
                  break;
              }
            }
          });
  }

  public void startGuidance() {
    if (mWaypoints.isEmpty()) {
      return;
    }

    mNavigator.startGuidance();
    navigationCallback.onStartGuidance();
  }

  public void runSimulation(float speedMultiplier) {
    if (mWaypoints.isEmpty()) {
      return;
    }

    mNavigator
        .getSimulator()
        .simulateLocationsAlongExistingRoute(
            new SimulationOptions().speedMultiplier(speedMultiplier));
  }

  public void stopGuidance() {
    mNavigator.stopGuidance();
  }

  public void stopLocationSimulation() {
    mNavigator.getSimulator().unsetUserLocation();
  }

  public void pauseLocationSimulation() {
    mNavigator.getSimulator().pause();
  }

  public void resumeLocationSimulation() {
    mNavigator.getSimulator().resume();
  }

  public void setZoomLevel(int level) {
    if (mGoogleMap != null) {
      mGoogleMap.animateCamera(CameraUpdateFactory.zoomTo(level));
    }
  }

  public void setIndoorEnabled(boolean isOn) {
    if (mGoogleMap != null) {
      mGoogleMap.setIndoorEnabled(isOn);
    }
  }

  public void setTrafficEnabled(boolean isOn) {
    if (mGoogleMap != null) {
      mGoogleMap.setTrafficEnabled(isOn);
    }
  }

  public void setCompassEnabled(boolean isOn) {
    if (mGoogleMap != null) {
      mGoogleMap.getUiSettings().setCompassEnabled(isOn);
    }
  }

  public void setRotateGesturesEnabled(boolean isOn) {
    if (mGoogleMap != null) {
      mGoogleMap.getUiSettings().setRotateGesturesEnabled(isOn);
    }
  }

  public void setScrollGesturesEnabled(boolean isOn) {
    if (mGoogleMap != null) {
      mGoogleMap.getUiSettings().setScrollGesturesEnabled(isOn);
    }
  }

  public void setScrollGesturesEnabledDuringRotateOrZoom(boolean isOn) {
    if (mGoogleMap != null) {
      mGoogleMap.getUiSettings().setScrollGesturesEnabledDuringRotateOrZoom(isOn);
    }
  }

  public void setTiltGesturesEnabled(boolean isOn) {
    if (mGoogleMap != null) {
      mGoogleMap.getUiSettings().setTiltGesturesEnabled(isOn);
    }
  }

  public void setZoomControlsEnabled(boolean isOn) {
    if (mGoogleMap != null) {
      mGoogleMap.getUiSettings().setZoomControlsEnabled(isOn);
    }
  }

  public void setZoomGesturesEnabled(boolean isOn) {
    if (mGoogleMap != null) {
      mGoogleMap.getUiSettings().setZoomGesturesEnabled(isOn);
    }
  }

  public void setBuildingsEnabled(boolean isOn) {
    if (mGoogleMap != null) {
      mGoogleMap.setBuildingsEnabled(isOn);
    }
  }

  public void setMyLocationEnabled(boolean isOn) {
    if (mGoogleMap != null) {
      if (ActivityCompat.checkSelfPermission(getActivity(), permission.ACCESS_FINE_LOCATION)
              == PackageManager.PERMISSION_GRANTED
          && ActivityCompat.checkSelfPermission(getActivity(), permission.ACCESS_COARSE_LOCATION)
              == PackageManager.PERMISSION_GRANTED) {
        mGoogleMap.setMyLocationEnabled(isOn);
      }
    }
  }

  public void setAbnormalTerminatingReportingEnabled(boolean isOn) {
    if (mGoogleMap != null) {
      NavigationApi.setAbnormalTerminationReportingEnabled(isOn);
    }
  }

  public void setTrafficIncidentCards(boolean isOn) {
    if (mGoogleMap != null) {
      mNavFragment.setTrafficIncidentCardsEnabled(isOn);
    }
  }

  public void setFooterEnabled(boolean isOn) {
    if (mGoogleMap != null) {
      mNavFragment.setFooterEnabled(isOn);
    }
  }

  public void showRouteOverview() {
    mNavFragment.showRouteOverview();
  }

  public void setMapToolbarEnabled(boolean isOn) {
    if (mGoogleMap != null) {
      mGoogleMap.getUiSettings().setMapToolbarEnabled(isOn);
    }
  }

  public void setNavigationCallback(INavigationCallback navigationCallback) {
    this.navigationCallback = navigationCallback;
  }

  private void logDebugInfo(String errorMessage) {
    navigationCallback.logDebugInfo(errorMessage);
  }

  /**
   * Enable turn by turn logging using background service
   *
   * @param isEnabled
   */
  public void setTurnbyTurnLoggingEnabled(boolean isEnabled) {
    if (isEnabled) {
      NavForwardingManager.startNavForwarding(mNavigator, requireActivity(), navigationCallback);
    } else {
      NavForwardingManager.stopNavForwarding(mNavigator, requireActivity(), navigationCallback);
    }
  }

  /** Toggles whether the location marker is enabled. */
  public void setMyLocationButtonEnabled(boolean isOn) {
    if (mGoogleMap == null) {
      return;
    }

    UiThreadUtil.runOnUiThread(
        () -> {
          mGoogleMap.getUiSettings().setMyLocationButtonEnabled(isOn);
        });
  }

  /** Toggles the visibility of the Trip Progress Bar UI. This is an EXPERIMENTAL FEATURE. */
  public void setTripProgressBarUiEnabled(boolean isOn) {
    if (mNavFragment == null) {
      return;
    }

    UiThreadUtil.runOnUiThread(
        () -> {
          mNavFragment.setTripProgressBarEnabled(isOn);
        });
  }

  /**
   * Toggles the visibility of speed limit icon
   *
   * @param isOn
   */
  public void setSpeedLimitIconEnabled(boolean isOn) {
    if (mNavFragment == null) {
      return;
    }

    UiThreadUtil.runOnUiThread(
        () -> {
          mNavFragment.setSpeedLimitIconEnabled(isOn);
        });
  }

  /** Toggles whether the Navigation UI is enabled. */
  public void setNavigationUiEnabled(boolean isOn) {
    if (mNavFragment == null) {
      return;
    }

    UiThreadUtil.runOnUiThread(
        () -> {
          mNavFragment.setNavigationUiEnabled(isOn);
        });
  }

  public void setSpeedometerEnabled(boolean isEnable) {
    if (mNavFragment == null) {
      return;
    }

    UiThreadUtil.runOnUiThread(
        () -> {
          mNavFragment.setSpeedometerEnabled(isEnable);
        });
  }

  public void clearDestinations() {
    if (mNavigator != null) {
      mNavigator.clearDestinations();
    }
  }

  public void continueToNextDestination() {
    if (mNavigator != null) {
      mNavigator.continueToNextDestination();
    }
  }

  public void simulateLocation(Map map) {
    if (mNavigator != null) {
      Double lat = null;
      Double lng = null;
      if (map.containsKey("location")) {
        Map latlng = (Map) map.get("location");
        if (latlng.get("lat") != null) lat = Double.parseDouble(latlng.get("lat").toString());
        if (latlng.get("lng") != null) lng = Double.parseDouble(latlng.get("lng").toString());
      }
      mNavigator.getSimulator().setUserLocation(new LatLng(lat, lng));
    }
  }

  public void setTocParams(Map map) {
    this.tocParamsMap = map;
  }

  private void showTermsAndConditionsDialog() {
    if (this.tocParamsMap == null) {
      return;
    }

    String companyName = CollectionUtil.getString("companyName", this.tocParamsMap);
    String title = CollectionUtil.getString("title", this.tocParamsMap);
    boolean showOnlyDisclaimer =
        CollectionUtil.getBool("showOnlyDisclaimer", this.tocParamsMap, false);

    TermsAndConditionsCheckOption tosOption =
        showOnlyDisclaimer
            ? TermsAndConditionsCheckOption.SKIPPED
            : TermsAndConditionsCheckOption.ENABLED;

    NavigationApi.showTermsAndConditionsDialog(
        getActivity(),
        companyName,
        title,
        null,
        new OnTermsResponseListener() {
          @Override
          public void onTermsResponse(boolean areTermsAccepted) {
            if (areTermsAccepted) {
              initializeNavigationApi();
            } else {
              navigationCallback.onNavigationInitError(NavigationApi.ErrorCode.TERMS_NOT_ACCEPTED);
            }
          }
        },
        tosOption);
  }

  public Boolean areTermsAccepted() {
    return NavigationApi.areTermsAccepted(getActivity().getApplication());
  }

  public String getNavSDKVersion() {
    return NavigationApi.getNavSDKVersion();
  }

  public void resetTermsAccepted() {
    NavigationApi.resetTermsAccepted(getActivity().getApplication());
  }

  @Override
  public void onDestroy() {
    super.onDestroy();
    if (mNavFragment != null) {
      mNavFragment.onDestroy();
    }
    cleanup();
  }

  @Override
  public void onDestroyView() {
    super.onDestroyView();

    if (mNavFragment != null) {
      mNavFragment.onDestroyView();
    }

    cleanup();
  }

  public Navigator getNavigator() {
    return mNavigator;
  }

  public GoogleMap getGoogleMap() {
    return mGoogleMap;
  }

  private void cleanup() {
    mRoadSnappedLocationProvider.removeLocationListener(mLocationListener);
    mNavigator.unregisterServiceForNavUpdates();
    mNavigator.removeArrivalListener(mArrivalListener);
    mNavigator.removeReroutingListener(mReroutingListener);
    mNavigator.removeRouteChangedListener(mRouteChangedListener);
    mNavigator.removeTrafficUpdatedListener(mTrafficUpdatedListener);
    mNavigator.removeRemainingTimeOrDistanceChangedListener(
        mRemainingTimeOrDistanceChangedListener);
    mNavFragment.removeOnRecenterButtonClickedListener(onRecenterButtonClickedListener);
    mNavigator.cleanup();
    mWaypoints.clear();
  }

  private interface IRouteStatusResult {
    void onResult(Navigator.RouteStatus code);
  }

  public void startUpdatingLocation() {
    mRoadSnappedLocationProvider.addLocationListener(mLocationListener);
  }

  public void stopUpdatingLocation() {
    mRoadSnappedLocationProvider.removeLocationListener(mLocationListener);
  }
}
