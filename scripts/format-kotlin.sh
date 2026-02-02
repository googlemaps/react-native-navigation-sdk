#!/bin/sh
# Copyright 2024 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Formats Kotlin code in the example app using ktfmt.

set -e

TASK="ktfmtFormat"

# Check mode - verify formatting without modifying files
if [ "$1" = "--check" ]; then
  TASK="ktfmtCheck"
fi

if [ -d "example" ]; then cd example; fi && \
  cd android && \
  ./gradlew $TASK
