import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useTransactionStore from "@/stores/transactions.store";
import { Filter, FilterField, FilterOperator } from "@/types/Filters";
import { format } from "date-fns";
import { UNCATEGORIZED } from "@/types/Categories";
import { useMemo } from "react";

// Dictionary to translate operators to readable text
const operatorTranslations: Record<FilterOperator, string> = {
  "==": "is",
  "!=": "is not",
  "<": "less than",
  "<=": "at most",
  ">": "greater than",
  ">=": "at least",
  contains: "contains",
  "contains-any": "contains any of",
  in: "in",
  "not-in": "not in",
};

// Format values based on field type
const formatValue = (field: FilterField, value: string | number): string => {
  // Handle date fields
  if (field === "date" && typeof value === "number") {
    return format(new Date(value), "EEE, MMM dd yyyy");
  }

  // Handle categories with 'Uncategorized' default
  if (field === "category" && (value === "" || value === null)) {
    return UNCATEGORIZED;
  }

  // Handle 'in' operator with array values
  if (Array.isArray(value)) {
    return value.map((v) => formatValue(field, v)).join(" or ");
  }

  // Standard string formatting
  return String(value);
};

const formatDateFilter = (filters: Filter[]) => {
  const startFilter = filters.find((f) => f.operator === ">=");
  const endFilter = filters.find((f) => f.operator === "<=");

  if (startFilter && endFilter) {
    const startDate = formatValue("date", startFilter.value);
    const endDate = formatValue("date", endFilter.value);
    return `Date between ${startDate} - ${endDate}`;
  }

  return null;
};

const getFilterGroups = (filters: Filter[] | undefined) => {
  if (!filters || filters.length === 0) return [];

  const groups: Record<string, { field: FilterField; filters: Filter[] }> = {};

  const rangeFilters = filters.filter((f) => ['date'].includes(f.field) && filters.find(fl => fl.field === f.field && fl.operator === '>=') && filters.find(fl => fl.field === f.field && fl.operator === '<='));
  const otherFilters = filters.filter(f => !rangeFilters.includes(f));

  rangeFilters.forEach((filter) => {
    if (!groups[filter.field]) {
      groups[filter.field] = { field: filter.field, filters: [] };
    }
    groups[filter.field].filters.push(filter);
  });
  otherFilters.forEach((filter, i) => {
    groups[i] = { field: filter.field, filters: [filter] };
  });

  return Object.values(groups).reverse();
};

const formatFilter = (filter: Filter) => {
  const { field, operator, value } = filter;
  const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
  const parsedVal = formatValue(field, value);
  const operatorText = operatorTranslations[operator];

  return (
    <span className="chip-text">
      <span className="capitalize">{fieldName}</span> {operatorText}{" "}
      <b className="capitalize">
        "{parsedVal.length > 10 ? parsedVal.slice(0, 10) + "..." : parsedVal}"
      </b>
    </span>
  );
};

export function FilterChips() {
  const { currentFilters, setCurrentFilters, removeFilter } = useTransactionStore();
  const filterGroups = useMemo(() => getFilterGroups(currentFilters), [currentFilters]);

  const clearAllFilters = () => {
    setCurrentFilters(undefined);
  };

  if (!currentFilters?.length) return null;

  return (
    <div className="flex gap-2 flex-nowrap overflow-x-auto w-full">
      {filterGroups.map((group, i) => (
        <Badge
          key={group.field + i}
          variant="outline"
          className="px-2 pt--.5 pb-1 rounded-full border-primary text-primary bg-background cursor-pointer flex items-center text-xs"
        >
          {group.field === 'date' ? formatDateFilter(group.filters) : formatFilter(group.filters[0])}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => removeFilter(group.filters)}
                size="icon"
                variant="ghost"
                className="h-5 w-5 rounded-full cursor-pointer"
              >
                <X size={14} />
                <span className="sr-only">Remove filter</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Remove filter</p>
            </TooltipContent>
          </Tooltip>
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
              className="px-3 py-1.5 h-auto rounded-full text-xs text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center"
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
