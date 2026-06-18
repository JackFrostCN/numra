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
  Deposit,
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
    linked_type?: string;
    linked_id?: number;
  }
) {
  const result = await db.runAsync(
    'INSERT INTO transactions (type, amount, category, description, date, source, linked_type, linked_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    data.type,
    data.amount,
    data.category,
    data.description ?? null,
    data.date,
    data.source ?? 'bank',
    data.linked_type ?? null,
    data.linked_id ?? null
  );
  return result.lastInsertRowId;
}

export async function getTransactionsByMonth(
  db: SQLiteDatabase,
  yearMonth: string // "YYYY-MM"
): Promise<Transaction[]> {
  return db.getAllAsync<Transaction>(
    `SELECT * FROM transactions 
     WHERE strftime('%Y-%m', date, 'localtime') = ? 
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
     WHERE type = 'income' AND strftime('%Y-%m', date, 'localtime') = ?`,
    yearMonth
  );
  const expenses = await db.getFirstAsync<{ total: number }>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
     WHERE type = 'expense' AND strftime('%Y-%m', date, 'localtime') = ?`,
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

export async function getTransactionsByDay(
  db: SQLiteDatabase,
  dateString: string // "YYYY-MM-DD"
): Promise<Transaction[]> {
  return db.getAllAsync<Transaction>(
    `SELECT * FROM transactions 
     WHERE strftime('%Y-%m-%d', date, 'localtime') = ? 
     ORDER BY id DESC`,
    dateString
  );
}

export async function getDailyTotals(
  db: SQLiteDatabase,
  dateString: string
): Promise<MonthlyTotals> {
  const income = await db.getFirstAsync<{ total: number }>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
     WHERE type = 'income' AND strftime('%Y-%m-%d', date, 'localtime') = ?`,
    dateString
  );
  const expenses = await db.getFirstAsync<{ total: number }>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
     WHERE type = 'expense' AND strftime('%Y-%m-%d', date, 'localtime') = ?`,
    dateString
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

export async function getTransactionById(
  db: SQLiteDatabase,
  id: number
): Promise<Transaction | null> {
  return db.getFirstAsync<Transaction>('SELECT * FROM transactions WHERE id = ?', id);
}

export async function updateTransaction(
  db: SQLiteDatabase,
  id: number,
  data: {
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description?: string;
    date: string;
    source: 'bank' | 'hand';
  }
) {
  await db.runAsync(
    `UPDATE transactions 
     SET type = ?, amount = ?, category = ?, description = ?, date = ?, source = ? 
     WHERE id = ?`,
    data.type,
    data.amount,
    data.category,
    data.description ?? null,
    data.date,
    data.source,
    id
  );
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
  let loanId = 0;
  await db.withTransactionAsync(async () => {
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
    loanId = result.lastInsertRowId;

    // Automatically log this as a transaction
    // If I borrow money, it's Income to my bank/hand.
    // If I lend money, it's Expense from my bank/hand.
    const txnType = data.type === 'borrowed' ? 'income' : 'expense';
    const categoryName = data.type === 'borrowed' ? 'Loan Borrowed' : 'Loan Lent';
    
    await db.runAsync(
      'INSERT INTO transactions (type, amount, category, description, date, source, linked_type, linked_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      txnType,
      data.total_amount,
      categoryName,
      data.type === 'borrowed' ? `Borrowed from ${data.person_name}` : `Lent to ${data.person_name}`,
      data.date,
      data.source,
      'loan',
      loanId
    );
  });
  return loanId;
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
    const loan = await db.getFirstAsync<Loan>(
      'SELECT * FROM loans WHERE id = ?',
      loanId
    );
    if (!loan) return;

    const result = await db.runAsync(
      'INSERT INTO loan_payments (loan_id, amount, date, source, note) VALUES (?, ?, ?, ?, ?)',
      loanId,
      amount,
      date,
      source,
      note ?? null
    );
    const paymentId = result.lastInsertRowId;

    await db.runAsync(
      'UPDATE loans SET remaining_amount = MAX(0, remaining_amount - ?) WHERE id = ?',
      amount,
      loanId
    );

    // If I pay back a borrowed loan -> Expense.
    // If someone pays back a loan I lent them -> Income.
    const txnType = loan.type === 'borrowed' ? 'expense' : 'income';
    
    await db.runAsync(
      'INSERT INTO transactions (type, amount, category, description, date, source, linked_type, linked_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      txnType,
      amount,
      'Debt Repayment',
      loan.type === 'borrowed' ? `Paid back ${loan.person_name}` : `Received from ${loan.person_name}`,
      date,
      source,
      'loan_payment',
      paymentId
    );

    // Auto-complete if remaining is 0
    if (loan.remaining_amount - amount <= 0) {
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
  await db.withTransactionAsync(async () => {
    // Get all loan payments associated with this loan
    const payments = await db.getAllAsync<{id: number}>('SELECT id FROM loan_payments WHERE loan_id = ?', id);
    const paymentIds = payments.map(p => p.id);
    
    // Delete transactions related to loan payments
    if (paymentIds.length > 0) {
      const placeholders = paymentIds.map(() => '?').join(',');
      await db.runAsync(`DELETE FROM transactions WHERE linked_type = 'loan_payment' AND linked_id IN (${placeholders})`, ...paymentIds);
    }
    
    // Delete transaction related to the initial loan creation
    await db.runAsync("DELETE FROM transactions WHERE linked_type = 'loan' AND linked_id = ?", id);
    
    // Delete the loan (loan_payments will be deleted via ON DELETE CASCADE in sqlite)
    await db.runAsync('DELETE FROM loans WHERE id = ?', id);
  });
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
  await db.withTransactionAsync(async () => {
    const bill = await db.getFirstAsync<Bill>('SELECT * FROM bills WHERE id = ?', billId);
    if (!bill) return;

    const result = await db.runAsync(
      'INSERT OR REPLACE INTO bill_payments (bill_id, paid_date, month, source) VALUES (?, ?, ?, ?)',
      billId,
      paidDate,
      month,
      source
    );
    const paymentId = result.lastInsertRowId;

    await db.runAsync(
      'INSERT INTO transactions (type, amount, category, description, date, source, linked_type, linked_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      'expense',
      bill.amount,
      bill.category,
      `Bill Payment: ${bill.name}`,
      paidDate,
      source,
      'bill_payment',
      paymentId
    );
  });
}

export async function markBillUnpaid(
  db: SQLiteDatabase,
  billId: number,
  month: string
) {
  await db.withTransactionAsync(async () => {
    const payment = await db.getFirstAsync<{ id: number }>(
      'SELECT id FROM bill_payments WHERE bill_id = ? AND month = ?',
      billId,
      month
    );
    if (payment) {
      await db.runAsync('DELETE FROM transactions WHERE linked_type = ? AND linked_id = ?', 'bill_payment', payment.id);
      await db.runAsync('DELETE FROM bill_payments WHERE id = ?', payment.id);
    }
  });
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

export async function getBillById(db: SQLiteDatabase, id: number): Promise<Bill | null> {
  return db.getFirstAsync<Bill>('SELECT * FROM bills WHERE id = ?', id);
}

export async function updateBill(
  db: SQLiteDatabase,
  id: number,
  data: {
    name: string;
    amount: number;
    category: string;
    due_day: number;
  }
) {
  await db.runAsync(
    'UPDATE bills SET name = ?, amount = ?, category = ?, due_day = ? WHERE id = ?',
    data.name,
    data.amount,
    data.category,
    data.due_day,
    id
  );
}

export async function deleteBill(db: SQLiteDatabase, id: number) {
  await db.withTransactionAsync(async () => {
    // Get all bill payments associated with this bill
    const payments = await db.getAllAsync<{id: number}>('SELECT id FROM bill_payments WHERE bill_id = ?', id);
    const paymentIds = payments.map(p => p.id);
    
    // Delete transactions related to bill payments
    if (paymentIds.length > 0) {
      const placeholders = paymentIds.map(() => '?').join(',');
      await db.runAsync(`DELETE FROM transactions WHERE linked_type = 'bill_payment' AND linked_id IN (${placeholders})`, ...paymentIds);
    }
    
    // Delete the bill (bill_payments will be deleted via ON DELETE CASCADE in sqlite)
    await db.runAsync('DELETE FROM bills WHERE id = ?', id);
  });
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

// ════════════════════════════════════════════════
// DEPOSITS (Hand → Bank)
// ════════════════════════════════════════════════

export async function addDeposit(
  db: SQLiteDatabase,
  data: {
    amount: number;
    date: string;
    note?: string;
  }
) {
  const result = await db.runAsync(
    'INSERT INTO deposits (amount, date, note) VALUES (?, ?, ?)',
    data.amount,
    data.date,
    data.note ?? null
  );
  return result.lastInsertRowId;
}

export async function getDepositsByMonth(
  db: SQLiteDatabase,
  yearMonth: string
): Promise<Deposit[]> {
  return db.getAllAsync<Deposit>(
    `SELECT * FROM deposits 
     WHERE strftime('%Y-%m', date) = ? 
     ORDER BY date DESC, id DESC`,
    yearMonth
  );
}

export async function deleteDeposit(db: SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM deposits WHERE id = ?', id);
}

export async function getBankSummary(
  db: SQLiteDatabase
): Promise<{ bankBalance: number; handBalance: number }> {
  // Use grouped aggregations to minimize queries and keep things fast
  // Since we now auto-log loans and bills as transactions, we ONLY need transactions and withdrawals
  const [
    transactionsRaw,
    withdrawalsRaw,
    depositsRaw,
    salarySetting
  ] = await Promise.all([
    db.getAllAsync<{source: string, type: string, total: number}>(
      `SELECT source, type, COALESCE(SUM(amount),0) as total FROM transactions GROUP BY source, type`
    ),
    db.getFirstAsync<{total: number}>(
      `SELECT COALESCE(SUM(amount),0) as total FROM withdrawals`
    ),
    db.getFirstAsync<{total: number}>(
      `SELECT COALESCE(SUM(amount),0) as total FROM deposits`
    ),
    db.getFirstAsync<{value: string}>(
      `SELECT value FROM settings WHERE key = 'monthly_budget'`
    )
  ]);

  const getVal = (arr: any[], condition: (item: any) => boolean) => arr.find(condition)?.total ?? 0;

  const bankIncome = getVal(transactionsRaw, t => t.source === 'bank' && t.type === 'income');
  const handIncome = getVal(transactionsRaw, t => t.source === 'hand' && t.type === 'income');

  const bankExpense = getVal(transactionsRaw, t => t.source === 'bank' && t.type === 'expense');
  const handExpense = getVal(transactionsRaw, t => t.source === 'hand' && t.type === 'expense');

  const totalWithdrawn = withdrawalsRaw?.total ?? 0;
  const totalDeposited = depositsRaw?.total ?? 0;
  const bankBalance = bankIncome - bankExpense - totalWithdrawn + totalDeposited;
  const handBalance = handIncome + totalWithdrawn - handExpense - totalDeposited;

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
