import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { calculateStepProgress } from '../../database/repositories/stepRepo';
import { SPACING, RADII } from '../../constants/theme';

interface StepProgressCardProps {
  steps: number;
  goal: number;
  onUpdatePress: () => void;
}

export const StepProgressCard: React.FC<StepProgressCardProps> = ({
  steps,
  goal,
  onUpdatePress,
}) => {
  const { colors } = useTheme();
  const progress = calculateStepProgress(steps, goal);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.topRow}>
        <View style={styles.titleRow}>
          <View style={[styles.iconWrap, { backgroundColor: '#8B5CF620' }]}>
            <Ionicons name="footsteps" size={18} color={colors.steps} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Daily Steps</Text>
        </View>

        <TouchableOpacity
          onPress={onUpdatePress}
          style={[styles.actionBtn, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}
        >
          <Ionicons name="create-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
          <Text style={[styles.actionBtnText, { color: colors.primary }]}>Update</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View>
          <Text style={[styles.stepsValue, { color: colors.text }]}>
            {progress.stepsCompleted.toLocaleString()}
          </Text>
          <Text style={[styles.goalSubtext, { color: colors.textSecondary }]}>
            Goal: {progress.stepGoal.toLocaleString()} steps ({progress.percentage}%)
          </Text>
        </View>

        {progress.isGoalReached ? (
          <View style={[styles.badge, { backgroundColor: '#10B98120' }]}>
            <Text style={[styles.badgeText, { color: colors.success }]}>Goal Reached! 🌟</Text>
          </View>
        ) : (
          <Text style={[styles.remainingText, { color: colors.textMuted }]}>
            {progress.stepsRemaining.toLocaleString()} remaining
          </Text>
        )}
      </View>

      {/* Progress track */}
      <View style={[styles.track, { backgroundColor: colors.cardBorder }]}>
        <View
          style={[
            styles.fill,
            {
              backgroundColor: progress.isGoalReached ? colors.success : colors.steps,
              width: `${Math.round(progress.visualProgress * 100)}%`,
            },
          ]}
        />
      </View>
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
    marginBottom: SPACING.sm,
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
  statsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  stepsValue: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  goalSubtext: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: RADII.md,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  remainingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
