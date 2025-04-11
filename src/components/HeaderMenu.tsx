import { useCallback, useState } from "react";
import { Ellipsis, Database, HardDriveDownload } from "lucide-react";
import { useCategoryRepository, useTransactionRepository } from "@/context/RepositoryContext";
import { getEncrypted } from "@/lib/encryptionUtils";
import { format } from "date-fns";
import { Separator } from "@radix-ui/react-select";
import { clearData } from "@/database/TransactionRepository";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ThemeToggle } from "./ThemeToggle";

export function MoreActions() {
  const [open, setOpen] = useState(false);
  const transactionRepository = useTransactionRepository();
  const categoryRepository = useCategoryRepository();

  const handleClearData = async () => {
    await clearData();
    window.location.reload();
  };

  const handleBackup = useCallback(async () => {
    const transactions = await transactionRepository.getTransactions();
    const categoriesWithSubcategories = await categoryRepository.getCategoriesWithSubcategories();
    const json = JSON.stringify(
      {
        transactions,
        categories: categoriesWithSubcategories,
      },
      null,
      2
    );
    const encrypted = getEncrypted(json);
    const data = {
      encrypted,
      trCount: transactions.length,
      categCount: categoriesWithSubcategories.length,
    };
    const blob = new Blob([data.encrypted], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const date = format(new Date(), "yyyy-MM-dd");
    a.download = `countpesa-backup-${date}.json`;
    a.click();
  }, [categoryRepository, transactionRepository]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Ellipsis className="h-6 w-6" />
          <span className="sr-only">More options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <div className="flex flex-col md:hidden">
          <DropdownMenuItem className="flex items-center gap-2 pt-2 cursor-pointer">
            <ThemeToggle />
          </DropdownMenuItem>
          <Separator className="border-1" />
        </div>
        <DropdownMenuItem
          onClick={handleBackup}
          className="flex items-center gap-2 py-3  cursor-pointer"
        >
          <HardDriveDownload className="h-5 w-5" />
          <span>Backup Data</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleClearData}
          className="flex items-center gap-2 py-3  cursor-pointer"
        >
          <Database className="h-5 w-5 text-red-600" />
          <span className="text-red-600">Clear All Data</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
