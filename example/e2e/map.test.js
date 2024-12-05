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
  selectTestByName,
  waitForTestToFinish,
  expectSuccess,
} from './shared.js';
import { element, by, log } from 'detox';

describe('Map view tests', () => {
  beforeEach(async () => {
    await initializeIntegrationTestsPage();
  });

  it('T01 - initialize map and test default values', async () => {
    await selectTestByName('testMapInitialization');
    await waitForTestToFinish();
    const failureMessageLabel = element(by.id('failure_message_label'));
    const attributes = await failureMessageLabel.getAttributes();
    log.error(attributes.text);
    await expect(element(by.id('failure_message_label'))).toHaveText('');
    await expectSuccess();
  });

  it('T02 - initialize map and test move camera', async () => {
    await selectTestByName('testMoveCamera');
    await waitForTestToFinish();
    const failureMessageLabel = element(by.id('failure_message_label'));
    const attributes = await failureMessageLabel.getAttributes();
    log.error(attributes.text);
    await expect(element(by.id('failure_message_label'))).toHaveText('');
    await expectSuccess();
  });

  it('T03 - initialize map and test camera tilt bearing zoom', async () => {
    await selectTestByName('testTiltZoomBearingCamera');
    await waitForTestToFinish();
    const failureMessageLabel = element(by.id('failure_message_label'));
    const attributes = await failureMessageLabel.getAttributes();
    log.error(attributes.text);
    await expect(element(by.id('failure_message_label'))).toHaveText('');
    await expectSuccess();
  });
});
