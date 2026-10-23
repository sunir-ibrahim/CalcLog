import { ActivityLevel, GoalType, SexEquation } from '../types/profile';

export interface ProfileValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateProfileInput(input: {
  age: string | number;
  sexEquation: string;
  heightCm: string | number;
  currentWeightKg: string | number;
  targetWeightKg: string | number;
  activityLevel: string;
  goalType: string;
}): ProfileValidationResult {
  const errors: Record<string, string> = {};

  const age = Number(input.age);
  if (!input.age || isNaN(age)) {
    errors.age = 'Age is required.';
  } else if (age < 10 || age > 120) {
    errors.age = 'Age must be between 10 and 120 years.';
  }

  if (input.sexEquation !== 'male' && input.sexEquation !== 'female') {
    errors.sexEquation = 'Please select a sex biological equation baseline.';
  }

  const height = Number(input.heightCm);
  if (!input.heightCm || isNaN(height)) {
    errors.heightCm = 'Height in centimetres is required.';
  } else if (height < 50 || height > 260) {
    errors.heightCm = 'Height must be between 50 and 260 cm.';
  }

  const currentWeight = Number(input.currentWeightKg);
  if (!input.currentWeightKg || isNaN(currentWeight)) {
    errors.currentWeightKg = 'Current weight in kg is required.';
  } else if (currentWeight < 20 || currentWeight > 400) {
    errors.currentWeightKg = 'Weight must be between 20 and 400 kg.';
  }

  const targetWeight = Number(input.targetWeightKg);
  if (!input.targetWeightKg || isNaN(targetWeight)) {
    errors.targetWeightKg = 'Target weight in kg is required.';
  } else if (targetWeight < 20 || targetWeight > 400) {
    errors.targetWeightKg = 'Target weight must be between 20 and 400 kg.';
  }

  const validActivityLevels: ActivityLevel[] = [
    'sedentary',
    'light',
    'moderate',
    'very',
    'extra',
  ];
  if (!validActivityLevels.includes(input.activityLevel as ActivityLevel)) {
    errors.activityLevel = 'Please select a valid activity level.';
  }

  const validGoals: GoalType[] = ['lose', 'maintain', 'gain'];
  if (!validGoals.includes(input.goalType as GoalType)) {
    errors.goalType = 'Please select your primary fitness goal.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
