export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type FoodSource = 'local' | 'custom' | 'usda' | 'openfoodfacts';

export interface FoodItem {
  id: string;
  name: string;
  brand?: string | null;
  source: FoodSource;
  sourceId?: string | null;
  servingSizeG: number;
  servingUnit: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g?: number | null;
  sodiumMgPer100g?: number | null;
  potassiumMgPer100g?: number | null;
  calciumMgPer100g?: number | null;
  ironMgPer100g?: number | null;
  isCustom: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FoodEntry {
  id: string;
  foodItemId?: string | null;
  foodNameSnapshot: string;
  mealType: MealType;
  quantity: number;
  quantityUnit: string;
  quantityGrams: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
  sodiumMg?: number;
  potassiumMg?: number;
  calciumMg?: number;
  ironMg?: number;
  entryDate: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

export interface DailyNutritionSummary {
  date: string;
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  totalFiberG: number;
  totalSodiumMg: number;
  totalPotassiumMg: number;
  totalCalciumMg: number;
  totalIronMg: number;
  entries: FoodEntry[];
}

export interface MealNutritionSummary {
  mealType: MealType;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
  entries: FoodEntry[];
}

export interface SavedMeal {
  id: string;
  name: string;
  mealType?: MealType | null;
  createdAt: string;
  updatedAt: string;
  items: SavedMealItem[];
}

export interface SavedMealItem {
  id: string;
  savedMealId: string;
  foodItemId: string;
  foodItem?: FoodItem;
  quantity: number;
  quantityUnit: string;
  quantityGrams: number;
}
