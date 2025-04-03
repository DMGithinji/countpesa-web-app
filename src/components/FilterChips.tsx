import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFilterChips } from "@/hooks/useFilterChips";
import {
  formatFilterTooltip,
  formatDateFilter,
  isDateOrHourFilter,
  fieldDisplayNames,
  formatValue
} from "@/lib/filterUtils";
import { Filter, OperatorTranslations } from "@/types/Filters";

/**
 * FilterChips component displays active filters as interactive chips/badges
 * with the ability to remove individual filters or clear all filters.
 */
export function FilterChips({
  className
}: {
  className?: string;
}) {
  const {
    currentFilters,
    processedFilters,
    clearAllFilters,
    removeFilter
  } = useFilterChips();

  // Early return if no filters are active
  if (!currentFilters?.length) return null;

  return (
    <div
      className={`flex gap-2 flex-wrap overflow-x-auto w-full pb-1 ${className}`}
      role="region"
      aria-label="Active filters"
    >
      {processedFilters.map((filterGroup, i) => (
        <Badge
          key={i}
          variant="outline"
          onClick={() => removeFilter(filterGroup)}
          title={filterGroup.length > 1 ? formatDateFilter(filterGroup) : formatFilterTooltip(filterGroup[0])}
          className="px-2 py-1 rounded-full border-foreground/60 text-foreground bg-background cursor-pointer flex items-center text-xs font-medium"
        >
          {filterGroup.length > 1 && isDateOrHourFilter(filterGroup[0].field)
            ? formatDateFilter(filterGroup)
            : formatFilter(filterGroup[0])}

          <Button
            size="icon"
            variant="ghost"
            className="h-5 w-5 rounded-full cursor-pointer ml-1"
            aria-label={`Remove filter`}
            title="Remove filter"
          >
            <X size={14} />
          </Button>
        </Badge>
      ))}

      {/* Clear all filters button, shown if multiple filters exist */}
      {processedFilters.length > 1 && (
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
 * Format a single filter for display in the chip using natural language format
 */
const formatFilter = (filter: Filter): React.ReactNode => {
  const { field, operator, value } = filter;

  // Get the display-friendly field name
  const fieldName = fieldDisplayNames[field] || field.charAt(0).toUpperCase() + field.slice(1);

  // Format the value in a user-friendly way
  const parsedVal = formatValue(field, value);

  // For the chip display, use natural language format based on operator
  const formatMap: Record<string, (field: string, value: string) => React.ReactNode> = {
    "==": (f, v) => (
      <span className="chip-text">
        <span className="mr-1">{f} is</span>
        <b>{v}</b>
      </span>
    ),
    "!=": (f, v) => (
      <span className="chip-text">
        <span className="mr-1">{f} is not</span>
        <b>{v}</b>
      </span>
    ),
    "contains": (f, v) => (
      <span className="chip-text">
        <span className="mr-1">{f} contains</span>
        <b>{v}</b>
      </span>
    ),
    ">": (f, v) => (
      <span className="chip-text">
        <span className="mr-1">{f} greater than</span>
        <b>{v}</b>
      </span>
    ),
    ">=": (f, v) => (
      <span className="chip-text">
        <span className="mr-1">{f} at least</span>
        <b>{v}</b>
      </span>
    ),
    "<": (f, v) => (
      <span className="chip-text">
        <span className="mr-1">{f} less than</span>
        <b>{v}</b>
      </span>
    ),
    "<=": (f, v) => (
      <span className="chip-text">
        <span className="mr-1">{f} at most</span>
        <b>{v}</b>
      </span>
    )
  };

  // Use formatter from map or fallback to generic format
  const formatter = formatMap[operator];
  if (formatter) {
    return formatter(fieldName, parsedVal);
  }

  // Fallback for other operators
  const operatorText = OperatorTranslations[operator];
  return (
    <span className="chip-text">
      <span className="mr-1">{fieldName} {operatorText}</span>
      <b>{parsedVal}</b>
    </span>
  );
};
