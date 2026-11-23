# Quick start

Open **Start Syncex.cmd**, or your existing **Sync Codex profiles** shortcut.

## Choose projects and tasks

1. Click **Scan / refresh**.
2. Click a project's **Include** box to select its metadata and currently scanned tasks.
3. Adjust individual task boxes. Highlight multiple rows to use **Include highlighted** or **Exclude highlighted**.
4. **Search** filters task names or IDs without changing the selection. **Include all scanned** includes the entire scan, including hidden rows.
5. Click **Sync selected both ways**.

Selections are saved locally. Refresh retains existing selections but excludes newly discovered tasks. Excluding a selected project's tasks does not uncheck its metadata selection.

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

## Ordinary copies with both apps open

Uncheck **Update selected projects and search**. Finish or stop replies in tasks being copied and keep those tasks idle. Active or changing tasks are deferred. The reopen checkbox applies after operations that wait for an app to exit; it does not force a restart during a history-only run.

For project/search changes, leave the option checked. Follow the status line to quit each receiving app with **Ctrl+Q**, one at a time. Keep the launcher open. It can reopen each receiver; Windows may request the other user's password.

## Combine different messages or add material

1. Highlight exactly one task and click **Merge / add text or files…**.
2. Review the proposed turn order, supporting tasks and separate variants.
3. Optionally enter text, read a UTF-8 text file, or attach files.
4. Tick the review confirmation and click **Back up originals and prepare**.
5. Choose whether to apply. If applying, quit both apps with **Ctrl+Q** and keep the launcher open.
6. Both profiles receive the same rewritten history and reopen if requested.

The merge action applies to the highlighted task even if its normal-sync Include box is unchecked. For automatic resolution during normal Sync, use the conflict presets above. This advanced editor remains available for individual review and added material.

To keep one version instead, highlight a task and use **Choose one branch…**. Compare recent messages, then select **Back up both and use [profile]**. Both full originals are retained, but only the chosen version becomes visible.

If stopped after preparing, use **Resume prepared merge…** and select that proposal's plan.json. If a database import was interrupted, first use **Recover interrupted import**, then resume the proposal.
