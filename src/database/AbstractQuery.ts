import { Query } from "@/types/Filters";
import { Transaction } from "@/types/Transaction";
import Dexie from "dexie";
import { filterTransactions } from "@/lib/filterUtils/filter";

export abstract class AbstractQuery {
  /**
   * The database table/collection to query
   */
  protected abstract getTable(): Dexie.Table<Transaction>;

  /**
   * Query items with filtering, ordering, and pagination
   */
  async query(query: Query = {}): Promise<Transaction[]> {
    const { filters, orderBy = [{ field: "id", direction: "desc" }], limit, offset = 0 } = query;

    try {
      // Start with the table and apply primary sorting
      const primarySort = orderBy[0];
      let collection = this.getTable().orderBy(primarySort.field);

      if (primarySort.direction === "desc") {
        collection = collection.reverse();
      }

      // Apply filters if present
      if (filters && filters.length > 0) {
        collection = filterTransactions(
          collection as unknown as Transaction[],
          filters
        ) as unknown as Dexie.Collection<Transaction, number>;
      }

      // Apply offset and limit
      let result = collection;
      if (offset > 0) {
        result = result.offset(offset);
      }
      if (limit !== undefined && limit > 0) {
        result = result.limit(limit);
      }

      // Execute query and return results
      return result.toArray();
    } catch (error) {
      console.error("Query execution failed:", error);
      return [];
    }
  }
}
