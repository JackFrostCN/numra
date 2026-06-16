import { Radius, Spacing, type PaletteType } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { addLoan } from '@/db/queries';
import type { TransactionSource } from '@/types';
import { getTodayISO } from '@/utils/helpers';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function AddLoanModal() {
  const db = useSQLiteContext();
  const router = useRouter();
  const colors = useThemeColors();

  const [type, setType] = useState<'borrowed' | 'lent'>('borrowed');
  const [source, setSource] = useState<TransactionSource>('bank');
  const [amount, setAmount] = useState('');
  const [person, setPerson] = useState('');
  const [date, setDate] = useState(getTodayISO());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirmDate = (selectedDate: Date) => {
    setDate(selectedDate.toISOString().split('T')[0]);
    hideDatePicker();
  };

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount)) || !person.trim()) return;

    await addLoan(db, {
      type,
      person_name: person.trim(),
      date,
      source,
      total_amount: Number(amount),
    });
    router.back();
  };

  const s = createStyles(colors);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 80}
    >
      <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <View style={s.typeToggle}>
          <Pressable style={[s.toggleBtn, type === 'borrowed' && s.borrowedActive]} onPress={() => setType('borrowed')}>
            <Text style={[s.toggleTxt, type === 'borrowed' && s.activeTxt]}>I Owe</Text>
          </Pressable>
          <Pressable style={[s.toggleBtn, type === 'lent' && s.lentActive]} onPress={() => setType('lent')}>
            <Text style={[s.toggleTxt, type === 'lent' && s.activeTxt]}>Owed To Me</Text>
          </Pressable>
        </View>

        <Text style={s.label}>{type === 'borrowed' ? 'Received In' : 'Paid From'}</Text>
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

        <Text style={s.label}>Amount (LKR)</Text>
        <TextInput
          style={s.inputBig}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="0.00"
          placeholderTextColor={colors.textMuted}
          autoFocus
        />

        <Text style={s.label}>Person Name</Text>
        <TextInput
          style={s.input}
          value={person}
          onChangeText={setPerson}
          placeholder="Name"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={s.label}>Date</Text>
        <Pressable style={s.dateInput} onPress={showDatePicker}>
          <Text style={s.dateText}>{date}</Text>
        </Pressable>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirmDate}
          onCancel={hideDatePicker}
          date={new Date(date)}
        />

        <Pressable style={s.saveBtn} onPress={handleSave}>
          <Text style={s.saveTxt}>Save Loan</Text>
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
  borrowedActive: { backgroundColor: colors.expense },
  lentActive: { backgroundColor: colors.income },
  toggleTxt: { fontSize: 15, fontWeight: '600', color: colors.textMuted },
  activeTxt: { color: colors.white },
  label: { fontSize: 13, color: colors.textSecondary, marginBottom: Spacing.xs, marginTop: Spacing.md },
  inputBig: { fontSize: 36, fontWeight: '700', color: colors.textPrimary, borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: Spacing.sm, marginBottom: Spacing.sm },
  input: { backgroundColor: colors.bgInput, borderRadius: Radius.md, paddingHorizontal: Spacing.md, height: 48, color: colors.textPrimary, fontSize: 16, borderWidth: 1, borderColor: colors.border },
  dateInput: { backgroundColor: colors.bgInput, borderRadius: Radius.md, paddingHorizontal: Spacing.md, height: 48, justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  dateText: { color: colors.textPrimary, fontSize: 16 },
  sourceToggle: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  sourceBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: Radius.full, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border },
  sourceBankActive: { backgroundColor: colors.bank, borderColor: colors.bank },
  sourceHandActive: { backgroundColor: colors.wallet, borderColor: colors.wallet },
  sourceTxt: { fontSize: 14, fontWeight: '500', color: colors.textMuted },
  saveBtn: { backgroundColor: colors.accent, height: 52, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.xl * 1.5 },
  saveTxt: { color: colors.white, fontSize: 16, fontWeight: '600' },
});
