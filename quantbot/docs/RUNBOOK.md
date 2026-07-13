# Quant Factor Bot Runbook

Related docs: [Documentation Contents](docs/CONTENTS.md), [CLI Command Reference](docs/CLI_REFERENCE.md), [ASX Analysis Guide](docs/ASX_ANALYSIS.md), [Architecture](docs/ARCHITECTURE.md), [Math Reference](docs/MATH.md), [Worked Examples](docs/WORKED_EXAMPLES.md), [Factor Math Guide](docs/FACTORS.md), [Config Reference](docs/CONFIG.md), [Glossary](docs/GLOSSARY.md).

## 1. Install

```bash
cd quant-factor-bot
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e ".[dev,real-data,qp]"
```

Windows PowerShell:

```powershell
cd D:\path\to\quant-factor-bot
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -e ".[dev,real-data,qp]"
```

Verify:

```bash
quantbot --help
python -c "import quantbot, pathlib; print(pathlib.Path(quantbot.__file__).resolve())"
```

For every available command and option, see the [CLI Command Reference](docs/CLI_REFERENCE.md).

## 2. Get Yahoo Finance data

```bash
quantbot download-yfinance \
  --tickers AAPL,MSFT,NVDA,AMZN,META,GOOGL,JPM,XOM,UNH,COST \
  --start 2020-01-01 \
  --end 2024-12-31 \
  --output-root data/yfinance
```

Optional sector map CSV:

```csv
ticker,sector,country
AAPL,Technology,US
MSFT,Technology,US
JPM,Financials,US
```

```bash
quantbot download-yfinance \
  --tickers AAPL,MSFT,JPM \
  --start 2020-01-01 \
  --end 2024-12-31 \
  --output-root data/yfinance \
  --sector-map-csv sector_map.csv
```

Saved settings and ticker shortcuts:

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

To save a future download preset from the CLI:

```bash
quantbot download-yfinance-rich \
  --ticker-group fang \
  --start 2020-01-01 \
  --end 2024-12-31 \
  --output-root data/yfinance \
  --save-settings my-fang-download
```

Downloaded folders include `download_manifest.json`, which records the settings, timestamps, downloaded tickers, and skipped tickers for the Data tab.

## 3. Run ASX segmented alpha analysis

The ASX workflow downloads Yahoo `.AX` symbols, writes ASX sector/theme/metal metadata, splits the data into research groups, trains alpha ICs separately for each group, and cross-tests every trained alpha model on every other group. Full details are in the [ASX Analysis Guide](docs/ASX_ANALYSIS.md).

List available ASX groups:

```bash
quantbot asx-universe list
```

Download ASX data:

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
```

Run the segment analysis:

```bash
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

Key outputs:

```text
runs/asx_alpha_analysis_final/asx_segments.csv
runs/asx_alpha_analysis_final/train_summary.csv
runs/asx_alpha_analysis_final/learned_alpha_ics.csv
runs/asx_alpha_analysis_final/cross_alpha_matrix.csv
runs/asx_alpha_analysis_final/cross_alpha_mean_alpha_ic.csv
runs/asx_alpha_analysis_final/cross_alpha_annualized_alpha_spread.csv
runs/asx_alpha_analysis_final/cross_alpha_alpha_hit_rate.csv
```

Use `--full-backtests` when you also want portfolio-level backtest folders for trained segments. The default ASX matrix is alpha/IC research so the pairwise train-target analysis can finish quickly.

## 4. Run the main benchmark-active strategy

```bash
quantbot backtest --config configs/default.yaml --out runs/yfinance
```

This is the default fair benchmark comparison mode. It starts from the equal-weight benchmark and lets the optimizer make bounded active deviations.

## 5. Compare all portfolio modes

```bash
quantbot backtest --config configs/default.yaml --out runs/benchmark_active
quantbot backtest --config configs/long_only.yaml --out runs/long_only
quantbot backtest --config configs/long_short.yaml --out runs/long_short
```

Mode meanings:

| Mode | Net exposure | Shorts? | Risk penalty |
|---|---:|---:|---|
| `benchmark_active` | 1.0 | No | Active risk, `(w-b)^\top \Sigma (w-b)` |
| `long_only` | 1.0 | No | Benchmark-relative active risk by default; set `long_only_benchmark_relative: false` for total risk |
| `long_short` | 0.0 by default | Yes | Total risk, `w^\top \Sigma w` |

## 6. Offline test fixture

The repo includes a tiny fixture only for tests and quick debugging:

```bash
quantbot backtest --config configs/test.yaml --out runs/test
```

## 7. Bring your own real CSV

```bash
quantbot import-csv \
  --prices-csv path/to/prices.csv \
  --output-root data/my_prices
```

Minimum price columns:

```csv
date,ticker,close,volume,sector,country
2022-01-03,AAPL,180.33,104487900,Technology,US
```

