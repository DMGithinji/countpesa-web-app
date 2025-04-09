import { useState, useMemo, useCallback, useEffect } from "react";
import { format } from "date-fns";
import { MoneyMode, Transaction } from "@/types/Transaction";

export interface HeatmapValue {
  date: string;
  amount: number;
  transactions: Transaction[];
}

export interface SelectedTransactions {
  title: string;
  transactions: Transaction[];
}

export const useTransactionHeatmap = (transactions: Transaction[]) => {
  const [mode, setMode] = useState<MoneyMode>(MoneyMode.MoneyOut);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedTransactions, setSelectedTransactions] = useState<SelectedTransactions>({
    title: "",
    transactions: [],
  });

  // Extract all available years from transactions and set defaults
  useEffect(() => {
    const years = Array.from(new Set(transactions.map((tx) => new Date(tx.date).getFullYear())));
    const yearsAvailable = years.sort((a, b) => b - a); // Sort descending (most recent first)

    if (yearsAvailable.length > 0) {
      setAvailableYears(yearsAvailable);
      setSelectedYear(yearsAvailable[0]);
    }
  }, [transactions]);

  // Group transactions by year and money mode once
  const groupedData = useMemo(() => {
    // Pre-group all transactions by year, then by money mode, then by date
    const moneyInByYear = new Map<number, Map<string, HeatmapValue>>();
    const moneyOutByYear = new Map<number, Map<string, HeatmapValue>>();

    transactions.forEach((tx) => {
      const year = new Date(tx.date).getFullYear();
      const dateStr = format(new Date(tx.date), "yyyy-MM-dd");
      const isMoneyIn = tx.amount > 0;

      // Initialize maps if needed
      if (!moneyInByYear.has(year)) {
        moneyInByYear.set(year, new Map<string, HeatmapValue>());
      }
      if (!moneyOutByYear.has(year)) {
        moneyOutByYear.set(year, new Map<string, HeatmapValue>());
      }

      // Get the appropriate map
      const targetMap = isMoneyIn ? moneyInByYear.get(year)! : moneyOutByYear.get(year)!;

      // Initialize or update the entry
      if (!targetMap.has(dateStr)) {
        targetMap.set(dateStr, {
          date: dateStr,
          amount: 0,
          transactions: [],
        });
      }

      const entry = targetMap.get(dateStr)!;
      entry.amount += Math.abs(tx.amount);
      entry.transactions.push(tx);
    });

    return { moneyInByYear, moneyOutByYear };
  }, [transactions]);

  // Auto-select appropriate mode based on data availability
  useEffect(() => {
    if (availableYears.length === 0) return;

    const moneyInValues = groupedData.moneyInByYear.get(selectedYear);
    const moneyOutValues = groupedData.moneyOutByYear.get(selectedYear);

    const hasMoneyIn = moneyInValues && moneyInValues.size > 0;
    const hasMoneyOut = moneyOutValues && moneyOutValues.size > 0;

    // Auto-select appropriate mode based on data availability
    if (!hasMoneyOut && hasMoneyIn) {
      setMode(MoneyMode.MoneyIn);
    } else if (hasMoneyOut && !hasMoneyIn) {
      setMode(MoneyMode.MoneyOut);
    } else if (!hasMoneyOut && !hasMoneyIn) {
      // No data for either mode, keep current mode
    } else {
      // Both have data, prefer MoneyOut if that was the default
      setMode(MoneyMode.MoneyOut);
    }
  }, [selectedYear, availableYears, groupedData]);

  // Get values for the current selection
  const values = useMemo(() => {
    const map =
      mode === MoneyMode.MoneyIn
        ? groupedData.moneyInByYear.get(selectedYear)
        : groupedData.moneyOutByYear.get(selectedYear);

    return map ? Array.from(map.values()) : [];
  }, [groupedData, selectedYear, mode]);

  // Calculate min and max amounts for color scaling
  const { minAmount, maxAmount } = useMemo(() => {
    if (values.length === 0) {
      return { minAmount: 0, maxAmount: 1 };
    }
    const amounts = values.map((v) => v.amount);
    return {
      minAmount: Math.min(...amounts, 0),
      maxAmount: Math.max(...amounts, 1),
    };
  }, [values]);

  // Generate color class based on amount and mode
  const getColorClass = useCallback(
    (amount: number) => {
      if (amount === 0) return "color-empty";
      const intensity = (amount - minAmount) / (maxAmount - minAmount || 1);
      const scale = Math.ceil(intensity * 4);
      return mode === MoneyMode.MoneyOut ? `color-red-${scale}` : `color-green-${scale}`;
    },
    [minAmount, maxAmount, mode]
  );

  // Handle cell click
  const handleCellClick = useCallback((activePayload: HeatmapValue) => {
    if (!activePayload || !activePayload.date) return;

    setSelectedTransactions({
      title: format(new Date(activePayload.date), "EEE, do MMM yyyy"),
      transactions: activePayload.transactions,
    });
  }, []);

  return {
    mode,
    setMode,
    selectedYear,
    setSelectedYear,
    availableYears,
    values,
    selectedTransactions,
    getColorClass,
    handleCellClick,
  };
};
