# Validation results

**2.3.0 · 23 November 2026**

## Syncex release

The release owner confirms that live mode and continuous backup are working on the configured installation. This is manual acceptance, not a claim that every crash/restart or app-upgrade scenario was automated. The release builder reruns all five public suites against sanitized files, checks imports and compilation, and creates file/archive SHA-256 checksums. Historical validation results below retain their original scope and dates.

## Native live connection (2.3.0-preview.1)

The current public suite contains 85 tests: the previous 61 checks, 13 relay tests and 11 startup-readiness/connection tests. Native-pipe tests use unique disposable names. Account/launch sequencing and registry writes are mocked; the suite never opens a real app or writes live histories.

The installed desktop's unmodified IPC client and framing code passed a separate disposable-pipe test: two initializations, owner discovery, a stream broadcast and exactly one synthetic follower action. This test did not invoke a model or any desktop tool. Read-only native verification found the existing current-account app window with standard privileges. The supported protocol hash is computed from original ASAR bytes.

A cross-account synthetic test was skipped because no saved second-account credential was available. No password was requested or captured by validation. Actual two-account desktop startup, deep-link navigation, follower display, approvals and crash/relaunch persistence remain interactive acceptance checks. The native-client test does not establish those outcomes.

## Live mode (2.2.0-preview.1)

- 13 public synthetic tests cover raw-journal append/restart, partial records, source rewrites, interrupted commit recovery, corruption retention, large records, source containment, profile isolation, role parsing/PID reuse, cancellation and the final process gate.
- 11 private integration tests use disposable databases with the installed schemas. They cover open-app checkpoints, automatic copies in both directions, active replies, divergent histories, unknown process ownership, checkpoint reuse across restart, history regression, retry chains, pending recovery and controlled/cancelled handover.
- Tk controls were constructed and exercised for rendering, pending-review results and the main launcher entry. A read-only native probe matched timestamped roles to running Windows processes and preserved copies of the current task's raw records in a separate validation folder.
- The real Windows apps were not stopped or relaunched by validation. Cross-account password entry, two-window submission races, receiver reopen during an import, Windows restart, disk-full recovery and crash/relaunch acceptance remain interactive checks. Role logs are observations, not proof of exclusive execution. The native IPC protocol is not used or modified.

## Standard-user launch and automatic setup (2.1.0-preview.1)

All **48 automated checks passed**: 21 public history/process/summary/launch-bridge checks and 27 new launch/setup regressions. The six obsolete elevation/runas launch tests were replaced by the bridge and new standard-user launch tests. New checks cover credential failures and zeroing, optional persistence, no-prompt operation, elevated/current/other accounts, suspended-process rejection, no UAC fallback, account/path validation, preserving existing users/custom homes, ACL backup failure, partial ACL reports and changed setup requests. Account creation and real permission changes are mocked.

Native Windows verification passed for current account/token discovery, local-account to Windows-profile mapping, executable discovery, a synthetic Credential Manager write/read/delete round trip, and a suspended standard-user launch of whoami.exe. The synthetic record was removed. Desktop ACL merging and repeated application were also checked on a disposable, never-visible desktop with a synthetic SID; it was closed after the check. No active desktop permissions were changed. Automatic setup and main-window widgets were constructed; the retained manual route and account labels were checked. No real password was entered or saved. No ChatGPT app was opened or closed, and no live account, ACL, configuration or history was changed by these checks.

The sandbox could not access Python 3.14 temporary directories; the isolated suite was rerun outside it successfully. The public package is compiled and checked again by the release builder. Actual UAC acceptance/cancellation, new-user creation, cross-account interactive launches, installer completion and ChatGPT sign-in need an interactive acceptance run. Saved-credential launch is supported within an existing Windows session; this is not a boot-time login service.

## Account button validation (preview.6)

The Tkinter window was constructed with isolated configuration. Both displayed Windows account names were checked against the profiles passed to the launch function; reversing the configured profile order refreshed both labels and targets correctly. The account-button row fits the minimum window width for this installation. App launching was intercepted; neither live app was opened or closed.

The release builder compiles the distributed Python sources, runs the existing 26 public checks against the sanitized package, imports the generic entry point, and writes file/archive checksums. The history and Windows launch implementations are unchanged.

## Process-owner wait validation (preview.5)

All **63 checks passed** for this update: 26 public checks and 37 isolated workflow regressions covering two-way sync, project updates, conflict presets and owner-wait cancellation/resumption. The public suite includes ten new checks for protected children, unknown roots, failed token lookup, exited processes, missing parents, parent cycles, guarded writes, cancellation, resumption and a reopening app during the quiet interval.

Process enumeration was also read directly on the current Windows installation. Owner-query failure is simulated in automated checks; no user app was closed to force an interactive lifecycle test. The broader history validation below is retained from preview.4. Live profile histories were not modified during this update.

## Merged-history capture validation (preview.4)

All **101 automated checks passed**: 85 private isolated regressions (the previous 81 history/configuration checks plus four storage regressions) and 16 public smoke/launch/summary checks.

Four new regressions reproduce the standalone-storage bug, verify capture of the current history rows, synchronize renamed/pinned merged tasks in both directions, retain the real index-mismatch guard, and roll back an interrupted copy. They fail with the previous capture path and pass with the fix.

