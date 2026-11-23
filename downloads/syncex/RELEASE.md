# Release and publication

**Syncex 2.3.0 · 23 November 2026**

The portable release includes the native live relay, continuous backup watcher, controlled two-app startup, automatic/manual setup, conflict tools and recovery. The release owner confirms working live operation and backup on the configured installation. Runtime and compatibility limits are documented in [README.md](README.md) and [LIVE-MODE.md](LIVE-MODE.md).

## Build

On Windows with Python 3.11+ and Tkinter (verified with Python 3.14.6):

```powershell
python build_release.py
python verify_release.py release/Syncex-2.3.0.zip
```

The builder sanitizes an explicit file allowlist, compiles the Python sources, runs all five public test suites against the sanitized package, checks clean imports, and writes deterministic ZIP entries. Output: `release/Syncex-2.3.0.zip`, its `.zip.sha256` sidecar and `release/SHA256SUMS.txt`. The archive contains both JSON and standard text checksums for every distributed source/document file.

Tests use disposable synthetic data. No real app is stopped, launched or modified. See [VALIDATION.md](VALIDATION.md) for the scope of previous native checks and manual acceptance.

## Publish

Repository: <https://github.com/BlankMediator/Syncex>. Release tag: `v2.3.0`.

Publish only the sanitized files extracted from the verified archive as repository source. Attach the ZIP, `.zip.sha256` and `SHA256SUMS.txt` to the release. Hash the exact final ZIP and use that value on the project website. SHA-256 checksums verify byte integrity; they are not signing-key signatures or Windows Authenticode signatures.

Never publish an installed working directory: local configuration, credentials, histories, imported files, snapshots, databases, shortcuts, source backups and private reports are excluded. Rebuilding does not upload anything. No open-source license has been selected for this release.
