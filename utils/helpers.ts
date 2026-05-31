// ──────────────────────────────────────────────
// Numra — Utility Helpers
// ──────────────────────────────────────────────

/**
 * Format a number as LKR currency.
 */
export function formatCurrency(amount: number): string {
  const formatted = Math.abs(amount)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return amount < 0 ? `-LKR ${formatted}` : `LKR ${formatted}`;
}

/**
 * Format a number as compact LKR (e.g. LKR 1.5K, LKR 2.3M).
 */
export function formatCurrencyCompact(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    return `LKR ${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `LKR ${(amount / 1_000).toFixed(1)}K`;
  }
  return formatCurrency(amount);
}

/**
 * Format an ISO date string for display.
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date as short (e.g. "May 26").
 */
export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-LK', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get today as YYYY-MM-DD.
 */
export function getTodayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Get current YYYY-MM string.
 */
export function getCurrentYearMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Get YYYY-MM for a given month offset from current.
 */
export function getYearMonth(offset: number = 0): string {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Get YYYY-MM-DD for a given day offset from today.
 */
export function getDateOffset(offset: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Get display name for a YYYY-MM-DD string (e.g. "Today", "Yesterday", "May 26, 2026").
 */
export function getDayDisplayName(dateString: string): string {
  const today = getTodayISO();
  if (dateString === today) return 'Today';
  
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;
  if (dateString === yesterday) return 'Yesterday';
  
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = `${tomorrowDate.getFullYear()}-${String(tomorrowDate.getMonth() + 1).padStart(2, '0')}-${String(tomorrowDate.getDate()).padStart(2, '0')}`;
  if (dateString === tomorrow) return 'Tomorrow';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-LK', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Get display name for a YYYY-MM string.
 */
export function getMonthDisplayName(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  const date = new Date(year, month - 1);
  return date.toLocaleDateString('en-LK', { month: 'long', year: 'numeric' });
}

/**
 * Get short month name.
 */
export function getShortMonthName(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  const date = new Date(year, month - 1);
  return date.toLocaleDateString('en-LK', { month: 'short' });
}

/**
 * Get the ordinal suffix for a day (1st, 2nd, 3rd, etc.).
 */
export function getOrdinalDay(day: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = day % 100;
  return day + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Calculate days remaining until a due date.
 */
export function daysUntilDue(dueDay: number): number {
  const today = new Date();
  const currentDay = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  if (dueDay >= currentDay) {
    return dueDay - currentDay;
  }
  return daysInMonth - currentDay + dueDay;
}

/**
 * Check if a bill is overdue for the current month.
 */
export function isBillOverdue(dueDay: number, isPaid: boolean): boolean {
  if (isPaid) return false;
  const today = new Date();
  return today.getDate() > dueDay;
}

// ── Category Mappings ─────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
  // Expense
  Food: 'restaurant',
  Transport: 'directions-car',
  Rent: 'home',
  Utilities: 'bolt',
  Shopping: 'shopping-bag',
  Health: 'local-hospital',
  Entertainment: 'movie',
  Education: 'school',
  Groceries: 'shopping-cart',
  Insurance: 'security',
  Subscriptions: 'subscriptions',
  Travel: 'flight',
  Gifts: 'card-giftcard',
  // Income
  Salary: 'work',
  Freelance: 'laptop',
  Business: 'business',
  Investment: 'trending-up',
  Rental: 'apartment',
  Gift: 'card-giftcard',
  Refund: 'replay',
  // Bill
  Electricity: 'bolt',
  Water: 'water-drop',
  Internet: 'wifi',
  Phone: 'phone-android',
  Subscription: 'subscriptions',
  'Loan Payment': 'account-balance',
  'Credit Card': 'credit-card',
  // Default
  Other: 'more-horiz',
};

const CATEGORY_COLORS: Record<string, string> = {
  // Expense
  Food: '#F97316',
  Transport: '#3B82F6',
  Rent: '#8B5CF6',
  Utilities: '#EAB308',
  Shopping: '#EC4899',
  Health: '#EF4444',
  Entertainment: '#A855F7',
  Education: '#06B6D4',
  Groceries: '#22C55E',
  Insurance: '#64748B',
  Subscriptions: '#F43F5E',
  Travel: '#0EA5E9',
  Gifts: '#D946EF',
  // Income
  Salary: '#10B981',
  Freelance: '#14B8A6',
  Business: '#059669',
  Investment: '#22D3EE',
  Rental: '#8B5CF6',
  Gift: '#D946EF',
  Refund: '#6366F1',
  // Bill
  Electricity: '#EAB308',
  Water: '#38BDF8',
  Internet: '#818CF8',
  Phone: '#34D399',
  Subscription: '#F43F5E',
  'Loan Payment': '#F59E0B',
  'Credit Card': '#EF4444',
  // Default
  Other: '#94A3B8',
};

export function getCategoryIcon(category: string): string {
  return CATEGORY_ICONS[category] ?? 'more-horiz';
}

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? '#94A3B8';
}
