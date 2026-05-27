import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { CategoryBadge } from '@/components/ui/category-badge';
import { StatRing } from '@/components/ui/stat-ring';
import { SummaryCard } from '@/components/ui/summary-card';
import { Palette, Spacing } from '@/constants/theme';
import {
  getActiveLoans,
  getBillPaymentsForMonth,
  getBills,
  getMonthlyTotals,
  getRecentTransactions,
  getSetting,
} from '@/db/queries';
import type { Bill, Loan, MonthlyTotals, Transaction } from '@/types';
import {
  daysUntilDue,
  formatCurrency,
  formatDateShort,
  getCurrentYearMonth,
  getMonthDisplayName,
} from '@/utils/helpers';

export default function DashboardScreen() {
  const db = useSQLiteContext();
  const router = useRouter();

  const [totals, setTotals] = useState<MonthlyTotals>({ income: 0, expenses: 0, balance: 0 });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [upcomingBills, setUpcomingBills] = useState<(Bill & { is_paid: boolean })[]>([]);
  const [activeLoansCount, setActiveLoansCount] = useState(0);
  const [totalDebt, setTotalDebt] = useState(0);
  const [budget, setBudget] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const currentMonth = getCurrentYearMonth();

  const loadData = useCallback(async () => {
    try {
      const [monthTotals, recent, bills, billPayments, loans, budgetSetting] = await Promise.all([
        getMonthlyTotals(db, currentMonth),
        getRecentTransactions(db, 5),
        getBills(db),
        getBillPaymentsForMonth(db, currentMonth),
        getActiveLoans(db),
        getSetting(db, 'monthly_budget'),
      ]);

      setTotals(monthTotals);
      setRecentTransactions(recent);
      setActiveLoansCount(loans.length);
      setBudget(Number(budgetSetting) || 0);

      // Calculate total debt (borrowed loans)
      const debt = loans
        .filter((l: Loan) => l.type === 'borrowed')
        .reduce((sum: number, l: Loan) => sum + l.remaining_amount, 0);
      setTotalDebt(debt);

      // Bills with paid status
      const paidBillIds = new Set(billPayments.map((p) => p.bill_id));
      const billsWithStatus = bills
        .map((b) => ({ ...b, is_paid: paidBillIds.has(b.id) }))
        .filter((b) => !b.is_paid)
        .sort((a, b) => daysUntilDue(a.due_day) - daysUntilDue(b.due_day))
        .slice(0, 3);
      setUpcomingBills(billsWithStatus);
    } catch (error) {
      console.error('Dashboard load error:', error);
    }
  }, [db, currentMonth]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const budgetProgress = budget > 0 ? totals.expenses / budget : 0;
  const budgetPercentText = budget > 0 ? `${Math.round(budgetProgress * 100)}%` : '—';
  const budgetColor =
    budgetProgress > 0.9 ? Palette.danger : budgetProgress > 0.7 ? Palette.warning : Palette.accent;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Palette.bgElevated, Palette.bg]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome back Charith</Text>
            <Text style={styles.monthLabel}>{getMonthDisplayName(currentMonth)}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Palette.accent}
            colors={[Palette.accent]}
          />
        }
      >
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <SummaryCard
            title="Income"
            amount={totals.income}
            icon="trending-up"
            gradient={Palette.gradientIncome}
          />
          <View style={{ width: Spacing.md }} />
          <SummaryCard
            title="Expenses"
            amount={totals.expenses}
            icon="trending-down"
            gradient={Palette.gradientExpense}
          />
        </View>

        {/* Balance Card */}
        <Card style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>Net Balance</Text>
              <Text
                style={[
                  styles.balanceAmount,
                  { color: totals.balance >= 0 ? Palette.income : Palette.expense },
                ]}
              >
                {formatCurrency(totals.balance)}
              </Text>
            </View>

            {budget > 0 && (
              <StatRing
                progress={Math.min(budgetProgress, 1)}
                size={80}
                strokeWidth={8}
                color={budgetColor}
                value={budgetPercentText}
                label="Budget"
              />
            )}
          </View>

          {budget > 0 && (
            <View style={styles.budgetInfo}>
              <Text style={styles.budgetText}>
                {formatCurrency(totals.expenses)} of {formatCurrency(budget)} budget used
              </Text>
            </View>
          )}
        </Card>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <Card style={styles.quickStatCard} onPress={() => router.push('/(tabs)/loans')}>
            <View style={[styles.quickStatIcon, { backgroundColor: Palette.loanBg }]}>
              <MaterialIcons name="account-balance" size={20} color={Palette.loan} />
            </View>
            <Text style={styles.quickStatValue}>{activeLoansCount}</Text>
            <Text style={styles.quickStatLabel}>Active Loans</Text>
          </Card>

          <Card style={styles.quickStatCard} onPress={() => router.push('/(tabs)/loans')}>
            <View style={[styles.quickStatIcon, { backgroundColor: Palette.expenseBg }]}>
              <MaterialIcons name="money-off" size={20} color={Palette.expense} />
            </View>
            <Text style={styles.quickStatValue}>{formatCurrency(totalDebt)}</Text>
            <Text style={styles.quickStatLabel}>Total Debt</Text>
          </Card>

          <Card style={styles.quickStatCard} onPress={() => router.push('/(tabs)/bills')}>
            <View style={[styles.quickStatIcon, { backgroundColor: Palette.billBg }]}>
              <MaterialIcons name="receipt-long" size={20} color={Palette.bill} />
            </View>
            <Text style={styles.quickStatValue}>{upcomingBills.length}</Text>
            <Text style={styles.quickStatLabel}>Unpaid Bills</Text>
          </Card>
        </View>

        {/* Upcoming Bills */}
        {upcomingBills.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Bills</Text>
              <Text
                style={styles.seeAll}
                onPress={() => router.push('/(tabs)/bills')}
              >
                See all
              </Text>
            </View>
            {upcomingBills.map((bill) => {
              const days = daysUntilDue(bill.due_day);
              const isOverdue = new Date().getDate() > bill.due_day;
              return (
                <Card key={bill.id} style={styles.billItem}>
                  <View style={styles.billRow}>
                    <CategoryBadge category={bill.category} size="sm" />
                    <View style={styles.billInfo}>
                      <Text style={styles.billName}>{bill.name}</Text>
                      <Text
                        style={[
                          styles.billDue,
                          isOverdue && { color: Palette.danger },
                        ]}
                      >
                        {isOverdue ? 'Overdue' : `Due in ${days} day${days !== 1 ? 's' : ''}`}
                      </Text>
                    </View>
                    <Text style={styles.billAmount}>{formatCurrency(bill.amount)}</Text>
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <Text
              style={styles.seeAll}
              onPress={() => router.push('/(tabs)/transactions')}
            >
              See all
            </Text>
          </View>
          {recentTransactions.length === 0 ? (
            <Card>
              <Text style={styles.emptyText}>
                No transactions yet. Tap + on the Transactions tab to add one.
              </Text>
            </Card>
          ) : (
            recentTransactions.map((txn) => (
              <Card key={txn.id} style={styles.txnItem}>
                <View style={styles.txnRow}>
                  <CategoryBadge category={txn.category} size="sm" />
                  <View style={styles.txnInfo}>
                    <Text style={styles.txnCategory}>{txn.category}</Text>
                    <Text style={styles.txnDate}>{formatDateShort(txn.date)}</Text>
                  </View>
                  <Text
                    style={[
                      styles.txnAmount,
                      {
                        color:
                          txn.type === 'income' ? Palette.income : Palette.expense,
                      },
                    ]}
                  >
                    {txn.type === 'income' ? '+' : '-'}
                    {formatCurrency(txn.amount)}
                  </Text>
                </View>
              </Card>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bg,
  },
  header: {
    paddingTop: 56,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    color: Palette.textSecondary,
    marginBottom: 4,
  },
  monthLabel: {
    fontSize: 22,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  balanceCard: {
    marginBottom: Spacing.md,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 13,
    color: Palette.textSecondary,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '700',
  },
  budgetInfo: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
  },
  budgetText: {
    fontSize: 13,
    color: Palette.textMuted,
  },
  quickStats: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  quickStatCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginBottom: 0,
  },
  quickStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  quickStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.textPrimary,
    marginBottom: 2,
    textAlign: 'center',
  },
  quickStatLabel: {
    fontSize: 11,
    color: Palette.textMuted,
    textAlign: 'center',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Palette.textPrimary,
  },
  seeAll: {
    fontSize: 13,
    color: Palette.accent,
    fontWeight: '500',
  },
  billItem: {
    marginBottom: Spacing.sm,
  },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  billInfo: {
    flex: 1,
  },
  billName: {
    fontSize: 15,
    fontWeight: '500',
    color: Palette.textPrimary,
  },
  billDue: {
    fontSize: 12,
    color: Palette.textMuted,
    marginTop: 2,
  },
  billAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.textPrimary,
  },
  txnItem: {
    marginBottom: Spacing.sm,
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  txnInfo: {
    flex: 1,
  },
  txnCategory: {
    fontSize: 15,
    fontWeight: '500',
    color: Palette.textPrimary,
  },
  txnDate: {
    fontSize: 12,
    color: Palette.textMuted,
    marginTop: 2,
  },
  txnAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: Palette.textMuted,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
});
