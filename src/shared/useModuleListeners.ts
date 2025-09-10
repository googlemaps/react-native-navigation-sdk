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
import {
  NativeEventEmitter,
  NativeModules,
  type EventSubscription,
} from 'react-native';

type ListenerMap<T> = {
  [K in keyof T]?: NonNullable<T[K]>[];
};

// A hook to manage event listeners for a specific Native Module,
// using the cross-platform NativeEventEmitter.
export const useModuleListeners = <
  T extends { [K in keyof T]: ((...args: any[]) => void) | undefined },
>(
  dispatcher: keyof NativeModules,
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
  const subsRef = useRef<Record<string, EventSubscription | undefined>>({});

  const getEventEmitter = useCallback(() => {
    if (!eventEmitterRef.current) {
      eventEmitterRef.current = new NativeEventEmitter(
        NativeModules[dispatcher]
      );
    }
    return eventEmitterRef.current;
  }, [dispatcher]);

  const removeAllNativeSubscriptions = useCallback(() => {
    // Remove the specific subscriptions we created.
    Object.values(subsRef.current).forEach(sub => sub?.remove());
    subsRef.current = {};

    // As a safeguard, remove all listeners for the specified event types
    // from our emitter instance.
    eventTypes.forEach(eventType => {
      const name = String(eventType);
      getEventEmitter().removeAllListeners(name);
    });
  }, [eventTypes, getEventEmitter]);

  const updateListeners = useCallback(() => {
    // Wrap listeners to multiplex events to all registered callbacks.
    const wrappedListeners: { [K in keyof T]?: (...args: unknown[]) => void } =
      {};

    (Object.keys(listenersRef.current) as Array<keyof T>).forEach(eventKey => {
      wrappedListeners[eventKey] = (...args: unknown[]) => {
        const transformedArgs = eventTransformer
          ? eventTransformer(eventKey, ...args)
          : args;
        listenersRef.current[eventKey]?.forEach(cb => cb(...transformedArgs));
      };
    });

    // Ensure all declared event types have a subscription, even if no JS listener is attached yet.
    eventTypes.forEach(eventType => {
      if (!wrappedListeners[eventType]) {
        wrappedListeners[eventType] = () => {}; // No-op handler
      }
    });

    removeAllNativeSubscriptions();

    // Subscribe to all events.
    eventTypes.forEach(eventType => {
      const name = String(eventType);
      const handler = wrappedListeners[eventType]!;
      const sub = getEventEmitter().addListener(name, handler);
      subsRef.current[name] = sub;
    });
  }, [
    eventTypes,
    eventTransformer,
    getEventEmitter,
    removeAllNativeSubscriptions,
  ]);

  const addListeners = (listeners: Partial<T>) => {
    (Object.keys(listeners) as Array<keyof T>).forEach(key => {
      const fn = listeners[key];
      if (!fn) return;
      listenersRef.current[key] = [...(listenersRef.current[key] || []), fn];
    });
    updateListeners();
  };

  const removeListeners = (listeners: Partial<T>) => {
    (Object.keys(listeners) as Array<keyof T>).forEach(key => {
      const fn = listeners[key];
      if (!fn) return;
      listenersRef.current[key] = listenersRef.current[key]?.filter(
        cb => cb !== fn
      );
      if (!listenersRef.current[key]?.length) {
        delete listenersRef.current[key];
      }
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
      removeAllNativeSubscriptions();
      listenersRef.current = {};
    };
  }, [updateListeners, removeAllNativeSubscriptions]);

  return {
    addListeners,
    removeListeners,
    removeAllListeners,
  };
};
