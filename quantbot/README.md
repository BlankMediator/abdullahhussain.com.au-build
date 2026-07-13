# Quant Factor Bot

Codex-ready educational multifactor quant trading system modeled on a production quant-dev pipeline:

```text
data -> audits -> point-in-time matching -> signals -> alpha -> risk -> constrained QP -> execution costs -> performance -> run logs
```

The default workflow uses Yahoo Finance data. Synthetic demo-data generation has been removed. A tiny committed fixture under `data/test_fixture/` is kept only for tests and offline smoke runs.

## Install

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e ".[dev,real-data,qp]"
```

Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -e ".[dev,real-data,qp]"
```

No-install fallback:

```bash
PYTHONPATH=src python -m quantbot.cli --help
```

## Yahoo Finance Workflow

```bash
quantbot download-yfinance \
  --tickers AAPL,MSFT,NVDA,AMZN,META,GOOGL,JPM,XOM,UNH,COST \
  --start 2020-01-01 \
  --end 2024-12-31 \
  --output-root data/yfinance

quantbot backtest \
  --config configs/default.yaml \
  --out runs/yfinance

quantbot inspect-run --run runs/yfinance
```

The richer downloader adds actions, fundamentals, earnings, analyst, profile, holder, and option snapshot tables when requested:

```bash
quantbot download-yfinance-rich \
  --tickers AAPL,MSFT,NVDA,AMZN,META,GOOGL,JPM,XOM,UNH,COST \
  --start 2020-01-01 \
  --end 2024-12-31 \
  --output-root data/yfinance \
  --include-actions \
  --include-fundamentals \
  --include-earnings \
  --include-analysts \
  --include-profile
```

Saved download settings and ticker shortcuts are available from both the CLI and the browser GUI:

```bash
quantbot ticker-groups
quantbot download-settings list
quantbot download-settings show default-yfinance

quantbot download-yfinance-rich \
  --settings default-yfinance \
  --ticker-group magnificent7 \
  --start 2020-01-01 \
  --end 2024-12-31 \
  --output-root data/yfinance
```

Each download writes a `download_manifest.json` next to the downloaded CSV files with the tickers, date range, options, timestamps, downloaded tickers, and skipped tickers.

## ASX Segmented Alpha Analysis

QuantBot includes an ASX research workflow for downloading `.AX` Yahoo Finance data, splitting it into analysis groups, training alpha ICs separately for each group, and cross-testing every trained alpha model against every other group.

```bash
quantbot download-asx-yfinance \
  --group overall \
  --start 2020-01-01 \
  --end 2026-07-03 \
  --output-root data/asx_yfinance \
  --include-fundamentals \
  --no-include-earnings \
  --no-include-analysts \
  --no-include-holders \
  --no-include-options

quantbot asx-analysis \
  --data-root data/asx_yfinance \
  --out-root runs/asx_alpha_analysis_final \
  --config-dir configs/asx_alpha_final \
  --start 2023-01-01 \
  --end 2026-07-03 \
  --no-include-sectors \
  --include-metals \
  --cross-evaluate
```

The implemented groups cover the requested analyses: penny stocks, miners, metals such as lithium/copper/gold/iron ore/uranium, healthcare, others, tech, top caps, and overall. Results are written to `runs/asx_alpha_analysis_final/`, including `train_summary.csv` and `cross_alpha_matrix.csv`. See [ASX Analysis Guide](docs/ASX_ANALYSIS.md) for the methodology, output files, metric definitions, and final analysis summary.

## ASX REIT Backtests

The ASX REIT workflow uses the official ASX listed-company CSV, filters to `Equity Real Estate Investment Trusts (REITs)`, downloads Yahoo `.AX` data, runs a full REIT backtest, then builds and backtests an equal-weight low-covariance REIT basket.

```bash
python -B scripts/asx_reit_backtests.py

python -B -m quantbot.cli backtest \
  --config configs/asx_reits/all_reits.yaml \
  --out runs/asx_reits_all

python -B -m quantbot.cli backtest \
  --config configs/asx_reits/low_cov_reits.yaml \
  --out runs/asx_reits_low_cov
```

