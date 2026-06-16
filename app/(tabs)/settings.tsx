import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, Pressable } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from 'nativewind';

import { Card } from '@/components/ui/card';
import { Spacing, Radius, type PaletteType } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { getSetting, setSetting } from '@/db/queries';

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const colors = useThemeColors();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const [budget, setBudget] = useState('0');

  const loadData = useCallback(async () => {
    const savedBudget = await getSetting(db, 'monthly_budget');
    setBudget(savedBudget || '0');
  }, [db]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const saveBudget = async () => {
    await setSetting(db, 'monthly_budget', budget);
    Alert.alert('Saved', 'Monthly budget updated successfully.');
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
        <Text style={s.title}>Settings</Text>
      </View>

      <ScrollView style={s.list} contentContainerStyle={s.listContent}>
        <Text style={s.sectionTitle}>General</Text>
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
                <MaterialIcons name="light-mode" size={16} color={colorScheme === 'light' ? colors.white : colors.textMuted} />
                <Text style={[s.themeBtnTxt, colorScheme === 'light' && s.themeBtnTxtActive]}>Light</Text>
              </Pressable>
              <Pressable 
                style={[s.themeBtn, colorScheme === 'dark' && s.themeBtnActive]} 
                onPress={() => colorScheme !== 'dark' && toggleColorScheme()}
              >
                <MaterialIcons name="dark-mode" size={16} color={colorScheme === 'dark' ? colors.white : colors.textMuted} />
                <Text style={[s.themeBtnTxt, colorScheme === 'dark' && s.themeBtnTxtActive]}>Dark</Text>
              </Pressable>
            </View>
          </View>
        </Card>

        <Text style={s.sectionTitle}>Monthly Salary</Text>
        <Card style={s.card}>
          <View style={s.inputRow}>
            <View style={s.inputWrapper}>
              <Text style={s.inputPrefix}>LKR</Text>
              <TextInput
                style={s.input}
                value={budget}
                onChangeText={setBudget}
                keyboardType="numeric"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <Pressable onPress={saveBudget} style={s.saveBtn}>
              <Text style={s.saveBtnTxt}>Save</Text>
            </Pressable>
          </View>
          <Text style={s.helpText}>Your total monthly salary. This is used to calculate your budget and spending progress on the dashboard.</Text>
        </Card>

        <Text style={s.sectionTitle}>Data Management</Text>
        <Card style={s.card} onPress={handleReset}>
          <View style={s.dangerRow}>
            <MaterialIcons name="delete-forever" size={24} color={colors.danger} />
            <Text style={s.dangerText}>Erase All Data</Text>
          </View>
        </Card>

        <Text style={s.version}>Numra v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: PaletteType) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingTop: 56, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  title: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  list: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.lg },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: colors.textMuted, marginTop: Spacing.lg, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 1 },
  card: { padding: Spacing.base, marginBottom: Spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 16, color: colors.textPrimary },
  value: { fontSize: 16, color: colors.textMuted, fontWeight: '500' },
  themeToggleRow: { flexDirection: 'row', backgroundColor: colors.bgInput, borderRadius: Radius.full, padding: 4 },
  themeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full },
  themeBtnActive: { backgroundColor: colors.accent },
  themeBtnTxt: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  themeBtnTxtActive: { color: colors.white },
  inputRow: { flexDirection: 'row', gap: Spacing.sm },
  inputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgInput, borderRadius: Radius.md, paddingHorizontal: Spacing.md, borderWidth: 1, borderColor: colors.border },
  inputPrefix: { color: colors.textMuted, marginRight: 8, fontSize: 16 },
  input: { flex: 1, height: 44, color: colors.textPrimary, fontSize: 16 },
  saveBtn: { backgroundColor: colors.accent, justifyContent: 'center', paddingHorizontal: Spacing.lg, borderRadius: Radius.md },
  saveBtnTxt: { color: colors.white, fontWeight: '600', fontSize: 15 },
  helpText: { fontSize: 13, color: colors.textMuted, marginTop: Spacing.sm },
  dangerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  dangerText: { fontSize: 16, color: colors.danger, fontWeight: '600' },
  version: { textAlign: 'center', color: colors.textMuted, marginTop: Spacing.xl * 2, fontSize: 13 },
});
