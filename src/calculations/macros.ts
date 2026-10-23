import { MacroDistribution, MacroTargetsGrams } from '../types/profile';

// Standard balanced default: 30% Protein, 40% Carbohydrates, 30% Fat
export const DEFAULT_MACRO_RATIOS: MacroDistribution = {
  proteinPercent: 30,
  carbsPercent: 40,
  fatPercent: 30,
};

export const MACRO_ENERGY_DENSITIES = {
  proteinKcalPerGram: 4,
  carbsKcalPerGram: 4,
  fatKcalPerGram: 9,
};

/**
 * Calculates daily macronutrient gram targets based on total calories and ratio percentages.
 */
export function calculateMacros(
  totalCalories: number,
  ratios: MacroDistribution = DEFAULT_MACRO_RATIOS
): MacroTargetsGrams {
  if (totalCalories <= 0) {
    return { proteinGrams: 0, carbsGrams: 0, fatGrams: 0 };
  }

  const sumPercent = ratios.proteinPercent + ratios.carbsPercent + ratios.fatPercent;
  if (Math.abs(sumPercent - 100) > 1) {
    throw new Error(
      `Macronutrient percentages must sum to 100% (currently ${sumPercent}%).`
    );
  }

  const proteinCalories = (totalCalories * ratios.proteinPercent) / 100;
  const carbsCalories = (totalCalories * ratios.carbsPercent) / 100;
  const fatCalories = (totalCalories * ratios.fatPercent) / 100;

  return {
    proteinGrams: Math.round(proteinCalories / MACRO_ENERGY_DENSITIES.proteinKcalPerGram),
    carbsGrams: Math.round(carbsCalories / MACRO_ENERGY_DENSITIES.carbsKcalPerGram),
    fatGrams: Math.round(fatCalories / MACRO_ENERGY_DENSITIES.fatKcalPerGram),
  };
}
