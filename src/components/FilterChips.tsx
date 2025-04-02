import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useTransactionStore from "@/stores/transactions.store";
import { useMemo, useCallback } from "react";
import { Filter, FilterField, OperatorTranslations } from "@/types/Filters";
import { format } from "date-fns";
import { UNCATEGORIZED } from "@/types/Categories";

const fieldKey: Record<string, string> = {
  dayOfWeek: 'Day'
}

// Type for grouped filters
type FilterGroup = {
  field: FilterField;
  filters: Filter[];
};

/**
 * FilterChips component displays active filters as interactive chips/badges
 * with the ability to remove individual filters or clear all filters.
 */
export function FilterChips() {
  const { currentFilters, setCurrentFilters, removeFilter } =
    useTransactionStore();

  // Memoize filter groups to prevent unnecessary recalculations
  const filterGroups = useMemo(
    () => groupFilters(currentFilters),
    [currentFilters]
  );

  // Callback to clear all active filters
  const clearAllFilters = useCallback(() => {
    setCurrentFilters(undefined);
  }, [setCurrentFilters]);

  // Early return if no filters are active
  if (!currentFilters?.length) return null;

  return (
    <div
      className="flex gap-2 flex-nowrap overflow-x-auto w-full pb-1"
      role="region"
      aria-label="Active filters"
    >
      {filterGroups.map((group, i) => (
        <Badge
          key={`${group.field}-${i}`}
          variant="outline"
          onClick={() => removeFilter(group.filters)}
          title={formatDateFilter(group.filters)}
          className="px-2 rounded-full border-foreground text-foreground bg-background cursor-pointer flex items-center text-xs"
        >
          {isDateOrHourFilter(group.field)
            ? formatDateFilter(group.filters)
            : formatFilter(group.filters[0])}

          <Button
            size="icon"
            variant="ghost"
            className="h-5 w-5 rounded-full cursor-pointer ml-1"
            aria-label={`Remove ${group.field} filter`}
          >
            <X size={14} />
          </Button>
        </Badge>
      ))}

      {/* Clear all filters button, shown if multiple filters exist */}
      {filterGroups.length > 1 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={clearAllFilters}
              variant="outline"
              size="sm"
              className="px-3 py-1.5 h-auto rounded-full text-xs text-red-500 hover:text-red-700 hover:bg-red-50 flex items-center border-red-600"
              aria-label="Clear all filters"
            >
              <span className="font-semibold">Clear All Filters</span>
              <X size={14} className="ml-1.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Remove all filters</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

/**
 * Check if the filter field is a date or hour type
 */
const isDateOrHourFilter = (field: FilterField): boolean => {
  return ["date", "hour"].includes(field);
};

/**
 * Format a single filter for display
 */
const formatFilter = (filter: Filter): React.ReactNode => {
  const { field, operator, value } = filter;
  let fieldName = field.charAt(0).toUpperCase() + field.slice(1);
  if (fieldKey[field]) {
    fieldName = fieldKey[field]
  }
  const parsedVal = formatValue(field, value);
  const operatorText = OperatorTranslations[operator];
  const displayValue = typeof parsedVal === 'string' && parsedVal.length > 10
    ? `${parsedVal.slice(0, 10)}...`
    : parsedVal;

  return (
    <span className="chip-text">
      <span className="capitalize">{fieldName}</span> {operatorText}{" "}
      <b className="capitalize">"{displayValue}"</b>
    </span>
  );
};

/**
 * Format date range filters for display
 */
const formatDateFilter = (filters: Filter[]): string => {
  const isDate = filters.some((f) => f.field === "date");
  const startFilter = filters.find((f) => f.operator === ">=");
  const endFilter = filters.find((f) => f.operator === "<=");

  if (startFilter && endFilter) {
    const startDate = formatValue("date", startFilter.value);
    const endDate = formatValue("date", endFilter.value);
    return `${isDate ? "Date" : "Time"} between ${startDate} - ${endDate}`;
  }

  // Fallback if not a proper range
  return String(filters[0]?.value || "");
};

/**
 * Group filters by field, with special handling for date/time ranges
 */
const groupFilters = (filters: Filter[] | undefined): FilterGroup[] => {
  if (!filters || filters.length === 0) return [];

  const groups: Record<string, FilterGroup> = {};

  // Identify range filters (date/hour with >= and <= operators)
  const dateFields = ["date", "hour"];
  const rangeFilters = filters.filter(
    (f) =>
      dateFields.includes(f.field) &&
      filters.some((fl) => fl.field === f.field && fl.operator === ">=") &&
      filters.some((fl) => fl.field === f.field && fl.operator === "<=")
  );

  // Get remaining filters
  const otherFilters = filters.filter((f) => !rangeFilters.includes(f));

  // Group range filters by field
  rangeFilters.forEach((filter) => {
    if (!groups[filter.field]) {
      groups[filter.field] = { field: filter.field, filters: [] };
    }
    groups[filter.field].filters.push(filter);
  });

  // Add other filters individually
  otherFilters.forEach((filter, i) => {
    const key = `other-${i}`;
    groups[key] = { field: filter.field, filters: [filter] };
  });

  return Object.values(groups).reverse();
};

/**
 * Format values based on field type
 */
const formatValue = (field: FilterField, value: unknown): string => {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return field === "category" ? UNCATEGORIZED : "";
  }

  // Handle date fields
  if (field === "date" && typeof value === "number") {
    try {
      return format(new Date(value), "EEE, MMM dd yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return String(value);
    }
  }

  // Handle 'in' operator with array values
  if (Array.isArray(value)) {
    return value.map((v) => formatValue(field, v)).join(" or ");
  }

  // Handle empty category
  if (field === "category" && (value === "" || value === null)) {
    return UNCATEGORIZED;
  }

  // Standard string formatting
  return String(value);
};