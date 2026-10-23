import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES_SQL } from './schema';
import { SEED_INDIAN_FOODS } from './seedIndianFoods';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export const DB_NAME = 'calclog.db';

/**
 * Initializes and returns the shared SQLite database instance.
 * Idempotently executes table creation, creates indexes, seeds the food catalog,
 * and initializes default user settings.
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const db = await SQLite.openDatabaseAsync(DB_NAME);

      // Enable foreign keys
      await db.execAsync('PRAGMA foreign_keys = ON;');

      // Create all tables and indices
      await db.execAsync(CREATE_TABLES_SQL);

      // Idempotently apply column migrations for existing databases
      const migrations = [
        'ALTER TABLE food_items ADD COLUMN sodium_mg_per_100g REAL DEFAULT 0;',
        'ALTER TABLE food_items ADD COLUMN potassium_mg_per_100g REAL DEFAULT 0;',
        'ALTER TABLE food_items ADD COLUMN calcium_mg_per_100g REAL DEFAULT 0;',
        'ALTER TABLE food_items ADD COLUMN iron_mg_per_100g REAL DEFAULT 0;',
        'ALTER TABLE food_entries ADD COLUMN fiber_g REAL DEFAULT 0;',
        'ALTER TABLE food_entries ADD COLUMN sodium_mg REAL DEFAULT 0;',
        'ALTER TABLE food_entries ADD COLUMN potassium_mg REAL DEFAULT 0;',
        'ALTER TABLE food_entries ADD COLUMN calcium_mg REAL DEFAULT 0;',
        'ALTER TABLE food_entries ADD COLUMN iron_mg REAL DEFAULT 0;',
      ];

      for (const sql of migrations) {
        try {
          await db.execAsync(sql);
        } catch (_) {
          // Column already exists or table is up to date
        }
      }

      // Check if user_settings is initialized
      const settingsRow = await db.getFirstAsync<{ count: number }>(
        'SELECT count(*) as count FROM user_settings WHERE id = 1;'
      );

      if (!settingsRow || settingsRow.count === 0) {
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
      }

      // Seed / update local Indian foods catalog with complete micronutrient profiles
      await seedCatalog(db);

      // Backfill existing food_entries that had 0/NULL micronutrients from their linked food_items
      try {
        await db.runAsync(`
          UPDATE food_entries
          SET
            sodium_mg = COALESCE(
              (SELECT ROUND(fi.sodium_mg_per_100g * food_entries.quantity_grams / 100) FROM food_items fi WHERE fi.id = food_entries.food_item_id),
              sodium_mg,
              0
            ),
            potassium_mg = COALESCE(
              (SELECT ROUND(fi.potassium_mg_per_100g * food_entries.quantity_grams / 100) FROM food_items fi WHERE fi.id = food_entries.food_item_id),
              potassium_mg,
              0
            ),
            calcium_mg = COALESCE(
              (SELECT ROUND(fi.calcium_mg_per_100g * food_entries.quantity_grams / 100) FROM food_items fi WHERE fi.id = food_entries.food_item_id),
              calcium_mg,
              0
            ),
            iron_mg = COALESCE(
              (SELECT ROUND(fi.iron_mg_per_100g * food_entries.quantity_grams / 100, 1) FROM food_items fi WHERE fi.id = food_entries.food_item_id),
              iron_mg,
              0
            )
          WHERE food_item_id IS NOT NULL
            AND (sodium_mg IS NULL OR sodium_mg = 0)
            AND (potassium_mg IS NULL OR potassium_mg = 0)
            AND EXISTS (
              SELECT 1 FROM food_items fi 
              WHERE fi.id = food_entries.food_item_id 
                AND (fi.sodium_mg_per_100g > 0 OR fi.potassium_mg_per_100g > 0)
            );
        `);
      } catch (backfillErr) {
        console.warn('Micronutrient backfill warning:', backfillErr);
      }

      dbInstance = db;
      return db;
    } catch (err) {
      console.error('Database initialization failed:', err);
      initPromise = null;
      throw err;
    }
  })();

  return initPromise;
}

/**
 * Seeds or updates the bundled Indian foods catalog into the food_items table.
 */
async function seedCatalog(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.withTransactionAsync(async () => {
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
        )
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          serving_size_g = excluded.serving_size_g,
          serving_unit = excluded.serving_unit,
          calories_per_100g = excluded.calories_per_100g,
          protein_per_100g = excluded.protein_per_100g,
          carbs_per_100g = excluded.carbs_per_100g,
          fat_per_100g = excluded.fat_per_100g,
          fiber_per_100g = excluded.fiber_per_100g,
          sodium_mg_per_100g = excluded.sodium_mg_per_100g,
          potassium_mg_per_100g = excluded.potassium_mg_per_100g,
          calcium_mg_per_100g = excluded.calcium_mg_per_100g,
          iron_mg_per_100g = excluded.iron_mg_per_100g,
          updated_at = datetime('now');`,
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
