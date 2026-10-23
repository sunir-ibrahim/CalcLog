import { describe, it, expect } from '@jest/globals';
import {
  calculateBMR,
  calculateTDEE,
  calculateGoalCalorieTarget,
  calculateMacros,
  calculateBMI,
  calculatePortionNutrition,
  convertUnitToGrams,
  calculateAllProfileTargets,
  ACTIVITY_MULTIPLIERS,
} from '../src/calculations';

describe('BMR Calculation (Mifflin–St Jeor)', () => {
  it('correctly calculates BMR for male profile', () => {
    // 70kg, 175cm, 25yo male
    // BMR = 10*70 + 6.25*175 - 5*25 + 5 = 700 + 1093.75 - 125 + 5 = 1673.75 -> 1674
    const result = calculateBMR({
      weightKg: 70,
      heightCm: 175,
      ageYears: 25,
      sexEquation: 'male',
    });
    expect(result.bmr).toBe(1674);
    expect(result.formula).toBe('Mifflin–St Jeor');
  });

  it('correctly calculates BMR for female profile', () => {
    // 60kg, 165cm, 28yo female
    // BMR = 10*60 + 6.25*165 - 5*28 - 161 = 600 + 1031.25 - 140 - 161 = 1330.25 -> 1330
    const result = calculateBMR({
      weightKg: 60,
      heightCm: 165,
      ageYears: 28,
      sexEquation: 'female',
    });
    expect(result.bmr).toBe(1330);
  });

  it('throws on invalid or negative inputs', () => {
    expect(() =>
      calculateBMR({ weightKg: -70, heightCm: 175, ageYears: 25, sexEquation: 'male' })
    ).toThrow();

    expect(() =>
      calculateBMR({ weightKg: 70, heightCm: 0, ageYears: 25, sexEquation: 'male' })
    ).toThrow();

    expect(() =>
      calculateBMR({ weightKg: 70, heightCm: 175, ageYears: 5, sexEquation: 'male' })
    ).toThrow('Age must be between 10 and 120 years.');
  });
});

describe('TDEE Calculation', () => {
  const bmr = 1600;

  it('correctly applies activity multipliers', () => {
    expect(calculateTDEE(bmr, 'sedentary')).toBe(Math.round(1600 * 1.2));
    expect(calculateTDEE(bmr, 'light')).toBe(Math.round(1600 * 1.375));
    expect(calculateTDEE(bmr, 'moderate')).toBe(Math.round(1600 * 1.55));
    expect(calculateTDEE(bmr, 'very')).toBe(Math.round(1600 * 1.725));
    expect(calculateTDEE(bmr, 'extra')).toBe(Math.round(1600 * 1.9));
  });

  it('validates multiplier constants', () => {
    expect(ACTIVITY_MULTIPLIERS.sedentary).toBe(1.2);
    expect(ACTIVITY_MULTIPLIERS.light).toBe(1.375);
    expect(ACTIVITY_MULTIPLIERS.moderate).toBe(1.55);
    expect(ACTIVITY_MULTIPLIERS.very).toBe(1.725);
    expect(ACTIVITY_MULTIPLIERS.extra).toBe(1.9);
  });
});

describe('Goal-Based Calorie Targets & Safety', () => {
  it('returns TDEE for maintain goal', () => {
    const res = calculateGoalCalorieTarget({
      tdee: 2200,
      goalType: 'maintain',
      sexEquation: 'male',
    });
    expect(res.targetCalories).toBe(2200);
    expect(res.adjustmentKcal).toBe(0);
  });

  it('applies standard 500 kcal deficit for weight loss', () => {
    const res = calculateGoalCalorieTarget({
      tdee: 2400,
      goalType: 'lose',
      sexEquation: 'male',
    });
    expect(res.targetCalories).toBe(1900);
    expect(res.adjustmentKcal).toBe(-500);
  });

  it('enforces safety minimum for female (1200 kcal)', () => {
    // TDEE 1400 - 500 = 900 -> capped at 1200
    const res = calculateGoalCalorieTarget({
      tdee: 1400,
      goalType: 'lose',
      sexEquation: 'female',
    });
    expect(res.targetCalories).toBe(1200);
    expect(res.safetyFlags.length).toBeGreaterThan(0);
    expect(res.safetyFlags[0]).toContain('1200 kcal');
  });

  it('enforces safety minimum for male (1500 kcal)', () => {
    // TDEE 1700 - 500 = 1200 -> capped at 1500
    const res = calculateGoalCalorieTarget({
      tdee: 1700,
      goalType: 'lose',
      sexEquation: 'male',
    });
    expect(res.targetCalories).toBe(1500);
    expect(res.safetyFlags.length).toBeGreaterThan(0);
    expect(res.safetyFlags[0]).toContain('1500 kcal');
  });

  it('applies surplus for weight gain', () => {
    const res = calculateGoalCalorieTarget({
      tdee: 2000,
      goalType: 'gain',
      sexEquation: 'male',
    });
    expect(res.targetCalories).toBe(2350);
    expect(res.adjustmentKcal).toBe(350);
  });
});

