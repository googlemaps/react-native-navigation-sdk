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

import { useEffect, useRef, useCallback } from 'react';
import { TurboModuleRegistry, type EventSubscription } from 'react-native';

/**
 * TurboModule interface with EventEmitter pattern.
 * In the new architecture, event emitters are callable functions that
 * return an EventSubscription.
 */
type TurboModuleWithEvents = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: ((handler: (arg: any) => void) => EventSubscription) | unknown;
};

/**
 * Gets or creates a cached TurboModule instance.
 */
const moduleCache = new Map<string, TurboModuleWithEvents>();

function getModule(moduleName: string): TurboModuleWithEvents {
  let module = moduleCache.get(moduleName);
  if (!module) {
    module =
      TurboModuleRegistry.getEnforcing<TurboModuleWithEvents>(moduleName);
    moduleCache.set(moduleName, module);
  }
  return module;
}

/**
 * Hook to subscribe to a single TurboModule event.
 *
 * In the new React Native architecture, TurboModules with EventEmitter<T> types expose
 * events as callable functions that accept a handler and return an EventSubscription.
 *
 * @param moduleName - The TurboModule name (e.g., 'NavModule', 'NavAutoModule')
 * @param eventName - The name of the event to subscribe to
 * @param handler - The callback function to handle the event, or null/undefined to skip subscription
 * @returns An object with an `unsubscribe` function to manually remove the subscription
 *
 * @example
 * ```tsx
 * // Subscribe to location changes
 * useEventSubscription('NavModule', 'onLocationChanged', (payload) => {
 *   console.log('Location:', payload.location);
 * });
 *
 * // Conditional subscription - only subscribes when handler is provided
 * const [enableTracking, setEnableTracking] = useState(false);
 * useEventSubscription('NavModule', 'onLocationChanged',
 *   enableTracking ? (payload) => console.log(payload.location) : undefined
 * );
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useEventSubscription<T = any>(
  moduleName: string,
  eventName: string,
  handler: ((payload: T) => void) | null | undefined
): { unsubscribe: () => void } {
  const subscriptionRef = useRef<EventSubscription | null>(null);
  const handlerRef = useRef(handler);

  // Keep handler ref up to date to avoid re-subscribing on handler changes
  handlerRef.current = handler;

  const unsubscribe = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Clean up any existing subscription
    unsubscribe();

    // Don't subscribe if no handler provided
    if (!handler) {
      return;
    }

    const module = getModule(moduleName);
    const eventEmitter = module[eventName];

    if (typeof eventEmitter !== 'function') {
      console.warn(
        `useEventSubscription: Event '${eventName}' not found on module '${moduleName}'`
      );
      return;
    }

    // Subscribe using the latest handler via ref
    subscriptionRef.current = eventEmitter((payload: T) => {
      handlerRef.current?.(payload);
    });

    return unsubscribe;
  }, [moduleName, eventName, handler, unsubscribe]);

  return { unsubscribe };
}

/**
 * Creates a subscription function for a TurboModule event (non-hook version).
 *
 * This is useful when you need to subscribe to events outside of React components
 * or when you want more control over the subscription lifecycle.
 *
 * @param moduleName - The TurboModule name (e.g., 'NavModule', 'NavAutoModule')
 * @param eventName - The name of the event to subscribe to
 * @param handler - The callback function to handle the event
 * @returns An EventSubscription that can be used to unsubscribe
 *
 * @example
 * ```ts
 * // Subscribe to an event
 * const subscription = subscribeToEvent('NavModule', 'onLocationChanged', (payload) => {
 *   console.log('Location:', payload.location);
 * });
 *
 * // Later, unsubscribe
 * subscription.remove();
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function subscribeToEvent<T = any>(
  moduleName: string,
  eventName: string,
  handler: (payload: T) => void
): EventSubscription {
  const module = getModule(moduleName);
  const eventEmitter = module[eventName];

  if (typeof eventEmitter !== 'function') {
    throw new Error(
      `subscribeToEvent: Event '${eventName}' not found on module '${moduleName}'`
    );
  }

  return eventEmitter(handler);
}
