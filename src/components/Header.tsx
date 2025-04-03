import DateRangePicker from "./DateRangePicker";
import UploadStatementButton from "./UploadStatementButton";
import { DateRange } from "react-day-picker";
import { Filter } from "@/types/Filters";
import { FilterChips } from "./FilterChips";
import AnalysisInitiator from "./AnalysisInitiator";
import { useTransactionContext } from "@/context/TransactionDataContext";
import { useCallback } from "react";
import { Button } from "./ui/button";
import { Bot, ListFilter } from "lucide-react";
import useSidepanelStore, { SidepanelMode } from "@/stores/ui.store";
import useTransactionStore from "@/stores/transactions.store";

const Header = () => {
  const { dateRangeData, validateAndAddFilters } = useTransactionContext();
  const setSidepanel = useSidepanelStore((state) => state.setSidepanelMode);

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
    <header className="sticky top-0 w-full bg-white border-b pt-2 pb-4 px-2 sm:px-6 h-14">
      <div className="flex justify-between items-center">
        <div className="flex space-x-4 items-center">
          <DateRangePicker
            range={dateRangeData.dateRange}
            onDateChange={handleDateChange}
          />
          <Button
            variant="outline"
            onClick={() => setSidepanel(SidepanelMode.Filters)}
          >
            <ListFilter size={8} />
            <span className="hidden lg:block">Filter</span>
          </Button>
          <AnalysisInitiator />
          <Button
            variant="outline"
            onClick={() => setSidepanel(SidepanelMode.ChatPesa)}
          >
            <Bot size={8} />
            <span className="hidden lg:block">Chat</span>
          </Button>
        </div>
        <div className="flex items-center space-x-4">
          <UploadStatementButton />
        </div>
      </div>
    </header>
  );
};

export default Header;

export const HeaderWithFilters = () => {
  const currentFilters = useTransactionStore((state) => state.currentFilters);

  return (
    <div className="sticky top-0 container mx-auto max-w-[88rem] pt-2 z-[10]">
      {currentFilters?.length ? <FilterChips /> : null}
    </div>
  );
};
