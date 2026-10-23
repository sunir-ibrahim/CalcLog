import { ActivityLevel } from '../types/profile';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,     // Little to no exercise, typical desk job
  light: 1.375,       // Light exercise or sports 1–3 days/week
  moderate: 1.55,     // Moderate exercise or sports 3–5 days/week
  very: 1.725,        // Hard exercise or sports 6–7 days/week
  extra: 1.9,         // Very hard exercise, physical job, or twice-a-day training
};

export const ACTIVITY_DESCRIPTIONS: Record<
  ActivityLevel,
  { label: string; multiplier: number; description: string }
> = {
  sedentary: {
    label: 'Sedentary',
    multiplier: 1.2,
    description: 'Little or no regular exercise, predominantly desk-bound work.',
  },
  light: {
    label: 'Lightly Active',
    multiplier: 1.375,
    description: 'Light exercise or active hobbies 1 to 3 days per week.',
  },
  moderate: {
    label: 'Moderately Active',
    multiplier: 1.55,
    description: 'Moderate exercise or sports 3 to 5 days per week.',
  },
  very: {
    label: 'Very Active',
    multiplier: 1.725,
    description: 'Intense exercise or sports 6 to 7 days per week.',
  },
  extra: {
    label: 'Extra Active',
    multiplier: 1.9,
    description: 'Very heavy physical training, athletics, or physically demanding labour.',
  },
};

/**
 * Calculates Total Daily Energy Expenditure (TDEE).
 * Multipliers are population approximations, not direct calorimetry measurements.
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  if (bmr <= 0) {
    throw new Error('BMR must be positive to calculate TDEE.');
  }

  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel];
  if (!multiplier) {
    throw new Error(`Invalid activity level: ${activityLevel}`);
  }

  return Math.round(bmr * multiplier);
}
