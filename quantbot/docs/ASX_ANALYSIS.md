# ASX Analysis Guide

This guide documents the ASX workflow added for the requested analysis:

```text
download ASX data -> separate by sector/theme/metal/cap bucket -> train alpha separately -> cross-test each alpha model on every other group
```

The implementation keeps the existing QuantBot shape: Yahoo Finance data, point-in-time signal construction, rolling IC alpha learning, reproducible CSV outputs, and no hardcoded final backtest results.

## User Analysis Brief

The requested ASX analysis set was:

| Requested analysis | Implemented segment |
|---|---|
| Penny stocks | `penny` |
| Miners of all sizes | `miners` |
| By metal, such as lithium | `metal_lithium`, `metal_copper`, `metal_gold`, `metal_iron_ore`, `metal_uranium`, plus other metal groups when enough names exist |
| Healthcare | `healthcare` |
| Others | `others` |
| Tech | `tech` |
| Top caps | `top_caps` |
| Overall model | `overall` |
| Train each alpha separately and run each against all others | `cross_alpha_matrix.csv` |

Sector groups can also be included with `--include-sectors`, but the final run used the requested primary/theme/metal groups to keep the matrix focused.

## Code Added

| File | Purpose |
|---|---|
| `src/quantbot/asx.py` | Defines the ASX universe, sector/theme/metal/top-cap metadata, ASX group resolution, metadata CSV writing, and ASX Yahoo download wrapper. |
| `src/quantbot/asx_analysis.py` | Builds per-segment data bundles, trains one alpha IC set per segment, cross-tests learned alpha ICs on every other segment, and writes analysis matrices. |
| `src/quantbot/cli.py` | Adds `asx-universe`, `download-asx-yfinance`, and `asx-analysis` commands. |
| `src/quantbot/data/real_data.py` | Tightens Yahoo manifest reporting so `downloaded_tickers` reflects tickers with usable price rows. |
| `src/quantbot/analysis/factor_report.py` | Handles empty factor daily groups without crashing on small universes. |
| `tests/test_asx_analysis.py` | Covers ASX group availability and dynamic penny segmentation. |
| `tests/test_factor_report.py` | Covers empty factor-summary behavior. |
| `tests/test_cli.py` | Confirms ASX commands are exposed. |

## Commands

List ASX groups:

```bash
quantbot asx-universe list
```

Write the ASX universe and sector map metadata:

```bash
quantbot asx-universe metadata --out data/asx_yfinance
```

Download the ASX data bundle from Yahoo Finance:

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

Run the ASX alpha analysis:

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

Run full portfolio backtests for the trained segments:

```bash
quantbot asx-analysis \
  --data-root data/asx_yfinance \
  --out-root runs/asx_alpha_backtests \
  --config-dir configs/asx_backtests \
  --start 2023-01-01 \
  --end 2026-07-03 \
  --no-include-sectors \
  --include-metals \
  --cross-evaluate \
  --full-backtests
```

The default ASX analysis is alpha/IC research, not full QP portfolio simulation. `--full-backtests` is available when portfolio-level run folders are needed, but the cross-alpha matrix is intentionally signal-level so the full pairwise analysis is practical.

## Data Bundle

The ASX download writes the normal QuantBot schema plus ASX metadata:

```text
data/asx_yfinance/actions.csv
data/asx_yfinance/asx_sector_map.csv
data/asx_yfinance/asx_universe.csv
data/asx_yfinance/download_manifest.json
data/asx_yfinance/entity_mapping.csv
data/asx_yfinance/fundamentals.csv
data/asx_yfinance/prices.csv
data/asx_yfinance/profile.csv
data/asx_yfinance/security_master.csv
data/asx_yfinance/vendor_entities.csv
```

For the final run, Yahoo returned usable price data for 65 ASX symbols. These requested symbols did not have usable Yahoo price rows in the final bundle:

```text
SYA.AX
AKE.AX
C6C.AX
ALU.AX
```

The manifest records the usable and skipped tickers:

```bash
quantbot data-files --bundle asx_yfinance --show-manifest
```

## Segments

