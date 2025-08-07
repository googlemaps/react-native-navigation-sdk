#!/bin/sh
# Copyright 2024 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Script to format or check formatting for Kotlin files in /android and /example/android

echo "Formatting Kotlin files..."
if [ "$1" = "--check" ]; then
    find android/src example/android/app/src -name "*.kt" | xargs ktfmt --google-style --dry-run --set-exit-if-changed
else
    find android/src example/android/app/src -name "*.kt" | xargs ktfmt --google-style
fi
echo "Formatting Kotlin files done."