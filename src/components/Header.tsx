import { DateRange } from "react-day-picker";
import { useCallback } from "react";
import { Bot, Home, ListFilter } from "lucide-react";
import { Filter, FilterMode } from "@/types/Filters";
import useUiStore, { SidepanelMode } from "@/stores/ui.store";
import useTransactionStore from "@/stores/transactions.store";
import { useRepositories } from "@/context/RepositoryContext";
import DateRangePicker from "./DateRangePicker";
import UploadStatementButton from "./Upload/LoadDataButton";
import { FilterChips } from "./FilterChips";
import AnalysisInitiator from "./AnalysisInitiator";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ThemeToggle";
import FeedbackButton from "./FeedbackButton";
import { MoreActions } from "./HeaderMenu";
import MobileOnly from "./MobileOnly";

function Header() {
  const dateRangeData = useTransactionStore((state) => state.dateRangeData);
  const validateAndAddFilters = useTransactionStore((state) => state.validateAndAddFilters);
  const setSidepanel = useUiStore((state) => state.setSidepanelMode);
  const { isDemoMode } = useRepositories();

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
    <header className="sticky top-0 w-full border-b pt-2 pb-4 h-14">
      <div className="flex justify-between items-center max-w-[1820px] mx-auto">
        <div className="flex space-x-4 items-center">
          <DateRangePicker range={dateRangeData.dateRange} onDateChange={handleDateChange} />
          <Button variant="outline" onClick={() => setSidepanel(SidepanelMode.Filters)}>
            <ListFilter size={8} />
            <span className="hidden lg:block">Filter</span>
          </Button>
          <AnalysisInitiator />
          <Button variant="outline" onClick={() => setSidepanel(SidepanelMode.ChatPesa)}>
            <Bot size={8} />
            <span className="hidden lg:block">Chat</span>
          </Button>
        </div>
        <div className="flex items-center space-x-0 md:space-x-4">
          <MobileOnly>
            <ThemeToggle />
          </MobileOnly>
          <MobileOnly>
            <FeedbackButton />
          </MobileOnly>
          {!isDemoMode && <UploadStatementButton />}
          {!isDemoMode ? (
            <MoreActions />
          ) : (
            <a
              title="My Dashboard"
              href="/dashboard"
              className="hover:bg-secondary focus:bg-secondary cursor-pointer px-2 py-2 rounded-full flex gap-2 items-center"
            >
              <Home size={18} />
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;

export function HeaderWithFilters() {
  const currentFilters = useTransactionStore((state) => state.currentFilters);

  return (
    <div className="sticky top-0 max-w-[1820px] mx-auto pt-2 z-[10]">
      {currentFilters?.length ? <FilterChips /> : null}
    </div>
  );
}
