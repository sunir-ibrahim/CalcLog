import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { DailyNutritionSummary } from '../../types/nutrition';
import { SPACING, RADII } from '../../constants/theme';

interface MicronutrientSummaryCardProps {
  summary: DailyNutritionSummary;
}

interface NutrientConfig {
  id: string;
  name: string;
  consumed: number;
  target: number;
  unit: string;
  isLimit?: boolean;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  purpose: string;
}

export const MicronutrientSummaryCard: React.FC<MicronutrientSummaryCardProps> = ({ summary }) => {
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(true);

  // Daily Recommended Allowances (RDAs / Dietary Guidelines)
  const nutrients: NutrientConfig[] = [
    {
      id: 'fiber',
      name: 'Dietary Fiber',
      consumed: summary.totalFiberG || 0,
      target: 28,
      unit: 'g',
      color: '#10B981', // Emerald
      icon: 'leaf-outline',
      purpose: 'Digestive health & satiety',
    },
    {
      id: 'sodium',
      name: 'Sodium',
      consumed: summary.totalSodiumMg || 0,
      target: 2300,
      unit: 'mg',
      isLimit: true,
      color: (summary.totalSodiumMg || 0) > 2300 ? '#EF4444' : '#F59E0B',
      icon: 'water-outline',
      purpose: 'Daily upper limit',
    },
    {
      id: 'potassium',
      name: 'Potassium',
      consumed: summary.totalPotassiumMg || 0,
      target: 3400,
      unit: 'mg',
      color: '#8B5CF6', // Purple
      icon: 'flash-outline',
      purpose: 'Electrolytes & muscles',
    },
    {
      id: 'calcium',
      name: 'Calcium',
      consumed: summary.totalCalciumMg || 0,
      target: 1000,
      unit: 'mg',
      color: '#06B6D4', // Cyan
      icon: 'shield-checkmark-outline',
      purpose: 'Bone strength',
    },
    {
      id: 'iron',
      name: 'Iron',
      consumed: summary.totalIronMg || 0,
      target: 18,
      unit: 'mg',
      color: '#F97316', // Orange
      icon: 'pulse-outline',
      purpose: 'Oxygen transport & energy',
    },
  ];

  const displayedNutrients = isExpanded ? nutrients : nutrients.slice(0, 2);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={[styles.iconBadge, { backgroundColor: '#10B98120' }]}>
            <Ionicons name="sparkles" size={18} color="#10B981" />
          </View>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Micronutrients & Minerals</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Daily Guidelines & Intake
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setIsExpanded((prev) => !prev)}
          style={[styles.toggleBtn, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.toggleBtnText, { color: colors.textSecondary }]}>
            {isExpanded ? 'Less' : 'All 5'}
          </Text>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={colors.textSecondary}
            style={{ marginLeft: 3 }}
          />
        </TouchableOpacity>
      </View>

      {/* Nutrients List */}
      <View style={styles.nutrientsList}>
        {displayedNutrients.map((item) => {
          const ratio = Math.min(1.0, item.consumed / item.target);
          const percent = Math.round((item.consumed / item.target) * 100);
          const isOverLimit = item.isLimit && item.consumed > item.target;

          return (
            <View key={item.id} style={styles.nutrientRow}>
              {/* Nutrient Title & Status */}
              <View style={styles.nutrientTop}>
                <View style={styles.nutrientLabelWrap}>
                  <View style={[styles.microDot, { backgroundColor: item.color }]} />
                  <Text style={[styles.nutrientName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.purposeText, { color: colors.textMuted }]}>
                    • {item.isLimit ? `Max ${item.target.toLocaleString()}${item.unit}` : `Goal ${item.target.toLocaleString()}${item.unit}`}
                  </Text>
                </View>

                <View style={styles.valueWrap}>
                  <Text style={[styles.nutrientValue, { color: isOverLimit ? colors.danger : colors.text }]}>
                    {item.consumed.toLocaleString()}
                    <Text style={[styles.unitText, { color: colors.textMuted }]}> {item.unit}</Text>
                  </Text>
                  <View
                    style={[
                      styles.percentBadge,
                      {
                        backgroundColor: isOverLimit
                          ? '#EF444420'
                          : `${item.color}20`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.percentBadgeText,
                        { color: isOverLimit ? colors.danger : item.color },
                      ]}
                    >
                      {isOverLimit ? 'Limit Exceeded' : `${percent}%`}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={[styles.progressBarTrack, { backgroundColor: colors.inputBg }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      backgroundColor: item.color,
                      width: `${Math.round(ratio * 100)}%`,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* Footer Info */}
      <View style={[styles.footer, { borderTopColor: colors.cardBorder }]}>
        <Ionicons name="information-circle-outline" size={14} color={colors.textMuted} />
        <Text style={[styles.footerText, { color: colors.textMuted }]}>
          Synced from foods with verified micronutrient profiles
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADII.xl,
    borderWidth: 1,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: RADII.full,
    borderWidth: 1,
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  nutrientsList: {
    gap: SPACING.md,
  },
  nutrientRow: {
    gap: 6,
  },
  nutrientTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nutrientLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  microDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nutrientName: {
    fontSize: 14,
    fontWeight: '600',
  },
  purposeText: {
    fontSize: 11,
  },
  valueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nutrientValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  unitText: {
    fontSize: 11,
    fontWeight: '500',
  },
  percentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADII.sm,
  },
  percentBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerText: {
    fontSize: 11,
    flex: 1,
  },
});