The final comparison is written to `runs/asx_reits_analysis/reit_backtest_comparison.csv`. See [ASX REIT Backtests](docs/ASX_REIT_BACKTESTS.md) for the universe source, selected low-covariance basket, run outputs, caveats, and result interpretation.

## US REIT Backtests

The US REIT workflow uses Nasdaq screener metadata, filters to US rows classified as `Real Estate Investment Trusts`, excludes preferred/notes/unit-style securities, downloads Yahoo data, runs a full REIT backtest, then builds and backtests an equal-weight low-covariance REIT basket.

```bash
python -B scripts/us_reit_backtests.py

python -B -m quantbot.cli backtest \
  --config configs/us_reits/all_reits.yaml \
  --out runs/us_reits_all

python -B -m quantbot.cli backtest \
  --config configs/us_reits/low_cov_reits.yaml \
  --out runs/us_reits_low_cov
```

The final comparison is written to `runs/us_reits_analysis/reit_backtest_comparison.csv`. See [US REIT Backtests](docs/US_REIT_BACKTESTS.md) for the universe source, selected low-covariance basket, run outputs, caveats, and result interpretation.

## Optional Macro Regime Factors

QuantBot can also consume a hand-supplied `data/yfinance/macro.csv` for inflation-targeting style experiments. This is inspired by the RBA factor-model framing of real and nominal common macro factors, CPI target gaps, and common volatility; it is optional and disabled in the default Yahoo workflow.

