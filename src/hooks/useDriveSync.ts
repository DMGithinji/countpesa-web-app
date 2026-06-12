import { useCallback, useState } from "react";
import {
  downloadBackup,
  findPhoneBackup,
  isDriveSyncConfigured,
  requestDriveAccessToken,
} from "@/lib/googleDrive";
import { useUploadData } from "./useUploadData";

const LAST_SYNC_KEY = "countpesa.driveSync.lastSync";

export type DriveSyncStatus = "idle" | "connecting" | "downloading" | "importing";

export type DriveLastSync = {
  syncedAt: number;
  backupModifiedTime: string;
};

function readLastSync(): DriveLastSync | null {
  try {
    const raw = localStorage.getItem(LAST_SYNC_KEY);
    return raw ? (JSON.parse(raw) as DriveLastSync) : null;
  } catch {
    return null;
  }
}

function writeLastSync(value: DriveLastSync) {
  localStorage.setItem(LAST_SYNC_KEY, JSON.stringify(value));
}

/**
 * Pull-only sync from the phone app's Google Drive backup.
 * The phone owns the backup file; the web app never writes to Drive.
 */
export function useDriveSync() {
  const { importBackupContent } = useUploadData();
  const [status, setStatus] = useState<DriveSyncStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<DriveLastSync | null>(readLastSync);

  const syncFromDrive = useCallback(async () => {
    setError(null);
    setStatus("connecting");
    try {
      const token = await requestDriveAccessToken();

      setStatus("downloading");
      const backup = await findPhoneBackup(token);
      if (!backup) {
        throw new Error(
          "No phone backup found in Google Drive. In the CountPesa app, enable Google Drive backup from Settings, then try again."
        );
      }

      const content = await downloadBackup(token, backup.id);

      setStatus("importing");
      // Import is idempotent (upserts by transaction id), so we always apply the
      // latest backup rather than skipping on an unchanged modifiedTime — that
      // also recovers cleanly when the browser database was cleared.
      await importBackupContent(content);

      const synced: DriveLastSync = {
        syncedAt: Date.now(),
        backupModifiedTime: backup.modifiedTime,
      };
      writeLastSync(synced);
      setLastSync(synced);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google Drive sync failed.");
      throw err;
    } finally {
      setStatus("idle");
    }
  }, [importBackupContent]);

  return {
    isConfigured: isDriveSyncConfigured(),
    status,
    error,
    lastSync,
    syncFromDrive,
  };
}
