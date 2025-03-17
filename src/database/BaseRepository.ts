import Dexie from 'dexie';
import { Filter, CompositeFilter, Query } from '@/types/Filters';

export abstract class BaseRepository<T, K> {
  /**
   * The database table/collection to query
   */
  protected abstract getTable(): Dexie.Table<T, K>;

  /**
   * Apply a single filter condition to a Dexie collection
   */
  protected applyFilter(collection: Dexie.Collection<T, K>, filter: Filter) {
    const { field, operator, value } = filter;

    switch (operator) {
      case '==':
        return collection.filter(item => this.getItemValue(item, field) === value);
      case '!=':
        return collection.filter(item => this.getItemValue(item, field) !== value);
      case '<':
        return collection.filter(item => this.getItemValue(item, field) < value);
      case '<=':
        return collection.filter(item => this.getItemValue(item, field) <= value);
      case '>':
        return collection.filter(item => this.getItemValue(item, field) > value);
      case '>=':
        return collection.filter(item => this.getItemValue(item, field) >= value);
      case 'contains':
        return collection.filter(item => {
          const fieldValue = this.getItemValue(item, field);
          return typeof fieldValue === 'string' &&
            fieldValue.toLowerCase().includes((value as string).toLowerCase());
        });
      case 'contains-any':
        if (typeof value === 'string') {
          const terms = value.toLowerCase().split(/\s+/);
          return collection.filter(item => {
            const fieldValue = this.getItemValue(item, field);
            return typeof fieldValue === 'string' &&
              terms.some(term => fieldValue.toLowerCase().includes(term));
          });
        }
        return collection;
      case 'in':
        if (Array.isArray(value)) {
          return collection.filter(item => value.includes(this.getItemValue(item, field)));
        }
        return collection;
      case 'not-in':
        if (Array.isArray(value)) {
          return collection.filter(item => !value.includes(this.getItemValue(item, field)));
        }
        return collection;
      default:
        return collection;
    }
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

    // For 'or' operations, we need to combine results
    if (type === 'or') {
      // Get primary keys for each filter and combine them
      return collection.filter(item => {
        return filters.some(filter => {
          if ('field' in filter) {
            const { field, operator, value } = filter;

            switch (operator) {
              case '==': return this.getItemValue(item, field) === value;
              case '!=': return this.getItemValue(item, field) !== value;
              case '<': return this.getItemValue(item, field) < value;
              case '<=': return this.getItemValue(item, field) <= value;
              case '>': return this.getItemValue(item, field) > value;
              case '>=': return this.getItemValue(item, field) >= value;
              case 'contains':
                return typeof this.getItemValue(item, field) === 'string' &&
                  (this.getItemValue(item, field) as string).toLowerCase().includes((value as string).toLowerCase());
              case 'contains-any':
                if (typeof value === 'string') {
                  const terms = value.toLowerCase().split(/\s+/);
                  return typeof this.getItemValue(item, field) === 'string' &&
                    terms.some(term => (this.getItemValue(item, field) as string).toLowerCase().includes(term));
                }
                return false;
              case 'in':
                return Array.isArray(value) && value.includes(this.getItemValue(item, field));
              case 'not-in':
                return Array.isArray(value) && !value.includes(this.getItemValue(item, field));
              default:
                return false;
            }
          } else {
            // Handle nested composite filters recursively
            if (filter.type === 'and') {
              return filter.filters.every(subFilter => {
                if ('field' in subFilter) {
                  return this.evaluateFilter(item, subFilter);
                }
                return this.evaluateCompositeFilter(item, subFilter);
              });
            } else { // 'or'
              return filter.filters.some(subFilter => {
                if ('field' in subFilter) {
                  return this.evaluateFilter(item, subFilter);
                }
                return this.evaluateCompositeFilter(item, subFilter);
              });
            }
          }
        });
      });
    }

    return collection;
  }

  /**
   * Evaluate a single filter against an item (for recursive evaluation)
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
