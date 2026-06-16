import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable, Platform, KeyboardAvoidingView } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { addBill, getBillById, updateBill } from '@/db/queries';
import { BILL_CATEGORIES } from '@/types';
import { useEffect } from 'react';
import { Spacing, Radius, type PaletteType } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function AddBillModal() {
  const db = useSQLiteContext();
  const router = useRouter();
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>(BILL_CATEGORIES[0]);
  const [dueDay, setDueDay] = useState('');

  useEffect(() => {
    if (id) {
      getBillById(db, Number(id)).then(bill => {
        if (bill) {
          setName(bill.name);
          setAmount(bill.amount.toString());
          setCategory(bill.category);
          setDueDay(bill.due_day.toString());
        }
      });
    }
  }, [id, db]);

  const handleSave = async () => {
    if (!name.trim() || !amount || isNaN(Number(amount)) || !dueDay || isNaN(Number(dueDay))) return;
    if (isEditing) {
      await updateBill(db, Number(id), {
        name: name.trim(),
        amount: Number(amount),
        category,
        due_day: parseInt(dueDay, 10),
      });
    } else {
      await addBill(db, {
        name: name.trim(),
        amount: Number(amount),
        category,
        due_day: parseInt(dueDay, 10),
        is_recurring: true,
      });
    }
    router.back();
  };

  const s = createStyles(colors);

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 80}
    >
      <Stack.Screen options={{ title: isEditing ? 'Edit Bill' : 'Add Bill' }} />
      <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.label}>Bill Name</Text>
      <TextInput
        style={s.inputBig}
        value={name}
        onChangeText={setName}
        placeholder="E.g. Netflix"
        placeholderTextColor={colors.textMuted}
        autoFocus
      />

      <Text style={s.label}>Amount (LKR)</Text>
      <TextInput
        style={s.input}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="0.00"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={s.label}>Due Day (1-31)</Text>
      <TextInput
        style={s.input}
        value={dueDay}
        onChangeText={setDueDay}
        keyboardType="numeric"
        maxLength={2}
        placeholder="e.g. 15"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={s.label}>Category</Text>
      <View style={s.chipContainer}>
        {BILL_CATEGORIES.map(cat => (
          <Pressable 
            key={cat} 
            style={[s.chip, category === cat && s.chipActive]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[s.chipTxt, category === cat && s.activeTxt]}>{cat}</Text>
          </Pressable>
        ))}
      </View>

        <Pressable style={s.saveBtn} onPress={handleSave}>
          <Text style={s.saveTxt}>{isEditing ? 'Update Bill' : 'Save Bill'}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: PaletteType) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: Spacing.lg },
  label: { fontSize: 13, color: colors.textSecondary, marginBottom: Spacing.xs, marginTop: Spacing.md },
  inputBig: { fontSize: 32, fontWeight: '700', color: colors.textPrimary, borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: Spacing.sm, marginBottom: Spacing.sm },
  input: { backgroundColor: colors.bgInput, borderRadius: Radius.md, paddingHorizontal: Spacing.md, height: 48, color: colors.textPrimary, fontSize: 16, borderWidth: 1, borderColor: colors.border },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.bill, borderColor: colors.bill },
  chipTxt: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  activeTxt: { color: colors.white },
  saveBtn: { backgroundColor: colors.accent, height: 52, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.xl * 1.5 },
  saveTxt: { color: colors.white, fontSize: 16, fontWeight: '600' },
});
