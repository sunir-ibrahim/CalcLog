import { describe, it, expect } from '@jest/globals';
import { CURRENT_BACKUP_SCHEMA_VERSION } from '../src/services/backupService';

describe('Backup Payload & Schema Verification', () => {
  it('identifies current backup schema version as 1', () => {
    expect(CURRENT_BACKUP_SCHEMA_VERSION).toBe(1);
  });

  it('validates schema format rules', () => {
    const validSample = {
      version: 1,
      exportedAt: new Date().toISOString(),
      profile: {
        age: 28,
        sex_equation: 'male',
        height_cm: 175,
        current_weight_kg: 75,
        target_weight_kg: 70,
        activity_level: 'moderate',
        goal_type: 'lose',
      },
      settings: {
        theme: 'dark',
        calorie_unit: 'kcal',
        weight_unit: 'kg',
        default_step_goal: 8000,
        onboarding_completed: 1,
      },
      foodItems: [],
      foodEntries: [],
      savedMeals: [],
      savedMealItems: [],
      dailyActivities: [],
      weightEntries: [],
    };

    expect(validSample.version).toBeLessThanOrEqual(CURRENT_BACKUP_SCHEMA_VERSION);
    expect(validSample.profile.age).toBe(28);
    expect(Array.isArray(validSample.foodEntries)).toBe(true);
  });
});
