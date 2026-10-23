import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAppData } from '../../context/AppDataContext';
import { DateHeader } from '../../components/ui/DateHeader';
import { MealSection } from '../../components/food/MealSection';
import { Card } from '../../components/ui/Card';
import { groupEntriesByMeal } from '../../database/repositories/entryRepo';
import { MealType, FoodEntry } from '../../types/nutrition';
import { SPACING, RADII } from '../../constants/theme';

export default function FoodDiaryScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    selectedDate,
    setSelectedDate,
    daySummary,
    deleteFood,
    targets,
  } = useAppData();

  const grouped = useMemo(
    () => groupEntriesByMeal(daySummary.entries),
    [daySummary.entries]
  );

  const handleAddFoodToMeal = (mealType: MealType) => {
    router.push({
      pathname: '/food/search',
      params: { mealType },
    });
  };

  const handleDeleteEntry = (id: string) => {
    Alert.alert(
      'Remove Entry',
      'Are you sure you want to remove this food from your diary?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => deleteFood(id),
        },
      ]
    );
  };

  const handleEntryPress = (entry: FoodEntry) => {
    // Open edit/details modal
    router.push({
      pathname: '/food/details',
      params: {
        entryId: entry.id,
        foodName: entry.foodNameSnapshot,
        initialQuantity: String(entry.quantity),
        initialUnit: entry.quantityUnit,
        initialGrams: String(entry.quantityGrams),
        caloriesPer100g: String(
          Math.round((entry.calories / entry.quantityGrams) * 100)
        ),
        proteinPer100g: String(
          Number(((entry.proteinG / entry.quantityGrams) * 100).toFixed(1))
        ),
        carbsPer100g: String(
          Number(((entry.carbsG / entry.quantityGrams) * 100).toFixed(1))
        ),
        fatPer100g: String(
          Number(((entry.fatG / entry.quantityGrams) * 100).toFixed(1))
        ),
        mealType: entry.mealType,
      },
    });
  };

  const targetCal = targets?.targetCalories || 2000;
  const remainingCal = targetCal - daySummary.totalCalories;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.topRow}>
          <Text style={[styles.screenTitle, { color: colors.text }]}>Food Diary</Text>
          <TouchableOpacity
            onPress={() => router.push('/food/custom')}
            style={[styles.customFoodBtn, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}
          >
            <Ionicons name="add" size={16} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={[styles.customFoodText, { color: colors.primary }]}>Custom Food</Text>
          </TouchableOpacity>
        </View>

        {/* Date Selector */}
        <DateHeader currentDate={selectedDate} onDateChange={setSelectedDate} />

        {/* Day Nutrition Overview Card */}
        <Card style={styles.overviewCard}>
          <View style={styles.overviewTop}>
            <View>
              <Text style={[styles.overviewLabel, { color: colors.textSecondary }]}>
                Daily Calories
              </Text>
              <Text style={[styles.overviewValue, { color: colors.text }]}>
                {daySummary.totalCalories}{' '}
                <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textMuted }}>
                  / {targetCal} kcal
                </Text>
              </Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.overviewLabel, { color: colors.textSecondary }]}>
                Remaining
              </Text>
              <Text
                style={[
                  styles.overviewValue,
                  { color: remainingCal >= 0 ? colors.calories : colors.warning },
                ]}
              >
                {remainingCal >= 0 ? remainingCal : `+${Math.abs(remainingCal)}`} kcal
              </Text>
            </View>
          </View>

          {/* Day Macros bar */}
          <View style={styles.macrosRow}>
            <View style={styles.macroCol}>
              <Text style={[styles.macroLabel, { color: colors.protein }]}>Protein</Text>
              <Text style={[styles.macroVal, { color: colors.text }]}>
                {Math.round(daySummary.totalProteinG)}g
              </Text>
            </View>
            <View style={styles.macroCol}>
              <Text style={[styles.macroLabel, { color: colors.carbs }]}>Carbs</Text>
              <Text style={[styles.macroVal, { color: colors.text }]}>
                {Math.round(daySummary.totalCarbsG)}g
              </Text>
            </View>
            <View style={styles.macroCol}>
              <Text style={[styles.macroLabel, { color: colors.fat }]}>Fat</Text>
              <Text style={[styles.macroVal, { color: colors.text }]}>
                {Math.round(daySummary.totalFatG)}g
              </Text>
            </View>
          </View>
        </Card>

        {/* Meal Categories */}
        <MealSection
          mealType="breakfast"
          title="Breakfast"
          entries={grouped.breakfast.entries}
          totalCalories={grouped.breakfast.calories}
          totalProteinG={grouped.breakfast.proteinG}
          totalCarbsG={grouped.breakfast.carbsG}
          totalFatG={grouped.breakfast.fatG}
          onAddPress={() => handleAddFoodToMeal('breakfast')}
          onDeleteEntry={handleDeleteEntry}
          onEntryPress={handleEntryPress}
        />

        <MealSection
          mealType="lunch"
          title="Lunch"
          entries={grouped.lunch.entries}
          totalCalories={grouped.lunch.calories}
          totalProteinG={grouped.lunch.proteinG}
          totalCarbsG={grouped.lunch.carbsG}
          totalFatG={grouped.lunch.fatG}
          onAddPress={() => handleAddFoodToMeal('lunch')}
          onDeleteEntry={handleDeleteEntry}
          onEntryPress={handleEntryPress}
        />

        <MealSection
          mealType="dinner"
          title="Dinner"
          entries={grouped.dinner.entries}
          totalCalories={grouped.dinner.calories}
          totalProteinG={grouped.dinner.proteinG}
          totalCarbsG={grouped.dinner.carbsG}
          totalFatG={grouped.dinner.fatG}
          onAddPress={() => handleAddFoodToMeal('dinner')}
          onDeleteEntry={handleDeleteEntry}
          onEntryPress={handleEntryPress}
        />

        <MealSection
          mealType="snack"
          title="Snacks"
          entries={grouped.snack.entries}
          totalCalories={grouped.snack.calories}
          totalProteinG={grouped.snack.proteinG}
          totalCarbsG={grouped.snack.carbsG}
          totalFatG={grouped.snack.fatG}
          onAddPress={() => handleAddFoodToMeal('snack')}
          onDeleteEntry={handleDeleteEntry}
          onEntryPress={handleEntryPress}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  customFoodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: RADII.md,
    borderWidth: 1,
  },
  customFoodText: {
    fontSize: 12,
    fontWeight: '700',
  },
  overviewCard: {
    marginBottom: SPACING.md,
  },
  overviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  overviewLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  overviewValue: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#33415525',
  },
  macroCol: {
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  macroVal: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
});
