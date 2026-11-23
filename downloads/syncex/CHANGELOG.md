# Change log

## 2.3.0 — 23 November 2026

- Publish as **Syncex**, with a branded portable launcher and dedicated repository.
- Retain the working native live relay, continuous journals/checkpoints, conflict review and guarded history sync.
- Record release-owner confirmation of live operation and continuous backup; document panel/session lifetime and restart requirements.
- Preserve configuration, credential identifiers, shared backups and the previous launcher filename for upgrades.
- Add repeatable release packaging, SHA-256 manifests, archive verification and public download instructions.

## 2.3.0-preview.1 — 23 November 2026

- Add a version-gated native IPC relay, scoped to selected tasks and the configured Windows accounts.
- Add Connect both apps live, a task selector, owner verification before follower launch, and observed live status. Keep Preserve only for the previous watcher.
- Back up and remove the selected executable’s per-user RUNASADMIN flag; stop forcing RunAsInvoker into Chromium.
- Verify a visible standard-user window and record startup failures, including same-account launches.
- Test routing with synthetic clients, real disposable named pipes, and the installed native IPC client code. Full two-account desktop acceptance remains pending.

## 2.2.0-preview.1 — 23 November 2026

- Add a Live mode panel with five-second checks, Stop and account-labelled Switch controls for selected tasks.
- Preserve complete raw records during active replies, recover interrupted appends, and retain separate generations after rewrites.
- Save verified immutable completed-history checkpoints and automatically copy to closed receivers through the existing guarded importer.
- Detect regressed histories and conflicts without silently replacing either branch; unknown process ownership waits while preserving checkpoints.
- Observe native owner/follower logs with process/account/creation-time checks and observation times; roles do not authorize writes.
- A controlled switch waits for both apps to exit, verifies persistence, then launches the selected account without elevation. Streaming remains supplied by the desktop; no hot takeover or new IPC client is introduced.

## 2.1.0-preview.1 — 23 November 2026

- Require standard privileges for app launches. Remove the error-740 UAC fallback, use the target Windows environment and configured Codex home, and verify the new app token before execution.
- Add native Windows password entry for either profile, optional per-user Credential Manager storage, Forget, and a no-prompt launch option for future automation.
- Add Automatic setup: discover existing users, profile paths and apps; review preparation; create missing standard users and profiles; repair selected access with ACL backups; open official install/sign-in flows; verify both accounts. Keep Manual setup.
- Keep live-session ownership/handover as a separate next stage.

## 2.0.0-preview.6 — 23 November 2026

- App-opening buttons identify the configured Windows accounts instead of numbered profiles. Each button launches the profile whose account it displays, and saving Setup refreshes both labels and targets.
- App buttons have a separate row so the full account names leave room for search. Account selection continues to use the saved profile and its paths.

## 2.0.0-preview.5 — 23 November 2026

- Unreadable process owners now pause project/search updates and prepared merges instead of aborting the run. The launcher explains when both apps must close and continues checking until they exit or the user stops.
- Unknown processes conservatively block either profile; protected children still resolve through a verified app parent. No access checks are bypassed and no Windows permissions are changed.
- Recheck process exit after the quiet interval, preserve completed imports when stopped, and add process-detection/wait regression coverage.

## 2.0.0-preview.4 — 23 November 2026

- Capture standalone merged histories using their actual storage IDs, even when no parent history link exists. Previously, later updates to these tasks could be deferred by an incorrect transcript/index mismatch.
- Keep the last failed copy reason and direction visible when the final preview still finds an update to copy.
- Add bidirectional renamed/pinned merged-history, index-validation, rollback and summary regression coverage.

## 2.0.0-preview.3 — 23 November 2026

- Retry current-account app launches through Windows ShellExecute when direct process creation returns error 740 (elevation required).
- Preserve Windows prompt cancellation and other launch failures in the existing reopen report. Other-account launches continue to use the configured Windows account and interactive password console.
- Add six synthetic launch regression checks and update setup/troubleshooting documentation.

## 2.0.0-preview.2 — 23 November 2026

- Global conflict presets: decide later, use latest saved version, or combine messages chronologically.
- Per-task overrides, inherited defaults, saved settings and a visible policy column.
- Automatic conflict resolution from the normal Sync button, retaining original backups and cancellation/resume support.
- Message-level chronological segments for overlapping user/assistant exchanges, with native index rebuilding validation.
- Latest-version decisions use saved conversation activity; equal/missing times defer.
- Updated workflow documentation and clean release package.

## 2.0.0-preview.1 — 23 November 2026

- Read-only project/task prescan, search, explicit selection, bulk inclusion and local persistence.
- Selected project/search metadata updates, including projects associated with selected tasks.
- Generic two-Windows-profile setup, shared-folder selection, per-profile app paths, native account settings and sign-in guidance.
- Merge previews, original backups, branch-constrained chronological ordering, identical-turn deduplication and labelled divergent variants.
- Labelled user text, UTF-8 text-file imports and checksum-verified local file references.
- Prepared rewrite packages, guarded two-profile application, partial-application detection and resume.
- Existing ordinary live-history copies, staged project/search restarts, reopen option, branch choices and recovery retained.
- Generic publication documentation and an allowlisted distribution build excluding local data.

## Earlier local versions

Earlier work introduced per-task bidirectional comparison, linked retry histories, explicit branch choices, transactional imports and combined project/search repair. Legacy hook-based helpers are local migration artifacts and are not required by the new launcher.
