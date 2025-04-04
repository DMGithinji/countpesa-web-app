import DateRangePicker from "./DateRangePicker";
import UploadStatementButton from "./Upload/LoadDataButton";
import { DateRange } from "react-day-picker";
import { Filter, FilterMode } from "@/types/Filters";
import { FilterChips } from "./FilterChips";
import AnalysisInitiator from "./AnalysisInitiator";
import { useCallback } from "react";
import { Button } from "./ui/button";
import { Bot, ListFilter } from "lucide-react";
import useSidepanelStore, { SidepanelMode } from "@/stores/ui.store";
import useTransactionStore from "@/stores/transactions.store";
import { ThemeToggle } from "./ThemeToggle";

const Header = () => {
  const dateRangeData = useTransactionStore((state) => state.dateRangeData);
  const validateAndAddFilters = useTransactionStore(state => state.validateAndAddFilters);
  const setSidepanel = useSidepanelStore((state) => state.setSidepanelMode);

  const handleDateChange = useCallback(
    (dateRange: DateRange | undefined) => {
      if (!dateRange?.from || !dateRange?.to) return;

      const dateRangeFilter: Filter[] = [
        {
          field: "date",
          operator: ">=",
          value: dateRange.from.getTime(),
          mode: FilterMode.AND,
        },
        {
          field: "date",
          operator: "<=",
          value: dateRange.to.getTime(),
          mode: FilterMode.AND,
        },
      ];

      validateAndAddFilters(dateRangeFilter);
    },
    [validateAndAddFilters]
  );

  return (
    <header className="sticky top-0 w-full border-b pt-2 pb-4 px-2 sm:px-6 h-14">
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
          <ThemeToggle />
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
    <div className="sticky top-0 mx-auto pt-2 z-[10]">
      {currentFilters?.length ? <FilterChips /> : null}
    </div>
  );
};
