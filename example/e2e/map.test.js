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
  expectNoErrors,
} from './shared.js';

describe('Map view tests', () => {
  beforeEach(async () => {
    await initializeIntegrationTestsPage();
  });

  it('MT01 - initialize map and test default values', async () => {
    await selectTestByName('testMapInitialization');
    await waitForTestToFinish();
    await expectNoErrors();
    await expectSuccess();
  });

  it('MT02 - initialize map and test move camera', async () => {
    await selectTestByName('testMoveCamera');
    await waitForTestToFinish();
    await expectNoErrors();
    await expectSuccess();
  });

  it('MT03 - initialize map and test camera tilt bearing zoom', async () => {
    await selectTestByName('testTiltZoomBearingCamera');
    await waitForTestToFinish();
    await expectNoErrors();
    await expectSuccess();
  });

  it('MT04 - test adding and removing markers', async () => {
    await selectTestByName('testMapMarkers');
    await waitForTestToFinish();
    await expectNoErrors();
    await expectSuccess();
  });

  it('MT05 - test adding and removing circles', async () => {
    await selectTestByName('testMapCircles');
    await waitForTestToFinish();
    await expectNoErrors();
    await expectSuccess();
  });

  it('MT06 - test adding and removing polylines', async () => {
    await selectTestByName('testMapPolylines');
    await waitForTestToFinish();
    await expectNoErrors();
    await expectSuccess();
  });

  it('MT07 - test adding and removing polygons', async () => {
    await selectTestByName('testMapPolygons');
    await waitForTestToFinish();
    await expectNoErrors();
    await expectSuccess();
  });

  it('MT08 - test adding and removing ground overlays', async () => {
    await selectTestByName('testMapGroundOverlays');
    await waitForTestToFinish();
    await expectNoErrors();
    await expectSuccess();
  });
});
