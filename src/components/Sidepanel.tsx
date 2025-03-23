import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import useSidepanelStore, { SidepanelMode } from "@/stores/sidepanel.store";
import CategoriesManager from "./CategoriesManager";
import SidepanelTransactions from "./SidepanelTransactions";

export function Sidepanel() {
  const mode = useSidepanelStore((state) => state.mode);

  return (
    <Sheet open={mode !== SidepanelMode.Closed}>
      <SheetContent className="p-0">
        <Display mode={mode} />
      </SheetContent>
    </Sheet>
  );
}

const Display = ({mode}: {mode: SidepanelMode}) => {
  switch (mode) {
    case SidepanelMode.Categories:
      return <CategoriesManager />
    case SidepanelMode.Transactions:
      return <SidepanelTransactions />
    default:
      return null
  }
}
