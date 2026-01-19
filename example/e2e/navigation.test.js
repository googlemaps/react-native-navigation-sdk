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
  expectNoErrors,
} from './shared.js';

describe('Navigation tests', () => {
  beforeEach(async () => {
    await initializeIntegrationTestsPage();
  });

  it('T01 - initialize navigation controller and test terms and conditions (TOS) dialog acceptance', async () => {
    await selectTestByName('testNavigationSessionInitialization');
    await agreeToTermsAndConditions();
    await waitForTestToFinish();
    await expectNoErrors();
    await expectSuccess();
  });

  it('T02 - initialize navigation controller and navigate to single destination', async () => {
    await selectTestByName('testNavigationToSingleDestination');
    await agreeToTermsAndConditions();
    await waitForTestToFinish();
    await expectNoErrors();
    await expectSuccess();
  });

  it('T03 - initialize navigation controller and navigate to multiple destinations', async () => {
    await selectTestByName('testNavigationToMultipleDestination');
    await agreeToTermsAndConditions();
    await waitForTestToFinish();
    await expectNoErrors();
    await expectSuccess();
  });

  it('T04 - initialize navigation controller and test route segments', async () => {
    await selectTestByName('testRouteSegments');
    await agreeToTermsAndConditions();
    await waitForTestToFinish();
    await expectNoErrors();
    await expectSuccess();
  });

  it('T05 - initialize navigation controller and test remaining time and distance', async () => {
    await selectTestByName('testGetCurrentTimeAndDistance');
    await agreeToTermsAndConditions();
    await waitForTestToFinish();
    await expectNoErrors();
    await expectSuccess();
  });

  it('T06 - expect navigation controller calls to fail when not initialized', async () => {
    await selectTestByName('testNavigationStateGuards');
    await waitForTestToFinish();
    await expectNoErrors();
    await expectSuccess();
  });

  it('T07 - require destinations before starting guidance', async () => {
    await selectTestByName('testStartGuidanceWithoutDestinations');
    await agreeToTermsAndConditions();
    await waitForTestToFinish();
    await expectNoErrors();
    await expectSuccess();
  });

  it('T08 - setDestinations with both routingOptions and routeTokenOptions should throw error', async () => {
    await selectTestByName('testRouteTokenOptionsValidation');
    await agreeToTermsAndConditions();
    await waitForTestToFinish();
    await expectNoErrors();
    await expectSuccess();
  });
});
