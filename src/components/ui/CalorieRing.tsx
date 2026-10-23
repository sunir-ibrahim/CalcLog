import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';

interface CalorieRingProps {
  target: number;
  consumed: number;
  size?: number;
  strokeWidth?: number;
}

export const CalorieRing: React.FC<CalorieRingProps> = ({
  target,
  consumed,
  size = 200,
  strokeWidth = 16,
}) => {
  const { colors } = useTheme();

  const safeTarget = Math.max(1, target || 2000);
  const safeConsumed = Math.max(0, consumed || 0);
  const remaining = safeTarget - safeConsumed;
  const isOver = remaining < 0;
  const overage = Math.abs(remaining);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate stroke dash offset
  const ratio = Math.min(1.0, safeConsumed / safeTarget);
  const strokeDashoffset = circumference - ratio * circumference;

  const ringColor = isOver ? colors.warning : colors.calories;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background track circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.cardBorder}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <View style={styles.content}>
        {isOver ? (
          <>
            <Text style={[styles.label, { color: colors.warning }]}>Target Exceeded</Text>
            <Text style={[styles.value, { color: colors.warning }]}>
              +{overage.toLocaleString()}
            </Text>
            <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
              kcal over target
            </Text>
          </>
        ) : (
          <>
            <Text style={[styles.value, { color: colors.text }]}>
              {remaining.toLocaleString()}
            </Text>
            <Text style={[styles.label, { color: colors.textSecondary }]}>kcal remaining</Text>
            <Text style={[styles.subLabel, { color: colors.textMuted }]}>
              {safeConsumed.toLocaleString()} / {safeTarget.toLocaleString()} eaten
            </Text>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  content: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 4,
  },
});
