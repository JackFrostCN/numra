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
import { Spacing, Fonts, Radius, type PaletteType } from '@/constants/theme';
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
        <Text style={s.title}>TRANSACTIONS</Text>
        <View style={s.viewModeRow}>
          <Pressable onPress={() => setViewMode('monthly')} style={[s.viewModeBtn, viewMode === 'monthly' && s.viewModeBtnActive]}>
            <Text style={[s.viewModeTxt, viewMode === 'monthly' && s.viewModeTxtActive]}>MONTHLY</Text>
          </Pressable>
          <View style={s.viewModeDivider} />
          <Pressable onPress={() => setViewMode('daily')} style={[s.viewModeBtn, viewMode === 'daily' && s.viewModeBtnActive]}>
            <Text style={[s.viewModeTxt, viewMode === 'daily' && s.viewModeTxtActive]}>DAILY</Text>
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
          <Text style={s.miniLbl}>INCOME</Text>
        </View>
        <View style={s.divider} />
        <View style={s.miniItem}>
          <Text style={[s.miniAmt, { color: colors.expense }]} numberOfLines={1} adjustsFontSizeToFit>-{formatCurrency(totals.expenses)}</Text>
          <Text style={s.miniLbl}>EXPENSES</Text>
        </View>
        <View style={s.divider} />
        <View style={s.miniItem}>
          <Text style={[s.miniAmt, { color: totals.balance >= 0 ? colors.income : colors.expense }]} numberOfLines={1} adjustsFontSizeToFit>
            {totals.balance > 0 ? '+' : ''}{formatCurrency(totals.balance)}
          </Text>
          <Text style={s.miniLbl}>BALANCE</Text>
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
                {f === 'all' ? 'ALL' : f === 'income' ? 'INCOME' : 'EXPENSE'}
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
              <Text style={s.dateLbl}>{formatDateShort(date).toUpperCase()}</Text>
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
  header: { paddingTop: 56, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: colors.borderWidth, borderBottomColor: colors.borderLight, marginBottom: Spacing.sm },
  title: { fontSize: 22, fontFamily: Fonts.heading, color: colors.textPrimary },
  viewModeRow: { flexDirection: 'row', backgroundColor: colors.bgElevated, borderRadius: Radius.full, padding: 2 },
  viewModeBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: Radius.full },
  viewModeDivider: { width: 0 },
  viewModeBtnActive: { backgroundColor: colors.accent },
  viewModeTxt: { fontSize: 11, fontFamily: Fonts.heading, color: colors.textMuted },
  viewModeTxtActive: { color: '#FFFFFF' },
  miniSummary: { flexDirection: 'row', marginHorizontal: Spacing.lg, backgroundColor: colors.bgCard, padding: Spacing.base, borderRadius: Radius.lg, shadowColor: colors.shadowColor, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  miniItem: { flex: 1, alignItems: 'center' },
  divider: { width: 1, backgroundColor: colors.borderLight },
  miniAmt: { fontSize: 16, fontFamily: Fonts.mono },
  miniLbl: { fontSize: 11, fontFamily: Fonts.heading, color: colors.textMuted, marginTop: 4, letterSpacing: 0.5 },
  filterRow: { flexDirection: 'row', marginHorizontal: Spacing.lg, marginTop: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.sm },
  filterTab: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, backgroundColor: colors.bgElevated, borderRadius: Radius.full },
  filterAllActive: { backgroundColor: colors.info },
  filterIncomeActive: { backgroundColor: colors.income },
  filterExpenseActive: { backgroundColor: colors.expense },
  filterTxt: { fontSize: 12, fontFamily: Fonts.heading, color: colors.textSecondary },
  filterAllTxtActive: { color: '#FFFFFF' },
  filterIncomeTxtActive: { color: '#FFFFFF' },
  filterExpenseTxtActive: { color: '#FFFFFF' },
  list: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  dateGroup: { marginBottom: Spacing.md },
  dateLbl: { fontSize: 13, fontFamily: Fonts.heading, color: colors.textSecondary, marginBottom: Spacing.sm, marginLeft: Spacing.xs, letterSpacing: 1 },
  txnCard: { marginBottom: Spacing.sm },
  txnRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  txnInfo: { flex: 1 },
  txnCat: { fontSize: 15, fontFamily: Fonts.body, color: colors.textPrimary },
  txnDesc: { fontSize: 13, fontFamily: Fonts.bodyRegular, color: colors.textMuted, marginTop: 2 },
  txnAmt: { fontSize: 15, fontFamily: Fonts.mono },
});
