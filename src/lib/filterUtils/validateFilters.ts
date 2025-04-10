import { Filter, FilterMode } from "@/types/Filters";

/**
 * Adds one or more new filters to the current filter state, reconciling based on specific rules.
 * @param currentFilters - The existing array of filters (or empty if undefined).
 * @param newFilters - A single Filter or array of Filters to add.
 * @returns The updated array of filters, reconciled according to the rules.
 */
export const validateAndAddFilters = (
  currentFilters: Filter[] | undefined,
  newFilters: Filter | Filter[]
): Filter[] => {
  // Normalize newFilters to an array for consistent processing
  const filtersToAdd = Array.isArray(newFilters) ? newFilters : [newFilters];
  // Start with a copy of current filters, defaulting to an empty array if undefined
  let updatedFilters = currentFilters ? [...currentFilters] : [];

  // Check if the new filters constitute a date range pair
  const isDateRangePair =
    filtersToAdd.length === 2 &&
    filtersToAdd.every((f) => f.field === "date") &&
    filtersToAdd.some((f) => f.operator === ">=") &&
    filtersToAdd.some((f) => f.operator === "<=");

  // Special case: If adding a date range pair, replace all existing date filters
  if (isDateRangePair) {
    // Remove all existing 'date' filters
    updatedFilters = updatedFilters.filter((f) => f.field !== "date");
    // Add the new date range pair with FilterMode.AND mode
    updatedFilters.push(...filtersToAdd.map((f) => ({ ...f, mode: FilterMode.AND }) as Filter));
    return updatedFilters;
  }

  // Process each new filter to add
  filtersToAdd.forEach((newFilter) => {
    const { field, operator, value } = newFilter; // Default mode to FilterMode.AND if unspecified

    // Find an existing filter with the same field
    const existingFilterIndex = updatedFilters.findIndex((f) => f.field === field);

    // If no existing filter for this field, add it as an FilterMode.AND filter
    if (existingFilterIndex === -1) {
      updatedFilters.push({ ...newFilter, mode: FilterMode.AND });
      return;
    }

    const existingFilter = updatedFilters[existingFilterIndex];

    // If no existing filter for this field, add it as an FilterMode.AND filter
    if (existingFilter && ["!=", "not-in"].includes(existingFilter.operator)) {
      updatedFilters.push({ ...newFilter, mode: FilterMode.AND });
      return;
    }

    // Rule 1: Same field, same operator, different values -> combine into FilterMode.OR
    if (existingFilter.operator === operator && existingFilter.value !== value) {
      // If existing filter is already in an FilterMode.OR group, add to it (not directly supported in flat, so replace)
      updatedFilters[existingFilterIndex] = {
        field,
        operator,
        value: existingFilter.value, // Could use an array for 'in'-like behavior, but we'll replace logic
        mode: FilterMode.OR,
      };
      updatedFilters.push({ ...newFilter, mode: FilterMode.OR });
      // Note: For true FilterMode.OR grouping, we'd need a composite structure; here we simulate by replacing
    }
    // Rule 2: Same field, opposite operators -> replace the previous filter
    else if (
      (operator === "==" && existingFilter.operator === "!=") ||
      (operator === "!=" && existingFilter.operator === "==") ||
      (operator === ">" && existingFilter.operator === "<=") ||
      (operator === "<" && existingFilter.operator === ">=") ||
      (operator === ">=" && existingFilter.operator === "<") ||
      (operator === "<=" && existingFilter.operator === ">")
    ) {
      updatedFilters[existingFilterIndex] = {
        ...newFilter,
        mode: FilterMode.AND,
      }; // Replace with new filter, default to FilterMode.AND
    }
    // Rule 3: If filter already exists (same field, operator, value) -> replace it
    else if (existingFilter.operator === operator && existingFilter.value === value) {
      updatedFilters[existingFilterIndex] = {
        ...newFilter,
        mode: existingFilter.mode || FilterMode.AND,
      }; // Keep existing mode or default
    }
    // Rule 4: Same field, different operator, different value -> add as FilterMode.AND
    else if (existingFilter.operator !== operator && existingFilter.value !== value) {
      updatedFilters.push({ ...newFilter, mode: FilterMode.AND }); // Add as a new FilterMode.AND filter
    }
  });

  return updatedFilters;
};

/**
 * Removes a specific filter from the current filter state based on field, operator, and value.
 * @param currentFilters - The existing array of filters (or undefined).
 * @param filter - The Filter object to remove (must match field, operator, and value).
 * @returns The updated filter array, or undefined if no filters remain.
 */
export const removeFilters = (
  currentFilters: Filter[] | undefined,
  filter: Filter | Filter[]
): Filter[] | undefined => {
  // If no current filters exist, return undefined (nothing to remove)
  if (!currentFilters || currentFilters.length === 0) return undefined;

  const filters = Array.isArray(filter) ? filter : [filter];

  return currentFilters.filter((f) => !filters.includes(f));
};
