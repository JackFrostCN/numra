import { Palette, Radius, Spacing } from '@/constants/theme';
import { addTransaction } from '@/db/queries';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types';
import { getTodayISO } from '@/utils/helpers';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, Platform, KeyboardAvoidingView } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function AddTransactionModal() {
  const db = useSQLiteContext();
  const router = useRouter();

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const isExpense = type === 'expense';
  const categories = isExpense ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirmDate = (selectedDate: Date) => {
    setDate(selectedDate.toISOString());
    hideDatePicker();
  };

  const formattedDisplayDate = new Date(date).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
  });

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount))) return;

    await addTransaction(db, {
      type,
      amount: Number(amount),
      category,
      description: description.trim() || undefined,
      date,
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 80}
    >
      <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <View style={s.typeToggle}>
        <Pressable
          style={[s.toggleBtn, !isExpense && s.incomeActive]}
          onPress={() => { setType('income'); setCategory(INCOME_CATEGORIES[0]); }}
        >
          <Text style={[s.toggleTxt, !isExpense && s.activeTxt]}>Income</Text>
        </Pressable>
        <Pressable
          style={[s.toggleBtn, isExpense && s.expenseActive]}
          onPress={() => { setType('expense'); setCategory(EXPENSE_CATEGORIES[0]); }}
        >
          <Text style={[s.toggleTxt, isExpense && s.activeTxt]}>Expense</Text>
        </Pressable>

      </View>

      <Text style={s.label}>Amount (LKR)</Text>
      <TextInput
        style={s.inputBig}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="0.00"
        placeholderTextColor={Palette.textMuted}
        autoFocus
      />

      <Text style={s.label}>Category</Text>
      <View style={s.chipContainer}>
        {categories.map(cat => (
          <Pressable
            key={cat}
            style={[s.chip, category === cat && (isExpense ? s.chipExpense : s.chipIncome)]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[s.chipTxt, category === cat && s.activeTxt]}>{cat}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={s.label}>Date & Time</Text>
      <Pressable style={s.dateInput} onPress={showDatePicker}>
        <Text style={s.dateText}>{formattedDisplayDate}</Text>
      </Pressable>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
        date={new Date(date)}
      />

      <Text style={s.label}>Description (Optional)</Text>
      <TextInput
        style={s.input}
        value={description}
        onChangeText={setDescription}
        placeholderTextColor={Palette.textMuted}
      />

        <Pressable style={s.saveBtn} onPress={handleSave}>
          <Text style={s.saveTxt}>Save Transaction</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.bg },
  content: { padding: Spacing.lg },
  typeToggle: { flexDirection: 'row', backgroundColor: Palette.bgElevated, borderRadius: Radius.lg, padding: 4, marginBottom: Spacing.xl },
  toggleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: Radius.md },
  expenseActive: { backgroundColor: Palette.expense },
  incomeActive: { backgroundColor: Palette.income },
  toggleTxt: { fontSize: 15, fontWeight: '600', color: Palette.textMuted },
  activeTxt: { color: Palette.white },
  label: { fontSize: 13, color: Palette.textSecondary, marginBottom: Spacing.xs, marginTop: Spacing.md },
  inputBig: { fontSize: 36, fontWeight: '700', color: Palette.textPrimary, borderBottomWidth: 1, borderBottomColor: Palette.border, paddingVertical: Spacing.sm, marginBottom: Spacing.sm },
  input: { backgroundColor: Palette.bgInput, borderRadius: Radius.md, paddingHorizontal: Spacing.md, height: 48, color: Palette.textPrimary, fontSize: 16, borderWidth: 1, borderColor: Palette.border },
  dateInput: { backgroundColor: Palette.bgInput, borderRadius: Radius.md, paddingHorizontal: Spacing.md, height: 48, justifyContent: 'center', borderWidth: 1, borderColor: Palette.border },
  dateText: { color: Palette.textPrimary, fontSize: 16 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: Palette.bgInput, borderWidth: 1, borderColor: Palette.border },
  chipExpense: { backgroundColor: Palette.expense, borderColor: Palette.expense },
  chipIncome: { backgroundColor: Palette.income, borderColor: Palette.income },
  chipTxt: { fontSize: 13, color: Palette.textSecondary, fontWeight: '500' },
  saveBtn: { backgroundColor: Palette.accent, height: 52, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.xl * 1.5 },
  saveTxt: { color: Palette.white, fontSize: 16, fontWeight: '600' },
});
