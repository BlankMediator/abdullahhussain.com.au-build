# Static Hosting

QuantBot now has a static build for the repository docs. It publishes a browsable project site with `README.md`, `docs/*.md`, the workflow map, and the local Control Room command.

Static hosting cannot run the Python API server, backtests, downloads, or the live Control Room. Use this route for documentation and use `quantbot serve` locally or on a real server for the interactive dashboard.

## Local Build

```powershell
python -B scripts\build_pages_site.py --out _site
python -B -m http.server 8020 --directory _site
```

Open `http://127.0.0.1:8020/` after the server starts.

## Static Deployment

The workflow at `.github/workflows/pages.yml` builds `_site` and deploys it with the repository host's official static-site actions:

- `actions/configure-pages@v5`
- `actions/upload-pages-artifact@v4`
- `actions/deploy-pages@v4`

After this branch is pushed, enable the repository's static-site deployment source. Future pushes to `main` deploy the site automatically, and the workflow can also be run manually.

The repository host's custom workflow reference is linked from the deployment settings.

## Published Files

The static artifact contains:

- `index.html` and static assets from `pages/`
- `README.md`
- every Markdown file under `docs/`
- `docs-manifest.json`
- `.nojekyll`

The generated `_site/` directory is local build output and should not be committed.
