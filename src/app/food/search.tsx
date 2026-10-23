import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { searchFoodCatalog } from '../../services/nutritionService';
import { toggleFavoriteFood } from '../../database/repositories/foodRepo';
import { FoodItem, MealType } from '../../types/nutrition';
import { FoodItemRow } from '../../components/food/FoodItemRow';
import { SPACING, RADII } from '../../constants/theme';

export default function FoodSearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mealType?: string }>();
  const mealType = (params.mealType as MealType) || 'breakfast';

  const { colors } = useTheme();

  const [query, setQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'favorites' | 'custom' | 'local'>('all');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOfflineWarning, setIsOfflineWarning] = useState(false);

  const debounceTimer = useRef<any>(null);

  const performSearch = async (text: string) => {
    setIsSearching(true);
    try {
      const searchRes = await searchFoodCatalog(text, { includeExternal: true });
      setResults(searchRes.items);
      setIsOfflineWarning(searchRes.isOffline);
    } catch (err) {
      console.warn('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    // Initial fetch of local favorites/catalog
    performSearch('');
  }, []);

  const handleQueryChange = (text: string) => {
    setQuery(text);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    // Instant local search for empty or short queries; debounced for external calls
    if (!text.trim()) {
      performSearch('');
    } else {
      debounceTimer.current = setTimeout(() => {
        performSearch(text);
      }, 350);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    await toggleFavoriteFood(id);
    setResults((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  const handleSelectFood = (item: FoodItem) => {
    router.push({
      pathname: '/food/details',
      params: {
        foodId: item.id,
        foodName: item.name,
        brand: item.brand || '',
        source: item.source,
        servingSizeG: String(item.servingSizeG),
        servingUnit: item.servingUnit,
        caloriesPer100g: String(item.caloriesPer100g),
        proteinPer100g: String(item.proteinPer100g),
        carbsPer100g: String(item.carbsPer100g),
        fatPer100g: String(item.fatPer100g),
        fiberPer100g: String(item.fiberPer100g || 0),
        sodiumMgPer100g: String(item.sodiumMgPer100g || 0),
        potassiumMgPer100g: String(item.potassiumMgPer100g || 0),
        calciumMgPer100g: String(item.calciumMgPer100g || 0),
        ironMgPer100g: String(item.ironMgPer100g || 0),
        mealType,
      },
    });
  };

  const filteredResults = results.filter((item) => {
    if (filterTab === 'favorites') return item.isFavorite;
    if (filterTab === 'custom') return item.isCustom;
    if (filterTab === 'local') return item.source === 'local';
    return true;
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Top Search Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={[styles.searchBox, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            value={query}
            onChangeText={handleQueryChange}
            placeholder={`Search foods for ${mealType}...`}
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => handleQueryChange('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={() => router.push('/food/custom')}
          style={[styles.customBtn, { backgroundColor: colors.primary }]}
          accessibilityLabel="Add custom food"
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        {(
          [
            { key: 'all', label: 'All Foods' },
            { key: 'local', label: 'Indian & Staples' },
            { key: 'favorites', label: 'Favorites' },
            { key: 'custom', label: 'Custom' },
          ] as const
        ).map((tab) => {
          const isSelected = filterTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setFilterTab(tab.key)}
              style={[
                styles.tabBtn,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
                isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Offline banner if external search failed */}
      {isOfflineWarning && (
        <View style={[styles.offlineBanner, { backgroundColor: '#F59E0B20' }]}>
          <Ionicons name="cloud-offline-outline" size={16} color={colors.warning} style={{ marginRight: 6 }} />
          <Text style={[styles.offlineText, { color: colors.warning }]}>
            External search unavailable. Showing offline & cached database foods.
          </Text>
        </View>
      )}

      {/* Search results list */}
      {isSearching ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            Searching nutrition databases...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FoodItemRow
              item={item}
              onSelect={handleSelectFood}
              onToggleFavorite={handleToggleFavorite}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="nutrition-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No foods found</Text>
              <Text style={[styles.emptySub, { color: colors.textMuted }]}>
                Can't find what you're looking for? Tap + to create your own custom food.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/food/custom')}
                style={[styles.emptyActionBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.emptyActionText}>Create Custom Food</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  backBtn: {
    padding: 6,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: RADII.lg,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  customBtn: {
    width: 40,
    height: 40,
    borderRadius: RADII.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADII.full,
    borderWidth: 1,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
    padding: SPACING.sm,
    borderRadius: RADII.md,
  },
  offlineText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: SPACING.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: SPACING.md,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  emptyActionBtn: {
    marginTop: SPACING.lg,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: RADII.md,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
