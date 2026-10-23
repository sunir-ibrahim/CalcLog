import { GoalType, SexEquation } from '../types/profile';

export interface TargetCalculationInput {
  tdee: number;
  goalType: GoalType;
  sexEquation: SexEquation;
  customDeficitOrSurplus?: number; // Optional user override
}

export interface TargetCalculationOutput {
  targetCalories: number;
  adjustmentKcal: number;
  safetyFlags: string[];
  disclaimers: string[];
}

// Recommended conservative caloric offsets
export const DEFAULT_DEFICIT_KCAL = 500;  // Aiming for steady ~0.45 kg loss/week
export const DEFAULT_SURPLUS_KCAL = 350;  // Aiming for lean mass accumulation

// Physiological floor thresholds (standard health guidance)
export const MIN_CALORIES_FEMALE = 1200;
export const MIN_CALORIES_MALE = 1500;

/**
 * Calculates daily calorie intake target according to goal.
 * Incorporates safety minimums and flags extreme deviations.
 */
export function calculateGoalCalorieTarget(
  input: TargetCalculationInput
): TargetCalculationOutput {
  const { tdee, goalType, sexEquation, customDeficitOrSurplus } = input;

  if (tdee <= 0) {
    throw new Error('TDEE must be a positive number.');
  }

  let adjustmentKcal = 0;
  const safetyFlags: string[] = [];
  const disclaimers: string[] = [
    'Calorie targets are estimates based on standard metabolic formulas. Individual responses vary with metabolic rate, body composition, and adherence.',
  ];

  if (goalType === 'maintain') {
    adjustmentKcal = 0;
  } else if (goalType === 'lose') {
    adjustmentKcal = -(customDeficitOrSurplus !== undefined
      ? Math.abs(customDeficitOrSurplus)
      : DEFAULT_DEFICIT_KCAL);
  } else if (goalType === 'gain') {
    adjustmentKcal = +(customDeficitOrSurplus !== undefined
      ? Math.abs(customDeficitOrSurplus)
      : DEFAULT_SURPLUS_KCAL);
  }

  let calculatedTarget = Math.round(tdee + adjustmentKcal);

  // Safety floor check
  const floorThreshold = sexEquation === 'male' ? MIN_CALORIES_MALE : MIN_CALORIES_FEMALE;

  if (goalType === 'lose' && calculatedTarget < floorThreshold) {
    safetyFlags.push(
      `Calculated target (${calculatedTarget} kcal) is below the generally recommended minimum threshold of ${floorThreshold} kcal/day for this biological profile. We have adjusted the minimum target to ${floorThreshold} kcal to protect essential micronutrient adequacy. Consult a healthcare professional or registered dietitian for personalized deficit planning.`
    );
    calculatedTarget = floorThreshold;
  }

  // Large deficit or surplus flags
  if (Math.abs(adjustmentKcal) > 1000) {
    safetyFlags.push(
      'An adjustment greater than 1,000 kcal/day is aggressive and generally not advised without direct medical supervision.'
    );
  }

  return {
    targetCalories: calculatedTarget,
    adjustmentKcal,
    safetyFlags,
    disclaimers,
  };
}
