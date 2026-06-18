import { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Spacing, Fonts, NB, type PaletteType } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { getLoanById, getLoanPayments, recordLoanPayment } from '@/db/queries';
import { formatCurrency, formatDateShort, getTodayISO } from '@/utils/helpers';
import type { Loan, LoanPayment } from '@/types';

export default function LoanDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const colors = useThemeColors();

  const [loan, setLoan] = useState<Loan | null>(null);
  const [payments, setPayments] = useState<LoanPayment[]>([]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(getTodayISO());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    const loanData = await getLoanById(db, parseInt(id, 10));
    const paymentsData = await getLoanPayments(db, parseInt(id, 10));
    setLoan(loanData);
    setPayments(paymentsData);
  }, [id, db]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRecordPayment = async () => {
    if (!loan || !paymentAmount || isNaN(Number(paymentAmount))) {
      alert('Enter a valid amount');
      return;
    }

    const amount = Number(paymentAmount);
    if (amount > loan.remaining_amount) {
      alert('Payment exceeds remaining amount');
      return;
    }

    await recordLoanPayment(db, loan.id, amount, paymentDate, 'bank');
    setPaymentAmount('');
    loadData();
  };

  if (!loan) return <View style={[{ flex: 1, backgroundColor: colors.bg }]} />;

  const progress = (loan.total_amount - loan.remaining_amount) / loan.total_amount;
  const isCompleted = loan.is_completed === 1;

  const s = createStyles(colors);

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.headerCard}>
          <Text style={s.personName}>{loan.person_name}</Text>
          <Text style={s.loanType}>{loan.type === 'borrowed' ? 'I OWE THEM' : 'THEY OWE ME'}</Text>
          <Text style={s.totalAmt}>{formatCurrency(loan.total_amount)}</Text>

          <View style={s.progressContainer}>
            <View style={s.progressRow}>
              <Text style={s.progressLbl}>{formatCurrency(loan.total_amount - loan.remaining_amount)} PAID</Text>
              <Text style={s.progressLbl}>{formatCurrency(loan.remaining_amount)} LEFT</Text>
            </View>
            <ProgressBar progress={progress} color={isCompleted ? colors.success : loan.type === 'borrowed' ? colors.expense : colors.income} />
          </View>
        </View>

        {!isCompleted && (
          <Card style={s.paymentCard}>
            <Text style={s.sectionTitle}>RECORD PAYMENT</Text>
            
            <View style={s.inputRow}>
              <View style={s.inputWrapper}>
                <Text style={s.inputPrefix}>LKR</Text>
                <TextInput
                  style={s.input}
                  value={paymentAmount}
                  onChangeText={setPaymentAmount}
                  keyboardType="decimal-pad"
                  placeholder={loan.remaining_amount.toString()}
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <Pressable style={s.dateBtn} onPress={() => setDatePickerVisibility(true)}>
                <MaterialIcons name="calendar-today" size={20} color={colors.textPrimary} />
              </Pressable>
            </View>

            <Pressable 
              style={[s.recordBtn, { backgroundColor: loan.type === 'borrowed' ? colors.expense : colors.income }]} 
              onPress={handleRecordPayment}
            >
              <Text style={s.recordBtnTxt}>RECORD PAYMENT</Text>
            </Pressable>
          </Card>
        )}

        <Text style={[s.sectionTitle, { marginTop: Spacing.lg }]}>PAYMENT HISTORY</Text>
        {payments.length === 0 ? (
          <Text style={s.emptyTxt}>No payments recorded yet.</Text>
        ) : (
          <View style={s.historyContainer}>
            {payments.map(payment => (
              <View key={payment.id} style={s.historyRow}>
                <Text style={s.historyDate}>{formatDateShort(payment.date)}</Text>
                <Text style={s.historyAmt}>{formatCurrency(payment.amount)}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={new Date(paymentDate)}
        onConfirm={(d) => { setDatePickerVisibility(false); setPaymentDate(d.toISOString().split('T')[0]); }}
        onCancel={() => setDatePickerVisibility(false)}
      />
    </View>
  );
}

const createStyles = (colors: PaletteType) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: Spacing.lg },
  headerCard: { backgroundColor: colors.bgCard, padding: Spacing.lg, borderWidth: colors.borderWidth, borderColor: colors.border, marginBottom: Spacing.lg },
  personName: { fontSize: 24, fontFamily: Fonts.heading, color: colors.textPrimary },
  loanType: { fontSize: 12, fontFamily: Fonts.heading, color: colors.textMuted, marginTop: 4, letterSpacing: 1 },
  totalAmt: { fontSize: 36, fontFamily: Fonts.mono, color: colors.textPrimary, marginVertical: Spacing.md },
  progressContainer: { marginTop: Spacing.sm },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  progressLbl: { fontSize: 11, fontFamily: Fonts.heading, color: colors.textSecondary, letterSpacing: 0.5 },
  paymentCard: { padding: Spacing.base },
  sectionTitle: { fontSize: 13, fontFamily: Fonts.heading, color: colors.textSecondary, marginBottom: Spacing.sm, letterSpacing: 1 },
  inputRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.base },
  inputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgInput, borderWidth: 2, borderColor: colors.border, paddingHorizontal: Spacing.md },
  inputPrefix: { fontSize: 18, fontFamily: Fonts.body, color: colors.textMuted, marginRight: 8 },
  input: { flex: 1, height: 48, fontSize: 20, fontFamily: Fonts.mono, color: colors.textPrimary },
  dateBtn: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgInput, borderWidth: 2, borderColor: colors.border },
  recordBtn: { height: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.border },
  recordBtnTxt: { fontSize: 14, fontFamily: Fonts.heading, color: '#000000', letterSpacing: 1 },
  emptyTxt: { fontSize: 14, fontFamily: Fonts.body, color: colors.textMuted },
  historyContainer: { backgroundColor: colors.bgCard, borderWidth: 2, borderColor: colors.border },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', padding: Spacing.base, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  historyDate: { fontSize: 14, fontFamily: Fonts.body, color: colors.textPrimary },
  historyAmt: { fontSize: 16, fontFamily: Fonts.mono, color: colors.textPrimary },
});
