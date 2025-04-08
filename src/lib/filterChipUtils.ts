import { endOfDay, format, startOfDay } from "date-fns";
import { UNCATEGORIZED } from "@/types/Categories";
import { Filter, FilterField, FilterOperator, OperatorTranslations } from "@/types/Filters";
import { MoneyMode, TransactionTypes } from "@/types/Transaction";

// Group field options by category for better organization
export const fieldGroups = [
  {
    label: "Basic",
    fields: [
      { value: "category", label: "Category" },
      { value: "subcategory", label: "Subcategory" },
      { value: "account", label: "Sender/Receiver" },
      { value: "amount", label: "Amount" },
      { value: "mode", label: "Direction (In/Out)" },
      { value: "transactionType", label: "Transaction Type" },
    ],
  },
  {
    label: "Time",
    fields: [
      { value: "dayOfWeek", label: "Day of Week" },
      { value: "hour", label: "Time of Day" },
    ],
  },
  {
    label: "Other",
    fields: [{ value: "code", label: "Transaction Code" }],
  },
];

// Flatten the field groups for easier access
export const fieldOptions = fieldGroups.flatMap((group) =>
  group.fields.map((field) => ({
    value: field.value as FilterField,
    label: field.label,
    group: group.label,
  }))
);

// Define operator options based on field type
export const getOperatorOptions = (field: string) => {
  // Default operators for string fields
  const stringOperators = [
    { value: "==" as FilterOperator, label: "is" },
    { value: "!=" as FilterOperator, label: "is not" },
    { value: "contains" as FilterOperator, label: "contains" },
  ];

  // Operators for numeric fields
  const numericOperators = [
    { value: "==" as FilterOperator, label: "equals" },
    { value: "!=" as FilterOperator, label: "not equals" },
    { value: ">" as FilterOperator, label: "greater than" },
    { value: ">=" as FilterOperator, label: "greater than or equal" },
    { value: "<" as FilterOperator, label: "less than" },
    { value: "<=" as FilterOperator, label: "less than or equal" },
  ];

  switch (field) {
    case "amount":
      return numericOperators;
    case "hour":
      return [
        { value: "==" as FilterOperator, label: "at" },
        { value: ">" as FilterOperator, label: "after" },
        { value: "<" as FilterOperator, label: "before" },
      ];
    case "mode":
    case "dayOfWeek":
      return [
        { value: "==" as FilterOperator, label: "is" },
        { value: "!=" as FilterOperator, label: "is not" },
      ];
    default:
      return stringOperators;
  }
};

// Value options for specific fields
export const getDayOfWeekOptions = () => [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const getModeOptions = () => [
  { value: MoneyMode.MoneyIn, label: "Money In" },
  { value: MoneyMode.MoneyOut, label: "Money Out" },
];

export const getTransactionTypeOptions = () => Object.values(TransactionTypes).map((type) => type);

export const getHourOptions = () => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, "0");
    hours.push(`${hour}:00`);
  }
  return hours;
};

// Helper function to get formatted value for display
export const getValueDisplayLabel = (
  field: string,
  value: string | number,
  date?: Date | undefined
) => {
  if (field === "date" && date) {
    return format(date, "PP");
  }

  if (field === "mode") {
    const modeOption = getModeOptions().find((option) => option.value === value);
    return modeOption?.label || value;
  }

  return value;
};

// Helper function to process date values for filtering
export const getDateFilterValue = (date: Date, operator: string): number => {
  return operator === "<" || operator === "<="
    ? endOfDay(date).getTime()
    : startOfDay(date).getTime();
};

// Field name display mapping for better readability
export const fieldDisplayNames: Record<string, string> = {
  dayOfWeek: "Day",
  account: "Sender/Receiver",
  transactionType: "Type",
  mode: "Direction",
  date: "Date",
  hour: "Time",
  category: "Category",
  subcategory: "Subcategory",
  amount: "Amount",
  code: "Code",
};

/**
 * Find date range pairs (>= and <= for the same field)
 */
