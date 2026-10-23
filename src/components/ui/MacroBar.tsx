import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { SPACING, RADII } from '../../constants/theme';

interface MacroItemProps {
  label: string;
  consumed: number;
  target: number;
  color: string;
}

const MacroItem: React.FC<MacroItemProps> = ({ label, consumed, target, color }) => {
  const { colors } = useTheme();
  const safeTarget = Math.max(1, target || 1);
  const ratio = Math.min(1.0, (consumed || 0) / safeTarget);

  return (
    <View style={styles.macroCol}>
      <View style={styles.headerRow}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      </View>
      <Text style={[styles.amount, { color: colors.text }]}>
        {Math.round(consumed)}
        <Text style={[styles.target, { color: colors.textMuted }]}> / {Math.round(safeTarget)}g</Text>
      </Text>
      <View style={[styles.track, { backgroundColor: colors.cardBorder }]}>
        <View
          style={[
            styles.fill,
            {
              backgroundColor: color,
              width: `${Math.round(ratio * 100)}%`,
            },
          ]}
        />
      </View>
    </View>
  );
};

interface MacroBarProps {
  proteinConsumed: number;
  proteinTarget: number;
  carbsConsumed: number;
  carbsTarget: number;
  fatConsumed: number;
  fatTarget: number;
}

export const MacroBar: React.FC<MacroBarProps> = ({
  proteinConsumed,
  proteinTarget,
  carbsConsumed,
  carbsTarget,
  fatConsumed,
  fatTarget,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <MacroItem
        label="Protein"
        consumed={proteinConsumed}
        target={proteinTarget}
        color={colors.protein}
      />
      <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />
      <MacroItem
        label="Carbs"
        consumed={carbsConsumed}
        target={carbsTarget}
        color={colors.carbs}
      />
      <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />
      <MacroItem
        label="Fat"
        consumed={fatConsumed}
        target={fatTarget}
        color={colors.fat}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: RADII.lg,
    borderWidth: 1,
    marginVertical: SPACING.sm,
  },
  macroCol: {
    flex: 1,
    paddingHorizontal: SPACING.xs,
  },
  divider: {
    width: 1,
    height: 42,
    marginHorizontal: SPACING.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  target: {
    fontSize: 12,
    fontWeight: '500',
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
