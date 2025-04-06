import { useCallback, useEffect, useMemo, useState } from "react";
import { Filter, FilterField, FilterMode, FilterOperator } from "@/types/Filters";
import { UNCATEGORIZED } from "@/types/Categories";
import useCategoriesStore from "@/stores/categories.store";
import {
  getOperatorOptions,
  getDayOfWeekOptions,
  getModeOptions,
  getHourOptions,
  getTransactionTypeOptions,
  getValueDisplayLabel
} from "@/lib/filterChipUtils";
import useTransactionStore from "@/stores/transactions.store";

export interface UseFilterBuilderProps {
  onAddFilter: (filter: Filter) => void;
}

export const useFilterBuilder = ({ onAddFilter }: UseFilterBuilderProps) => {
  const validateAndAddFilters = useTransactionStore(state => state.validateAndAddFilters);
  const categoriesWithSubcategories = useCategoriesStore(
    (state) => state.categoriesWithSubcategories
  );
  const accountsList = useTransactionStore(state => state.accountNames);

  // State for the current filter being built
  const [selectedField, setSelectedField] = useState<string>("");
  const [selectedOperator, setSelectedOperator] = useState<string>("");
  const [selectedValue, setSelectedValue] = useState<
    string | number | Date | null
  >("");

  // Field-specific options
  const [filterValueOptions, setFilterValueOptions] = useState<any[]>([]);

  // Get operators based on selected field
  const operatorOptions = useMemo(() => {
    if (!selectedField) return [];
    return getOperatorOptions(selectedField);
  }, [selectedField]);

  // Update value options when field changes
  useEffect(() => {
    if (!selectedField) {
      setFilterValueOptions([]);
      return;
    }

    switch (selectedField) {
      case "category":
        setFilterValueOptions([
          UNCATEGORIZED,
          ...categoriesWithSubcategories.map((cat) => cat.name),
        ]);
        break;
      case "subcategory": {
        const allSubcategories = categoriesWithSubcategories.flatMap((cat) =>
          cat.subcategories.map((sub) => sub.name)
        );
        setFilterValueOptions(allSubcategories);
        break;
      }
      case "transactionType":
        setFilterValueOptions(getTransactionTypeOptions());
        break;
      case "dayOfWeek":
        setFilterValueOptions(getDayOfWeekOptions());
        break;
      case "mode":
        setFilterValueOptions(getModeOptions().map((option) => option.value));
        break;
      case "hour":
        setFilterValueOptions(getHourOptions());
        break;
      case "account":
        setFilterValueOptions(accountsList);
        break;
      default:
        setFilterValueOptions([]);
        break;
    }
  }, [selectedField, categoriesWithSubcategories, accountsList]);

  // Reset form after adding a filter
  const resetForm = useCallback(() => {
    setSelectedField("");
    setSelectedOperator("");
    setSelectedValue("");
  }, []);

  // Add the filter
  const handleAddFilter = useCallback(() => {
    if (!selectedField || !selectedOperator) return;

    // Skip if value is empty (except for some operators that don't need values)
    if (
      selectedValue === "" &&
      !["contains", "exists"].includes(selectedOperator)
    )
      return;

    // Create filter based on selected options
    let filterValue: any = selectedValue;

    const filter: Filter = {
      field: selectedField as FilterField,
      operator: selectedOperator as FilterOperator,
      value: filterValue,
      mode: FilterMode.AND,
    };

    validateAndAddFilters(filter);
    onAddFilter(filter);
    resetForm();
  }, [
    selectedField,
    selectedOperator,
    selectedValue,
    validateAndAddFilters,
    onAddFilter,
    resetForm,
  ]);

  // Get display label for the value based on field type
  const valueDisplayLabel = useMemo(() => {
    return getValueDisplayLabel(selectedField, selectedValue);
  }, [selectedField, selectedValue]);

  // Determine if the Add Filter button should be enabled
  const isAddFilterEnabled = useMemo(() => {
    return (
      selectedField !== "" &&
      selectedOperator !== "" &&
      (selectedValue !== "" || ["contains", "exists"].includes(selectedOperator))
  )}, [selectedField, selectedOperator, selectedValue]);

  return {
    // State
    selectedField,
    selectedOperator,
    selectedValue,
    filterValueOptions,
    operatorOptions,
    valueDisplayLabel,
    isAddFilterEnabled,

    // Actions
    setSelectedField,
    setSelectedOperator,
    setSelectedValue,
    handleAddFilter,
    resetForm,
  };
};