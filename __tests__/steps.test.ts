import { describe, it, expect } from '@jest/globals';
import { calculateStepProgress, MAX_REASONABLE_DAILY_STEPS } from '../src/database/repositories/stepRepo';

describe('Manual Step Progress Calculation', () => {
  it('calculates progress accurately when below goal', () => {
    // 5,200 of 8,000 steps = 65%
    const res = calculateStepProgress(5200, 8000);
    expect(res.stepsCompleted).toBe(5200);
    expect(res.stepGoal).toBe(8000);
    expect(res.percentage).toBe(65);
    expect(res.stepsRemaining).toBe(2800);
    expect(res.visualProgress).toBe(0.65);
    expect(res.isGoalReached).toBe(false);
  });

  it('caps visual progress at 1.0 but preserves real count when goal is exceeded', () => {
    const res = calculateStepProgress(12000, 8000);
    expect(res.stepsCompleted).toBe(12000);
    expect(res.stepGoal).toBe(8000);
    expect(res.percentage).toBe(150);
    expect(res.stepsRemaining).toBe(0);
    expect(res.visualProgress).toBe(1.0);
    expect(res.isGoalReached).toBe(true);
  });

  it('handles exact goal completion', () => {
    const res = calculateStepProgress(8000, 8000);
    expect(res.percentage).toBe(100);
    expect(res.stepsRemaining).toBe(0);
    expect(res.isGoalReached).toBe(true);
  });

  it('handles 0 steps gracefully', () => {
    const res = calculateStepProgress(0, 8000);
    expect(res.percentage).toBe(0);
    expect(res.stepsRemaining).toBe(8000);
    expect(res.visualProgress).toBe(0);
    expect(res.isGoalReached).toBe(false);
  });

  it('enforces reasonable upper bound threshold', () => {
    expect(MAX_REASONABLE_DAILY_STEPS).toBe(150000);
  });
});
