import { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Spacing, Fonts, Radius, Shadows, type PaletteType } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { getLoanById, getLoanPayments, deleteLoan, recordLoanPayment } from '@/db/queries';
import { formatCurrency, formatDateShort, getTodayISO } from '@/utils/helpers';
import type { Loan, LoanPayment } from '@/types';

export default function LoanDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const colors = useThemeColors();

  const [loan, setLoan] = useState<Loan | null>(null);
  const [payments, setPayments] = useState<LoanPayment[]>([]);
  const [showPaymentInput, setShowPaymentInput] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

  const loadData = useCallback(async () => {
    if (!id) return;
    const loanData = await getLoanById(db, parseInt(id, 10));
    const paymentsData = await getLoanPayments(db, parseInt(id, 10));
    setLoan(loanData);
    setPayments(paymentsData);
  }, [id, db]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = () => setShowDeleteModal(true);

  const handleEdit = () => {
    router.push({ pathname: '/add-loan', params: { id, initialType: loan?.type } });
  };

  const handleRecordPayment = async () => {
    const amt = Number(paymentAmount);
    if (!amt || isNaN(amt) || amt <= 0) {
      alert('Enter a valid amount');
      return;
    }
    if (!id) return;
    await recordLoanPayment(db, parseInt(id, 10), amt, getTodayISO(), 'bank');
    setPaymentAmount('');
    setShowPaymentInput(false);
    loadData();
  };

  if (!loan) return <View style={[{ flex: 1, backgroundColor: colors.bg }]} />;

  const progress = (loan.total_amount - loan.remaining_amount) / loan.total_amount;
  const isCompleted = loan.is_completed === 1;

  const s = createStyles(colors);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={s.headerActions}>
          <Pressable onPress={handleEdit} style={s.actionBtn}>
            <MaterialIcons name="edit" size={24} color={colors.textPrimary} />
          </Pressable>
          <Pressable onPress={handleDelete} style={s.actionBtn}>
            <MaterialIcons name="delete" size={24} color={colors.danger} />
          </Pressable>
        </View>
      </View>

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
          <View style={s.paymentSection}>
            {!showPaymentInput ? (
              <Pressable style={s.recordBtn} onPress={() => setShowPaymentInput(true)}>
                <MaterialIcons name="add" size={20} color="#FFFFFF" />
                <Text style={s.recordBtnTxt}>RECORD PAYMENT</Text>
              </Pressable>
            ) : (
              <View style={s.paymentInputContainer}>
                <TextInput
                  style={s.paymentInput}
                  value={paymentAmount}
                  onChangeText={setPaymentAmount}
                  keyboardType="decimal-pad"
                  placeholder="Amount Paid"
                  placeholderTextColor={colors.textMuted}
                  autoFocus
                />
                <View style={s.paymentActions}>
                  <Pressable style={s.paymentCancel} onPress={() => setShowPaymentInput(false)}>
                    <Text style={s.paymentCancelTxt}>CANCEL</Text>
                  </Pressable>
                  <Pressable style={s.paymentSubmit} onPress={handleRecordPayment}>
                    <Text style={s.paymentSubmitTxt}>SAVE</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
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

      <ConfirmModal
        visible={showDeleteModal}
        title="Delete Debt/Loan"
        message="Are you sure you want to delete this? It will delete all payment history."
        confirmText="Delete"
        isDestructive={true}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          setShowDeleteModal(false);
          if (!id) return;
          await deleteLoan(db, parseInt(id, 10));
          router.back();
        }}
      />
    </View>
  );
}

const createStyles = (colors: PaletteType) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: Spacing.lg },
  headerCard: { backgroundColor: colors.bgCard, padding: Spacing.lg, borderRadius: Radius.lg, marginBottom: Spacing.lg, ...Shadows.sm },
  personName: { fontSize: 24, fontFamily: Fonts.heading, color: colors.textPrimary },
  loanType: { fontSize: 12, fontFamily: Fonts.heading, color: colors.textMuted, marginTop: 4, letterSpacing: 1 },
  totalAmt: { fontSize: 36, fontFamily: Fonts.mono, color: colors.textPrimary, marginVertical: Spacing.md },
  progressContainer: { marginTop: Spacing.sm },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  progressLbl: { fontSize: 11, fontFamily: Fonts.heading, color: colors.textSecondary, letterSpacing: 0.5 },
  sectionTitle: { fontSize: 13, fontFamily: Fonts.heading, color: colors.textSecondary, marginBottom: Spacing.sm, letterSpacing: 1 },
  emptyTxt: { fontSize: 14, fontFamily: Fonts.body, color: colors.textMuted },
  historyContainer: { backgroundColor: colors.bgCard, borderRadius: Radius.lg, overflow: 'hidden', ...Shadows.sm },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', padding: Spacing.base, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  historyDate: { fontSize: 14, fontFamily: Fonts.body, color: colors.textPrimary },
  historyAmt: { fontSize: 16, fontFamily: Fonts.mono, color: colors.textPrimary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  backBtn: { padding: Spacing.sm, marginLeft: -Spacing.sm },
  headerActions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: { padding: Spacing.sm },
  paymentSection: { marginBottom: Spacing.xl },
  recordBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.loan, paddingVertical: Spacing.md, borderRadius: Radius.full, gap: Spacing.sm },
  recordBtnTxt: { fontSize: 14, fontFamily: Fonts.heading, color: '#FFFFFF', letterSpacing: 1 },
  paymentInputContainer: { backgroundColor: colors.bgCard, padding: Spacing.md, borderRadius: Radius.lg, borderWidth: colors.borderWidth, borderColor: colors.border },
  paymentInput: { backgroundColor: colors.bgInput, borderWidth: colors.borderWidth, borderColor: colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.md, height: 48, fontSize: 16, fontFamily: Fonts.mono, color: colors.textPrimary, marginBottom: Spacing.md },
  paymentActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.md },
  paymentCancel: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
  paymentCancelTxt: { fontSize: 13, fontFamily: Fonts.heading, color: colors.textMuted },
  paymentSubmit: { backgroundColor: colors.loan, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, borderRadius: Radius.full },
  paymentSubmitTxt: { fontSize: 13, fontFamily: Fonts.heading, color: '#FFFFFF' },
});
