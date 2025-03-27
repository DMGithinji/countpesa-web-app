import DateRangePicker from "./DateRangePicker";
import UploadStatementButton from "./UploadStatementButton";
import { DateRange } from "react-day-picker";
import { Filter } from "@/types/Filters";
import { FilterChips } from "./FilterChips";
import AnalysisInitiator from "./AnalysisInitiator";
import { useTransactionContext } from "@/context/TransactionDataContext";
import { useCallback } from "react";
import { Button } from "./ui/button";
import { Bot } from "lucide-react";
import useSidepanelStore, { SidepanelMode } from "@/stores/sidepanel.store";

const Header = () => {
  const { dateRangeData, validateAndAddFilters } = useTransactionContext();
  const setSidepanel = useSidepanelStore((state) => state.setMode);

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
    <header className="sticky top-0 w-full bg-white shadow-xs pt-2 pb-4 px-2 sm:px-6 h-14 z-50">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <DateRangePicker
            range={dateRangeData.dateRange}
            onDateChange={handleDateChange}
          />
          <Button variant="outline" className="ml-2" onClick={() => setSidepanel(SidepanelMode.ChatPesa)}>
          <span className="hidden sm:block">ChatPesa</span>
            <Bot size={8} />
          </Button>
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
    <div className="sticky top-0 container mx-auto max-w-[88rem] pt-2 z-[10]">
      {currentFilters?.length ? <FilterChips /> : null}
    </div>
  );
};
