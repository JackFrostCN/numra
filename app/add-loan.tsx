import { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Spacing, Fonts, Radius, type PaletteType } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { addLoan } from '@/db/queries';
import { getTodayISO, formatDateShort } from '@/utils/helpers';

export default function AddLoanModal() {
  const db = useSQLiteContext();
  const router = useRouter();
  const colors = useThemeColors();

  const { initialType } = useLocalSearchParams<{ initialType: 'lent' | 'borrowed' }>();
  const [type, setType] = useState<'lent' | 'borrowed'>(initialType || 'borrowed');
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayISO());
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isDueDatePickerVisible, setDueDatePickerVisibility] = useState(false);

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount)) || !personName) {
      alert('Please enter valid details');
      return;
    }

    await addLoan(db, {
      type,
      person_name: personName,
      total_amount: Number(amount),
      date,
      due_date: dueDate || undefined,
      source: 'bank',
    });
    router.back();
  };

  const s = createStyles(colors);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Type Toggle */}
      <View style={s.typeToggleContainer}>
        <View style={s.typeToggleRow}>
          <Pressable style={[s.typeBtn, type === 'borrowed' && s.typeBtnBorrowedActive]} onPress={() => setType('borrowed')}>
            <Text style={[s.typeBtnTxt, type === 'borrowed' && s.typeBtnTxtActive]}>I OWE THEM</Text>
          </Pressable>
          <View style={s.typeDivider} />
          <Pressable style={[s.typeBtn, type === 'lent' && s.typeBtnLentActive]} onPress={() => setType('lent')}>
            <Text style={[s.typeBtnTxt, type === 'lent' && s.typeBtnTxtActive]}>THEY OWE ME</Text>
          </Pressable>
        </View>
      </View>

      <View style={s.inputGroup}>
        <Text style={s.label}>PERSON's NAME</Text>
        <TextInput
          style={s.input}
          value={personName}
          onChangeText={setPersonName}
          placeholder="Who?"
          placeholderTextColor={colors.textMuted}
          autoFocus
        />
      </View>

      <View style={s.inputGroup}>
        <Text style={s.label}>AMOUNT</Text>
        <View style={[s.amountInputRow, type === 'borrowed' ? s.amountInputRowBorrowed : s.amountInputRowLent]}>
          <Text style={[s.amountPrefix, type === 'borrowed' ? s.amountPrefixBorrowed : s.amountPrefixLent]}>LKR</Text>
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
        <Text style={s.label}>DATE ISSUED</Text>
        <Pressable style={s.dateBtn} onPress={() => setDatePickerVisibility(true)}>
          <Text style={s.dateTxt}>{formatDateShort(date).toUpperCase()}</Text>
          <MaterialIcons name="calendar-today" size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={s.inputGroup}>
        <Text style={s.label}>DUE DATE (OPTIONAL)</Text>
        <Pressable style={s.dateBtn} onPress={() => setDueDatePickerVisibility(true)}>
          <Text style={[s.dateTxt, !dueDate && { color: colors.textMuted }]}>
            {dueDate ? formatDateShort(dueDate).toUpperCase() : 'NO DUE DATE SET'}
          </Text>
          <MaterialIcons name="event" size={20} color={dueDate ? colors.textPrimary : colors.textMuted} />
        </Pressable>
        {dueDate && (
          <Pressable style={{ marginTop: 8 }} onPress={() => setDueDate(null)}>
            <Text style={{ color: colors.danger, fontFamily: Fonts.body, fontSize: 13 }}>Remove due date</Text>
          </Pressable>
        )}
      </View>

      <View style={{ height: 120 }} />

      <View style={s.saveBtnContainer}>
        <View style={s.saveBtnShadow} />
        <Pressable 
          style={[s.saveBtn, { backgroundColor: colors.loan }]} 
          onPress={handleSave}
        >
          <Text style={s.saveBtnTxt}>SAVE LOAN</Text>
        </Pressable>
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={new Date(date)}
        onConfirm={(d) => { setDatePickerVisibility(false); setDate(d.toISOString().split('T')[0]); }}
        onCancel={() => setDatePickerVisibility(false)}
      />

      <DateTimePickerModal
        isVisible={isDueDatePickerVisible}
        mode="date"
        date={dueDate ? new Date(dueDate) : new Date()}
        onConfirm={(d) => { setDueDatePickerVisibility(false); setDueDate(d.toISOString().split('T')[0]); }}
        onCancel={() => setDueDatePickerVisibility(false)}
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
  typeBtnBorrowedActive: { backgroundColor: colors.expense },
  typeBtnLentActive: { backgroundColor: colors.income },
  typeBtnTxt: { fontSize: 13, fontFamily: Fonts.heading, color: colors.textMuted, letterSpacing: 1 },
  typeBtnTxtActive: { color: '#FFFFFF' },
  inputGroup: { marginBottom: Spacing.lg },
  label: { fontSize: 13, fontFamily: Fonts.heading, color: colors.textSecondary, marginBottom: Spacing.sm, letterSpacing: 1 },
  input: { backgroundColor: colors.bgInput, borderWidth: colors.borderWidth, borderColor: colors.border, paddingHorizontal: Spacing.base, height: 48, fontSize: 15, fontFamily: Fonts.body, color: colors.textPrimary, borderRadius: Radius.md },
  amountInputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgCard, borderWidth: colors.borderWidth, borderColor: colors.border, paddingHorizontal: Spacing.base, borderRadius: Radius.md },
  amountInputRowBorrowed: { backgroundColor: colors.bgCard },
  amountInputRowLent: { backgroundColor: colors.bgCard },
  amountPrefix: { fontSize: 24, fontFamily: Fonts.body, marginRight: Spacing.md },
  amountPrefixBorrowed: { color: colors.expense },
  amountPrefixLent: { color: colors.income },
  amountInput: { flex: 1, height: 64, fontSize: 36, fontFamily: Fonts.mono, color: colors.textPrimary },
  dateBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.bgInput, borderWidth: colors.borderWidth, borderColor: colors.border, paddingHorizontal: Spacing.base, height: 48, borderRadius: Radius.md },
  dateTxt: { fontSize: 15, fontFamily: Fonts.heading, color: colors.textPrimary, letterSpacing: 0.5 },
  saveBtnContainer: { position: 'absolute', bottom: Spacing.xl, left: Spacing.lg, right: Spacing.lg },
  saveBtnShadow: { display: 'none' },
  saveBtn: { height: 56, justifyContent: 'center', alignItems: 'center', borderRadius: Radius.full },
  saveBtnTxt: { fontSize: 16, fontFamily: Fonts.heading, color: '#FFFFFF', letterSpacing: 1 },
});
