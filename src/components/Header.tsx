import { useTransactions } from "@/hooks/useTransactions";
import DateRangePicker from "./DateRangePicker";
import UploadStatementButton from "./UploadStatementButton";
import { DateRange } from "react-day-picker";
import { CompositeFilter } from "@/types/Filters";
import { useDateRange } from "@/hooks/useDateRange";
import { FilterChips } from "./FilterChips";

const Header = () => {
  const { dateRange } = useDateRange();
  const { setCurrentFilters } = useTransactions();

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
          <DateRangePicker range={dateRange} onDateChange={handleDateChange} />
        </div>
        <div className="flex items-center space-x-4">
          <UploadStatementButton />
        </div>
      </div>
      <FilterChips />
    </header>
  );
};

export default Header;
