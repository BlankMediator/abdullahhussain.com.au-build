# Python Module Reference

This reference documents every `.py` file under `src/quantbot`, including subdirectories. It is meant to answer three practical questions for each module: what it owns, what it exposes, and what to be careful about when changing it.

Related docs: [Documentation Contents](docs/CONTENTS.md), [Architecture](docs/ARCHITECTURE.md), [Factor Math Guide](docs/FACTORS.md), [Math Reference](docs/MATH.md), [Worked Examples](docs/WORKED_EXAMPLES.md), [Config Reference](docs/CONFIG.md), [Glossary](docs/GLOSSARY.md).

## Jump To Module

- [`src/quantbot/__init__.py`](#srcquantbotinitpy)
- [`src/quantbot/config.py`](#srcquantbotconfigpy)
- [`src/quantbot/asx.py`](#srcquantbotasxpy)
- [`src/quantbot/asx_analysis.py`](#srcquantbotasxanalysispy)
- [`src/quantbot/cli.py`](#srcquantbotclipy)
- [`src/quantbot/cli_jobs.py`](#srcquantbotclijobspy)
- [`src/quantbot/download_settings.py`](#srcquantbotdownloadsettingspy)
- [`src/quantbot/run_paths.py`](#srcquantbotrunpathspy)
- [`src/quantbot/ticker_groups.py`](#srcquantbottickergroupspy)
- [`src/quantbot/usage_log.py`](#srcquantbotusagelogpy)
- [`src/quantbot/run_logging.py`](#srcquantbotrunloggingpy)
- [`src/quantbot/visualize.py`](#srcquantbotvisualizepy)
- [`src/quantbot/web.py`](#srcquantbotwebpy)
- [`src/quantbot/data/loader.py`](#srcquantbotdataloaderpy)
- [`src/quantbot/data/audit.py`](#srcquantbotdataauditpy)
- [`src/quantbot/data/security_master.py`](#srcquantbotdatasecuritymasterpy)
- [`src/quantbot/data/real_data.py`](#srcquantbotdatarealdatapy)
- [`src/quantbot/factors/signals.py`](#srcquantbotfactorssignalspy)
- [`src/quantbot/factors/alpha.py`](#srcquantbotfactorsalphapy)
- [`src/quantbot/risk/model.py`](#srcquantbotriskmodelpy)
- [`src/quantbot/portfolio/optimizer.py`](#srcquantbotportfoliooptimizerpy)
- [`src/quantbot/execution/simulator.py`](#srcquantbotexecutionsimulatorpy)
- [`src/quantbot/analysis/performance.py`](#srcquantbotanalysisperformancepy)
- [`src/quantbot/analysis/factor_report.py`](#srcquantbotanalysisfactorreportpy)
- [`src/quantbot/backtest/engine.py`](#srcquantbotbacktestenginepy)
- [`src/quantbot/utils/logging.py`](#srcquantbotutilsloggingpy)

## Module Map

| File | Role |
|---|---|
| `src/quantbot/__init__.py` | Package marker and version export. |
| `src/quantbot/asx.py` | ASX universe metadata, grouping, and Yahoo download wrapper. |
| `src/quantbot/asx_analysis.py` | ASX segment bundle creation, separate alpha IC training, and cross-alpha evaluation. |
| `src/quantbot/cli.py` | Main command-line interface and command dispatch. |
| `src/quantbot/cli_jobs.py` | JSONL job log for real CLI commands. |
| `src/quantbot/config.py` | Immutable config dataclasses and YAML loader. |
| `src/quantbot/download_settings.py` | Saved download settings and data download manifests. |
| `src/quantbot/run_logging.py` | Backtest reproducibility logs, manifests, formulas, and variable CSVs. |
| `src/quantbot/run_paths.py` | Timestamped run folder naming. |
| `src/quantbot/ticker_groups.py` | Built-in ticker shortcut groups. |
| `src/quantbot/usage_log.py` | CLI usage audit log. |
| `src/quantbot/visualize.py` | Offline run dashboard and SVG chart export. |
| `src/quantbot/web.py` | LAN-served browser Control Room and JSON API. |
| `src/quantbot/analysis/factor_report.py` | Per-factor daily IC/spread reports. |
| `src/quantbot/analysis/performance.py` | Portfolio, active, no-cost, and tax-adjusted summary metrics. |
| `src/quantbot/backtest/engine.py` | End-to-end backtest orchestration. |
| `src/quantbot/data/audit.py` | Data validation findings and coverage checks. |
| `src/quantbot/data/loader.py` | CSV catalog and table loading. |
| `src/quantbot/data/real_data.py` | CSV import and Yahoo Finance data bundle creation. |
| `src/quantbot/data/security_master.py` | Point-in-time entity-to-security mapping. |
| `src/quantbot/execution/simulator.py` | Trading cost, tax drag, fills, and shortfall simulation. |
| `src/quantbot/factors/alpha.py` | Factor IC learning and expected-return forecast. |
| `src/quantbot/factors/signals.py` | Point-in-time signal construction and normalization. |
| `src/quantbot/portfolio/optimizer.py` | Constrained mean-variance QP optimizer. |
| `src/quantbot/risk/model.py` | Factor risk model and covariance estimation. |
| `src/quantbot/utils/logging.py` | Shared logger factory. |

## Top-Level Package

### `src/quantbot/__init__.py`

**Purpose:** Defines the package version and public package exports.

**Public API:**

- `__version__`: current package version string.

**Change notes:** Keep this file tiny. Put runtime behavior in dedicated modules so importing `quantbot` remains cheap and side-effect free.

### `src/quantbot/config.py`

**Purpose:** Converts YAML config files into immutable dataclass sections used by the pipeline.

**Main objects:**

- `ProjectConfig`, `DataConfig`, `SignalsConfig`, `AlphaConfig`, `RiskConfig`, `PortfolioConfig`, `ExecutionConfig`, `BacktestConfig`, `LoggingConfig`: section-level defaults.
- `QuantBotConfig`: top-level config object.
- `load_config(path)`: reads YAML and returns `QuantBotConfig`.

**Behavior:**

- Unknown YAML keys are ignored with a `RuntimeWarning` instead of crashing.
- Non-mapping YAML sections fail fast with `ValueError`.
- Defaults preserve the current Yahoo Finance workflow, benchmark-active portfolio mode, rolling IC gating, and full run logging.

**Change notes:** Add new config parameters to the dataclass first, then update `configs/*.yaml`, the browser config editor expectations, and relevant docs.

### `src/quantbot/asx.py`

**Purpose:** Owns the curated ASX research universe and the metadata needed to split `.AX` Yahoo symbols into the requested analysis groups.

**Main objects:**

- `ASXSecurity`: immutable metadata row for one ASX security.
- `ASX_UNIVERSE`: curated ASX research universe with sector, industry, theme, metal, and top-cap flags.
- `PRIMARY_ANALYSES`: requested headline groups: `penny`, `miners`, `healthcare`, `others`, `tech`, and `top_caps`.

**Public API:**

- `asx_metadata_frame()`: returns `asx_universe.csv`-shaped metadata.
- `asx_sector_map_frame()`: returns `ticker,sector,country` data for Yahoo downloads.
- `asx_group_tickers(group)`: resolves names such as `overall`, `miners`, `metal_lithium`, `healthcare`, `tech`, and `top_caps` to Yahoo `.AX` tickers.
- `asx_group_names(include_metals, include_sectors)`: lists available ASX analysis groups.
- `write_asx_metadata(out_dir)`: writes `asx_universe.csv` and `asx_sector_map.csv`.
- `download_asx_yfinance(...)`: wraps the rich Yahoo downloader for ASX symbols and metadata.
- `default_asx_config(...)`: creates a segment-ready config from the normal default config.
- `learned_ic_from_run(...)`: reads rolling IC estimates from a full backtest run.

**Change notes:** Keep this module as metadata and download orchestration. Do not put alpha evaluation logic here. Penny membership is dynamic in `asx_analysis.py`; the static `penny` group is only a watch list for discovery.

### `src/quantbot/asx_analysis.py`

**Purpose:** Runs the ASX segmented alpha research workflow: create segment data bundles, train one alpha IC set per segment, and cross-test every trained alpha model on every other segment.

**Main objects:**

- `ASXAnalysisResult`: returned summary container with segment definitions, training summary, and cross summary.

**Public API:**

- `run_asx_analysis_suite(...)`: end-to-end ASX analysis driver used by the CLI.
- `build_asx_segment_bundles(...)`: filters the downloaded ASX data bundle into one schema-compatible bundle per analysis segment.

**Important internals:**

- `_penny_tickers(...)`: derives penny membership from the latest downloaded close and `--penny-price`.
- `_build_segment_signals(...)`: builds normal QuantBot point-in-time signals for a segment.
- `_learn_alpha_ics(...)`: estimates segment-specific rolling ICs and averages them into one learned alpha IC set.
- `_evaluate_learned_alpha(...)`: vectorized alpha IC, spread, and hit-rate evaluator for train-target cross tests.
- `_write_metric_pivots(...)`: writes matrix views for `mean_alpha_ic`, `annualized_alpha_spread`, and `alpha_hit_rate`.

**Outputs:** `asx_segments.csv`, `train_summary.csv`, `learned_alpha_ics.csv`, `cross_alpha_matrix.csv`, metric pivot CSVs, generated configs, and per-segment data bundles.

**Change notes:** The default workflow is alpha/IC research, not portfolio simulation. Keep `--full-backtests` optional because pairwise full QP backtests are much slower. Segment bundles require at least three tickers by default so daily cross-sectional ICs are meaningful.

### `src/quantbot/cli.py`

**Purpose:** Owns the `quantbot` command-line interface.

**Commands:**

- `download-yfinance`
- `download-yfinance-rich`
- `asx-universe`
- `download-asx-yfinance`
- `asx-analysis`
- `ticker-groups`
- `download-settings list|show|save`
- `configs list|show|validate|save`
- `data-bundles`
- `data-files`
- `data-columns`
- `data-preview`
- `import-csv`
- `backtest`
- `inspect-run`
- `runs`
- `run-datasets`
- `run-files`
- `run-config`
- `run-columns`
- `run-preview`
- `chart-run`
- `serve`
- `docs list|show|export`
- `jobs`
- `cli-usage`
- `cli-jobs`

**Important helpers:**

- `_download_settings_from_args(...)`: merges defaults, saved settings, CLI flags, and ticker groups.
- `_maybe_save_download_settings(...)`: writes reusable settings files.
- `_update_cli_progress(...)`: bridges command progress into `logs/cli_jobs.jsonl`.
- `build_parser()`: argparse command tree.
- `main(...)`: command execution, usage logging, and job lifecycle logging.

**Change notes:** CLI commands are logged in `logs/cli_usage.jsonl` and `logs/cli_jobs.jsonl`. `docs export` reuses the browser docs exporter so ZIP and offline HTML output match the GUI downloads. When adding a command, make sure it is reachable from both a real terminal and the browser CLI if appropriate.

### `src/quantbot/cli_jobs.py`

**Purpose:** Tracks real CLI commands as job-like records so the browser Jobs page can show CLI activity too.

**Public API:**

- `start_cli_job(argv, source, cwd)`: appends a running job event and returns a `cli-...` job ID.
- `finish_cli_job(job_id, argv, exit_code, source, cwd, error)`: appends a terminal event.
- `update_cli_job(job_id, **updates)`: appends progress updates.
- `read_cli_jobs(cwd, limit)`: reads JSONL events and returns the latest merged state for each job.

**Data file:** `logs/cli_jobs.jsonl`

**Change notes:** This module is append-only by design. Do not rewrite historical job rows; readers merge events by `id`.

### `src/quantbot/download_settings.py`

**Purpose:** Manages saved Yahoo download presets and records what was downloaded.

**Public API:**

- `list_download_settings(base_dir)`: lists YAML files under `configs/downloads/`.
- `load_download_settings(path_or_name, base_dir)`: loads a YAML mapping.
- `save_download_settings(path_or_name, settings, base_dir)`: writes a YAML preset.
- `write_download_manifest(output_root, settings)`: writes `download_manifest.json` beside downloaded CSV files.
- `resolve_download_settings_path(...)`: safely resolves names and paths.

**Change notes:** Path resolution is constrained to the project root. Keep that guardrail if adding new settings locations.

### `src/quantbot/run_paths.py`

**Purpose:** Generates timestamped run folders.

**Public API:**

- `timestamped_run_path(requested, source, force_unique)`: returns `runs/<source>_YYYYMMDD_HHMMSS` by default, or appends a timestamp to an explicit path when `force_unique=True`.

**Change notes:** GUI backtests use forced uniqueness to avoid overwriting `runs/gui`; CLI backtests honor explicit `--out`.

### `src/quantbot/ticker_groups.py`

**Purpose:** Defines common ticker shortcuts for GUI and CLI downloads.

**Public API:**

- `list_ticker_groups()`: returns a sorted copy of built-in groups.
- `resolve_tickers(tickers, groups)`: combines explicit tickers and named groups with duplicates removed.

**Current groups:** `fang`, `magnificent7`, `ai_leaders`, `dow30`, `nasdaq100_core`, `sp500_core`, `banks`, `energy`, `healthcare`, and `consumer`.

**Change notes:** Keep tickers uppercase and use Yahoo-compatible symbols where possible.

### `src/quantbot/usage_log.py`

**Purpose:** Records command usage from both real CLI and browser CLI.

**Public API:**

- `log_cli_usage(argv, source, exit_code, cwd, note)`: appends a JSON line.
- `read_cli_usage(cwd, limit)`: reads the most recent usage rows.

**Data file:** `logs/cli_usage.jsonl`

**Change notes:** The browser sets `source=gui_cli`; real terminal commands default to `source=cli`.

### `src/quantbot/run_logging.py`

**Purpose:** Captures the reproducibility evidence for every backtest.

**Main objects:**

- `FORMULAS`: variable-to-formula metadata used by `calculation_trace.csv`.
- `config_to_dict(config)`: converts dataclasses to plain serializable values.
- `sha256_file(path)`: hashes input files.
- `RunLogger`: accumulates manifests, audit rows, variable frames, formulas, and JSON payloads.

**Outputs:**

```text
logs/run_manifest.json
logs/resolved_config.yaml
logs/data_manifest.csv
logs/data_audit_findings.csv
logs/calculation_trace.csv
logs/variables/*.csv
```

**Change notes:** Preserve these outputs. They are the source of truth for what a run actually used and calculated.

### `src/quantbot/visualize.py`

**Purpose:** Builds standalone visual artifacts from saved run outputs.

**Public API:**

- `build_run_chart(run, dataset, x, y_columns, out, chart, filters, width, height)`: exports a focused SVG chart from a CSV output.

**Important internals:**

- `_load_datasets(...)`: gathers top-level run CSVs and `logs/variables/*.csv`.
- `_render_svg_chart(...)`: renders line/scatter/bar SVGs without a browser.

**Change notes:** The browser Runs page now renders dashboards natively, so keep this module focused on offline chart exports.

### `src/quantbot/web.py`

**Purpose:** Serves the browser Control Room and its JSON API.

**Main objects:**

- `JobCancelled`: cooperative cancellation signal.
- `JobControl`: pause/resume/cancel checkpoint object passed into long-running jobs.
- `JobStore`: in-memory job registry.
- `QuantBotWebApp`: API handlers, safe file reads, job launching, and static serving.
- `serve(host, port, base_dir)`: starts `ThreadingHTTPServer`.

**Key API areas:**

- Config: `/api/configs`, `/api/config`
- Data: `/api/data-bundles`, `/api/download-yfinance`, `/api/download-yfinance-rich`
- Settings and tickers: `/api/download-settings`, `/api/download-setting`, `/api/ticker-groups`
- Runs: `/api/runs`, `/api/run`, `/api/run-dataset`
- Jobs: `/api/jobs`, `/api/job`, `/api/job-control`
- CLI: `/api/cli`, `/api/cli-usage`, `/api/cli-jobs`
- Docs: `/api/docs`, `/api/doc`, `/api/doc-download`, `/api/docs-bundle`, `/api/docs-offline`

**Change notes:** Keep read/write paths constrained to the project root. Docs downloads are read-only and limited to `README.md` plus `docs/*.md`; the ZIP and offline HTML exporters should preserve that boundary. Long operations should call `job_control.checkpoint(...)` often enough for progress, pause, and cancel to feel live.

## Data Package

### `src/quantbot/data/loader.py`

**Purpose:** Resolves configured data paths and loads CSV tables.

**Main objects:**

- `DataCatalog`: path bundle for required and optional data tables.
- `CsvDataLoader`: narrow loader interface with methods for prices, fundamentals, security master, vendor entities, entity mapping, and optional tables.

**Change notes:** This is the replaceable boundary for future Parquet, database, or cloud storage loaders.

### `src/quantbot/data/audit.py`

**Purpose:** Validates input tables before the backtest trusts them.

**Main objects:**

- `AuditFinding`: one validation finding.
- `AuditReport`: collection with `passed`, `raise_on_error()`, and `to_frame()`.
- `DataAuditor`: performs key checks, missingness checks, outlier warnings, and coverage checks.

**Change notes:** Required key errors should stop the run. Optional sparse Yahoo fields should warn, because missing public fundamentals are expected.

### `src/quantbot/data/security_master.py`

**Purpose:** Enforces point-in-time mapping from raw vendor entities to internal security IDs.

**Public API:**

- `point_in_time_match(vendor, mapping, ...)`: maps rows only when `valid_from <= date <= valid_to`.
- `assert_point_in_time_integrity(matched, ...)`: fails if mapped rows violate their validity interval.

**Change notes:** Never replace this with a simple latest-ticker join. That would reintroduce lookahead and identifier survivorship problems.

### `src/quantbot/data/real_data.py`

**Purpose:** Converts local CSVs or Yahoo Finance downloads into the canonical bot schema.

**Public API:**

- `write_real_data_bundle(...)`: writes canonical CSV tables.
- `import_price_csv(...)`: imports local OHLCV plus optional fundamentals/vendor CSVs.
- `download_yfinance_bundle(...)`: downloads basic Yahoo OHLCV data.
- `download_yfinance_rich_bundle(...)`: downloads OHLCV plus optional rich Yahoo tables and converts them into signals-ready CSVs.

**Important internals:**

- Price normalization, security master generation, entity mapping, and neutral fallback tables.
- Per-ticker Yahoo fallback when bulk downloads fail.
- Statement availability lag so fundamentals are not used on their report date.
- Optional tables for `actions`, `profile`, `earnings`, `analyst_events`, `holders`, and `options_snapshot`.

**Change notes:** Keep Yahoo as the default real-data workflow. Do not reintroduce synthetic demo-data commands. Preserve the date lag on fundamentals and fail loudly when no requested ticker returns price rows.

## Factor Package

### `src/quantbot/factors/signals.py`

**Purpose:** Builds point-in-time factor signals from prices, fundamentals, and vendor data.

**Public API:**

- `winsorized_zscore(frame, columns, group_col, cap)`: cross-sectional normalization.
- `build_signals(prices, fundamentals, vendor_entities, entity_mapping, data_config, signal_config, progress_callback)`: returns the full signal frame with raw features, normalized factors, universe flags, and next-day labels.

**Signal families:**

- Price: momentum, reversal, low volatility, moving-average trend, drawdown recovery.
- Liquidity: dollar volume and liquidity change.
- Fundamentals: value, quality, growth, dividend yield.
- Events/analysts: earnings revision.
- Vendor: alternate sentiment.

**Change notes:** Signals must be lagged or point-in-time merged. `next_ret_1d` is a label for learning and reports, not an input to same-day decisions.

### `src/quantbot/factors/alpha.py`

**Purpose:** Converts normalized signals into expected one-day returns.

**Main object:**

- `AlphaModel`

**Public methods:**

- `factor_names`: configured factor list.
- `estimate_rolling_ics(history, asof_date)`: estimates point-in-time rolling ICs using only rows before `asof_date`.
- `forecast_frame(signal_frame, ic_estimates)`: returns per-factor contributions and `expected_return`.
- `forecast(...)`: returns just the expected return series.

**Model shape:**

$$
\mu_{i,t}=score_{i,t}\cdot \tilde\sigma_{i,t}
$$

**Change notes:** Keep rolling IC gating conservative for small Yahoo universes. Negative IC handling is controlled by config.

## Risk Package

### `src/quantbot/risk/model.py`

**Purpose:** Estimates a compact factor risk model and an asset covariance matrix.

**Main objects:**

- `RiskEstimate`: covariance, exposures, factor covariance, and specific variance.
- `FactorRiskModel`: exposure builder and covariance estimator.

**Model shape:**

$$
\Sigma_t=B_tF_tB_t^\top+D_t
$$

**Change notes:** The estimator includes fallback paths for short or sparse histories and eigenvalue clipping to keep covariance matrices positive semidefinite.

## Portfolio Package

### `src/quantbot/portfolio/optimizer.py`

**Purpose:** Solves the constrained portfolio optimization problem.

**Main objects:**

- `OptimizationResult`: weights, success flag, message, objective, turnover, benchmark weights, and active weights.
- `PortfolioOptimizer`: validates config, selects solver, builds constraints, solves, and formats results.

**Modes:**

- `long_short`
- `long_only`
- `benchmark_active`

**Solver paths:**

- `cvxpy_osqp`
- `scipy_slsqp_qp`
- `auto`

**QP shape:**

$$
\min_w -\mu^\top w + \frac{1}{2}\lambda w^\top\Sigma w + \eta c^\top u
$$

**Change notes:** Preserve true constrained optimization. Projected fallbacks are diagnostic fallback behavior, not a replacement for the QP.

## Execution Package

### `src/quantbot/execution/simulator.py`

**Purpose:** Estimates trading costs, capital-gains tax drag, and simulated fills.

**Main objects:**

- `OrderType`, `Side`
- `Order`, `Fill`, `ShortfallBreakdown`, `PortfolioState`
- `ExecutionSimulator`

**Public methods:**

- `estimate_costs_bps(...)`
- `estimate_cgt_cost_per_weight(...)`
- `estimate_cgt_drag(...)`
- `implementation_shortfall(...)`
- `shortfall_breakdown(...)`
- `orders_from_weights(...)`
- `fill_orders(...)`

**Change notes:** The cost model is intentionally simple. Keep no-cost, no-CGT, and full-cost paths separate so the run can explain cost drag.

## Analysis Package

### `src/quantbot/analysis/performance.py`

**Purpose:** Computes summary metrics from daily backtest results.

**Public API:**

- `max_drawdown(equity_curve)`
- `information_ratio(active_returns)`
- `performance_summary(results)`

**Metrics include:** total return, annualized return, volatility, drawdown, active return, active risk, information ratio, turnover, implementation shortfall, no-cost returns, no-CGT returns, benchmark after-CGT returns, and ex-ante risk averages.

**Change notes:** Keep metrics derived from output columns rather than hardcoded run results.

### `src/quantbot/analysis/factor_report.py`

**Purpose:** Reports whether factors helped or hurt in the saved signal history.

**Public API:**

- `compute_factor_daily_report(signals, factors)`: daily factor IC and top-bottom spread rows.
- `summarize_factor_report(daily, configured_weights, prior_ics, rolling_ic_estimates)`: factor-level aggregate table.

**Change notes:** These reports use `next_ret_1d` as an evaluation label, not as live signal input.

## Backtest Package

### `src/quantbot/backtest/engine.py`

**Purpose:** Orchestrates the complete data-to-results pipeline.

**Main objects:**

- `BacktestRun`: results, summary, signals, run logger, factor daily report, and factor summary.
- `BacktestEngine`: loads data, audits inputs, builds signals, estimates alpha/risk, optimizes, simulates execution costs, calculates performance, logs variables, and writes outputs.

**Lifecycle:**

1. Load configured data tables.
2. Audit required and optional inputs.
3. Build point-in-time signals.
4. For each rebalance date, estimate alpha, risk, transaction costs, and target weights.
5. Apply daily returns, benchmark returns, normal costs, and tax drag.
6. Save results, summaries, reports, configs, manifests, and variable CSVs.

**Change notes:** This is the highest blast-radius module. Keep progress callbacks and control checks in place so GUI jobs remain live and cancellable.

## Utilities

### `src/quantbot/utils/logging.py`

**Purpose:** Provides a shared logger factory.

**Public API:**

- `get_logger(name)`: returns a configured `logging.Logger` with a stream handler.

**Change notes:** Avoid adding noisy import-time side effects. Most user-facing command output should stay in CLI/web layers.
