# CLI Command Reference

[Back to Documentation Contents](docs/CONTENTS.md#cli-reference) | [Runbook](docs/RUNBOOK.md) | [Config Reference](docs/CONFIG.md) | [Python Module Reference](docs/PYTHON_REFERENCE.md)

This page documents every `quantbot` command exposed by the current CLI. The same commands can be run from a real terminal or from the browser Control Room CLI page.

Installed entry point:

```bash
quantbot --help
```

No-install module form:

```bash
python -B -m quantbot.cli --help
```

## Command Logging

Every CLI invocation is logged as a CLI job unless `QUANTBOT_SUPPRESS_CLI_JOB_LOG=1` is set. Terminal commands use source `cli`; browser-entered commands use source `gui_cli`.

The logs are:

```text
logs/cli_usage.jsonl
logs/cli_jobs.jsonl
logs/cli_output/<job_id>.txt
```

Use `quantbot cli-usage` for the concise command history and `quantbot cli-jobs --show <job_id>` when you need captured stdout/stderr.

## Data Download Commands

### `download-yfinance`

Downloads public daily OHLCV Yahoo Finance data into the QuantBot CSV schema.

```bash
quantbot download-yfinance \
  --tickers AAPL,MSFT,NVDA \
  --start 2020-01-01 \
  --end 2024-12-31 \
  --output-root data/yfinance
```

Options:

| Option | Meaning |
|---|---|
| `--tickers` | Comma-separated tickers. |
| `--ticker-group` | Built-in ticker shortcut. Can be repeated. |
| `--settings` | YAML settings file path or name under `configs/downloads/`. |
| `--save-settings` | Save the resolved settings after the download. |
| `--output-root` | Destination data bundle folder. |
| `--start`, `--end` | Download date range. |
| `--sector-map-csv` | Optional `ticker,sector,country` CSV. |

Output includes `prices.csv`, schema support files, and `download_manifest.json`.

### `download-yfinance-rich`

Downloads OHLCV plus optional Yahoo actions, fundamentals, earnings, analyst, profile, holder, and options tables.

```bash
quantbot download-yfinance-rich \
  --ticker-group magnificent7 \
  --start 2020-01-01 \
  --end 2024-12-31 \
  --output-root data/yfinance \
  --include-actions \
  --include-fundamentals \
  --include-earnings \
  --include-analysts \
  --include-profile
```

Additional rich options:

| Option | Meaning |
|---|---|
| `--statement-lag-days` | Conservative lag before statement-derived fundamentals are usable in a backtest. Default is `45`. |
| `--max-option-expiries` | Maximum option expiries to snapshot. |
| `--include-actions`, `--no-include-actions` | Include or skip corporate actions. |
| `--include-fundamentals`, `--no-include-fundamentals` | Include or skip fundamentals. |
| `--include-earnings`, `--no-include-earnings` | Include or skip earnings fields. |
| `--include-analysts`, `--no-include-analysts` | Include or skip analyst event fields. |
| `--include-profile`, `--no-include-profile` | Include or skip company profile fields. |
| `--include-holders`, `--no-include-holders` | Include or skip holder snapshots. |
| `--include-options`, `--no-include-options` | Include or skip options snapshots. |

Shared options are the same as `download-yfinance`.

### `ticker-groups`

Lists built-in ticker shortcut groups.

```bash
quantbot ticker-groups
```

Use these names with `--ticker-group`, for example:

```bash
quantbot download-yfinance --ticker-group fang --start 2020-01-01 --end 2024-12-31
```

### `download-settings list`

Lists saved YAML download presets.

```bash
quantbot download-settings list
```

Saved settings live under `configs/downloads/`.

### `download-settings show`

Prints one saved download preset.

```bash
quantbot download-settings show default-yfinance
```

### `download-settings save`

Copies a YAML mapping into the download settings folder.

```bash
quantbot download-settings save my-download --from-file path/to/download.yaml
```

You can also save resolved settings directly from a download with `--save-settings`.

## ASX Commands

### `asx-universe list`

Lists ASX analysis groups, including the overall universe, penny-watch list, miners, healthcare, others, tech, top caps, metal groups, and optional sector groups.

```bash
quantbot asx-universe list
```

Use this before downloading to see which Yahoo `.AX` tickers each group resolves to.

### `asx-universe metadata`

Prints the ASX metadata table, or writes metadata CSVs when `--out` is supplied.

```bash
quantbot asx-universe metadata
quantbot asx-universe metadata --out data/asx_yfinance
```

With `--out`, the command writes:

```text
asx_universe.csv
asx_sector_map.csv
```

### `download-asx-yfinance`

Downloads ASX Yahoo Finance data and writes the normal QuantBot data schema plus ASX metadata.

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

Options:

| Option | Meaning |
|---|---|
| `--group` | ASX group to download. Default is `overall`. |
| `--output-root` | Destination data bundle. Default is `data/asx_yfinance`. |
| `--start`, `--end` | Yahoo download date range. |
| `--include-fundamentals`, `--no-include-fundamentals` | Include or skip Yahoo statement/profile-derived fundamentals. |
| `--include-earnings`, `--no-include-earnings` | Include or skip Yahoo earnings rows. |
| `--include-analysts`, `--no-include-analysts` | Include or skip Yahoo analyst rows. |
| `--include-holders`, `--no-include-holders` | Include or skip holder snapshots. |
| `--include-options`, `--no-include-options` | Include or skip options snapshots. |

The command writes `download_manifest.json` with usable downloaded tickers and skipped tickers.

### `asx-analysis`

Builds ASX segment bundles, trains alpha ICs separately for each segment, and cross-tests every trained alpha model against every target segment.

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

Options:

| Option | Meaning |
|---|---|
| `--data-root` | Source ASX data bundle. |
| `--out-root` | Destination analysis folder. |
| `--config-dir` | Destination generated config folder. |
| `--base-config` | Base config used for defaults. |
| `--start`, `--end` | Analysis window. |
| `--penny-price` | Latest-close penny threshold. Default is `1.0`. |
| `--include-metals`, `--no-include-metals` | Include or skip metal-specific groups. |
| `--include-sectors`, `--no-include-sectors` | Include or skip sector groups. |
| `--cross-evaluate`, `--no-cross-evaluate` | Write or skip train-target cross-alpha matrix. |
| `--full-backtests`, `--no-full-backtests` | Also run full portfolio backtests for segment training runs. Default is off. |

Important outputs:

```text
runs/<analysis>/asx_segments.csv
runs/<analysis>/train_summary.csv
runs/<analysis>/learned_alpha_ics.csv
runs/<analysis>/cross_alpha_matrix.csv
runs/<analysis>/cross_alpha_mean_alpha_ic.csv
runs/<analysis>/cross_alpha_annualized_alpha_spread.csv
runs/<analysis>/cross_alpha_alpha_hit_rate.csv
```

See the [ASX Analysis Guide](docs/ASX_ANALYSIS.md) for the methodology, metric definitions, and final analysis notes.

## Config Commands

### `configs list`

Lists YAML configs under `configs/`.

```bash
quantbot configs list
```

### `configs show`

Prints a config file.

```bash
quantbot configs show default
quantbot configs show configs/default.yaml
```

Names without a suffix resolve to `configs/<name>.yaml`.

### `configs validate`

Loads a config through the typed config loader and reports whether it is valid.

```bash
quantbot configs validate configs/default.yaml
```

Unknown future keys are warned about where the loader supports forward compatibility.

### `configs save`

Saves a YAML mapping under `configs/` and validates it.

```bash
quantbot configs save research-test --from-file path/to/config.yaml
```

The path must stay under `configs/`.

## Data Inspection Commands

### `data-bundles`

Lists folders under `data/`, newest first.

```bash
quantbot data-bundles
quantbot data-bundles --data-dir data
```

The table shows modified time, CSV count, and whether `download_manifest.json` exists.

### `data-files`

Lists CSV files in one data bundle, including rows, columns, and bytes.

```bash
quantbot data-files --bundle yfinance
quantbot data-files --bundle data/yfinance --show-manifest
```

`--show-manifest` prints the download manifest after the file table.

### `data-columns`

Lists columns, inferred dtypes, non-null counts, and sample values for a CSV in a data bundle.

```bash
quantbot data-columns --bundle yfinance --file prices.csv
```

Use `--sample-rows` to control how many rows are scanned for non-null counts and samples.

### `data-preview`

Prints the first rows of a CSV in a data bundle.

```bash
quantbot data-preview --bundle yfinance --file fundamentals.csv --rows 10
```

The preview intentionally caps displayed columns so wide files remain readable.

### `import-csv`

Converts local CSV files into the QuantBot data schema.

```bash
quantbot import-csv \
  --prices-csv path/to/prices.csv \
  --output-root data/my_bundle
```

Options:

| Option | Meaning |
|---|---|
| `--prices-csv` | Required OHLCV CSV with at least `date,ticker,close,volume`. |
| `--output-root` | Destination data bundle folder. |
| `--fundamentals-csv` | Optional fundamentals CSV with `date,ticker` or `date,sid` plus factor columns. |
| `--vendor-csv` | Optional vendor signal CSV with `date,ticker` or `raw_entity` plus `alt_sentiment_raw`. |

## Backtest And Run Commands

### `backtest`

Runs the full pipeline: load data, audit data, build signals, forecast alpha, estimate risk, optimize, simulate execution, analyze performance, and write run logs.

```bash
quantbot backtest --config configs/default.yaml
```

Options:

| Option | Meaning |
|---|---|
| `--config` | YAML config path. Default is `configs/default.yaml`. |
| `--base-dir` | Project base directory. Default is current directory. |
| `--out` | Output folder. If omitted, writes a timestamped `runs/cli_YYYYMMDD_HHMMSS` folder. |

When `--out` is omitted, the CLI writes a unique timestamped run folder. When `--out` is supplied, that exact folder is used.

### `inspect-run`

Prints a saved run summary and lists generated log files.

```bash
quantbot inspect-run --run runs/yfinance
```

This is the fastest CLI command for checking whether a run completed and what logs it wrote.

### `runs`

Lists saved run folders.

```bash
quantbot runs
quantbot runs --runs-dir runs
```

The table shows modified time, whether `summary.csv` exists, and how many datasets are available.

### `run-datasets`

Lists CSV datasets generated by one run.

```bash
quantbot run-datasets --run runs/yfinance
```

This includes top-level CSVs and full variable CSVs under `logs/variables/`.

### `run-files`

Lists every file under one run folder.

```bash
quantbot run-files --run runs/yfinance
```

Use this when you need the complete artifact inventory.

### `run-config`

Prints the resolved config saved with a run.

```bash
quantbot run-config --run runs/yfinance
quantbot run-config --run runs/yfinance --flatten
```

`--flatten` converts nested YAML into a key/value/type table for quick inspection.

### `run-columns`

Lists columns for a saved run dataset.

```bash
quantbot run-columns \
  --run runs/yfinance \
  --dataset logs/variables/optimizer_inputs_outputs.csv
```

Use `--sample-rows` to control sample scanning.

### `run-preview`

Prints the first rows of a saved run dataset.

```bash
quantbot run-preview \
  --run runs/yfinance \
  --dataset equity_curve.csv \
  --rows 20
```

### `chart-run`

Exports an SVG chart from a saved run dataset.

```bash
quantbot chart-run \
  --run runs/yfinance \
  --dataset equity_curve.csv \
  --x date \
  --y portfolio_value \
  --y benchmark_value \
  --chart line \
  --out runs/yfinance/equity_curve.svg
```

Options:

| Option | Meaning |
|---|---|
| `--dataset` | Run CSV path relative to the run folder. |
| `--x` | X-axis column. |
| `--y` | Y-axis column. Can be repeated or comma-separated. |
| `--filter` | Row filter in `key=value` form. Can be repeated. |
| `--chart` | `line`, `scatter`, or `bar`. |
| `--out` | SVG output path. |
| `--width`, `--height` | SVG dimensions. |

## Browser GUI Command

### `serve`

Starts the browser Control Room.

```bash
quantbot serve --host 127.0.0.1 --port 8000
```

LAN mode:

```bash
quantbot serve --host 0.0.0.0 --port 8000
```

Options:

| Option | Meaning |
|---|---|
| `--host` | Bind address. Use `127.0.0.1` for local-only or `0.0.0.0` for LAN. |
| `--port` | HTTP port. Default is `8000`. |
| `--base-dir` | Project base directory exposed to the GUI APIs. |

The Control Room includes Config, Data, Backtest, Runs, Jobs, CLI, and Docs pages.

## Docs Commands

### `docs list`

Lists `README.md` and Markdown files under `docs/`.

```bash
quantbot docs list
```

### `docs show`

Prints one allowed doc file.

```bash
quantbot docs show docs/CLI_REFERENCE.md
quantbot docs show README.md
```

The command only reads `README.md` and `docs/*.md`.

### `docs export`

Exports the full documentation set from the CLI.

ZIP bundle:

```bash
quantbot docs export --format zip --out quantbot-docs.zip
```

Standalone offline browser page:

```bash
quantbot docs export --format offline-html --out quantbot-offline-docs.html
```

Options:

| Option | Meaning |
|---|---|
| `--format zip` | Writes a ZIP containing `README.md`, every `docs/*.md`, and `offline_docs.html`. This is the default. |
| `--format offline-html` | Writes one self-contained HTML docs browser that can be opened from disk without the QuantBot server. |
| `--out` | Destination file. Defaults to `quantbot-docs.zip` or `quantbot-offline-docs.html`. |

## Job And Usage Commands

### `jobs`

Lists recent CLI/background jobs.

```bash
quantbot jobs --limit 30
```

This is a compact job table with ID, kind, status, command, and message.

### `cli-usage`

Lists recent command invocations from `logs/cli_usage.jsonl`.

```bash
quantbot cli-usage --limit 50
```

Use it to audit what was run from the terminal or browser CLI.

### `cli-jobs`

Lists CLI jobs or prints the captured output for one job.

```bash
quantbot cli-jobs --limit 30
quantbot cli-jobs --show cli-abc123def456
```

`--show` prints job metadata and the captured stdout/stderr tail.

## Common Recipes

Download a saved preset:

```bash
quantbot download-yfinance-rich --settings default-yfinance
```

Download a shortcut basket and save it as a preset:

```bash
quantbot download-yfinance-rich \
  --ticker-group sp500_core \
  --start 2020-01-01 \
  --end 2024-12-31 \
  --output-root data/yfinance \
  --save-settings sp500-core-2020-2024
```

Run and inspect:

```bash
quantbot backtest --config configs/default.yaml
quantbot runs
quantbot inspect-run --run runs/cli_YYYYMMDD_HHMMSS
quantbot run-config --run runs/cli_YYYYMMDD_HHMMSS --flatten
```

Read docs from the terminal:

```bash
quantbot docs list
quantbot docs show docs/CONTENTS.md
quantbot docs export --format offline-html --out quantbot-offline-docs.html
```

Audit CLI activity:

```bash
quantbot cli-usage --limit 20
quantbot cli-jobs --limit 20
```
