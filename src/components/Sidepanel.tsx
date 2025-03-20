import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import useSidepanelStore from "@/stores/sidepanel.store";
import CategoriesManager from "./CategoriesManager";

export function Sidepanel() {
  const sidepanelOpen = useSidepanelStore((state) => state.sidepanelOpen);
  const setSidepanelOpen = useSidepanelStore((state) => state.setSidepanelOpen);
  return (
    <Sheet open={sidepanelOpen} onOpenChange={setSidepanelOpen}>
      <SheetContent>
        <SheetHeader className="bg-slate-800 text-white">
          <SheetTitle className="text-white">Manage Categories</SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 px-4 overflow-y-auto">
          <CategoriesManager />
        </div>
      </SheetContent>
    </Sheet>
  );
}
