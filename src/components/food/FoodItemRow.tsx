import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { FoodItem } from '../../types/nutrition';
import { SPACING, RADII } from '../../constants/theme';

interface FoodItemRowProps {
  item: FoodItem;
  onSelect: (item: FoodItem) => void;
  onToggleFavorite?: (id: string) => void;
}

export const FoodItemRow: React.FC<FoodItemRowProps> = ({
  item,
  onSelect,
  onToggleFavorite,
}) => {
  const { colors } = useTheme();

  const getSourceBadge = () => {
    switch (item.source) {
      case 'local':
        return { label: 'Verified', bg: '#10B98120', text: colors.success };
      case 'custom':
        return { label: 'Custom', bg: '#8B5CF620', text: colors.steps };
      case 'usda':
        return { label: 'USDA', bg: '#3B82F620', text: colors.info };
      case 'openfoodfacts':
        return { label: 'Packaged', bg: '#F59E0B20', text: colors.warning };
      default:
        return { label: 'Food', bg: colors.inputBg, text: colors.textSecondary };
    }
  };

  const badge = getSourceBadge();

  return (
    <TouchableOpacity
      onPress={() => onSelect(item)}
      activeOpacity={0.7}
      style={[
        styles.row,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <View style={styles.leftInfo}>
        <View style={styles.titleRow}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
          </View>
        </View>

        {item.brand && (
          <Text style={[styles.brand, { color: colors.textMuted }]} numberOfLines={1}>
            {item.brand}
          </Text>
        )}

        <Text style={[styles.macros, { color: colors.textSecondary }]}>
          Per 100g: P: {item.proteinPer100g}g • C: {item.carbsPer100g}g • F: {item.fatPer100g}g
        </Text>
      </View>

      <View style={styles.rightSide}>
        <Text style={[styles.calories, { color: colors.text }]}>
          {Math.round(item.caloriesPer100g)}
          <Text style={[styles.calUnit, { color: colors.textMuted }]}> kcal</Text>
        </Text>

        {onToggleFavorite && (
          <TouchableOpacity
            onPress={() => onToggleFavorite(item.id)}
            style={styles.starBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={item.isFavorite ? 'star' : 'star-outline'}
              size={20}
              color={item.isFavorite ? '#F59E0B' : colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: RADII.lg,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  leftInfo: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 1,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  brand: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  macros: {
    fontSize: 12,
    fontWeight: '500',
  },
  rightSide: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  calories: {
    fontSize: 16,
    fontWeight: '800',
  },
  calUnit: {
    fontSize: 11,
    fontWeight: '500',
  },
  starBtn: {
    marginTop: 6,
    padding: 2,
  },
});
