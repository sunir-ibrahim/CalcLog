import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAppData } from '../../context/AppDataContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ActivityLevel, GoalType, SexEquation } from '../../types/profile';
import { ACTIVITY_DESCRIPTIONS } from '../../calculations/tdee';
import { validateProfileInput } from '../../utils/validation';
import { SPACING, RADII } from '../../constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, themePreference, setThemePreference } = useTheme();
  const {
    profile,
    settings,
    targets,
    saveProfile,
    updateSettings,
  } = useAppData();

  const [age, setAge] = useState('');
  const [sexEquation, setSexEquation] = useState<SexEquation>('male');
  const [heightCm, setHeightCm] = useState('');
  const [currentWeightKg, setCurrentWeightKg] = useState('');
  const [targetWeightKg, setTargetWeightKg] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [goalType, setGoalType] = useState<GoalType>('lose');
  const [stepGoal, setStepGoal] = useState('8000');
  const [customCalories, setCustomCalories] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setAge(String(profile.age));
      setSexEquation(profile.sexEquation);
      setHeightCm(String(profile.heightCm));
      setCurrentWeightKg(String(profile.currentWeightKg));
      setTargetWeightKg(String(profile.targetWeightKg));
      setActivityLevel(profile.activityLevel);
      setGoalType(profile.goalType);
      if (profile.calorieTargetCustom) {
        setCustomCalories(String(profile.calorieTargetCustom));
      }
    }
    if (settings) {
      setStepGoal(String(settings.defaultStepGoal));
    }
  }, [profile, settings]);

  const handleSave = async () => {
    const val = validateProfileInput({
      age,
      sexEquation,
      heightCm,
      currentWeightKg,
      targetWeightKg,
      activityLevel,
      goalType,
    });

    if (!val.isValid) {
      setErrors(val.errors);
      Alert.alert('Invalid Input', 'Please fix the highlighted fields.');
      return;
    }

    setErrors({});
    setIsSaving(true);

    try {
      const parsedCustomCal = customCalories.trim() ? Number(customCalories) : null;
      await saveProfile({
        age: Number(age),
        sexEquation,
        heightCm: Number(heightCm),
        currentWeightKg: Number(currentWeightKg),
        targetWeightKg: Number(targetWeightKg),
        activityLevel,
        goalType,
        calorieTargetCustom: parsedCustomCal && parsedCustomCal > 0 ? parsedCustomCal : null,
      });

      const parsedStepGoal = Number(stepGoal);
      if (parsedStepGoal > 0 && parsedStepGoal <= 150000) {
        await updateSettings({ defaultStepGoal: parsedStepGoal });
      }

      Alert.alert('Saved', 'Profile and target metrics updated successfully.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.screenTitle, { color: colors.text }]}>Settings & Profile</Text>

        {/* Current Target Overview */}
        {targets && (
          <Card style={{ borderColor: colors.primary, borderWidth: 1 }}>
            <View style={styles.targetsHeader}>
              <Ionicons name="calculator-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.targetsTitle, { color: colors.primary }]}>Active Recommendations</Text>
            </View>
            <View style={styles.targetMetricsRow}>
              <View style={styles.targetMetric}>
                <Text style={[styles.targetVal, { color: colors.text }]}>{targets.bmr}</Text>
                <Text style={[styles.targetSub, { color: colors.textMuted }]}>BMR kcal</Text>
              </View>
              <View style={styles.targetMetric}>
                <Text style={[styles.targetVal, { color: colors.text }]}>{targets.tdee}</Text>
                <Text style={[styles.targetSub, { color: colors.textMuted }]}>TDEE kcal</Text>
              </View>
              <View style={styles.targetMetric}>
                <Text style={[styles.targetVal, { color: colors.calories }]}>{targets.targetCalories}</Text>
                <Text style={[styles.targetSub, { color: colors.primary }]}>Daily Target</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Biometric Baseline */}
        <Card>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Biometrics</Text>

          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            Equation Biological Baseline
          </Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              onPress={() => setSexEquation('male')}
              style={[
                styles.toggleBtn,
                { backgroundColor: colors.inputBg, borderColor: colors.cardBorder },
                sexEquation === 'male' && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  { color: sexEquation === 'male' ? '#FFFFFF' : colors.text },
                ]}
              >
                Male (+5)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSexEquation('female')}
              style={[
                styles.toggleBtn,
                { backgroundColor: colors.inputBg, borderColor: colors.cardBorder },
                sexEquation === 'female' && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  { color: sexEquation === 'female' ? '#FFFFFF' : colors.text },
                ]}
              >
                Female (-161)
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputsGrid}>
            <View style={styles.gridCol}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Age</Text>
              <TextInput
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                style={[
                  styles.input,
                  { backgroundColor: colors.inputBg, borderColor: errors.age ? colors.danger : colors.inputBorder, color: colors.text },
                ]}
              />
              {errors.age && <Text style={[styles.errorText, { color: colors.danger }]}>{errors.age}</Text>}
            </View>

            <View style={styles.gridCol}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Height (cm)</Text>
              <TextInput
                value={heightCm}
                onChangeText={setHeightCm}
                keyboardType="numeric"
                style={[
                  styles.input,
                  { backgroundColor: colors.inputBg, borderColor: errors.heightCm ? colors.danger : colors.inputBorder, color: colors.text },
                ]}
              />
              {errors.heightCm && <Text style={[styles.errorText, { color: colors.danger }]}>{errors.heightCm}</Text>}
            </View>

            <View style={styles.gridCol}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Weight (kg)</Text>
              <TextInput
                value={currentWeightKg}
                onChangeText={setCurrentWeightKg}
                keyboardType="decimal-pad"
                style={[
                  styles.input,
                  { backgroundColor: colors.inputBg, borderColor: errors.currentWeightKg ? colors.danger : colors.inputBorder, color: colors.text },
                ]}
              />
              {errors.currentWeightKg && (
                <Text style={[styles.errorText, { color: colors.danger }]}>{errors.currentWeightKg}</Text>
              )}
            </View>
          </View>
        </Card>

        {/* Goals & Activity */}
        <Card>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Goals & Targets</Text>

          <View style={styles.goalRow}>
            {(['lose', 'maintain', 'gain'] as GoalType[]).map((g) => {
              const isSelected = goalType === g;
              return (
                <TouchableOpacity
                  key={g}
                  onPress={() => setGoalType(g)}
                  style={[
                    styles.goalBtn,
                    { backgroundColor: colors.inputBg, borderColor: colors.cardBorder },
                    isSelected && { borderColor: colors.primary, backgroundColor: colors.primaryLight + '25' },
                  ]}
                >
                  <Text
                    style={[
                      styles.goalBtnText,
                      { color: isSelected ? colors.primary : colors.text },
                    ]}
                  >
                    {g === 'lose' ? 'Lose' : g === 'maintain' ? 'Maintain' : 'Gain'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.twoInputsRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                Target Weight (kg)
              </Text>
              <TextInput
                value={targetWeightKg}
                onChangeText={setTargetWeightKg}
                keyboardType="decimal-pad"
                style={[
                  styles.input,
                  { backgroundColor: colors.inputBg, borderColor: errors.targetWeightKg ? colors.danger : colors.inputBorder, color: colors.text },
                ]}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                Daily Step Goal
              </Text>
              <TextInput
                value={stepGoal}
                onChangeText={setStepGoal}
                keyboardType="numeric"
                style={[
                  styles.input,
                  { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text },
                ]}
              />
            </View>
          </View>

          <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: SPACING.md }]}>
            Activity Level
          </Text>
          {(Object.keys(ACTIVITY_DESCRIPTIONS) as ActivityLevel[]).map((lvl) => {
            const isSelected = activityLevel === lvl;
            const item = ACTIVITY_DESCRIPTIONS[lvl];
            return (
              <TouchableOpacity
                key={lvl}
                onPress={() => setActivityLevel(lvl)}
                style={[
                  styles.activityRow,
                  { backgroundColor: colors.inputBg, borderColor: colors.cardBorder },
                  isSelected && { borderColor: colors.primary, backgroundColor: colors.primaryLight + '25' },
                ]}
              >
                <View>
                  <Text style={[styles.actLabel, { color: colors.text }]}>
                    {item.label} (×{item.multiplier})
                  </Text>
                  <Text style={[styles.actDesc, { color: colors.textMuted }]}>{item.description}</Text>
                </View>
                <Ionicons
                  name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={isSelected ? colors.primary : colors.textMuted}
                />
              </TouchableOpacity>
            );
          })}

          <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: SPACING.md }]}>
            Custom Calorie Target (Optional override)
          </Text>
          <TextInput
            value={customCalories}
            onChangeText={setCustomCalories}
            keyboardType="numeric"
            placeholder="Auto-calculated from formula"
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text },
            ]}
          />
        </Card>

        {/* Theme Preferences */}
        <Card>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Appearance</Text>
          <View style={styles.themeRow}>
            {(['system', 'light', 'dark'] as const).map((t) => {
              const isSelected = themePreference === t;
              return (
                <TouchableOpacity
                  key={t}
                  onPress={() => setThemePreference(t)}
                  style={[
                    styles.themeBtn,
                    { backgroundColor: colors.inputBg, borderColor: colors.cardBorder },
                    isSelected && { borderColor: colors.primary, backgroundColor: colors.primaryLight + '25' },
                  ]}
                >
                  <Ionicons
                    name={t === 'light' ? 'sunny' : t === 'dark' ? 'moon' : 'contrast'}
                    size={18}
                    color={isSelected ? colors.primary : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.themeText,
                      { color: isSelected ? colors.primary : colors.text },
                    ]}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Save Changes Button */}
        <Button
          title="Save Profile & Targets"
          onPress={handleSave}
          loading={isSaving}
          style={{ marginBottom: SPACING.md }}
        />

        {/* Local Data Management Link */}
        <TouchableOpacity
          onPress={() => router.push('/data-management')}
          style={[styles.mgmtBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
        >
          <View style={styles.mgmtLeft}>
            <Ionicons name="server-outline" size={20} color={colors.primary} style={{ marginRight: SPACING.sm }} />
            <View>
              <Text style={[styles.mgmtTitle, { color: colors.text }]}>Data Management</Text>
              <Text style={[styles.mgmtSub, { color: colors.textMuted }]}>
                Export backup, import data, or wipe local database
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Privacy & Zero-Cloud Guarantee */}
        <Card style={styles.privacyCard}>
          <View style={styles.privacyHeader}>
            <Ionicons name="shield-checkmark" size={20} color={colors.success} style={{ marginRight: 6 }} />
            <Text style={[styles.privacyTitle, { color: colors.text }]}>100% Local-First & Private</Text>
          </View>
          <Text style={[styles.privacyText, { color: colors.textSecondary }]}>
            CalcLog does not require accounts or logins and maintains no backend servers or cloud databases. All biometric data, food entries, step counts, and weight logs are securely saved directly in SQLite on your physical device.
          </Text>
        </Card>

        {/* App Branding Footer */}
        <View style={styles.appFooter}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.footerLogo}
            resizeMode="contain"
          />
          <Text style={[styles.footerAppName, { color: colors.text }]}>CalcLog</Text>
          <Text style={[styles.footerAppSub, { color: colors.textMuted }]}>
            Version 1.0.0 • 100% Offline & Local-First
          </Text>
        </View>
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
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: SPACING.md,
  },
  targetsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  targetsTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  targetMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.xs,
  },
  targetMetric: {
    alignItems: 'center',
  },
  targetVal: {
    fontSize: 20,
    fontWeight: '800',
  },
  targetSub: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: RADII.md,
    borderWidth: 1,
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  inputsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  gridCol: {
    flex: 1,
  },
  input: {
    height: 44,
    borderRadius: RADII.md,
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
    fontSize: 15,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 11,
    marginTop: 2,
  },
  goalRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  goalBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: RADII.md,
    borderWidth: 1,
  },
  goalBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  twoInputsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.sm,
    borderRadius: RADII.md,
    borderWidth: 1,
    marginBottom: 6,
  },
  actLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  actDesc: {
    fontSize: 11,
    marginTop: 1,
  },
  themeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  themeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADII.md,
    borderWidth: 1,
    gap: 6,
  },
  themeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  mgmtBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: RADII.xl,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  mgmtLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mgmtTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  mgmtSub: {
    fontSize: 12,
    marginTop: 1,
  },
  privacyCard: {
    marginTop: SPACING.xs,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  privacyText: {
    fontSize: 12,
    lineHeight: 18,
  },
  appFooter: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  footerLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginBottom: 6,
  },
  footerAppName: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  footerAppSub: {
    fontSize: 11,
    marginTop: 2,
  },
});
