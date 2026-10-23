import { SexEquation } from '../types/profile';

export interface BmrInput {
  weightKg: number;
  heightCm: number;
  ageYears: number;
  sexEquation: SexEquation;
}

export interface BmrResult {
  bmr: number;
  formula: string;
  notes: string;
}

/**
 * Calculates Basal Metabolic Rate (BMR) using the Mifflin–St Jeor Equation.
 *
 * Male equation:
 *   BMR = 10 * weight_kg + 6.25 * height_cm - 5 * age_years + 5
 *
 * Female equation:
 *   BMR = 10 * weight_kg + 6.25 * height_cm - 5 * age_years - 161
 *
 * Limitations:
 * - Mifflin-St Jeor estimates resting energy expenditure based on total body mass.
 * - It does not measure lean body mass directly (e.g. muscular athletes may have higher BMR).
 * - Not intended as clinical advice for metabolic or endocrine conditions.
 */
export function calculateBMR(input: BmrInput): BmrResult {
  const { weightKg, heightCm, ageYears, sexEquation } = input;

  if (weightKg <= 0 || heightCm <= 0 || ageYears <= 0) {
    throw new Error('Weight, height, and age must be strictly positive numbers.');
  }

  if (weightKg < 20 || weightKg > 400) {
    throw new Error('Weight must be within a realistic physiological range (20–400 kg).');
  }

  if (heightCm < 50 || heightCm > 260) {
    throw new Error('Height must be within a realistic physiological range (50–260 cm).');
  }

  if (ageYears < 10 || ageYears > 120) {
    throw new Error('Age must be between 10 and 120 years.');
  }

  let bmr: number;
  if (sexEquation === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161;
  }

  // Round to nearest integer for practical calorie reporting
  const roundedBmr = Math.round(bmr);

  return {
    bmr: roundedBmr,
    formula: 'Mifflin–St Jeor',
    notes:
      'BMR is an estimate of energy consumed at complete rest. Actual metabolic rates vary based on lean muscle mass, genetics, and health conditions.',
  };
}
