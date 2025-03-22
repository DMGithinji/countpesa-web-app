import {
  calculateTransactionTotals,
  TransactionTotals,
} from "@/lib/getTotal";
import {
  groupTransactionsByField,
  GroupByField,
  FieldGroupSummary,
} from "@/lib/groupByField";
import { formatDate } from "date-fns";
import { Transaction } from "@/types/Transaction";


export interface CalculatedData {
  transactionTotals: TransactionTotals;

  balance: number;
  balanceTrend: {
    date: string;
    balance: number;
  }[];

  topAccountsSentToByAmt: FieldGroupSummary[];
  topAccountsReceivedFromByAmt: FieldGroupSummary[];
  topAccountsSentToByCount: FieldGroupSummary[];
  topAccountsReceivedFromByCount: FieldGroupSummary[];

  topCategoriesMoneyOutByAmt: FieldGroupSummary[];
  topCategoriesMoneyInByAmt: FieldGroupSummary[];
  topCategoriesMoneyOutByCount: FieldGroupSummary[];
  topCategoriesMoneyInByCount: FieldGroupSummary[];
}

export function getCalculatedData(transactions: Transaction[]) {
  // Calculate all dashboard metrics only when transactions change
  const sortedTxs = [...transactions].sort((a, b) => a.date - b.date);

  // Calculate summaries
  const transactionTotals = calculateTransactionTotals(transactions);
  const { moneyInTrs, moneyOutTrs } = transactionTotals;

  // Top accounts
  const topAccountsSentToByAmt = groupTransactionsByField(
    moneyOutTrs,
    GroupByField.Account,
    "amount"
  );
  const topAccountsReceivedFromByAmt = groupTransactionsByField(
    moneyInTrs,
    GroupByField.Account,
    "amount"
  );
  const topAccountsSentToByCount = groupTransactionsByField(
    moneyOutTrs,
    GroupByField.Account,
    "count"
  );
  const topAccountsReceivedFromByCount = groupTransactionsByField(
    moneyInTrs,
    GroupByField.Account,
    "count"
  );

  // Top categories
  const topCategoriesMoneyOutByAmt = groupTransactionsByField(
    moneyOutTrs,
    GroupByField.Category,
    "amount"
  );
  const topCategoriesMoneyInByAmt = groupTransactionsByField(
    moneyInTrs,
    GroupByField.Category,
    "amount"
  );
  const topCategoriesMoneyOutByCount = groupTransactionsByField(
    moneyOutTrs,
    GroupByField.Category,
    "count"
  );
  const topCategoriesMoneyInByCount = groupTransactionsByField(
    moneyInTrs,
    GroupByField.Category,
    "count"
  );

  // Calculate current balance
  const balance =
    sortedTxs.length > 0 ? sortedTxs[sortedTxs.length - 1].balance : 0;
  const balanceTrend = sortedTxs.map((tx) => ({
    date: formatDate(new Date(tx.date), "dd-MM-yyyy HH:mm"),
    balance: tx.balance,
  }));

  return {
    transactionTotals,

    topAccountsSentToByAmt,
    topAccountsReceivedFromByAmt,
    topAccountsSentToByCount,
    topAccountsReceivedFromByCount,

    topCategoriesMoneyOutByAmt,
    topCategoriesMoneyInByAmt,
    topCategoriesMoneyOutByCount,
    topCategoriesMoneyInByCount,

    balance,
    balanceTrend,
  };
}
