import React from 'react';
import {
  FlatList,
  StyleSheet,
  TextInput,
  type TextInputProps,
} from 'react-native';
import GoogleMapsApi from '../../services/GoogleMapsApi';
import type { GooglePlace } from '../../types/GooglePlace';
import AutoSuggestItem from './AutoSuggestItem';

const remoteToAutoSuggestListItem = (
  item: GooglePlace
): { id: string; name: string } => {
  return {
    id: item.place_id,
    name: item.description,
  };
};

const sanitizeText = (text: string): string => {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/gi, '')
    .toLowerCase(); // remove special characters, extra spaces, and convert to lowercase
};

type Item = {
  id: string; // place_id
  name: string; // description
};

type Props = {
  onPress?: (item: Item) => void;
  textInputProps?: TextInputProps & {
    label?: string;
    required?: boolean;
  };
  location: string;
  radius?: number;
};

const AutoSuggestInput = React.forwardRef<TextInput, Props>((props, ref) => {
  // props
  const { onPress, textInputProps, location, radius = 0 } = props;

  // state
  const [text, setText] = React.useState<string>('');
  const [suggestions, setSuggestions] = React.useState<Item[]>([]);
  const [isFocused, setIsFocused] = React.useState<boolean>(false);

  // callbacks
  const handleTextChange = React.useCallback(
    async (newText: string) => {
      setText(newText);
      const cleanedText = sanitizeText(newText);
      if (cleanedText.length > 0) {
        // fetch data from api when text input value changes
        GoogleMapsApi.getPlacesAutocomplete({
          input: cleanedText,
          location,
          radius,
        }).then((result: GooglePlace[]) => {
          const mapped = result.map(remoteToAutoSuggestListItem);
          setSuggestions(mapped);
        });
      } else {
        setSuggestions([]);
      }
    },
    [location, radius]
  );

  const handleItemPress = React.useCallback(
    (item: Item) => {
      if (ref && 'current' in ref && ref.current) {
        ref.current.blur();
      }
      onPress?.(item);
      setText(item.name);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // memoized values
  const memoizedSuggestionsList = React.useMemo(() => {
    if (!(suggestions.length > 0 && isFocused)) {
      return null;
    }
    return (
      <FlatList
        data={suggestions}
        keyExtractor={item => `${item.id}`}
        renderItem={({ item }) => {
          return <AutoSuggestItem item={item} onSelect={handleItemPress} />;
        }}
      />
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestions, isFocused]);

  return (
    <>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        clearTextOnFocus
        style={styles.textInput}
        ref={ref}
        value={text}
        onChangeText={handleTextChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...textInputProps}
      />
      {memoizedSuggestionsList}
    </>
  );
});

const styles = StyleSheet.create({
  textInput: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
  },
});

AutoSuggestInput.displayName = 'AutoSuggestInput';

export default AutoSuggestInput;
