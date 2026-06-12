# Proposal: Syncing CountPesa Phone Data to the Web App

**Status:** Draft · June 2026
**Direction:** Phone app is the source of truth → web app pulls.

## 1. Background — what exists today

### Phone app (source of truth)

- Stores everything in WatermelonDB. A backup (`data/backup/backup.ts → exportDatabaseData`) is a JSON dump of 8 collections: `budgets`, `auto_categorized`, `tags`, `categories`, `sub_categories`, `mpesaTrs`, `wallets`, `reports`.
- Backups are encrypted with AES-256-CBC using a **static key + IV** from app config. Payloads over 5 MB are split into 5 MB chunks and stored as a **JSON array of encrypted strings** (`data/utils/encryption-lib.ts`).
- Two backup channels already exist:
  1. **File export** — encrypted JSON saved and shared via the OS share sheet (`backupDataToFile`).
  2. **Google Drive** — uploaded as `countpesa_backup.json` into the Drive **`appDataFolder`** with scope `drive.appdata`, refreshed every 2 days via pull-merge-push sync (`data/backup/driveBackup.ts`).

### Web app

- Vite + React + Dexie (IndexedDB), tables: `transactions`, `categories`, `subcategories`, `analysisReports`. No auth of any kind today.
- Already has a **manual backup upload** (`components/Upload/BackupRestorationForm.tsx` + `hooks/useUploadData.tsx`) that decrypts with `crypto-js` (same key/IV via `VITE_SECRET_KEY` / `VITE_IV_STRING`) and understands two formats:
  - **phone** (`categories`, `sub_categories`, `mpesaTrs`)
  - **browser** (`transactions` re-import)

So "sync to web" is mostly an integration problem, not a greenfield build: the decryption keys, backup file format, and import pipeline already exist on both sides.

## 2. Gaps that block reliable sync today

| #   | Gap                                                                                                                                                                          | Impact                                                                                                               |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 1   | Web `getDecrypted` (`lib/encryptionUtils.ts`) does not handle the **chunked** format. `isEncrypted()` treats the JSON array of chunks as "not encrypted" and returns it raw. | Any phone backup over 5 MB (heavy users — exactly who wants sync) fails with "Invalid backup format".                |
| 2   | `TransactionRepository.processMpesaStatementData` **only adds new** transactions (dedupe by `getTrId(amount, code)`); existing rows are never updated.                       | Re-syncing never refreshes categories the user fixed on the phone — the main reason to re-sync.                      |
| 3   | Phone import drops `budgets`, `tags`, `auto_categorized`, `wallets`, `reports`.                                                                                              | Acceptable for now (web has no features/tables for these), but should be a conscious decision, not silent data loss. |
| 4   | Web app has no Google sign-in / Drive access.                                                                                                                                | Needed for Option B below.                                                                                           |
| 5   | `countpesa-app/web-app/` is a byte-identical copy of `countpesa-web-app/`.                                                                                                   | Any change here must land in both, or the copies should be consolidated first.                                       |

## 3. Proposed plan

### Phase 1 — Harden manual backup upload (small; ship first)

Goal: "Export from phone → upload file on web" works for every user, every time, repeatably.

1. **Port chunked decryption to web.** In `lib/encryptionUtils.ts`, mirror the phone's three-case logic: JSON array of strings → decrypt each chunk and concatenate; plain JSON object → pass through; otherwise → single-string decrypt.
2. **Upsert on re-import.** In `processMpesaStatementData`, instead of filtering out existing IDs, `bulkPut` and preserve `createdAt` for existing rows — so a re-uploaded backup updates `category`/`account` on transactions the user re-categorized on the phone. Same for `bulkAddCategories`/`bulkAddSubcategories`.
3. **Surface an import summary** (added / updated counts), reusing the spirit of the phone's `formatRestoreSummary`.

Effort: ~half a day. No infrastructure changes. This alone delivers the "backup upload" sync path end-to-end.

### Phase 2 — Google Drive sync on the web app (the headline feature)

Goal: one click on the web — "Sync from my phone" — pulls the latest `countpesa_backup.json` the phone already maintains in Drive. No file juggling.

**How it works:**

1. **OAuth client.** Create a _Web application_ OAuth client ID **in the same Google Cloud project as the Android app's client**. This is the load-bearing detail: `appDataFolder` visibility is scoped per Cloud project, so a web client in the same project can read the file the phone wrote. (Verify this early with a 1-hour spike — see Risks.)
2. **Auth on web.** Use Google Identity Services (GIS) token client, scope `https://www.googleapis.com/auth/drive.appdata` only. Access token kept in memory; re-prompt per session is fine for a manual "Sync now" button. No Firebase needed on web.
3. **Sync flow** (new `hooks/useDriveSync.ts`):
   - `GET /drive/v3/files?spaces=appDataFolder&q=name='countpesa_backup.json'&fields=files(id,modifiedTime,size)`
   - If `modifiedTime` equals the stored `lastSyncedModifiedTime` (persist in `localStorage`), report "Already up to date" and stop.
   - Else `GET /files/{id}?alt=media` → decrypt (Phase 1 code) → run through the existing `useUploadData` import pipeline → store new `modifiedTime` + sync timestamp.
4. **UI.** Add a "Sync with Google Drive" section to the existing upload dialog (`BackupRestorationForm` / `LoadDataButton`), plus a "Last synced …" indicator.
5. **Pull-only, deliberately.** The web app must **not** write the Drive file:
   - The phone's sync cycle (pull-merge-push) assumes it owns the file; a concurrent web write can race it.
   - The web app only holds 3 of the 8 collections — a web-written backup would silently drop budgets, tags, wallets, rules, and the phone's `importDatabaseData` destructures those keys without guarding against `undefined`.
   - It also matches the product stance: _CountPesa phone data is the source._

Effort: ~2–3 days including GCP console setup and OAuth consent screen work.

### Phase 3 (future, out of scope) — pushing web edits back

If the web app later allows categorizing transactions, don't push via the backup file. Instead either (a) add per-record `updatedAt` and a real merge protocol, or (b) route writes through Firestore/`countpesa-server` so the phone pulls deltas. Parked until there's a concrete need.

## 4. Risks & open items

- **`appDataFolder` cross-client access (Phase 2 prerequisite).** Same-project clients sharing the appData folder is the documented behavior, but verify with a spike before committing: web client + `files.list` on `spaces=appDataFolder` against an account that has a phone backup. If it turns out not to work, fallback is the phone uploading to a normal (visible) Drive folder, or Phase 1's manual upload remains the path.
- **OAuth verification.** `drive.appdata` triggers Google's app-verification flow for production use on a new web client; start the consent-screen process early since review can take days.
- **Static key + IV ships in the web bundle** (`VITE_SECRET_KEY`). This was already true; Drive sync doesn't make it worse, but note that backup encryption is effectively obfuscation. A future improvement is a user-derived key — flagged, not blocking.
- **Repo duplication.** Decide whether `countpesa-app/web-app` or `countpesa-web-app` is canonical before Phase 1 lands, so the fix isn't applied to a dead copy.

## 5. Rollout order

1. Phase 1 (chunked decryption + upsert) — unblocks all users immediately, including those who never grant Drive access.
2. Spike: confirm web client can list the phone's appData file.
3. Phase 2 behind a simple feature flag; manual upload remains as fallback.
