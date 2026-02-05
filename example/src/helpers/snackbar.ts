/**
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Snackbar from 'react-native-snackbar';

/**
 * Shows a snackbar message.
 * @param text - The message text to display
 * @param duration - Optional duration (defaults to Snackbar.LENGTH_SHORT)
 * @param dismissPrevious - If true, dismisses any existing snackbar before showing (defaults to false)
 * @param numberOfLines - Optional number of lines to show (defaults to 2)
 */
export const showSnackbar = (
  text: string,
  duration = Snackbar.LENGTH_SHORT,
  dismissPrevious = false,
  numberOfLines: number = 2
) => {
  if (dismissPrevious) {
    Snackbar.dismiss();
  }
  Snackbar.show({ text, duration, numberOfLines });
};

export { Snackbar };
