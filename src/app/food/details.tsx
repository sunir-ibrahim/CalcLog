import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAppData } from '../../context/AppDataContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MealType } from '../../types/nutrition';
import { calculatePortionNutrition, convertUnitToGrams } from '../../calculations/portions';
import { SPACING, RADII } from '../../constants/theme';

export default function FoodDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    foodId?: string;
    foodName?: string;
    brand?: string;
    source?: string;
    servingSizeG?: string;
    servingUnit?: string;
    caloriesPer100g?: string;
    proteinPer100g?: string;
    carbsPer100g?: string;
    fatPer100g?: string;
    fiberPer100g?: string;
    sodiumMgPer100g?: string;
    potassiumMgPer100g?: string;
    calciumMgPer100g?: string;
    ironMgPer100g?: string;
    mealType?: string;
    // If editing existing entry
    entryId?: string;
    initialQuantity?: string;
    initialUnit?: string;
    initialGrams?: string;
  }>();

  const { colors } = useTheme();
  const { logFood, editFood, selectedDate } = useAppData();

  const foodName = params.foodName || 'Selected Food';
  const brand = params.brand || '';
  const baselineServingG = Number(params.servingSizeG) || 100;
  const defaultUnit = params.servingUnit || 'g';

  const caloriesPer100g = Number(params.caloriesPer100g) || 0;
  const proteinPer100g = Number(params.proteinPer100g) || 0;
  const carbsPer100g = Number(params.carbsPer100g) || 0;
  const fatPer100g = Number(params.fatPer100g) || 0;
  const fiberPer100g = Number(params.fiberPer100g) || 0;
  const sodiumMgPer100g = Number(params.sodiumMgPer100g) || 0;
  const potassiumMgPer100g = Number(params.potassiumMgPer100g) || 0;
  const calciumMgPer100g = Number(params.calciumMgPer100g) || 0;
  const ironMgPer100g = Number(params.ironMgPer100g) || 0;

  const [quantity, setQuantity] = useState(
    params.initialQuantity || (defaultUnit === 'g' ? '100' : '1')
  );
  const [selectedUnit, setSelectedUnit] = useState(
    params.initialUnit || (defaultUnit !== 'g' ? defaultUnit : 'g')
  );
  const [selectedMeal, setSelectedMeal] = useState<MealType>(
    (params.mealType as MealType) || 'breakfast'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available portion units
  const availableUnits = useMemo(() => {
    const list = ['g'];
    if (defaultUnit && defaultUnit !== 'g' && !list.includes(defaultUnit)) {
      list.push(defaultUnit);
    }
    if (!list.includes('serving')) list.push('serving');
    if (!list.includes('piece')) list.push('piece');
    if (!list.includes('bowl')) list.push('bowl');
    if (!list.includes('cup')) list.push('cup');
    if (!list.includes('tbsp')) list.push('tbsp');
    return list;
  }, [defaultUnit]);

  // Proportional scaled nutrition
  const scaled = useMemo(() => {
    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      return {
        quantityGrams: 0,
        calories: 0,
        proteinG: 0,
        carbsG: 0,
        fatG: 0,
        fiberG: 0,
        sodiumMg: 0,
        potassiumMg: 0,
        calciumMg: 0,
        ironMg: 0,
      };
    }

    const grams = convertUnitToGrams(qty, selectedUnit, baselineServingG);
    return calculatePortionNutrition(
      {
        caloriesPer100g,
        proteinPer100g,
        carbsPer100g,
        fatPer100g,
        fiberPer100g,
        sodiumMgPer100g,
        potassiumMgPer100g,
        calciumMgPer100g,
        ironMgPer100g,
      },
      grams
    );
  }, [
    quantity,
    selectedUnit,
    baselineServingG,
    caloriesPer100g,
    proteinPer100g,
    carbsPer100g,
    fatPer100g,
    fiberPer100g,
    sodiumMgPer100g,
    potassiumMgPer100g,
    calciumMgPer100g,
    ironMgPer100g,
  ]);

  const handleSave = async () => {
    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Invalid Serving', 'Please enter a valid positive quantity.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (params.entryId) {
        // Edit existing entry
        await editFood(params.entryId, {
          mealType: selectedMeal,
          quantity: qty,
          quantityUnit: selectedUnit,
          quantityGrams: scaled.quantityGrams,
          calories: scaled.calories,
          proteinG: scaled.proteinG,
          carbsG: scaled.carbsG,
          fatG: scaled.fatG,
          fiberG: scaled.fiberG,
          sodiumMg: scaled.sodiumMg,
          potassiumMg: scaled.potassiumMg,
          calciumMg: scaled.calciumMg,
          ironMg: scaled.ironMg,
        });
      } else {
        // Log new entry with immutable snapshot
        await logFood({
          foodItemId: params.foodId || null,
          foodNameSnapshot: foodName,
          mealType: selectedMeal,
          quantity: qty,
          quantityUnit: selectedUnit,
          quantityGrams: scaled.quantityGrams,
          calories: scaled.calories,
          proteinG: scaled.proteinG,
          carbsG: scaled.carbsG,
          fatG: scaled.fatG,
          fiberG: scaled.fiberG,
          sodiumMg: scaled.sodiumMg,
          potassiumMg: scaled.potassiumMg,
          calciumMg: scaled.calciumMg,
          ironMg: scaled.ironMg,
          entryDate: selectedDate,
        });
      }

      router.navigate('/(tabs)/food-diary');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save food entry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Log Food</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Food Info Header Card */}
        <Card>
          <Text style={[styles.foodName, { color: colors.text }]}>{foodName}</Text>
          {brand ? <Text style={[styles.brand, { color: colors.textMuted }]}>{brand}</Text> : null}

          <View style={styles.baselineRow}>
            <Text style={[styles.baselineText, { color: colors.textSecondary }]}>
              Standard reference: {caloriesPer100g} kcal per 100g
            </Text>
          </View>
        </Card>

        {/* Portion Selector Card */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Serving Size & Amount</Text>

          {/* Unit selector buttons */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitScroll}>
            {availableUnits.map((unit) => {
              const isSelected = selectedUnit === unit;
              return (
                <TouchableOpacity
                  key={unit}
                  onPress={() => setSelectedUnit(unit)}
                  style={[
                    styles.unitChip,
                    { backgroundColor: colors.inputBg, borderColor: colors.cardBorder },
                    isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.unitText,
                      { color: isSelected ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {unit}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Quantity Input */}
          <View style={styles.qtyRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Quantity ({selectedUnit})
              </Text>
              <TextInput
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="decimal-pad"
                style={[
                  styles.input,
                  { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text },
                ]}
              />
            </View>

            <View style={styles.gramCalcBox}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Total Mass</Text>
              <Text style={[styles.gramValue, { color: colors.text }]}>
                {Math.round(scaled.quantityGrams)} g
              </Text>
            </View>
          </View>
        </Card>

        {/* Calculated Nutrition Summary Card */}
        <Card style={{ borderColor: colors.primary, borderWidth: 1 }}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            Portion Nutrition ({Math.round(scaled.quantityGrams)}g)
          </Text>

          <View style={styles.calRow}>
            <Text style={[styles.calValue, { color: colors.calories }]}>
              {scaled.calories}
            </Text>
            <Text style={[styles.calSub, { color: colors.textSecondary }]}>Total Calories (kcal)</Text>
          </View>

          <View style={styles.macroMetrics}>
            <View style={styles.macroCol}>
              <Text style={[styles.macroLabel, { color: colors.protein }]}>Protein</Text>
              <Text style={[styles.macroAmount, { color: colors.text }]}>{scaled.proteinG}g</Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

            <View style={styles.macroCol}>
              <Text style={[styles.macroLabel, { color: colors.carbs }]}>Carbohydrates</Text>
              <Text style={[styles.macroAmount, { color: colors.text }]}>{scaled.carbsG}g</Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

            <View style={styles.macroCol}>
              <Text style={[styles.macroLabel, { color: colors.fat }]}>Total Fat</Text>
              <Text style={[styles.macroAmount, { color: colors.text }]}>{scaled.fatG}g</Text>
            </View>
          </View>

          {scaled.fiberG > 0 && (
            <Text style={[styles.fiberText, { color: colors.textMuted }]}>
              Dietary Fiber: {scaled.fiberG}g
            </Text>
          )}
        </Card>

        {/* Meal Category Selection */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Meal Category</Text>
          <View style={styles.mealRow}>
            {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((meal) => {
              const isSelected = selectedMeal === meal;
              const label = meal.charAt(0).toUpperCase() + meal.slice(1);
              return (
                <TouchableOpacity
                  key={meal}
                  onPress={() => setSelectedMeal(meal)}
                  style={[
                    styles.mealBtn,
                    { backgroundColor: colors.inputBg, borderColor: colors.cardBorder },
                    isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.mealBtnText,
                      { color: isSelected ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Submit Button */}
        <Button
          title={params.entryId ? 'Update Meal Entry' : `Add to ${selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)}`}
          onPress={handleSave}
          loading={isSubmitting}
          style={{ marginBottom: SPACING.xxxl }}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  foodName: {
    fontSize: 20,
    fontWeight: '800',
  },
  brand: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  baselineRow: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.xs,
  },
  baselineText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  unitScroll: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  unitChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: RADII.full,
    borderWidth: 1,
    marginRight: SPACING.xs,
  },
  unitText: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderRadius: RADII.md,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    fontSize: 18,
    fontWeight: '700',
  },
  gramCalcBox: {
    width: 100,
    alignItems: 'center',
  },
  gramValue: {
    fontSize: 20,
    fontWeight: '800',
    height: 48,
    textAlignVertical: 'center',
    lineHeight: 48,
  },
  calRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: SPACING.xs,
  },
  calValue: {
    fontSize: 32,
    fontWeight: '800',
    marginRight: SPACING.xs,
  },
  calSub: {
    fontSize: 14,
    fontWeight: '600',
  },
  macroMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: SPACING.sm,
    marginTop: SPACING.xs,
  },
  macroCol: {
    alignItems: 'center',
    flex: 1,
  },
  macroLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  macroAmount: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 28,
  },
  fiberText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  mealRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  mealBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADII.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  mealBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
