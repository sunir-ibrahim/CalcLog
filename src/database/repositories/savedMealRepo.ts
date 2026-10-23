import { getDatabase } from '../db';
import { SavedMeal, SavedMealItem, MealType } from '../../types/nutrition';
import { getFoodById } from './foodRepo';

export async function createSavedMeal(
  name: string,
  mealType: MealType | null,
  items: Array<{ foodItemId: string; quantity: number; quantityUnit: string; quantityGrams: number }>
): Promise<SavedMeal> {
  const db = await getDatabase();
  const mealId = `meal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'INSERT INTO saved_meals (id, name, meal_type, created_at, updated_at) VALUES (?, ?, ?, datetime("now"), datetime("now"));',
      [mealId, name.trim(), mealType || null]
    );

    for (const item of items) {
      const itemId = `smi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      await db.runAsync(
        `INSERT INTO saved_meal_items (
          id, saved_meal_id, food_item_id, quantity, quantity_unit, quantity_grams
        ) VALUES (?, ?, ?, ?, ?, ?);`,
        [itemId, mealId, item.foodItemId, item.quantity, item.quantityUnit, item.quantityGrams]
      );
    }
  });

  const meals = await getAllSavedMeals();
  const created = meals.find((m) => m.id === mealId);
  if (!created) throw new Error('Failed to retrieve newly created saved meal');
  return created;
}

export async function getAllSavedMeals(): Promise<SavedMeal[]> {
  const db = await getDatabase();
  const mealRows = await db.getAllAsync<any>(
    'SELECT * FROM saved_meals ORDER BY name ASC;'
  );

  const results: SavedMeal[] = [];
  for (const m of mealRows) {
    const itemRows = await db.getAllAsync<any>(
      'SELECT * FROM saved_meal_items WHERE saved_meal_id = ?;',
      [m.id]
    );

    const items: SavedMealItem[] = [];
    for (const ir of itemRows) {
      const foodItem = await getFoodById(ir.food_item_id);
      items.push({
        id: ir.id,
        savedMealId: ir.saved_meal_id,
        foodItemId: ir.food_item_id,
        foodItem: foodItem || undefined,
        quantity: ir.quantity,
        quantityUnit: ir.quantity_unit,
        quantityGrams: ir.quantity_grams,
      });
    }

    results.push({
      id: m.id,
      name: m.name,
      mealType: m.meal_type as MealType,
      createdAt: m.created_at,
      updatedAt: m.updated_at,
      items,
    });
  }

  return results;
}

export async function deleteSavedMeal(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM saved_meals WHERE id = ?;', [id]);
}
