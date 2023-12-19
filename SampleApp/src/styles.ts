/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  sub_container: {
    flex: 1,
    flexDirection: 'column',
  },
  button: {
    backgroundColor: '#2196f3',
  },
  center: {
    alignItems: 'center',
  },
  toggleControl: {
    backgroundColor: '#9ee2ff',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'baseline',
    position: 'absolute',
    right: 0,
    padding: 6,
    marginTop: 150,
  },
  input: {
    backgroundColor: '#ffffff',
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  zoomBtn: {
    color: '#fff',
  },
  rowContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    justifyContent: 'space-between',
    color: "white",
  },
  rowBtnContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'space-between',
  },
  controlButton: {
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: 10,
    justifyContent:'space-between',
  },
});

export default styles;