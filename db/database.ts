// ──────────────────────────────────────────────
// Numra — Database Migration
// ──────────────────────────────────────────────

import type { SQLiteDatabase } from 'expo-sqlite';

const DATABASE_VERSION = 5;

/**
 * Initialize and migrate the database schema.
 * Uses PRAGMA user_version for version tracking.
 * Pass this to <SQLiteProvider onInit={migrateDbIfNeeded}>
 */
export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const result = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  let currentVersion = result?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        source TEXT NOT NULL DEFAULT 'bank' CHECK(source IN ('bank', 'hand')),
        linked_type TEXT,
        linked_id INTEGER,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS loans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK(type IN ('lent', 'borrowed')),
        person_name TEXT NOT NULL,
        total_amount REAL NOT NULL,
        remaining_amount REAL NOT NULL,
        date TEXT NOT NULL,
        due_date TEXT,
        notes TEXT,
        is_completed INTEGER DEFAULT 0,
        source TEXT NOT NULL DEFAULT 'bank' CHECK(source IN ('bank', 'hand')),
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS loan_payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        loan_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        note TEXT,
        source TEXT NOT NULL DEFAULT 'bank' CHECK(source IN ('bank', 'hand')),
        FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS bills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        due_day INTEGER NOT NULL,
        is_recurring INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS bill_payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bill_id INTEGER NOT NULL,
        paid_date TEXT NOT NULL,
        month TEXT NOT NULL,
        source TEXT NOT NULL DEFAULT 'bank' CHECK(source IN ('bank', 'hand')),
        FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS withdrawals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        note TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS deposits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        note TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
      CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
      CREATE INDEX IF NOT EXISTS idx_transactions_source ON transactions(source);
      CREATE INDEX IF NOT EXISTS idx_loans_completed ON loans(is_completed);
      CREATE INDEX IF NOT EXISTS idx_bill_payments_month ON bill_payments(month);
      CREATE INDEX IF NOT EXISTS idx_withdrawals_date ON withdrawals(date);
      CREATE INDEX IF NOT EXISTS idx_deposits_date ON deposits(date);
    `);

    // Insert default settings
    await db.runAsync(
      'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
      'currency',
      'LKR'
    );
    await db.runAsync(
      'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
      'monthly_budget',
      '0'
    );
    await db.runAsync(
      'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
      'monthly_income',
      '0'
    );

    currentVersion = 3;
  }

  // Migration: v1 → v2 (existing users)
  if (currentVersion === 1) {
    await db.execAsync(`
      ALTER TABLE transactions ADD COLUMN source TEXT NOT NULL DEFAULT 'bank' CHECK(source IN ('bank', 'hand'));

      CREATE TABLE IF NOT EXISTS withdrawals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        note TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_source ON transactions(source);
      CREATE INDEX IF NOT EXISTS idx_withdrawals_date ON withdrawals(date);
    `);

    await db.runAsync(
      'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
      'monthly_income',
      '0'
    );

    currentVersion = 2;
  }

  // Migration: v2 → v3
  if (currentVersion === 2) {
    await db.execAsync(`
      ALTER TABLE loans ADD COLUMN source TEXT NOT NULL DEFAULT 'bank' CHECK(source IN ('bank', 'hand'));
      ALTER TABLE loan_payments ADD COLUMN source TEXT NOT NULL DEFAULT 'bank' CHECK(source IN ('bank', 'hand'));
      ALTER TABLE bill_payments ADD COLUMN source TEXT NOT NULL DEFAULT 'bank' CHECK(source IN ('bank', 'hand'));
    `);
    currentVersion = 3;
  }

  // Migration: v3 → v4
  if (currentVersion === 3) {
    await db.execAsync(`
      ALTER TABLE transactions ADD COLUMN linked_type TEXT;
      ALTER TABLE transactions ADD COLUMN linked_id INTEGER;
    `);
    currentVersion = 4;
  }

  // Migration: v4 → v5
  if (currentVersion === 4) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS deposits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        note TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_deposits_date ON deposits(date);
    `);
    currentVersion = 5;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
