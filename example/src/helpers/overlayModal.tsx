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

import React, { type ReactNode } from 'react';
import { View, Modal, StyleSheet, Pressable, ScrollView } from 'react-native';
import { ExampleAppButton } from '../controls/ExampleAppButton';

interface OverlayModalProps {
  visible: boolean;
  closeOverlay: () => void;
  children: ReactNode;
  height?: number;
}

const OverlayModal: React.FC<OverlayModalProps> = ({
  visible,
  closeOverlay,
  children,
  height: height,
}) => {
  const modalContentStyle = [
    styles.modalContent,
    height != null ? { height } : null,
  ];

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={closeOverlay}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.overlayTouchable} onPress={closeOverlay} />
        <View style={modalContentStyle}>
          <ScrollView
            testID="overlay_scroll_view"
            showsVerticalScrollIndicator={true}
            persistentScrollbar={true}
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContentContainer}
          >
            <View style={styles.scrollContent}>{children}</View>
          </ScrollView>
          <View style={styles.closeButtonContainer}>
            <ExampleAppButton
              title="Close"
              onPress={closeOverlay}
              backgroundColor="#dc3545"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    height: '60%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    padding: 20,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    minHeight: '100%',
  },
  scrollContent: {
    flex: 1,
  },
  closeButtonContainer: {
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default OverlayModal;
