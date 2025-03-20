import Dexie from 'dexie';
import { Filter, CompositeFilter, Query } from '@/types/Filters';

export abstract class BaseRepository<T, K> {
  /**
   * The database table/collection to query
   */
  protected abstract getTable(): Dexie.Table<T, K>;

  /**
   * Evaluates a single filter against an item
   * Central method for all filter evaluation logic
   */
  protected evaluateFilter(item: T, filter: Filter): boolean {
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
   * Evaluate a composite filter against an item (for recursive evaluation)
   */
  protected evaluateCompositeFilter(item: T, compositeFilter: CompositeFilter): boolean {
    const { type, filters } = compositeFilter;

    if (filters.length === 0) {
      return true;
    }

    if (type === 'and') {
      return filters.every(filter => {
        if ('field' in filter) {
          return this.evaluateFilter(item, filter);
        }
        return this.evaluateCompositeFilter(item, filter);
      });
    } else { // 'or'
      return filters.some(filter => {
        if ('field' in filter) {
          return this.evaluateFilter(item, filter);
        }
        return this.evaluateCompositeFilter(item, filter);
      });
    }
  }

  /**
   * Apply a single filter condition to a Dexie collection
   * Uses the common evaluateFilter method instead of duplicating logic
   */
  protected applyFilter(collection: Dexie.Collection<T, K>, filter: Filter) {
    return collection.filter(item => this.evaluateFilter(item, filter));
  }

  /**
   * Apply a composite filter (AND/OR) recursively
   */
  protected applyCompositeFilter(collection: Dexie.Collection<T, K>, compositeFilter: CompositeFilter): Dexie.Collection<T, K> {
    const { type, filters } = compositeFilter;

    if (filters.length === 0) {
      return collection;
    }

    // For 'and' operations, we can chain filters
    if (type === 'and') {
      let result = collection;
      for (const filter of filters) {
        if ('field' in filter) {
          result = this.applyFilter(result, filter);
        } else {
          result = this.applyCompositeFilter(result, filter);
        }
      }
      return result;
    }

    // For 'or' operations, use the evaluateCompositeFilter method
    // instead of duplicating the filter logic
    return collection.filter(item => this.evaluateCompositeFilter(item, compositeFilter));
  }

  /**
   * Helper method to safely get a value from an item by field name.
   * Handles the TypeScript issue with dynamic property access
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected getItemValue(item: T, field: string): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (item as any)[field];
  }

  /**
   * Query items with complex filtering
   */
  async query(query: Query = {}): Promise<T[]> {
    const { filters, orderBy = [{ field: 'id', direction: 'desc' }], limit, offset = 0 } = query;

    // Start with the table and create a collection with primary sorting
    const primarySort = orderBy[0];
    let collection = this.getTable().orderBy(primarySort.field);

    if (primarySort.direction === 'desc') {
      collection = collection.reverse();
    }

    // Apply filters if present
    if (filters) {
      if ('field' in filters) {
        collection = this.applyFilter(collection, filters);
      } else {
        collection = this.applyCompositeFilter(collection, filters);
      }
    }

    // Apply offset
    if (offset > 0) {
      collection = collection.offset(offset);
    }

    // Apply limit
    if (limit !== undefined && limit > 0) {
      collection = collection.limit(limit);
    }

    // Apply secondary sorting (has to be done in memory)
    const result = await collection.toArray();

    return result;
  }
}
