# Changelog

## [0.13.0](https://github.com/googlemaps/react-native-navigation-sdk/compare/v0.12.2...v0.13.0) (2026-01-22)


### ⚠ BREAKING CHANGES

* Updates setDestinations call signature. DisplayOptions, RoutingOptions and RouteTokenOptions are now optional named parameters.

### Features

* support route tokens ([#528](https://github.com/googlemaps/react-native-navigation-sdk/issues/528)) ([bcf3679](https://github.com/googlemaps/react-native-navigation-sdk/commit/bcf367940382aa412931be6351c2ffcace446640))

## [0.12.2](https://github.com/googlemaps/react-native-navigation-sdk/compare/v0.12.1...v0.12.2) (2026-01-16)


### Bug Fixes

* view lifecycle handling ([#524](https://github.com/googlemaps/react-native-navigation-sdk/issues/524)) ([2f3d862](https://github.com/googlemaps/react-native-navigation-sdk/commit/2f3d862a2c44be1d92155b0ccc84f307bc5b1dab))

## [0.12.1](https://github.com/googlemaps/react-native-navigation-sdk/compare/v0.12.0...v0.12.1) (2025-12-15)


### Bug Fixes

* setReportIncidentButtonEnabled for Android ([#520](https://github.com/googlemaps/react-native-navigation-sdk/issues/520)) ([832e62a](https://github.com/googlemaps/react-native-navigation-sdk/commit/832e62a7b198ce881f1b953c9f50d29e299d01cc))

## [0.12.0](https://github.com/googlemaps/react-native-navigation-sdk/compare/v0.11.0...v0.12.0) (2025-12-02)


### ⚠ BREAKING CHANGES

* iOS header_dir changed to ReactNativeGoogleMapsNavigation for direct imports.
* `no_destinations` error string on iOS is changed to `NO_DESTINATIONS`, matching other error code formats and Android implementation

### Features

* support for setting map color schema ([#500](https://github.com/googlemaps/react-native-navigation-sdk/issues/500)) ([6e0cd58](https://github.com/googlemaps/react-native-navigation-sdk/commit/6e0cd587a1a7ce5cefa1e6a592fd74e16a3983d7))
* support mapId ([#495](https://github.com/googlemaps/react-native-navigation-sdk/issues/495)) ([d639fe4](https://github.com/googlemaps/react-native-navigation-sdk/commit/d639fe4e5f5a9d4a70908a542cb9d0887a41f280))
* upgrade Android SDK to version 7.2.0 ([#506](https://github.com/googlemaps/react-native-navigation-sdk/issues/506)) ([3032359](https://github.com/googlemaps/react-native-navigation-sdk/commit/3032359e9085a0adbf2a62de52a4c1cf3f3c431d))
* upgrade iOS SDK to version 10.6.0 ([#507](https://github.com/googlemaps/react-native-navigation-sdk/issues/507)) ([1f17d25](https://github.com/googlemaps/react-native-navigation-sdk/commit/1f17d25f7c16b1c696b1ed4923da6aa656e97dd1))


### Bug Fixes

* android view invalidation mechanism ([#505](https://github.com/googlemaps/react-native-navigation-sdk/issues/505)) ([4f770c9](https://github.com/googlemaps/react-native-navigation-sdk/commit/4f770c9c32d61eff19e8b490be172db90d170b7e))
* iOS navigation session attachment and detachment ([#497](https://github.com/googlemaps/react-native-navigation-sdk/issues/497)) ([cc0aae1](https://github.com/googlemaps/react-native-navigation-sdk/commit/cc0aae12c6294e667b5f561f4f81342ee90143fa))
* navigation session error handling ([#502](https://github.com/googlemaps/react-native-navigation-sdk/issues/502)) ([a8ddabb](https://github.com/googlemaps/react-native-navigation-sdk/commit/a8ddabbf082c30a00350ace2dda3371d34cf15c7))
* re-expose public iOS header files ([#509](https://github.com/googlemaps/react-native-navigation-sdk/issues/509)) ([00c4635](https://github.com/googlemaps/react-native-navigation-sdk/commit/00c4635436aed7b1c425077074ea4bb649379c9a))
* resolve map view initialization timing issue ([#504](https://github.com/googlemaps/react-native-navigation-sdk/issues/504)) ([3c46f4d](https://github.com/googlemaps/react-native-navigation-sdk/commit/3c46f4d2d16553b4529a3fa6efba1fb929cc8ca0))


### Miscellaneous Chores

* breaking change on re-expose public iOS header files ([#511](https://github.com/googlemaps/react-native-navigation-sdk/issues/511)) ([e04d42a](https://github.com/googlemaps/react-native-navigation-sdk/commit/e04d42aa2172ca851fba0e7a642c5c4cf2b612d6))

## [0.11.0](https://github.com/googlemaps/react-native-navigation-sdk/compare/v0.10.3...v0.11.0) (2025-10-13)


### ⚠ BREAKING CHANGES

* upgrade Android SDK to 7.0.0 ([#481](https://github.com/googlemaps/react-native-navigation-sdk/issues/481))

### Features

* upgrade Android SDK to 7.0.0 ([#481](https://github.com/googlemaps/react-native-navigation-sdk/issues/481)) ([d22ed47](https://github.com/googlemaps/react-native-navigation-sdk/commit/d22ed4726c86672e16c542d50078fc03d97bb508))

## [0.10.3](https://github.com/googlemaps/react-native-navigation-sdk/compare/v0.10.2...v0.10.3) (2025-09-19)


### Bug Fixes

* view lifecycle issue ([#473](https://github.com/googlemaps/react-native-navigation-sdk/issues/473)) ([2922fc6](https://github.com/googlemaps/react-native-navigation-sdk/commit/2922fc644b6847526bc9661f425a25b019d1d523))

## [0.10.2](https://github.com/googlemaps/react-native-navigation-sdk/compare/v0.10.1...v0.10.2) (2025-09-11)


### Bug Fixes

* pin react-test-renderer version to fix npm install issues ([#471](https://github.com/googlemaps/react-native-navigation-sdk/issues/471)) ([e3f0f81](https://github.com/googlemaps/react-native-navigation-sdk/commit/e3f0f81f632eb9b3c5ceb374abbc2ae7dc2382a5))

## [0.10.1](https://github.com/googlemaps/react-native-navigation-sdk/compare/v0.10.0...v0.10.1) (2025-09-10)


### Features

* support latest rn versions ([#467](https://github.com/googlemaps/react-native-navigation-sdk/issues/467)) ([2b69764](https://github.com/googlemaps/react-native-navigation-sdk/commit/2b69764462c97a34ec14228410c4de7e189d2ee3))
* upgrade to latest iOS SDK 10.3.0 ([#470](https://github.com/googlemaps/react-native-navigation-sdk/issues/470)) ([85f678a](https://github.com/googlemaps/react-native-navigation-sdk/commit/85f678abd858e1e6f5fd1cb0f1d3fb54dd36d13b))

## [0.10.0](https://github.com/googlemaps/react-native-navigation-sdk/compare/v0.9.3...v0.10.0) (2025-08-11)


### ⚠ BREAKING CHANGES

* upgrade to latest sdks ([#459](https://github.com/googlemaps/react-native-navigation-sdk/issues/459))

### Features

* upgrade to latest sdks ([#459](https://github.com/googlemaps/react-native-navigation-sdk/issues/459)) ([a413055](https://github.com/googlemaps/react-native-navigation-sdk/commit/a413055af5ac52a6d122756fc278d6d7d6354764))

## [0.9.3](https://github.com/googlemaps/react-native-navigation-sdk/compare/v0.9.2...v0.9.3) (2025-03-31)


### Features

* update ios nav sdk to 9.3.0 and android to 6.0.2 ([#403](https://github.com/googlemaps/react-native-navigation-sdk/issues/403)) ([18ce410](https://github.com/googlemaps/react-native-navigation-sdk/commit/18ce410f32738fb233c89658810aecd5e17b0be9))
* update Navigation SDK for Android to version 6.1.0 ([5496a21](https://github.com/googlemaps/react-native-navigation-sdk/commit/5496a21e43f1c2e456234ef25d1a2c7694e815d3))

## [0.9.2](https://github.com/googlemaps/react-native-navigation-sdk/compare/v0.9.1...v0.9.2) (2024-12-17)


### Features

* add display options to navigation ([#370](https://github.com/googlemaps/react-native-navigation-sdk/issues/370)) ([a6fa22e](https://github.com/googlemaps/react-native-navigation-sdk/commit/a6fa22e7c5514fc25aa25ca95f625bf08bd31731))
* add map padding ([#373](https://github.com/googlemaps/react-native-navigation-sdk/issues/373)) ([bf50530](https://github.com/googlemaps/react-native-navigation-sdk/commit/bf50530fc36991e321f6b18d6551dbf5b09d3b51))


### Miscellaneous Chores

* small logic improvements to example app ([#371](https://github.com/googlemaps/react-native-navigation-sdk/issues/371)) ([17f5458](https://github.com/googlemaps/react-native-navigation-sdk/commit/17f545832cfce5c512ddd11828f7a1e4ce1eb140))

## [0.9.1](https://github.com/googlemaps/react-native-navigation-sdk/compare/v0.9.0...v0.9.1) (2024-11-29)


### Bug Fixes

* android auto service binding fix ([#360](https://github.com/googlemaps/react-native-navigation-sdk/issues/360)) ([5f0b2a8](https://github.com/googlemaps/react-native-navigation-sdk/commit/5f0b2a82103ccb2f2a8901c2a7fa5ac324b19a8c))
* fix android set zoom gestures function ([#367](https://github.com/googlemaps/react-native-navigation-sdk/issues/367)) ([7b836d6](https://github.com/googlemaps/react-native-navigation-sdk/commit/7b836d6562dc202fd1e65093d438cb17345cb6d7))

## [0.9.0](https://github.com/googlemaps/react-native-navigation-sdk/compare/v0.8.1...v0.9.0) (2024-11-22)


### ⚠ BREAKING CHANGES

* create bitmapdescriptor from asset on android ([#347](https://github.com/googlemaps/react-native-navigation-sdk/issues/347))

### Bug Fixes

* create bitmapdescriptor from asset on android ([#347](https://github.com/googlemaps/react-native-navigation-sdk/issues/347)) ([fb9da83](https://github.com/googlemaps/react-native-navigation-sdk/commit/fb9da83b03fa8cd57c89fe917bd351dbf8c1a4d9))
* documentation for MarkerOptions imgPath parameter ([#352](https://github.com/googlemaps/react-native-navigation-sdk/issues/352)) ([20c83d6](https://github.com/googlemaps/react-native-navigation-sdk/commit/20c83d6f732cad94c53ddba1384f058eada972c5))

## [0.8.1](https://github.com/googlemaps/react-native-navigation-sdk/compare/v0.8.0...v0.8.1) (2024-11-01)


### Bug Fixes

* onMarkerClick and onMarkerInfoWindowTapped on Android ([#322](https://github.com/googlemaps/react-native-navigation-sdk/issues/322)) ([1c461be](https://github.com/googlemaps/react-native-navigation-sdk/commit/1c461becf544837cb6ecc20d435125b017a248ec))

## [0.8.0](https://github.com/googlemaps/react-native-navigation-sdk/compare/v0.7.0...v0.8.0) (2024-10-24)


### Features

* support navigation disposal on app exit on android ([#308](https://github.com/googlemaps/react-native-navigation-sdk/issues/308)) ([6c6123b](https://github.com/googlemaps/react-native-navigation-sdk/commit/6c6123b208ccbd7779aab1b7b8e0c9afd4da2d00))
* update navigation sdk versions (iOS -&gt; 9.1.2, Android -> 6.0.0) and min iOS version to 15 ([#306](https://github.com/googlemaps/react-native-navigation-sdk/issues/306)) ([cdd7b68](https://github.com/googlemaps/react-native-navigation-sdk/commit/cdd7b686e630b85f7945aee2a4a5802d2045e96a))


### Bug Fixes

* enable navigation map on carplay ([#315](https://github.com/googlemaps/react-native-navigation-sdk/issues/315)) ([aa56cbe](https://github.com/googlemaps/react-native-navigation-sdk/commit/aa56cbe8ee8ee955fb11c05fe55be4d6415a536d))
* handle navigation listeners on NavigationProvider mount and unmount ([#294](https://github.com/googlemaps/react-native-navigation-sdk/issues/294)) ([6674a4f](https://github.com/googlemaps/react-native-navigation-sdk/commit/6674a4fbf95f7939d7ebd5a99672fea9eeef5e22))
* handle taskRemovedBehaviourValue on iOS ([#314](https://github.com/googlemaps/react-native-navigation-sdk/issues/314)) ([2e1137e](https://github.com/googlemaps/react-native-navigation-sdk/commit/2e1137e62bd94500de709cdaafab4169fedc49d8))

## [0.7.0](https://github.com/googlemaps/react-native-navigation-sdk/compare/v0.6.1...v0.7.0) (2024-10-15)


### Features

* add carplay and android auto support ([#255](https://github.com/googlemaps/react-native-navigation-sdk/issues/255)) ([933209a](https://github.com/googlemaps/react-native-navigation-sdk/commit/933209a9c2fe97077b664aa3ee26b09e29d29d98))

## [0.6.1](https://github.com/googlemaps/react-native-navigation-sdk/compare/v0.6.0...v0.6.1) (2024-09-27)


### Bug Fixes

* enable remaining time distance listener on ios ([#276](https://github.com/googlemaps/react-native-navigation-sdk/issues/276)) ([9364d0e](https://github.com/googlemaps/react-native-navigation-sdk/commit/9364d0e5d390ba64de9caef151baf72bbab9522b))

## [0.6.0](https://github.com/googlemaps/react-native-navigation-sdk/compare/v0.5.1...v0.6.0) (2024-09-13)


### Features

* support map view without navigation ([#259](https://github.com/googlemaps/react-native-navigation-sdk/issues/259)) ([15fd94b](https://github.com/googlemaps/react-native-navigation-sdk/commit/15fd94bf61e232980144978be36e69a2cabe6e47))

## [0.5.1](https://github.com/googlemaps/react-native-navigation-sdk/compare/v0.5.0...v0.5.1) (2024-09-10)


### Bug Fixes

* apply styling options for iOS navigation view ([#248](https://github.com/googlemaps/react-native-navigation-sdk/issues/248)) ([32dd6b3](https://github.com/googlemaps/react-native-navigation-sdk/commit/32dd6b3ced3ab7e07cec85d22b5b053028e645b6))
* ensure EventDispatcher always receives non-null data from NavViewEvent ([#256](https://github.com/googlemaps/react-native-navigation-sdk/issues/256)) ([0ee4e8a](https://github.com/googlemaps/react-native-navigation-sdk/commit/0ee4e8a5b687bc947f7420afc018484df10b0c21))
* marker click events on android ([#257](https://github.com/googlemaps/react-native-navigation-sdk/issues/257)) ([a3ee9ae](https://github.com/googlemaps/react-native-navigation-sdk/commit/a3ee9ae29939bba0b42f6a34b8ba7c84e2d93efe))

## [0.5.0](https://github.com/googlemaps/react-native-navigation-sdk/compare/v0.4.3...v0.5.0) (2024-09-05)


### ⚠ BREAKING CHANGES

* The height and width properties have been removed from NavigationView in favor of an optional style property.

### Features

* view callback and layout functionality improvements ([#239](https://github.com/googlemaps/react-native-navigation-sdk/issues/239)) ([d24855b](https://github.com/googlemaps/react-native-navigation-sdk/commit/d24855b9b391f41fedc46137267c2d947c57ca16))


### Miscellaneous Chores

* release 0.5.0 ([e46648b](https://github.com/googlemaps/react-native-navigation-sdk/commit/e46648b2ffb71503608ec8cb704a03e7c43840f1))

## [0.4.3](https://github.com/googlemaps/react-native-navigation-sdk/compare/v0.4.2...v0.4.3) (2024-08-19)


### Miscellaneous Chores

* release 0.4.3 ([6f0b74f](https://github.com/googlemaps/react-native-navigation-sdk/commit/6f0b74f3ae9d3a830f2055090fc1a88691109d9d))

## [0.4.2](https://github.com/googlemaps/react-native-navigation-sdk/compare/v0.4.1...v0.4.2) (2024-08-06)


### Bug Fixes

* setFollowingPerspective functionality for iOS ([#222](https://github.com/googlemaps/react-native-navigation-sdk/issues/222)) ([ea85603](https://github.com/googlemaps/react-native-navigation-sdk/commit/ea85603daad5dc247fa390103ba3638ab9d43aaf))

## [0.4.1](https://github.com/googlemaps/react-native-navigation-sdk/compare/v0.4.0...v0.4.1) (2024-08-05)


### Bug Fixes

* ci and packaging issues ([#220](https://github.com/googlemaps/react-native-navigation-sdk/issues/220)) ([df7a9f1](https://github.com/googlemaps/react-native-navigation-sdk/commit/df7a9f12a31f77d223655bef6f05bb4b89d636a4))
* simulate location ([#219](https://github.com/googlemaps/react-native-navigation-sdk/issues/219)) ([e2b39c3](https://github.com/googlemaps/react-native-navigation-sdk/commit/e2b39c3b62136a07c26aa671949c969c9aa1e3d1))

## [0.4.0](https://github.com/googlemaps/react-native-navigation-sdk/compare/0.4.0-beta...v0.4.0) (2024-07-30)


### Miscellaneous Chores

* update release-please.yml ([#213](https://github.com/googlemaps/react-native-navigation-sdk/issues/213)) ([f8c679c](https://github.com/googlemaps/react-native-navigation-sdk/commit/f8c679c19c1dee99123cf52b4686782a61cff7f2))
