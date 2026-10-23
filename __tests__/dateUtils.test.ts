import { describe, it, expect } from '@jest/globals';
import {
  formatDateToISO,
  addDaysToDate,
  isToday,
  getTodayDateString,
  formatDisplayDate,
} from '../src/utils/dateUtils';

describe('Date & Calendar Operations', () => {
  it('formats dates consistently to ISO YYYY-MM-DD', () => {
    const d = new Date(2026, 9, 22); // Month is 0-indexed: 9 = October
    expect(formatDateToISO(d)).toBe('2026-10-22');
  });

  it('correctly increments and decrements dates without timezone shifts', () => {
    expect(addDaysToDate('2026-10-22', 1)).toBe('2026-10-23');
    expect(addDaysToDate('2026-10-22', -1)).toBe('2026-10-21');
    expect(addDaysToDate('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDaysToDate('2026-01-01', -1)).toBe('2025-12-31');
  });

  it('identifies today correctly', () => {
    const today = getTodayDateString();
    expect(isToday(today)).toBe(true);
    expect(isToday('2020-01-01')).toBe(false);
  });

  it('formats localized labels for today and yesterday', () => {
    const today = getTodayDateString();
    const yesterday = addDaysToDate(today, -1);
    expect(formatDisplayDate(today)).toBe('Today');
    expect(formatDisplayDate(yesterday)).toBe('Yesterday');
  });
});
