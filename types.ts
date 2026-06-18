// ──────────────────────────────────────────────
// Numra — Core Type Definitions
// ──────────────────────────────────────────────

export type TransactionType = 'income' | 'expense';
export type LoanType = 'lent' | 'borrowed';

export type TransactionSource = 'bank' | 'hand';

// ── Category Definitions ──────────────────────

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Rent',
  'Utilities',
  'Shopping',
  'Health',
  'Entertainment',
  'Education',
  'Groceries',
  'Insurance',
  'Subscriptions',
  'Travel',
  'Gifts',
  'Bills',
  'Debt',
  'Other',
] as const;

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investment',
  'Rental',
  'Gift',
  'Refund',
  'Debt',
  'Other',
] as const;

export const BILL_CATEGORIES = [
  'Electricity',
  'Water',
  'Internet',
  'Phone',
  'Rent',
  'Insurance',
  'Subscription',
  'Loan Payment',
  'Credit Card',
  'Other',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
export type BillCategory = (typeof BILL_CATEGORIES)[number];

// ── Database Row Types ────────────────────────

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  category: string;
  description: string | null;
  date: string; // ISO date string YYYY-MM-DD
  source: TransactionSource;
  created_at: string;
}

export interface Loan {
  id: number;
  type: LoanType;
  person_name: string;
  total_amount: number;
  remaining_amount: number;
  date: string;
  due_date: string | null;
  notes: string | null;
  is_completed: number; // 0 or 1
  source: TransactionSource;
  created_at: string;
}

export interface LoanPayment {
  id: number;
  loan_id: number;
  amount: number;
  date: string;
  note: string | null;
  source: TransactionSource;
}

export interface Bill {
  id: number;
  name: string;
  amount: number;
  category: string;
  due_day: number; // 1-31
  is_recurring: number; // 0 or 1
  created_at: string;
}

export interface BillPayment {
  id: number;
  bill_id: number;
  paid_date: string;
  month: string; // YYYY-MM
  source: TransactionSource;
}

export interface Withdrawal {
  id: number;
  amount: number;
  date: string;
  note: string | null;
  created_at: string;
}

export interface Deposit {
  id: number;
  amount: number;
  date: string;
  note: string | null;
  created_at: string;
}

// ── Computed/View Types ───────────────────────

export interface MonthlyTotals {
  income: number;
  expenses: number;
  balance: number;
}

export interface BankSummary {
  bankBalance: number;      // income - bankSpent - totalWithdrawn
  handBalance: number;      // totalWithdrawn - handSpent
}

export interface BillWithStatus extends Bill {
  is_paid: boolean;
}

export interface LoanWithProgress extends Loan {
  paid_amount: number;
  progress: number; // 0 to 1
}
