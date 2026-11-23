# Implementation and compatibility

## Configuration and ordinary imports

Exactly two profiles are configured. Labels identify reports and backups; Windows account names identify process owners and launch identities. Task identity is its persistent UUID. A visible task can point to a different storage UUID after a retry or merge. A merged transcript can use a separate storage UUID without a parent link; capture must still select history rows by that storage UUID. The legacy snapshot path is used only when every file has neither a parent link nor a separate storage identity.

Unreadable process owners are retained as possible matches for either profile. Protected app children can inherit a verified parent owner's identity; an unresolved root, missing parent or cycle stays a blocker. Wait loops explain when both apps must exit and permit cancellation. Write guards refuse an unknown process, and a quiet interval is followed by another process check.

Configuration is activated before scanning. Validation rejects duplicate/nested homes, a shared folder inside or containing a home, network shared-data paths, duplicate accounts and unsupported/credential fields. Use one shared configuration/installation against a given pair of homes.

Ordinary import:

1. Read both SQLite states and follow session_meta.history_base links.
2. Verify terminal task state, parent byte boundaries/ordinals and projection positions.
3. Compare complete groups; retain conflicts for review.
4. Capture and validate the snapshot against compared source data.
5. Exclusively lock receiving transcript files and save before-files/rows.
6. Begin the attached state/history/catalog transaction; recheck receiving rows, edges and indexes.
7. Write selected records, verify hashes/references, commit and complete the journal.

Pre-commit failures roll back. An uncertain commit remains recoverable through its journal. Recovery checks current state and refuses to replace later work. There is no claimed OS-crash-proof transaction across separate profile homes.

## Scope

The UI passes explicit scanned task IDs. An empty set means no tasks; the internal None option remains unscoped for legacy callers. Project scope includes explicit projects and selected tasks' associated projects. Supporting tasks follow the parent group. Filtering covers legacy project mappings, roots/labels and selected task assignments. Unselected task-order entries already in the receiver are preserved.

## Conflict policy orchestration

The normal sync runs a containment pass, then resolves ready selected conflicts using a captured policy snapshot. Per-task overrides beat the default. Later leaves both sides alone. Latest finds the maximum saved message/item timestamp and invokes the existing guarded branch-choice path; ties or missing timestamps defer. Both paths preserve source and target snapshots.

Combine prepares all selected proposals under the worker lock, waits for both apps to exit once, then applies each through the existing rewrite journals. The message timeline adapter runs on the prepared union, groups records at indexed item/update boundaries, and orders independent groups by native message timestamps. Within-turn dependencies remain edges in the ordering graph. Consecutive groups from one original turn become a segment; a split turn receives stable proposal-specific IDs. Raw records, indexed items, turn bounds and projection positions are rebased together and coverage is checked.

An indivisible interval containing differently timed messages is refused. Equal/missing times and clock reversals are reported rather than presented as certain chronology. A proposal records its ordering mode and segment provenance. Interrupted proposals use the existing resume path.

## Rewrite proposals

Both current groups are fingerprinted and complete originals pinned outside rotating caches. The merger reads each visible bounded chain, groups records by turn and builds a graph of per-branch sequence constraints. Identical same-ID turns share a node. A stable topological sort chooses independent nodes by timestamp and deterministic tie-breaker. Cycles are refused. Divergent same-ID turns receive separate IDs and provenance labels.

Record order within each turn is retained; stored ordinals and indexed offsets are rebased. Original indexed items are carried forward. Added notes have model-visible response records and native UI item-completion records, with no fabricated assistant answer. Compaction resets are omitted from the combined model history; originals remain backed up. Realtime/audio rewrites are currently refused.

A proposal creates a new canonical paginated rollout per task, matching indexes and destination-specific verified packages. Attachments are copied, hashed and referenced from labelled notes. Preparation rechecks both live fingerprints and does not change task histories.

Application requires both apps closed and imports each receiver independently through the existing journaled mechanism. The rewrite guard requires original backup and attachment checksums. Resume accepts only the original fingerprint or exact prepared history on each side; any new work requires a fresh preview.

## Compatibility boundary

The private on-disk format is not a stable public import API. This adapter is verified against desktop app 26.908.70816, its bundled native app-server and corresponding schemas. Table signatures, row columns, transcript identities and projection positions are checked. Unknown formats require an adapter update and native validation.

The official [app-server documentation](https://learn.chatgpt.com/docs/app-server) describes history operations and a model-history item injection endpoint. That does not guarantee desktop rendering or cloud synchronization of arbitrary local edits. This utility validates its local format independently.

Scan, copy and merge require no network access. Setup can open official documentation and the installed apps' sign-in flows.

## Standard-user launch and setup

The Windows launcher delegates another-account work to a helper using CreateProcessWithLogonW with LOGON_WITH_PROFILE and the target user’s environment. The helper verifies its account and non-elevated token. Before another-account startup, the parent validates the supplied password and merges any missing operational window-station/desktop rights for that account SID, preserving other ACL entries. Automatic preparation can establish those rights once for both selected users. These are session UI-object permissions, not machine elevation or a UAC policy change. App startup removes inherited compatibility overrides, backs up and removes only the selected executable’s per-user RUNASADMIN flag, and uses the configured CODEX_HOME. It creates the process suspended, checks its token, resumes it, and verifies a visible standard-user window before reporting success. Failed/elevated checks terminate that newly created suspended process. There is no ShellExecute elevation fallback for apps. Already elevated app instances belonging to the current helper account are rejected before reopening.

Native password buffers are cleared after use. Optional generic credentials use a dedicated CodexProfileSync/WindowsAccount/ target in the current Windows user’s Credential Manager. No credentials are placed in command arguments, profile configuration or launch reports. A headless caller can set allow_prompt=False; absent/invalid credentials then fail explicitly.

The automatic setup helper is a separate administrator operation. Its request hash binds the helper to the plan reviewed in the UI. It revalidates local accounts and paths, creates only missing standard users, initializes missing Windows profiles, and grants selected access to the two resolved user SIDs. Existing passwords, account membership and unrelated ACL entries are preserved. ICACLS backups precede permission changes; partial steps and command output are retained. System roots and linked paths are refused. Setup does not change UAC policy, install a privileged service or create a scheduled task.

Setup verification runs file/access probes as each target account. Sign-in-file presence is reported without reading credentials and is not proof of a valid ChatGPT session. Installation and ChatGPT sign-in remain official interactive flows opened from the assistant.

## Native live relay (2.3)

`live_connection.py` waits for both apps to exit, verifies saved history, starts `live_bridge.py`, launches the chosen owner on a selected task, discovers its native ownership, then opens the follower. `live_panel.py` distinguishes observed live attachment from history preservation.

The relay implements little-endian framed JSON over the desktop local named pipe. The first-instance flag prevents claiming an existing router. The DACL contains only SYSTEM and configured account SIDs; remote clients are rejected. Peer account, session, executable and standard token are checked. Cross-account traffic is limited to selected local task IDs and a versioned method allowlist; same-account traffic passes normally. Discovery and response IDs are bound to authenticated peers; requests are not replayed. Overlapped read/write operations and bounded queues prevent duplex deadlock and unbounded slow-client buffering. Message bodies are not logged.

The protocol bundle is checked against its original archive bytes, avoiding newline normalization during hashing. Unknown builds disable connection, not history preservation. The adapter is private and version-dependent. Native-client transport was tested on a disposable pipe; the release owner separately confirms working two-account live operation and continuous backup. Crash/restart and upgrade acceptance remain installation-specific.
