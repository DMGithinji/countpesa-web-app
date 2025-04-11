import { useState } from "react";
import { FileDown } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import MpesaUploadSection from "./StatementUpload";
import BackupRestoreSection from "./BackupRestorationForm";
import { Button } from "../ui/button";

type LoadDataButtonProps = {
  variant?: "default" | "ghost";
};
function LoadDataButton({ variant = "ghost" }: LoadDataButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {variant === "default" ? (
        <Button variant={variant} onClick={() => setOpen(true)}>
          <FileDown className="text-background font-bold h-4 w-4" />
          <span className="text-background font-bold">Load Transactions</span>{" "}
        </Button>
      ) : (
        <div
          role="none"
          title="Load transactions"
          onClick={() => setOpen(true)}
          className="hover:bg-secondary focus:bg-secondary cursor-pointer px-2 py-2 rounded-full"
        >
          <FileDown size={18} />
          <span className={cn("block", { hidden: variant === "ghost" })}>
            Load Transactions
          </span>{" "}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Load Transactions</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="mpesa">
            <TabsList className="grid grid-cols-2 mb-4 w-full mx-auto border-b border-border rounded-none bg-muted">
              <TabsTrigger value="mpesa">From M-Pesa Statement</TabsTrigger>
              <TabsTrigger value="backup">From a Backup</TabsTrigger>
            </TabsList>

            <TabsContent value="mpesa">
              <MpesaUploadSection setOpen={setOpen} />
            </TabsContent>

            <TabsContent value="backup">
              <BackupRestoreSection setOpen={setOpen} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default LoadDataButton;