The affected real task was also copied into disposable profiles. Ordinary sync then copied its newer history successfully, retained all 101 active turns and 972 indexed items, and a repeated sync found no changes. Live transcript hashes were unchanged. No live history was imported or rewritten by these checks.

The public suite now contains 16 checks, including three checks that preserve a pending copy's error and direction without reusing an obsolete failure after a successful retry or direction change. Native app-server rendering/index rebuilding was not repeated; the fix changes snapshot selection and reporting, not transcript generation.

## Reopen fix validation (preview.3)

All 13 public checks pass: the seven existing smoke tests and six new launch checks. The launch checks simulate normal opening, error-740 fallback, another launch error, Windows prompt cancellation, the other-account password console, and a missing executable. Process creation and Windows ShellExecute are mocked; this validation does not open or close either user's desktop app. An actual interactive reopen remains to be verified on the affected installation.

The release builder compiles the distributed Python sources, runs these 13 checks against the sanitized package, imports the generic launcher and writes file/archive checksums. The history engine is unchanged. The broader 88-check and native-history results below are retained from preview.2; those suites were not repeated for this launcher-only fix.

## Previous history validation (preview.2)

Verified on Windows with Python **3.14.6** and the app-server bundled with desktop app **26.908.70816**. All database imports and history rewrites below ran against disposable profile copies or synthetic fixtures. Live profile histories were not modified.

## Automated regression checks

| Suite | Passing checks |
| --- | ---: |
| Live history import and targeted recovery | 10 |
| Combined history/project synchronization | 7 |
| Linked retry history | 7 |
| Latest-history comparison and two-way orchestration | 17 |
| Explicit branch selection and backups | 10 |
| Selection, rewritten histories, imported files and configuration | 19 |
| Global/task policies and chronological message resolution | 11 |
| Public synthetic smoke tests included in the release | 7 |
| **Total** | **88** |

The rewrite tests cover shared-turn deduplication, ordering, both divergent answers, retry parents, late completions assigned to their original turn, an absent receiving task, stale previews, changed originals, corrupted backups or attachments, running-app refusal, cancellation, database rollback and resuming after only one side commits.

The hidden-window GUI check exercised scanning, selection, filtering, merge preview, saved global/per-task policy controls and delegation of other-user credentials to Windows runas. Account-name resolution was also checked against the configured Windows users. No password was captured or saved.

Policy tests cover default deferral, per-task precedence and inheritance, persistence bound to the configured homes, latest message activity versus renamed metadata, equal-time refusal, interleaved user/assistant messages, unselected-task preservation, cancellation with a retained proposal, project refresh and reopening only after import.

## Native history checks

| Scenario | Result |
| --- | --- |
| Independent synthetic branches plus an external context note | Both profiles expose 4 turns and 7 items. |
| Same synthetic history after deleting its history index and rebuilding through native resume | All expected turns and items remain readable. |
| Two different answers under the same original turn ID | Both profiles expose 4 turns and 9 items, including both answers, variant labels and an external note. The same message contents survive native index rebuilding. |
| Overlapping conversations resolved by the Combine preset | 5 chronological segments and 7 items. User and assistant messages interleave in the expected saved-time order in both native indexed history and rebuilt history. |
| A larger linked-retry history on disposable copies | 29 original turns and 1,826 items become 30 turns and 1,827 items after adding the provenance note. Both profiles return identical native history. Every original user/assistant message is retained; original tool and other item counts are unchanged. |

The larger history included 38 user messages, 146 assistant messages, 477 reasoning items, 399 command executions, 427 MCP calls, 104 web searches, 142 file changes, 10 compaction markers and 83 image views. Its two source copies were already equal; deliberately divergent histories were tested separately with synthetic fixtures.

The larger history also passed through the new message-timeline adapter: both profiles retained all original message hashes and item counts, plus the import note, and returned identical native history.

Native checks read the installed app-server's history and, for the synthetic rebuild checks, resume the isolated task without starting a model turn. No tools were replayed and no model answer was requested. Private raw reports and test fixtures are excluded from the distribution.

## Release checks and limits

For preview.2, the builder compiled every packaged Python file, ran the seven public smoke tests against the sanitized package, imported the generic entry point without local profile defaults, and created SHA-256 checksums. Only explicitly allowed source and documentation files are packaged.

The preview.2 ZIP was also extracted into a disposable directory. Its distributed code completed a prescan, saved Combine policy, automatic divergent merge, two-profile import and selected project refresh using generic profile labels. All 28 archive entries matched the allowlist, all file/archive checksums passed, and the archive scan found none of the checked local identities, private paths or task identifiers.

These results verify the tested storage format and native reader. They do not establish compatibility with every future app version, guarantee an objectively correct order for contradictory histories, or replace a visual desktop reopen check on the receiving installation. Generic account creation, interactive password entry and ChatGPT sign-in remain user-operated Windows/app flows.

The release remains a preview. Completed rewrites retain original backups; recovery of an interrupted import and resumption of a partially applied proposal are tested. There is no general one-click undo for a completed rewrite.
