import { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Card } from '@/components/ui/card';
import { FAB } from '@/components/ui/fab';
import { MonthSelector } from '@/components/ui/month-selector';
import { CategoryBadge } from '@/components/ui/category-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Palette, Spacing, Radius } from '@/constants/theme';
import { getBills, getBillPaymentsForMonth, markBillPaid, markBillUnpaid } from '@/db/queries';
import { formatCurrency, getCurrentYearMonth, getYearMonth, daysUntilDue, isBillOverdue } from '@/utils/helpers';
import type { Bill } from '@/types';

export default function BillsScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [monthOffset, setMonthOffset] = useState(0);
  const [bills, setBills] = useState<(Bill & { is_paid: boolean })[]>([]);
  
  const yearMonth = getYearMonth(monthOffset);
  const isCurrentMonth = monthOffset === 0;

  const loadData = useCallback(async () => {
    const allBills = await getBills(db);
    const payments = await getBillPaymentsForMonth(db, yearMonth);
    const paidIds = new Set(payments.map(p => p.bill_id));
    
    setBills(allBills.map(b => ({ ...b, is_paid: paidIds.has(b.id) })));
  }, [db, yearMonth]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const togglePaid = async (billId: number, isPaid: boolean) => {
    if (isPaid) {
      await markBillUnpaid(db, billId, yearMonth);
    } else {
      await markBillPaid(db, billId, yearMonth, new Date().toISOString());
    }
    loadData();
  };

  const totalUnpaid = bills.filter(b => !b.is_paid).reduce((sum, b) => sum + b.amount, 0);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Bills</Text>
      </View>

      <MonthSelector yearMonth={yearMonth} onPrev={() => setMonthOffset(o => o - 1)} onNext={() => setMonthOffset(o => o + 1)} />

      <View style={s.summaryCard}>
        <Text style={s.summaryLbl}>Unpaid this month</Text>
        <Text style={s.summaryAmt}>{formatCurrency(totalUnpaid)}</Text>
      </View>

      <ScrollView style={s.list} contentContainerStyle={s.listContent}>
        {bills.length === 0 ? (
          <EmptyState icon="receipt-long" title="No bills" message="Add your recurring bills to track them" />
        ) : (
          bills.map(bill => {
            const overdue = isCurrentMonth && isBillOverdue(bill.due_day, bill.is_paid);
            const days = daysUntilDue(bill.due_day);
            
            return (
              <Card key={bill.id} style={[s.billCard, bill.is_paid && s.billCardPaid]}>
                <View style={s.billRow}>
                  <CategoryBadge category={bill.category} />
                  <View style={s.billInfo}>
                    <Text style={[s.billName, bill.is_paid && s.textPaid]}>{bill.name}</Text>
                    <Text style={[s.billDue, overdue && s.textOverdue]}>
                      {bill.is_paid ? 'Paid' : overdue ? 'Overdue' : `Due in ${days} day${days !== 1 ? 's' : ''}`}
                    </Text>
                  </View>
                  <View style={s.billRight}>
                    <Text style={[s.billAmt, bill.is_paid && s.textPaid]}>{formatCurrency(bill.amount)}</Text>
                    <Pressable 
                      onPress={() => togglePaid(bill.id, bill.is_paid)}
                      style={[s.checkBtn, bill.is_paid && s.checkBtnPaid]}
                    >
                      <MaterialIcons name="check" size={16} color={bill.is_paid ? Palette.white : Palette.textMuted} />
                    </Pressable>
                  </View>
                </View>
              </Card>
            );
          })
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
      <FAB onPress={() => router.push('/add-bill')} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.bg },
  header: { paddingTop: 56, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  title: { fontSize: 24, fontWeight: '700', color: Palette.textPrimary },
  summaryCard: { marginHorizontal: Spacing.lg, backgroundColor: Palette.billBg, borderRadius: Radius.lg, padding: Spacing.lg, alignItems: 'center', marginBottom: Spacing.md, borderWidth: 1, borderColor: `${Palette.bill}40` },
  summaryLbl: { fontSize: 13, color: Palette.bill, marginBottom: 4 },
  summaryAmt: { fontSize: 28, fontWeight: '700', color: Palette.textPrimary },
  list: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.lg },
  billCard: { marginBottom: Spacing.sm },
  billCardPaid: { opacity: 0.7, backgroundColor: Palette.bgElevated },
  billRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  billInfo: { flex: 1 },
  billName: { fontSize: 16, fontWeight: '600', color: Palette.textPrimary },
  billDue: { fontSize: 13, color: Palette.textMuted, marginTop: 2 },
  billRight: { alignItems: 'flex-end', gap: Spacing.sm },
  billAmt: { fontSize: 15, fontWeight: '600', color: Palette.textPrimary },
  checkBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: Palette.border, alignItems: 'center', justifyContent: 'center' },
  checkBtnPaid: { backgroundColor: Palette.success, borderColor: Palette.success },
  textPaid: { color: Palette.textMuted, textDecorationLine: 'line-through' },
  textOverdue: { color: Palette.danger },
});
