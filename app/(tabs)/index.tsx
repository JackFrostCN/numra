import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';

import { Card } from '@/components/ui/card';
import { CategoryBadge } from '@/components/ui/category-badge';
import { StatRing } from '@/components/ui/stat-ring';
import { SummaryCard } from '@/components/ui/summary-card';
import { Palette, Spacing, Radius } from '@/constants/theme';
import {
  getActiveLoans,
  getBillPaymentsForMonth,
  getBills,
  getMonthlyTotals,
  getRecentTransactions,
  getSetting,
  getBankSummary,
} from '@/db/queries';
import type { Bill, Loan, MonthlyTotals, Transaction, BankSummary } from '@/types';
import {
  daysUntilDue,
  formatCurrency,
  formatDateShort,
  getCurrentYearMonth,
  getMonthDisplayName,
} from '@/utils/helpers';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  if (hour >= 17 && hour < 21) return 'Good Evening';
  return 'Hello Night Owl, tracking some finance shit?';
}

export default function DashboardScreen() {
  const db = useSQLiteContext();
  const router = useRouter();

  const [totals, setTotals] = useState<MonthlyTotals>({ income: 0, expenses: 0, balance: 0 });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [upcomingBills, setUpcomingBills] = useState<(Bill & { is_paid: boolean })[]>([]);
  const [activeLoansCount, setActiveLoansCount] = useState(0);
  const [totalDebt, setTotalDebt] = useState(0);
  const [budget, setBudget] = useState(0);
  const [bankSummary, setBankSummary] = useState<BankSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const greeting = useMemo(() => getGreeting(), [refreshKey]);
  const todayDate = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    [refreshKey]
  );

  const currentMonth = getCurrentYearMonth();

  const loadData = useCallback(async () => {
    try {
      const [monthTotals, recent, bills, billPayments, loans, budgetSetting, summary] = await Promise.all([
        getMonthlyTotals(db, currentMonth),
        getRecentTransactions(db, 5),
        getBills(db),
        getBillPaymentsForMonth(db, currentMonth),
        getActiveLoans(db),
        getSetting(db, 'monthly_budget'),
        getBankSummary(db),
      ]);

      setTotals(monthTotals);
      setRecentTransactions(recent);
      setActiveLoansCount(loans.length);
      setBudget(Number(budgetSetting) || 0);
      setBankSummary(summary);

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
    setRefreshKey((k) => k + 1);
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
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.dateText}>{todayDate}</Text>
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

        {/* Bank & Wallet Card */}
        {bankSummary && (
          <Card style={styles.bankCard}>
            <View style={styles.bankHeader}>
              <Text style={styles.bankTitle}>My Accounts</Text>
              <Pressable 
                style={styles.withdrawBtnSmall}
                onPress={() => router.push('/withdraw')}
              >
                <MaterialIcons name="arrow-downward" size={14} color={Palette.white} />
                <Text style={styles.withdrawBtnTxt}>Withdraw</Text>
              </Pressable>
            </View>

            <View style={styles.accountsRow}>
              {/* Bank Account */}
              <View style={styles.accountCol}>
                <View style={styles.accountLabelRow}>
                  <View style={[styles.accountDot, { backgroundColor: Palette.bank }]} />
                  <Text style={styles.accountLabel}>Bank</Text>
                </View>
                <Text style={styles.accountAmount}>
                  {formatCurrency(bankSummary.bankBalance)}
                </Text>
              </View>

              <View style={styles.accountDivider} />

              {/* Hand/Wallet */}
              <View style={styles.accountCol}>
                <View style={styles.accountLabelRow}>
                  <View style={[styles.accountDot, { backgroundColor: Palette.wallet }]} />
                  <Text style={styles.accountLabel}>Hand Cash</Text>
                </View>
                <Text style={styles.accountAmount}>
                  {formatCurrency(bankSummary.handBalance)}
                </Text>
              </View>
            </View>
          </Card>
        )}

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
              <Card 
                key={txn.id} 
                style={styles.txnItem}
                onPress={() => router.push({ pathname: '/add-transaction', params: { id: txn.id } })}
              >
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
    fontSize: 16,
    fontWeight: '600',
    color: Palette.textSecondary,
    marginBottom: 4,
  },
  dateText: {
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
  bankCard: {
    marginBottom: Spacing.md,
    padding: Spacing.base,
  },
  bankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  bankTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.textPrimary,
  },
  withdrawBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.wallet,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    gap: 4,
  },
  withdrawBtnTxt: {
    color: Palette.white,
    fontSize: 12,
    fontWeight: '600',
  },
  accountsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountCol: {
    flex: 1,
  },
  accountDivider: {
    width: 1,
    height: '80%',
    backgroundColor: Palette.border,
    marginHorizontal: Spacing.md,
  },
  accountLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  accountDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  accountLabel: {
    fontSize: 13,
    color: Palette.textSecondary,
    fontWeight: '500',
  },
  accountAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.textPrimary,
    marginBottom: Spacing.sm,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: Palette.bgInput,
    borderRadius: 2,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  accountSub: {
    fontSize: 11,
    color: Palette.textMuted,
  },
});
