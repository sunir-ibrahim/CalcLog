import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAppData } from '../../context/AppDataContext';
import { StepProgressCard } from '../../components/ui/StepProgressCard';
import { DateHeader } from '../../components/ui/DateHeader';
import { Card } from '../../components/ui/Card';
import { formatDisplayDate, formatDayOfWeek } from '../../utils/dateUtils';
import { calculateStepProgress } from '../../database/repositories/stepRepo';
import { SPACING, RADII } from '../../constants/theme';

export default function ActivityScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    selectedDate,
    setSelectedDate,
    dayActivity,
    settings,
    stepHistory,
  } = useAppData();

  const currentSteps = dayActivity?.steps || 0;
  const currentGoal = dayActivity?.stepGoal || settings.defaultStepGoal || 8000;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.topRow}>
          <Text style={[styles.screenTitle, { color: colors.text }]}>Step Activity</Text>
          <TouchableOpacity
            onPress={() => router.push('/step-modal')}
            style={[styles.addStepBtn, { backgroundColor: colors.steps }]}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.addStepText}>Update Steps</Text>
          </TouchableOpacity>
        </View>

        {/* Date Selector */}
        <DateHeader currentDate={selectedDate} onDateChange={setSelectedDate} />

        {/* Main Step Progress Card */}
        <StepProgressCard
          steps={currentSteps}
          goal={currentGoal}
          onUpdatePress={() => router.push('/step-modal')}
        />

        {/* Step History */}
        <Card>
          <View style={styles.historyHeader}>
            <View style={styles.historyTitleRow}>
              <Ionicons name="time-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.historyTitle, { color: colors.text }]}>Step History</Text>
            </View>
            <Text style={[styles.historyCount, { color: colors.textMuted }]}>
              Last {stepHistory.length} Days
            </Text>
          </View>

          {stepHistory.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                No past step records found. Start logging today's steps!
              </Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {stepHistory.map((item) => {
                const prog = calculateStepProgress(item.steps, item.stepGoal);
                const isCurrentSelected = item.activityDate === selectedDate;

                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => setSelectedDate(item.activityDate)}
                    style={[
                      styles.historyRow,
                      { borderBottomColor: colors.cardBorder },
                      isCurrentSelected && {
                        backgroundColor: colors.inputBg,
                        borderRadius: RADII.md,
                      },
                    ]}
                  >
                    <View style={styles.dateCol}>
                      <Text style={[styles.historyDate, { color: colors.text }]}>
                        {formatDisplayDate(item.activityDate)}
                      </Text>
                      <Text style={[styles.historyDay, { color: colors.textMuted }]}>
                        {formatDayOfWeek(item.activityDate)}
                      </Text>
                    </View>

                    {/* Progress Bar representation */}
                    <View style={styles.barCol}>
                      <View style={[styles.miniTrack, { backgroundColor: colors.cardBorder }]}>
                        <View
                          style={[
                            styles.miniFill,
                            {
                              width: `${Math.round(prog.visualProgress * 100)}%`,
                              backgroundColor: prog.isGoalReached ? colors.success : colors.steps,
                            },
                          ]}
                        />
                      </View>
                    </View>

                    <View style={styles.statsCol}>
                      <Text style={[styles.historySteps, { color: colors.text }]}>
                        {item.steps.toLocaleString()}
                      </Text>
                      <Text style={[styles.historyGoal, { color: colors.textMuted }]}>
                        {prog.percentage}%
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  addStepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADII.md,
  },
  addStepText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  historyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  historyCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyWrap: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  historyList: {
    marginTop: SPACING.xs,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: SPACING.xs,
    borderBottomWidth: 1,
  },
  dateCol: {
    width: 90,
  },
  historyDate: {
    fontSize: 13,
    fontWeight: '700',
  },
  historyDay: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  barCol: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
  },
  miniTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  miniFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsCol: {
    alignItems: 'flex-end',
    width: 65,
  },
  historySteps: {
    fontSize: 14,
    fontWeight: '700',
  },
  historyGoal: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
});
