import DateRangePicker from "./DateRangePicker";
import UploadStatementButton from "./UploadStatementButton";
import { DateRange } from "react-day-picker";
import { Filter } from "@/types/Filters";
import { FilterChips } from "./FilterChips";
import AnalysisInitiator from "./AnalysisInitiator";
import { useTransactionContext } from "@/context/TransactionDataContext";
import { useCallback } from "react";

const Header = () => {
  const { dateRangeData, validateAndAddFilters } = useTransactionContext();

  const handleDateChange = useCallback(
    (dateRange: DateRange | undefined) => {
      if (!dateRange?.from || !dateRange?.to) return;

      const dateRangeFilter: Filter[] = [
        {
          field: "date",
          operator: ">=",
          value: dateRange.from.getTime(),
          mode: "and",
        },
        {
          field: "date",
          operator: "<=",
          value: dateRange.to.getTime(),
          mode: "and",
        },
      ];

      validateAndAddFilters(dateRangeFilter);
    },
    [validateAndAddFilters]
  );

  return (
    <header className="sticky top-0 w-full bg-white shadow-sm pt-2 pb-4 px-6 h-14 z-50">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <DateRangePicker
            range={dateRangeData.dateRange}
            onDateChange={handleDateChange}
          />
        </div>
        <div className="flex items-center space-x-4">
          <AnalysisInitiator />
          <UploadStatementButton />
        </div>
      </div>
    </header>
  );
};

export default Header;

export const HeaderWithFilters = () => {
  const { currentFilters } = useTransactionContext();

  return (
    <div className="sticky top-0 container mx-auto max-w-8xl pt-2 z-[10]">
      {currentFilters?.length ? <FilterChips /> : null}
    </div>
  );
};
