import { getDatabase } from '../db';
import { FoodItem, FoodSource } from '../../types/nutrition';

function mapFoodRow(row: any): FoodItem {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    source: row.source as FoodSource,
    sourceId: row.source_id,
    servingSizeG: row.serving_size_g,
    servingUnit: row.serving_unit,
    caloriesPer100g: row.calories_per_100g,
    proteinPer100g: row.protein_per_100g,
    carbsPer100g: row.carbs_per_100g,
    fatPer100g: row.fat_per_100g,
    fiberPer100g: row.fiber_per_100g || 0,
    sodiumMgPer100g: row.sodium_mg_per_100g || 0,
    potassiumMgPer100g: row.potassium_mg_per_100g || 0,
    calciumMgPer100g: row.calcium_mg_per_100g || 0,
    ironMgPer100g: row.iron_mg_per_100g || 0,
    isCustom: Boolean(row.is_custom),
    isFavorite: Boolean(row.is_favorite),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function searchLocalFoods(query: string, limit = 50): Promise<FoodItem[]> {
  const db = await getDatabase();
  const trimmed = query.trim();

  let sql: string;
  let params: any[];

  if (!trimmed) {
    sql = 'SELECT * FROM food_items ORDER BY is_favorite DESC, name ASC LIMIT ?;';
    params = [limit];
  } else {
    sql = `SELECT * FROM food_items 
           WHERE name LIKE ? OR brand LIKE ? 
           ORDER BY is_favorite DESC, 
             CASE WHEN name LIKE ? THEN 1 ELSE 2 END, 
             name ASC LIMIT ?;`;
    const wildcard = `%${trimmed}%`;
    const prefix = `${trimmed}%`;
    params = [wildcard, wildcard, prefix, limit];
  }

  const rows = await db.getAllAsync<any>(sql, params);
  return rows.map(mapFoodRow);
}

export async function getFoodById(id: string): Promise<FoodItem | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM food_items WHERE id = ? LIMIT 1;',
    [id]
  );
  return row ? mapFoodRow(row) : null;
}

export async function createCustomFood(
  food: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt' | 'isCustom' | 'source'>
): Promise<FoodItem> {
  const db = await getDatabase();
  const id = `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  await db.runAsync(
    `INSERT INTO food_items (
      id, name, brand, source, source_id,
      serving_size_g, serving_unit,
      calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g,
      fiber_per_100g, sodium_mg_per_100g, potassium_mg_per_100g, calcium_mg_per_100g, iron_mg_per_100g,
      is_custom, is_favorite, created_at, updated_at
    ) VALUES (
      ?, ?, ?, 'custom', NULL,
      ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      1, ?, datetime('now'), datetime('now')
    );`,
    [
      id,
      food.name.trim(),
      food.brand?.trim() || null,
      food.servingSizeG > 0 ? food.servingSizeG : 100,
      food.servingUnit || 'g',
      food.caloriesPer100g,
      food.proteinPer100g || 0,
      food.carbsPer100g || 0,
      food.fatPer100g || 0,
      food.fiberPer100g || 0,
      food.sodiumMgPer100g || 0,
      food.potassiumMgPer100g || 0,
      food.calciumMgPer100g || 0,
      food.ironMgPer100g || 0,
      food.isFavorite ? 1 : 0,
    ]
  );

  const created = await getFoodById(id);
  if (!created) {
    throw new Error('Failed to retrieve newly created custom food item.');
  }
  return created;
}

export async function toggleFavoriteFood(id: string): Promise<boolean> {
  const db = await getDatabase();
  const item = await getFoodById(id);
  if (!item) return false;

  const nextState = !item.isFavorite ? 1 : 0;
  await db.runAsync(
    'UPDATE food_items SET is_favorite = ?, updated_at = datetime("now") WHERE id = ?;',
    [nextState, id]
  );
  return Boolean(nextState);
}

export async function cacheExternalFood(
  food: Omit<FoodItem, 'createdAt' | 'updatedAt' | 'isCustom'>
): Promise<FoodItem> {
  const db = await getDatabase();

  await db.runAsync(
    `INSERT OR REPLACE INTO food_items (
      id, name, brand, source, source_id,
      serving_size_g, serving_unit,
      calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g,
      fiber_per_100g, sodium_mg_per_100g, potassium_mg_per_100g, calcium_mg_per_100g, iron_mg_per_100g,
      is_custom, is_favorite, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      0, ?, datetime('now'), datetime('now')
    );`,
    [
      food.id,
      food.name,
      food.brand || null,
      food.source,
      food.sourceId || null,
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
      food.isFavorite ? 1 : 0,
    ]
  );

  const cached = await getFoodById(food.id);
  return cached || (food as FoodItem);
}

export async function getFavoriteFoods(): Promise<FoodItem[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM food_items WHERE is_favorite = 1 ORDER BY name ASC;'
  );
  return rows.map(mapFoodRow);
}
