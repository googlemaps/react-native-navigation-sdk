import React, { useState } from 'react';
import type { TextInput } from 'react-native';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import AutoSuggestInput from './components/AutoSuggestInput/AutoSuggestInput';
import GoogleMapsApi from './services/GoogleMapsApi';
import type { GoogleDetail } from './types/GoogleDetail';

const convertLatLngToString = (latLng: { lat: number; lng: number }) =>
  `${latLng.lat},${latLng.lng}`; // i.e. '37.7749295,-122.4194155'

// mock current location for testing
const TEST_LOCATION = {
  lat: 37.7749295,
  lng: -122.4194155,
};

const GoogleAutocompleteScreen = () => {
  // refs
  const textInputRef = React.useRef<TextInput>(null);

  // state
  const [currentDetail, setCurrentDetail] = useState<GoogleDetail>();

  const northPanel = React.useMemo(
    () => (
      <View style={styles.northPanel}>
        <View style={styles.inputsContainer}>
          <AutoSuggestInput
            ref={textInputRef}
            onPress={async item => {
              const result = await GoogleMapsApi.getDetailFromPlaceId(item.id);
              setCurrentDetail(result);
            }}
            location={convertLatLngToString({
              lat: TEST_LOCATION.lat,
              lng: TEST_LOCATION.lng,
            })}
          />
        </View>
      </View>
    ),
    []
  );

  const southPanel = React.useMemo(() => {
    if (!currentDetail) {
      return null;
    }
    return (
      <ScrollView contentContainerStyle={styles.southPanel}>
        <Text>Detail: {JSON.stringify(currentDetail, null, 0)}</Text>
      </ScrollView>
    );
  }, [currentDetail]);

  // render
  return (
    <SafeAreaView style={styles.contentContainer}>
      {northPanel}
      {southPanel}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  inputsContainer: {
    width: '100%',
    gap: 10,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  northPanel: {
    flex: 1,
    alignItems: 'center',
  },
  southPanel: {
    flex: 1,
    gap: 10,
  },
});

export default GoogleAutocompleteScreen;
