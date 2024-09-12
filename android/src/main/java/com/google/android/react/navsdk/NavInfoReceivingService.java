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

import android.app.Service;
import android.content.Intent;
import android.os.Handler;
import android.os.HandlerThread;
import android.os.IBinder;
import android.os.Looper;
import android.os.Message;
import android.os.Messenger;
import android.os.Process;
import androidx.annotation.Nullable;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.google.android.libraries.mapsplatform.turnbyturn.TurnByTurnManager;
import com.google.android.libraries.mapsplatform.turnbyturn.model.NavInfo;

/**
 * Receives turn-by-turn navigation information forwarded from NavSDK and posts each update to live
 * data, which is then displayed on a separate header in {@code NavInfoDisplayFragment}. This
 * service may be part of a different process aside from the main process, depending on how you want
 * to structure your app. The service binding will be able to handle interprocess communication to
 * receive nav info messages from the main process.
 */
public class NavInfoReceivingService extends Service {
  /** The messenger used by the service to receive nav step updates. */
  private Messenger mIncomingMessenger;

  /** Used to read incoming messages. */
  private TurnByTurnManager mTurnByTurnManager;

  private static final MutableLiveData<NavInfo> mNavInfoMutableLiveData = new MutableLiveData<>();

  private final class IncomingNavStepHandler extends Handler {
    public IncomingNavStepHandler(Looper looper) {
      super(looper);
    }

    @Override
    public void handleMessage(Message msg) {
      if (TurnByTurnManager.MSG_NAV_INFO == msg.what) {
        // Read the nav info from the message data.
        NavInfo navInfo = mTurnByTurnManager.readNavInfoFromBundle(msg.getData());
        // Post the value to LiveData to be displayed in the nav info header.
        mNavInfoMutableLiveData.postValue(navInfo);
      }
    }
  }

  @Nullable
  @Override
  public IBinder onBind(Intent intent) {
    return mIncomingMessenger.getBinder();
  }

  @Override
  public boolean onUnbind(Intent intent) {
    mNavInfoMutableLiveData.postValue(null);
    return super.onUnbind(intent);
  }

  @Override
  public void onCreate() {
    mTurnByTurnManager = TurnByTurnManager.createInstance();
    HandlerThread thread =
        new HandlerThread("NavInfoReceivingService", Process.THREAD_PRIORITY_DEFAULT);
    thread.start();
    mIncomingMessenger = new Messenger(new IncomingNavStepHandler(thread.getLooper()));
  }

  public static LiveData<NavInfo> getNavInfoLiveData() {
    return mNavInfoMutableLiveData;
  }
}
