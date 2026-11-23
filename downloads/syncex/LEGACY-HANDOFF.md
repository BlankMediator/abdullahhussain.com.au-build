# Legacy installation notes

Earlier local versions included hook-triggered snapshots and a separate offline handoff UI. The new launcher uses manual scans and explicit actions; no hooks are required, no continuous message sync is enabled, and the apps do not share one mutable Codex home.

Combined-sync shortcuts targeting sync_profiles.py open the new launcher. Older separate handoff/setup shortcuts may still invoke their legacy programs. Use the combined launcher for current work.

An upgraded local installation retains the original handoff.py so old hook trust hashes are not silently changed. Shared helpers are configured at runtime. If an old ownership hook blocks a task, review/remove that hook through its original setup and normal app settings before attempting concurrent ownership. This update does not unregister trusted hooks.

Legacy data is retained locally. The public package excludes old setup helpers, hooks, shortcuts and runtime artifacts. Configure a fresh release through Setup; it contains no personal account or profile directory.
