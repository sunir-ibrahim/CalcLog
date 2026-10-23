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
import { SPACING, RADII } from '../constants/theme';

export default function WeightModal() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    selectedDate,
    setSelectedDate,
    latestWeight,
    recordWeight,
  } = useAppData();

  const [weightInput, setWeightInput] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (latestWeight) {
      setWeightInput(String(latestWeight.weightKg));
    }
  }, [latestWeight]);

  const handleSave = async () => {
    const val = Number(weightInput);
    if (isNaN(val) || val < 20 || val > 400) {
      Alert.alert('Validation Error', 'Weight must be between 20 and 400 kg.');
      return;
    }

    setIsSaving(true);
    try {
      await recordWeight(val, selectedDate, notes.trim() || undefined);
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to record weight.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Record Weight</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Date Selector */}
        <DateHeader currentDate={selectedDate} onDateChange={setSelectedDate} />

        <Card>
          <View style={styles.iconCircle}>
            <Ionicons name="scale-outline" size={32} color={colors.weight} />
          </View>

          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            Body Weight (kg)
          </Text>
          <TextInput
            value={weightInput}
            onChangeText={setWeightInput}
            keyboardType="decimal-pad"
            placeholder="e.g. 74.5"
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text },
            ]}
            autoFocus
          />

          <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: SPACING.md }]}>
            Measurement Notes (Optional)
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g. Morning weigh-in before breakfast"
            placeholderTextColor={colors.textMuted}
            style={[
              styles.notesInput,
              { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text },
            ]}
          />
        </Card>

        <Button
          title="Save Weight Measurement"
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
    backgroundColor: '#06B6D420',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  input: {
    height: 56,
    borderRadius: RADII.lg,
    borderWidth: 1.5,
    paddingHorizontal: SPACING.lg,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  notesInput: {
    height: 44,
    borderRadius: RADII.md,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    fontSize: 14,
  },
});
