export interface BmiResult {
  bmi: number;
  category: string;
  referenceWeightRangeKg: [number, number];
  disclaimer: string;
}

/**
 * Calculates Adult Body Mass Index (BMI) and reference healthy weight boundaries.
 *
 * Formula:
 *   BMI = weight_kg / (height_m ^ 2)
 *
 * Normal reference interval for standard adult screening: 18.5 - 24.9
 *
 * Clarifications:
 * - BMI is a population-level screening metric, not a clinical diagnostic measure of individual health.
 * - It does not distinguish between adipose tissue and skeletal muscle mass.
 * - Adult BMI criteria must NOT be applied to children, teenagers, pregnant or lactating individuals, or frail older adults.
 */
export function calculateBMI(weightKg: number, heightCm: number): BmiResult {
  if (weightKg <= 0 || heightCm <= 0) {
    throw new Error('Weight and height must be strictly positive.');
  }

  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  let category = 'Normal weight';
  if (bmi < 18.5) {
    category = 'Underweight';
  } else if (bmi < 25.0) {
    category = 'Normal weight';
  } else if (bmi < 30.0) {
    category = 'Overweight';
  } else {
    category = 'Obesity range';
  }

  // Healthy reference range based on 18.5 to 24.9 BMI
  const minWeight = Number((18.5 * heightM * heightM).toFixed(1));
  const maxWeight = Number((24.9 * heightM * heightM).toFixed(1));

  return {
    bmi,
    category,
    referenceWeightRangeKg: [minWeight, maxWeight],
    disclaimer:
      'BMI is a general screening indicator and does not account for muscle mass, bone density, or fat distribution. It should not be used as a standalone health diagnosis.',
  };
}
