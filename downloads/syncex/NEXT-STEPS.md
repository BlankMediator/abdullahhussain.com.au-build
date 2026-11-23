# Upgrade and acceptance checks

Syncex 2.3.0 retains the working live relay and continuous backup. The release owner confirmed these on the configured two-account installation on 23 November 2026.

After installing on another PC or upgrading the desktop app:

1. Verify the download using [VERIFY.md](VERIFY.md), extract it, and review the two profile paths in Setup.
2. Connect a disposable task and confirm the chosen execution account, follower updates and preserved bytes/checkpoints.
3. Finish a reply, close the receiving app, wait for **Saved in both**, then reopen and inspect the saved history. Repeat in the reverse direction.
4. Exercise approvals, interruption, follower reconnect and an owner switch after finishing replies.
5. Verify recovery after a stopped launcher or Windows restart. Restart Live mode manually; Syncex is not a boot-time service.

The protocol hash gate intentionally refuses unknown desktop builds. Keep independent backups and review conflicts or regressed histories before restoration. Automatic pruning, unattended restoration and hot takeover during a reply are not implemented.
