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

import React, { createContext, type ReactNode, useContext } from 'react';
import type {
  NavigationController,
  TaskRemovedBehavior,
  TermsAndConditionsDialogOptions,
} from './types';
import {
  useNavigationController,
  type NavigationListenerSetters,
} from './useNavigationController';

interface NavigationContextProps extends NavigationListenerSetters {
  navigationController: NavigationController;
  removeAllListeners: () => void;
}

const NavigationContext = createContext<NavigationContextProps | undefined>(
  undefined
);

interface NavigationProviderProps {
  /**
   * Options for the Terms and Conditions dialog.
   * These options will be used when calling showTermsAndConditionsDialog()
   * unless overridden.
   */
  termsAndConditionsDialogOptions: TermsAndConditionsDialogOptions;
  /**
   * Behavior when task is removed (Android only).
   */
  taskRemovedBehavior?: TaskRemovedBehavior;
  children: ReactNode;
}

export const NavigationProvider = ({
  termsAndConditionsDialogOptions,
  taskRemovedBehavior,
  children,
}: NavigationProviderProps): React.JSX.Element => {
  const { navigationController, removeAllListeners, ...listenerSetters } =
    useNavigationController(
      termsAndConditionsDialogOptions,
      taskRemovedBehavior
    );

  return (
    <NavigationContext.Provider
      value={{
        navigationController,
        removeAllListeners,
        ...listenerSetters,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextProps => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
