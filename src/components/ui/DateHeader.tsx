import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { formatDisplayDate, addDaysToDate, isToday, getTodayDateString } from '../../utils/dateUtils';
import { SPACING, RADII } from '../../constants/theme';

interface DateHeaderProps {
  currentDate: string;
  onDateChange: (newDate: string) => void;
}

export const DateHeader: React.FC<DateHeaderProps> = ({ currentDate, onDateChange }) => {
  const { colors } = useTheme();

  const handlePrevDay = () => {
    onDateChange(addDaysToDate(currentDate, -1));
  };

  const handleNextDay = () => {
    onDateChange(addDaysToDate(currentDate, 1));
  };

  const handleJumpToToday = () => {
    onDateChange(getTodayDateString());
  };

  const today = isToday(currentDate);

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <TouchableOpacity
        onPress={handlePrevDay}
        style={[styles.arrowButton, { backgroundColor: colors.inputBg }]}
        accessibilityLabel="Previous day"
      >
        <Ionicons name="chevron-back" size={20} color={colors.text} />
      </TouchableOpacity>

      <TouchableOpacity onPress={handleJumpToToday} style={styles.centerSection}>
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={[styles.dateText, { color: colors.text }]}>
            {formatDisplayDate(currentDate)}
          </Text>
        </View>
        {!today && (
          <Text style={[styles.todayHint, { color: colors.primary }]}>Tap for Today</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleNextDay}
        style={[styles.arrowButton, { backgroundColor: colors.inputBg }]}
        accessibilityLabel="Next day"
      >
        <Ionicons name="chevron-forward" size={20} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADII.lg,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  arrowButton: {
    width: 38,
    height: 38,
    borderRadius: RADII.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
  },
  todayHint: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});
