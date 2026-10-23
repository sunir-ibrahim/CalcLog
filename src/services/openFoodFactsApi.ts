import { FoodItem } from '../types/nutrition';

const OFF_SEARCH_URL = 'https://world.openfoodfacts.org/cgi/search.pl';
const REQUEST_TIMEOUT_MS = 6000;

/**
 * Searches Open Food Facts product database for packaged foods and branded items.
 * Fails safely when offline or timed out.
 */
export async function searchOpenFoodFacts(
  query: string,
  pageSize = 15
): Promise<FoodItem[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const url = `${OFF_SEARCH_URL}?search_terms=${encodeURIComponent(
      trimmed
    )}&search_simple=1&action=process&json=1&page_size=${pageSize}&fields=code,product_name,brands,nutriments,serving_size,serving_quantity`;

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'CalcLog-MobileApp/1.0 (local-first calorie tracker)',
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) return [];

    const data = await response.json();
    if (!data.products || !Array.isArray(data.products)) return [];

    const results: FoodItem[] = [];

    for (const prod of data.products) {
      if (!prod.product_name) continue;

      const nut = prod.nutriments || {};
      const kcal =
        nut['energy-kcal_100g'] ??
        (nut['energy_100g'] ? Math.round(nut['energy_100g'] / 4.184) : 0);
      const protein = nut['proteins_100g'] ?? 0;
      const carbs = nut['carbohydrates_100g'] ?? 0;
      const fat = nut['fat_100g'] ?? 0;
      const fiber = nut['fiber_100g'] ?? 0;
      const sodiumG = nut['sodium_100g'] ?? (nut['salt_100g'] ? nut['salt_100g'] / 2.5 : 0);
      const sodiumMg = Math.round((sodiumG || 0) * 1000);
      const potassiumMg = Math.round((nut['potassium_100g'] ?? 0) * 1000);
      const calciumMg = Math.round((nut['calcium_100g'] ?? 0) * 1000);
      const ironMg = Number(((nut['iron_100g'] ?? 0) * 1000).toFixed(1));

      const servingG = prod.serving_quantity ? Number(prod.serving_quantity) : 100;
      const servingUnit = prod.serving_size || 'serving';

      results.push({
        id: `off-${prod.code || Math.random().toString(36).substring(2, 8)}`,
        name: prod.product_name,
        brand: prod.brands || null,
        source: 'openfoodfacts',
        sourceId: prod.code,
        servingSizeG: servingG > 0 ? servingG : 100,
        servingUnit: servingUnit,
        caloriesPer100g: Math.round(kcal),
        proteinPer100g: Number(Number(protein).toFixed(1)),
        carbsPer100g: Number(Number(carbs).toFixed(1)),
        fatPer100g: Number(Number(fat).toFixed(1)),
        fiberPer100g: Number(Number(fiber).toFixed(1)),
        sodiumMgPer100g: sodiumMg,
        potassiumMgPer100g: potassiumMg,
        calciumMgPer100g: calciumMg,
        ironMgPer100g: ironMg,
        isCustom: false,
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return results;
  } catch (error) {
    clearTimeout(timeoutId);
    return [];
  }
}
