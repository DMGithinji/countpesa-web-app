import { useState } from "react";
import { Ellipsis, Database } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useTransactionRepository } from "@/context/DBContext";

export function MoreActions() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const transactionRepository = useTransactionRepository();

  const handleClearData = async () => {
    await transactionRepository.clearAllData();
    navigate('/')
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Ellipsis className="h-6 w-6" />
          <span className="sr-only">More options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
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