# Live connection and continuous backup

Version 2.3.0 adds a native desktop IPC relay for the two configured Windows accounts. Earlier Live mode only preserved saved records. **Connect both apps live** now starts a shared connection for live messages and outputs; **Preserve only** retains the earlier backup watcher.

## Connect

1. Reopen Syncex and confirm **2.3.0** in its title.
2. Scan and select tasks. Open **Start Live mode…**, then choose the task in **Open both apps on**. A task keeps its UUID when renamed or pinned.
3. Click **Connect both apps live**. The execution account defaults to the Windows account running the launcher. Use **Execute as COMPUTER\user** to choose the other account.
4. Finish current replies and quit BOTH apps with Ctrl+Q, keeping the launcher open. This one initial restart lets the relay create its pipe before either desktop app does. The launcher preserves and verifies selected saved histories first; conflicts pause setup for review.
5. The chosen execution app opens on the selected task. The launcher verifies its visible window and asks the native client to confirm task ownership before opening the second app. Enter the other Windows account password in the native dialog if requested. Optional saved credentials are managed through **Windows passwords**.
6. Wait for **Live connection active**. This requires both a native follower announcement for the selected task and an observed cross-account stream update. A process starting by itself is not proof of a live connection.
7. Keep the launcher panel open. Messages submitted through the following window go through the desktop's native owner; generation and tools run under that owner's account. Select the same task in both windows when switching among the included tasks. New tasks are not added automatically.

The initial task's owner is verified during startup. Other selected tasks use the desktop's own ownership discovery when opened; the launcher does not force ownership of every task. **Execute as** reconnects both apps after replies finish and both apps exit. Stop or close ends the relay and preservation; it does not kill either app. Finish replies before stopping or switching. Hot takeover during an active reply is not provided.

## Live display and saved history

Live display uses the apps' native owner/follower protocol. The relay routes stream events and native follower requests, including submissions, approvals and interruptions, only for selected local task IDs between the configured accounts. It does not replay prompts or tools. Same-account desktop traffic retains its ordinary routing.

Persistent profile copies are separate: raw records are preserved while replies run, completed histories get verified checkpoints, and imports wait until the receiving app closes. A live follower display does not mean both profile databases already contain the reply. Finish the reply, quit the receiving app and wait for **Saved in both** before reopening it when durable copies are needed.

| Display | Meaning |
| --- | --- |
| Relay running; waiting to observe follower updates | The relay is listening, but native mirroring of the chosen task has not yet been verified. Check details if it persists. |
| Live connection active | The chosen task has announced a follower and the relay observed a cross-account update from its startup owner. It is an observation, not a guarantee against later disconnects. |
| Preserved bytes | Complete raw transcript records in recovery journals, including records saved during a reply. |
| Checkpoint | Completed, validated history saved in an immutable snapshot ZIP. |
| Pending | An active reply, open receiver, incomplete index or stated error prevents copying. |
| Saved in both | A fresh comparison found equivalent saved history in both profiles at the displayed time. |
| Review conflict | Both sides changed independently; use the existing merge/branch controls. |
| Last reported role | Timestamped log evidence, which may be stale and never authorizes database writes. |

## Startup failures

Every launch records success or failure under `launch-status/`. Success requires a visible app window belonging to the expected Windows account with standard privileges. Startup exit codes and window timeouts are displayed instead of silently reporting success. A clean handoff to an existing same-account window is accepted for ordinary app-opening buttons.

Before starting an app, the launcher backs up and removes only that executable's **per-user RUNASADMIN** compatibility flag. Other flags remain. It no longer forces RunAsInvoker into Chromium's environment. Machine-wide elevation settings are not changed, and neither app receives administrator privileges. Windows administrator membership alone does not make a normal process elevated.

The unknown-process-owner message is a saved-history write guard. Windows can deny inspection of sandboxed or cross-user processes. Verified app parents resolve protected children where possible; unresolved roots still block imports until they exit. This is independent of pinning or renaming. The relay does not need to overwrite an open profile to show live updates.

## Storage and recovery

**Open live backups** opens `shared-folder/live-mode/<configuration-id>/`. It contains `journals/`, immutable `checkpoints/`, `checkpoints.json` and the latest timestamped `status.json`. Records are bound to the configured homes and accounts. Shortened or rewritten sources retain earlier generations and pause for review. No automatic pruning or unattended restoration of a regressed history is performed.

The relay stores operational counters and identities, not streamed message bodies. Existing history backups do contain private task content and remain excluded from the release ZIP. No credentials, source working directories or Git changes are synchronized.

## Compatibility and validation

This relay uses a private desktop IPC protocol, not an official OpenAI synchronization API. It checks the exact installed protocol-bundle SHA-256 before connecting and refuses unknown builds. Preserve only remains available. The pipe permits only the two configured account SIDs and SYSTEM, rejects remote clients, and checks client session/account/executable and standard privilege. It does not patch the desktop app or change machine-wide UAC policy.

Automated tests cover routing scope, framing, duplicate-router refusal, startup sequencing and failure reporting. The installed desktop's native IPC client code also passed initialization, owner discovery, streaming and one synthetic action through a disposable relay. The release owner reports working two-account live operation and continuous backup on the configured installation. This is a manual confirmation, separate from the automated suite. Windows restart, crash/relaunch, disk-full and upgrade scenarios remain acceptance checks for each installation; retain independent backups.

The documented [app-server API](https://learn.chatgpt.com/docs/app-server) is a separate option for custom clients. This relay does not attach an unrelated app-server process to the desktop or assume that unsubscribing transfers ownership.

## Continuous operation

The relay and preservation watcher continue while the live panel and Windows session remain running. Syncex does not install a Windows service or automatically start after reboot. Start Live mode again after restarting Windows or stopping the panel. **Preserve only** runs continuous backup without the live relay. New tasks require a new scan and explicit selection.
