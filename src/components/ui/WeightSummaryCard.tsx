import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { WeightEntry } from '../../types/database';
import { analyzeWeightProgress } from '../../database/repositories/weightRepo';
import { SPACING, RADII } from '../../constants/theme';

interface WeightSummaryCardProps {
  weightEntries: WeightEntry[];
  targetWeightKg: number;
  onRecordPress: () => void;
}

export const WeightSummaryCard: React.FC<WeightSummaryCardProps> = ({
  weightEntries,
  targetWeightKg,
  onRecordPress,
}) => {
  const { colors } = useTheme();
  const analysis = analyzeWeightProgress(weightEntries, targetWeightKg);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.topRow}>
        <View style={styles.titleRow}>
          <View style={[styles.iconWrap, { backgroundColor: '#06B6D420' }]}>
            <Ionicons name="scale-outline" size={18} color={colors.weight} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Body Weight</Text>
        </View>

        <TouchableOpacity
          onPress={onRecordPress}
          style={[styles.actionBtn, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}
        >
          <Ionicons name="add" size={16} color={colors.primary} style={{ marginRight: 2 }} />
          <Text style={[styles.actionBtnText, { color: colors.primary }]}>Record</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Current</Text>
          <Text style={[styles.metricValue, { color: colors.text }]}>
            {analysis.currentWeight ? `${analysis.currentWeight} kg` : '--'}
          </Text>
        </View>

        <View style={[styles.verticalDivider, { backgroundColor: colors.cardBorder }]} />

        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Target</Text>
          <Text style={[styles.metricValue, { color: colors.text }]}>
            {targetWeightKg ? `${targetWeightKg} kg` : '--'}
          </Text>
        </View>

        <View style={[styles.verticalDivider, { backgroundColor: colors.cardBorder }]} />

        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Difference</Text>
          <Text
            style={[
              styles.metricValue,
              {
                color:
                  analysis.weightDeltaToTarget === 0
                    ? colors.success
                    : analysis.weightDeltaToTarget > 0
                    ? colors.warning
                    : colors.info,
              },
            ]}
          >
            {analysis.weightDeltaToTarget > 0 ? `+${analysis.weightDeltaToTarget}` : analysis.weightDeltaToTarget} kg
          </Text>
        </View>
      </View>

      {analysis.recentChangeKg !== null && (
        <View style={[styles.trendBanner, { backgroundColor: colors.inputBg }]}>
          <Ionicons
            name={
              analysis.recentChangeKg < 0
                ? 'arrow-down'
                : analysis.recentChangeKg > 0
                ? 'arrow-up'
                : 'remove'
            }
            size={14}
            color={analysis.recentChangeKg <= 0 ? colors.success : colors.warning}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.trendText, { color: colors.textSecondary }]}>
            {analysis.recentChangeKg > 0 ? `+${analysis.recentChangeKg}` : analysis.recentChangeKg} kg since last entry
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADII.xl,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
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
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: RADII.md,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: SPACING.xs,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  verticalDivider: {
    width: 1,
    height: 30,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  trendBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: RADII.md,
    marginTop: SPACING.sm,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
