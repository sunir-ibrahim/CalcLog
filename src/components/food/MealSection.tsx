import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { FoodEntry, MealType } from '../../types/nutrition';
import { SPACING, RADII } from '../../constants/theme';

interface MealSectionProps {
  mealType: MealType;
  title: string;
  entries: FoodEntry[];
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  onAddPress: () => void;
  onDeleteEntry: (id: string) => void;
  onEntryPress?: (entry: FoodEntry) => void;
}

export const MealSection: React.FC<MealSectionProps> = ({
  mealType,
  title,
  entries,
  totalCalories,
  totalProteinG,
  totalCarbsG,
  totalFatG,
  onAddPress,
  onDeleteEntry,
  onEntryPress,
}) => {
  const { colors } = useTheme();

  const getMealIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (mealType) {
      case 'breakfast':
        return 'sunny-outline';
      case 'lunch':
        return 'restaurant-outline';
      case 'dinner':
        return 'moon-outline';
      case 'snack':
        return 'cafe-outline';
      default:
        return 'nutrition-outline';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.iconWrap, { backgroundColor: colors.inputBg }]}>
            <Ionicons name={getMealIcon()} size={16} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            {entries.length > 0 && (
              <Text style={[styles.subMacros, { color: colors.textMuted }]}>
                P: {Math.round(totalProteinG)}g • C: {Math.round(totalCarbsG)}g • F: {Math.round(totalFatG)}g
              </Text>
            )}
          </View>
        </View>

        <View style={styles.headerRight}>
          <Text style={[styles.caloriesTotal, { color: colors.text }]}>
            {Math.round(totalCalories)} <Text style={{ fontSize: 12, fontWeight: '400' }}>kcal</Text>
          </Text>
          <TouchableOpacity
            onPress={onAddPress}
            style={[styles.addBtn, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}
            accessibilityLabel={`Add food to ${title}`}
          >
            <Ionicons name="add" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Entries List */}
      {entries.length === 0 ? (
        <TouchableOpacity onPress={onAddPress} style={styles.emptyPrompt}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            No foods logged yet. Tap + to add.
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.entriesList}>
          {entries.map((item, idx) => (
            <View
              key={item.id}
              style={[
                styles.entryRow,
                { borderTopColor: colors.cardBorder },
                idx > 0 && { borderTopWidth: 1 },
              ]}
            >
              <TouchableOpacity
                onPress={() => onEntryPress?.(item)}
                style={styles.entryInfo}
              >
                <Text style={[styles.foodName, { color: colors.text }]} numberOfLines={1}>
                  {item.foodNameSnapshot}
                </Text>
                <Text style={[styles.portionText, { color: colors.textSecondary }]}>
                  {item.quantity} {item.quantityUnit} ({Math.round(item.quantityGrams)}g) •{' '}
                  P: {Math.round(item.proteinG)}g C: {Math.round(item.carbsG)}g F: {Math.round(item.fatG)}g
                </Text>
              </TouchableOpacity>

              <View style={styles.entryActions}>
                <Text style={[styles.entryCalories, { color: colors.text }]}>
                  {Math.round(item.calories)}
                </Text>
                <TouchableOpacity
                  onPress={() => onDeleteEntry(item.id)}
                  style={styles.deleteBtn}
                  accessibilityLabel="Delete entry"
                >
                  <Ionicons name="trash-outline" size={16} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: RADII.xl,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subMacros: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  caloriesTotal: {
    fontSize: 15,
    fontWeight: '700',
    marginRight: SPACING.sm,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  emptyPrompt: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '500',
  },
  entriesList: {
    marginTop: SPACING.sm,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  entryInfo: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  foodName: {
    fontSize: 14,
    fontWeight: '600',
  },
  portionText: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
  },
  entryActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryCalories: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: SPACING.sm,
  },
  deleteBtn: {
    padding: 6,
  },
});
