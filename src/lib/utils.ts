import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Transaction } from "@/types/Transaction";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
};

export const filterTransactions = (transactions: Transaction[], searchQuery: string) => {
  if (!searchQuery) {
    return transactions;
  }

  const query = searchQuery.toLowerCase();

  return transactions.filter(
    (tr) =>
      tr.account.toLowerCase().includes(query) ||
      tr.category.toLowerCase().includes(query) ||
      tr.code.toLowerCase().includes(query)
  );
};

/**
 * Sort an array of objects by a specific field.
 * Handles both string and numeric values appropriately.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sortBy<T extends Record<string, any>>(
  array: T[],
  field: keyof T,
  direction: "asc" | "desc" = "asc"
): T[] {
  const isDescending = direction === "desc";

  return [...array].sort((a: T, b: T) => {
    const sortMultiplier = direction === "desc" ? -1 : 1;

    // Get the values to compare
    const aValue = a[field];
    const bValue = b[field];

    // Handle null or undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return -1 * sortMultiplier;
    if (bValue == null) return 1 * sortMultiplier;

    // Handle different types
    if (typeof aValue === "string" && typeof bValue === "string") {
      // Case-insensitive string comparison
      const comparison = aValue.localeCompare(bValue);
      return isDescending ? -comparison : comparison;
    }

    let comparison = 0;
    if (aValue < bValue) {
      comparison = -1;
    } else if (aValue > bValue) {
      comparison = 1;
    }

    // Numbers or other comparable types
    return isDescending ? -comparison : comparison;
  });
}
