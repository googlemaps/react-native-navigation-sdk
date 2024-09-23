# Navigation for Android Auto

This guide explains how to enable and integrate Android Auto with the React Native Navigation SDK.

## Requirements

- Android device
- Android Auto test device or Android Automotive OS emulator

## Setup

Refer to the [Android for Cars developer documentation](https://developer.android.com/training/cars) to understand how the Android Auto works and to complete the initial setup. Key steps include:

- Installing Android for Cars App Library.
- Configuring your app's manifest file to include Android Auto.
- Declaring a minimum car-app level in your manifest.
- Creating 'CarAppService' and session

For all the steps above, you can refer to the Android example application for guidance.

### Screen for Android Auto

Once your project is configured accordingly, and you are ready to build the screen for Android Auto, you can leverage the `AndroidAutoBaseScreen` provided by the SDK. This base class simplifies the setup by handling initialization, teardown, and rendering the map on the Android Auto display.

Please refer to the `SampleAndroidAutoScreen.java` file in the Android example app for guidance.

To customize the Android Auto experience, override the `onGetTemplate` method in your custom AndroidAutoScreen class, providing your own `Template`:

```java
@NonNull
@Override
public Template onGetTemplate() {
  /** ... */
  @SuppressLint("MissingPermission")
  NavigationTemplate.Builder navigationTemplateBuilder =
      new NavigationTemplate.Builder()
          .setActionStrip(
              new ActionStrip.Builder()
                  .addAction(
                      new Action.Builder()
                          .setTitle("Re-center")
                          .setOnClickListener(
                              () -> {
                                if (mGoogleMap == null) return;
                                mGoogleMap.followMyLocation(GoogleMap.CameraPerspective.TILTED);
                              })
                          .build())
                  .addAction(
                      new Action.Builder()
                          .setTitle("Custom event")
                          .setOnClickListener(
                              () -> {
                                WritableMap map = Arguments.createMap();
                                map.putString("sampleKey", "sampleValue");
                                sendCustomEvent("sampleEvent", map);
                              })
                          .build())
                  .build())
          .setMapActionStrip(new ActionStrip.Builder().addAction(Action.PAN).build());
  /** ... */
}
```

For advanced customization, you can bypass the base class and implement your own screen by inheriting `Screen`. You can use the provided `AndroidAutoBaseScreen` base class as a reference on how to do that.

### React Native specific setup

On the React Native side, you can use the `useNavigationAuto` hook to interface with the Android Auto instance. The `mapViewAutoController` allows you to call map functions on the Android Auto map, and you can manage listeners using the provided functions.

```tsx
const {
  mapViewAutoController,
  addListeners: addAutoListener,
  removeListeners: removeAutoListeners,
} = useNavigationAuto();

const navigationAutoCallbacks: NavigationAutoCallbacks = useMemo(
  () => ({
    onCustomNavigationAutoEvent: (event: CustomNavigationAutoEvent) => {
      console.log('onCustomNavigationAutoEvent:', event);
    },
    onAutoScreenAvailabilityChanged: (available: boolean) => {
      console.log('onAutoScreenAvailabilityChanged:', available);
      setMapViewAutoAvailable(available);
    },
  }),
  []
);

const setMapType = (mapType: MapType) => {
  console.log('setMapType', mapType);
  mapViewAutoController.setMapType(mapType);
};
```

For a more detailed example, refer to the `NavigationScreen.tsx` in the React Native example application.

## Example Project

For a fully functional Android Auto implementation, check out the [SampleApp](./example/android/) Android Studio project.
