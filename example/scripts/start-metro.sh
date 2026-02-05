# Copyright 2026 Google LLC
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

# Script to start Metro bundler only if it's not already running

PORT=8081

# Check if something is already listening on the port
if lsof -i :$PORT -sTCP:LISTEN > /dev/null 2>&1; then
  echo "Metro bundler already running on port $PORT"
  exit 0
fi

# Start metro bundler
exec yarn start
