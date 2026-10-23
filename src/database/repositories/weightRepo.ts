import { getDatabase } from '../db';
import { WeightEntry } from '../../types/database';

function mapWeightRow(row: any): WeightEntry {
  return {
    id: row.id,
    weightKg: row.weight_kg,
    entryDate: row.entry_date,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function recordWeight(
  weightKg: number,
  entryDate: string,
  notes?: string
): Promise<WeightEntry> {
  if (weightKg < 20 || weightKg > 400) {
    throw new Error('Weight must be within realistic bounds (20–400 kg).');
  }

  const db = await getDatabase();
  const id = `weight-${entryDate}-${Date.now()}`;

  // Check if an entry already exists for this exact date
  const existing = await db.getFirstAsync<any>(
    'SELECT id FROM weight_entries WHERE entry_date = ? LIMIT 1;',
    [entryDate]
  );

  if (existing) {
    await db.runAsync(
      `UPDATE weight_entries SET
        weight_kg = ?,
        notes = ?,
        updated_at = datetime('now')
      WHERE id = ?;`,
      [weightKg, notes || null, existing.id]
    );
    const updated = await db.getFirstAsync<any>('SELECT * FROM weight_entries WHERE id = ?;', [existing.id]);
    return mapWeightRow(updated);
  } else {
    await db.runAsync(
      `INSERT INTO weight_entries (
        id, weight_kg, entry_date, notes, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, datetime('now'), datetime('now')
      );`,
      [id, weightKg, entryDate, notes || null]
    );
    const created = await db.getFirstAsync<any>('SELECT * FROM weight_entries WHERE id = ?;', [id]);
    return mapWeightRow(created);
  }
}

export async function getWeightHistory(limit = 60): Promise<WeightEntry[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM weight_entries ORDER BY entry_date DESC, created_at DESC LIMIT ?;',
    [limit]
  );
  return rows.map(mapWeightRow);
}

export async function getLatestWeight(): Promise<WeightEntry | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM weight_entries ORDER BY entry_date DESC, created_at DESC LIMIT 1;'
  );
  return row ? mapWeightRow(row) : null;
}

export async function deleteWeightEntry(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM weight_entries WHERE id = ?;', [id]);
}

export interface WeightTrendAnalysis {
  currentWeight: number;
  targetWeight: number;
  weightDeltaToTarget: number;
  recentChangeKg: number | null; // delta since prior entry
  totalChangeKg: number | null;  // delta from very first entry
  historyCount: number;
}

export function analyzeWeightProgress(
  entries: WeightEntry[],
  targetWeightKg: number
): WeightTrendAnalysis {
  if (entries.length === 0) {
    return {
      currentWeight: targetWeightKg,
      targetWeight: targetWeightKg,
      weightDeltaToTarget: 0,
      recentChangeKg: null,
      totalChangeKg: null,
      historyCount: 0,
    };
  }

  // entries sorted DESC by date
  const current = entries[0].weightKg;
  const deltaToTarget = Number((current - targetWeightKg).toFixed(1));

  let recentChangeKg: number | null = null;
  if (entries.length >= 2) {
    recentChangeKg = Number((current - entries[1].weightKg).toFixed(1));
  }

  let totalChangeKg: number | null = null;
  if (entries.length >= 2) {
    const oldest = entries[entries.length - 1].weightKg;
    totalChangeKg = Number((current - oldest).toFixed(1));
  }

  return {
    currentWeight: current,
    targetWeight: targetWeightKg,
    weightDeltaToTarget: deltaToTarget,
    recentChangeKg,
    totalChangeKg,
    historyCount: entries.length,
  };
}
