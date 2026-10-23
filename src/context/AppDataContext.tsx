import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getDatabase } from '../database/db';
import { getProfile, saveProfile as saveProfileRepo } from '../database/repositories/profileRepo';
import { getSettings, updateSettings as updateSettingsRepo } from '../database/repositories/settingsRepo';
import {
  getNutritionSummaryForDate,
  logFoodEntry as logFoodEntryRepo,
  updateFoodEntry as updateFoodEntryRepo,
  deleteFoodEntry as deleteFoodEntryRepo,
} from '../database/repositories/entryRepo';
import {
  getStepsForDate,
  upsertDailySteps as upsertDailyStepsRepo,
  getStepHistory,
} from '../database/repositories/stepRepo';
import {
  getLatestWeight,
  getWeightHistory,
  recordWeight as recordWeightRepo,
  deleteWeightEntry as deleteWeightEntryRepo,
} from '../database/repositories/weightRepo';
import { calculateAllProfileTargets } from '../calculations';
import { UserProfile, CalorieCalculationResult } from '../types/profile';
import { UserSettings, DailyActivity, WeightEntry } from '../types/database';
import { DailyNutritionSummary, FoodEntry } from '../types/nutrition';
import { getTodayDateString } from '../utils/dateUtils';

interface AppDataContextValue {
  isLoading: boolean;
  isInitialized: boolean;
  profile: UserProfile | null;
  settings: UserSettings;
  targets: CalorieCalculationResult | null;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  daySummary: DailyNutritionSummary;
  dayActivity: DailyActivity | null;
  latestWeight: WeightEntry | null;
  weightHistory: WeightEntry[];
  stepHistory: DailyActivity[];

