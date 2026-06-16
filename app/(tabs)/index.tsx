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
import { FAB } from '@/components/ui/fab';
import { Spacing, Radius, type PaletteType } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
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
  const colors = useThemeColors();

  const [totals, setTotals] = useState<MonthlyTotals>({ income: 0, expenses: 0, balance: 0 });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [upcomingBills, setUpcomingBills] = useState<(Bill & { is_paid: boolean })[]>([]);
  const [activeLoansCount, setActiveLoansCount] = useState(0);
  const [totalDebt, setTotalDebt] = useState(0);
  const [budget, setBudget] = useState(0);
  const [bankSummary, setBankSummary] = useState<BankSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [hideBalances, setHideBalances] = useState(true);

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
    budgetProgress > 0.9 ? colors.danger : budgetProgress > 0.7 ? colors.warning : colors.accent;

  const s = createStyles(colors);

  return (
    <View style={s.container}>
      {/* Header */}
      <LinearGradient
        colors={[colors.bgElevated, colors.bg]}
        style={s.header}
      >
        <View style={s.headerContent}>
          <View>
            <Text style={s.dateText}>{todayDate}</Text>
            <Text style={s.greeting}>{greeting}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={s.scrollView}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        {/* Bank & Wallet Card */}
        {bankSummary && (
          <Card style={s.bankCard}>
            <View style={s.bankHeader}>
              <Text style={s.bankTitle}>My Accounts</Text>
              <View style={s.actionBtnsRow}>
                <Pressable 
                  style={[s.actionBtnSmall, { backgroundColor: colors.bank }]}
                  onPress={() => router.push('/deposit')}
                >
                  <MaterialIcons name="arrow-upward" size={14} color={colors.white} />
                  <Text style={s.actionBtnTxt}>Deposit</Text>
                </Pressable>
                <Pressable 
                  style={[s.actionBtnSmall, { backgroundColor: colors.wallet }]}
                  onPress={() => router.push('/withdraw')}
                >
                  <MaterialIcons name="arrow-downward" size={14} color={colors.white} />
                  <Text style={s.actionBtnTxt}>Withdraw</Text>
                </Pressable>
              </View>
            </View>

            <View style={s.accountsRow}>
              {/* Bank Account */}
              <View style={s.accountCol}>
                <View style={s.accountLabelRow}>
                  <View style={[s.accountDot, { backgroundColor: colors.bank }]} />
                  <Text style={s.accountLabel}>Bank</Text>
                </View>
                <Text style={s.accountAmount}>
                  {hideBalances ? '••••' : formatCurrency(bankSummary.bankBalance)}
                </Text>
              </View>

              <View style={s.accountDivider} />

              {/* Hand/Wallet */}
              <View style={s.accountCol}>
                <View style={s.accountLabelRow}>
                  <View style={[s.accountDot, { backgroundColor: colors.wallet }]} />
                  <Text style={s.accountLabel}>Hand Cash</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm, paddingRight: 4 }}>
                  <Text style={[s.accountAmount, { marginBottom: 0 }]}>
                    {hideBalances ? '••••' : formatCurrency(bankSummary.handBalance)}
                  </Text>
                  <Pressable onPress={() => setHideBalances(!hideBalances)} style={{ padding: 4, marginTop: -4 }}>
                    <MaterialIcons 
                      name={hideBalances ? 'visibility-off' : 'visibility'} 
                      size={20} 
                      color={colors.textSecondary} 
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          </Card>
        )}

        {/* Balance Card */}
        <Card style={s.balanceCard}>
          <View style={s.balanceRow}>
            <View style={s.balanceInfo}>
              <Text style={s.balanceLabel}>Net Balance</Text>
              <Text
                style={[
                  s.balanceAmount,
                  { color: totals.balance >= 0 ? colors.income : colors.expense },
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
            <View style={s.budgetInfo}>
              <Text style={s.budgetText}>
                {formatCurrency(totals.expenses)} of {formatCurrency(budget)} budget used
              </Text>
            </View>
          )}
        </Card>

        {/* Summary Cards */}
        <View style={s.summaryRow}>
          <SummaryCard
            title="Income"
            amount={totals.income}
            icon="trending-up"
            gradient={colors.gradientIncome}
            small
          />
          <View style={{ width: Spacing.md }} />
          <SummaryCard
            title="Expenses"
            amount={totals.expenses}
            icon="trending-down"
            gradient={colors.gradientExpense}
            small
          />
        </View>

        {/* Quick Stats */}
        <View style={s.quickStats}>
          <Card style={s.quickStatCard} onPress={() => router.push('/(tabs)/loans')}>
            <View style={[s.quickStatIcon, { backgroundColor: colors.loanBg }]}>
              <MaterialIcons name="account-balance" size={20} color={colors.loan} />
            </View>
            <Text style={s.quickStatValue}>{activeLoansCount}</Text>
            <Text style={s.quickStatLabel}>Active Loans</Text>
          </Card>

          <Card style={s.quickStatCard} onPress={() => router.push('/(tabs)/loans')}>
            <View style={[s.quickStatIcon, { backgroundColor: colors.expenseBg }]}>
              <MaterialIcons name="money-off" size={20} color={colors.expense} />
            </View>
            <Text style={s.quickStatValue}>{formatCurrency(totalDebt)}</Text>
            <Text style={s.quickStatLabel}>Total Debt</Text>
          </Card>

          <Card style={s.quickStatCard} onPress={() => router.push('/(tabs)/bills')}>
            <View style={[s.quickStatIcon, { backgroundColor: colors.billBg }]}>
              <MaterialIcons name="receipt-long" size={20} color={colors.bill} />
            </View>
            <Text style={s.quickStatValue}>{upcomingBills.length}</Text>
            <Text style={s.quickStatLabel}>Unpaid Bills</Text>
          </Card>
        </View>

        {/* Upcoming Bills */}
        {upcomingBills.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Upcoming Bills</Text>
              <Text
                style={s.seeAll}
                onPress={() => router.push('/(tabs)/bills')}
              >
                See all
              </Text>
            </View>
            {upcomingBills.map((bill) => {
              const days = daysUntilDue(bill.due_day);
              const isOverdue = new Date().getDate() > bill.due_day;
              return (
                <Card key={bill.id} style={s.billItem}>
                  <View style={s.billRow}>
                    <CategoryBadge category={bill.category} size="sm" />
                    <View style={s.billInfo}>
                      <Text style={s.billName}>{bill.name}</Text>
                      <Text
                        style={[
                          s.billDue,
                          isOverdue && { color: colors.danger },
                        ]}
                      >
                        {isOverdue ? 'Overdue' : `Due in ${days} day${days !== 1 ? 's' : ''}`}
                      </Text>
                    </View>
                    <Text style={s.billAmount}>{formatCurrency(bill.amount)}</Text>
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        {/* Recent Transactions */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Recent Transactions</Text>
            <Text
              style={s.seeAll}
              onPress={() => router.push('/(tabs)/transactions')}
            >
              See all
            </Text>
          </View>
          {recentTransactions.length === 0 ? (
            <Card>
              <Text style={s.emptyText}>
                No transactions yet. Tap + on the Transactions tab to add one.
              </Text>
            </Card>
          ) : (
            recentTransactions.map((txn) => (
              <Card 
                key={txn.id} 
                style={s.txnItem}
                onPress={() => router.push({ pathname: '/add-transaction', params: { id: txn.id } })}
              >
                <View style={s.txnRow}>
                  <CategoryBadge category={txn.category} size="sm" />
                  <View style={s.txnInfo}>
                    <Text style={s.txnCategory}>{txn.category}</Text>
                    <Text style={s.txnDate}>{formatDateShort(txn.date)}</Text>
                  </View>
                  <Text
                    style={[
                      s.txnAmount,
                      {
                        color:
                          txn.type === 'income' ? colors.income : colors.expense,
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
      <FAB onPress={() => router.push('/add-transaction')} />
    </View>
  );
}

const createStyles = (colors: PaletteType) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
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
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dateText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
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
    color: colors.textSecondary,
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
    borderTopColor: colors.border,
  },
  budgetText: {
    fontSize: 13,
    color: colors.textMuted,
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
    color: colors.textPrimary,
    marginBottom: 2,
    textAlign: 'center',
  },
  quickStatLabel: {
    fontSize: 11,
    color: colors.textMuted,
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
    color: colors.textPrimary,
  },
  seeAll: {
    fontSize: 13,
    color: colors.accent,
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
    color: colors.textPrimary,
  },
  billDue: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  billAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
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
    color: colors.textPrimary,
  },
  txnDate: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  txnAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
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
    color: colors.textPrimary,
  },
  actionBtnsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    gap: 4,
  },
  actionBtnTxt: {
    color: colors.white,
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
    backgroundColor: colors.border,
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
    color: colors.textSecondary,
    fontWeight: '500',
  },
  accountAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: colors.bgInput,
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
    color: colors.textMuted,
  },
});
