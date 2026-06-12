import React, { useState } from "react";
import { format } from "date-fns";
import { RefreshCw } from "lucide-react";
import { useUploadData } from "@/hooks/useUploadData";
import { useDriveSync, DriveSyncStatus } from "@/hooks/useDriveSync";
import { isDriveSyncConfigured } from "@/lib/googleDrive";
import backupHint from "../../assets/backup-hint.png";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";

const syncStatusLabels: Record<Exclude<DriveSyncStatus, "idle">, string> = {
  connecting: "Connecting to Google…",
  downloading: "Fetching your phone backup…",
  importing: "Importing transactions…",
};

function DriveSyncSection({ setOpen }: { setOpen: (open: boolean) => void }) {
  const { status, error, lastSync, syncFromDrive } = useDriveSync();

  const busy = status !== "idle";

  const handleSync = async () => {
    try {
      await syncFromDrive();
      setOpen(false);
    } catch {
      // Error state is surfaced by the hook below
    }
  };

  return (
    <div className="space-y-3">
      {/* TODO: replace with a Drive-sync-specific illustration */}
      <img src={backupHint} alt="Google Drive Sync Guide" className="w-80 mx-auto" />

      <p className="text-sm">
        If Google Drive backup is enabled in your CountPesa app, pull your latest phone data
        directly — no file needed.
      </p>

      <Button type="button" disabled={busy} onClick={handleSync} className="w-full">
        <RefreshCw className={busy ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
        {busy ? syncStatusLabels[status] : "Sync from Google Drive"}
      </Button>

      {lastSync && (
        <p className="text-xs text-gray-500">
          Last synced {format(lastSync.syncedAt, "d MMM yyyy, HH:mm")} · phone backup from{" "}
          {format(new Date(lastSync.backupModifiedTime), "d MMM yyyy, HH:mm")}
        </p>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}

function FileRestoreSection({ setOpen }: { setOpen: (open: boolean) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const { uploadData } = useUploadData();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(""); // Clear previous errors when file changes
    }
  };

  const handleRestore = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a backup file");
      return;
    }

    setUploading(true);

    try {
      await uploadData(file);
      setOpen(false);
      setError("");
    } catch (err) {
      console.error("Error restoring backup:", err);
      setError(err instanceof Error ? err.message : "Error processing backup file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleRestore} className="space-y-4">
      <img src={backupHint} alt="Backup Guide" className="w-80 mx-auto" />

      <p className="text-sm">
        Backups can be downloaded from:
        <br />
        <strong>1. Top Menu Section of the Web App</strong>
        <br />
        <strong>2. Homescreen of your CountPesa App</strong>
        <br />
        This is especially useful if you have been categorizing transactions.
      </p>

      <div className="space-y-2">
        <Input id="backup" type="file" accept=".json" onChange={handleFileChange} />
      </div>

      <Button disabled={uploading} type="submit" className="w-full bg-primary hover:bg-primary/90">
        {uploading ? "Uploading..." : "Load Data"}
      </Button>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <p className="text-xs text-gray-500">Your data is stored locally on your browser.</p>
    </form>
  );
}

function BackupRestoreSection({ setOpen }: { setOpen: (open: boolean) => void }) {
  const driveEnabled = isDriveSyncConfigured();

  if (!driveEnabled) {
    return <FileRestoreSection setOpen={setOpen} />;
  }

  return (
    <Accordion type="single" collapsible defaultValue="google-drive">
      <AccordionItem value="google-drive">
        <AccordionTrigger>Sync from Google Drive</AccordionTrigger>
        <AccordionContent>
          <DriveSyncSection setOpen={setOpen} />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="file">
        <AccordionTrigger>Restore from a backup file</AccordionTrigger>
        <AccordionContent>
          <FileRestoreSection setOpen={setOpen} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default BackupRestoreSection;
