import React, { useState } from "react";
import { useUploadData } from "@/hooks/useUploadData";
import backupHint from "../../assets/backup-hint.png";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

function BackupRestoreSection({ setOpen }: { setOpen: (open: boolean) => void }) {
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
    } catch (err) {
      console.error("Error restoring backup:", err);
      setError(err instanceof Error ? err.message : "Error processing backup file");
    } finally {
      setUploading(false);
      setOpen(false);
      setError("");
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

export default BackupRestoreSection;
