# Directories and files

The paths below are placeholders. Public documentation does not list real user names, account identities, task names or project roots.

| Configured location | Purpose |
| --- | --- |
| Program folder | Python code, launcher and documentation extracted from the release. |
| profiles.local.json | Local account names, profile labels, Codex homes, app paths and shared-folder choice; excluded from releases. |
| CODEX_SYNC_CONFIG | Optional environment variable selecting another configuration file. |
| Shared sync folder | Reports, snapshots, imports, worker lock and attachments. An upgraded installation can keep using its program folder here. |
| Two Codex homes | Separate folders, commonly C:\Users\<user>\.codex. |
| Two app executable paths | Existing app installations to launch; they are not redistributed. |
| Project root directories | Referenced workspaces; their contents are not copied. |

## Profile data used

| Relative path | Use |
| --- | --- |
| sessions/**/*.jsonl | Active transcripts and linked retry segments. |
| archived_sessions/**/*.jsonl | Archived transcript locations when referenced. |
| state_5.sqlite | Tasks, active rollout pointers, projects, supporting-task edges and associated metadata. |
| thread_history_1.sqlite | Turns, items and projection byte offsets/ordinals. |
| sqlite/codex-dev.db | Local task names and search catalog. |
| .codex-global-state.json and .bak | Selected project lists/assignments and workspace labels; updated after receiver exit. |
| session_index.jsonl | Task names and update metadata. |

SQLite WAL/SHM sidecars belong to their databases. The utility uses SQLite snapshots and transactions instead of replacing live databases. Authentication files, tokens, plugin credentials and full app preferences are not copied.

## Shared folder layout

~~~text
<shared-folder>/
  selection.local.json
  conflict-policies.local.json
  one-time-sync/worker.lock
  profile-sync/
    <timestamp-id>/report.json
    latest-result.json
  live-sync/
    <timestamp-id>/
      journal.json
      before-rows.json
      after-rows.json
      before-files/...
  sidebar-repair/
    <timestamp-id>/before/...
    <timestamp-id>/report.json
    latest-result.json
  conflict-resolutions/
    <timestamp-id>/<task-id>/
      <profile-label>.zip
      <profile-label>.json
      choice.json
    <timestamp-id>/report.json
    latest-result.json
  rewrites/
    <proposal-id>/
      plan.json
      <profile-label>.zip
      <profile-label>.json
      prepared-for-<profile-label>.zip
      sessions/<year>/<month>/<day>/rollout-<date-time>-<storage-id>.jsonl
      attachments/<sha256>/<original-file-name>
  data/
    coordination.sqlite
    snapshots/<profile-label>/<task-id>/...
    chain-snapshots/<profile-label>/<task-id>/...
    scratch/<temporary-id>/...
~~~

conflict-policies.local.json stores the default policy and overrides keyed by task UUID, bound to the configured pair of homes. It contains no credentials and is excluded from releases.

plan.json records original fingerprints, prepared package hashes, backups, imported-file hashes, turn provenance and application status per profile. Select it to resume a proposal. If a task was absent in one profile, that absence is recorded rather than creating a misleading empty ZIP.

Scratch folders are bounded to the configured root and cleaned after use. Permanent rewrite and conflict backups are retained. Old installations may also contain legacy hook/setup reports and source backups; those are not part of a fresh distribution.

## Modules

| File | Responsibility |
| --- | --- |
| desktop_app.py | Main UI, scan/selection, merge/import dialogs and recovery. |
| profile_config.py | Validated configuration and the retained manual setup editor. |
| windows_launch.py | Standard-user launch, per-account helper and optional Windows Credential Manager passwords. |
| setup_support.py | Account/path discovery and reviewed administrator preparation. |
| setup_assistant.py | Automatic setup and password-management UI. |
| selection.py | Catalog prescan and selected-project filtering. |
| sync_profiles.py | Worker lock, orchestration and staged project/search updates. |
| sync_latest.py | Containment comparison and stale-data guards. |
| sync_live.py | Locked imports, database transactions and recovery. |
| history_chain.py | Retry-chain traversal, bounded parents and snapshots. |
| conflict_policy.py | Saved global/task policies, latest-activity selection and automatic resolution. |
| message_timeline.py | Chronological message/item segments and rebased history indexes. |
| merge_history.py | Turn ordering, variants, imported material, proposals and resume. |
| conflict_choices.py | Explicit branch choices and original backups. |
| repair_sidebar.py | App-owner detection and project/search updates. |
| handoff.py | Shared snapshot/database/file primitives from the earlier implementation. |

Setup reports and permission backups are saved beneath the launcher user’s %LOCALAPPDATA%\CodexProfileSync\setup-reports. Launch/helper reports are stored in launch-status beneath the shared sync folder. Neither contains passwords. Saved Windows passwords live only in Windows Credential Manager under CodexProfileSync/WindowsAccount/, scoped to the Windows user who saved them.

## Live connection additions

`live_bridge.py` contains the version-gated native IPC relay; `live_connection.py` coordinates startup. `live_bridge_tests.py` and `launch_readiness_tests.py` use synthetic messages and isolated launch checks. `launch-status/` contains per-launch reports and per-user compatibility backups; it is private and excluded from releases.
