#!/bin/sh
# Copyright 2024 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Script to format or check formatting for Objective-C files in /ios and /example/ios

echo "Formatting Objective-C files..."
if [ "$1" = "--check" ]; then
    find ios example/ios/ReactNativeNavigationSdkExample -name "*.m" -o -name "*.mm" -o -name "*.h" | xargs clang-format -style=Google --dry-run -Werror
else
    find ios example/ios/ReactNativeNavigationSdkExample -name "*.m" -o -name "*.mm" -o -name "*.h" | xargs clang-format -style=Google -i
fi
echo "Formatting Objective-C files done."
