import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useTransactionStore from "@/stores/transactions.store";
import { CompositeFilter, Filter, FilterOperator } from "@/types/Filters";
import { format } from "date-fns";

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
const formatValue = (field: string, value: string | number) => {
  // Handle date fields
  if (field === "date" && typeof value === "number") {
    return format(new Date(value), "EEE MMM dd yyyy");
  }

  // Handle categories with 'Uncategorized' default
  if (field === "category" && (value === "" || value === null)) {
    return "Uncategorized";
  }

  // Standard string formatting
  return String(value);
};

// Extract all filters from a composite filter recursively
const extractFilters = (filter: Filter | CompositeFilter): Filter[] => {
  if ("field" in filter) {
    return [filter];
  }

  return filter.filters.flatMap((f) => {
    if ("field" in f) {
      return [f];
    }
    return extractFilters(f);
  });
};

// Group filters by field for display
const getFilterGroups = (filters: Filter | CompositeFilter | undefined) => {
  if (!filters) return [];

  // Extract all simple filters
  const allFilters = extractFilters(filters);

  // Group by field
  const groups: Record<string, { field: string; filters: Filter[] }> = {};

  allFilters.forEach((filter) => {
    if (!groups[filter.field]) {
      groups[filter.field] = { field: filter.field, filters: [] };
    }
    groups[filter.field].filters.push(filter);
  });

  return Object.values(groups);
};

// Format filter group into readable text
const formatFilterGroup = (group: { field: string; filters: Filter[] }) => {
  const { field, filters } = group;

  // Special case for date ranges
  if (field === "date") {
    const startFilter = filters.find((f) => f.operator === ">=");
    const endFilter = filters.find((f) => f.operator === "<=");

    if (startFilter && endFilter) {
      const startDate = formatValue("date", startFilter.value);
      const endDate = formatValue("date", endFilter.value);
      return (
        <span className="chip-text">
          Date between{" "}
          <b>
            "{startDate} - {endDate}"
          </b>
        </span>
      );
    }
  }

  // Standard equality filter
  if (filters.length === 1) {
    const filter = filters[0];
    const operator = operatorTranslations[filter.operator];
    const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
    const value = formatValue(field, filter.value);

    return (
      <span className="chip-text">
        {fieldName} {operator} <b>"{value}"</b>
      </span>
    );
  }

  // Default fallback for complex filters
  return <span className="chip-text">{field}: Multiple conditions</span>;
};

export function FilterChips() {
  const { currentFilters, setCurrentFilters } = useTransactionStore();

  const filterGroups = getFilterGroups(currentFilters);

  if (filterGroups.length === 0) {
    return null;
  }

  const removeFilter = (fieldName: string) => {
    if (!currentFilters) return;

    // Handle simple filter
    if ("field" in currentFilters) {
      if (currentFilters.field === fieldName) {
        setCurrentFilters(undefined);
      }
      return;
    }

    // For composite filters
    if (currentFilters.type === "and") {
      // Create new filters array without the removed field
      const newFilters = currentFilters.filters.filter((filter) => {
        if ("field" in filter) {
          return filter.field !== fieldName;
        }

        // For nested composites, keep them (simplification)
        return true;
      });

      if (newFilters.length === 0) {
        setCurrentFilters(undefined);
      } else if (newFilters.length === 1 && "field" in newFilters[0]) {
        // If only one filter left, simplify to single filter
        setCurrentFilters(newFilters[0]);
      } else {
        // Otherwise update the composite filter
        setCurrentFilters({
          ...currentFilters,
          filters: newFilters,
        });
      }
    } else {
      // For OR filters, this is a simplification
      // A real implementation might need more complex logic
      setCurrentFilters(undefined);
    }
  };

  const clearAllFilters = () => {
    setCurrentFilters(undefined);
  };

  return (
    <div className="py-4 flex gap-2 flex-wrap mb-4">
      {filterGroups.map((group) => (
        <Badge
          variant="outline"
          className="px-2 pt--.5 pb-1 rounded-full bg-slate-800 text-white cursor-pointerflex items-center text-xs"
        >
          {formatFilterGroup(group)}
          <Tooltip key={group.field}>
            <TooltipTrigger asChild>
              <Button
                onClick={() => removeFilter(group.field)}
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

      <Tooltip>
        <TooltipTrigger asChild>
          {!!currentFilters &&
            Array.isArray(currentFilters) &&
            currentFilters.length > 1 && (
              <Button
                onClick={clearAllFilters}
                variant="outline"
                size="sm"
                className="px-3 py-1.5 h-auto rounded-full text-xs text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center"
              >
                <span className="font-semibold">Clear All Filters</span>
                <X size={14} className="ml-1.5" />
              </Button>
            )}
        </TooltipTrigger>
        <TooltipContent>
          <p>Remove all filters</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