Then set `data.root: data/my_prices` in a config file and run:

```bash
quantbot backtest --config configs/my_config.yaml --out runs/my_run
```

## 8. Inspect run outputs

```bash
quantbot inspect-run --run runs/yfinance
```

Useful files:

```text
summary.csv                         # top-level metrics
equity_curve.csv                    # daily portfolio, no-cost, benchmark, and diagnostics
factor_summary.csv                  # factor IC/spread helped-or-hurt summary
factor_daily_report.csv             # daily factor IC and spread table
logs/run_manifest.json              # run ID, data files, dates, config path
logs/resolved_config.yaml           # exact config used
logs/data_manifest.csv              # row counts, hashes, date ranges
logs/calculation_trace.csv          # formula-level stats for variables
logs/variables/rolling_ic_estimates.csv
logs/variables/alpha_forecasts.csv
logs/variables/optimizer_inputs_outputs.csv
logs/variables/execution_costs_shortfall.csv
```

## 9. Important config knobs

```yaml
portfolio:
  mode: benchmark_active       # benchmark_active, long_only, long_short
  max_position_abs: 0.20
  max_turnover: 0.50
  active_gross_limit: 0.60
  active_weight_abs_limit: 0.10
  long_only_benchmark_relative: true

alpha:
  rolling_ic_enabled: true
  rolling_ic_lookback_days: 252
  rolling_ic_min_observations: 80
  rolling_ic_clip_abs: 0.08
  rolling_ic_weight: 0.75
  rolling_ic_min_abs: 0.005
  negative_ic_policy: zero   # allow, zero, or flip
```


### Why `long_only` may now look close to the benchmark

`long_only` now defaults to benchmark-relative risk and active-weight limits. That is intentional for small Yahoo Finance baskets: it tests whether the factors add value on top of the equal-weight basket instead of letting the QP hide in low-volatility names or cash-like exposures. Use `benchmark_active` for the cleanest benchmark comparison, and use `long_short` only when you want a market-neutral alpha test rather than a bull-market benchmark race.


## Solver warnings and numerical accuracy

If you previously saw messages like:

```text
UserWarning: Solution may be inaccurate. Try another solver...
```

that came from CVXPY/OSQP returning `optimal_inaccurate` on some rebalance QPs. The run can still write outputs, but those rebalance weights are less trustworthy. The default `solver: auto` now captures that warning, retries the QP with SciPy SLSQP, and logs the fallback instead of flooding the console.

Check solver behavior with:

```powershell
python - <<'PY'
import pandas as pd
df = pd.read_csv('runs/yfinance/equity_curve.csv')
print(df['optimizer_message'].value_counts().head(20))
PY
```

PowerShell-safe version:

```powershell
@'
import pandas as pd
df = pd.read_csv('runs/yfinance/equity_curve.csv')
print(df['optimizer_message'].value_counts().head(20))
'@ | python
```

To force the quieter fallback solver for every rebalance:

```yaml
portfolio:
  solver: scipy_slsqp_qp
```

To debug OSQP directly:

```yaml
portfolio:
  solver: cvxpy_osqp
  solver_verbose: true
  solver_max_iter: 10000
  solver_ftol: 0.000001
```

`cvxpy_osqp` is fastest but may warn on ill-conditioned small-universe covariance matrices. `scipy_slsqp_qp` is slower but often quieter for the small Yahoo Finance experiments in this repo.

## Browser Control Room

Start the GUI for local-only browser use:

```bash
quantbot serve --host 127.0.0.1 --port 8000
```

Start it for LAN use:

```bash
quantbot serve --host 0.0.0.0 --port 8000
```

Open the printed URL in a browser. If Windows Firewall prompts, allow private-network access for LAN clients.

The GUI pages are:

| Page | Purpose |
|---|---|
| Config | Load, edit, and save YAML config files under `configs/`. |
| Data | Download Yahoo Finance data, load/save download settings, apply ticker groups, and inspect downloaded CSV timestamps and manifests. |
| Backtest | Start timestamped GUI backtests. |
| Runs | Explore saved runs with native charts, CSV previews, and resolved config tables. |
| Jobs | Watch live progress with start/end/duration timestamps and pause, resume, or cancel running jobs. |
| CLI | Run `quantbot` commands through the browser and inspect usage history. |
| Docs | Read repository Markdown files with LaTeX-style math blocks, download the current Markdown file, download all docs as a ZIP, or save a standalone offline docs browser page. |

CLI usage is logged to:

```text
logs/cli_usage.jsonl
```

Both real terminal commands and browser CLI commands are logged. Browser commands are marked with source `gui_cli`.

Use the CLI to inspect the same history:

```bash
quantbot cli-usage --limit 50
quantbot cli-jobs --limit 50
quantbot cli-jobs --show <job_id>
```

