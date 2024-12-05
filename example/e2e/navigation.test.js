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

import {
  initializeIntegrationTestsPage,
  agreeToTermsAndConditions,
  selectTestByName,
  waitForTestToFinish,
  expectSuccess,
} from './shared.js';
import { element, by, log } from 'detox';

describe('Navigation tests', () => {
  beforeEach(async () => {
    await initializeIntegrationTestsPage();
  });

  it('T01 - initialize navigation controller and test terms and conditions (TOS) dialog acceptance', async () => {
    await selectTestByName('testNavigationSessionInitialization');
    await agreeToTermsAndConditions();
    await waitForTestToFinish();
    await expectSuccess();
  });

  it('T02 - initialize navigation controller and navigate to single destination', async () => {
    await selectTestByName('testNavigationToSingleDestination');
    await agreeToTermsAndConditions();
    await waitForTestToFinish();
    await expectSuccess();
  });

  it('T03 - initialize navigation controller and navigate to multiple destinations', async () => {
    await selectTestByName('testNavigationToMultipleDestination');
    await agreeToTermsAndConditions();
    await waitForTestToFinish();
    await expectSuccess();
  });

  it('T04 - initialize navigation controller and test route segments', async () => {
    await selectTestByName('testRouteSegments');
    await agreeToTermsAndConditions();
    const failureMessageLabel = element(by.id('failure_message_label'));
    const attributes = await failureMessageLabel.getAttributes();
    log.error(attributes.text);
    await expect(element(by.id('failure_message_label'))).toHaveText('');
    await waitForTestToFinish();
    await expectSuccess();
  });

  it('T05 - initialize navigation controller and test remaining time and distance', async () => {
    await selectTestByName('testGetCurrentTimeAndDistance');
    await agreeToTermsAndConditions();
    const failureMessageLabel = element(by.id('failure_message_label'));
    const attributes = await failureMessageLabel.getAttributes();
    log.error(attributes.text);
    await expect(element(by.id('failure_message_label'))).toHaveText('');
    await waitForTestToFinish();
    await expectSuccess();
  });
});
