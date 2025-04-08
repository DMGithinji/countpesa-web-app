import { Sheet, SheetContent } from "@/components/ui/sheet";
import useUiStore, { SidepanelMode } from "@/stores/ui.store";
import CategoriesManager from "./CategoriesManager";
import SidepanelTransactions from "./SidepanelTransactions";
import ChatPesa from "./ChatPesa";
import FilterBuilder from "./FilterBuilder";

function Display({ mode }: { mode: SidepanelMode }) {
  switch (mode) {
    case SidepanelMode.Categories:
      return <CategoriesManager />;
    case SidepanelMode.Transactions:
      return <SidepanelTransactions />;
    case SidepanelMode.Filters:
      return <FilterBuilder />;
    case SidepanelMode.ChatPesa:
      return <ChatPesa />;
    default:
      return null;
  }
}

export function Sidepanel() {
  const sidepanelMode = useUiStore((state) => state.sidepanelMode);

  return (
    <Sheet open={sidepanelMode !== SidepanelMode.Closed}>
      <SheetContent className="p-0">
        <Display mode={sidepanelMode} />
      </SheetContent>
    </Sheet>
  );
}
