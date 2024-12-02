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

describe('Even listener tests', () => {
  beforeEach(async () => {
    await initializeIntegrationTestsPage();
  });

  it('T01 - test navigation onRemainingTimeOrDistanceChanged event listener', async () => {
    await selectTestByName('testOnRemainingTimeOrDistanceChanged');
    await agreeToTermsAndConditions();
    await waitForTestToFinish();
    await expectSuccess();
  });

  it('T02 - test navigation onArrival event listener', async () => {
    await selectTestByName('testOnArrival');
    await agreeToTermsAndConditions();
    await waitForTestToFinish();
    await expectSuccess();
  });

  it('T03 - test navigation OnRouteChanged event listener', async () => {
    await selectTestByName('testOnRouteChanged');
    await agreeToTermsAndConditions();
    await waitForTestToFinish();
    await expectSuccess();
  });
});
