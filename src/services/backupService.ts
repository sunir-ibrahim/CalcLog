import { getDatabase } from '../database/db';
import { BackupData } from '../types/database';
import { SEED_INDIAN_FOODS } from '../database/seedIndianFoods';

export const CURRENT_BACKUP_SCHEMA_VERSION = 1;

/**
 * Generates a complete JSON backup of all user data.
 */
export async function exportAllData(): Promise<BackupData> {
  const db = await getDatabase();

  const profile = await db.getFirstAsync<any>('SELECT * FROM profile WHERE id = 1;');
  const settings = await db.getFirstAsync<any>('SELECT * FROM user_settings WHERE id = 1;');
  const foodItems = await db.getAllAsync<any>('SELECT * FROM food_items;');
  const foodEntries = await db.getAllAsync<any>('SELECT * FROM food_entries;');
  const savedMeals = await db.getAllAsync<any>('SELECT * FROM saved_meals;');
  const savedMealItems = await db.getAllAsync<any>('SELECT * FROM saved_meal_items;');
  const dailyActivities = await db.getAllAsync<any>('SELECT * FROM daily_activity;');
  const weightEntries = await db.getAllAsync<any>('SELECT * FROM weight_entries;');

  return {
    version: CURRENT_BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    profile,
    settings,
    foodItems,
    foodEntries,
    savedMeals,
    savedMealItems,
    dailyActivities,
    weightEntries,
  };
}

/**
 * Validates and imports a JSON backup payload within a single atomic SQLite transaction.
 */
