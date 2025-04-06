import { Transaction } from "@/types/Transaction";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0
  }).format(amount);
};

export const filterTransactions = (transactions: Transaction[], searchQuery: string) => {
  if (!searchQuery) {
    return transactions;
  }

  const query = searchQuery.toLowerCase();

  return transactions.filter(tr =>
    tr.account.toLowerCase().includes(query) ||
    tr.category.toLowerCase().includes(query) ||
    tr.code.toLowerCase().includes(query)
  );
};

/**
 * Sort an array of objects by a specific field.
 * Handles both string and numeric values appropriately.
 */
export function sortBy<T extends Record<string, any>>(
  array: T[],
  field: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  const isDescending = direction === 'desc';

  return [...array].sort((a: T, b: T) => {
    // Get the values to compare
    const aValue = a[field];
    const bValue = b[field];

    // Handle null or undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return isDescending ? 1 : -1;
    if (bValue == null) return isDescending ? -1 : 1;

    // Handle different types
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      // Case-insensitive string comparison
      const comparison = aValue.localeCompare(bValue);
      return isDescending ? -comparison : comparison;
    }

    // Numbers or other comparable types
    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return isDescending ? -comparison : comparison;
  });
}