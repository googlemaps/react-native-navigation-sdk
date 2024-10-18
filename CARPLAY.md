# Navigation for Apple CarPlay

This guide explains how to enable and integrate Apple CarPlay with the React Native Navigation SDK.

## Requirements

- iOS device or iOS simulator (iOS 15.0+)
- CarPlay Simulator
- CarPlay entitlement for your application (provided by Apple)

## Setup

Refer to the [Apple CarPlay Developer Guide](https://developer.apple.com/carplay/) to understand how CarPlay works and to complete the initial setup. Key steps include:

- Adding the CarPlay entitlement to your Xcode project.
- Creating a separate scene for the CarPlay map and enabling support for multiple scenes.

### SceneDelegate for CarPlay

Once your project is configured to support multiple scenes, and you are setting up a dedicated scene for CarPlay, you can leverage the `BaseCarSceneDelegate` provided by the SDK. This base class simplifies the setup by handling initialization, teardown, and rendering the map on the CarPlay display.

Please refer to the `CarSceneDelegate.h` and `CarSceneDelegate.m` files in the iOS example app for guidance.

To customize the CarPlay experience, override the `getTemplate` method in your custom `CarSceneDelegate` class, providing your own `CPMapTemplate`:

```objc
- (CPMapTemplate *)getTemplate {
  CPMapTemplate *template = [[CPMapTemplate alloc] init];
  [template showPanningInterfaceAnimated:YES];
 
  CPBarButton *customButton = [[CPBarButton alloc]
      initWithTitle:@"Custom Event"
            handler:^(CPBarButton ***_Nonnull** button) {
              NSMutableDictionary *dictionary = [
	              [NSMutableDictionary alloc] init
	          ];
              dictionary[@"sampleDataKey"] = @"sampleDataContent";
              [[NavAutoModule getOrCreateSharedInstance]
	              onCustomNavigationAutoEvent:@"sampleEvent"
	              data:dictionary
	          ];
            }];

  template.leadingNavigationBarButtons = @[ customButton ];
  template.trailingNavigationBarButtons = @[];
  return template;
}
```

For advanced customization, you can bypass the base class and implement your own delegate inheriting `CPTemplateApplicationSceneDelegate`. You can use the provided `BaseCarSceneDelegate` base class as a reference on how to do that.

### React Native Setup

On the React Native side, you can use the `useNavigationAuto` hook to interface with the CarPlay instance. The `mapViewAutoController` allows you to call map functions on the CarPlay map view, and you can manage listeners using the provided functions.

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

For a fully functional CarPlay implementation, check out the [SampleApp](./example/ios/) Xcode project, which includes the `SampleAppCarPlay` build target. The sample already contains test entitlement so you don't need to request one from Apple to run it.