export async function importData(
  payload: any,
  mode: 'replace' | 'merge' = 'replace'
): Promise<{ success: boolean; message: string }> {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid backup file: payload is not a valid JSON object.');
  }

  if (typeof payload.version !== 'number' || payload.version > CURRENT_BACKUP_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported backup schema version (${payload.version}). Current app supports version ${CURRENT_BACKUP_SCHEMA_VERSION}.`
    );
  }

  const db = await getDatabase();

  await db.withTransactionAsync(async () => {
    if (mode === 'replace') {
      await db.runAsync('DELETE FROM food_entries;');
      await db.runAsync('DELETE FROM saved_meal_items;');
      await db.runAsync('DELETE FROM saved_meals;');
      await db.runAsync('DELETE FROM daily_activity;');
      await db.runAsync('DELETE FROM weight_entries;');
      await db.runAsync('DELETE FROM food_items WHERE is_custom = 1;');
    }

    // Import Profile
    if (payload.profile) {
      const p = payload.profile;
      await db.runAsync(
        `INSERT OR REPLACE INTO profile (
          id, age, sex_equation, height_cm, current_weight_kg, target_weight_kg,
          activity_level, goal_type, calorie_target_custom, target_date,
          created_at, updated_at
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          p.age,
          p.sex_equation,
          p.height_cm,
          p.current_weight_kg,
          p.target_weight_kg,
          p.activity_level,
          p.goal_type,
          p.calorie_target_custom,
          p.target_date,
          p.created_at || new Date().toISOString(),
          new Date().toISOString(),
        ]
      );
    }

    // Import User Settings
    if (payload.settings) {
      const s = payload.settings;
      await db.runAsync(
        `INSERT OR REPLACE INTO user_settings (
          id, theme, calorie_unit, weight_unit, default_step_goal,
          protein_ratio, carbs_ratio, fat_ratio, onboarding_completed,
          created_at, updated_at
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          s.theme || 'system',
          s.calorie_unit || 'kcal',
          s.weight_unit || 'kg',
          s.default_step_goal || 8000,
          s.protein_ratio || 0.3,
          s.carbs_ratio || 0.4,
          s.fat_ratio || 0.3,
          s.onboarding_completed ?? 1,
          s.created_at || new Date().toISOString(),
          new Date().toISOString(),
        ]
      );
    }

    // Import Custom Foods
    // Import Food Items
    if (Array.isArray(payload.foodItems)) {
      for (const item of payload.foodItems) {
        await db.runAsync(
          `INSERT OR REPLACE INTO food_items (
            id, name, brand, source, source_id,
            serving_size_g, serving_unit,
            calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g,
            fiber_per_100g, sodium_mg_per_100g, potassium_mg_per_100g, calcium_mg_per_100g, iron_mg_per_100g,
            is_custom, is_favorite, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            item.id,
            item.name,
            item.brand,
            item.source,
            item.source_id,
            item.serving_size_g,
            item.serving_unit,
            item.calories_per_100g,
            item.protein_per_100g,
            item.carbs_per_100g,
            item.fat_per_100g,
            item.fiber_per_100g || 0,
            item.sodium_mg_per_100g || 0,
            item.potassium_mg_per_100g || 0,
            item.calcium_mg_per_100g || 0,
            item.iron_mg_per_100g || 0,
            item.is_custom,
            item.is_favorite,
            item.created_at,
            item.updated_at,
          ]
        );
      }
    }

    // Import Food Entries
    if (Array.isArray(payload.foodEntries)) {
      for (const entry of payload.foodEntries) {
        await db.runAsync(
          `INSERT OR REPLACE INTO food_entries (
            id, food_item_id, food_name_snapshot, meal_type,
            quantity, quantity_unit, quantity_grams,
            calories, protein_g, carbs_g, fat_g,
            fiber_g, sodium_mg, potassium_mg, calcium_mg, iron_mg,
            entry_date, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            entry.id,
            entry.food_item_id,
            entry.food_name_snapshot,
            entry.meal_type,
            entry.quantity,
            entry.quantity_unit,
            entry.quantity_grams,
            entry.calories,
            entry.protein_g,
            entry.carbs_g,
            entry.fat_g,
            entry.fiber_g || 0,
            entry.sodium_mg || 0,
            entry.potassium_mg || 0,
            entry.calcium_mg || 0,
            entry.iron_mg || 0,
            entry.entry_date,
            entry.created_at,
            entry.updated_at,
          ]
        );
      }
    }

    // Import Daily Steps
    if (Array.isArray(payload.dailyActivities)) {
      for (const act of payload.dailyActivities) {
        await db.runAsync(
          `INSERT OR REPLACE INTO daily_activity (
            id, activity_date, steps, step_goal, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?);`,
          [act.id, act.activity_date, act.steps, act.step_goal, act.created_at, act.updated_at]
        );
      }
    }

    // Import Weight Entries
    if (Array.isArray(payload.weightEntries)) {
      for (const w of payload.weightEntries) {
        await db.runAsync(
          `INSERT OR REPLACE INTO weight_entries (
            id, weight_kg, entry_date, notes, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?);`,
          [w.id, w.weight_kg, w.entry_date, w.notes, w.created_at, w.updated_at]
        );
      }
    }
  });

  return { success: true, message: 'Data imported successfully.' };
}

/**
 * Permanently wipes all user-generated records and re-seeds pristine default state.
 */
export async function wipeAllLocalData(): Promise<void> {
  const db = await getDatabase();

  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM profile;');
    await db.runAsync('DELETE FROM food_entries;');
    await db.runAsync('DELETE FROM saved_meal_items;');
    await db.runAsync('DELETE FROM saved_meals;');
    await db.runAsync('DELETE FROM daily_activity;');
    await db.runAsync('DELETE FROM weight_entries;');
    await db.runAsync('DELETE FROM food_items;');
    await db.runAsync('DELETE FROM user_settings;');

    // Reinitialize default settings
    await db.runAsync(
      `INSERT INTO user_settings (
        id, theme, calorie_unit, weight_unit, default_step_goal,
        protein_ratio, carbs_ratio, fat_ratio, onboarding_completed,
        created_at, updated_at
      ) VALUES (
        1, 'system', 'kcal', 'kg', 8000,
        0.30, 0.40, 0.30, 0,
        datetime('now'), datetime('now')
      );`
    );

    // Re-seed Indian food catalog
    for (const food of SEED_INDIAN_FOODS) {
      await db.runAsync(
        `INSERT INTO food_items (
          id, name, brand, source, source_id,
          serving_size_g, serving_unit,
          calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g,
          fiber_per_100g, sodium_mg_per_100g, potassium_mg_per_100g, calcium_mg_per_100g, iron_mg_per_100g,
          is_custom, is_favorite, created_at, updated_at
        ) VALUES (
          ?, ?, ?, 'local', NULL,
          ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          0, 0, datetime('now'), datetime('now')
        );`,
        [
          food.id,
          food.name,
          food.brand || null,
          food.servingSizeG,
          food.servingUnit,
          food.caloriesPer100g,
          food.proteinPer100g,
          food.carbsPer100g,
          food.fatPer100g,
          food.fiberPer100g || 0,
          food.sodiumMgPer100g || 0,
          food.potassiumMgPer100g || 0,
          food.calciumMgPer100g || 0,
          food.ironMgPer100g || 0,
        ]
      );
    }
  });
}