export const findRangePairs = (filters: Filter[]): Filter[][] => {
  const result: Filter[][] = [];

  // Look for >= and <= pairs
  const startFilters = filters.filter((f) => f.operator === ">=");

  startFilters.forEach((startFilter) => {
    const endFilter = filters.find((f) => f.operator === "<=" && f.field === startFilter.field);
    if (endFilter) {
      result.push([startFilter, endFilter]);
    }
  });

  // Add any remaining filters as individual items
  const pairedFilters = result.flatMap((pair) => pair);
  const remainingFilters = filters.filter((f) => !pairedFilters.includes(f));

  remainingFilters.forEach((filter) => {
    result.push([filter]);
  });

  return result;
};

/**
 * Check if the filter field is a date or hour type
 */
export const isDateOrHourFilter = (field: FilterField): boolean => {
  return ["date", "hour"].includes(field);
};

/**
 * Format values based on field type
 */
export const formatValue = (field: FilterField, value: unknown): string => {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return field === "category" ? UNCATEGORIZED : "";
  }

  // Handle date fields
  if (field === "date" && typeof value === "number") {
    try {
      return format(new Date(value), "EEE, MMM d, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return String(value);
    }
  }

  // Handle hour field
  if (field === "hour" && typeof value === "string") {
    return value; // Already formatted as HH:MM
  }

  // Handle money mode field
  if (field === "mode") {
    if (value === MoneyMode.MoneyIn) return "Money In";
    if (value === MoneyMode.MoneyOut) return "Money Out";
  }

  // Handle amount field
  if (field === "amount" && typeof value === "number") {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0,
    }).format(value);
  }

  // Handle 'in' operator with array values
  if (Array.isArray(value)) {
    if (value.length === 0) return "nothing";
    if (value.length === 1) return formatValue(field, value[0]);
    if (value.length === 2)
      return `${formatValue(field, value[0])} or ${formatValue(field, value[1])}`;
    return `${value.length} values`;
  }

  // Handle empty category
  if (field === "category" && (value === "" || value === null)) {
    return UNCATEGORIZED;
  }

  // Handle day of week capitalization
  if (field === "dayOfWeek" && typeof value === "string") {
    // Ensure proper capitalization for days
    const day = value.toLowerCase();
    return day.charAt(0).toUpperCase() + day.slice(1);
  }

  // Truncate very long strings
  if (typeof value === "string" && value.length > 30) {
    return `${value.substring(0, 27)}...`;
  }

  // Standard string formatting
  return String(value);
};

/**
 * Format a single filter for tooltip display with full details
 */
export const formatFilterTooltip = (filter: Filter): string => {
  const { field, operator, value } = filter;
  const fieldName = fieldDisplayNames[field] || field.charAt(0).toUpperCase() + field.slice(1);
  const parsedVal = formatValue(field, value);
  const operatorText = OperatorTranslations[operator];

  return `${fieldName} ${operatorText} "${parsedVal}"`;
};

/**
 * Format date range filters for display
 */
export const formatDateFilter = (filters: Filter[]): string => {
  if (!filters || filters.length === 0) return "";

  const { field } = filters[0];
  const isDate = field === "date";

  // Handle range filters (>= and <= pair)
  if (filters.length === 2) {
    const startFilter = filters.find((f) => f.operator === ">=");
    const endFilter = filters.find((f) => f.operator === "<=");

    if (startFilter && endFilter) {
      const startDate = formatValue(field, startFilter.value);
      const endDate = formatValue(field, endFilter.value);
      return `${startDate} to ${endDate}`;
    }
  }

  // Handle single date condition
  if (filters.length === 1) {
    const filter = filters[0];
    const fieldName = isDate ? "Date" : "Time";
    const dateValue = formatValue(field, filter.value);

    const opMap = {
      "==": "is",
      ">": "after",
      ">=": "on or after",
      "<": "before",
      "<=": "on or before",
    };

    const opText =
      opMap[filter.operator as keyof typeof opMap] || OperatorTranslations[filter.operator];
    return `${fieldName} ${opText} ${dateValue}`;
  }

  // Fallback
  return String(filters[0]?.value || "");
};
