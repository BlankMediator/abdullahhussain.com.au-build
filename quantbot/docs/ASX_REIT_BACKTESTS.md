# ASX REIT Backtests

This note documents the ASX REIT work requested after the main ASX segmented alpha analysis:

```text
get all ASX REITs -> run a full backtest -> build a least-covariance REIT portfolio -> run a full backtest on that portfolio
```

The workflow is reproducible from `scripts/asx_reit_backtests.py`. It uses the normal QuantBot Yahoo Finance schema,
point-in-time signal construction, constrained portfolio optimizer, run logs, and summary CSV outputs.

## User Analysis Brief

| Requested analysis | Implemented output |
|---|---|
| Full backtest for REITs on the ASX | `runs/asx_reits_all` |
| Include all REITs on the ASX | Official ASX listed-company CSV filtered to `Equity Real Estate Investment Trusts (REITs)` |
| Make a portfolio whose stocks have the least covariance | Equal-weight basket selected from the price-backed REIT universe by low pairwise covariance/correlation |
| Run a full backtest on that low-covariance portfolio | `runs/asx_reits_low_cov` |

## Code Added

| File | Purpose |
|---|---|
| `scripts/asx_reit_backtests.py` | Builds the official-ASX REIT universe, downloads Yahoo `.AX` data, creates REIT configs, selects the low-covariance basket, and writes comparison outputs. |
| `src/quantbot/run_logging.py` | Drops empty/all-NA audit columns before concatenation so pandas does not warn during REIT backtest logging. |

## Universe Source

The universe comes from the official ASX listed-company CSV:

```text
https://www.asx.com.au/asx/research/ASXListedCompanies.csv
```

The downloaded file used for the run was headed:

```text
ASX listed companies as at Fri Jul 03 03:22:04 AEST 2026
```

The script reads this CSV, then keeps rows whose `GICS industry group` contains:

```text
Equity Real Estate Investment Trusts (REITs)
```

This produced 38 official ASX REIT candidates. Yahoo Finance returned usable daily price rows for 37 of them.
`SCW.AX` was present in the official ASX REIT universe but did not return a usable Yahoo quote for the run,
so it is preserved in the universe CSV but excluded from price-backed backtests.

## Commands

Download/build the REIT data bundle and generated configs:

```bash
python -B scripts/asx_reit_backtests.py
```

Run the full official REIT backtest:

```bash
python -B -m quantbot.cli backtest \
  --config configs/asx_reits/all_reits.yaml \
  --out runs/asx_reits_all
```

Run the low-covariance REIT portfolio backtest:

```bash
python -B -m quantbot.cli backtest \
  --config configs/asx_reits/low_cov_reits.yaml \
  --out runs/asx_reits_low_cov
```

Regenerate the comparison CSV from the completed runs:

```bash
python -B -c "from scripts.asx_reit_backtests import summarize_runs; summarize_runs()"
```

## Artifacts

| Path | Purpose |
|---|---|
| `data/asx_reits_yfinance/asx_reit_universe.csv` | Official ASX REIT candidate universe used for the run. |
| `data/asx_reits_yfinance/asx_reit_sector_map.csv` | `ticker,sector,country` map passed into the Yahoo downloader. |
| `data/asx_reits_yfinance/prices.csv` | Yahoo daily OHLCV/actions-adjusted price table for usable REIT tickers. |
| `data/asx_reits_low_cov_yfinance/` | Filtered data bundle containing only the selected low-covariance basket. |
| `configs/asx_reits/all_reits.yaml` | Full REIT benchmark-active backtest config. |
| `configs/asx_reits/low_cov_reits.yaml` | Fixed-weight long-only low-covariance REIT config. |
| `runs/asx_reits_all/` | Full REIT backtest outputs and logs. |
| `runs/asx_reits_low_cov/` | Low-covariance REIT backtest outputs and logs. |
| `runs/asx_reits_analysis/reit_covariance_metrics.csv` | Per-ticker covariance/correlation metrics used for basket selection. |
| `runs/asx_reits_analysis/reit_low_cov_weights.csv` | Selected low-covariance basket and equal weights. |
| `runs/asx_reits_analysis/reit_backtest_comparison.csv` | Wide comparison table across both completed runs. |

## Data Coverage

| Item | Count |
|---|---:|
| Official ASX REIT candidates | 38 |
| Yahoo price-backed tickers | 37 |
| Skipped Yahoo quote | 1 |
| Price rows | 46,190 |
| Price start | 2021-07-01 |
| Price end | 2026-07-02 |

Skipped ticker:

```text
SCW.AX
```

## Low-Covariance Method