The final run used segments with at least three usable tickers, because daily cross-sectional IC needs a minimum cross-section:

| Segment | Tickers | Purpose |
|---|---:|---|
| `overall` | 65 | Whole ASX universe in this research set. |
| `penny` | 5 | Dynamic latest-close penny bucket, using `--penny-price` threshold, default `1.0`. |
| `miners` | 21 | All mining-related names across sizes and metals. |
| `metal_lithium` | 7 | Lithium-linked miners. |
| `metal_copper` | 8 | Copper-linked miners. |
| `metal_gold` | 4 | Gold-linked miners. |
| `metal_iron_ore` | 4 | Iron ore-linked miners. |
| `metal_uranium` | 3 | Uranium-linked miners. |
| `healthcare` | 10 | Healthcare and biotech/device/service names. |
| `others` | 23 | Names outside miner, healthcare, and tech themes. |
| `tech` | 12 | Information technology and tech-like communication services. |
| `top_caps` | 44 | Large-cap ASX names in the curated universe. |

Two metal labels existed in the metadata but were excluded from the final matrix because they had fewer than three usable names:

```text
metal_aluminium
metal_zinc
```

## Method

The ASX analysis uses the same signals as the normal QuantBot pipeline:

```text
prices/fundamentals/vendor data -> point-in-time signals -> rolling IC estimates -> alpha score
```

For each segment:

1. Copy only that segment's tickers into a segment-specific data bundle under `runs/<analysis>/data_segments/<segment>/`.
2. Generate a matching config under `configs/asx_alpha_final/<segment>.yaml`.
3. Build point-in-time signals for the segment.
4. Estimate rolling ICs using only rows before each as-of date.
5. Average learned effective ICs into one segment-specific alpha model.
6. Evaluate the segment's own alpha model on its own signal history.

For cross-testing:

1. Take the learned ICs from one train segment.
2. Apply those ICs to every target segment's point-in-time signal history.
3. Compute daily alpha IC, top-bottom alpha spread, and hit rate.
4. Write one row per train-target pair.

This means `train_segment=tech,target_segment=miners` answers:

```text
If the alpha ICs learned on tech names are used to score miner names, how well does that score rank next-day miner returns?
```

## Metrics

| Column | Meaning |
|---|---|
| `alpha_days` | Number of daily cross-sections evaluated. |
| `alpha_observations` | Total ticker-date rows used in alpha evaluation. |
| `mean_alpha_ic` | Mean daily correlation between expected return and next-day realized return. Higher is better. |
| `annualized_alpha_spread` | Mean daily top-minus-bottom alpha bucket return multiplied by 252. It is an alpha research spread, not a portfolio backtest return. |
| `alpha_hit_rate` | Fraction of days where the top alpha bucket beat the bottom alpha bucket. |

`mean_alpha_ic` is the cleanest first-pass ranking metric. `annualized_alpha_spread` is more intuitive but can be noisy in small groups. `alpha_hit_rate` shows consistency.

## Final Output Files

The final run wrote:

```text
runs/asx_alpha_analysis_final/asx_segments.csv
runs/asx_alpha_analysis_final/train_summary.csv
runs/asx_alpha_analysis_final/learned_alpha_ics.csv
runs/asx_alpha_analysis_final/cross_alpha_matrix.csv
runs/asx_alpha_analysis_final/cross_alpha_mean_alpha_ic.csv
runs/asx_alpha_analysis_final/cross_alpha_annualized_alpha_spread.csv
runs/asx_alpha_analysis_final/cross_alpha_alpha_hit_rate.csv
runs/asx_alpha_analysis_final/data_segments/<segment>/*.csv
```

The generated configs are under:

```text
configs/asx_alpha_final/
configs/asx_alpha_final/cross/
```

## Final Self-Trained Segment Results

These are from `runs/asx_alpha_analysis_final/train_summary.csv`:

