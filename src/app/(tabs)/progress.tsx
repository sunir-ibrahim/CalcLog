import React from 'react';
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
import Svg, { Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { useAppData } from '../../context/AppDataContext';
import { Card } from '../../components/ui/Card';
import { formatDisplayDate } from '../../utils/dateUtils';
import { analyzeWeightProgress } from '../../database/repositories/weightRepo';
import { SPACING, RADII } from '../../constants/theme';

export default function ProgressScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    profile,
    targets,
    weightHistory,
    deleteWeight,
  } = useAppData();

  const targetWeight = profile?.targetWeightKg || 70;
  const analysis = analyzeWeightProgress(weightHistory, targetWeight);

  const handleDelete = (id: string) => {
    Alert.alert('Delete Weight Record', 'Are you sure you want to delete this measurement?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteWeight(id) },
    ]);
  };

  // Render SVG Trend Chart (sorted chronologically ASC for graph)
  const chartData = [...weightHistory].reverse();
  const canRenderChart = chartData.length >= 2;

  const chartHeight = 160;
  const chartWidth = 320;
  const paddingX = 25;
  const paddingY = 25;

  let pointsString = '';
  let minW = 0;
  let maxW = 100;
  let chartPoints: Array<{ x: number; y: number; weight: number; date: string }> = [];

  if (canRenderChart) {
    const weights = chartData.map((d) => d.weightKg);
    minW = Math.floor(Math.min(...weights) - 1);
    maxW = Math.ceil(Math.max(...weights) + 1);
    const range = Math.max(1, maxW - minW);

    chartPoints = chartData.map((d, idx) => {
      const x = paddingX + (idx / (chartData.length - 1)) * (chartWidth - paddingX * 2);
      const y =
        chartHeight -
        paddingY -
        ((d.weightKg - minW) / range) * (chartHeight - paddingY * 2);
      return { x, y, weight: d.weightKg, date: d.entryDate };
    });

    pointsString = chartPoints.map((p) => `${p.x},${p.y}`).join(' ');
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.topRow}>
          <Text style={[styles.screenTitle, { color: colors.text }]}>Weight & Progress</Text>
          <TouchableOpacity
            onPress={() => router.push('/weight-modal')}
            style={[styles.recordBtn, { backgroundColor: colors.weight }]}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.recordBtnText}>Record Weight</Text>
          </TouchableOpacity>
        </View>

        {/* Milestone Card */}
        <Card>
          <View style={styles.milestoneRow}>
            <View style={styles.milestoneItem}>
              <Text style={[styles.milestoneLabel, { color: colors.textMuted }]}>Current</Text>
              <Text style={[styles.milestoneValue, { color: colors.text }]}>
                {analysis.currentWeight} <Text style={{ fontSize: 13, fontWeight: '500' }}>kg</Text>
              </Text>
            </View>

            <View style={[styles.verticalDivider, { backgroundColor: colors.cardBorder }]} />

            <View style={styles.milestoneItem}>
              <Text style={[styles.milestoneLabel, { color: colors.textMuted }]}>Target</Text>
              <Text style={[styles.milestoneValue, { color: colors.primary }]}>
                {targetWeight} <Text style={{ fontSize: 13, fontWeight: '500' }}>kg</Text>
              </Text>
            </View>

            <View style={[styles.verticalDivider, { backgroundColor: colors.cardBorder }]} />

            <View style={styles.milestoneItem}>
              <Text style={[styles.milestoneLabel, { color: colors.textMuted }]}>To Goal</Text>
              <Text
                style={[
                  styles.milestoneValue,
                  {
                    color:
                      analysis.weightDeltaToTarget === 0
                        ? colors.success
                        : analysis.weightDeltaToTarget > 0
                        ? colors.warning
                        : colors.info,
                  },
                ]}
              >
                {analysis.weightDeltaToTarget > 0 ? `+${analysis.weightDeltaToTarget}` : analysis.weightDeltaToTarget} kg
              </Text>
            </View>
          </View>

          {analysis.totalChangeKg !== null && (
            <View style={[styles.summaryBanner, { backgroundColor: colors.inputBg }]}>
              <Ionicons
                name={analysis.totalChangeKg <= 0 ? 'checkmark-circle' : 'trending-up'}
                size={16}
                color={analysis.totalChangeKg <= 0 ? colors.success : colors.warning}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
                Overall change: {analysis.totalChangeKg > 0 ? `+${analysis.totalChangeKg}` : analysis.totalChangeKg} kg across {analysis.historyCount} logs
              </Text>
            </View>
          )}
        </Card>

        {/* Weight Trend Chart Card */}
        <Card>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleRow}>
              <Ionicons name="pulse" size={18} color={colors.weight} style={{ marginRight: 6 }} />
              <Text style={[styles.chartTitle, { color: colors.text }]}>Weight Trend</Text>
            </View>
            {canRenderChart && (
              <Text style={[styles.chartRange, { color: colors.textMuted }]}>
                {minW} - {maxW} kg range
              </Text>
            )}
          </View>

          {canRenderChart ? (
            <View style={styles.svgContainer}>
              <Svg width={chartWidth} height={chartHeight}>
                {/* Horizontal grid lines */}
                <Line
                  x1={paddingX}
                  y1={paddingY}
                  x2={chartWidth - paddingX}
                  y2={paddingY}
                  stroke={colors.cardBorder}
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
                <Line
                  x1={paddingX}
                  y1={chartHeight - paddingY}
                  x2={chartWidth - paddingX}
                  y2={chartHeight - paddingY}
                  stroke={colors.cardBorder}
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />

                {/* Trend Polyline */}
                <Polyline
                  points={pointsString}
                  fill="none"
                  stroke={colors.weight}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points */}
                {chartPoints.map((pt, i) => (
                  <Circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r={5}
                    fill={colors.weight}
                    stroke={colors.card}
                    strokeWidth="2"
                  />
                ))}
              </Svg>

              <View style={styles.chartDatesRow}>
                <Text style={[styles.chartDateLabel, { color: colors.textMuted }]}>
                  {formatDisplayDate(chartData[0].entryDate)}
                </Text>
                <Text style={[styles.chartDateLabel, { color: colors.textMuted }]}>
                  {formatDisplayDate(chartData[chartData.length - 1].entryDate)}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyChart}>
              <Ionicons name="bar-chart-outline" size={32} color={colors.textMuted} />
              <Text style={[styles.emptyChartText, { color: colors.textMuted }]}>
                Record at least 2 weight measurements to generate your historical trend line.
              </Text>
            </View>
          )}
        </Card>

        {/* BMI & Healthy Reference Weight Card */}
        {targets && (
          <Card>
            <View style={styles.bmiHeader}>
              <Ionicons name="fitness-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.bmiTitle, { color: colors.text }]}>
                Body Mass Index (BMI) Reference
              </Text>
            </View>

            <View style={styles.bmiRow}>
              <View>
                <Text style={[styles.bmiValue, { color: colors.text }]}>{targets.bmi}</Text>
                <Text style={[styles.bmiCategory, { color: colors.primary }]}>
                  {targets.bmiCategory}
                </Text>
              </View>

              <View style={styles.referenceRangeCol}>
                <Text style={[styles.rangeLabel, { color: colors.textMuted }]}>
                  Healthy Adult Range (18.5–24.9)
                </Text>
                <Text style={[styles.rangeValue, { color: colors.text }]}>
                  {targets.healthyWeightRangeKg[0]} kg – {targets.healthyWeightRangeKg[1]} kg
                </Text>
              </View>
            </View>

            <Text style={[styles.bmiDisclaimer, { color: colors.textMuted }]}>
              Notice: BMI is an epidemiological screening indicator, not an individual health diagnosis. It does not measure lean muscle mass versus adipose tissue.
            </Text>
          </Card>
        )}

        {/* Measurement Logs List */}
        <Card>
          <View style={styles.logsHeader}>
            <Text style={[styles.logsTitle, { color: colors.text }]}>Weight History</Text>
            <Text style={[styles.logsCount, { color: colors.textMuted }]}>
              {weightHistory.length} logs
            </Text>
          </View>

          {weightHistory.length === 0 ? (
            <View style={styles.emptyLogs}>
              <Text style={[styles.emptyLogsText, { color: colors.textMuted }]}>
                No weight records yet.
              </Text>
            </View>
          ) : (
            <View style={styles.logsList}>
              {weightHistory.map((item, idx) => (
                <View
                  key={item.id}
                  style={[
                    styles.logRow,
                    { borderTopColor: colors.cardBorder },
                    idx > 0 && { borderTopWidth: 1 },
                  ]}
                >
                  <View>
                    <Text style={[styles.logDate, { color: colors.text }]}>
                      {formatDisplayDate(item.entryDate)}
                    </Text>
                    {item.notes ? (
                      <Text style={[styles.logNotes, { color: colors.textMuted }]}>
                        {item.notes}
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.logRight}>
                    <Text style={[styles.logWeight, { color: colors.text }]}>
                      {item.weightKg} <Text style={{ fontSize: 12, fontWeight: '500' }}>kg</Text>
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleDelete(item.id)}
                      style={styles.trashBtn}
                      accessibilityLabel="Delete entry"
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>
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
  recordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADII.md,
  },
  recordBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: SPACING.xs,
  },
  milestoneItem: {
    alignItems: 'center',
    flex: 1,
  },
  verticalDivider: {
    width: 1,
    height: 32,
  },
  milestoneLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  milestoneValue: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  summaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: RADII.md,
    marginTop: SPACING.md,
  },
  summaryText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  chartTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  chartRange: {
    fontSize: 12,
    fontWeight: '500',
  },
  svgContainer: {
    alignItems: 'center',
  },
  chartDatesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.xs,
  },
  chartDateLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  emptyChart: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyChartText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: SPACING.sm,
    maxWidth: 240,
  },
  bmiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  bmiTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  bmiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: SPACING.sm,
  },
  bmiValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  bmiCategory: {
    fontSize: 13,
    fontWeight: '700',
  },
  referenceRangeCol: {
    alignItems: 'flex-end',
  },
  rangeLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  rangeValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  bmiDisclaimer: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: SPACING.xs,
  },
  logsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  logsCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyLogs: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  emptyLogsText: {
    fontSize: 13,
  },
  logsList: {
    marginTop: SPACING.xs,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  logDate: {
    fontSize: 14,
    fontWeight: '700',
  },
  logNotes: {
    fontSize: 11,
    marginTop: 2,
  },
  logRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logWeight: {
    fontSize: 16,
    fontWeight: '800',
    marginRight: SPACING.sm,
  },
  trashBtn: {
    padding: 6,
  },
});
