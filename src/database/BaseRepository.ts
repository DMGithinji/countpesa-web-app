import Dexie from 'dexie';
import { Filter, FilterField, Query } from '@/types/Filters';
import { Transaction } from '@/types/Transaction';
import { deconstructTrCategory } from '@/hooks/useTransactions';

export abstract class BaseRepository {
  /**
   * The database table/collection to query
   */
  protected abstract getTable(): Dexie.Table<Transaction>;

  /**
   * Evaluates a single filter against an item
   * Central method for all filter evaluation logic
   */
  protected evaluateFilter(item: Transaction, filter: Filter): boolean {
    const { field, operator, value } = filter;
    const fieldValue = this.getItemValue(item, field);

    switch (operator) {
      case '==': return fieldValue === value;
      case '!=': return fieldValue !== value;
      case '<': return fieldValue < value;
      case '<=': return fieldValue <= value;
      case '>': return fieldValue > value;
      case '>=': return fieldValue >= value;
      case 'contains':
        return typeof fieldValue === 'string' &&
          fieldValue.toLowerCase().includes((value as string).toLowerCase());
      case 'contains-any':
        if (typeof value === 'string') {
          const terms = value.toLowerCase().split(/\s+/);
          return typeof fieldValue === 'string' &&
            terms.some(term => fieldValue.toLowerCase().includes(term));
        }
        return false;
      case 'in':
        return Array.isArray(value) && value.includes(fieldValue);
      case 'not-in':
        return Array.isArray(value) && !value.includes(fieldValue);
      default:
        return false;
    }
  }

  /**
   * Apply filters to a Dexie collection, grouping by mode
   */
  protected applyFilters(collection: Dexie.Collection<Transaction>, filters: Filter[]): Dexie.Collection<Transaction, number> {
    if (!filters || filters.length === 0) {
      return collection;
    }

    // Group filters by mode, defaulting to 'and' if mode is undefined
    const andFilters = filters.filter(f => f.mode === 'and' || f.mode === undefined);
    const orFilters = filters.filter(f => f.mode === 'or');

    let result = collection;

    // Apply AND filters: all must be true
    if (andFilters.length > 0) {
      result = result.filter(item =>
        andFilters.every(filter => this.evaluateFilter(item, filter))
      );
    }

    // Apply OR filters: at least one must be true
    if (orFilters.length > 0) {
      result = result.filter(item =>
        orFilters.some(filter => this.evaluateFilter(item, filter))
      );
    }

    return result;
  }

  /**
   * Helper method to safely get a value from an item by field name
   * Ensures TypeScript safety with keyof Transaction
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected getItemValue(item: Transaction, field: FilterField): any {
    if  (['category', 'subcategory'].includes(field)) {
      const { category, subcategory } = deconstructTrCategory(item.category);
      return field === 'category' ? category : subcategory;
    }
    return item[field as keyof Transaction];
  }

  /**
   * Query items with filtering, ordering, and pagination
   */
  async query(query: Query = {}): Promise<Transaction[]> {
    const { filters, orderBy = [{ field: 'id', direction: 'desc' }], limit, offset = 0 } = query;

    // Start with the table and apply primary sorting
    const primarySort = orderBy[0];
    let collection = this.getTable().orderBy(primarySort.field);

    if (primarySort.direction === 'desc') {
      collection = collection.reverse();
    }

    // Apply filters if present
    if (filters && filters.length > 0) {
      collection = this.applyFilters(collection, filters);
    }

    // Apply offset
    if (offset > 0) {
      collection = collection.offset(offset);
    }

    // Apply limit
    if (limit !== undefined && limit > 0) {
      collection = collection.limit(limit);
    }

    // Execute query and return results
    return collection.toArray();
  }
}