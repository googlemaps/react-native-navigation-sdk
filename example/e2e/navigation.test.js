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
  waitForStepNumber,
  selectTestByName,
  waitForTestToFinish,
} from './shared.js';
import { element, by } from 'detox';

describe('Initialization tests', () => {
  beforeEach(async () => {
    await initializeIntegrationTestsPage();
  });

  it('T01 - initialize navigation controller and test terms and conditions (TOS) dialog acceptance', async () => {
    await selectTestByName('testNavigationSessionInitialization');
    await waitForStepNumber(1);
    await agreeToTermsAndConditions();
    await waitForTestToFinish();
    await expect(element(by.id('test_result_label'))).toHaveText(
      'Test result: Success'
    );
  });

  /**
  it('T01 - check navigation controller defaults', async () => {
    await element(by.text('Tests')).tap();
    await element(by.text('testNavigationSessionInitialization')).tap();
    // await waitFor(element(by.text('Test status: Step #1')))
    //  .toBeVisible()
    //  .withTimeout(10000);
    await waitFor(element(by.id('test_status_label')))
      .toHaveText('Test status: Step #1')
      .withTimeout(10000);
    await agreeToTC();
    await waitFor(element(by.text('Test status: Success')))
      .toBeVisible()
      .withTimeout(10000);
  });
  */
});
