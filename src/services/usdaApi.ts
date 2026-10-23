import { FoodItem } from '../types/nutrition';

const USDA_SEARCH_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';
// Public DEMO_KEY provided by data.gov/USDA documentation for standard client applications
const USDA_DEMO_KEY = 'DEMO_KEY';
const REQUEST_TIMEOUT_MS = 6000;

interface UsdaNutrient {
  nutrientName: string;
  value: number;
  unitName: string;
}

interface UsdaFoodRecord {
  fdcId: number;
  description: string;
  brandOwner?: string;
  foodNutrients: UsdaNutrient[];
  servingSize?: number;
  servingSizeUnit?: string;
}

/**
 * Searches USDA FoodData Central for foods matching the query.
 * Fails safely on timeouts or network unavailability.
 */
export async function searchUSDA(query: string, pageSize = 15): Promise<FoodItem[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const url = `${USDA_SEARCH_URL}?api_key=${USDA_DEMO_KEY}&query=${encodeURIComponent(
      trimmed
    )}&pageSize=${pageSize}&dataType=Foundation,Survey%20(FNDDS),Branded`;

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 429) {
        console.warn('USDA API rate limit reached (DEMO_KEY). Falling back to local data.');
      }
      return [];
    }

    const data = await response.json();
    if (!data.foods || !Array.isArray(data.foods)) return [];

    return data.foods.map((food: UsdaFoodRecord): FoodItem => {
      let calories = 0;
      let protein = 0;
      let carbs = 0;
      let fat = 0;
      let fiber = 0;
      let sodium = 0;
      let potassium = 0;
      let calcium = 0;
      let iron = 0;

      for (const nut of food.foodNutrients || []) {
        const name = (nut.nutrientName || '').toLowerCase();
        if (name.includes('energy') && (nut.unitName === 'KCAL' || nut.value < 900)) {
          if (!calories || calories === 0) calories = nut.value;
        } else if (name.startsWith('protein')) {
          protein = nut.value;
        } else if (name.includes('carbohydrate')) {
          carbs = nut.value;
        } else if (name.includes('total lipid') || name === 'fat') {
          fat = nut.value;
        } else if (name.includes('fiber')) {
          fiber = nut.value;
        } else if (name.includes('sodium')) {
          sodium = nut.value;
        } else if (name.includes('potassium')) {
          potassium = nut.value;
        } else if (name.includes('calcium')) {
          calcium = nut.value;
        } else if (name.includes('iron')) {
          iron = nut.value;
        }
      }

      const servingG = food.servingSize && food.servingSize > 0 ? food.servingSize : 100;
      const servingUnit = food.servingSizeUnit || 'g';

      return {
        id: `usda-${food.fdcId}`,
        name: food.description,
        brand: food.brandOwner || null,
        source: 'usda',
        sourceId: String(food.fdcId),
        servingSizeG: servingG,
        servingUnit: servingUnit.toLowerCase(),
        caloriesPer100g: Math.round(calories),
        proteinPer100g: Number((protein || 0).toFixed(1)),
        carbsPer100g: Number((carbs || 0).toFixed(1)),
        fatPer100g: Number((fat || 0).toFixed(1)),
        fiberPer100g: Number((fiber || 0).toFixed(1)),
        sodiumMgPer100g: Math.round(sodium || 0),
        potassiumMgPer100g: Math.round(potassium || 0),
        calciumMgPer100g: Math.round(calcium || 0),
        ironMgPer100g: Number((iron || 0).toFixed(1)),
        isCustom: false,
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });
  } catch (error: any) {
    clearTimeout(timeoutId);
    // Silent fallback to avoid interrupting offline user flow
    return [];
  }
}
