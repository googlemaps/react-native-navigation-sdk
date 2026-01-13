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

import { StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from './theme';

/**
 * Common UI component styles that can be reused across screens
 */
export const CommonStyles = StyleSheet.create({
  // Layout styles
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  spaceBetween: {
    justifyContent: 'space-between',
  },

  // Card styles
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    ...Shadows.medium,
  },

  cardHeader: {
    backgroundColor: Colors.surfaceVariant,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },

  // Button styles
  buttonContainer: {
    width: '80%',
    marginVertical: Spacing.sm,
    alignSelf: 'center',
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },

  // Input styles
  inputContainer: {
    marginBottom: Spacing.xxl,
  },

  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.md,
    backgroundColor: Colors.surface,
    color: Colors.text,
  },

  label: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },

  // Text styles
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },

  subtitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },

  description: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xxxl,
    lineHeight: Typography.fontSize.md * Typography.lineHeight.relaxed,
  },

  errorText: {
    fontSize: Typography.fontSize.md,
    color: Colors.error,
    textAlign: 'center',
    margin: Spacing.xl,
  },

  // Info box styles
  infoContainer: {
    backgroundColor: '#e8f4fd',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },

  infoTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primaryDark,
    marginBottom: Spacing.sm,
  },

  infoText: {
    fontSize: Typography.fontSize.sm,
    color: '#424242',
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },

  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },

  headerText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.lg,
  },
});

/**
 * Map-specific styles
 */
export const MapStyles = StyleSheet.create({
  mapView: {
    flex: 1,
    color: 'transparent',
  },

  mapContainer: {
    flex: 1,
    margin: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    ...Shadows.medium,
  },

  mapTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    padding: Spacing.md,
    backgroundColor: Colors.surfaceVariant,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },

  map: {
    flex: 1,
    minHeight: 200,
  },
});

/**
 * Control-specific styles
 */
export const ControlStyles = StyleSheet.create({
  // Button containers and layouts
  controlButtons: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: Spacing.md,
    justifyContent: 'space-evenly',
  },

  pagerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
  },

  controlButtonGap: {
    height: Spacing.md,
  },

  // Row layouts for controls
  rowContainer: {
    margin: Spacing.xs,
    marginHorizontal: Spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  rowLabel: {
    color: Colors.text,
  },

  // Form inputs
  input: {
    backgroundColor: Colors.surface,
    height: 40,
    margin: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    flexGrow: 1,
    borderRadius: BorderRadius.sm,
    color: Colors.text,
  },

  // Dropdown styles
  dropdownButton: {
    marginLeft: Spacing.md,
    width: '50%',
    height: 30,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  dropdownButtonText: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
    color: Colors.text,
  },

  dropdownMenu: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  dropdownItem: {
    width: '100%',
    height: 40,
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },

  dropdownItemText: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text,
    textAlign: 'center',
  },

  dropdownItemSelected: {
    backgroundColor: Colors.dropdownSelected,
  },
});
