import { Transaction } from "./Transaction";

export type FilterField = keyof Transaction | 'subcategory' | 'hour' | 'mode' | 'dayOfWeek';
// Basic operator types for queries
export type FilterOperator =
  | '=='
  | '!='
  | '<'
  | '<='
  | '>'
  | '>='
  | 'contains'
  | 'contains-any'
  | 'in'
  | 'not-in';

// A single filter condition
export interface Filter {
  field: FilterField;               // Document field to filter on
  operator: FilterOperator;         // Comparison operator
  value: string | number;           // Value to compare against
  mode?: FilterMode;                 // Logical operator to use
}


// Query definition with filters, ordering and limits
export interface Query {
  filters?: Filter[];
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  }[];
  limit?: number;
  offset?: number;
}

export type FilterMode = 'and' | 'or';


// Dictionary to translate operators to readable text
export const OperatorTranslations: Record<FilterOperator, string> = {
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
