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

import { device, element, waitFor, by, expect, log } from 'detox';

const NO_ERRORS_DETECTED_LABEL = 'No errors detected';

// Helper function to add delays for iOS animations (iOS default transition is ~300ms)
const iOSDelay = ms =>
  device.getPlatform() === 'ios'
    ? new Promise(resolve => setTimeout(resolve, ms))
    : Promise.resolve();

/**
 * Waits for ToS dialog to appear and accepts it.
 * The native dialog is shown by the test code and this function waits for it
 * to become visible, then taps the accept button.
 */
export const agreeToTermsAndConditions = async () => {
  // Determine which button text to look for based on platform
  const acceptButtonText = device.getPlatform() === 'ios' ? 'OK' : 'GOT IT';

  log.info(`Waiting for ToS dialog with "${acceptButtonText}" button...`);

  // Wait for the accept button to appear
  await waitFor(element(by.text(acceptButtonText)))
    .toBeVisible()
    .withTimeout(30000);

  log.info(`Found ${acceptButtonText} button, tapping...`);
  await element(by.text(acceptButtonText)).tap();

  log.info('ToS accepted successfully');
};

export const waitForStepNumber = async number => {
  await waitFor(element(by.id('test_status_label')))
    .toHaveText(`Test status: Step #${number}`)
    .withTimeout(10000);
};

export const waitForTestToFinish = async (timeInMs = 60000) => {
  await expect(element(by.id('test_status_label'))).toExist();
  await waitFor(element(by.id('test_status_label')))
    .toHaveText(`Test status: Finished`)
    .withTimeout(timeInMs);
};

export const expectSuccess = async () => {
  await expect(element(by.id('test_result_label'))).toHaveText(
    'Test result: Success'
  );
};

export async function expectNoErrors() {
  const failureMessageLabel = element(by.id('failure_message_label'));
  const attributes = await failureMessageLabel.getAttributes();
  if (attributes.text !== NO_ERRORS_DETECTED_LABEL) {
    log.error(attributes.text);
  }
  await expect(element(by.id('failure_message_label'))).toHaveText(
    NO_ERRORS_DETECTED_LABEL
  );
}

export const initializeIntegrationTestsPage = async () => {
  await device.launchApp({
    delete: true,
    permissions: { location: 'always' },
    // Workaround for RN 0.81+ new architecture - disable Detox synchronization
    // See: https://github.com/wix/Detox/issues/4842
    launchArgs: { detoxEnableSynchronization: 0 },
  });
  // Wait for the app to fully load since synchronization is disabled
  await waitFor(element(by.id('integration_tests_button')))
    .toBeVisible()
    .withTimeout(30000);
  await iOSDelay(350);
  await element(by.id('integration_tests_button')).tap();
  await iOSDelay(350);
};

export const selectTestByName = async name => {
  await waitFor(element(by.id('tests_menu_button')))
    .toBeVisible()
    .withTimeout(10000);
  await iOSDelay(350);
  await element(by.id('tests_menu_button')).tap();
  // Wait for the overlay scroll view to be visible
  await waitFor(element(by.id('overlay_scroll_view')))
    .toBeVisible()
    .withTimeout(10000);

  const scrollView = element(by.id('overlay_scroll_view'));
  const targetElement = element(by.id(name));

  // Detox scroll has some issues on iOS, therefore manual swipe scrolling below is used.
  // Find and position element properly for tapping
  let elementReady = false;
  const maxScrollAttempts = 15;
  for (let i = 0; i < maxScrollAttempts && !elementReady; i++) {
    try {
      await waitFor(targetElement).toBeVisible().withTimeout(500);

      // Element is visible, check if it's in a tappable position.
      const attributes = await targetElement.getAttributes();
      const scrollViewAttrs = await scrollView.getAttributes();

      const elementY = attributes.frame?.y || 0;
      const scrollViewY = scrollViewAttrs.frame?.y || 0;
      const scrollViewHeight = scrollViewAttrs.frame?.height || 1000;
      const relativeY = elementY - scrollViewY;

      // If element is too bottom on the view, scroll up a bit.
      if (relativeY > scrollViewHeight * 0.8) {
        await scrollView.swipe('up', 'slow', 0.25);
      } else {
        elementReady = true;
      }
    } catch {
      // Element not visible yet, swipe up to scroll down
      await scrollView.swipe('up', 'slow', 0.3);
    }
  }

  if (!elementReady) {
    // Final fallback - just wait for visibility
    await waitFor(targetElement).toBeVisible().withTimeout(5000);
  }

  await iOSDelay(600);
  await targetElement.tap();
};
