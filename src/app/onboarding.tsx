import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAppData } from '../context/AppDataContext';
import { SexEquation, ActivityLevel, GoalType } from '../types/profile';
import { ACTIVITY_DESCRIPTIONS } from '../calculations/tdee';
import { calculateAllProfileTargets } from '../calculations';
import { validateProfileInput } from '../utils/validation';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { SPACING, RADII } from '../constants/theme';

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { saveProfile, updateSettings } = useAppData();

  const [age, setAge] = useState('28');
  const [sexEquation, setSexEquation] = useState<SexEquation>('male');
  const [heightCm, setHeightCm] = useState('175');
  const [currentWeightKg, setCurrentWeightKg] = useState('75');
  const [targetWeightKg, setTargetWeightKg] = useState('70');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [goalType, setGoalType] = useState<GoalType>('lose');
  const [targetDate, setTargetDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live calculation preview
  const livePreview = useMemo(() => {
    try {
      const a = Number(age);
      const h = Number(heightCm);
      const w = Number(currentWeightKg);
      if (a >= 10 && a <= 120 && h >= 50 && h <= 260 && w >= 20 && w <= 400) {
        return calculateAllProfileTargets({
          age: a,
          sexEquation,
          heightCm: h,
          currentWeightKg: w,
          targetWeightKg: Number(targetWeightKg) || w,
          activityLevel,
          goalType,
        });
      }
    } catch (e) {
      // Incomplete inputs
    }
    return null;
  }, [age, sexEquation, heightCm, currentWeightKg, targetWeightKg, activityLevel, goalType]);

  const handleComplete = async () => {
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
      Alert.alert('Incomplete Profile', 'Please review the highlighted fields to continue.');
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await saveProfile({
        age: Number(age),
        sexEquation,
        heightCm: Number(heightCm),
        currentWeightKg: Number(currentWeightKg),
        targetWeightKg: Number(targetWeightKg),
        activityLevel,
        goalType,
        calorieTargetCustom: null,
        targetDate: targetDate.trim() || null,
      });

      await updateSettings({ onboardingCompleted: true });

      // Navigate to dashboard
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.appLogo}
              resizeMode="contain"
            />
            <Text style={[styles.appTitle, { color: colors.text }]}>Welcome to CalcLog</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Local-first personal calorie and fitness tracker. No accounts, no cloud database, 100% private on your device.
            </Text>
          </View>

          {/* Biometrics Form */}
          <Card>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Biometric Baseline</Text>
            <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
              Required by the Mifflin–St Jeor equation to estimate resting metabolic rate.
            </Text>

            {/* Sex selection */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Biological Equation Baseline
            </Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                onPress={() => setSexEquation('male')}
                style={[
                  styles.toggleBtn,
                  { borderColor: colors.cardBorder, backgroundColor: colors.inputBg },
                  sexEquation === 'male' && {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                ]}
              >
                <Ionicons
                  name="male"
                  size={16}
                  color={sexEquation === 'male' ? '#FFFFFF' : colors.textSecondary}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.toggleBtnText,
                    { color: sexEquation === 'male' ? '#FFFFFF' : colors.text },
                  ]}
                >
                  Male Equation (+5)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSexEquation('female')}
                style={[
                  styles.toggleBtn,
                  { borderColor: colors.cardBorder, backgroundColor: colors.inputBg },
                  sexEquation === 'female' && {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                ]}
              >
                <Ionicons
                  name="female"
                  size={16}
                  color={sexEquation === 'female' ? '#FFFFFF' : colors.textSecondary}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.toggleBtnText,
                    { color: sexEquation === 'female' ? '#FFFFFF' : colors.text },
                  ]}
                >
                  Female Equation (-161)
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.fieldNote, { color: colors.textMuted }]}>
              Used exclusively for the BMR thermodynamic constant.
            </Text>

            {/* Age, Height, Weight Row */}
            <View style={styles.inputsGrid}>
              <View style={styles.gridCol}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Age</Text>
                <TextInput
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  placeholder="28"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: errors.age ? colors.danger : colors.inputBorder,
                      color: colors.text,
                    },
                  ]}
                />
                {errors.age && <Text style={[styles.errorText, { color: colors.danger }]}>{errors.age}</Text>}
              </View>

              <View style={styles.gridCol}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Height (cm)</Text>
                <TextInput
                  value={heightCm}
                  onChangeText={setHeightCm}
                  keyboardType="numeric"
                  placeholder="175"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: errors.heightCm ? colors.danger : colors.inputBorder,
                      color: colors.text,
                    },
                  ]}
                />
                {errors.heightCm && (
                  <Text style={[styles.errorText, { color: colors.danger }]}>{errors.heightCm}</Text>
                )}
              </View>

              <View style={styles.gridCol}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Weight (kg)</Text>
                <TextInput
                  value={currentWeightKg}
                  onChangeText={setCurrentWeightKg}
                  keyboardType="decimal-pad"
                  placeholder="75"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: errors.currentWeightKg ? colors.danger : colors.inputBorder,
                      color: colors.text,
                    },
                  ]}
                />
                {errors.currentWeightKg && (
                  <Text style={[styles.errorText, { color: colors.danger }]}>{errors.currentWeightKg}</Text>
                )}
              </View>
            </View>
          </Card>

          {/* Goal & Target Weight */}
          <Card>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Your Fitness Goal</Text>
            <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
              Determines your daily caloric adjustment.
            </Text>

            <View style={styles.goalRow}>
              {(['lose', 'maintain', 'gain'] as GoalType[]).map((g) => {
                const isSelected = goalType === g;
                const label = g === 'lose' ? 'Lose Weight' : g === 'maintain' ? 'Maintain' : 'Gain Weight';
                const iconName = g === 'lose' ? 'trending-down' : g === 'maintain' ? 'pause' : 'trending-up';

                return (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setGoalType(g)}
                    style={[
                      styles.goalCard,
                      { backgroundColor: colors.inputBg, borderColor: colors.cardBorder },
                      isSelected && {
                        borderColor: colors.primary,
                        backgroundColor: colors.primaryLight + '25',
                      },
                    ]}
                  >
                    <Ionicons
                      name={iconName as any}
                      size={20}
                      color={isSelected ? colors.primary : colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.goalText,
                        { color: isSelected ? colors.primary : colors.text },
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.targetWeightWrap}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Target Weight (kg)
              </Text>
              <TextInput
                value={targetWeightKg}
                onChangeText={setTargetWeightKg}
                keyboardType="decimal-pad"
                placeholder="70"
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: errors.targetWeightKg ? colors.danger : colors.inputBorder,
                    color: colors.text,
                  },
                ]}
              />
              {errors.targetWeightKg && (
                <Text style={[styles.errorText, { color: colors.danger }]}>{errors.targetWeightKg}</Text>
              )}
            </View>
          </Card>

          {/* Activity Level Selection */}
          <Card>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>3. Daily Activity Level</Text>
            <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
              Multiplies BMR to calculate Total Daily Energy Expenditure (TDEE).
            </Text>

            {(Object.keys(ACTIVITY_DESCRIPTIONS) as ActivityLevel[]).map((level) => {
              const item = ACTIVITY_DESCRIPTIONS[level];
              const isSelected = activityLevel === level;

              return (
                <TouchableOpacity
                  key={level}
                  onPress={() => setActivityLevel(level)}
                  style={[
                    styles.activityOption,
                    { backgroundColor: colors.inputBg, borderColor: colors.cardBorder },
                    isSelected && {
                      borderColor: colors.primary,
                      backgroundColor: colors.primaryLight + '25',
                    },
                  ]}
                >
                  <View style={styles.activityLeft}>
                    <View style={styles.activityHeader}>
                      <Text style={[styles.activityLabel, { color: colors.text }]}>
                        {item.label}
                      </Text>
                      <Text style={[styles.multiplierBadge, { color: colors.primary }]}>
                        ×{item.multiplier}
                      </Text>
                    </View>
                    <Text style={[styles.activityDesc, { color: colors.textSecondary }]}>
                      {item.description}
                    </Text>
                  </View>
                  <Ionicons
                    name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                    size={22}
                    color={isSelected ? colors.primary : colors.textMuted}
                  />
                </TouchableOpacity>
              );
            })}
          </Card>

          {/* Live Preview Card */}
          {livePreview && (
            <Card style={{ borderColor: colors.primary, borderWidth: 1.5 }}>
              <View style={styles.previewHeader}>
                <Ionicons name="sparkles" size={18} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.previewTitle, { color: colors.primary }]}>
                  Personalized Target Preview
                </Text>
              </View>

              <View style={styles.previewStats}>
                <View style={styles.previewStat}>
                  <Text style={[styles.previewNum, { color: colors.text }]}>
                    {livePreview.bmr.toLocaleString()}
                  </Text>
                  <Text style={[styles.previewSub, { color: colors.textMuted }]}>BMR (kcal)</Text>
                </View>

                <View style={styles.previewStat}>
                  <Text style={[styles.previewNum, { color: colors.text }]}>
                    {livePreview.tdee.toLocaleString()}
                  </Text>
                  <Text style={[styles.previewSub, { color: colors.textMuted }]}>TDEE (kcal)</Text>
                </View>

                <View style={styles.previewStat}>
                  <Text style={[styles.previewNum, { color: colors.calories }]}>
                    {livePreview.targetCalories.toLocaleString()}
                  </Text>
                  <Text style={[styles.previewSub, { color: colors.primary }]}>Daily Target</Text>
                </View>
              </View>

              <Text style={[styles.previewMacros, { color: colors.textSecondary }]}>
                Daily Macros: {livePreview.macroTargets.proteinGrams}g Protein •{' '}
                {livePreview.macroTargets.carbsGrams}g Carbs • {livePreview.macroTargets.fatGrams}g Fat
              </Text>

              {livePreview.safetyFlags.length > 0 && (
                <View style={[styles.flagBanner, { backgroundColor: '#F59E0B20' }]}>
                  <Ionicons name="alert-circle" size={16} color={colors.warning} style={{ marginRight: 6 }} />
                  <Text style={[styles.flagText, { color: colors.warning }]}>
                    {livePreview.safetyFlags[0]}
                  </Text>
                </View>
              )}
            </Card>
          )}

          {/* Submit Action */}
          <Button
            title="Create Local Profile & Start"
            onPress={handleComplete}
            loading={isSubmitting}
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  appLogo: {
    width: 76,
    height: 76,
    borderRadius: 18,
    marginBottom: SPACING.sm,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
    maxWidth: 320,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  sectionHint: {
    fontSize: 12,
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: 4,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADII.md,
    borderWidth: 1,
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  fieldNote: {
    fontSize: 11,
    marginTop: 4,
    marginBottom: SPACING.md,
  },
  inputsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  gridCol: {
    flex: 1,
  },
  input: {
    height: 46,
    borderRadius: RADII.md,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  goalRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  goalCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: RADII.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  goalText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  targetWeightWrap: {
    marginTop: SPACING.xs,
  },
  activityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: RADII.lg,
    borderWidth: 1.5,
    marginBottom: SPACING.sm,
  },
  activityLeft: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  activityLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  multiplierBadge: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  activityDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  previewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.sm,
  },
  previewStat: {
    alignItems: 'center',
  },
  previewNum: {
    fontSize: 22,
    fontWeight: '800',
  },
  previewSub: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  previewMacros: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  flagBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: RADII.md,
    marginTop: SPACING.sm,
  },
  flagText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  submitBtn: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.xxl,
  },
});