The script builds daily returns from the REIT price bundle, annualizes the covariance matrix, and scores candidate baskets using:

```text
score = average_pairwise_covariance + 0.15 * average_abs_correlation + 0.05 * basket_volatility
```

Selection is greedy:

1. Start with an empty basket.
2. Add the ticker that gives the lowest candidate score.
3. Repeat until 12 tickers are selected, or until the usable universe is smaller than 12.
4. Assign equal weights to the selected tickers.

The low-covariance config is then run as a fixed-weight long-only portfolio. This isolates the covariance-basket idea
from the normal alpha optimizer: the run measures the selected basket directly rather than letting the optimizer
replace it.

## Low-Covariance Basket

The selected basket was:

| Ticker | Weight | Avg abs correlation | Avg covariance |
|---|---:|---:|---:|
| `BWP.AX` | 8.33% | 0.4195 | 0.016580 |
| `APW.AX` | 8.33% | 0.0162 | 0.000386 |
| `URF.AX` | 8.33% | 0.0354 | 0.003257 |
| `REP.AX` | 8.33% | 0.1186 | 0.006529 |
| `APZ.AX` | 8.33% | 0.0947 | 0.006970 |
| `TOT.AX` | 8.33% | 0.0857 | 0.005528 |
| `LED.AX` | 8.33% | 0.1153 | 0.006695 |
| `CDP.AX` | 8.33% | 0.1159 | 0.005829 |
| `GDF.AX` | 8.33% | 0.1354 | 0.007277 |
| `DXC.AX` | 8.33% | 0.2207 | 0.010397 |
| `HCW.AX` | 8.33% | 0.2034 | 0.014910 |
| `GDI.AX` | 8.33% | 0.2391 | 0.013045 |

## Backtest Results

Both runs used:

| Setting | Value |
|---|---|
| Backtest start | 2023-01-01 |
| Backtest end | 2026-07-03 |
| Initial capital | 1,000,000 |
| Rebalance count | 177 |
| Data source | Yahoo Finance `.AX` daily data |

Headline results:

| Run | Total return | Benchmark total return | Annualized return | Annualized volatility | Max drawdown | Information ratio | IR after benchmark CGT |
|---|---:|---:|---:|---:|---:|---:|---:|
| `asx_reits_all` | 27.85% | 22.62% | 7.25% | 16.56% | -22.33% | 0.2784 | 0.4828 |
| `asx_reits_low_cov` | 5.98% | 18.71% | 1.67% | 9.25% | -17.69% | -2.4509 | -0.9890 |

Risk/exposure diagnostics:

| Run | Avg active gross exposure | Avg ex-ante tracking error | Avg portfolio volatility ex-ante | Avg benchmark volatility ex-ante |
|---|---:|---:|---:|---:|
| `asx_reits_all` | 0.5087 | 0.0438 | 16.51% | 15.19% |
| `asx_reits_low_cov` | 0.1008 | 0.0116 | 10.36% | 11.53% |

## Interpretation

The full ASX REIT alpha backtest was the stronger portfolio result. It returned 27.85% versus a 22.62% benchmark
return and had a positive after-CGT benchmark information ratio of 0.4828.

The low-covariance basket behaved like a risk-reduction portfolio, not a return-maximizing one. Its realized volatility
fell from 16.56% in the full REIT run to 9.25%, and its max drawdown improved from -22.33% to -17.69%. The cost was
meaningful return underperformance: total return was 5.98% versus its 18.71% benchmark.

In plain terms: the least-covariance selection successfully found a quieter REIT basket, but low covariance alone was not
enough alpha. It reduced portfolio movement, yet it also selected names that lagged the broader REIT benchmark over this
test window.

## Caveats

- The universe is official-ASX-classified REITs as of the downloaded ASX CSV timestamp, not a hand-maintained list.
- Yahoo Finance can omit, delist, rename, or fail individual `.AX` tickers. `SCW.AX` was official in the ASX CSV but
  did not have usable Yahoo price rows.
- The low-covariance basket is selected using observed historical returns in the downloaded sample. It is a
  diversification experiment, not a point-in-time production portfolio-selection rule.
- The fixed-weight low-covariance run intentionally disables the normal alpha optimizer replacement behavior so the
  selected basket is what gets measured.
- Results are run artifacts, not hardcoded assumptions. Re-running after future ASX/Yahoo data changes can produce
  different universes, selections, and returns.

## Verification

The final targeted verification command passed:

```bash
python -m pytest tests\test_backtest_smoke.py tests\test_cli.py tests\test_sparse_audit.py -q
```

The earlier full suite also passed after the REIT work, with only the expected config-loader warning for an intentionally unknown future config key.
