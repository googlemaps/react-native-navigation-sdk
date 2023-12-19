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

import com.google.android.gms.maps.model.Circle;
import com.google.android.gms.maps.model.GroundOverlay;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.Polygon;
import com.google.android.gms.maps.model.Polyline;
import android.location.Location;
import com.google.android.libraries.mapsplatform.turnbyturn.model.NavInfo;
import com.google.android.libraries.navigation.ArrivalEvent;
import com.google.android.libraries.navigation.Navigator;

public interface INavigationCallback {
  void onArrival(ArrivalEvent event);

  void onRouteChanged();

  void onReroutingRequestedByOffRoute();

  void onTrafficUpdated();

  void onTurnByTurn(NavInfo navInfo);

  void onStartGuidance();

  void logDebugInfo(String info);

  void onNavigationReady();

  void onNavigationInitError(int errorCode);

  void onRemainingTimeOrDistanceChanged();

  void onLocationChanged(Location location);

  void onRawLocationUpdate(Location location);

  void onMapReady();

  void onRecenterButtonClick();

  void onRouteStatusResult(Navigator.RouteStatus code);

  void onMarkerClick(Marker marker);

  void onPolylineClick(Polyline polyline);

  void onPolygonClick(Polygon polygon);

  void onCircleClick(Circle circle);

  void onGroundOverlayClick(GroundOverlay overlay);

  void onMarkerInfoWindowTapped(Marker marker);
}
