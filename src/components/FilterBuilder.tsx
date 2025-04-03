import { ListFilter, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useSidepanelStore, { SidepanelMode } from "@/stores/ui.store";
import { FilterChips } from "./FilterChips";
import SelectionDropdown from "./SelectionDropDown";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { useFilterBuilder } from "@/hooks/useFilterBuilder";
import { fieldOptions } from "@/lib/filterUtils";

// Main FilterBuilder component
const FilterBuilder = () => {
  const setSidepanel = useSidepanelStore((state) => state.setSidepanelMode);

  const {
    selectedField,
    selectedOperator,
    selectedValue,
    filterValueOptions,
    operatorOptions,
    valueDisplayLabel,
    isAddFilterEnabled,
    setSelectedField,
    setSelectedOperator,
    setSelectedValue,
    handleAddFilter,
  } = useFilterBuilder({
    onAddFilter: () => {}, // We handle the filtering in the hook
  });

  // Handle field selection
  const handleFieldChange = (label: string) => {
    const field = fieldOptions.find((f) => f.label === label);
    if (field) {
      setSelectedField(field.value);
      setSelectedOperator("");
      setSelectedValue("");
    }
  };

  // Handle operator selection
  const handleOperatorChange = (label: string) => {
    const operator = operatorOptions.find((op) => op.label === label);
    if (operator) {
      setSelectedOperator(operator.value);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <CardHeader className="bg-zinc-900 text-white sticky top-0 z-50 pl-4 pr-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex gap-2 items-center pt-4.5 pb-3 text-white">
            <ListFilter size={20} className="text-primary" /> Filter Builder
          </CardTitle>
          <Button
            variant={"ghost"}
            onClick={() => setSidepanel(SidepanelMode.Closed)}
            className="hover:bg-transparent hover:text-white"
          >
            <X size={16} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="py-4 px-4 flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 gap-4 mb-6">
          {/* Field Selector */}
          <SelectionDropdown
            title="Field"
            placeholder="Select a field to filter"
            options={fieldOptions.map((field) => field.label)}
            value={
              selectedField
                ? fieldOptions.find((f) => f.value === selectedField)?.label ||
                  ""
                : ""
            }
            onChange={handleFieldChange}
          />

          {/* Operator Selector - shown if field is selected */}
          {selectedField && (
            <SelectionDropdown
              title="Condition"
              placeholder="Select a condition"
              options={operatorOptions.map((op) => op.label)}
              value={
                selectedOperator
                  ? operatorOptions.find((op) => op.value === selectedOperator)
                      ?.label || ""
                  : ""
              }
              onChange={handleOperatorChange}
            />
          )}

          {/* Value Selector - shown if field and operator are selected */}
          {selectedField && selectedOperator && (
            <>
              <div className="space-y-2">
                <p className="text-sm font-medium">Value</p>
                {filterValueOptions.length > 0 ? (
                  <SelectionDropdown
                    title=""
                    placeholder="Select or enter a value"
                    options={filterValueOptions.map((v) =>
                      typeof v === "object" ? v.label : v
                    )}
                    value={valueDisplayLabel as string}
                    onChange={setSelectedValue}
                  />
                ) : (
                  <Input
                    type={selectedField === "amount" ? "number" : "text"}
                    placeholder="Enter a value"
                    value={selectedValue as string}
                    onChange={(e) =>
                      setSelectedValue(
                        selectedField === "amount"
                          ? parseFloat(e.target.value)
                          : e.target.value
                      )
                    }
                  />
                )}
              </div>
            </>
          )}

          {/* Add Filter Button */}
          <Button
            onClick={handleAddFilter}
            disabled={!isAddFilterEnabled}
            className="mt-2"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Filter
          </Button>
        </div>

        <Separator className="my-4" />

        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Active Filters</h3>
          <FilterChips className="flex-wrap" />
        </div>
      </CardContent>
    </div>
  );
};

export default FilterBuilder;
