import { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect, useRouter } from 'expo-router';

import { Card } from '@/components/ui/card';
import { FAB } from '@/components/ui/fab';
import { ProgressBar } from '@/components/ui/progress-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { Spacing, Fonts, Radius, type PaletteType } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { getAllLoans } from '@/db/queries';
import { formatCurrency, formatDateShort } from '@/utils/helpers';
import type { Loan } from '@/types';

export default function LoansScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const colors = useThemeColors();
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

  const s = createStyles(colors);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>LOANS & DEBTS</Text>
      </View>

      <View style={s.tabRow}>
        <Pressable onPress={() => setTab('borrowed')} style={[s.tab, tab === 'borrowed' && s.tabBorrowedActive]}>
          <Text style={[s.tabTxt, tab === 'borrowed' && s.tabTxtActive]}>I OWE</Text>
        </Pressable>
        <View style={s.tabDivider} />
        <Pressable onPress={() => setTab('lent')} style={[s.tab, tab === 'lent' && s.tabLentActive]}>
          <Text style={[s.tabTxt, tab === 'lent' && s.tabTxtActive]}>OWED TO ME</Text>
        </Pressable>
      </View>

      <View style={s.summary}>
        <Text style={s.summaryLabel}>ACTIVE {tab === 'borrowed' ? 'DEBT' : 'LENT'}</Text>
        <Text style={[s.summaryAmt, { color: tab === 'borrowed' ? colors.expense : colors.income }]}>
          {formatCurrency(totalAmount)}
        </Text>
        <Text style={s.summarySub}>{activeCount} ACTIVE</Text>
      </View>

      <ScrollView style={s.list} contentContainerStyle={s.listContent}>
        {filtered.length === 0 ? (
          <EmptyState 
            icon="account-balance" 
            title={tab === 'borrowed' ? 'NO DEBTS' : 'NO LOANS'} 
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
                      {isCompleted ? 'SETTLED' : 'ACTIVE'}
                    </Text>
                  </View>
                </View>
                
                <Text style={s.totalAmt}>{formatCurrency(loan.total_amount)}</Text>
                
                <View style={s.progressRow}>
                  <Text style={s.progressLbl}>{formatCurrency(loan.total_amount - loan.remaining_amount)} PAID</Text>
                  <Text style={s.progressLbl}>{Math.round(progress * 100)}%</Text>
                </View>
                <ProgressBar 
                  progress={progress} 
                  color={isCompleted ? colors.success : tab === 'borrowed' ? colors.expense : colors.income} 
                />
                
                {loan.due_date && !isCompleted && (
                  <Text style={s.dueTxt}>DUE BY {formatDateShort(loan.due_date).toUpperCase()}</Text>
                )}
              </Card>
            );
          })
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
      <FAB onPress={() => router.push({ pathname: '/add-loan', params: { initialType: tab } })} />
    </View>
  );
}

const createStyles = (colors: PaletteType) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingTop: 56, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, borderBottomWidth: colors.borderWidth, borderBottomColor: colors.borderLight, marginBottom: Spacing.sm },
  title: { fontSize: 24, fontFamily: Fonts.heading, color: colors.textPrimary, letterSpacing: 1 },
  tabRow: { flexDirection: 'row', marginHorizontal: Spacing.lg, backgroundColor: colors.bgElevated, borderRadius: Radius.full, padding: 2, marginBottom: Spacing.lg },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: Radius.full },
  tabDivider: { width: 0 },
  tabBorrowedActive: { backgroundColor: colors.expense },
  tabLentActive: { backgroundColor: colors.income },
  tabTxt: { fontSize: 12, fontFamily: Fonts.heading, color: colors.textMuted },
  tabTxtActive: { color: '#FFFFFF' },
  summary: { alignItems: 'center', marginBottom: Spacing.lg },
  summaryLabel: { fontSize: 12, fontFamily: Fonts.heading, color: colors.textSecondary, marginBottom: 4, letterSpacing: 1 },
  summaryAmt: { fontSize: 36, fontFamily: Fonts.heading },
  summarySub: { fontSize: 11, fontFamily: Fonts.heading, color: colors.textSecondary, marginTop: 4, letterSpacing: 1 },
  list: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.lg },
  card: { marginBottom: Spacing.md },
  cardCompleted: { opacity: 0.6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  personName: { fontSize: 18, fontFamily: Fonts.heading, color: colors.textPrimary },
  statusBadge: { backgroundColor: colors.loanBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  statusBadgeCompleted: { backgroundColor: colors.incomeBg },
  statusTxt: { fontSize: 10, fontFamily: Fonts.heading, color: colors.loan },
  statusTxtCompleted: { color: colors.success },
  totalAmt: { fontSize: 24, fontFamily: Fonts.mono, color: colors.textPrimary, marginBottom: Spacing.md },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  progressLbl: { fontSize: 11, fontFamily: Fonts.heading, color: colors.textSecondary, letterSpacing: 0.5 },
  dueTxt: { fontSize: 11, fontFamily: Fonts.heading, color: colors.warning, marginTop: Spacing.sm, letterSpacing: 0.5 },
});
