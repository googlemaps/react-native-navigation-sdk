/**
 * Copyright 2023 Google LLC
 *
 * <p>Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of the License at
 *
 * <p>http://www.apache.org/licenses/LICENSE-2.0
 *
 * <p>Unless required by applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.google.android.react.navsdk;

import android.content.Context;
import android.widget.FrameLayout;
import androidx.annotation.Nullable;
import com.google.android.libraries.navigation.StylingOptions;

public class NavViewLayout extends FrameLayout {
  private CustomTypes.FragmentType fragmentType;
  private StylingOptions stylingOptions;
  private boolean isFragmentCreated = false;

  public NavViewLayout(Context context) {
    super(context);
  }

  public void setFragmentType(CustomTypes.FragmentType type) {
    this.fragmentType = type;
  }

  @Nullable
  public CustomTypes.FragmentType getFragmentType() {
    return this.fragmentType;
  }

  public void setStylingOptions(@Nullable StylingOptions options) {
    this.stylingOptions = options;
  }

  @Nullable
  public StylingOptions getStylingOptions() {
    return this.stylingOptions;
  }

  public boolean isFragmentCreated() {
    return this.isFragmentCreated;
  }

  public void setFragmentCreated(boolean created) {
    this.isFragmentCreated = created;
  }
}
