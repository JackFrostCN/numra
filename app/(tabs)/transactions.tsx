import { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, Pressable } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Card } from '@/components/ui/card';
import { FAB } from '@/components/ui/fab';
import { DaySelector } from '@/components/ui/day-selector';
import { MonthSelector } from '@/components/ui/month-selector';
import { CategoryBadge } from '@/components/ui/category-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Spacing, Radius, type PaletteType } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { getTransactionsByMonth, getMonthlyTotals, deleteTransaction, getTransactionsByDay, getDailyTotals } from '@/db/queries';
import { formatCurrency, formatDateShort, getYearMonth, getTodayISO } from '@/utils/helpers';
import type { Transaction, MonthlyTotals } from '@/types';

export default function TransactionsScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const colors = useThemeColors();
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const [viewMode, setViewMode] = useState<'monthly' | 'daily'>('daily');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totals, setTotals] = useState<MonthlyTotals>({ income: 0, expenses: 0, balance: 0 });
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const yearMonth = getYearMonth(monthOffset);
  const dateString = selectedDate;

  const loadData = useCallback(async () => {
    if (viewMode === 'monthly') {
      const [txns, mt] = await Promise.all([
        getTransactionsByMonth(db, yearMonth),
        getMonthlyTotals(db, yearMonth),
      ]);
      setTransactions(txns);
      setTotals(mt);
    } else {
      const [txns, mt] = await Promise.all([
        getTransactionsByDay(db, dateString),
        getDailyTotals(db, dateString),
      ]);
      setTransactions(txns);
      setTotals(mt);
    }
  }, [db, yearMonth, dateString, viewMode]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handlePrevDay = () => {
    const parts = selectedDate.split('-');
    const d = parts.length === 3 ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])) : new Date();
    d.setDate(d.getDate() - 1);
    setSelectedDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  };

  const handleNextDay = () => {
    const parts = selectedDate.split('-');
    const d = parts.length === 3 ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])) : new Date();
    d.setDate(d.getDate() + 1);
    setSelectedDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete Transaction', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteTransaction(db, id); loadData(); } },
    ]);
  };

  const filtered = filter === 'all' ? transactions : transactions.filter((t) => t.type === filter);
  const grouped: Record<string, Transaction[]> = {};
  filtered.forEach((t) => { (grouped[t.date] ??= []).push(t); });

  const s = createStyles(colors);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Transactions</Text>
        <View style={s.viewModeRow}>
          <Pressable onPress={() => setViewMode('monthly')} style={[s.viewModeBtn, viewMode === 'monthly' && s.viewModeBtnActive]}>
            <Text style={[s.viewModeTxt, viewMode === 'monthly' && s.viewModeTxtActive]}>Monthly</Text>
          </Pressable>
          <Pressable onPress={() => setViewMode('daily')} style={[s.viewModeBtn, viewMode === 'daily' && s.viewModeBtnActive]}>
            <Text style={[s.viewModeTxt, viewMode === 'daily' && s.viewModeTxtActive]}>Daily</Text>
          </Pressable>
        </View>
      </View>
      {viewMode === 'monthly' ? (
        <MonthSelector yearMonth={yearMonth} onPrev={() => setMonthOffset(o => o - 1)} onNext={() => setMonthOffset(o => o + 1)} />
      ) : (
        <DaySelector 
          dateString={dateString} 
          onChange={setSelectedDate}
          onPrev={handlePrevDay} 
          onNext={handleNextDay} 
        />
      )}
      <View style={s.miniSummary}>
        <View style={s.miniItem}>
          <Text style={[s.miniAmt, { color: colors.income }]} numberOfLines={1} adjustsFontSizeToFit>+{formatCurrency(totals.income)}</Text>
          <Text style={s.miniLbl}>Income</Text>
        </View>
        <View style={s.divider} />
        <View style={s.miniItem}>
          <Text style={[s.miniAmt, { color: colors.expense }]} numberOfLines={1} adjustsFontSizeToFit>-{formatCurrency(totals.expenses)}</Text>
          <Text style={s.miniLbl}>Expenses</Text>
        </View>
        <View style={s.divider} />
        <View style={s.miniItem}>
          <Text style={[s.miniAmt, { color: totals.balance >= 0 ? colors.income : colors.expense }]} numberOfLines={1} adjustsFontSizeToFit>
            {totals.balance > 0 ? '+' : ''}{formatCurrency(totals.balance)}
          </Text>
          <Text style={s.miniLbl}>Balance</Text>
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
                    <Text style={[s.txnAmt, { color: txn.type === 'income' ? colors.income : colors.expense }]}>
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

const createStyles = (colors: PaletteType) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingTop: 56, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  viewModeRow: { flexDirection: 'row', backgroundColor: colors.bgCard, borderRadius: Radius.full, padding: 2, borderWidth: 1, borderColor: colors.border },
  viewModeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full },
  viewModeBtnActive: { backgroundColor: colors.bgElevated, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  viewModeTxt: { fontSize: 12, fontWeight: '500', color: colors.textMuted },
  viewModeTxtActive: { color: colors.textPrimary },
  miniSummary: { flexDirection: 'row', marginHorizontal: Spacing.lg, backgroundColor: colors.bgCard, borderRadius: Radius.lg, padding: Spacing.base, borderWidth: 1, borderColor: colors.border },
  miniItem: { flex: 1, alignItems: 'center' },
  divider: { width: 1, backgroundColor: colors.border },
  miniAmt: { fontSize: 15, fontWeight: '700' },
  miniLbl: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  filterRow: { flexDirection: 'row', marginHorizontal: Spacing.lg, marginTop: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.sm },
  filterTab: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, borderRadius: Radius.full, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border },
  filterAllActive: { backgroundColor: 'rgba(59, 130, 246, 0.15)', borderColor: colors.info },
  filterIncomeActive: { backgroundColor: colors.incomeBg, borderColor: colors.income },
  filterExpenseActive: { backgroundColor: colors.expenseBg, borderColor: colors.expense },
  filterTxt: { fontSize: 13, fontWeight: '500', color: colors.textMuted },
  filterAllTxtActive: { color: colors.info },
  filterIncomeTxtActive: { color: colors.income },
  filterExpenseTxtActive: { color: colors.expense },
  list: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  dateGroup: { marginBottom: Spacing.md },
  dateLbl: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: Spacing.sm, marginLeft: Spacing.xs },
  txnCard: { marginBottom: Spacing.sm },
  txnRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  txnInfo: { flex: 1 },
  txnCat: { fontSize: 15, fontWeight: '500', color: colors.textPrimary },
  txnDesc: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  txnAmt: { fontSize: 15, fontWeight: '600' },
});
