/**
 * Copyright 2025 Google LLC
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

import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Typography, Spacing } from '../styles/theme';

type ExampleAppButtonProps = {
  title: string;
  onPress: () => void;
  backgroundColor?: string;
  pressedBackgroundColor?: string;
  textColor?: string;
  disabled?: boolean;
  testID?: string;
};

export const ExampleAppButton = ({
  title,
  onPress,
  backgroundColor,
  pressedBackgroundColor: pressedColor,
  textColor: textColor,
  disabled = false,
  testID,
}: ExampleAppButtonProps) => {
  const resolvedBackground = disabled
    ? Colors.buttonDisabled
    : (backgroundColor ?? Colors.button);
  const resolvedPressed = disabled
    ? Colors.buttonDisabled
    : (pressedColor ?? Colors.buttonPressed);
  const resolvedTextColor = disabled
    ? Colors.textDisabled
    : (textColor ?? Colors.buttonText);

  return (
    <Pressable
      testID={testID}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      android_ripple={
        disabled ? undefined : { color: 'rgba(0,0,0,0.15)', foreground: true }
      }
      style={({ pressed }) => [
        styles.buttonBase,
        {
          backgroundColor:
            pressed && !disabled ? resolvedPressed : resolvedBackground,
        },
        disabled && styles.buttonDisabled,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          {
            color: resolvedTextColor,
          },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginVertical: Spacing.xs,
  },
  buttonText: {
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
