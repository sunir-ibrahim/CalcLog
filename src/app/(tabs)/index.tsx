import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAppData } from '../../context/AppDataContext';
import { DateHeader } from '../../components/ui/DateHeader';
import { CalorieRing } from '../../components/ui/CalorieRing';
import { MacroBar } from '../../components/ui/MacroBar';
import { MicronutrientSummaryCard } from '../../components/ui/MicronutrientSummaryCard';
import { StepProgressCard } from '../../components/ui/StepProgressCard';
import { WeightSummaryCard } from '../../components/ui/WeightSummaryCard';
import { Card } from '../../components/ui/Card';
import { SPACING, RADII } from '../../constants/theme';

export default function DashboardScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    isLoading,
    profile,
    settings,
    targets,
    selectedDate,
    setSelectedDate,
    daySummary,
    dayActivity,
    weightHistory,
  } = useAppData();

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading CalcLog...
        </Text>
      </View>
    );
  }

  const calorieTarget = targets?.targetCalories || 2000;
  const caloriesConsumed = daySummary.totalCalories;
  const proteinTarget = targets?.macroTargets.proteinGrams || 150;
  const carbsTarget = targets?.macroTargets.carbsGrams || 200;
  const fatTarget = targets?.macroTargets.fatGrams || 65;

  const currentSteps = dayActivity?.steps || 0;
  const stepGoal = dayActivity?.stepGoal || settings.defaultStepGoal || 8000;
  const targetWeight = profile?.targetWeightKg || 70;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.headerLeft}>
            <Image
              source={require('../../../assets/images/logo.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <View>
              <Text style={[styles.greeting, { color: colors.textMuted }]}>
                {profile?.goalType === 'lose'
                  ? 'Weight Loss Journey'
                  : profile?.goalType === 'gain'
                  ? 'Muscle Gain Journey'
                  : 'Healthy Maintenance'}
              </Text>
              <Text style={[styles.appHeaderTitle, { color: colors.text }]}>
                CalcLog
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile')}
            style={[styles.profileButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          >
            <Ionicons name="settings-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Date Selector Header */}
        <DateHeader currentDate={selectedDate} onDateChange={setSelectedDate} />

        {/* Calorie Ring Summary Card */}
        <Card style={styles.calorieCard}>
          <CalorieRing target={calorieTarget} consumed={caloriesConsumed} />
          <MacroBar
            proteinConsumed={daySummary.totalProteinG}
            proteinTarget={proteinTarget}
            carbsConsumed={daySummary.totalCarbsG}
            carbsTarget={carbsTarget}
            fatConsumed={daySummary.totalFatG}
            fatTarget={fatTarget}
          />
        </Card>

        {/* Quick Actions Row */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            onPress={() => router.push('/food/search')}
            style={[styles.quickActionBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle" size={20} color="#FFFFFF" />
            <Text style={styles.quickActionText}>Log Food</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/step-modal')}
            style={[styles.quickActionBtnSecondary, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            activeOpacity={0.8}
          >
            <Ionicons name="footsteps-outline" size={18} color={colors.steps} />
            <Text style={[styles.quickActionTextSecondary, { color: colors.text }]}>Steps</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/weight-modal')}
            style={[styles.quickActionBtnSecondary, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            activeOpacity={0.8}
          >
            <Ionicons name="scale-outline" size={18} color={colors.weight} />
            <Text style={[styles.quickActionTextSecondary, { color: colors.text }]}>Weight</Text>
          </TouchableOpacity>
        </View>

        {/* Micronutrients Breakdown Card */}
        <MicronutrientSummaryCard summary={daySummary} />

        {/* Steps Card */}
        <StepProgressCard
          steps={currentSteps}
          goal={stepGoal}
          onUpdatePress={() => router.push('/step-modal')}
        />

        {/* Weight Summary Card */}
        <WeightSummaryCard
          weightEntries={weightHistory}
          targetWeightKg={targetWeight}
          onRecordPress={() => router.push('/weight-modal')}
        />

        {/* Bottom Navigation Shortcut Card */}
        <View style={styles.navRow}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/food-diary')}
            style={[styles.navCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          >
            <Ionicons name="book-outline" size={24} color={colors.primary} />
            <Text style={[styles.navCardTitle, { color: colors.text }]}>Food Diary</Text>
            <Text style={[styles.navCardSub, { color: colors.textMuted }]}>
              {daySummary.entries.length} items logged
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(tabs)/progress')}
            style={[styles.navCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          >
            <Ionicons name="analytics-outline" size={24} color={colors.info} />
            <Text style={[styles.navCardTitle, { color: colors.text }]}>Progress</Text>
            <Text style={[styles.navCardSub, { color: colors.textMuted }]}>Weight Trends</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 14,
    fontWeight: '500',
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerLogo: {
    width: 42,
    height: 42,
    borderRadius: 10,
  },
  greeting: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  appHeaderTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: RADII.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calorieCard: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  quickActionBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
    borderRadius: RADII.lg,
    gap: 6,
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  quickActionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADII.lg,
    borderWidth: 1,
    gap: 6,
  },
  quickActionTextSecondary: {
    fontSize: 13,
    fontWeight: '700',
  },
  navRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  navCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: RADII.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  navCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: SPACING.xs,
  },
  navCardSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});
