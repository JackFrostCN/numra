import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, Pressable } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from 'nativewind';
import * as Haptics from 'expo-haptics';

import { Card } from '@/components/ui/card';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Spacing, Fonts, Radius, type PaletteType } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useHaptics } from '@/hooks/useHaptics';
import { getSetting, setSetting } from '@/db/queries';

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const colors = useThemeColors();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const haptics = useHaptics();
  const [budgetInput, setBudgetInput] = useState('0');
  const [savedBudget, setSavedBudget] = useState('0');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [savedName, setSavedName] = useState('');
  const [showNameSaveSuccess, setShowNameSaveSuccess] = useState(false);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  const loadData = useCallback(async () => {
    const fetchedBudget = await getSetting(db, 'monthly_budget');
    const val = fetchedBudget || '0';
    setBudgetInput(val);
    setSavedBudget(val);

    const fetchedName = await getSetting(db, 'user_name');
    const nameVal = fetchedName || '';
    setNameInput(nameVal);
    setSavedName(nameVal);

    const hapticsVal = await getSetting(db, 'haptics_enabled');
    setHapticsEnabled(hapticsVal !== 'false');
  }, [db]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const saveBudget = async () => {
    await setSetting(db, 'monthly_budget', budgetInput);
    setSavedBudget(budgetInput);
    setShowSaveSuccess(true);
    haptics.success();
  };

  const saveName = async () => {
    await setSetting(db, 'user_name', nameInput);
    setSavedName(nameInput);
    setShowNameSaveSuccess(true);
    haptics.success();
  };

  const toggleHaptics = async () => {
    const newVal = !hapticsEnabled;
    setHapticsEnabled(newVal);
    haptics.setEnabled(newVal);
    await setSetting(db, 'haptics_enabled', newVal ? 'true' : 'false');
    // Give a little feedback when turning on
    if (newVal) {
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 50);
    }
  };

  const handleReset = () => {
    Alert.alert('Erase All Data', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Erase Data', 
        style: 'destructive',
        onPress: async () => {
          await db.execAsync(`
            DELETE FROM transactions;
            DELETE FROM loans;
            DELETE FROM loan_payments;
            DELETE FROM bills;
            DELETE FROM bill_payments;
            DELETE FROM withdrawals;
          `);
          Alert.alert('Reset Complete', 'All data has been erased.');
          loadData();
        }
      }
    ]);
  };

  const s = createStyles(colors);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>SETTINGS</Text>
      </View>

      <ScrollView style={s.list} contentContainerStyle={s.listContent}>
        <Text style={s.sectionTitle}>PROFILE</Text>
        <Card style={s.card}>
          <View style={s.inputRow}>
            <View style={s.inputWrapper}>
              <MaterialIcons name="person" size={20} color={colors.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={s.input}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Enter your name"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <Pressable onPress={saveName} style={s.saveBtn}>
              <Text style={s.saveBtnTxt}>SAVE</Text>
            </Pressable>
          </View>
        </Card>

        <Text style={s.sectionTitle}>GENERAL</Text>
        <Card style={s.card}>
          <View style={s.row}>
            <Text style={s.label}>Currency</Text>
            <Text style={s.value}>LKR</Text>
          </View>
        </Card>

        <Card style={s.card}>
          <View style={s.row}>
            <Text style={s.label}>Appearance</Text>
            <View style={s.themeToggleRow}>
              <Pressable 
                style={[s.themeBtn, colorScheme === 'light' && s.themeBtnActive]} 
                onPress={() => colorScheme !== 'light' && toggleColorScheme()}
              >
                <MaterialIcons name="light-mode" size={16} color={colorScheme === 'light' ? '#FFFFFF' : colors.textMuted} />
                <Text style={[s.themeBtnTxt, colorScheme === 'light' && s.themeBtnTxtActive]}>Light</Text>
              </Pressable>
              <View style={s.themeDivider} />
              <Pressable 
                style={[s.themeBtn, colorScheme === 'dark' && s.themeBtnActive]} 
                onPress={() => colorScheme !== 'dark' && toggleColorScheme()}
              >
                <MaterialIcons name="dark-mode" size={16} color={colorScheme === 'dark' ? '#FFFFFF' : colors.textMuted} />
                <Text style={[s.themeBtnTxt, colorScheme === 'dark' && s.themeBtnTxtActive]}>Dark</Text>
              </Pressable>
            </View>
          </View>
        </Card>

        <Card style={s.card}>
          <View style={s.row}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MaterialIcons name="vibration" size={20} color={colors.textPrimary} />
              <Text style={s.label}>Haptic Feedback</Text>
            </View>
            <Pressable onPress={toggleHaptics} style={[s.toggleTrack, hapticsEnabled && s.toggleTrackActive]}>
              <View style={[s.toggleThumb, hapticsEnabled && s.toggleThumbActive]} />
            </Pressable>
          </View>
        </Card>

        <Text style={s.sectionTitle}>MONTHLY BUDGET</Text>
        <Card style={s.card}>
          <View style={s.currentBudgetRow}>
            <Text style={s.currentBudgetLabel}>Current Budget</Text>
            <Text style={s.currentBudgetValue}>LKR {savedBudget}</Text>
          </View>
          <View style={s.inputRow}>
            <View style={s.inputWrapper}>
              <Text style={s.inputPrefix}>LKR</Text>
              <TextInput
                style={s.input}
                value={budgetInput}
                onChangeText={setBudgetInput}
                keyboardType="numeric"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <Pressable onPress={saveBudget} style={s.saveBtn}>
              <Text style={s.saveBtnTxt}>SAVE</Text>
            </Pressable>
          </View>
          <Text style={s.helpText}>Your target monthly spending limit. This is used to calculate your budget progress on the dashboard.</Text>
        </Card>

        <Text style={s.sectionTitle}>DATA MANAGEMENT</Text>
        <View style={{ position: 'relative', marginTop: Spacing.sm }}>
          <View style={s.dangerShadow} />
          <Pressable style={s.dangerCard} onPress={handleReset}>
            <View style={s.dangerRow}>
              <MaterialIcons name="delete-forever" size={24} color="#FFFFFF" />
              <Text style={s.dangerText}>ERASE ALL DATA</Text>
            </View>
          </Pressable>
        </View>

        <Text style={s.version}>Numra v1.0.0</Text>
      </ScrollView>

      <ConfirmModal
        visible={showSaveSuccess}
        title="Saved!"
        message="Monthly budget has been updated successfully."
        confirmText="OK"
        showCancel={false}
        onConfirm={() => setShowSaveSuccess(false)}
      />

      <ConfirmModal
        visible={showNameSaveSuccess}
        title="Saved!"
        message="Your name has been updated successfully."
        confirmText="OK"
        showCancel={false}
        onConfirm={() => setShowNameSaveSuccess(false)}
      />
    </View>
  );
}

