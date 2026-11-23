# User guide

## Open an app under the intended account

Each **Open as COMPUTER\user** button names the Windows account it requests. The profile labels above the buttons show which saved profile belongs to each account. Use **Automatic setup** or **Manual setup** to change a profile: its Windows account, .codex folder and executable stay together. Saving setup refreshes the button labels and launch targets.

Both app-opening buttons require standard privileges. The account helper loads the target Windows profile and environment, and the app receives its configured CODEX_HOME. If that account already has an elevated app open, quit it before reopening here. There is no UAC fallback for app launches.

Use **Windows passwords** to enter a password for either account, including the current user. Selecting Save stores it in the current Windows user’s Credential Manager. Forget removes only this utility’s credential for that account. Passwords are not written to shared configuration, arguments or reports. A Windows password changes identity; administrator-only setup still requires Windows approval. See [setup](SETUP.md) for automatic preparation and sign-in.

## Scan and selection

The prescan reads project tables, saved assignments, task rows and local search catalogs from both profiles. It is read-only and does not read every transcript. Detailed comparison happens when syncing or preparing a merge.

Identity is the persistent task ID, not its title. Independent tasks with the same name remain separate. Selecting a project includes its metadata and current tasks. To sync its listing alone, select the project and then exclude its tasks. Selecting a task alone includes its associated project metadata if that option is enabled. Supporting-agent tasks follow their parent as a linked group.

Selection is stored in selection.local.json. New tasks require selection after a refresh. Filtering the list does not deselect hidden rows. **Clear selection** clears both projects and tasks.

## Conflict presets

Choose **When histories conflict** in the main window:

| Preset | What Sync does |
| --- | --- |
| Decide later | Leaves both copies unchanged and lists the unresolved task. This is the initial default. |
| Use latest version | Backs up both versions, then applies the branch with the newest saved conversation activity. Unique work from the other branch remains in its backup. |
| Combine messages chronologically | Backs up both versions and prepares a combined message timeline. After both apps exit, it applies the prepared histories to both profiles and can reopen them. |

For exceptions, highlight one or more tasks, click **Set policy for highlighted tasks…**, choose a policy and save. **Use global default** removes an override. The task list shows the effective policy; saving a policy does not start a sync.

Presets apply only to included tasks that are ready conflicts. They are captured at the start of a run. No additional per-conflict review dialog is required. Active or changing histories still defer; new conflicts that arise during a run are reported for the next sync.

“Latest” compares recorded message/tool activity across the task and its supporting group. It does not use filesystem modification times or a title rename. Equal or absent activity times leave the conflict unresolved. A chosen branch must contain the supporting-task group; missing supporting work is not silently removed.

“Combine” retains shared identical turns once and keeps divergent variants. It orders visible user/assistant messages by their native saved timestamps, with tool/item records carried alongside them. Overlapping original turns can become several consecutive timeline segments. Dependencies within a turn stay ordered; equal/missing times use a stable fallback and appear as ordering notes. If an indivisible item-update interval prevents separate message ordering, that task is deferred rather than misrepresented as fully chronological.

The report says **Resolved**, **Decide later**, or explains why a preset could not resolve a task. If you stop while it waits for app exit, prepared proposals and backups remain available through **Resume prepared merge…**. Originals are never deleted by conflict resolution.

## Ordinary two-way sync

The program follows each selected task's linked retry history, compares both complete task/supporting-agent groups, and copies a branch only when it contains the other history or has a compatible newer indexed/metadata state. A newer timestamp does not override genuinely different messages.

Sources and receivers are checked again before committing. Active replies, changed files, incompatible schemas and inconsistent indexes are deferred. Unselected tasks are not imported, and unrelated projects are not pulled in merely because a task was selected.

History-only runs can leave both apps open. Keep affected tasks idle; restart a receiver if its UI shows cached messages. The utility does not force-kill apps or make concurrent writes to the same task safe.

Project/search updates wait for each receiving app to fully exit, one at a time. Project listings/roots, assignments, names, catalog entries and session-index entries are merged while preserving the receiving account and unrelated settings. The reopen option then launches each receiver.

## Choose a branch

Highlight a conflict and click **Choose one branch…**. Compare the recent messages and select **Back up both and use [profile]**. Both branches and their linked files are pinned outside rotating caches before the selected version is applied. This action is history-only; run selected sync afterward for project/search metadata.

## Merge branches

Highlight a task and click **Merge / add text or files…**. The preview includes its supporting tasks, proposed turn order, profile provenance, excerpts and warnings.

- Each branch retains its turn sequence. A stable topological sort combines them; independent turns use start timestamps and a deterministic profile/ID tie-breaker.
- Identical turns with the same original turn ID and semantic record sequence are retained once. Different timestamps or stored ordinals alone do not create a different turn.
- Different contents under the same turn ID remain separate variants. Turn/item/call IDs are namespaced, and each variant receives an imported-variant label. Shared text inside different variants can repeat.
- Contradictory ordering constraints stop the rewrite. Missing/equal timestamps produce a warning. The preview does not offer arbitrary manual reordering; explicit branch choice remains available.
- Compaction resets are omitted from the combined model history so they cannot erase newly combined earlier messages. Full original files, including compaction records and hidden parent tails, remain in backups. Retaining complete history can increase context handled on the next turn.
- The tool creates a new paginated transcript and matching turn/item/projection rows, then changes the existing visible task's pointer. Original transcript files are not deleted.
- No model request is sent, no tool is replayed and no project source file is restored by merging history.

