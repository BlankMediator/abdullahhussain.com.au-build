# US REIT Backtests

This note documents the US version of the REIT workflow:

```text
get US REITs -> run a full backtest -> build a least-covariance REIT portfolio -> run a full backtest on that portfolio
```

The workflow mirrors the ASX REIT run but uses Nasdaq's current stock screener metadata as the universe source.
It is reproducible from `scripts/us_reit_backtests.py`.

## User Analysis Brief

| Requested analysis | Implemented output |
|---|---|
| Similar run for US REITs | `runs/us_reits_all` |
| Include US REITs | Nasdaq screener rows classified as `Real Estate Investment Trusts` |
| Exclude non-common instruments | Preferred shares, notes, units, rights, warrants, and similar rows are written to an exclusion CSV |
| Make a least-covariance portfolio | Equal-weight basket selected from the price-backed US REIT universe |
| Run a full backtest on that low-covariance portfolio | `runs/us_reits_low_cov` |

## Code Added

| File | Purpose |
|---|---|
| `scripts/us_reit_backtests.py` | Builds the Nasdaq-sourced US REIT universe, downloads Yahoo data, writes configs, selects the low-covariance basket, and writes comparison outputs. |

## Universe Source

The script pulls Nasdaq's stock screener API:

```text
https://api.nasdaq.com/api/screener/stocks?tableonly=true&limit=10000&offset=0&download=true
```

It keeps rows with:

```text
sector == Real Estate
industry == Real Estate Investment Trusts
country == United States
```

It then excludes rows whose names indicate preferred shares, depositary shares, notes, units, warrants, rights,
or other non-common instruments. This keeps the backtest focused on common/listed equity REIT-like securities
rather than capital-structure variants.

## Commands

Download/build the US REIT data bundle and generated configs:

```bash
python -B scripts/us_reit_backtests.py
```

Run the full US REIT backtest:

```bash
python -B -m quantbot.cli backtest \
  --config configs/us_reits/all_reits.yaml \
  --out runs/us_reits_all
```

Run the low-covariance US REIT portfolio backtest:

```bash
python -B -m quantbot.cli backtest \
  --config configs/us_reits/low_cov_reits.yaml \
  --out runs/us_reits_low_cov
```

Regenerate the comparison CSV from completed runs:

```bash
python -B -c "from scripts.us_reit_backtests import summarize_runs; summarize_runs()"
```

## Artifacts

| Path | Purpose |
|---|---|
| `data/us_reits_yfinance/us_reit_universe.csv` | Filtered US REIT common/listed equity universe. |
| `data/us_reits_yfinance/us_reit_sector_map.csv` | `ticker,sector,country` map passed to the Yahoo downloader. |
| `data/us_reits_yfinance/prices.csv` | Yahoo daily OHLCV/actions-adjusted price table for US REIT tickers. |
| `data/us_reits_low_cov_yfinance/` | Filtered data bundle containing only the selected low-covariance basket. |
| `configs/us_reits/all_reits.yaml` | Full US REIT benchmark-active backtest config. |
| `configs/us_reits/low_cov_reits.yaml` | Fixed-weight long-only low-covariance US REIT config. |
| `runs/us_reits_all/` | Full US REIT backtest outputs and logs. |
| `runs/us_reits_low_cov/` | Low-covariance US REIT backtest outputs and logs. |
| `runs/us_reits_analysis/nasdaq_screener_raw.json` | Raw Nasdaq screener response saved for audit. |
| `runs/us_reits_analysis/us_reit_nasdaq_candidates.csv` | Nasdaq rows before common-equity filtering. |
| `runs/us_reits_analysis/us_reit_nasdaq_excluded.csv` | Preferred/notes/units and other excluded rows. |
| `runs/us_reits_analysis/reit_covariance_metrics.csv` | Per-ticker covariance/correlation metrics used for basket selection. |
| `runs/us_reits_analysis/reit_low_cov_weights.csv` | Selected low-covariance basket and equal weights. |
| `runs/us_reits_analysis/reit_backtest_comparison.csv` | Wide comparison table across both completed runs. |

## Data Coverage

| Item | Count |
|---|---:|
| Nasdaq REIT-classified candidates | 221 |
| Excluded non-common/security-variant rows | 49 |
| Selected US REIT universe | 172 |
| Yahoo price-backed tickers | 172 |
| Missing Yahoo price tickers | 0 |
| Price rows | 208,671 |
| Price start | 2021-07-01 |
| Price end | 2026-07-02 |

## Low-Covariance Method

The script builds daily returns from the US REIT price bundle, annualizes the covariance matrix, and scores candidate
baskets using the same method as the ASX REIT workflow:

```text
score = average_pairwise_covariance + 0.15 * average_abs_correlation + 0.05 * basket_volatility
```

Selection is greedy:

1. Start with an empty basket.
2. Add the ticker that gives the lowest candidate score.
3. Repeat until 12 tickers are selected, or until the usable universe is smaller than 12.
4. Assign equal weights to the selected tickers.

The low-covariance config is then run as a fixed-weight long-only portfolio, so the measured portfolio is the selected
basket rather than a replacement chosen by the normal alpha optimizer.

## Low-Covariance Basket

The selected basket was:

| Ticker | Weight | Avg abs correlation | Avg covariance |
|---|---:|---:|---:|
| `ADC` | 8.33% | 0.3927 | 0.021650 |
| `IOR` | 8.33% | 0.0181 | 0.001104 |
| `MDRR` | 8.33% | 0.0349 | 0.005346 |
| `LOAN` | 8.33% | 0.1340 | 0.010780 |
| `TCI` | 8.33% | 0.1766 | 0.023020 |
| `GIPR` | 8.33% | 0.0520 | 0.013030 |
| `SELF` | 8.33% | 0.1228 | 0.010529 |
| `MDV` | 8.33% | 0.0766 | 0.011495 |
| `SACH` | 8.33% | 0.2109 | 0.031111 |
| `CXW` | 8.33% | 0.2092 | 0.028021 |
| `REFI` | 8.33% | 0.2517 | 0.018335 |
| `SQFT` | 8.33% | 0.0680 | 0.024355 |

## Backtest Results

Both runs used:

| Setting | Value |
|---|---|
| Backtest start | 2023-01-01 |
| Backtest end | 2026-07-03 |
| Data source | Yahoo Finance daily data |
| Full REIT universe size | 172 |
| Full REIT optimizer max assets | 20 |
| Low-covariance basket size | 12 |
| Rebalance count | 176 |

Headline results:

| Run | Total return | Benchmark total return | Annualized return | Annualized volatility | Max drawdown | Information ratio | IR after benchmark CGT |
|---|---:|---:|---:|---:|---:|---:|---:|
| `us_reits_all` | 54.55% | 28.83% | 13.34% | 18.57% | -22.44% | 0.7272 | 1.0595 |
| `us_reits_low_cov` | -0.32% | 12.52% | -0.09% | 11.43% | -18.51% | -0.5095 | 0.1470 |

Risk/exposure diagnostics:

| Run | Avg active gross exposure | Avg ex-ante tracking error | Avg portfolio volatility ex-ante | Avg benchmark volatility ex-ante |
|---|---:|---:|---:|---:|
| `us_reits_all` | 0.5745 | 0.0350 | 18.18% | 18.08% |
| `us_reits_low_cov` | 0.4072 | 0.0858 | 12.99% | 21.57% |

## Interpretation

The full US REIT alpha backtest was strongly positive over this window. It returned 54.55% versus a 28.83% benchmark
return and produced an after-CGT benchmark information ratio of 1.0595.

The low-covariance US basket reduced realized volatility from 18.57% in the full REIT run to 11.43%, and it improved
max drawdown from -22.44% to -18.51%. The return trade-off was severe: total return was -0.32%, compared with 12.52%
for its benchmark.

In plain terms: the low-covariance selector found a calmer basket, but it heavily favored small and idiosyncratic names.
That reduced co-movement and benchmark volatility, but it did not produce enough return to compete with the broader
US REIT alpha backtest.

## Caveats

- Nasdaq's screener classification is current metadata, not a hand-audited Nareit membership file.
- The script excludes preferred shares, notes, units, warrants, rights, and similar rows by name pattern. Exclusions are
  saved to `runs/us_reits_analysis/us_reit_nasdaq_excluded.csv` for audit.
- The low-covariance basket is selected using observed historical returns in the downloaded sample. It is a
  diversification experiment, not a point-in-time production portfolio-selection rule.
- The fixed-weight low-covariance run intentionally disables the normal alpha optimizer replacement behavior so the
  selected basket is what gets measured.
- Results are run artifacts, not hardcoded assumptions. Re-running after future Nasdaq/Yahoo data changes can produce
  different universes, selections, and returns.

## Verification

The run artifacts were regenerated after both completed backtests with:

```bash
python -B -c "from scripts.us_reit_backtests import summarize_runs; summarize_runs()"
```

The final test pass for the touched workflow used:

```bash
python -m pytest tests\test_backtest_smoke.py tests\test_cli.py tests\test_sparse_audit.py -q
```
