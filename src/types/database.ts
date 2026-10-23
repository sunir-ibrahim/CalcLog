export interface DailyActivity {
  id: string;
  activityDate: string; // YYYY-MM-DD
  steps: number;
  stepGoal: number;
  createdAt: string;
  updatedAt: string;
}

export interface WeightEntry {
  id: string;
  weightKg: number;
  entryDate: string; // YYYY-MM-DD
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  id: number;
  theme: 'system' | 'light' | 'dark';
  calorieUnit: 'kcal' | 'kJ';
  weightUnit: 'kg' | 'lbs';
  defaultStepGoal: number;
  proteinRatio: number; // e.g. 0.30
  carbsRatio: number;   // e.g. 0.40
  fatRatio: number;     // e.g. 0.30
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BackupData {
  version: number;
  exportedAt: string;
  profile?: any | null;
  settings?: any | null;
  foodItems: any[];
  foodEntries: any[];
  savedMeals: any[];
  savedMealItems: any[];
  dailyActivities: any[];
  weightEntries: any[];
}
