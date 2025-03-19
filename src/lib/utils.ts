import { Transaction } from "@/types/Transaction";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number) => {
  return `Ksh ${amount.toLocaleString()}`;
};

export const filterTransactions = (transactions: Transaction[], searchQuery: string) => {
  if (!searchQuery) {
    return transactions;
  }

  const query = searchQuery.toLowerCase();

  return transactions.filter(tr =>
    tr.account.toLowerCase().includes(query) ||
    tr.category.toLowerCase().includes(query) ||
    tr.description.toLowerCase().includes(query) ||
    tr.code.toLowerCase().includes(query)
  );
};