  // Mutators
  reloadAll: () => Promise<void>;
  saveProfile: (profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSettings: (updates: Partial<Omit<UserSettings, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  logFood: (entry: Omit<FoodEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<FoodEntry>;
  editFood: (id: string, updates: Partial<FoodEntry>) => Promise<void>;
  deleteFood: (id: string) => Promise<void>;
  recordSteps: (steps: number, date?: string) => Promise<DailyActivity>;
  recordWeight: (weightKg: number, date?: string, notes?: string) => Promise<WeightEntry>;
  deleteWeight: (id: string) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    id: 1,
    theme: 'system',
    calorieUnit: 'kcal',
    weightUnit: 'kg',
    defaultStepGoal: 8000,
    proteinRatio: 0.3,
    carbsRatio: 0.4,
    fatRatio: 0.3,
    onboardingCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const [targets, setTargets] = useState<CalorieCalculationResult | null>(null);
  const [selectedDate, setSelectedDateState] = useState<string>(getTodayDateString());
  const [daySummary, setDaySummary] = useState<DailyNutritionSummary>({
    date: getTodayDateString(),
    totalCalories: 0,
    totalProteinG: 0,
    totalCarbsG: 0,
    totalFatG: 0,
    totalFiberG: 0,
    totalSodiumMg: 0,
    totalPotassiumMg: 0,
    totalCalciumMg: 0,
    totalIronMg: 0,
    entries: [],
  });
  const [dayActivity, setDayActivity] = useState<DailyActivity | null>(null);
  const [latestWeight, setLatestWeight] = useState<WeightEntry | null>(null);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [stepHistory, setStepHistory] = useState<DailyActivity[]>([]);

  const loadDataForDate = useCallback(
    async (date: string, currentProfile: UserProfile | null, currentSettings: UserSettings) => {
      try {
        const [summary, activity, latestW, wHist, sHist] = await Promise.all([
          getNutritionSummaryForDate(date),
          getStepsForDate(date),
          getLatestWeight(),
          getWeightHistory(30),
          getStepHistory(14),
        ]);

        setDaySummary(summary);
        setDayActivity(activity);
        setLatestWeight(latestW);
        setWeightHistory(wHist);
        setStepHistory(sHist);

        if (currentProfile) {
          const calc = calculateAllProfileTargets({
            ...currentProfile,
            proteinRatio: currentSettings.proteinRatio,
            carbsRatio: currentSettings.carbsRatio,
            fatRatio: currentSettings.fatRatio,
          });
          setTargets(calc);
        } else {
          setTargets(null);
        }
      } catch (err) {
        console.error('Failed to load day data:', err);
      }
    },
    []
  );

  const reloadAll = useCallback(async () => {
    try {
      await getDatabase();
      const [p, s] = await Promise.all([getProfile(), getSettings()]);
      setProfile(p);
      setSettings(s);
      await loadDataForDate(selectedDate, p, s);
    } catch (err) {
      console.error('Database bootstrap error:', err);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [selectedDate, loadDataForDate]);

  useEffect(() => {
    reloadAll();
  }, [reloadAll]);

  const setSelectedDate = (date: string) => {
    setSelectedDateState(date);
    loadDataForDate(date, profile, settings);
  };

  const handleSaveProfile = async (
    newProfile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    await saveProfileRepo(newProfile);
    const p = await getProfile();
    setProfile(p);
    if (p) {
      const calc = calculateAllProfileTargets({
        ...p,
        proteinRatio: settings.proteinRatio,
        carbsRatio: settings.carbsRatio,
        fatRatio: settings.fatRatio,
      });
      setTargets(calc);
    }
    // Also record initial weight entry if no weight history exists yet
    if (newProfile.currentWeightKg) {
      const latest = await getLatestWeight();
      if (!latest) {
        await recordWeightRepo(newProfile.currentWeightKg, getTodayDateString(), 'Starting weight');
        const updatedW = await getLatestWeight();
        const updatedHist = await getWeightHistory(30);
        setLatestWeight(updatedW);
        setWeightHistory(updatedHist);
      }
    }
  };

  const handleUpdateSettings = async (
    updates: Partial<Omit<UserSettings, 'id' | 'createdAt' | 'updatedAt'>>
  ) => {
    await updateSettingsRepo(updates);
    const s = await getSettings();
    setSettings(s);
    if (profile) {
      const calc = calculateAllProfileTargets({
        ...profile,
        proteinRatio: s.proteinRatio,
        carbsRatio: s.carbsRatio,
        fatRatio: s.fatRatio,
      });
      setTargets(calc);
    }
  };

  const handleLogFood = async (entry: Omit<FoodEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = await logFoodEntryRepo(entry);
    const updatedSummary = await getNutritionSummaryForDate(entry.entryDate);
    setDaySummary(updatedSummary);
    return created;
  };

  const handleEditFood = async (id: string, updates: Partial<FoodEntry>) => {
    await updateFoodEntryRepo(id, updates);
    const updatedSummary = await getNutritionSummaryForDate(selectedDate);
    setDaySummary(updatedSummary);
  };

  const handleDeleteFood = async (id: string) => {
    await deleteFoodEntryRepo(id);
    const updatedSummary = await getNutritionSummaryForDate(selectedDate);
    setDaySummary(updatedSummary);
  };

  const handleRecordSteps = async (steps: number, date?: string) => {
    const targetDate = date || selectedDate;
    const act = await upsertDailyStepsRepo(targetDate, steps, settings.defaultStepGoal);
    if (targetDate === selectedDate) {
      setDayActivity(act);
    }
    const updatedHistory = await getStepHistory(14);
    setStepHistory(updatedHistory);
    return act;
  };

  const handleRecordWeight = async (weightKg: number, date?: string, notes?: string) => {
    const targetDate = date || selectedDate;
    const entry = await recordWeightRepo(weightKg, targetDate, notes);
    const latest = await getLatestWeight();
    const history = await getWeightHistory(30);
    setLatestWeight(latest);
    setWeightHistory(history);

    // If recording today's weight, also update current profile weight
    if (profile && (targetDate === getTodayDateString() || targetDate === selectedDate)) {
      await saveProfileRepo({
        ...profile,
        currentWeightKg: weightKg,
      });
      const p = await getProfile();
      setProfile(p);
      if (p) {
        setTargets(
          calculateAllProfileTargets({
            ...p,
            proteinRatio: settings.proteinRatio,
            carbsRatio: settings.carbsRatio,
            fatRatio: settings.fatRatio,
          })
        );
      }
    }

    return entry;
  };

  const handleDeleteWeight = async (id: string) => {
    await deleteWeightEntryRepo(id);
    const latest = await getLatestWeight();
    const history = await getWeightHistory(30);
    setLatestWeight(latest);
    setWeightHistory(history);
  };

  return (
    <AppDataContext.Provider
      value={{
        isLoading,
        isInitialized,
        profile,
        settings,
        targets,
        selectedDate,
        setSelectedDate,
        daySummary,
        dayActivity,
        latestWeight,
        weightHistory,
        stepHistory,
        reloadAll,
        saveProfile: handleSaveProfile,
        updateSettings: handleUpdateSettings,
        logFood: handleLogFood,
        editFood: handleEditFood,
        deleteFood: handleDeleteFood,
        recordSteps: handleRecordSteps,
        recordWeight: handleRecordWeight,
        deleteWeight: handleDeleteWeight,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export function useAppData(): AppDataContextValue {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}