Set `signals.macro_enabled: true`, keep a release lag with `signals.macro_asof_lag_days`, and add non-zero alpha weights for `macro_inflation_defensive`, `macro_policy_pressure_defensive`, or `macro_real_activity_trend`. See [Factor Math Guide](docs/FACTORS.md#macro-regime-factors) for the expected macro columns and formulas.

## Browser Control Room

Serve the project UI locally:

```bash
quantbot serve --host 127.0.0.1 --port 8000
```

Serve it to other devices on the LAN:

```bash
quantbot serve --host 0.0.0.0 --port 8000
```

The Control Room includes:

- Config editing with YAML round-tripping.
- Yahoo Finance basic and rich downloads.
- Saved download settings and ticker-group shortcuts.
- Downloaded data inventory with file timestamps and settings.
- Timestamped GUI and CLI run names, such as `runs/gui_YYYYMMDD_HHMMSS` and `runs/cli_YYYYMMDD_HHMMSS`.
- Live job progress with start/end/duration timestamps plus pause, resume, and cancel controls.
- Native run dashboard charts and tables.
- Built-in CLI input/output and CLI usage history from `logs/cli_usage.jsonl`.
- Docs tab for reading repository Markdown with LaTeX-style math blocks, downloading individual Markdown files, downloading a docs ZIP, or saving a standalone offline docs browser page.

## Static Site

Build the static documentation site locally:

```powershell
python -B scripts\build_pages_site.py --out _site
python -B -m http.server 8020 --directory _site
```

The static site publishes the README, docs, workflow map, and local Control Room command. It does not run the Python API, downloads, backtests, or live dashboard. See [Static Hosting](docs/GITHUB_PAGES.md) for deployment details.

## Offline Test Fixture

```bash
quantbot backtest \
  --config configs/test.yaml \
  --out runs/test_fixture
```

This uses the small CSV fixture committed in `data/test_fixture/`. It exists for tests and debugging only.

## Portfolio Modes

The default `configs/default.yaml` uses `benchmark_active`, which is the fairest comparison against the equal-weight benchmark. `long_only` is benchmark-relative by default as well: it remains fully invested and long-only, but its risk penalty and active limits are measured versus the equal-weight benchmark so it cannot hide in a low-volatility or cash-like portfolio. `long_short` is a market-neutral alpha test and should not be expected to keep up with a bull-market long-only benchmark.

Small-universe rolling IC estimates are noisy, so the default configs include IC safety gating:

```yaml
alpha:
  rolling_ic_min_abs: 0.005
  negative_ic_policy: zero  # allow, zero, or flip
portfolio:
  long_only_benchmark_relative: true
```

## Solver Warning Handling

The optimizer uses `solver: auto` by default. If CVXPY/OSQP returns `optimal_inaccurate`, the bot captures the CVXPY warning, retries the same QP with SciPy SLSQP, and records the fallback in `optimizer_message` inside `equity_curve.csv` and `logs/variables/optimizer_inputs_outputs.csv`.

To avoid CVXPY entirely:

```yaml
portfolio:
  solver: scipy_slsqp_qp
```

To debug CVXPY directly:

```yaml
portfolio:
  solver: cvxpy_osqp
  solver_verbose: true
```

## Output Files

Each run writes:

```text
runs/<name>/equity_curve.csv
runs/<name>/summary.csv
runs/<name>/signals_snapshot.csv
runs/<name>/logs/run_manifest.json
runs/<name>/logs/resolved_config.yaml
runs/<name>/logs/data_manifest.csv
runs/<name>/logs/data_audit_findings.csv
runs/<name>/logs/calculation_trace.csv
runs/<name>/logs/skip_reasons.json
runs/<name>/logs/variables/signals_full.csv
runs/<name>/logs/variables/alpha_forecasts.csv
runs/<name>/logs/variables/risk_exposures.csv
runs/<name>/logs/variables/risk_factor_covariance.csv
runs/<name>/logs/variables/risk_asset_covariance.csv
runs/<name>/logs/variables/risk_specific_variance.csv
runs/<name>/logs/variables/optimizer_inputs_outputs.csv
runs/<name>/logs/variables/execution_costs_shortfall.csv
runs/<name>/logs/variables/backtest_results.csv
```

`calculation_trace.csv` contains the formula, block, row count, null count, mean, standard deviation, min, percentiles, max, and sample values for each tracked variable. The `logs/variables/*.csv` files contain the full per-row results used to produce the final backtest.

## Docs

- [`docs/CONTENTS.md`](docs/CONTENTS.md) - browsable documentation contents with links to major sections.
- [`docs/CLI_REFERENCE.md`](docs/CLI_REFERENCE.md) - every `quantbot` CLI command with options, explanations, and recipes.
- [`docs/GITHUB_PAGES.md`](docs/GITHUB_PAGES.md) - static hosting build and deployment workflow.
- [`docs/ASX_ANALYSIS.md`](docs/ASX_ANALYSIS.md) - ASX segmented alpha workflow, groups, commands, outputs, and analysis summary.
- [`docs/MATH.md`](docs/MATH.md) - LaTeX equations for every block and variable.
- [`docs/FACTORS.md`](docs/FACTORS.md) - factor-by-factor formulas, source data, direction, and caveats.
- [`docs/WORKED_EXAMPLES.md`](docs/WORKED_EXAMPLES.md) - numeric worked examples for every unique displayed equation.
- [`docs/CONFIG.md`](docs/CONFIG.md) - every config YAML section and key explained.
- [`docs/GLOSSARY.md`](docs/GLOSSARY.md) - definitions for quant, backtest, optimizer, and data terms.
- [`docs/PYTHON_REFERENCE.md`](docs/PYTHON_REFERENCE.md) - per-module documentation for every Python file under `src/quantbot`.
- [`docs/RUNBOOK.md`](docs/RUNBOOK.md) - installation, commands, Yahoo Finance workflow, browser GUI, CSV import workflow, logs, and troubleshooting.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) - system architecture and extension points.
- [`docs/VIDEO_BLUEPRINT.md`](docs/VIDEO_BLUEPRINT.md) - transcript-derived source blueprint for the project.

Docs can also be exported from the CLI:

```bash
quantbot docs export --format zip --out quantbot-docs.zip
quantbot docs export --format offline-html --out quantbot-offline-docs.html
```

## Tests

```bash
PYTHONPATH=src pytest -q
```

The tests use `data/test_fixture/`; they do not download data or generate synthetic data.

## Important Note

This is an educational scaffold, not investment advice and not a live-trading system. Yahoo Finance data is convenient for development, but it is not a substitute for institutional point-in-time market, corporate-action, fundamentals, or survivorship-bias-controlled data.
