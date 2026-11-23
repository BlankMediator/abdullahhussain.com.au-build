# Syncex

Choose and synchronize local Codex tasks and project listings between two Windows user profiles. Different tasks can copy in opposite directions during the same run. Review divergent histories, combine their messages, keep one branch, or add labelled text and local file references.

**Version 2.3.0 · 23 November 2026**

**New: [Live connection](LIVE-MODE.md)** starts a native IPC relay before opening both apps. It connects live messages and outputs for selected tasks, verifies app windows and ownership, and retains the earlier history-preservation watcher. Live operation and continuous backup have been confirmed by the release owner on the configured two-account installation. Keep the live panel open to maintain the connection and preservation watcher.

This independent local utility is not an OpenAI product or an official cloud-sync feature. It works with two separate profile directories on one Windows PC; each app retains its own sign-in. The rewrite adapter targets the database and paginated transcript format verified with desktop app version **26.908.70816**. It refuses incompatible schemas and unsupported histories.

Download the portable ZIP from [GitHub Releases](https://github.com/BlankMediator/Syncex/releases/latest). Verify its [SHA-256 checksum](VERIFY.md) before extracting. This portable Python application needs Python with Tkinter; it does not bundle Python or the desktop app.

## Start here

1. Extract the distribution into a folder accessible to the intended Windows users.
2. Install Python 3.11+ with Tkinter, then double-click **Start Syncex.cmd**. Python 3.14.6 is the verified runtime.
3. Use **Automatic setup** to detect accounts, Windows profile paths and installed apps. Review preparation to create missing standard users, initialize profiles and repair selected folder access. **Manual setup** remains available. Open each app and complete its own sign-in.
4. Click **Scan / refresh** and select projects and/or tasks.
5. Set **When histories conflict** to **Decide later**, **Use latest version**, or **Combine messages chronologically**. Highlight tasks and use **Set policy for highlighted tasks…** for exceptions.
6. Click **Sync selected both ways**. Saved presets are applied without a separate review dialog for every conflict.

To upgrade, finish replies and close the sync launcher, then extract the release over the existing program files. Keep `profiles.local.json` and your shared data folder. Existing configuration, credentials and backups retain their original storage identifiers. The old launcher filename remains as a compatibility shortcut.

An existing installation can continue using its **Sync Codex profiles** shortcut. Close an older launcher before opening the updated one; its title includes 2.3.0.

| Action | Result | App restart |
| --- | --- | --- |
| Scan | Lists projects, tasks, profile presence and update times | None |
| Live mode | Connects native streams for selected tasks and preserves history | Initial connection needs both apps to exit once; persistent copies still wait for receiver exit |
| Selected history sync | Copies complete newer histories in the appropriate direction | Reopen if UI messages are stale |
| Selected projects/search | Also updates selected project listings, names and search | Each receiver exits in turn; optional reopen |
| Conflict presets | Leave for later, select the latest saved branch, or combine messages | Combine waits for both apps; optional reopen |
| Choose one branch | Backs up both versions and applies your chosen one | Reopen if the receiver shows cached messages |
| Merge / add text or files | Previews and prepares a combined task with optional imports | Both apps exit before applying; optional reopen |

Project selection includes its **currently scanned tasks**. Tasks can then be excluded individually. Project metadata can also be selected without its tasks. A selected task includes its supporting-agent group and associated project metadata when that option is enabled. New tasks discovered after a scan are not silently included.

The default conflict policy is **Decide later**. Task overrides take precedence over the global setting. “Latest” uses the newest saved conversation activity; equal or missing times remain unresolved. “Combine” orders visible user/assistant messages by their saved times and can split overlapping turns into chronological segments. Tool dependencies retain their order. Both originals are backed up before either resolving policy writes a history.

Shared identical turns appear once in a merge. Different versions of the same turn remain separate, labelled variants. Each branch keeps its sequence; independent turns use recorded start times. Missing/equal times and divergent variants are called out in the preview. Contradictory records cannot establish one objectively correct chronology.

## Documentation

- [Quick start](SYNC-NOW.md)
- [Setup and two-window operation](SETUP.md)
- [Live mode and account switching](LIVE-MODE.md)
- [Upgrade and acceptance checks](NEXT-STEPS.md)
- [Verify the download](VERIFY.md)
- [User guide and recovery](USER-GUIDE.md)
- [Directories and files](DIRECTORIES.md)
- [Implementation and compatibility](ARCHITECTURE.md)
- [Validation and publication](RELEASE.md)
- [Change log](CHANGELOG.md)
- [Legacy installation notes](LEGACY-HANDOFF.md)

The shared folder contains private task backups and imported files. Distribute only the clean release ZIP, never an installed working folder. Ordinary sync does not copy project source files, Git state, existing attachment files, credentials, account limits or cloud conversations.
