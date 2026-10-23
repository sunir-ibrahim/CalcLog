import { getDatabase } from '../db';
import { FoodEntry, DailyNutritionSummary, MealNutritionSummary, MealType } from '../../types/nutrition';

function mapEntryRow(row: any): FoodEntry {
  return {
    id: row.id,
    foodItemId: row.food_item_id,
    foodNameSnapshot: row.food_name_snapshot,
    mealType: row.meal_type as MealType,
    quantity: row.quantity,
    quantityUnit: row.quantity_unit,
    quantityGrams: row.quantity_grams,
    calories: row.calories,
    proteinG: row.protein_g,
    carbsG: row.carbs_g,
    fatG: row.fat_g,
    fiberG: row.fiber_g || 0,
    sodiumMg: row.sodium_mg || 0,
    potassiumMg: row.potassium_mg || 0,
    calciumMg: row.calcium_mg || 0,
    ironMg: row.iron_mg || 0,
    entryDate: row.entry_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function logFoodEntry(
  entry: Omit<FoodEntry, 'id' | 'createdAt' | 'updatedAt'>
): Promise<FoodEntry> {
  const db = await getDatabase();
  const id = `entry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  await db.runAsync(
    `INSERT INTO food_entries (
      id, food_item_id, food_name_snapshot, meal_type,
      quantity, quantity_unit, quantity_grams,
      calories, protein_g, carbs_g, fat_g,
      fiber_g, sodium_mg, potassium_mg, calcium_mg, iron_mg,
      entry_date, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, datetime('now'), datetime('now')
    );`,
    [
      id,
      entry.foodItemId || null,
      entry.foodNameSnapshot,
      entry.mealType,
      entry.quantity,
      entry.quantityUnit,
      entry.quantityGrams,
      entry.calories,
      entry.proteinG,
      entry.carbsG,
      entry.fatG,
      entry.fiberG || 0,
      entry.sodiumMg || 0,
      entry.potassiumMg || 0,
      entry.calciumMg || 0,
      entry.ironMg || 0,
      entry.entryDate,
    ]
  );

  const row = await db.getFirstAsync<any>(
    'SELECT * FROM food_entries WHERE id = ?;',
    [id]
  );
  return mapEntryRow(row);
}

export async function updateFoodEntry(
  id: string,
  updates: Partial<Pick<FoodEntry, 'quantity' | 'quantityUnit' | 'quantityGrams' | 'calories' | 'proteinG' | 'carbsG' | 'fatG' | 'fiberG' | 'sodiumMg' | 'potassiumMg' | 'calciumMg' | 'ironMg' | 'mealType'>>
): Promise<void> {
  const db = await getDatabase();
  const current = await db.getFirstAsync<any>('SELECT * FROM food_entries WHERE id = ?;', [id]);
  if (!current) throw new Error(`Food entry not found: ${id}`);

  const merged = {
    mealType: updates.mealType ?? current.meal_type,
    quantity: updates.quantity ?? current.quantity,
    quantityUnit: updates.quantityUnit ?? current.quantity_unit,
    quantityGrams: updates.quantityGrams ?? current.quantity_grams,
    calories: updates.calories ?? current.calories,
    proteinG: updates.proteinG ?? current.protein_g,
    carbsG: updates.carbsG ?? current.carbs_g,
    fatG: updates.fatG ?? current.fat_g,
    fiberG: updates.fiberG ?? current.fiber_g ?? 0,
    sodiumMg: updates.sodiumMg ?? current.sodium_mg ?? 0,
    potassiumMg: updates.potassiumMg ?? current.potassium_mg ?? 0,
    calciumMg: updates.calciumMg ?? current.calcium_mg ?? 0,
    ironMg: updates.ironMg ?? current.iron_mg ?? 0,
  };

  await db.runAsync(
    `UPDATE food_entries SET
      meal_type = ?,
      quantity = ?,
      quantity_unit = ?,
      quantity_grams = ?,
      calories = ?,
      protein_g = ?,
      carbs_g = ?,
      fat_g = ?,
      fiber_g = ?,
      sodium_mg = ?,
      potassium_mg = ?,
      calcium_mg = ?,
      iron_mg = ?,
      updated_at = datetime('now')
    WHERE id = ?;`,
    [
      merged.mealType,
      merged.quantity,
      merged.quantityUnit,
      merged.quantityGrams,
      merged.calories,
      merged.proteinG,
      merged.carbsG,
      merged.fatG,
      merged.fiberG,
      merged.sodiumMg,
      merged.potassiumMg,
      merged.calciumMg,
      merged.ironMg,
      id,
    ]
  );
}

export async function deleteFoodEntry(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM food_entries WHERE id = ?;', [id]);
}

export async function getEntriesForDate(entryDate: string): Promise<FoodEntry[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM food_entries WHERE entry_date = ? ORDER BY created_at ASC;',
    [entryDate]
  );
  return rows.map(mapEntryRow);
}

export async function getNutritionSummaryForDate(
  entryDate: string
): Promise<DailyNutritionSummary> {
  const entries = await getEntriesForDate(entryDate);

  let totalCalories = 0;
  let totalProteinG = 0;
  let totalCarbsG = 0;
  let totalFatG = 0;
  let totalFiberG = 0;
  let totalSodiumMg = 0;
  let totalPotassiumMg = 0;
  let totalCalciumMg = 0;
  let totalIronMg = 0;

  for (const entry of entries) {
    totalCalories += entry.calories;
    totalProteinG += entry.proteinG;
    totalCarbsG += entry.carbsG;
    totalFatG += entry.fatG;
    totalFiberG += entry.fiberG || 0;
    totalSodiumMg += entry.sodiumMg || 0;
    totalPotassiumMg += entry.potassiumMg || 0;
    totalCalciumMg += entry.calciumMg || 0;
    totalIronMg += entry.ironMg || 0;
  }

  return {
    date: entryDate,
    totalCalories: Math.round(totalCalories),
    totalProteinG: Number(totalProteinG.toFixed(1)),
    totalCarbsG: Number(totalCarbsG.toFixed(1)),
    totalFatG: Number(totalFatG.toFixed(1)),
    totalFiberG: Number(totalFiberG.toFixed(1)),
    totalSodiumMg: Math.round(totalSodiumMg),
    totalPotassiumMg: Math.round(totalPotassiumMg),
    totalCalciumMg: Math.round(totalCalciumMg),
    totalIronMg: Number(totalIronMg.toFixed(1)),
    entries,
  };
}

export function groupEntriesByMeal(entries: FoodEntry[]): Record<MealType, MealNutritionSummary> {
  const result: Record<MealType, MealNutritionSummary> = {
    breakfast: { mealType: 'breakfast', calories: 0, proteinG: 0, carbsG: 0, fatG: 0, entries: [] },
    lunch: { mealType: 'lunch', calories: 0, proteinG: 0, carbsG: 0, fatG: 0, entries: [] },
    dinner: { mealType: 'dinner', calories: 0, proteinG: 0, carbsG: 0, fatG: 0, entries: [] },
    snack: { mealType: 'snack', calories: 0, proteinG: 0, carbsG: 0, fatG: 0, entries: [] },
  };

  for (const entry of entries) {
    const meal = result[entry.mealType];
    if (meal) {
      meal.calories += entry.calories;
      meal.proteinG = Number((meal.proteinG + entry.proteinG).toFixed(1));
      meal.carbsG = Number((meal.carbsG + entry.carbsG).toFixed(1));
      meal.fatG = Number((meal.fatG + entry.fatG).toFixed(1));
      meal.fiberG = Number(((meal.fiberG || 0) + (entry.fiberG || 0)).toFixed(1));
      meal.entries.push(entry);
    }
  }

  return result;
}
