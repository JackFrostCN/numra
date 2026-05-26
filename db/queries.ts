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
  }
) {
  const result = await db.runAsync(
    'INSERT INTO transactions (type, amount, category, description, date) VALUES (?, ?, ?, ?, ?)',
    data.type,
    data.amount,
    data.category,
    data.description ?? null,
    data.date
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
    due_date?: string;
    notes?: string;
  }
) {
  const result = await db.runAsync(
    `INSERT INTO loans (type, person_name, total_amount, remaining_amount, date, due_date, notes) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    data.type,
    data.person_name,
    data.total_amount,
    data.total_amount, // remaining = total at start
    data.date,
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
  note?: string
) {
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'INSERT INTO loan_payments (loan_id, amount, date, note) VALUES (?, ?, ?, ?)',
      loanId,
      amount,
      date,
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
  paidDate: string
) {
  await db.runAsync(
    'INSERT OR REPLACE INTO bill_payments (bill_id, paid_date, month) VALUES (?, ?, ?)',
    billId,
    paidDate,
    month
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
