import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAppData } from '../context/AppDataContext';
import { exportAllData, importData, wipeAllLocalData } from '../services/backupService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SPACING, RADII } from '../constants/theme';

export default function DataManagementScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { reloadAll } = useAppData();

  const [exportedJson, setExportedJson] = useState('');
  const [importJsonText, setImportJsonText] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await exportAllData();
      const formatted = JSON.stringify(data, null, 2);
      setExportedJson(formatted);
      Alert.alert(
        'Export Generated',
        'Your complete local data backup has been generated. You can copy the JSON payload below to save it safely.'
      );
    } catch (err: any) {
      Alert.alert('Export Failed', err.message || 'Unable to generate backup.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (mode: 'replace' | 'merge') => {
    if (!importJsonText.trim()) {
      Alert.alert('Empty Input', 'Please paste a valid JSON backup string to import.');
      return;
    }

    try {
      const parsed = JSON.parse(importJsonText);
      setIsImporting(true);

      const res = await importData(parsed, mode);
      await reloadAll();

      Alert.alert('Success', res.message, [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)'),
        },
      ]);
    } catch (err: any) {
      Alert.alert(
        'Import Error',
        err.message || 'Failed to parse or validate imported backup file.'
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleConfirmWipe = () => {
    Alert.alert(
      'Permanent Data Wipe',
      'This will delete all your local food entries, weight history, step logs, and profile records. This action cannot be undone unless you have a backup.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Wipe Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              await wipeAllLocalData();
              await reloadAll();
              Alert.alert('Reset Complete', 'All local data was erased.', [
                {
                  text: 'OK',
                  onPress: () => router.replace('/onboarding'),
                },
              ]);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to reset local database.');
            }
          },
        },
      ]
    );
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Data Management</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Export Card */}
        <Card>
          <View style={styles.cardHeader}>
            <Ionicons name="download-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Export Local Backup</Text>
          </View>
          <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
            Export all your biometrics, food entries, custom foods, weight logs, and daily step history into a documented JSON file.
          </Text>

          <Button
            title="Generate Backup JSON"
            onPress={handleExport}
            loading={isExporting}
            style={{ marginVertical: SPACING.sm }}
          />

          {exportedJson ? (
            <View style={styles.jsonPreviewBox}>
              <Text style={[styles.jsonLabel, { color: colors.textMuted }]}>
                Backup JSON (Ready to copy & save):
              </Text>
              <TextInput
                value={exportedJson}
                multiline
                editable={false}
                style={[
                  styles.jsonInput,
                  { backgroundColor: colors.inputBg, borderColor: colors.cardBorder, color: colors.text },
                ]}
              />
            </View>
          ) : null}
        </Card>

        {/* Import Card */}
        <Card>
          <View style={styles.cardHeader}>
            <Ionicons name="cloud-upload-outline" size={20} color={colors.info} style={{ marginRight: 8 }} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Restore / Import Backup</Text>
          </View>
          <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
            Paste a valid CalcLog backup JSON payload below. All data is validated before insertion in an atomic transaction.
          </Text>

          <TextInput
            value={importJsonText}
            onChangeText={setImportJsonText}
            multiline
            placeholder='Paste backup JSON here (e.g. {"version": 1, ...})'
            placeholderTextColor={colors.textMuted}
            style={[
              styles.jsonInputArea,
              { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text },
            ]}
          />

          <View style={styles.importActions}>
            <Button
              title="Replace All Data"
              variant="danger"
              onPress={() => handleImport('replace')}
              loading={isImporting}
              style={{ flex: 1 }}
            />
            <Button
              title="Merge with Existing"
              variant="secondary"
              onPress={() => handleImport('merge')}
              loading={isImporting}
              style={{ flex: 1 }}
            />
          </View>
        </Card>

        {/* Wipe Data Card */}
        <Card style={{ borderColor: colors.danger, borderWidth: 1 }}>
          <View style={styles.cardHeader}>
            <Ionicons name="trash-bin-outline" size={20} color={colors.danger} style={{ marginRight: 8 }} />
            <Text style={[styles.cardTitle, { color: colors.danger }]}>Erase All Local Data</Text>
          </View>
          <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
            Permanently wipes all SQLite database records and returns the app to pristine first-launch state.
          </Text>

          <Button
            title="Wipe Local Database"
            variant="danger"
            onPress={handleConfirmWipe}
            style={{ marginTop: SPACING.sm }}
          />
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  jsonPreviewBox: {
    marginTop: SPACING.sm,
  },
  jsonLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  jsonInput: {
    height: 120,
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: SPACING.sm,
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  jsonInputArea: {
    height: 100,
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: SPACING.sm,
    fontSize: 12,
    marginBottom: SPACING.md,
    textAlignVertical: 'top',
  },
  importActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
});
