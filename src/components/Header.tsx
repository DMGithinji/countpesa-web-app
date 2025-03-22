import DateRangePicker from "./DateRangePicker";
import UploadStatementButton from "./UploadStatementButton";
import { DateRange } from "react-day-picker";
import { CompositeFilter } from "@/types/Filters";
import { FilterChips } from "./FilterChips";
import AnalysisInitiator from "./AnalysisInitiator";
import { useTransactionContext } from "@/context/TransactionDataContext";

const Header = () => {
  const { dateRangeData, setCurrentFilters } = useTransactionContext();

  const handleDateChange = (dateRange: DateRange | undefined) => {
    if (!dateRange?.from || !dateRange?.to) return;

    const dateRangeFilter: CompositeFilter = {
      type: "and",
      filters: [
        {
          field: "date",
          operator: ">=",
          value: dateRange.from.getTime(),
        },
        {
          field: "date",
          operator: "<=",
          value: dateRange.to.getTime(),
        },
      ],
    };

    setCurrentFilters(dateRangeFilter);
  };

  return (
    <header className="sticky top-0 w-full bg-white shadow-xs py-4 px-6 h-16 z-50">
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
      <FilterChips />
    </header>
  );
};

export default Header;
