import { useMemo, useCallback } from "react";
import useTransactionStore from "@/stores/transactions.store";
import { findRangePairs } from "@/lib/filterChipUtils";

export const useFilterChips = () => {
  const { currentFilters, setCurrentFilters, removeFilter } = useTransactionStore();

  // Process date range filters to display them together
  const processedFilters = useMemo(() => {
    if (!currentFilters || currentFilters.length === 0) return [];

    // Find date range pairs
    const dateFilters = currentFilters.filter((f) => f.field === "date");
    const hourFilters = currentFilters.filter((f) => f.field === "hour");

    // Check for date ranges (>= and <= pairs)
    const dateRangePairs = findRangePairs(dateFilters);
    const hourRangePairs = findRangePairs(hourFilters);

    // Get all filters that aren't part of a range pair
    const rangePairFilters = [
      ...dateRangePairs.flatMap((pair) => pair),
      ...hourRangePairs.flatMap((pair) => pair),
    ];

    const individualFilters = currentFilters.filter((f) => !rangePairFilters.includes(f));

    // Combine range pairs and individual filters
    return [...dateRangePairs, ...hourRangePairs, ...individualFilters.map((filter) => [filter])];
  }, [currentFilters]);

  // Callback to clear all active filters
  const clearAllFilters = useCallback(() => {
    setCurrentFilters(undefined);
  }, [setCurrentFilters]);

  return {
    currentFilters,
    processedFilters,
    clearAllFilters,
    removeFilter,
  };
};