| Segment | Mean alpha IC | Annualized alpha spread | Hit rate |
|---|---:|---:|---:|
| `metal_uranium` | 0.0481 | 0.2817 | 0.5113 |
| `healthcare` | 0.0313 | 0.3855 | 0.5158 |
| `metal_copper` | 0.0308 | 0.0696 | 0.5385 |
| `tech` | 0.0223 | 0.2683 | 0.5249 |
| `metal_gold` | 0.0201 | -0.0745 | 0.5068 |
| `overall` | 0.0201 | 0.2294 | 0.5396 |
| `top_caps` | 0.0180 | 0.2331 | 0.5339 |
| `miners` | 0.0177 | 0.1259 | 0.5260 |
| `metal_lithium` | 0.0092 | -0.0917 | 0.4966 |
| `metal_iron_ore` | 0.0073 | 0.0931 | 0.4955 |
| `others` | 0.0022 | -0.0194 | 0.4932 |
| `penny` | -0.0209 | -0.4362 | 0.4842 |

Interpretation:

- Uranium, healthcare, copper, tech, and the overall model had the strongest self-trained mean ICs in this run.
- Penny stocks had negative self-trained alpha IC and negative spread in this period, so the standard factor mix did not transfer cleanly to that bucket.
- Lithium had mildly positive IC but negative spread, a sign that rank correlation and tail-bucket behavior disagreed.

## Cross-Alpha Highlights

The top rows by `mean_alpha_ic` in `cross_alpha_matrix.csv` were mostly models tested on `metal_uranium`:

| Train segment | Target segment | Mean alpha IC | Annualized alpha spread | Hit rate |
|---|---|---:|---:|---:|
| `penny` | `metal_uranium` | 0.0555 | 0.2631 | 0.5283 |
| `healthcare` | `metal_uranium` | 0.0538 | 0.2947 | 0.5102 |
| `others` | `metal_uranium` | 0.0534 | 0.1207 | 0.5226 |
| `tech` | `metal_uranium` | 0.0529 | 0.3284 | 0.5170 |
| `metal_iron_ore` | `metal_uranium` | 0.0522 | 0.2631 | 0.5068 |
| `top_caps` | `metal_uranium` | 0.0519 | 0.2560 | 0.5102 |
| `overall` | `metal_uranium` | 0.0492 | 0.2522 | 0.5090 |
| `metal_copper` | `metal_uranium` | 0.0492 | 0.3020 | 0.5102 |
| `miners` | `metal_uranium` | 0.0484 | 0.2747 | 0.5136 |
| `metal_uranium` | `metal_uranium` | 0.0481 | 0.2817 | 0.5113 |

This does not mean uranium is necessarily the best investment bucket. It means the chosen factor set ranked next-day returns most cleanly inside the small uranium cross-section during the analysis window. Small groups can have unstable ICs, so treat this as a research lead.

## Caveats

- This is an educational research workflow, not investment advice.
- Yahoo Finance is convenient but not institutional-grade point-in-time data.
- The ASX universe is curated, not a full survivorship-bias-free ASX membership history.
- Sector/theme/metal labels are research metadata, not official GICS history.
- Penny membership is dynamic by latest downloaded close and depends on the download date.
- Cross-alpha metrics use next-day return labels for evaluation. They do not include portfolio constraints, transaction costs, or tax drag unless `--full-backtests` is used for the portfolio stage.
- Small groups, especially three-name metal buckets, are noisy. Use the matrix to form hypotheses, then validate with broader data, longer windows, and portfolio backtests.

## Reproducibility Checklist

1. Inspect the downloaded ASX data:

```bash
quantbot data-files --bundle asx_yfinance --show-manifest
```

2. Inspect segment definitions:

```bash
python -B -m quantbot.cli run-preview \
  --run runs/asx_alpha_analysis_final \
  --dataset asx_segments.csv
```

3. Inspect self-trained alpha results:

```bash
python -B -m quantbot.cli run-preview \
  --run runs/asx_alpha_analysis_final \
  --dataset train_summary.csv
```

4. Inspect cross-alpha results:

```bash
python -B -m quantbot.cli run-preview \
  --run runs/asx_alpha_analysis_final \
  --dataset cross_alpha_matrix.csv
```

5. Validate code:

```bash
python -m pytest -q
```