Export docs without opening the browser:

```bash
quantbot docs export --format zip --out quantbot-docs.zip
quantbot docs export --format offline-html --out quantbot-offline-docs.html
```

## 10. Troubleshooting

`quantbot: command not found`:

```bash
python -m pip install -e ".[dev,real-data,qp]"
```

Virtualenv activation error:

```bash
python -m venv .venv
source .venv/bin/activate
```

Windows package path mismatch:

```powershell
where quantbot
python -c "import quantbot, pathlib; print(pathlib.Path(quantbot.__file__).resolve())"
```

Blank exports are prevented. If no rows can be produced, the bot raises a diagnostic error with skip counts.

Yahoo download network/cache notes:

- The downloader uses a temp yfinance cache under the system temp directory to avoid stale or locked SQLite cache files.
- If a browser download fails but the same command works in a real terminal, check how the GUI server was launched. A server started inside a restricted sandbox may not have normal internet access. Start it from the real terminal with `quantbot serve --host 0.0.0.0 --port 8000`.
- If Yahoo returns no price rows for every ticker, verify the date range, ticker spelling, network access, and that `end` is after `start`.

## Rich Yahoo Finance workflow

The recommended real-data path is now `download-yfinance-rich`. It downloads OHLCV plus richer Yahoo tables and converts them into the bot schema.

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

quantbot backtest --config configs/default.yaml --out runs/yfinance
quantbot inspect-run --run runs/yfinance
```

Optional slower/sparser snapshots:

```bash
quantbot download-yfinance-rich \
  --tickers AAPL,MSFT,NVDA,AMZN,META,GOOGL,JPM,XOM,UNH,COST \
  --start 2020-01-01 \
  --end 2024-12-31 \
  --output-root data/yfinance \
  --include-holders \
  --include-options \
  --max-option-expiries 2
```

The downloader writes:

```text
data/yfinance/prices.csv
data/yfinance/fundamentals.csv
data/yfinance/security_master.csv
data/yfinance/vendor_entities.csv
data/yfinance/entity_mapping.csv
data/yfinance/actions.csv
data/yfinance/profile.csv
data/yfinance/earnings.csv
data/yfinance/analyst_events.csv
data/yfinance/holders.csv
data/yfinance/options_snapshot.csv
```

`fundamentals.csv` is the table consumed by the backtest. It contains point-in-time-lagged rows with columns such as:

```text
book_to_price
profitability
earnings_yield
sales_to_price
fcf_yield
gross_margin
operating_margin
roe
roa
debt_to_equity
revenue_growth
earnings_growth
dividend_yield
earnings_surprise
eps_revision_score
target_price_upside
upgrade_downgrade_score
```

Financial statement rows are not used on the fiscal report date. The downloader applies a conservative lag:

```yaml
download-yfinance-rich --statement-lag-days 45
```

so a quarterly statement dated `2024-03-31` becomes usable from roughly `2024-05-15`. This is not perfect institutional point-in-time data, but it avoids the most obvious lookahead bug.

## Rich signal columns

The signal builder now creates price, volume, fundamental, earnings, analyst, and dividend factors:

```text
momentum_63d
momentum_126d
momentum_252d_skip_21d
vol_adjusted_momentum
moving_average_trend
drawdown_recovery
liquidity_change
value
quality
growth
earnings_revision
dividend_yield
alt_sentiment
```

The default alpha config uses these factors. The source of truth for a run is always:

```text
runs/<run>/logs/resolved_config.yaml
```

## Rich data troubleshooting

If `value`, `quality`, or `growth` are mostly zero, check:

```bash
python - <<'PY'
import pandas as pd
f = pd.read_csv('data/yfinance/fundamentals.csv')
print(f.head())
print(f.notna().mean().sort_values())
PY
```

If Yahoo returns sparse fundamentals, the bot will still run; missing values are neutralized after point-in-time merging. Sparse fundamentals can make price-based factors dominate the alpha model.

### Sparse Yahoo fundamental audit warnings

Yahoo's public endpoints often return partial financial statement, earnings, analyst, and ownership data. In rich Yahoo runs this is expected: `book_to_price`, `roe`, `earnings_surprise`, `target_price_upside`, and similar columns may be missing for many ticker/date rows.

The bot treats these columns as **optional sparse alpha inputs**. Required keys still fail loudly:

```text
date
sid
```

Optional factor columns are logged as warnings in:

```text
runs/<run>/logs/data_audit_findings.csv
```

but they no longer stop the backtest. Missing optional values are neutral-filled after the point-in-time as-of join, so sparse Yahoo coverage reduces alpha strength instead of crashing the run.

To inspect coverage:

```powershell
@'
import pandas as pd
f = pd.read_csv("data/yfinance/fundamentals.csv")
print(f.notna().mean().sort_values())
'@ | python
```
