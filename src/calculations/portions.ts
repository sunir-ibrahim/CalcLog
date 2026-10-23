export interface BaseNutritionPer100g {
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g?: number | null;
  sodiumMgPer100g?: number | null;
  potassiumMgPer100g?: number | null;
  calciumMgPer100g?: number | null;
  ironMgPer100g?: number | null;
}

export interface ScaledNutrition {
  quantityGrams: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sodiumMg: number;
  potassiumMg: number;
  calciumMg: number;
  ironMg: number;
}

/**
 * Calculates proportional nutrition for a given mass in grams from a 100g baseline.
 */
export function calculatePortionNutrition(
  nutrition: BaseNutritionPer100g,
  quantityGrams: number
): ScaledNutrition {
  if (quantityGrams < 0) {
    throw new Error('Quantity in grams cannot be negative.');
  }

  const factor = quantityGrams / 100;

  return {
    quantityGrams: Number(quantityGrams.toFixed(1)),
    calories: Math.round(nutrition.caloriesPer100g * factor),
    proteinG: Number((nutrition.proteinPer100g * factor).toFixed(1)),
    carbsG: Number((nutrition.carbsPer100g * factor).toFixed(1)),
    fatG: Number((nutrition.fatPer100g * factor).toFixed(1)),
    fiberG: Number(((nutrition.fiberPer100g || 0) * factor).toFixed(1)),
    sodiumMg: Math.round((nutrition.sodiumMgPer100g || 0) * factor),
    potassiumMg: Math.round((nutrition.potassiumMgPer100g || 0) * factor),
    calciumMg: Math.round((nutrition.calciumMgPer100g || 0) * factor),
    ironMg: Number(((nutrition.ironMgPer100g || 0) * factor).toFixed(1)),
  };
}

/**
 * Helper to convert common serving units (e.g. piece, cup, bowl, tbsp) to grams
 * using the item's baseline serving size.
 */
export function convertUnitToGrams(
  quantity: number,
  unit: string,
  servingSizeG: number
): number {
  if (quantity <= 0) return 0;

  switch (unit.toLowerCase()) {
    case 'g':
    case 'gram':
    case 'grams':
      return quantity;
    case 'kg':
      return quantity * 1000;
    case 'serving':
    case 'servings':
    case 'piece':
    case 'pieces':
    case 'item':
    case 'items':
    case 'cup':
    case 'cups':
    case 'bowl':
    case 'bowls':
    case 'tbsp':
    case 'tsp':
    default:
      // Multiplies the number of servings by the defined serving size in grams
      return quantity * (servingSizeG > 0 ? servingSizeG : 100);
  }
}
