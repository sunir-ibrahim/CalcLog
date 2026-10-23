import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAppData } from '../context/AppDataContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { DateHeader } from '../components/ui/DateHeader';
import { MAX_REASONABLE_DAILY_STEPS } from '../database/repositories/stepRepo';
import { SPACING, RADII } from '../constants/theme';

export default function StepModal() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    selectedDate,
    setSelectedDate,
    dayActivity,
    settings,
    recordSteps,
  } = useAppData();

  const [stepsInput, setStepsInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (dayActivity) {
      setStepsInput(String(dayActivity.steps));
    } else {
      setStepsInput('');
    }
  }, [dayActivity, selectedDate]);

  const handleSave = async () => {
    const trimmed = stepsInput.trim();
    if (!trimmed) {
      Alert.alert('Invalid Input', 'Please enter a step count.');
      return;
    }

    const steps = Number(trimmed);
    if (!Number.isInteger(steps) || steps < 0) {
      Alert.alert('Validation Error', 'Steps must be a non-negative whole number (e.g. 5000).');
      return;
    }

    if (steps > MAX_REASONABLE_DAILY_STEPS) {
      Alert.alert(
        'Validation Error',
        `Step count exceeds realistic maximum limit of ${MAX_REASONABLE_DAILY_STEPS.toLocaleString()} steps.`
      );
      return;
    }

    setIsSaving(true);
    try {
      await recordSteps(steps, selectedDate);
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update steps.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickAdd = (amount: number) => {
    const current = Number(stepsInput) || 0;
    const next = Math.max(0, current + amount);
    setStepsInput(String(next));
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Daily Steps</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Date Selector */}
        <DateHeader currentDate={selectedDate} onDateChange={setSelectedDate} />

        <Card>
          <View style={styles.iconCircle}>
            <Ionicons name="footsteps" size={32} color={colors.steps} />
          </View>

          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            Total Steps for Selected Date
          </Text>
          <TextInput
            value={stepsInput}
            onChangeText={setStepsInput}
            keyboardType="number-pad"
            placeholder="e.g. 8500"
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text },
            ]}
            autoFocus
          />

          <Text style={[styles.hint, { color: colors.textMuted }]}>
            Daily Goal: {(dayActivity?.stepGoal || settings.defaultStepGoal || 8000).toLocaleString()} steps. This entry represents your total for the day.
          </Text>

          {/* Quick preset increments */}
          <View style={styles.presetRow}>
            {[1000, 2500, 5000].map((delta) => (
              <TouchableOpacity
                key={delta}
                onPress={() => handleQuickAdd(delta)}
                style={[styles.presetChip, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}
              >
                <Text style={[styles.presetText, { color: colors.text }]}>+{delta.toLocaleString()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Button
          title="Save Step Total"
          onPress={handleSave}
          loading={isSaving}
          style={{ marginTop: SPACING.md }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: SPACING.lg,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#8B5CF620',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  input: {
    height: 56,
    borderRadius: RADII.lg,
    borderWidth: 1.5,
    paddingHorizontal: SPACING.lg,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  hint: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  presetChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: RADII.full,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