describe('Macronutrient Calculation', () => {
  it('calculates balanced 30/40/30 split accurately', () => {
    // 2000 kcal:
    // Protein: 2000 * 0.30 = 600 kcal / 4 = 150g
    // Carbs: 2000 * 0.40 = 800 kcal / 4 = 200g
    // Fat: 2000 * 0.30 = 600 kcal / 9 = 66.666 -> 67g
    const macros = calculateMacros(2000, {
      proteinPercent: 30,
      carbsPercent: 40,
      fatPercent: 30,
    });

    expect(macros.proteinGrams).toBe(150);
    expect(macros.carbsGrams).toBe(200);
    expect(macros.fatGrams).toBe(67);
  });

  it('throws when percentages do not equal 100', () => {
    expect(() =>
      calculateMacros(2000, {
        proteinPercent: 40,
        carbsPercent: 40,
        fatPercent: 40,
      })
    ).toThrow();
  });
});

describe('BMI and Screening Ranges', () => {
  it('calculates BMI correctly and classifies normal weight', () => {
    // 70 kg, 175 cm -> 70 / (1.75^2) = 22.857 -> 22.9
    const bmi = calculateBMI(70, 175);
    expect(bmi.bmi).toBe(22.9);
    expect(bmi.category).toBe('Normal weight');
    expect(bmi.referenceWeightRangeKg[0]).toBe(56.7); // 18.5 * 1.75^2 = 56.65 -> 56.7
    expect(bmi.referenceWeightRangeKg[1]).toBe(76.3); // 24.9 * 1.75^2 = 76.25 -> 76.3
    expect(bmi.disclaimer).toBeTruthy();
  });

  it('classifies overweight and underweight correctly', () => {
    expect(calculateBMI(50, 180).category).toBe('Underweight');
    expect(calculateBMI(85, 170).category).toBe('Overweight');
    expect(calculateBMI(110, 170).category).toBe('Obesity range');
  });
});

describe('Portion and Nutrition Scaling', () => {
  const baseFood = {
    caloriesPer100g: 150,
    proteinPer100g: 8,
    carbsPer100g: 22,
    fatPer100g: 3,
    fiberPer100g: 2,
    sodiumMgPer100g: 150,
    potassiumMgPer100g: 300,
    calciumMgPer100g: 80,
    ironMgPer100g: 1.5,
  };

  it('scales proportionally for 200g serving', () => {
    const scaled = calculatePortionNutrition(baseFood, 200);
    expect(scaled.quantityGrams).toBe(200);
    expect(scaled.calories).toBe(300);
    expect(scaled.proteinG).toBe(16);
    expect(scaled.carbsG).toBe(44);
    expect(scaled.fatG).toBe(6);
    expect(scaled.fiberG).toBe(4);
    expect(scaled.sodiumMg).toBe(300);
    expect(scaled.potassiumMg).toBe(600);
    expect(scaled.calciumMg).toBe(160);
    expect(scaled.ironMg).toBe(3);
  });

  it('scales proportionally for 50g serving', () => {
    const scaled = calculatePortionNutrition(baseFood, 50);
    expect(scaled.calories).toBe(75);
    expect(scaled.proteinG).toBe(4);
    expect(scaled.carbsG).toBe(11);
    expect(scaled.fatG).toBe(1.5);
  });

  it('converts units to grams properly', () => {
    expect(convertUnitToGrams(100, 'g', 50)).toBe(100);
    expect(convertUnitToGrams(2, 'piece', 45)).toBe(90);
    expect(convertUnitToGrams(1.5, 'bowl', 150)).toBe(225);
  });
});

describe('Full Profile Calculation Orchestrator', () => {
  it('computes complete profile calculation bundle cleanly', () => {
    const result = calculateAllProfileTargets({
      age: 30,
      sexEquation: 'male',
      heightCm: 178,
      currentWeightKg: 78,
      targetWeightKg: 72,
      activityLevel: 'moderate',
      goalType: 'lose',
    });

    expect(result.bmr).toBeGreaterThan(1600);
    expect(result.tdee).toBeGreaterThan(result.bmr);
    expect(result.targetCalories).toBe(result.tdee - 500);
    expect(result.macroTargets.proteinGrams).toBeGreaterThan(0);
    expect(result.macroTargets.carbsGrams).toBeGreaterThan(0);
    expect(result.macroTargets.fatGrams).toBeGreaterThan(0);
    expect(result.bmi).toBeGreaterThan(0);
  });
});
