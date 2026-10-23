export * from './bmr';
export * from './tdee';
export * from './targets';
export * from './macros';
export * from './bmi';
export * from './portions';

import { calculateBMR } from './bmr';
import { calculateTDEE } from './tdee';
import { calculateGoalCalorieTarget } from './targets';
import { calculateMacros, DEFAULT_MACRO_RATIOS } from './macros';
import { calculateBMI } from './bmi';
import { CalorieCalculationResult, UserProfile, SexEquation, ActivityLevel, GoalType } from '../types/profile';

/**
 * Convenience orchestrator that runs the entire calculation pipeline for a user profile.
 */
export function calculateAllProfileTargets(
  profile: {
    currentWeightKg: number;
    targetWeightKg?: number;
    heightCm: number;
    age: number;
    sexEquation: SexEquation;
    activityLevel: ActivityLevel;
    goalType: GoalType;
    calorieTargetCustom?: number | null;
    proteinRatio?: number;
    carbsRatio?: number;
    fatRatio?: number;
  }
): CalorieCalculationResult {
  const weightKg = profile.currentWeightKg || (profile as any).weightKg || 70;
  const bmrResult = calculateBMR({
    weightKg,
    heightCm: profile.heightCm,
    ageYears: profile.age,
    sexEquation: profile.sexEquation,
  });

  const tdee = calculateTDEE(bmrResult.bmr, profile.activityLevel);

  let targetCalories: number;
  let deficitOrSurplus = 0;
  let safetyFlags: string[] = [];
  let disclaimers = [bmrResult.notes];

  if (profile.calorieTargetCustom && profile.calorieTargetCustom > 0) {
    targetCalories = profile.calorieTargetCustom;
    deficitOrSurplus = targetCalories - tdee;
    if (
      profile.sexEquation === 'male' && targetCalories < 1500 ||
      profile.sexEquation === 'female' && targetCalories < 1200
    ) {
      safetyFlags.push(
        'Custom calorie target is below the conventional safe physiological floor.'
      );
    }
  } else {
    const targetResult = calculateGoalCalorieTarget({
      tdee,
      goalType: profile.goalType,
      sexEquation: profile.sexEquation,
    });
    targetCalories = targetResult.targetCalories;
    deficitOrSurplus = targetResult.adjustmentKcal;
    safetyFlags = targetResult.safetyFlags;
    disclaimers.push(...targetResult.disclaimers);
  }

  const macroRatios = {
    proteinPercent: profile.proteinRatio ? Math.round(profile.proteinRatio * 100) : DEFAULT_MACRO_RATIOS.proteinPercent,
    carbsPercent: profile.carbsRatio ? Math.round(profile.carbsRatio * 100) : DEFAULT_MACRO_RATIOS.carbsPercent,
    fatPercent: profile.fatRatio ? Math.round(profile.fatRatio * 100) : DEFAULT_MACRO_RATIOS.fatPercent,
  };

  const macroTargets = calculateMacros(targetCalories, macroRatios);
  const bmiResult = calculateBMI(weightKg, profile.heightCm);

  return {
    bmr: bmrResult.bmr,
    tdee,
    targetCalories,
    deficitOrSurplus,
    macroTargets,
    macroRatios,
    bmi: bmiResult.bmi,
    bmiCategory: bmiResult.category,
    healthyWeightRangeKg: bmiResult.referenceWeightRangeKg,
    safetyFlags,
    disclaimers,
  };
}
