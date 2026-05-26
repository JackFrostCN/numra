import { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect, useRouter } from 'expo-router';

import { Card } from '@/components/ui/card';
import { FAB } from '@/components/ui/fab';
import { ProgressBar } from '@/components/ui/progress-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { Palette, Spacing, Radius } from '@/constants/theme';
import { getAllLoans } from '@/db/queries';
import { formatCurrency, formatDateShort } from '@/utils/helpers';
import type { Loan } from '@/types';

export default function LoansScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [tab, setTab] = useState<'lent' | 'borrowed'>('borrowed');

  const loadData = useCallback(async () => {
    const data = await getAllLoans(db);
    setLoans(data);
  }, [db]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const filtered = loans.filter((l) => l.type === tab);
  
  const activeCount = filtered.filter(l => l.is_completed === 0).length;
  const totalAmount = filtered.filter(l => l.is_completed === 0).reduce((sum, l) => sum + l.remaining_amount, 0);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Loans & Debts</Text>
      </View>

      <View style={s.tabRow}>
        <Pressable onPress={() => setTab('borrowed')} style={[s.tab, tab === 'borrowed' && s.tabActive]}>
          <Text style={[s.tabTxt, tab === 'borrowed' && s.tabTxtActive]}>I Owe</Text>
        </Pressable>
        <Pressable onPress={() => setTab('lent')} style={[s.tab, tab === 'lent' && s.tabActive]}>
          <Text style={[s.tabTxt, tab === 'lent' && s.tabTxtActive]}>Owed to Me</Text>
        </Pressable>
      </View>

      <View style={s.summary}>
        <Text style={s.summaryLabel}>Active {tab === 'borrowed' ? 'Debt' : 'Lent'}</Text>
        <Text style={[s.summaryAmt, { color: tab === 'borrowed' ? Palette.expense : Palette.income }]}>
          {formatCurrency(totalAmount)}
        </Text>
        <Text style={s.summarySub}>{activeCount} active</Text>
      </View>

      <ScrollView style={s.list} contentContainerStyle={s.listContent}>
        {filtered.length === 0 ? (
          <EmptyState 
            icon="account-balance" 
            title={tab === 'borrowed' ? 'No Debts' : 'No Loans'} 
            message={`Tap + to record money you ${tab === 'borrowed' ? 'owe' : 'lent'}`} 
          />
        ) : (
          filtered.map(loan => {
            const progress = (loan.total_amount - loan.remaining_amount) / loan.total_amount;
            const isCompleted = loan.is_completed === 1;

            return (
              <Card 
                key={loan.id} 
                style={[s.card, isCompleted && s.cardCompleted]}
                onPress={() => router.push({ pathname: '/loan-details', params: { id: loan.id } })}
              >
                <View style={s.cardHeader}>
                  <Text style={s.personName}>{loan.person_name}</Text>
                  <View style={[s.statusBadge, isCompleted && s.statusBadgeCompleted]}>
                    <Text style={[s.statusTxt, isCompleted && s.statusTxtCompleted]}>
                      {isCompleted ? 'Settled' : 'Active'}
                    </Text>
                  </View>
                </View>
                
                <Text style={s.totalAmt}>{formatCurrency(loan.total_amount)}</Text>
                
                <View style={s.progressRow}>
                  <Text style={s.progressLbl}>{formatCurrency(loan.total_amount - loan.remaining_amount)} paid</Text>
                  <Text style={s.progressLbl}>{Math.round(progress * 100)}%</Text>
                </View>
                <ProgressBar 
                  progress={progress} 
                  color={isCompleted ? Palette.success : tab === 'borrowed' ? Palette.expense : Palette.income} 
                />
                
                {loan.due_date && !isCompleted && (
                  <Text style={s.dueTxt}>Due by {formatDateShort(loan.due_date)}</Text>
                )}
              </Card>
            );
          })
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
      <FAB onPress={() => router.push('/add-loan')} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.bg },
  header: { paddingTop: 56, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  title: { fontSize: 24, fontWeight: '700', color: Palette.textPrimary },
  tabRow: { flexDirection: 'row', marginHorizontal: Spacing.lg, backgroundColor: Palette.bgElevated, borderRadius: Radius.lg, padding: 4, marginBottom: Spacing.lg },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: Radius.md },
  tabActive: { backgroundColor: Palette.bgCard, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabTxt: { fontSize: 14, fontWeight: '600', color: Palette.textMuted },
  tabTxtActive: { color: Palette.textPrimary },
  summary: { alignItems: 'center', marginBottom: Spacing.lg },
  summaryLabel: { fontSize: 13, color: Palette.textMuted, marginBottom: 4 },
  summaryAmt: { fontSize: 32, fontWeight: '700' },
  summarySub: { fontSize: 12, color: Palette.textSecondary, marginTop: 4 },
  list: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.lg },
  card: { marginBottom: Spacing.md },
  cardCompleted: { opacity: 0.6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  personName: { fontSize: 16, fontWeight: '600', color: Palette.textPrimary },
  statusBadge: { backgroundColor: Palette.loanBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  statusBadgeCompleted: { backgroundColor: Palette.incomeBg },
  statusTxt: { fontSize: 10, fontWeight: '600', color: Palette.loan },
  statusTxtCompleted: { color: Palette.success },
  totalAmt: { fontSize: 20, fontWeight: '700', color: Palette.textPrimary, marginBottom: Spacing.md },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  progressLbl: { fontSize: 12, color: Palette.textSecondary },
  dueTxt: { fontSize: 12, color: Palette.warning, marginTop: Spacing.sm },
});
