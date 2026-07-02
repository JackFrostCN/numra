import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Fonts, Radius, Spacing, type PaletteType } from '@/constants/theme';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { addBill, getBillById, updateBill } from '@/db/queries';
import { useThemeColors } from '@/hooks/useThemeColors';
import { CATEGORIES } from '@/utils/helpers';

export default function AddBillModal() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const colors = useThemeColors();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('1');
  const [category, setCategory] = useState(CATEGORIES.expense[0]);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (id) {
      getBillById(db, parseInt(id, 10)).then((bill) => {
        if (bill) {
          setName(bill.name);
          setAmount(bill.amount.toString());
          setDueDay(bill.due_day.toString());
          setCategory(bill.category);
        }
      });
    }
  }, [id, db]);

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount)) || !name) {
      setErrorMessage('Please enter a valid bill name and amount.');
      setShowError(true);
      return;
    }

    const day = parseInt(dueDay, 10);
    if (isNaN(day) || day < 1 || day > 31) {
      setErrorMessage('The recurring day must be between 1 and 31. Please adjust it and try again.');
      setShowError(true);
      return;
    }

    const payload = { name, amount: Number(amount), due_day: day, category };

    if (id) {
      await updateBill(db, parseInt(id, 10), payload);
    } else {
      await addBill(db, payload);
    }
    router.back();
  };

  const s = createStyles(colors);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.inputGroup}>
        <Text style={s.label}>BILL NAME</Text>
        <TextInput
          style={s.input}
          value={name}
          onChangeText={setName}
          placeholder="Rent, Internet, etc."
          placeholderTextColor={colors.textMuted}
          autoFocus={!id}
        />
      </View>

      <View style={s.inputGroup}>
        <Text style={s.label}>AMOUNT</Text>
        <View style={s.amountInputRow}>
          <Text style={s.amountPrefix}>LKR</Text>
          <TextInput
            style={s.amountInput}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </View>

      <View style={s.inputGroup}>
        <Text style={s.label}>RECURRING DAY OF MONTH</Text>
        <TextInput
          style={s.input}
          value={dueDay}
          onChangeText={setDueDay}
          keyboardType="number-pad"
          placeholder="1 to 31"
          placeholderTextColor={colors.textMuted}
        />
        <Text style={s.helperText}>This bill will repeat on this day every month.</Text>
      </View>

      <View style={s.inputGroup}>
        <Text style={s.label}>CATEGORY</Text>
        <View style={s.chipContainer}>
          {CATEGORIES.expense.map((cat) => (
            <Pressable
              key={cat}
              style={[s.chip, category === cat && s.chipActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[s.chipTxt, category === cat && s.chipTxtActive]}>{cat}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ height: 120 }} />

      <View style={s.saveBtnContainer}>
        <View style={s.saveBtnShadow} />
        <Pressable
          style={[s.saveBtn, { backgroundColor: colors.bill }]}
          onPress={handleSave}
        >
          <Text style={s.saveBtnTxt}>SAVE BILL</Text>
        </Pressable>
      </View>

      <ConfirmModal
        visible={showError}
        title="Invalid Entry"
        message={errorMessage}
        confirmText="OK"
        showCancel={false}
        isDestructive={true}
        onConfirm={() => setShowError(false)}
      />
    </ScrollView>
  );
}

const createStyles = (colors: PaletteType) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: Spacing.lg },
  inputGroup: { marginBottom: Spacing.lg },
  label: { fontSize: 13, fontFamily: Fonts.heading, color: colors.textSecondary, marginBottom: Spacing.sm, letterSpacing: 1 },
  input: { backgroundColor: colors.bgInput, borderWidth: colors.borderWidth, borderColor: colors.border, paddingHorizontal: Spacing.base, height: 48, fontSize: 15, fontFamily: Fonts.body, color: colors.textPrimary, borderRadius: Radius.md },
  amountInputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgCard, borderWidth: colors.borderWidth, borderColor: colors.border, paddingHorizontal: Spacing.base, borderRadius: Radius.md },
  amountPrefix: { fontSize: 24, fontFamily: Fonts.body, color: colors.bill, marginRight: Spacing.md },
  amountInput: { flex: 1, height: 64, fontSize: 36, fontFamily: Fonts.mono, color: colors.textPrimary },
  helperText: { fontSize: 12, fontFamily: Fonts.bodyRegular, color: colors.textMuted, marginTop: 8 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.bgElevated, borderRadius: Radius.full },
  chipActive: { backgroundColor: colors.bill },
  chipTxt: { fontSize: 13, fontFamily: Fonts.body, color: colors.textSecondary },
  chipTxtActive: { color: '#FFFFFF', fontFamily: Fonts.heading },
  saveBtnContainer: { position: 'absolute', bottom: Spacing.xl, left: Spacing.lg, right: Spacing.lg },
  saveBtnShadow: { display: 'none' },
  saveBtn: { height: 56, justifyContent: 'center', alignItems: 'center', borderRadius: Radius.full },
  saveBtnTxt: { fontSize: 16, fontFamily: Fonts.heading, color: '#FFFFFF', letterSpacing: 1 },
});
