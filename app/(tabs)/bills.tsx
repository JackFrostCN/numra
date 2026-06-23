import { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Card } from '@/components/ui/card';
import { FAB } from '@/components/ui/fab';
import { MonthSelector } from '@/components/ui/month-selector';
import { CategoryBadge } from '@/components/ui/category-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Spacing, Fonts, Radius, Shadows, type PaletteType } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { getBills, getBillPaymentsForMonth, markBillPaid, markBillUnpaid, deleteBill } from '@/db/queries';
import { formatCurrency, getCurrentYearMonth, getYearMonth, daysUntilDue, isBillOverdue } from '@/utils/helpers';
import type { Bill } from '@/types';

export default function BillsScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const colors = useThemeColors();
  const [monthOffset, setMonthOffset] = useState(0);
  const [bills, setBills] = useState<(Bill & { is_paid: boolean })[]>([]);
  
  const yearMonth = getYearMonth(monthOffset);
  const isCurrentMonth = monthOffset === 0;

  const loadData = useCallback(async () => {
    const allBills = await getBills(db);
    setBills(allBills.map(b => ({ ...b, is_paid: false })));
  }, [db]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const totalUnpaid = bills.reduce((sum, b) => sum + b.amount, 0);

  const s = createStyles(colors);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>BILLS</Text>
      </View>

      <MonthSelector yearMonth={yearMonth} onPrev={() => setMonthOffset(o => o - 1)} onNext={() => setMonthOffset(o => o + 1)} />

      <View style={s.summaryWrapper}>
        <View style={s.summaryCard}>
          <Text style={s.summaryLbl}>TOTAL MONTHLY BILLS</Text>
          <Text style={s.summaryAmt}>{formatCurrency(totalUnpaid)}</Text>
        </View>
      </View>

      <ScrollView style={s.list} contentContainerStyle={s.listContent}>
        {bills.length === 0 ? (
          <EmptyState icon="receipt-long" title="NO BILLS" message="Add your recurring bills to track them" />
        ) : (
          bills.map(bill => {
            const overdue = isCurrentMonth && isBillOverdue(bill.due_day, bill.is_paid);
            const days = daysUntilDue(bill.due_day);
            
            return (
              <Card 
                key={bill.id} 
                style={[s.billCard, bill.is_paid && s.billCardPaid]}
                onPress={() => router.push({ pathname: '/add-bill', params: { id: bill.id } })}
                onLongPress={() => {
                  Alert.alert('Delete Bill', `Are you sure you want to delete ${bill.name}?`, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: async () => {
                      await deleteBill(db, bill.id);
                      loadData();
                    }}
                  ]);
                }}
              >
                <View style={s.billRow}>
                  <CategoryBadge category={bill.category} />
                  <View style={s.billInfo}>
                    <Text style={s.billName}>{bill.name}</Text>
                    <Text style={s.billDue}>
                      {`DUE IN ${days} DAY${days !== 1 ? 'S' : ''}`}
                    </Text>
                  </View>
                  <View style={s.billRight}>
                    <Text style={s.billAmt}>{formatCurrency(bill.amount)}</Text>
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

const createStyles = (colors: PaletteType) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingTop: 56, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm, borderBottomWidth: colors.borderWidth, borderBottomColor: colors.borderLight, marginBottom: Spacing.sm },
  title: { fontSize: 24, fontFamily: Fonts.heading, color: colors.textPrimary, letterSpacing: 1 },
  summaryWrapper: { position: 'relative', marginHorizontal: Spacing.lg, marginBottom: Spacing.md },
  summaryCard: { backgroundColor: colors.accent, padding: Spacing.lg, alignItems: 'center', borderRadius: Radius.lg, ...Shadows.sm },
  summaryLbl: { fontSize: 12, fontFamily: Fonts.heading, color: '#FFFFFF', marginBottom: 4, letterSpacing: 1 },
  summaryAmt: { fontSize: 32, fontFamily: Fonts.heading, color: '#FFFFFF' },
  list: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.lg },
  billCard: { marginBottom: Spacing.sm },
  billCardPaid: { opacity: 0.6 },
  billRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  billInfo: { flex: 1 },
  billName: { fontSize: 16, fontFamily: Fonts.heading, color: colors.textPrimary },
  billDue: { fontSize: 11, fontFamily: Fonts.heading, color: colors.textMuted, marginTop: 4, letterSpacing: 0.5 },
  billRight: { alignItems: 'flex-end', gap: Spacing.sm },
  billAmt: { fontSize: 16, fontFamily: Fonts.mono, color: colors.textPrimary },
});