const createStyles = (colors: PaletteType) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingTop: 56, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm, borderBottomWidth: colors.borderWidth, borderBottomColor: colors.borderLight, marginBottom: Spacing.sm },
  title: { fontSize: 24, fontFamily: Fonts.heading, color: colors.textPrimary, letterSpacing: 1 },
  list: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.lg },
  sectionTitle: { fontSize: 14, fontFamily: Fonts.heading, color: colors.textMuted, marginTop: Spacing.lg, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 1 },
  card: { padding: Spacing.base, marginBottom: Spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 16, fontFamily: Fonts.body, color: colors.textPrimary },
  value: { fontSize: 16, fontFamily: Fonts.mono, color: colors.textMuted },
  themeToggleRow: { flexDirection: 'row', backgroundColor: colors.bgElevated, borderRadius: Radius.full, padding: 2 },
  themeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full },
  themeDivider: { width: 0 },
  themeBtnActive: { backgroundColor: colors.accent },
  themeBtnTxt: { fontSize: 13, fontFamily: Fonts.heading, color: colors.textMuted },
  themeBtnTxtActive: { color: '#FFFFFF' },
  currentBudgetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md, paddingBottom: Spacing.md, borderBottomWidth: colors.borderWidth, borderBottomColor: colors.borderLight },
  currentBudgetLabel: { fontSize: 16, fontFamily: Fonts.body, color: colors.textPrimary },
  currentBudgetValue: { fontSize: 18, fontFamily: Fonts.mono, color: colors.accent },
  inputRow: { flexDirection: 'row', gap: Spacing.sm },
  inputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgInput, borderWidth: colors.borderWidth, borderColor: colors.border, paddingHorizontal: Spacing.md, borderRadius: Radius.md },
  inputPrefix: { color: colors.textMuted, marginRight: 8, fontFamily: Fonts.body, fontSize: 16 },
  input: { flex: 1, height: 44, color: colors.textPrimary, fontFamily: Fonts.mono, fontSize: 16 },
  saveBtn: { backgroundColor: colors.accent, justifyContent: 'center', paddingHorizontal: Spacing.lg, borderRadius: Radius.md },
  saveBtnTxt: { color: '#FFFFFF', fontFamily: Fonts.heading, fontSize: 15, letterSpacing: 1 },
  helpText: { fontSize: 13, fontFamily: Fonts.bodyRegular, color: colors.textMuted, marginTop: Spacing.md },
  dangerShadow: { display: 'none' },
  dangerCard: { backgroundColor: colors.danger, padding: Spacing.base, borderRadius: Radius.md },
  dangerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  dangerText: { fontSize: 16, fontFamily: Fonts.heading, color: '#FFFFFF', letterSpacing: 1 },
  version: { textAlign: 'center', fontFamily: Fonts.mono, color: colors.textMuted, marginTop: Spacing.xl * 2, marginBottom: Spacing.xl, fontSize: 12 },
  toggleTrack: { width: 44, height: 24, backgroundColor: colors.bgInput, borderRadius: Radius.full, justifyContent: 'center', padding: 2, borderWidth: colors.borderWidth, borderColor: colors.border },
  toggleTrackActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  toggleThumb: { width: 18, height: 18, backgroundColor: colors.textMuted, borderRadius: Radius.full },
  toggleThumbActive: { backgroundColor: '#FFFFFF', transform: [{ translateX: 20 }] },
});
