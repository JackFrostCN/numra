import { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, Pressable } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Card } from '@/components/ui/card';
import { FAB } from '@/components/ui/fab';
import { MonthSelector } from '@/components/ui/month-selector';
import { CategoryBadge } from '@/components/ui/category-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Palette, Spacing, Radius } from '@/constants/theme';
import { getTransactionsByMonth, getMonthlyTotals, deleteTransaction } from '@/db/queries';
import { formatCurrency, formatDateShort, getYearMonth } from '@/utils/helpers';
import type { Transaction, MonthlyTotals } from '@/types';

export default function TransactionsScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [monthOffset, setMonthOffset] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totals, setTotals] = useState<MonthlyTotals>({ income: 0, expenses: 0, balance: 0 });
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const yearMonth = getYearMonth(monthOffset);

  const loadData = useCallback(async () => {
    const [txns, mt] = await Promise.all([
      getTransactionsByMonth(db, yearMonth),
      getMonthlyTotals(db, yearMonth),
    ]);
    setTransactions(txns);
    setTotals(mt);
  }, [db, yearMonth]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleDelete = (id: number) => {
    Alert.alert('Delete Transaction', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteTransaction(db, id); loadData(); } },
    ]);
  };

  const filtered = filter === 'all' ? transactions : transactions.filter((t) => t.type === filter);
  const grouped: Record<string, Transaction[]> = {};
  filtered.forEach((t) => { (grouped[t.date] ??= []).push(t); });

  return (
    <View style={s.container}>
      <View style={s.header}><Text style={s.title}>Transactions</Text></View>
      <MonthSelector yearMonth={yearMonth} onPrev={() => setMonthOffset(o => o - 1)} onNext={() => setMonthOffset(o => o + 1)} />
      <View style={s.miniSummary}>
        <View style={s.miniItem}>
          <Text style={[s.miniAmt, { color: Palette.income }]}>+{formatCurrency(totals.income)}</Text>
          <Text style={s.miniLbl}>Income</Text>
        </View>
        <View style={s.divider} />
        <View style={s.miniItem}>
          <Text style={[s.miniAmt, { color: Palette.expense }]}>-{formatCurrency(totals.expenses)}</Text>
          <Text style={s.miniLbl}>Expenses</Text>
        </View>
      </View>
      <View style={s.filterRow}>
        {(['all', 'income', 'expense'] as const).map((f) => {
          const isActive = filter === f;
          const activeTabStyle = f === 'all' ? s.filterAllActive : f === 'income' ? s.filterIncomeActive : s.filterExpenseActive;
          const activeTxtStyle = f === 'all' ? s.filterAllTxtActive : f === 'income' ? s.filterIncomeTxtActive : s.filterExpenseTxtActive;
          
          return (
            <Pressable key={f} onPress={() => setFilter(f)} style={[s.filterTab, isActive && activeTabStyle]}>
              <Text style={[s.filterTxt, isActive && activeTxtStyle]}>
                {f === 'all' ? 'All' : f === 'income' ? 'Income' : 'Expense'}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <ScrollView style={s.list} contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <EmptyState icon="receipt-long" title="No transactions" message="Tap + to add your first transaction" />
        ) : (
          Object.entries(grouped).map(([date, txns]) => (
            <View key={date} style={s.dateGroup}>
              <Text style={s.dateLbl}>{formatDateShort(date)}</Text>
              {txns.map((txn) => (
                <Card key={txn.id} style={s.txnCard}>
                  <Pressable 
                    onPress={() => router.push({ pathname: '/add-transaction', params: { id: txn.id } })}
                    onLongPress={() => handleDelete(txn.id)} 
                    style={s.txnRow}
                  >
                    <CategoryBadge category={txn.category} />
                    <View style={s.txnInfo}>
                      <Text style={s.txnCat}>{txn.category}</Text>
                      {txn.description ? <Text style={s.txnDesc} numberOfLines={1}>{txn.description}</Text> : null}
                    </View>
                    <Text style={[s.txnAmt, { color: txn.type === 'income' ? Palette.income : Palette.expense }]}>
                      {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                    </Text>
                  </Pressable>
                </Card>
              ))}
            </View>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
      <FAB onPress={() => router.push('/add-transaction')} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.bg },
  header: { paddingTop: 56, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  title: { fontSize: 24, fontWeight: '700', color: Palette.textPrimary },
  miniSummary: { flexDirection: 'row', marginHorizontal: Spacing.lg, backgroundColor: Palette.bgCard, borderRadius: Radius.lg, padding: Spacing.base, borderWidth: 1, borderColor: Palette.border },
  miniItem: { flex: 1, alignItems: 'center' },
  divider: { width: 1, backgroundColor: Palette.border },
  miniAmt: { fontSize: 16, fontWeight: '700' },
  miniLbl: { fontSize: 12, color: Palette.textMuted, marginTop: 2 },
  filterRow: { flexDirection: 'row', marginHorizontal: Spacing.lg, marginTop: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.sm },
  filterTab: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, borderRadius: Radius.full, backgroundColor: Palette.bgCard, borderWidth: 1, borderColor: Palette.border },
  filterAllActive: { backgroundColor: 'rgba(59, 130, 246, 0.15)', borderColor: Palette.info },
  filterIncomeActive: { backgroundColor: Palette.incomeBg, borderColor: Palette.income },
  filterExpenseActive: { backgroundColor: Palette.expenseBg, borderColor: Palette.expense },
  filterTxt: { fontSize: 13, fontWeight: '500', color: Palette.textMuted },
  filterAllTxtActive: { color: Palette.info },
  filterIncomeTxtActive: { color: Palette.income },
  filterExpenseTxtActive: { color: Palette.expense },
  list: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  dateGroup: { marginBottom: Spacing.md },
  dateLbl: { fontSize: 13, fontWeight: '600', color: Palette.textMuted, marginBottom: Spacing.sm, marginLeft: Spacing.xs },
  txnCard: { marginBottom: Spacing.sm },
  txnRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  txnInfo: { flex: 1 },
  txnCat: { fontSize: 15, fontWeight: '500', color: Palette.textPrimary },
  txnDesc: { fontSize: 13, color: Palette.textMuted, marginTop: 2 },
  txnAmt: { fontSize: 15, fontWeight: '600' },
});
