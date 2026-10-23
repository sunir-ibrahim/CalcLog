import { getDatabase } from '../db';
import { UserProfile } from '../../types/profile';

export async function getProfile(): Promise<UserProfile | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM profile WHERE id = 1 LIMIT 1;'
  );

  if (!row) return null;

  return {
    id: row.id,
    age: row.age,
    sexEquation: row.sex_equation,
    heightCm: row.height_cm,
    currentWeightKg: row.current_weight_kg,
    targetWeightKg: row.target_weight_kg,
    activityLevel: row.activity_level,
    goalType: row.goal_type,
    calorieTargetCustom: row.calorie_target_custom,
    targetDate: row.target_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function saveProfile(
  profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `INSERT INTO profile (
      id, age, sex_equation, height_cm, current_weight_kg, target_weight_kg,
      activity_level, goal_type, calorie_target_custom, target_date,
      created_at, updated_at
    ) VALUES (
      1, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      datetime('now'), datetime('now')
    )
    ON CONFLICT(id) DO UPDATE SET
      age = excluded.age,
      sex_equation = excluded.sex_equation,
      height_cm = excluded.height_cm,
      current_weight_kg = excluded.current_weight_kg,
      target_weight_kg = excluded.target_weight_kg,
      activity_level = excluded.activity_level,
      goal_type = excluded.goal_type,
      calorie_target_custom = excluded.calorie_target_custom,
      target_date = excluded.target_date,
      updated_at = datetime('now');`,
    [
      profile.age,
      profile.sexEquation,
      profile.heightCm,
      profile.currentWeightKg,
      profile.targetWeightKg,
      profile.activityLevel,
      profile.goalType,
      profile.calorieTargetCustom ?? null,
      profile.targetDate ?? null,
    ]
  );
}