Tick the review confirmation and choose **Back up originals and prepare**. Preparation saves originals, attachments and the proposal without changing live task histories. You can apply it immediately or leave it prepared.

Application waits for both apps to quit. Each profile receives the same proposal through a separate guarded, journaled import. This is not a single transaction spanning both profiles: interruption can leave the first side updated and the second unchanged. Resume handles that state.

The rewrite adapter refuses realtime/audio entries, missing usable session/turn metadata, incompatible schemas and inconsistent indexes. Unsupported histories are not silently discarded. Ordinary copying or explicit branch choice may remain available.

## Add text and files

The editor also works on a task with no conflict. Added text becomes a clearly labelled **user context note added by Profile Sync**, timestamped at import. It is not attributed to an original user submission or a model-generated answer. No assistant reply is generated.

**Read text file…** inserts UTF-8 or UTF-8-with-BOM contents into the editable field. **Attach files…** copies individual files into the proposal's shared attachment directory, grouped by SHA-256. The note includes names, absolute paths and checksums.

These are local file references, not cloud uploads or reconstructed native upload chips. The tool does not OCR, parse or execute attachments. Codex may use accessible referenced files in subsequent work under its normal permissions. Existing attachment files elsewhere in old histories are not copied automatically; references into another user's temporary folder can remain inaccessible.

## Recovery

**Open reports and backups** opens the configured shared folder.

| Situation | Action |
| --- | --- |
| Stopped ordinary sync | Completed imports remain; run selected sync again. |
| Stopped after preparing a rewrite | Choose **Resume prepared merge…**, then rewrites/proposal-id/plan.json. |
| Interrupted database import | Use **Recover interrupted import** first. It checks before/after states and refuses to overwrite later work. |
| Only one profile received the rewrite | After any import recovery, resume the proposal. Already-applied content is recognized without duplicating the import note. |
| A profile changed after preview | Rescan and prepare a fresh proposal; the old plan is not forced over new messages. |
| Undo a completed rewrite | Original snapshots are retained, but this release has no general one-click undo. Restore a pinned snapshot with task-scoped validation while preserving newer work. Interrupted-import recovery is not general undo. |

Backups are not encrypted by this utility and can contain messages, tool outputs and task metadata. Protect the shared folder with Windows permissions. Permanent rewrite/conflict backups are not automatically pruned. Do not remove proposal folders while tasks reference their imported files.

## Troubleshooting

| Symptom | Next step |
| --- | --- |
| No tasks/projects | Check selected homes and initialize a first task in each app. |
| Launcher keeps waiting after window closes | Use Ctrl+Q; X may leave a process running. Verify actual Windows account names in Setup. |
| Access denied | Use Automatic setup → Verify both users, then Review / prepare setup for the selected folders. Manual setup remains available. |
| Windows cannot identify a ChatGPT process owner | Reopen the current launcher and retry. If the status requests it, quit BOTH Codex/ChatGPT apps with Ctrl+Q and leave the sync launcher open. It resumes once the processes exit; Stop retains completed copies. |
| Sync completes but an app does not reopen | Version 2.0.0-preview.3 retries current-user error 740 through Windows. Complete the Windows prompt if appropriate, or reopen the app manually under the intended account. Other launch failures remain in the report; completed sync does not need repeating. |
| Old messages remain visible | Reopen the receiver. For stale listings, run selected sync with projects/search enabled. |
| Different messages remain | Use explicit merge preview or branch choice; ordinary sync preserves conflicts. |
| History/index still being saved | Finish the reply, allow it to save, then rescan. |
| Previously merged task keeps saying its projection is ahead | Update to 2.0.0-preview.4 and reopen the launcher. This fixes capture of merged transcripts stored under a different history ID. Renaming or pinning does not change the task ID. |
| Still needs sync | The final check found a remaining update. Its direction and last failed copy reason are shown when available. Address that reason and rerun selected sync. |
| Schema mismatch | Update both apps to compatible versions; do not alter columns to bypass the check. |
| Imported file unavailable | Check the shared path still exists and the receiving Windows user can read it. |
| New tasks unchecked after refresh | Select them explicitly or use Include all scanned. |

This is on-demand synchronization of saved local history and project metadata. It does not provide perfect live synchronization, merge project source trees, manage cloud tasks, copy authentication or allow two active model sessions to share one mutable history safely.

## Connect both apps live

See [Live connection](LIVE-MODE.md). Choose a task to open in both apps, click Connect both apps live, finish replies, and quit both apps once while leaving the launcher open. The verified owner opens first, then the follower. Preserve only keeps the previous backup behavior. Live streaming and durable profile copies have separate status; saved-history copies continue to wait for a closed receiver.
