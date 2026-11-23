# Verify a Syncex download

Download `Syncex-2.3.0.zip` and `Syncex-2.3.0.zip.sha256` from the same [GitHub release](https://github.com/BlankMediator/Syncex/releases/tag/v2.3.0). Compare the SHA-256 with the value on [the project website](https://abdullahhussain.com.au/projects/syncex.html).

In PowerShell, from your download folder:

```powershell
$expected = ((Get-Content -Raw .\Syncex-2.3.0.zip.sha256).Trim() -split '\s+')[0]
$actual = (Get-FileHash .\Syncex-2.3.0.zip -Algorithm SHA256).Hash
if ($actual -ine $expected) { throw 'Checksum mismatch: do not use this download.' }
'SHA-256 matches.'
```

On Linux use `sha256sum -c Syncex-2.3.0.zip.sha256`. On macOS use `shasum -a 256 -c Syncex-2.3.0.zip.sha256`.

After extraction, `python verify_release.py` checks every bundled file against `SHA256SUMS.json`. From a trusted source checkout, `python verify_release.py path/to/Syncex-2.3.0.zip` also validates archive paths, exact contents and the adjacent checksum sidecar.

The website's local file verifier computes SHA-256 in your browser without uploading the file. A checksum detects a changed download when compared with a trusted expected value. It does not establish author identity like a digital signature from a signing key.
