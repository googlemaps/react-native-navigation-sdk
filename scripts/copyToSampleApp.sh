# Copyright 2023 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

rm -rf ../SampleApp/node_modules/react-native-navigation-sdk/components
rm -rf ../SampleApp/node_modules/react-native-navigation-sdk/android/src/main/java/com/google/android/react
rm -rf ../SampleApp/node_modules/react-native-navigation-sdk/ios/react-native-navigation-sdk

cp -R ../components ../SampleApp/node_modules/react-native-navigation-sdk
cp -R ../android/src/main/java/com/google/android/react/navsdk ../SampleApp/node_modules/react-native-navigation-sdk/android/src/main/java/com/google/android/react
cp -R ../ios/react-native-navigation-sdk ../SampleApp/node_modules/react-native-navigation-sdk/ios/react-native-navigation-sdk