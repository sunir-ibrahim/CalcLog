import { getDatabase } from '../db';
import { UserSettings } from '../../types/database';

export async function getSettings(): Promise<UserSettings> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM user_settings WHERE id = 1 LIMIT 1;'
  );

  if (!row) {
    // Return fallback defaults
    return {
      id: 1,
      theme: 'system',
      calorieUnit: 'kcal',
      weightUnit: 'kg',
      defaultStepGoal: 8000,
      proteinRatio: 0.30,
      carbsRatio: 0.40,
      fatRatio: 0.30,
      onboardingCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  return {
    id: row.id,
    theme: row.theme,
    calorieUnit: row.calorie_unit,
    weightUnit: row.weight_unit,
    defaultStepGoal: row.default_step_goal,
    proteinRatio: row.protein_ratio,
    carbsRatio: row.carbs_ratio,
    fatRatio: row.fat_ratio,
    onboardingCompleted: Boolean(row.onboarding_completed),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function updateSettings(
  updates: Partial<Omit<UserSettings, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const db = await getDatabase();
  const current = await getSettings();

  const merged = { ...current, ...updates };

  await db.runAsync(
    `UPDATE user_settings SET
      theme = ?,
      calorie_unit = ?,
      weight_unit = ?,
      default_step_goal = ?,
      protein_ratio = ?,
      carbs_ratio = ?,
      fat_ratio = ?,
      onboarding_completed = ?,
      updated_at = datetime('now')
    WHERE id = 1;`,
    [
      merged.theme,
      merged.calorieUnit,
      merged.weightUnit,
      merged.defaultStepGoal,
      merged.proteinRatio,
      merged.carbsRatio,
      merged.fatRatio,
      merged.onboardingCompleted ? 1 : 0,
    ]
  );
}
