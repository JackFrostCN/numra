import { Radius, Spacing, type PaletteType } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { addWithdrawal } from '@/db/queries';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, Platform, KeyboardAvoidingView } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function WithdrawModal() {
  const db = useSQLiteContext();
  const router = useRouter();
  const colors = useThemeColors();

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirmDate = (selectedDate: Date) => {
    setDate(selectedDate.toISOString());
    hideDatePicker();
  };

  const formattedDisplayDate = new Date(date).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;

    await addWithdrawal(db, {
      amount: Number(amount),
      date,
      note: note.trim() || undefined,
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
        {/* Visual flow indicator */}
        <View style={s.flowRow}>
          <View style={s.flowNode}>
            <View style={[s.flowIcon, { backgroundColor: colors.bankBg }]}>
              <MaterialIcons name="account-balance" size={24} color={colors.bank} />
            </View>
            <Text style={s.flowLabel}>Bank</Text>
          </View>
          <MaterialIcons name="arrow-forward" size={24} color={colors.textMuted} />
          <View style={s.flowNode}>
            <View style={[s.flowIcon, { backgroundColor: colors.walletBg }]}>
              <MaterialIcons name="account-balance-wallet" size={24} color={colors.wallet} />
            </View>
            <Text style={s.flowLabel}>Hand</Text>
          </View>
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

        <Text style={s.label}>Note (Optional)</Text>
        <TextInput
          style={s.input}
          value={note}
          onChangeText={setNote}
          placeholder="e.g. ATM withdrawal, pocket money"
          placeholderTextColor={colors.textMuted}
        />

        <Pressable style={s.saveBtn} onPress={handleSave}>
          <MaterialIcons name="account-balance-wallet" size={20} color={colors.white} />
          <Text style={s.saveTxt}>Withdraw to Hand</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: PaletteType) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: Spacing.lg },
  flowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.md,
    backgroundColor: colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  flowNode: { alignItems: 'center', gap: Spacing.xs },
  flowIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  label: { fontSize: 13, color: colors.textSecondary, marginBottom: Spacing.xs, marginTop: Spacing.md },
  inputBig: { fontSize: 36, fontWeight: '700', color: colors.textPrimary, borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: Spacing.sm, marginBottom: Spacing.sm },
  input: { backgroundColor: colors.bgInput, borderRadius: Radius.md, paddingHorizontal: Spacing.md, height: 48, color: colors.textPrimary, fontSize: 16, borderWidth: 1, borderColor: colors.border },
  dateInput: { backgroundColor: colors.bgInput, borderRadius: Radius.md, paddingHorizontal: Spacing.md, height: 48, justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  dateText: { color: colors.textPrimary, fontSize: 16 },
  saveBtn: {
    backgroundColor: colors.wallet,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl * 1.5,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  saveTxt: { color: colors.white, fontSize: 16, fontWeight: '600' },
});
