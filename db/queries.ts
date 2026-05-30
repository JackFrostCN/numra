// ──────────────────────────────────────────────
// Numra — Database Query Functions
// ──────────────────────────────────────────────

import type { SQLiteDatabase } from 'expo-sqlite';
import type {
  Transaction,
  Loan,
  LoanPayment,
  Bill,
  BillPayment,
  MonthlyTotals,
  Withdrawal,
  BankSummary,
} from '@/types';

// ════════════════════════════════════════════════
// TRANSACTIONS
// ════════════════════════════════════════════════

export async function addTransaction(
  db: SQLiteDatabase,
  data: {
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description?: string;
    date: string;
    source?: 'bank' | 'hand';
  }
) {
  const result = await db.runAsync(
    'INSERT INTO transactions (type, amount, category, description, date, source) VALUES (?, ?, ?, ?, ?, ?)',
    data.type,
    data.amount,
    data.category,
    data.description ?? null,
    data.date,
    data.source ?? 'bank'
  );
  return result.lastInsertRowId;
}

export async function getTransactionsByMonth(
  db: SQLiteDatabase,
  yearMonth: string // "YYYY-MM"
): Promise<Transaction[]> {
  return db.getAllAsync<Transaction>(
    `SELECT * FROM transactions 
     WHERE strftime('%Y-%m', date) = ? 
     ORDER BY date DESC, id DESC`,
    yearMonth
  );
}

export async function getMonthlyTotals(
  db: SQLiteDatabase,
  yearMonth: string
): Promise<MonthlyTotals> {
  const income = await db.getFirstAsync<{ total: number }>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
     WHERE type = 'income' AND strftime('%Y-%m', date) = ?`,
    yearMonth
  );
  const expenses = await db.getFirstAsync<{ total: number }>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
     WHERE type = 'expense' AND strftime('%Y-%m', date) = ?`,
    yearMonth
  );

  const inc = income?.total ?? 0;
  const exp = expenses?.total ?? 0;

  return {
    income: inc,
    expenses: exp,
    balance: inc - exp,
  };
}

export async function getRecentTransactions(
  db: SQLiteDatabase,
  limit: number = 5
): Promise<Transaction[]> {
  return db.getAllAsync<Transaction>(
    'SELECT * FROM transactions ORDER BY date DESC, id DESC LIMIT ?',
    limit
  );
}

export async function deleteTransaction(db: SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM transactions WHERE id = ?', id);
}

// ════════════════════════════════════════════════
// LOANS
// ════════════════════════════════════════════════

