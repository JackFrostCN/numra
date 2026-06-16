import { Radius, Spacing, type PaletteType } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { addTransaction, getTransactionById, updateTransaction } from '@/db/queries';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types';
import type { TransactionSource } from '@/types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, Platform, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useColorScheme } from 'nativewind';

export default function AddTransactionModal() {
  const db = useSQLiteContext();
  const router = useRouter();
  const colors = useThemeColors();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [source, setSource] = useState<TransactionSource>('hand'); // Default to "hand" (Hand Cash)
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      getTransactionById(db, Number(id))
        .then((txn) => {
          if (txn) {
            setType(txn.type);
            setAmount(txn.amount.toString());
            setCategory(txn.category);
            setDescription(txn.description || '');
            setDate(txn.date);
            setSource(txn.source);
          }
        })
        .catch((err) => console.error('Error loading transaction details:', err))
        .finally(() => setLoading(false));
    }
  }, [id, db]);

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

    const data = {
      type,
      amount: Number(amount),
      category,
      description: description.trim() || undefined,
      date,
      source,
    };

    if (isEditing && id) {
      await updateTransaction(db, Number(id), data);
    } else {
      await addTransaction(db, data);
    }
    router.back();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const s = createStyles(colors);

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 80}
    >
      <Stack.Screen options={{ title: isEditing ? 'Edit Transaction' : 'Add Transaction' }} />
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
        placeholderTextColor={colors.textMuted}
        keyboardAppearance={isDark ? 'dark' : 'light'}
        autoFocus
      />

      <Text style={s.label}>{isExpense ? 'Paid From' : 'Received In'}</Text>
      <View style={s.sourceToggle}>
        <Pressable
          style={[s.sourceBtn, source === 'bank' && s.sourceBankActive]}
          onPress={() => setSource('bank')}
        >
          <MaterialIcons name="account-balance" size={16} color={source === 'bank' ? colors.white : colors.textMuted} />
          <Text style={[s.sourceTxt, source === 'bank' && s.activeTxt]}>Bank (Card)</Text>
        </Pressable>
        <Pressable
          style={[s.sourceBtn, source === 'hand' && s.sourceHandActive]}
          onPress={() => setSource('hand')}
        >
          <MaterialIcons name="account-balance-wallet" size={16} color={source === 'hand' ? colors.white : colors.textMuted} />
          <Text style={[s.sourceTxt, source === 'hand' && s.activeTxt]}>Hand (Cash)</Text>
        </Pressable>
      </View>

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
        themeVariant={isDark ? "dark" : "light"}
      />

      <Text style={s.label}>Description (Optional)</Text>
      <TextInput
        style={s.input}
        value={description}
        onChangeText={setDescription}
        placeholderTextColor={colors.textMuted}
        keyboardAppearance={isDark ? 'dark' : 'light'}
      />

        <Pressable style={s.saveBtn} onPress={handleSave}>
          <Text style={s.saveTxt}>{isEditing ? 'Update Transaction' : 'Save Transaction'}</Text>
        </Pressable>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: PaletteType) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: Spacing.lg },
  typeToggle: { flexDirection: 'row', backgroundColor: colors.bgElevated, borderRadius: Radius.lg, padding: 4, marginBottom: Spacing.xl },
  toggleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: Radius.md },
  expenseActive: { backgroundColor: colors.expense },
  incomeActive: { backgroundColor: colors.income },
  toggleTxt: { fontSize: 15, fontWeight: '600', color: colors.textMuted },
  activeTxt: { color: colors.white },
  label: { fontSize: 13, color: colors.textSecondary, marginBottom: Spacing.xs, marginTop: Spacing.md },
  inputBig: { fontSize: 36, fontWeight: '700', color: colors.textPrimary, borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: Spacing.sm, marginBottom: Spacing.sm },
  input: { backgroundColor: colors.bgInput, borderRadius: Radius.md, paddingHorizontal: Spacing.md, height: 48, color: colors.textPrimary, fontSize: 16, borderWidth: 1, borderColor: colors.border },
  dateInput: { backgroundColor: colors.bgInput, borderRadius: Radius.md, paddingHorizontal: Spacing.md, height: 48, justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  dateText: { color: colors.textPrimary, fontSize: 16 },
  sourceToggle: { flexDirection: 'row', backgroundColor: colors.bgElevated, borderRadius: Radius.lg, padding: 4, marginBottom: Spacing.sm },
  sourceBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: Radius.md, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  sourceBankActive: { backgroundColor: colors.bank },
  sourceHandActive: { backgroundColor: colors.wallet },
  sourceTxt: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.border },
  chipExpense: { backgroundColor: colors.expense, borderColor: colors.expense },
  chipIncome: { backgroundColor: colors.income, borderColor: colors.income },
  chipTxt: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  saveBtn: { backgroundColor: colors.accent, height: 52, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.xl * 1.5 },
  saveTxt: { color: colors.white, fontSize: 16, fontWeight: '600' },
});
