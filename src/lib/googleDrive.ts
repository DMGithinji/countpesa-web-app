/**
 * Minimal Google Drive client for pulling the phone app's backup.
 *
 * The CountPesa phone app keeps an encrypted backup named `countpesa_backup.json`
 * in the Drive appDataFolder. Because the appDataFolder is scoped per Google
 * Cloud project, this web client can read that file as long as its OAuth client
 * ID lives in the same Cloud project as the Android app's client.
 *
 * Auth uses Google Identity Services (GIS) token flow with the `drive.appdata`
 * scope only. Tokens are kept in memory and never persisted.
 */

const GIS_SRC = "https://accounts.google.com/gsi/client";
const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.appdata";
export const BACKUP_FILENAME = "countpesa_backup.json";

type TokenResponse = {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

type TokenClient = {
  requestAccessToken: (config?: { prompt?: string }) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: TokenResponse) => void;
            error_callback?: (error: { type: string; message?: string }) => void;
          }) => TokenClient;
        };
      };
    };
  }
}

export type DriveBackupInfo = {
  id: string;
  modifiedTime: string;
  size?: number;
};

export function getDriveClientId(): string | undefined {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID;
}

export function isDriveSyncConfigured(): boolean {
  return Boolean(getDriveClientId());
}

let gisScriptPromise: Promise<void> | null = null;

function loadGisScript(): Promise<void> {
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }
  if (!gisScriptPromise) {
    gisScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = GIS_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        gisScriptPromise = null;
        reject(new Error("Failed to load Google sign-in. Check your connection and try again."));
      };
      document.head.appendChild(script);
    });
  }
  return gisScriptPromise;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

export function clearCachedToken() {
  cachedToken = null;
}

export async function requestDriveAccessToken(): Promise<string> {
  const clientId = getDriveClientId();
  if (!clientId) {
    throw new Error("Google Drive sync is not configured.");
  }

  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  await loadGisScript();
  const oauth2 = window.google?.accounts?.oauth2;
  if (!oauth2) {
    throw new Error("Google sign-in is unavailable. Please try again.");
  }

  return new Promise<string>((resolve, reject) => {
    const tokenClient = oauth2.initTokenClient({
      client_id: clientId,
      scope: DRIVE_SCOPE,
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(
            new Error(
              response.error_description || "Google Drive access was not granted. Please try again."
            )
          );
          return;
        }
        // Refresh a minute before expiry to avoid using a stale token mid-sync
        const expiresInMs = (response.expires_in ?? 3600) * 1000;
        cachedToken = {
          token: response.access_token,
          expiresAt: Date.now() + expiresInMs - 60_000,
        };
        resolve(response.access_token);
      },
      error_callback: (error) => {
        reject(
          new Error(
            error.type === "popup_closed"
              ? "Google sign-in was closed before finishing."
              : error.message || "Google sign-in failed. Please try again."
          )
        );
      },
    });
    tokenClient.requestAccessToken();
  });
}

async function driveFetch(token: string, path: string): Promise<Response> {
  const response = await fetch(`${DRIVE_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.status === 401 || response.status === 403) {
    clearCachedToken();
    throw new Error("Google Drive access expired. Please sync again to re-authorize.");
  }
  if (!response.ok) {
    throw new Error(`Google Drive request failed (${response.status}).`);
  }
  return response;
}

/**
 * Find the phone app's backup file in the appDataFolder.
 */
export async function findPhoneBackup(token: string): Promise<DriveBackupInfo | null> {
  const query = new URLSearchParams({
    spaces: "appDataFolder",
    q: `name='${BACKUP_FILENAME}'`,
    fields: "files(id,name,modifiedTime,size)",
  });
  const response = await driveFetch(token, `/files?${query.toString()}`);
  const result = (await response.json()) as {
    files?: { id: string; modifiedTime: string; size?: string }[];
  };
  const file = result.files?.[0];
  if (!file) {
    return null;
  }
  return {
    id: file.id,
    modifiedTime: file.modifiedTime,
    size: file.size ? parseInt(file.size, 10) : undefined,
  };
}

/**
 * Download the (encrypted) backup file contents.
 */
export async function downloadBackup(token: string, fileId: string): Promise<string> {
  const response = await driveFetch(token, `/files/${fileId}?alt=media`);
  return response.text();
}
