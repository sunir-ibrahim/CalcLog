export type SexEquation = 'male' | 'female';

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'very'
  | 'extra';

export type GoalType = 'lose' | 'maintain' | 'gain';

export interface UserProfile {
  id: number;
  age: number;
  sexEquation: SexEquation;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  activityLevel: ActivityLevel;
  goalType: GoalType;
  calorieTargetCustom?: number | null;
  targetDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MacroDistribution {
  proteinPercent: number; // e.g. 30
  carbsPercent: number;   // e.g. 40
  fatPercent: number;     // e.g. 30
}

export interface MacroTargetsGrams {
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

export interface CalorieCalculationResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  deficitOrSurplus: number;
  macroTargets: MacroTargetsGrams;
  macroRatios: MacroDistribution;
  bmi: number;
  bmiCategory: string;
  healthyWeightRangeKg: [number, number];
  safetyFlags: string[];
  disclaimers: string[];
}
