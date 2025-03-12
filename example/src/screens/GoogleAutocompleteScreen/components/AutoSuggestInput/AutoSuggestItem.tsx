import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

const AutoSuggestItem = ({
  item,
  onSelect,
}: {
  item: { id: string; name: string };
  onSelect: (item: { id: string; name: string }) => void;
}) => (
  <TouchableOpacity
    style={styles.suggestionItem}
    key={item.id}
    onPress={() => onSelect(item)}
  >
    <Text style={styles.suggestionItemText}>{item.name}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  suggestionItem: {
    borderBottomColor: 'lightgray',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    height: 40,
    justifyContent: 'center',
  },
  suggestionItemText: {
    fontSize: 10,
  },
});

AutoSuggestItem.displayName = 'AutoSuggestItem';

export default AutoSuggestItem;
