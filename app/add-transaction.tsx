import { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Spacing, Fonts, Radius, type PaletteType } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { addTransaction, updateTransaction, getTransactionById, addDeposit, addWithdrawal } from '@/db/queries';
import { CATEGORIES, getTodayISO, formatDateShort } from '@/utils/helpers';
import type { TransactionType } from '@/types';

type FormMode = 'expense' | 'income' | 'deposit' | 'withdraw';

export default function AddTransactionModal() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const colors = useThemeColors();

  const [type, setType] = useState<FormMode>('expense');
  const [source, setSource] = useState<'bank' | 'hand'>('hand');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES.expense[0]);
  const [date, setDate] = useState(getTodayISO());
  const [description, setDescription] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  useEffect(() => {
    if (id) {
      getTransactionById(db, parseInt(id, 10)).then((txn) => {
        if (txn) {
          setType(txn.type);
          setSource(txn.source);
          setAmount(txn.amount.toString());
          setCategory(txn.category);
          setDate(txn.date);
          setDescription(txn.description || '');
        }
      });
    }
  }, [id, db]);

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount))) {
      alert('Please enter a valid amount');
      return;
    }

    if (type === 'deposit') {
      await addDeposit(db, { amount: Number(amount), date, note: description });
      router.back();
      return;
    }

    if (type === 'withdraw') {
      await addWithdrawal(db, { amount: Number(amount), date, note: description });
      router.back();
      return;
    }

    const payload = { type: type as TransactionType, source, amount: Number(amount), category, date, description };

    if (id) {
      await updateTransaction(db, parseInt(id, 10), payload);
    } else {
      await addTransaction(db, payload);
    }
    router.back();
  };

  const handleTypeChange = (newType: FormMode) => {
    setType(newType);
    if (newType === 'expense' || newType === 'income') {
      setCategory(CATEGORIES[newType][0]);
    }
  };

  const s = createStyles(colors);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Type Toggle */}
      <View style={s.typeToggleContainer}>
        <View style={{ gap: Spacing.sm }}>
          <View style={s.typeToggleRow}>
            <Pressable style={[s.typeBtn, type === 'expense' && s.typeBtnExpenseActive]} onPress={() => handleTypeChange('expense')}>
              <Text style={[s.typeBtnTxt, type === 'expense' && s.typeBtnTxtActive]}>EXPENSE</Text>
            </Pressable>
            <View style={s.typeDivider} />
            <Pressable style={[s.typeBtn, type === 'income' && s.typeBtnIncomeActive]} onPress={() => handleTypeChange('income')}>
              <Text style={[s.typeBtnTxt, type === 'income' && s.typeBtnTxtActive]}>INCOME</Text>
            </Pressable>
          </View>
          {!id && (
            <View style={s.typeToggleRow}>
              <Pressable style={[s.typeBtn, type === 'deposit' && s.typeBtnBankActive]} onPress={() => handleTypeChange('deposit')}>
                <Text style={[s.typeBtnTxt, type === 'deposit' && s.typeBtnTxtActive]}>DEPOSIT</Text>
              </Pressable>
              <View style={s.typeDivider} />
              <Pressable style={[s.typeBtn, type === 'withdraw' && s.typeBtnWalletActive]} onPress={() => handleTypeChange('withdraw')}>
                <Text style={[s.typeBtnTxt, type === 'withdraw' && s.typeBtnTxtActive]}>WITHDRAW</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {/* Amount Input */}
      <View style={s.inputGroup}>
        <Text style={s.label}>AMOUNT</Text>
        <View style={[
          s.amountInputRow, 
          type === 'expense' ? s.amountInputRowExpense : 
          type === 'income' ? s.amountInputRowIncome : 
          s.amountInputRowTransfer
        ]}>
          <Text style={[
            s.amountPrefix, 
            type === 'expense' ? s.amountPrefixExpense : 
            type === 'income' ? s.amountPrefixIncome : 
            s.amountPrefixTransfer
          ]}>
            LKR
          </Text>
          <TextInput
            style={s.amountInput}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            autoFocus={!id}
          />
        </View>
      </View>

      {/* Source Toggle */}
      {(type === 'expense' || type === 'income') && (
        <View style={s.inputGroup}>
          <Text style={s.label}>ACCOUNT</Text>
          <View style={s.sourceToggleRow}>
            <Pressable style={[s.sourceBtn, source === 'bank' && s.sourceBtnBankActive]} onPress={() => setSource('bank')}>
              <MaterialIcons name="account-balance" size={18} color={source === 'bank' ? '#FFFFFF' : colors.textMuted} />
              <Text style={[s.sourceBtnTxt, source === 'bank' && s.sourceBtnTxtActive]}>BANK</Text>
            </Pressable>
            <View style={s.sourceDivider} />
            <Pressable style={[s.sourceBtn, source === 'hand' && s.sourceBtnHandActive]} onPress={() => setSource('hand')}>
              <MaterialIcons name="account-balance-wallet" size={18} color={source === 'hand' ? '#FFFFFF' : colors.textMuted} />
              <Text style={[s.sourceBtnTxt, source === 'hand' && s.sourceBtnTxtActive]}>HAND CASH</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Date */}
      <View style={s.inputGroup}>
        <Text style={s.label}>DATE</Text>
        <Pressable style={s.dateBtn} onPress={() => setDatePickerVisibility(true)}>
          <Text style={s.dateTxt}>{formatDateShort(date).toUpperCase()}</Text>
          <MaterialIcons name="calendar-today" size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      {/* Category Chips */}
      {(type === 'expense' || type === 'income') && (
        <View style={s.inputGroup}>
          <Text style={s.label}>CATEGORY</Text>
          <View style={s.chipContainer}>
            {CATEGORIES[type as 'expense' | 'income'].map((cat) => (
              <Pressable
                key={cat}
                style={[
                  s.chip,
                  category === cat && (type === 'expense' ? s.chipExpenseActive : s.chipIncomeActive)
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[s.chipTxt, category === cat && s.chipTxtActive]}>{cat}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Description */}
      <View style={s.inputGroup}>
        <Text style={s.label}>DESCRIPTION (OPTIONAL)</Text>
        <TextInput
          style={s.descInput}
          value={description}
          onChangeText={setDescription}
          placeholder="What was this for?"
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <View style={{ height: 120 }} />

      {/* Save Button */}
      <View style={s.saveBtnContainer}>
        <View style={s.saveBtnShadow} />
        <Pressable 
          style={[s.saveBtn, { backgroundColor: type === 'expense' ? colors.expense : type === 'income' ? colors.income : type === 'deposit' ? colors.bank : colors.wallet }]} 
          onPress={handleSave}
        >
          <Text style={s.saveBtnTxt}>SAVE {type.toUpperCase()}</Text>
        </Pressable>
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={new Date(date)}
        onConfirm={(d) => { setDatePickerVisibility(false); setDate(d.toISOString().split('T')[0]); }}
        onCancel={() => setDatePickerVisibility(false)}
      />
    </ScrollView>
  );
}

const createStyles = (colors: PaletteType) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: Spacing.lg },
  typeToggleContainer: { marginBottom: Spacing.xl },
  typeToggleRow: { flexDirection: 'row', backgroundColor: colors.bgElevated, borderRadius: Radius.full, padding: 2 },
  typeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: Radius.full },
  typeDivider: { width: 0 },
  typeBtnExpenseActive: { backgroundColor: colors.expense },
  typeBtnIncomeActive: { backgroundColor: colors.income },
  typeBtnTxt: { fontSize: 13, fontFamily: Fonts.heading, color: colors.textMuted, letterSpacing: 1 },
  typeBtnTxtActive: { color: '#FFFFFF' },
  inputGroup: { marginBottom: Spacing.lg },
  label: { fontSize: 13, fontFamily: Fonts.heading, color: colors.textSecondary, marginBottom: Spacing.sm, letterSpacing: 1 },
  amountInputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgCard, borderWidth: colors.borderWidth, borderColor: colors.border, paddingHorizontal: Spacing.base, borderRadius: Radius.md },
  amountInputRowExpense: { backgroundColor: colors.bgCard },
  amountInputRowIncome: { backgroundColor: colors.bgCard },
  amountInputRowTransfer: { backgroundColor: colors.bgCard },
  amountPrefix: { fontSize: 24, fontFamily: Fonts.body, marginRight: Spacing.md },
  amountPrefixExpense: { color: colors.expense },
  amountPrefixIncome: { color: colors.income },
  amountPrefixTransfer: { color: colors.textPrimary },
  amountInput: { flex: 1, height: 64, fontSize: 36, fontFamily: Fonts.mono, color: colors.textPrimary },
  typeBtnBankActive: { backgroundColor: colors.bank },
  typeBtnWalletActive: { backgroundColor: colors.wallet },
  sourceToggleRow: { flexDirection: 'row', backgroundColor: colors.bgElevated, borderRadius: Radius.full, padding: 2 },
  sourceBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10, gap: 8, borderRadius: Radius.full },
  sourceDivider: { width: 0 },
  sourceBtnBankActive: { backgroundColor: colors.bank },
  sourceBtnHandActive: { backgroundColor: colors.wallet },
  sourceBtnTxt: { fontSize: 13, fontFamily: Fonts.heading, color: colors.textMuted, letterSpacing: 1 },
  sourceBtnTxtActive: { color: '#FFFFFF' },
  dateBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.bgInput, borderWidth: colors.borderWidth, borderColor: colors.border, paddingHorizontal: Spacing.base, height: 48, borderRadius: Radius.md },
  dateTxt: { fontSize: 15, fontFamily: Fonts.heading, color: colors.textPrimary, letterSpacing: 0.5 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.bgElevated, borderRadius: Radius.full },
  chipExpenseActive: { backgroundColor: colors.expense },
  chipIncomeActive: { backgroundColor: colors.income },
  chipTxt: { fontSize: 13, fontFamily: Fonts.body, color: colors.textSecondary },
  chipTxtActive: { color: '#FFFFFF', fontFamily: Fonts.heading },
  descInput: { backgroundColor: colors.bgInput, borderWidth: colors.borderWidth, borderColor: colors.border, paddingHorizontal: Spacing.base, height: 48, fontSize: 15, fontFamily: Fonts.body, color: colors.textPrimary, borderRadius: Radius.md },
  saveBtnContainer: { position: 'absolute', bottom: Spacing.xl, left: Spacing.lg, right: Spacing.lg },
  saveBtnShadow: { display: 'none' },
  saveBtn: { height: 56, justifyContent: 'center', alignItems: 'center', borderRadius: Radius.full },
  saveBtnTxt: { fontSize: 16, fontFamily: Fonts.heading, color: '#FFFFFF', letterSpacing: 1 },
});
