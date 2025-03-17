import { Transaction } from "./Transaction";

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
  field: keyof Transaction;         // Document field to filter on
  operator: FilterOperator;         // Comparison operator
  value: string | number;           // Value to compare against
}

// Composite filters with logical operations
export interface CompositeFilter {
  type: 'and' | 'or';    // Logical operator type
  filters: (Filter | CompositeFilter)[];  // Nested filters
}

// Query definition with filters, ordering and limits
export interface Query {
  filters?: Filter | CompositeFilter;
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  }[];
  limit?: number;
  offset?: number;
}
