# Set up two Codex windows on Windows

## Requirements

Use a Windows PC, Python 3.11+ with Tkinter, and a compatible desktop app installation. The two Windows accounts and Codex homes must be distinct. A local shared sync folder must be outside both homes. The same app executable may be used by both users. Python 3.14.6 is the verified runtime.

## Automatic setup

First launch opens Automatic setup. Existing installations can open it from the main window.

1. Review the detected Windows accounts, app executable and shared sync folder. Account names are resolved through Windows; the profile directory need not match the username.
2. Select existing accounts, or type the actual COMPUTER\name of a new local account. Enable **Allow creation of missing local Windows accounts as standard users** only when creation is intended. Existing users and passwords are preserved.
3. Keep **Use this account's Windows profile + .codex** selected for normal profile paths. Clear it for a custom home. Preparing setup initializes a missing Windows profile and uses the directory Windows actually assigns.
4. If an app is missing, **Get official app installer** opens the official Windows installation guide. Complete the official installer, then use **Detect installed app / paths** or Browse. This utility does not silently install an unverified executable.
5. Choose **Review / prepare setup**. Read the concrete account/folder/access plan. Windows may request administrator approval for this one-time preparation. For a missing account, a native password prompt collects its new Windows password. A standard user is created, not an administrator.
6. Preparation creates missing folders and grants Modify access to the selected shared folder and both selected Codex homes for the two selected users. It grants Read/Execute access to the utility, Python runtime and selected app files/resources. The two selected users also receive access to show and interact with app windows on the current Windows desktop. Existing access is preserved. Codex-home access includes existing sign-in material in those directories; credentials are not copied to another profile.
7. Use **Windows passwords** if future launches should use saved credentials. Select Save in the native prompt to store the chosen user's password in the launcher user's Windows Credential Manager. Either configured user can be selected, including the current user. Passwords are never stored in the shared folder or command arguments. Forget removes only this utility's saved entry for that account.
8. Use each profile's **Open / sign in** button. Complete ChatGPT sign-in inside that app, including MFA if requested. Send a first task in a new profile to create its history databases.
9. Choose **Verify both users**. It checks app/database presence and folder access by running under each Windows account. The file probes are removed; history bytes are not changed. A sign-in file being present does not prove a session remains valid, so confirm sign-in inside each app.
10. **Save and finish** returns to the main sync utility. Saving settings alone does not claim that sign-in or verification succeeded.

Preparation reports and ACL backups live under the launcher user's %LOCALAPPDATA%\CodexProfileSync\setup-reports. If a step fails, completed steps remain recorded. Fix the reported item and retry; existing users are not recreated or reset. System/profile roots and linked paths are refused for automatic permission changes. Manual setup remains available for custom/domain configurations and linked locations.

## Manual setup

**Manual setup** retains the original editor for profile labels, Windows accounts, Codex homes, app paths and shared sync folder. Its access check does not repair permissions. Existing Windows account settings and official app setup links remain available. Use automatic preparation when the selected local users or folder access need repair.

Changing the shared folder does not migrate old proposals, backups or imported attachments. Their absolute file references must remain accessible. The existing program folder may remain the shared folder.

## Opening apps without administrator privileges

Each **Open as COMPUTER\user** button identifies the requested Windows account. Current-user launches use the existing identity when it is not elevated. Another account, or an elevated current launcher, uses Windows sign-in through an account helper. The helper loads the intended user's environment and passes the saved CODEX_HOME to the app. Windows requires the selected account to have desktop access; setup prepares it, and the launcher can add missing desktop access after validating that account's password. If Windows refuses that change, open the utility from the user currently signed into the desktop.

The helper and new app must have non-elevated tokens. The app process starts suspended, is checked, and only then is allowed to execute. Before startup, the helper backs up and removes only the selected executable’s per-user RUNASADMIN compatibility flag, preserving other flags. It removes inherited compatibility overrides and does not force RunAsInvoker or change UAC policy. A visible standard-user window must be verified before success is reported. Launch reports are saved under launch-status/. There is no UAC fallback for app opening. An existing elevated app under that account must be quit before reopening normally here.

Windows password sign-in changes identity. UAC separately authorizes administrative operations. A saved password does not bypass UAC. Initial account/folder preparation may need approval, while ordinary configured launches can use saved credentials without another password prompt. Password expiry, account policy changes or a missing entry can require attention. A headless caller can set allow_prompt=False and receives a clear error instead of an interactive prompt.

Saved credentials belong to the Windows user who saved them. Set them separately if both Windows users will operate the launcher. This provides unattended launches within an existing Windows session; it does not log into Windows at boot, create a scheduled task, install a service, or bypass ChatGPT sign-in/MFA.

Windows may still deny cross-account process inspection. An unknown owner remains a sync blocker; quit both apps when requested and keep the sync utility open. Standard-user launching does not remove Windows account isolation.

## Configuration

profiles.local.json contains only names, accounts and paths. profiles.example.json is a generic template. CODEX_SYNC_CONFIG may point to a different configuration file. Keep local configuration, launch/setup reports and user-specific shortcuts out of distributions. Distribute the clean release ZIP only.

The existing history synchronization engine is unchanged. Native owner/follower display sharing does not independently persist the current task in both homes. See [next steps](NEXT-STEPS.md) for the live-session plan.
