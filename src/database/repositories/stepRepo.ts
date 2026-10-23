import { getDatabase } from '../db';
import { DailyActivity } from '../../types/database';

export const MAX_REASONABLE_DAILY_STEPS = 150000;

function mapStepRow(row: any): DailyActivity {
  return {
    id: row.id,
    activityDate: row.activity_date,
    steps: row.steps,
    stepGoal: row.step_goal,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getStepsForDate(date: string): Promise<DailyActivity | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM daily_activity WHERE activity_date = ? LIMIT 1;',
    [date]
  );
  return row ? mapStepRow(row) : null;
}

export async function upsertDailySteps(
  date: string,
  steps: number,
  stepGoal = 8000
): Promise<DailyActivity> {
  if (!Number.isInteger(steps) || steps < 0) {
    throw new Error('Steps must be a non-negative whole number.');
  }

  if (steps > MAX_REASONABLE_DAILY_STEPS) {
    throw new Error(
      `Step count exceeds reasonable daily maximum (${MAX_REASONABLE_DAILY_STEPS.toLocaleString()} steps).`
    );
  }

  const db = await getDatabase();
  const id = `act-${date}`;

  await db.runAsync(
    `INSERT INTO daily_activity (
      id, activity_date, steps, step_goal, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, datetime('now'), datetime('now')
    )
    ON CONFLICT(activity_date) DO UPDATE SET
      steps = excluded.steps,
      step_goal = excluded.step_goal,
      updated_at = datetime('now');`,
    [id, date, steps, stepGoal]
  );

  const saved = await getStepsForDate(date);
  if (!saved) throw new Error('Failed to retrieve upserted daily steps.');
  return saved;
}

export async function getStepHistory(limit = 30): Promise<DailyActivity[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM daily_activity ORDER BY activity_date DESC LIMIT ?;',
    [limit]
  );
  return rows.map(mapStepRow);
}

export interface StepProgressCalculation {
  stepsCompleted: number;
  stepGoal: number;
  percentage: number;
  visualProgress: number; // Capped at 1.0 (100%)
  stepsRemaining: number;
  isGoalReached: boolean;
}

export function calculateStepProgress(
  stepsCompleted: number,
  stepGoal = 8000
): StepProgressCalculation {
  const validSteps = Math.max(0, stepsCompleted || 0);
  const validGoal = Math.max(1, stepGoal || 8000);

  const percentage = Math.round((validSteps / validGoal) * 100);
  const visualProgress = Math.min(1.0, validSteps / validGoal);
  const stepsRemaining = Math.max(0, validGoal - validSteps);
  const isGoalReached = validSteps >= validGoal;

  return {
    stepsCompleted: validSteps,
    stepGoal: validGoal,
    percentage,
    visualProgress,
    stepsRemaining,
    isGoalReached,
  };
}
