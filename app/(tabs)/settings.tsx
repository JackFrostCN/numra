import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, Pressable } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Card } from '@/components/ui/card';
import { Palette, Spacing, Radius } from '@/constants/theme';
import { getSetting, setSetting } from '@/db/queries';

export default function SettingsScreen() {
  const db = useSQLiteContext();
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
                placeholderTextColor={Palette.textMuted}
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
            <MaterialIcons name="delete-forever" size={24} color={Palette.danger} />
            <Text style={s.dangerText}>Erase All Data</Text>
          </View>
        </Card>

        <Text style={s.version}>Numra v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.bg },
  header: { paddingTop: 56, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  title: { fontSize: 24, fontWeight: '700', color: Palette.textPrimary },
  list: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.lg },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: Palette.textMuted, marginTop: Spacing.lg, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 1 },
  card: { padding: Spacing.base },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 16, color: Palette.textPrimary },
  value: { fontSize: 16, color: Palette.textMuted, fontWeight: '500' },
  inputRow: { flexDirection: 'row', gap: Spacing.sm },
  inputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Palette.bgInput, borderRadius: Radius.md, paddingHorizontal: Spacing.md, borderWidth: 1, borderColor: Palette.border },
  inputPrefix: { color: Palette.textMuted, marginRight: 8, fontSize: 16 },
  input: { flex: 1, height: 44, color: Palette.textPrimary, fontSize: 16 },
  saveBtn: { backgroundColor: Palette.accent, justifyContent: 'center', paddingHorizontal: Spacing.lg, borderRadius: Radius.md },
  saveBtnTxt: { color: Palette.white, fontWeight: '600', fontSize: 15 },
  helpText: { fontSize: 13, color: Palette.textMuted, marginTop: Spacing.sm },
  dangerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  dangerText: { fontSize: 16, color: Palette.danger, fontWeight: '600' },
  version: { textAlign: 'center', color: Palette.textMuted, marginTop: Spacing.xl * 2, fontSize: 13 },
});
