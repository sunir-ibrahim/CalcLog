import { describe, it, expect } from '@jest/globals';
import { analyzeWeightProgress } from '../src/database/repositories/weightRepo';
import { WeightEntry } from '../src/types/database';

describe('Weight Trend & Progress Analysis', () => {
  it('handles empty weight history gracefully', () => {
    const analysis = analyzeWeightProgress([], 70);
    expect(analysis.historyCount).toBe(0);
    expect(analysis.currentWeight).toBe(70);
    expect(analysis.recentChangeKg).toBeNull();
    expect(analysis.totalChangeKg).toBeNull();
  });

  it('calculates target delta and progress with single entry', () => {
    const entries: WeightEntry[] = [
      {
        id: 'w1',
        weightKg: 78.5,
        entryDate: '2026-10-22',
        createdAt: '2026-10-22T08:00:00Z',
        updatedAt: '2026-10-22T08:00:00Z',
      },
    ];

    const analysis = analyzeWeightProgress(entries, 72);
    expect(analysis.historyCount).toBe(1);
    expect(analysis.currentWeight).toBe(78.5);
    expect(analysis.targetWeight).toBe(72);
    expect(analysis.weightDeltaToTarget).toBe(6.5);
    expect(analysis.recentChangeKg).toBeNull(); // Only 1 entry, no delta yet
  });

  it('calculates recent and overall weight changes with multiple measurements', () => {
    // Entries ordered DESC by date (most recent first)
    const entries: WeightEntry[] = [
      { id: 'w3', weightKg: 76.0, entryDate: '2026-10-22', createdAt: '', updatedAt: '' },
      { id: 'w2', weightKg: 76.8, entryDate: '2026-10-15', createdAt: '', updatedAt: '' },
      { id: 'w1', weightKg: 80.0, entryDate: '2026-10-01', createdAt: '', updatedAt: '' },
    ];

    const analysis = analyzeWeightProgress(entries, 70);
    expect(analysis.currentWeight).toBe(76.0);
    expect(analysis.weightDeltaToTarget).toBe(6.0);
    expect(analysis.recentChangeKg).toBe(-0.8); // 76.0 - 76.8 = -0.8 kg
    expect(analysis.totalChangeKg).toBe(-4.0);  // 76.0 - 80.0 = -4.0 kg
    expect(analysis.historyCount).toBe(3);
  });
});
