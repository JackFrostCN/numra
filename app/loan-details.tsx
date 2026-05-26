import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Alert } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getLoanById, getLoanPayments, recordLoanPayment, markLoanComplete, deleteLoan } from '@/db/queries';
import { Palette, Spacing, Radius } from '@/constants/theme';
import { formatCurrency, formatDateShort, getTodayISO } from '@/utils/helpers';
import type { Loan, LoanPayment } from '@/types';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function LoanDetailsScreen() {
  const { id } = useLocalSearchParams();
  const db = useSQLiteContext();
  const router = useRouter();

  const [loan, setLoan] = useState<Loan | null>(null);
  const [payments, setPayments] = useState<LoanPayment[]>([]);
  const [payAmount, setPayAmount] = useState('');

  const loadData = useCallback(async () => {
    if (!id) return;
    const l = await getLoanById(db, Number(id));
    const p = await getLoanPayments(db, Number(id));
    setLoan(l);
    setPayments(p);
  }, [db, id]);

  // Load initially and after actions
  if (!loan) {
    loadData();
  }

  const handlePayment = async () => {
    if (!loan || !payAmount || isNaN(Number(payAmount))) return;
    const amt = Number(payAmount);
    if (amt <= 0) return;

    await recordLoanPayment(db, loan.id, amt, getTodayISO());
    setPayAmount('');
    loadData();
  };

  const handleDelete = () => {
    Alert.alert('Delete Loan', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        if(loan) await deleteLoan(db, loan.id);
        router.back();
      }}
    ]);
  };

  if (!loan) return <View style={s.container} />;

  const isCompleted = loan.is_completed === 1;
  const progress = (loan.total_amount - loan.remaining_amount) / loan.total_amount;
  const color = isCompleted ? Palette.success : loan.type === 'borrowed' ? Palette.expense : Palette.income;

  return (
    <View style={s.container}>
      <ScrollView style={s.list} contentContainerStyle={s.content}>
        <View style={s.header}>
          <Text style={s.person}>{loan.person_name}</Text>
          <Text style={[s.typeTxt, { color }]}>{loan.type === 'borrowed' ? 'I Owe' : 'Owes Me'}</Text>
        </View>

        <Card style={s.overview}>
          <Text style={s.lbl}>Remaining</Text>
          <Text style={s.remAmt}>{formatCurrency(loan.remaining_amount)}</Text>
          <View style={s.progRow}>
            <Text style={s.progLbl}>Total: {formatCurrency(loan.total_amount)}</Text>
            <Text style={s.progLbl}>{Math.round(progress * 100)}%</Text>
          </View>
          <ProgressBar progress={progress} color={color} />
        </Card>

        {!isCompleted && (
          <Card style={s.payCard}>
            <Text style={s.payLbl}>Record Payment</Text>
            <View style={s.payRow}>
              <TextInput
                style={s.input}
                value={payAmount}
                onChangeText={setPayAmount}
                keyboardType="numeric"
                placeholder="Amount"
                placeholderTextColor={Palette.textMuted}
              />
              <Pressable style={[s.payBtn, { backgroundColor: color }]} onPress={handlePayment}>
                <Text style={s.payTxt}>Record</Text>
              </Pressable>
            </View>
          </Card>
        )}

        <Text style={s.sectionTitle}>Payment History</Text>
        {payments.length === 0 ? (
          <Text style={s.emptyTxt}>No payments recorded yet.</Text>
        ) : (
          payments.map(p => (
            <View key={p.id} style={s.payItem}>
              <View>
                <Text style={s.payItemAmt}>{formatCurrency(p.amount)}</Text>
                <Text style={s.payItemDate}>{formatDateShort(p.date)}</Text>
              </View>
            </View>
          ))
        )}
        
        <Pressable style={s.delBtn} onPress={handleDelete}>
          <MaterialIcons name="delete" size={20} color={Palette.danger} />
          <Text style={s.delTxt}>Delete Loan</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.bg },
  list: { flex: 1 },
  content: { padding: Spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  person: { fontSize: 24, fontWeight: '700', color: Palette.textPrimary },
  typeTxt: { fontSize: 14, fontWeight: '600' },
  overview: { marginBottom: Spacing.lg },
  lbl: { fontSize: 13, color: Palette.textSecondary, marginBottom: 4 },
  remAmt: { fontSize: 32, fontWeight: '700', color: Palette.textPrimary, marginBottom: Spacing.md },
  progRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  progLbl: { fontSize: 12, color: Palette.textMuted },
  payCard: { marginBottom: Spacing.lg, padding: Spacing.md },
  payLbl: { fontSize: 14, fontWeight: '600', color: Palette.textPrimary, marginBottom: Spacing.sm },
  payRow: { flexDirection: 'row', gap: Spacing.sm },
  input: { flex: 1, backgroundColor: Palette.bgInput, borderRadius: Radius.md, paddingHorizontal: Spacing.md, height: 44, color: Palette.textPrimary, borderWidth: 1, borderColor: Palette.border },
  payBtn: { height: 44, paddingHorizontal: Spacing.lg, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  payTxt: { color: Palette.white, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Palette.textPrimary, marginBottom: Spacing.sm },
  emptyTxt: { color: Palette.textMuted, fontSize: 14, fontStyle: 'italic' },
  payItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Palette.borderLight },
  payItemAmt: { fontSize: 16, fontWeight: '600', color: Palette.textPrimary },
  payItemDate: { fontSize: 12, color: Palette.textMuted, marginTop: 2 },
  delBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, marginTop: Spacing.xl * 2, padding: Spacing.md },
  delTxt: { color: Palette.danger, fontWeight: '600', fontSize: 15 },
});
