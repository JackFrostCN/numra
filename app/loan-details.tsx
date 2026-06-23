import { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Spacing, Fonts, NB, type PaletteType } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { getLoanById, getLoanPayments } from '@/db/queries';
import { formatCurrency, formatDateShort } from '@/utils/helpers';
import type { Loan, LoanPayment } from '@/types';

export default function LoanDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const colors = useThemeColors();

  const [loan, setLoan] = useState<Loan | null>(null);
  const [payments, setPayments] = useState<LoanPayment[]>([]);

  const loadData = useCallback(async () => {
    if (!id) return;
    const loanData = await getLoanById(db, parseInt(id, 10));
    const paymentsData = await getLoanPayments(db, parseInt(id, 10));
    setLoan(loanData);
    setPayments(paymentsData);
  }, [id, db]);

  useEffect(() => { loadData(); }, [loadData]);

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
  sectionTitle: { fontSize: 13, fontFamily: Fonts.heading, color: colors.textSecondary, marginBottom: Spacing.sm, letterSpacing: 1 },
  emptyTxt: { fontSize: 14, fontFamily: Fonts.body, color: colors.textMuted },
  historyContainer: { backgroundColor: colors.bgCard, borderWidth: 2, borderColor: colors.border },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', padding: Spacing.base, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  historyDate: { fontSize: 14, fontFamily: Fonts.body, color: colors.textPrimary },
  historyAmt: { fontSize: 16, fontFamily: Fonts.mono, color: colors.textPrimary },
});
