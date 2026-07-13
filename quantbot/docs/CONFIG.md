# Config YAML Reference

[Back to Documentation Contents](docs/CONTENTS.md#configuration) | [Math Reference](docs/MATH.md) | [Factor Math Guide](docs/FACTORS.md) | [Worked Examples](docs/WORKED_EXAMPLES.md) | [Glossary](docs/GLOSSARY.md)

This page explains the config YAML files under `configs/`. The default user workflow is `configs/default.yaml`; the small deterministic test workflow is `configs/test.yaml`.

## How To Read A Config

The config is split into sections:

- [`project`](#project)
- [`data`](#data)
- [`signals`](#signals)
- [`alpha`](#alpha)
- [`risk`](#risk)
- [`portfolio`](#portfolio)
- [`execution`](#execution)
- [`backtest`](#backtest)
- [`logging`](#logging)

Each section maps directly to dataclasses in [`src/quantbot/config.py`](docs/PYTHON_REFERENCE.md#srcquantbotconfigpy).

## project

```yaml
project:
  name: quant-factor-bot-yfinance
  timezone: Australia/Melbourne
```

| Key | Plain speech |
|---|---|
| `name` | Human-readable project/run family name. |
| `timezone` | Timezone label used for project metadata. Dates in CSVs are still treated as trading dates. |

[Back to config sections](#how-to-read-a-config)

## data

```yaml
data:
  root: data/yfinance
  prices: prices.csv
  fundamentals: fundamentals.csv
  security_master: security_master.csv
  vendor_entities: vendor_entities.csv
  entity_mapping: entity_mapping.csv
  macro: macro.csv
  min_price: 5.0
  min_dollar_volume: 1000000
  max_missing_rate: 0.05
  audit_zscore_threshold: 6.0
```

| Key | Plain speech | Related docs |
|---|---|---|
| `root` | Folder containing the data bundle. | [Runbook downloads](docs/RUNBOOK.md#2-get-yahoo-finance-data) |
| `prices` | Price CSV filename. | [Returns math](docs/MATH.md#returns-and-universe) |
| `fundamentals` | Fundamental factor CSV filename. | [Fundamental factors](docs/FACTORS.md#fundamental-factors) |
| `security_master` | Security identity table. | [Point-in-time matching](docs/MATH.md#point-in-time-matching) |
| `vendor_entities` | Raw vendor/entity signal table. | [alt_sentiment](docs/FACTORS.md#altsentiment) |
| `entity_mapping` | Raw-entity-to-SID validity map. | [Point-in-time matching](docs/MATH.md#point-in-time-matching) |
| `macro` | Optional macro panel used for inflation-targeting regime factors. | [Macro regime factors](docs/FACTORS.md#macro-regime-factors) |
| `actions`, `profile`, `earnings`, `analyst_events`, `holders`, `options_snapshot` | Optional rich Yahoo tables. | [Rich Yahoo signals](docs/MATH.md#rich-yahoo-finance-signals) |
| `min_price` | Stocks below this price are excluded from the tradable universe. | [Universe math](docs/MATH.md#returns-and-universe) |
| `min_dollar_volume` | Stocks below this 21-day average dollar volume are excluded. | [liquidity](docs/FACTORS.md#liquidity) |
| `max_missing_rate` | Audit threshold for required column missingness. | [Data audit module](docs/PYTHON_REFERENCE.md#srcquantbotdataauditpy) |
| `audit_zscore_threshold` | Audit warning threshold for extreme numeric values. | [Data audit module](docs/PYTHON_REFERENCE.md#srcquantbotdataauditpy) |

[Back to config sections](#how-to-read-a-config)

## signals

```yaml
signals:
  momentum_window: 21
  reversal_window: 5
  volatility_window: 21
  medium_momentum_window: 63
  long_momentum_window: 126
  skip_momentum_window: 252
  skip_recent_window: 21
  moving_average_short_window: 50
  moving_average_long_window: 200
  liquidity_change_window: 63
  winsorize_z: 4.0
  sector_relative_fundamentals: true
  macro_enabled: false
  macro_asof_lag_days: 1
  inflation_target_midpoint: 0.025
  macro_common_vol_window: 8
  macro_common_vol_min_periods: 4
```

Plain speech: this section controls how raw factor signals are built before alpha uses them.

| Key | Plain speech | Factor |
|---|---|---|
| `momentum_window` | Lookback for short momentum. | [momentum](docs/FACTORS.md#momentum) |
| `reversal_window` | Lookback for short reversal. | [reversal](docs/FACTORS.md#reversal) |
| `volatility_window` | Lookback for realized volatility and low-vol. | [low_vol](docs/FACTORS.md#lowvol) |
| `medium_momentum_window` | Lookback for `momentum_63d`. | [momentum_63d](docs/FACTORS.md#momentum63d) |
| `long_momentum_window` | Lookback for `momentum_126d`. | [momentum_126d](docs/FACTORS.md#momentum126d) |
| `skip_momentum_window` | Long lookback for skip-month momentum. | [momentum_252d_skip_21d](docs/FACTORS.md#momentum252dskip21d) |
| `skip_recent_window` | Recent window skipped by long momentum. | [momentum_252d_skip_21d](docs/FACTORS.md#momentum252dskip21d) |
| `moving_average_short_window` | Short moving average length. | [moving_average_trend](docs/FACTORS.md#movingaveragetrend) |
| `moving_average_long_window` | Long moving average length. | [moving_average_trend](docs/FACTORS.md#movingaveragetrend) |
| `liquidity_change_window` | Lookback for liquidity change comparison. | [liquidity_change](docs/FACTORS.md#liquiditychange) |
| `winsorize_z` | Maximum absolute normalized score after capping. | [Shared factor pipeline](docs/FACTORS.md#shared-factor-pipeline) |
| `sector_relative_fundamentals` | If true, fundamental components are z-scored within sector/date groups. | [Fundamental factors](docs/FACTORS.md#fundamental-factors) |
| `macro_enabled` | If true, require `macro.csv` and build the inflation-targeting macro factor family. | [Macro regime factors](docs/FACTORS.md#macro-regime-factors) |
| `macro_asof_lag_days` | Calendar-day release lag applied before a macro observation is available to signals. | [Point-in-time matching](docs/MATH.md#point-in-time-matching) |
| `inflation_target_midpoint` | Inflation target midpoint used to compute the CPI target gap. `0.025` represents 2.5%. | [Macro regime factors](docs/FACTORS.md#macro-regime-factors) |
| `macro_common_vol_window` | Rolling macro window used for common-volatility and macro z-score estimates. | [Macro regime factors](docs/FACTORS.md#macro-regime-factors) |
| `macro_common_vol_min_periods` | Minimum macro observations before rolling macro z-scores become active. | [Macro regime factors](docs/FACTORS.md#macro-regime-factors) |

<details>
<summary>Worked example: changing `momentum_window`</summary>

If `momentum_window` is `21`, the raw factor compares yesterday's price with the price 22 trading days ago:

$$
momentum\_raw_{i,t}=\frac{P_{i,t-1}}{P_{i,t-22}}-1
$$

If you change it to `63`, the same factor becomes a roughly quarterly momentum signal.

</details>

[Back to config sections](#how-to-read-a-config)

## alpha

```yaml
alpha:
  annualization: 252
  factors:
    momentum_252d_skip_21d: 0.22
    value: 0.10
  information_coefficients:
    momentum_252d_skip_21d: 0.020
    value: 0.015
  rolling_ic_enabled: true
  rolling_ic_lookback_days: 252
  rolling_ic_min_observations: 80
  rolling_ic_clip_abs: 0.08
  rolling_ic_weight: 0.75
  rolling_ic_min_abs: 0.003
  negative_ic_policy: zero
```

Plain speech: this section controls how factor scores become expected return forecasts.

| Key | Plain speech | Related docs |
|---|---|---|
| `annualization` | Trading days per year for annualizing metrics. | [Performance metrics](docs/MATH.md#performance-metrics) |
| `factors` | Configured factor weights before normalization. | [How factors become alpha](docs/FACTORS.md#how-factors-become-alpha) |
| `information_coefficients` | Prior skill estimates for each factor. | [IC explanation](docs/FACTORS.md#ic-in-plain-speech) |
| `rolling_ic_enabled` | Whether to learn recent factor IC from history. | [Rolling IC learning](docs/MATH.md#rolling-ic-learning) |
| `rolling_ic_lookback_days` | Historical window for rolling IC. | [Rolling IC learning](docs/MATH.md#rolling-ic-learning) |
| `rolling_ic_min_observations` | Minimum rows required before trusting rolling IC. | [IC explanation](docs/FACTORS.md#ic-in-plain-speech) |
| `rolling_ic_clip_abs` | Maximum absolute rolling IC before clipping. | [Rolling IC learning](docs/MATH.md#rolling-ic-learning) |
| `rolling_ic_weight` | Blend weight on rolling IC versus prior IC. | [Alpha forecast](docs/MATH.md#alpha-forecast) |
| `rolling_ic_min_abs` | Ignores tiny rolling IC values as noise. | [IC explanation](docs/FACTORS.md#ic-in-plain-speech) |
| `negative_ic_policy` | `allow`, `zero`, or `flip` negative learned ICs. | [Rolling IC learning](docs/MATH.md#rolling-ic-learning) |

<details>
<summary>Worked example: factor contribution</summary>

If a factor has normalized weight `0.40`, effective IC `0.015`, and stock score `1.2`:

$$
contribution=0.40 \times 0.015 \times 1.2 = 0.0072
$$

Plain speech: that factor adds `0.0072` to the stock's alpha score before volatility scaling.

</details>

[Back to config sections](#how-to-read-a-config)

## risk

```yaml
risk:
  lookback_days: 63
  shrinkage: 0.1
  min_specific_variance: 1.0e-06
  style_factors:
    - momentum_252d_skip_21d
    - value
    - quality
    - low_vol
    - growth
```

Plain speech: this section controls the covariance matrix used by the optimizer.

| Key | Plain speech | Related docs |
|---|---|---|
| `lookback_days` | Historical return window for covariance estimation. | [Risk model](docs/MATH.md#risk-model) |
| `shrinkage` | Pulls factor covariance toward its diagonal to reduce noisy correlations. | [Risk model](docs/MATH.md#risk-model) |
| `min_specific_variance` | Floor for stock-specific variance. | [Risk model](docs/MATH.md#risk-model) |
| `style_factors` | Factor columns included as risk exposures. | [Risk module](docs/PYTHON_REFERENCE.md#srcquantbotriskmodelpy) |

[Back to config sections](#how-to-read-a-config)

## portfolio

```yaml
portfolio:
  mode: benchmark_active
  rebalance_every_n_days: 5
  risk_aversion: 8.0
  cost_aversion: 0.02
  gross_limit: 1.0
  max_position_abs: 0.2
  max_turnover: 0.5
  active_gross_limit: 0.6
  active_weight_abs_limit: 0.1
  solver: auto
  optimizer_max_assets: 10
```

Plain speech: this section controls how expected returns are converted into portfolio weights.

| Key | Plain speech | Related docs |
|---|---|---|
| `mode` | Portfolio style: `benchmark_active`, `long_only`, or `long_short`. | [Optimizer](docs/MATH.md#optimizer) |
| `rebalance_every_n_days` | How often to recompute target weights. | [Backtest engine](docs/PYTHON_REFERENCE.md#srcquantbotbacktestenginepy) |
| `risk_aversion` | Higher means the optimizer dislikes risk more. | [Optimizer](docs/MATH.md#optimizer) |
| `cost_aversion` | Higher means the optimizer dislikes trading costs more. | [Execution and costs](docs/MATH.md#execution-and-costs) |
| `gross_limit` | Maximum sum of absolute weights. | [Optimizer](docs/MATH.md#optimizer) |
| `target_net_exposure` | Net exposure target for long/short mode. | [Optimizer](docs/MATH.md#optimizer) |
| `long_only_net_exposure` | Net exposure target for long-only mode. | [Optimizer](docs/MATH.md#optimizer) |
| `max_position_abs` | Maximum absolute weight per stock. | [Optimizer](docs/MATH.md#optimizer) |
| `max_turnover` | Maximum total trade size on a rebalance. | [Execution and costs](docs/MATH.md#execution-and-costs) |
| `sector_neutral` | If true, constrains sector exposures. | [Optimizer](docs/MATH.md#optimizer) |
| `active_gross_limit` | Maximum total active weight versus benchmark. | [Optimizer](docs/MATH.md#optimizer) |
| `active_weight_abs_limit` | Maximum per-stock active weight. | [Optimizer](docs/MATH.md#optimizer) |
| `long_only_benchmark_relative` | Makes long-only risk benchmark-relative. | [Optimizer](docs/MATH.md#optimizer) |
| `solver` | `auto`, `cvxpy_osqp`, or `scipy_slsqp_qp`. | [Optimizer module](docs/PYTHON_REFERENCE.md#srcquantbotportfoliooptimizerpy) |
| `solver_max_iter` | Maximum solver iterations. | [Optimizer module](docs/PYTHON_REFERENCE.md#srcquantbotportfoliooptimizerpy) |
| `solver_ftol` | Solver tolerance. | [Optimizer module](docs/PYTHON_REFERENCE.md#srcquantbotportfoliooptimizerpy) |
| `solver_retry_on_inaccurate` | Retry OSQP inaccurate status with SciPy in auto mode. | [Runbook solver warnings](docs/RUNBOOK.md#solver-warnings-and-numerical-accuracy) |
| `solver_verbose` | Print solver details for debugging. | [Runbook solver warnings](docs/RUNBOOK.md#solver-warnings-and-numerical-accuracy) |
| `fallback_to_projected` | Allows projected fallback if optimization fails. | [Optimizer module](docs/PYTHON_REFERENCE.md#srcquantbotportfoliooptimizerpy) |
| `optimizer_max_assets` | Candidate cap before solving the QP. Use `null` for full universe. | [Optimizer module](docs/PYTHON_REFERENCE.md#srcquantbotportfoliooptimizerpy) |
| `fixed_weights` | Optional explicit target portfolio by ticker or SID. | [Backtest engine](docs/PYTHON_REFERENCE.md#srcquantbotbacktestenginepy) |

[Back to config sections](#how-to-read-a-config)

## execution

```yaml
execution:
  commission_bps: 0.5
  half_spread_bps: 2.0
  impact_bps_per_pct_adv: 8.0
  cgt_tax_rate: 0.30
```

Plain speech: this section controls simulated trading drag.

| Key | Plain speech | Related docs |
|---|---|---|
| `commission_bps` | Broker/exchange commission in basis points. | [Execution and costs](docs/MATH.md#execution-and-costs) |
| `half_spread_bps` | Half the bid/ask spread paid on trades. | [Execution and costs](docs/MATH.md#execution-and-costs) |
| `impact_bps_per_pct_adv` | Market impact slope by percent of average dollar volume. | [Execution and costs](docs/MATH.md#execution-and-costs) |
| `cgt_tax_rate` | Tax drag on realized profitable sells. Set `0.0` to disable. | [Execution module](docs/PYTHON_REFERENCE.md#srcquantbotexecutionsimulatorpy) |

[Back to config sections](#how-to-read-a-config)

## backtest

```yaml
backtest:
  min_universe_size: 2
  initial_capital: 1000000
  start_date: '2021-01-01'
  end_date: '2024-12-31'
```

| Key | Plain speech |
|---|---|
| `min_universe_size` | Minimum tradable stocks needed for a backtest day. |
| `initial_capital` | Starting equity for equity-curve calculations. |
| `start_date` | First date included in the backtest window. |
| `end_date` | Last date included in the backtest window. |

[Back to config sections](#how-to-read-a-config)

## logging

```yaml
logging:
  enabled: true
  full_variable_values: true
```

| Key | Plain speech | Related docs |
|---|---|---|
| `enabled` | Writes run manifests, resolved config, data manifest, audit findings, and calculation trace. | [Run logging](docs/MATH.md#run-logging) |
| `full_variable_values` | Writes full variable CSVs under `logs/variables/`. | [Run logging module](docs/PYTHON_REFERENCE.md#srcquantbotrunloggingpy) |

[Back to Documentation Contents](docs/CONTENTS.md#configuration)
