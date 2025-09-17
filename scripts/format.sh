#!/bin/sh
# Copyright 2024 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Runs all format scripts (Java, Kotlin, Objective-C) in this folder.
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"

"$DIR/format-java.sh" "$@"
"$DIR/format-objc.sh" "$@"
