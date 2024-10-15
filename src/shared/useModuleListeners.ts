/**
 * Copyright 2024 Google LLC
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

import { useRef, useCallback, useEffect } from 'react';
import { NativeEventEmitter, Platform, type NativeModule } from 'react-native';

type ListenerMap<T> = {
  [K in keyof T]?: NonNullable<T[K]>[];
};

export const useModuleListeners = <
  T extends { [K in keyof T]: ((...args: any[]) => void) | undefined },
>(
  dispatcher: NativeModule,
  androidBridge: string,
  eventTypes: Array<keyof T>,
  eventTransformer?: <K extends keyof T>(
    eventKey: K,
    ...args: unknown[]
  ) => unknown[]
): {
  addListeners: (listeners: Partial<T>) => void;
  removeListeners: (listeners: Partial<T>) => void;
  removeAllListeners: () => void;
} => {
  const listenersRef = useRef<ListenerMap<T>>({});
  const eventEmitterRef = useRef<NativeEventEmitter | null>(null);

  const getIOSEventEmitter = useCallback(() => {
    if (!eventEmitterRef.current) {
      eventEmitterRef.current = new NativeEventEmitter(dispatcher);
    }
    return eventEmitterRef.current;
  }, [dispatcher]);

  const updateListeners = useCallback(() => {
    // Wrap the listeners in a single object to pass to the native module for event handling.
    // Multiplexes the events to all registered listeners.
    const wrappedListeners = Object.keys(listenersRef.current).reduce(
      (acc, eventName) => {
        const eventKey = eventName as keyof T;
        acc[eventKey] = (...args: unknown[]) => {
          listenersRef.current[eventKey]?.forEach(callback =>
            callback(
              ...(eventTransformer ? eventTransformer(eventKey, ...args) : args)
            )
          );
        };
        return acc;
      },
      {} as {
        [K in keyof T]?: (...args: unknown[]) => void;
      }
    );

    eventTypes.forEach(eventType => {
      if (!wrappedListeners[eventType]) {
        wrappedListeners[eventType] = () => {};
      }
    });

    // Platform-specific event handling
    if (Platform.OS === 'android') {
      const BatchedBridge = require('react-native/Libraries/BatchedBridge/BatchedBridge');
      BatchedBridge.registerCallableModule(androidBridge, wrappedListeners);
    } else if (Platform.OS === 'ios') {
      eventTypes.forEach(eventType => {
        getIOSEventEmitter().removeAllListeners(eventType as string);
        getIOSEventEmitter().addListener(
          eventType as string,
          wrappedListeners[eventType]!
        );
      });
    }
  }, [eventTypes, androidBridge, getIOSEventEmitter, eventTransformer]);

  const addListeners = (listeners: Partial<T>) => {
    (Object.keys(listeners) as [keyof T]).forEach(key => {
      listenersRef.current[key] = [
        ...(listenersRef.current[key] || []),
        listeners[key]!,
      ];
    });
    updateListeners();
  };

  const removeListeners = (listeners: Partial<T>) => {
    (Object.keys(listeners) as [keyof T]).forEach(key => {
      listenersRef.current[key] = listenersRef.current[key]?.filter(
        listener => listener !== listeners[key]
      );
    });
    updateListeners();
  };

  const removeAllListeners = useCallback(() => {
    listenersRef.current = {};
    updateListeners();
  }, [updateListeners]);

  useEffect(() => {
    updateListeners();
    return () => {
      removeAllListeners();
    };
  }, [updateListeners, removeAllListeners]);

  return {
    addListeners,
    removeListeners,
    removeAllListeners,
  };
};
