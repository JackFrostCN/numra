import { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Spacing, Fonts, NB, type PaletteType } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { addTransaction } from '@/db/queries';
import { getTodayISO } from '@/utils/helpers';

export default function DepositModal() {
  const db = useSQLiteContext();
  const router = useRouter();
  const colors = useThemeColors();

  const [amount, setAmount] = useState('');

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount))) {
      alert('Please enter a valid amount');
      return;
    }

    // Deposit to bank (Hand -> Bank)
    await addTransaction(db, {
      type: 'expense',
      source: 'hand',
      amount: Number(amount),
      category: 'Deposit',
      date: getTodayISO(),
      description: 'Deposit to Bank',
    });

    await addTransaction(db, {
      type: 'income',
      source: 'bank',
      amount: Number(amount),
      category: 'Deposit',
      date: getTodayISO(),
      description: 'Deposit from Hand',
    });

    router.back();
  };

  const s = createStyles(colors);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.flowContainer}>
        <View style={s.node}>
          <View style={[s.iconBox, { backgroundColor: colors.wallet }]}>
            <MaterialIcons name="account-balance-wallet" size={24} color="#000" />
          </View>
          <Text style={s.nodeLabel}>HAND CASH</Text>
        </View>

        <View style={s.arrowContainer}>
          <View style={s.arrowLine} />
          <MaterialIcons name="arrow-forward" size={24} color={colors.textPrimary} style={s.arrowIcon} />
        </View>

        <View style={s.node}>
          <View style={[s.iconBox, { backgroundColor: colors.bank }]}>
            <MaterialIcons name="account-balance" size={24} color="#000" />
          </View>
          <Text style={s.nodeLabel}>BANK</Text>
        </View>
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
            autoFocus
          />
        </View>
      </View>

      <View style={{ height: 120 }} />

      <View style={s.saveBtnContainer}>
        <View style={s.saveBtnShadow} />
        <Pressable 
          style={[s.saveBtn, { backgroundColor: colors.bank }]} 
          onPress={handleSave}
        >
          <Text style={s.saveBtnTxt}>CONFIRM DEPOSIT</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: PaletteType) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: Spacing.lg },
  flowContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl * 2, paddingVertical: Spacing.xl },
  node: { alignItems: 'center' },
  iconBox: { width: 56, height: 56, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  nodeLabel: { fontSize: 11, fontFamily: Fonts.heading, color: colors.textPrimary, marginTop: 8, letterSpacing: 1 },
  arrowContainer: { width: 60, height: 2, backgroundColor: colors.border, marginHorizontal: 10, position: 'relative' },
  arrowLine: { height: 2, width: '100%', backgroundColor: colors.border },
  arrowIcon: { position: 'absolute', right: -10, top: -11 },
  inputGroup: { marginBottom: Spacing.lg },
  label: { fontSize: 13, fontFamily: Fonts.heading, color: colors.textSecondary, marginBottom: Spacing.sm, letterSpacing: 1 },
  amountInputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bankBg, borderWidth: colors.borderWidth, borderColor: colors.border, paddingHorizontal: Spacing.base },
  amountPrefix: { fontSize: 24, fontFamily: Fonts.body, color: colors.bank, marginRight: Spacing.md },
  amountInput: { flex: 1, height: 64, fontSize: 36, fontFamily: Fonts.mono, color: colors.textPrimary },
  saveBtnContainer: { position: 'absolute', bottom: Spacing.xl, left: Spacing.lg, right: Spacing.lg },
  saveBtnShadow: { position: 'absolute', top: NB.shadowOffset, left: NB.shadowOffset, right: -NB.shadowOffset, bottom: -NB.shadowOffset, backgroundColor: colors.border, borderRadius: 4 },
  saveBtn: { height: 56, justifyContent: 'center', alignItems: 'center', borderWidth: colors.borderWidth, borderColor: colors.border, borderRadius: 4 },
  saveBtnTxt: { fontSize: 16, fontFamily: Fonts.heading, color: '#000000', letterSpacing: 1 },
});
