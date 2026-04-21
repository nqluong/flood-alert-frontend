import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Text,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { debounce } from 'lodash';
import { geocodingService, type GeocodingResult } from '../../services/geocoding.service';

interface SearchBarWithAutocompleteProps {
  placeholder?: string;
  onSelectLocation?: (result: GeocodingResult) => void;
  onFilterPress?: () => void;
  onClearSearch?: () => void; // Thêm prop để xóa marker
  userLocation?: [number, number] | null;
}

export function SearchBarWithAutocomplete({
  placeholder = 'Tìm kiếm địa điểm...',
  onSelectLocation,
  onFilterPress,
  onClearSearch,
  userLocation,
}: SearchBarWithAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const debouncedSearch = useRef(
    debounce(async (searchQuery: string, proximity?: [number, number]) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      try {
        const searchResults = await geocodingService.search(searchQuery, {
          proximity,
          limit: 5,
        });
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500),
  ).current;

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleChangeText = useCallback(
    (text: string) => {
      setQuery(text);
      setShowResults(true);

      if (text.trim()) {
        setLoading(true);
        debouncedSearch(text, userLocation || undefined);
      } else {
        setResults([]);
        setLoading(false);
      }
    },
    [debouncedSearch, userLocation],
  );

  const handleSelectResult = useCallback(
    (result: GeocodingResult) => {
      setQuery(result.place_name);
      setShowResults(false);
      setResults([]);
      Keyboard.dismiss();
      onSelectLocation?.(result);
    },
    [onSelectLocation],
  );

  const handleClear = useCallback(() => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    onClearSearch?.(); // Xóa marker trên map
  }, [onClearSearch]);

  const getPlaceIcon = (placeType: string[]) => {
    if (placeType.includes('poi')) return 'location';
    if (placeType.includes('address')) return 'home';
    if (placeType.includes('place')) return 'business';
    if (placeType.includes('region')) return 'map';
    return 'location-outline';
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#374151" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="rgba(55,65,81,0.5)"
          value={query}
          onChangeText={handleChangeText}
          onFocus={() => setShowResults(true)}
          returnKeyType="search"
        />
        {loading && <ActivityIndicator size="small" color="#009688" style={styles.loader} />}
        {query.length > 0 && !loading && (
          <TouchableOpacity onPress={handleClear} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="close-circle" size={20} color="#9e9e9e" />
          </TouchableOpacity>
        )}
        <View style={styles.divider} />
        <TouchableOpacity onPress={onFilterPress} activeOpacity={0.7} hitSlop={8}>
          <MaterialIcons name="tune" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Autocomplete Results */}
      {showResults && results.length > 0 && (
        <View style={styles.resultsContainer}>
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => handleSelectResult(item)}
                activeOpacity={0.7}
              >
                <View style={styles.resultIconContainer}>
                  <Ionicons
                    name={getPlaceIcon(item.place_type) as any}
                    size={18}
                    color="#009688"
                  />
                </View>
                <View style={styles.resultTextContainer}>
                  <Text style={styles.resultTitle} numberOfLines={1}>
                    {item.text}
                  </Text>
                  <Text style={styles.resultSubtitle} numberOfLines={1}>
                    {item.place_name}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  searchBar: {
    backgroundColor: '#ffffff',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    letterSpacing: -0.5,
  },
  loader: {
    marginRight: 8,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 12,
  },
  resultsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginTop: 8,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,150,136,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  resultSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginLeft: 64,
  },
});
