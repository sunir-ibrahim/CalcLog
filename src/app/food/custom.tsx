import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { createCustomFood } from '../../database/repositories/foodRepo';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SPACING, RADII } from '../../constants/theme';

export default function CustomFoodScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [servingSizeG, setServingSizeG] = useState('100');
  const [servingUnit, setServingUnit] = useState('g');
  const [caloriesPer100g, setCaloriesPer100g] = useState('');
  const [proteinPer100g, setProteinPer100g] = useState('0');
  const [carbsPer100g, setCarbsPer100g] = useState('0');
  const [fatPer100g, setFatPer100g] = useState('0');
  const [fiberPer100g, setFiberPer100g] = useState('0');
  const [sodiumMgPer100g, setSodiumMgPer100g] = useState('0');
  const [potassiumMgPer100g, setPotassiumMgPer100g] = useState('0');
  const [calciumMgPer100g, setCalciumMgPer100g] = useState('0');
  const [ironMgPer100g, setIronMgPer100g] = useState('0');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please provide a food name.');
      return;
    }

    const kcal = Number(caloriesPer100g);
    if (isNaN(kcal) || kcal < 0) {
      Alert.alert('Invalid Calories', 'Please enter valid calories per 100g.');
      return;
    }

    setIsSaving(true);
    try {
      const created = await createCustomFood({
        name: name.trim(),
        brand: brand.trim() || undefined,
        servingSizeG: Number(servingSizeG) || 100,
        servingUnit: servingUnit.trim() || 'g',
        caloriesPer100g: kcal,
        proteinPer100g: Number(proteinPer100g) || 0,
        carbsPer100g: Number(carbsPer100g) || 0,
        fatPer100g: Number(fatPer100g) || 0,
        fiberPer100g: Number(fiberPer100g) || 0,
        sodiumMgPer100g: Number(sodiumMgPer100g) || 0,
        potassiumMgPer100g: Number(potassiumMgPer100g) || 0,
        calciumMgPer100g: Number(calciumMgPer100g) || 0,
        ironMgPer100g: Number(ironMgPer100g) || 0,
        isFavorite: false,
      });

      Alert.alert('Food Created', `${created.name} has been added to your custom food catalog.`, [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save custom food.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>New Custom Food</Text>
          <View style={{ width: 24 }} />
        </View>

        <Card>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Food Name *</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Homemade Paneer Paratha"
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text },
            ]}
          />

          <Text style={[styles.label, { color: colors.textSecondary, marginTop: SPACING.md }]}>
            Brand / Restaurant (Optional)
          </Text>
          <TextInput
            value={brand}
            onChangeText={setBrand}
            placeholder="e.g. Mom's Recipe or Brand Name"
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text },
            ]}
          />

          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.textSecondary, marginTop: SPACING.md }]}>
                Serving Size (g)
              </Text>
              <TextInput
                value={servingSizeG}
                onChangeText={setServingSizeG}
                keyboardType="numeric"
                style={[
                  styles.input,
                  { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text },
                ]}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.textSecondary, marginTop: SPACING.md }]}>
                Serving Unit
              </Text>
              <TextInput
                value={servingUnit}
                onChangeText={setServingUnit}
                placeholder="piece, bowl, g"
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.input,
                  { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text },
                ]}
              />
            </View>
          </View>
        </Card>

        {/* Nutritional baseline per 100g */}
        <Card>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Nutrition Facts (Per 100g)
          </Text>

          <Text style={[styles.label, { color: colors.textSecondary }]}>Calories (kcal) *</Text>
          <TextInput
            value={caloriesPer100g}
            onChangeText={setCaloriesPer100g}
            keyboardType="numeric"
            placeholder="e.g. 250"
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text },
            ]}
          />

          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.protein, marginTop: SPACING.sm }]}>
                Protein (g)
              </Text>
              <TextInput
                value={proteinPer100g}
                onChangeText={setProteinPer100g}
                keyboardType="decimal-pad"
                style={[
                  styles.input,
                  { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text },
                ]}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.carbs, marginTop: SPACING.sm }]}>
                Carbs (g)
              </Text>
              <TextInput
                value={carbsPer100g}
                onChangeText={setCarbsPer100g}
                keyboardType="decimal-pad"
                style={[
                  styles.input,
                  { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text },
                ]}
              />
            </View>
          </View>

          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.fat, marginTop: SPACING.sm }]}>
                Fat (g)
              </Text>
              <TextInput
                value={fatPer100g}
                onChangeText={setFatPer100g}
                keyboardType="decimal-pad"
                style={[
                  styles.input,
                  { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text },
                ]}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.textSecondary, marginTop: SPACING.sm }]}>
                Fiber (g)
              </Text>
              <TextInput
                value={fiberPer100g}
                onChangeText={setFiberPer100g}
                keyboardType="decimal-pad"
                style={[
                  styles.input,
                  { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text },
                ]}
              />
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: SPACING.md, marginBottom: SPACING.xs }]}>
            Micronutrients (Per 100g)
          </Text>

          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.textSecondary, marginTop: SPACING.xs }]}>
                Sodium (mg)
              </Text>
              <TextInput
                value={sodiumMgPer100g}
                onChangeText={setSodiumMgPer100g}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.input,
                  { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text },
                ]}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.textSecondary, marginTop: SPACING.xs }]}>
                Potassium (mg)
              </Text>
              <TextInput
                value={potassiumMgPer100g}
                onChangeText={setPotassiumMgPer100g}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.input,
                  { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text },
                ]}
              />
            </View>
          </View>

          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.textSecondary, marginTop: SPACING.xs }]}>
                Calcium (mg)
              </Text>
              <TextInput
                value={calciumMgPer100g}
                onChangeText={setCalciumMgPer100g}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.input,
                  { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text },
                ]}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.textSecondary, marginTop: SPACING.xs }]}>
                Iron (mg)
              </Text>
              <TextInput
                value={ironMgPer100g}
                onChangeText={setIronMgPer100g}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.input,
                  { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text },
                ]}
              />
            </View>
          </View>
        </Card>

        <Button
          title="Save Custom Food"
          onPress={handleSave}
          loading={isSaving}
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    height: 46,
    borderRadius: RADII.md,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    fontSize: 16,
    fontWeight: '600',
  },
  twoCol: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
});