export async function addLoan(
  db: SQLiteDatabase,
  data: {
    type: 'lent' | 'borrowed';
    person_name: string;
    total_amount: number;
    date: string;
    source: 'bank' | 'hand';
    due_date?: string;
    notes?: string;
  }
) {
  const result = await db.runAsync(
    `INSERT INTO loans (type, person_name, total_amount, remaining_amount, date, source, due_date, notes) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    data.type,
    data.person_name,
    data.total_amount,
    data.total_amount, // remaining = total at start
    data.date,
    data.source,
    data.due_date ?? null,
    data.notes ?? null
  );
  return result.lastInsertRowId;
}

export async function getActiveLoans(
  db: SQLiteDatabase
): Promise<Loan[]> {
  return db.getAllAsync<Loan>(
    'SELECT * FROM loans WHERE is_completed = 0 ORDER BY date DESC'
  );
}

export async function getAllLoans(
  db: SQLiteDatabase
): Promise<Loan[]> {
  return db.getAllAsync<Loan>(
    'SELECT * FROM loans ORDER BY is_completed ASC, date DESC'
  );
}

export async function getLoanById(
  db: SQLiteDatabase,
  id: number
): Promise<Loan | null> {
  return db.getFirstAsync<Loan>('SELECT * FROM loans WHERE id = ?', id);
}

export async function recordLoanPayment(
  db: SQLiteDatabase,
  loanId: number,
  amount: number,
  date: string,
  source: 'bank' | 'hand',
  note?: string
) {
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'INSERT INTO loan_payments (loan_id, amount, date, source, note) VALUES (?, ?, ?, ?, ?)',
      loanId,
      amount,
      date,
      source,
      note ?? null
    );

    await db.runAsync(
      'UPDATE loans SET remaining_amount = MAX(0, remaining_amount - ?) WHERE id = ?',
      amount,
      loanId
    );

    // Auto-complete if remaining is 0
    const loan = await db.getFirstAsync<Loan>(
      'SELECT * FROM loans WHERE id = ?',
      loanId
    );
    if (loan && loan.remaining_amount <= 0) {
      await db.runAsync(
        'UPDATE loans SET is_completed = 1, remaining_amount = 0 WHERE id = ?',
        loanId
      );
    }
  });
}

export async function getLoanPayments(
  db: SQLiteDatabase,
  loanId: number
): Promise<LoanPayment[]> {
  return db.getAllAsync<LoanPayment>(
    'SELECT * FROM loan_payments WHERE loan_id = ? ORDER BY date DESC',
    loanId
  );
}

export async function markLoanComplete(db: SQLiteDatabase, id: number) {
  await db.runAsync(
    'UPDATE loans SET is_completed = 1, remaining_amount = 0 WHERE id = ?',
    id
  );
}

export async function deleteLoan(db: SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM loans WHERE id = ?', id);
}

// ════════════════════════════════════════════════
// BILLS
// ════════════════════════════════════════════════

export async function addBill(
  db: SQLiteDatabase,
  data: {
    name: string;
    amount: number;
    category: string;
    due_day: number;
    is_recurring?: boolean;
  }
) {
  const result = await db.runAsync(
    'INSERT INTO bills (name, amount, category, due_day, is_recurring) VALUES (?, ?, ?, ?, ?)',
    data.name,
    data.amount,
    data.category,
    data.due_day,
    data.is_recurring !== false ? 1 : 0
  );
  return result.lastInsertRowId;
}

export async function getBills(db: SQLiteDatabase): Promise<Bill[]> {
  return db.getAllAsync<Bill>('SELECT * FROM bills ORDER BY due_day ASC');
}

export async function markBillPaid(
  db: SQLiteDatabase,
  billId: number,
  month: string, // "YYYY-MM"
  paidDate: string,
  source: 'bank' | 'hand'
) {
  await db.runAsync(
    'INSERT OR REPLACE INTO bill_payments (bill_id, paid_date, month, source) VALUES (?, ?, ?, ?)',
    billId,
    paidDate,
    month,
    source
  );
}

export async function markBillUnpaid(
  db: SQLiteDatabase,
  billId: number,
  month: string
) {
  await db.runAsync(
    'DELETE FROM bill_payments WHERE bill_id = ? AND month = ?',
    billId,
    month
  );
}

export async function getBillPaymentsForMonth(
  db: SQLiteDatabase,
  month: string
): Promise<BillPayment[]> {
  return db.getAllAsync<BillPayment>(
    'SELECT * FROM bill_payments WHERE month = ?',
    month
  );
}

export async function isBillPaidForMonth(
  db: SQLiteDatabase,
  billId: number,
  month: string
): Promise<boolean> {
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM bill_payments WHERE bill_id = ? AND month = ?',
    billId,
    month
  );
  return (result?.count ?? 0) > 0;
}

export async function deleteBill(db: SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM bills WHERE id = ?', id);
}

export async function getMonthlyBillsTotal(
  db: SQLiteDatabase
): Promise<number> {
  const result = await db.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(amount), 0) as total FROM bills'
  );
  return result?.total ?? 0;
}

// ════════════════════════════════════════════════
// WITHDRAWALS (Bank → Hand)
// ════════════════════════════════════════════════

export async function addWithdrawal(
  db: SQLiteDatabase,
  data: {
    amount: number;
    date: string;
    note?: string;
  }
) {
  const result = await db.runAsync(
    'INSERT INTO withdrawals (amount, date, note) VALUES (?, ?, ?)',
    data.amount,
    data.date,
    data.note ?? null
  );
  return result.lastInsertRowId;
}

export async function getWithdrawalsByMonth(
  db: SQLiteDatabase,
  yearMonth: string
): Promise<Withdrawal[]> {
  return db.getAllAsync<Withdrawal>(
    `SELECT * FROM withdrawals 
     WHERE strftime('%Y-%m', date) = ? 
     ORDER BY date DESC, id DESC`,
    yearMonth
  );
}

export async function deleteWithdrawal(db: SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM withdrawals WHERE id = ?', id);
}

export async function getBankSummary(
  db: SQLiteDatabase
): Promise<{ bankBalance: number; handBalance: number }> {
  // Use grouped aggregations to minimize queries and keep things fast
  const [
    transactionsRaw,
    loansRaw,
    lentPaymentsRaw,
    borrowedPaymentsRaw,
    billPaymentsRaw,
    withdrawalsRaw,
    salarySetting
  ] = await Promise.all([
    db.getAllAsync<{source: string, type: string, total: number}>(
      `SELECT source, type, COALESCE(SUM(amount),0) as total FROM transactions GROUP BY source, type`
    ),
    db.getAllAsync<{source: string, type: string, total: number}>(
      `SELECT source, type, COALESCE(SUM(total_amount),0) as total FROM loans GROUP BY source, type`
    ),
    db.getAllAsync<{source: string, total: number}>(
      `SELECT p.source, COALESCE(SUM(p.amount),0) as total FROM loan_payments p JOIN loans l ON p.loan_id = l.id WHERE l.type = 'lent' GROUP BY p.source`
    ),
    db.getAllAsync<{source: string, total: number}>(
      `SELECT p.source, COALESCE(SUM(p.amount),0) as total FROM loan_payments p JOIN loans l ON p.loan_id = l.id WHERE l.type = 'borrowed' GROUP BY p.source`
    ),
    db.getAllAsync<{source: string, total: number}>(
      `SELECT p.source, COALESCE(SUM(b.amount),0) as total FROM bill_payments p JOIN bills b ON p.bill_id = b.id GROUP BY p.source`
    ),
    db.getFirstAsync<{total: number}>(
      `SELECT COALESCE(SUM(amount),0) as total FROM withdrawals`
    ),
    db.getFirstAsync<{value: string}>(
      `SELECT value FROM settings WHERE key = 'monthly_budget'`
    )
  ]);

  // Helper to extract values easily
  const getVal = (arr: any[], condition: (item: any) => boolean) => arr.find(condition)?.total ?? 0;

  // Inflows
  const bankIncome = getVal(transactionsRaw, t => t.source === 'bank' && t.type === 'income');
  const handIncome = getVal(transactionsRaw, t => t.source === 'hand' && t.type === 'income');
  
  const bankBorrowed = getVal(loansRaw, l => l.source === 'bank' && l.type === 'borrowed');
  const handBorrowed = getVal(loansRaw, l => l.source === 'hand' && l.type === 'borrowed');

  const bankLentPaidBack = getVal(lentPaymentsRaw, p => p.source === 'bank');
  const handLentPaidBack = getVal(lentPaymentsRaw, p => p.source === 'hand');

  // Outflows
  const bankExpense = getVal(transactionsRaw, t => t.source === 'bank' && t.type === 'expense');
  const handExpense = getVal(transactionsRaw, t => t.source === 'hand' && t.type === 'expense');

  const bankLentOut = getVal(loansRaw, l => l.source === 'bank' && l.type === 'lent');
  const handLentOut = getVal(loansRaw, l => l.source === 'hand' && l.type === 'lent');

  const bankBorrowedPayback = getVal(borrowedPaymentsRaw, p => p.source === 'bank');
  const handBorrowedPayback = getVal(borrowedPaymentsRaw, p => p.source === 'hand');

  const bankBills = getVal(billPaymentsRaw, p => p.source === 'bank');
  const handBills = getVal(billPaymentsRaw, p => p.source === 'hand');

  const totalWithdrawn = withdrawalsRaw?.total ?? 0;
  const salary = Number(salarySetting?.value) || 0;

  // Final Balance Calculation
  // Bank starts from your salary, then adjusts with all inflows/outflows
  const bankBalance = 
    salary +
    (bankIncome + bankBorrowed + bankLentPaidBack) - 
    (bankExpense + bankLentOut + bankBorrowedPayback + bankBills + totalWithdrawn);
    
  const handBalance = 
    (handIncome + handBorrowed + handLentPaidBack + totalWithdrawn) - 
    (handExpense + handLentOut + handBorrowedPayback + handBills);

  return { bankBalance, handBalance };
}

// ════════════════════════════════════════════════
// SETTINGS
// ════════════════════════════════════════════════

export async function getSetting(
  db: SQLiteDatabase,
  key: string
): Promise<string | null> {
  const result = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    key
  );
  return result?.value ?? null;
}

export async function setSetting(
  db: SQLiteDatabase,
  key: string,
  value: string
) {
  await db.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    key,
    value
  );
}
