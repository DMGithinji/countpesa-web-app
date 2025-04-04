import { useState } from "react";
import { FileDown } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import MpesaUploadSection from "./StatementUpload";
import BackupRestoreSection from "./BackupRestorationForm";

const UploadStatementButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-lg"
      >
        <FileDown className="h-4 w-4" />
        <span className="hidden md:block">Load Transactions</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Load Transactions
            </DialogTitle>
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
};

export default UploadStatementButton;
