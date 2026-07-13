# Factor Math Guide

This guide documents each normalized factor built by `src/quantbot/factors/signals.py`, how its math works, and how it flows into alpha. For the full pipeline equations, see the [Math Reference](docs/MATH.md). For code ownership, see the [Python Module Reference](docs/PYTHON_REFERENCE.md#srcquantbotfactorssignalspy).

[Back to Documentation Contents](docs/CONTENTS.md#factor-guide) | [Worked Examples](docs/WORKED_EXAMPLES.md) | [Config Reference](docs/CONFIG.md) | [Glossary](docs/GLOSSARY.md)

## Contents

- [Shared factor pipeline](#shared-factor-pipeline)
- [Price momentum factors](#price-momentum-factors)
- [Liquidity factors](#liquidity-factors)
- [Fundamental factors](#fundamental-factors)
- [Event and vendor factors](#event-and-vendor-factors)
- [Macro regime factors](#macro-regime-factors)
- [How factors become alpha](#how-factors-become-alpha)
- [Plain speech factor reference](#plain-speech-factor-reference)

## Shared Factor Pipeline

Most factors follow the same path:

1. Build a raw point-in-time feature `x_{i,t}` using information available by date `t`.
2. Cross-sectionally standardize the raw feature by date, or by sector/date when configured.
3. Winsorize the standardized value so extreme observations do not dominate.
4. Multiply the normalized factor by a configured weight and effective information coefficient.
5. Scale the final score by clipped realized volatility to get an expected one-day return.

Cross-sectional z-score:

$$
z^x_{i,t}=\frac{x_{i,t}-\mu^x_t}{\sigma^x_t}
$$

Winsorized factor:

$$
\tilde z^x_{i,t}=\min(z_{\max},\max(-z_{\max},z^x_{i,t}))
$$

Sector-relative z-score used by fundamental components when enabled:

$$
z^{sector}_{i,t}(x)=
\frac{x_{i,t}-\mu_{sector(i),t}(x)}
{\sigma_{sector(i),t}(x)}
$$

## Price Momentum Factors

### momentum

**Idea:** Recent winners may continue to outperform over a short horizon.

**Raw feature:**

$$
momentum\_raw_{i,t}=\frac{P_{i,t-1}}{P_{i,t-L_m-1}}-1
$$

`L_m` comes from `signals.momentum_window`.

**Direction:** Higher is better before normalization.

**Source data:** `prices.csv` close prices.

**Caveat:** The feature uses `t-1`, not `t`, so the rebalance does not use same-day close-to-close information as if it were known before execution.

### reversal

**Idea:** Very recent winners can mean-revert over a short horizon.

**Raw feature:**

$$
reversal\_raw_{i,t}=
-\left(\frac{P_{i,t-1}}{P_{i,t-L_r-1}}-1\right)
$$

`L_r` comes from `signals.reversal_window`.

**Direction:** Higher means the stock recently fell more, so it receives a stronger contrarian score.

**Source data:** `prices.csv` close prices.

### momentum_63d

**Idea:** Medium-term trend over roughly one quarter.

**Raw feature:**

$$
momentum\_63d\_raw_{i,t}=\frac{P_{i,t-1}}{P_{i,t-64}}-1
$$

**Direction:** Higher is better.

**Source data:** `prices.csv` close prices.

### momentum_126d

**Idea:** Longer medium-term trend over roughly half a trading year.

**Raw feature:**

$$
momentum\_126d\_raw_{i,t}=\frac{P_{i,t-1}}{P_{i,t-127}}-1
$$

**Direction:** Higher is better.

**Source data:** `prices.csv` close prices.

### momentum_252d_skip_21d

**Idea:** Classic twelve-month momentum while skipping the most recent month to reduce short-term reversal contamination.

**Raw feature:**

$$
momentum\_252d\_skip\_21d\_raw_{i,t}=
\frac{P_{i,t-21}}{P_{i,t-252}}-1
$$

**Direction:** Higher is better.

**Source data:** `prices.csv` close prices.

**Caveat:** This needs a longer history. Sparse or short downloads may produce many nulls early in the sample.

### vol_adjusted_momentum

**Idea:** Prefer trend that is strong relative to recent realized volatility.

**Raw feature:**

$$
vol\_adjusted\_momentum\_raw_{i,t}=
\frac{momentum\_126d\_raw_{i,t}}{\sigma^{63d}_{i,t}}
$$

where:

$$
\sigma^{63d}_{i,t}=
\operatorname{Std}(r_{i,t-63:t-1})
$$

**Direction:** Higher is better.

**Source data:** `prices.csv` close prices and returns.

### moving_average_trend

**Idea:** A short moving average above a long moving average indicates positive trend.

**Raw feature:**

$$
moving\_average\_trend\_raw_{i,t}=
\frac{SMA_{50}(P_{i,t-1})}{SMA_{200}(P_{i,t-1})}-1
$$

**Direction:** Higher is better.

**Source data:** `prices.csv` close prices.

### drawdown_recovery

**Idea:** Stocks far below their trailing high receive a recovery-style score.

**Raw feature:**

$$
drawdown\_recovery\_raw_{i,t}=
-\left(\frac{P_{i,t-1}}{\max(P_{i,t-252:t-1})}-1\right)
$$

**Direction:** Higher means a deeper drawdown from the trailing high.

**Source data:** `prices.csv` close prices.

**Caveat:** This is intentionally contrarian. Whether it helps depends heavily on rolling IC learning.

### low_vol

**Idea:** Lower realized volatility can be rewarded as a defensive style factor.

**Raw feature:**

$$
low\_vol\_raw_{i,t}=-\sigma_{i,t}
$$

where:

$$
\sigma_{i,t}=
\operatorname{Std}(r_{i,t-L_\sigma:t-1})
$$

**Direction:** Higher means lower volatility.

**Source data:** `prices.csv` close prices and returns.

## Liquidity Factors

### liquidity

**Idea:** More liquid stocks may have more reliable execution and lower hidden costs.

**Raw feature:**

$$
liquidity\_raw_{i,t}=\log(1+ADV^{21}_{i,t})
$$

where:

$$
ADV^{21}_{i,t}=
\frac{1}{21}\sum_{\tau=t-20}^{t}P_{i,\tau}V_{i,\tau}
$$

**Direction:** Higher is more liquid.

**Source data:** `prices.csv` close and volume.

### liquidity_change

**Idea:** Rising liquidity can indicate improving participation or attention.

**Raw feature:**

$$
liquidity\_change\_raw_{i,t}=
\log(1+ADV^{21}_{i,t-1})-\log(1+ADV^{21}_{i,t-64})
$$

**Direction:** Higher means liquidity increased.

**Source data:** `prices.csv` close and volume.

## Fundamental Factors

Fundamental values are merged with `merge_asof` by security and date. A row can only affect a rebalance after its available date. Yahoo statement rows use a conservative statement lag.

### value

**Idea:** Cheaper companies by book, earnings, sales, or free cash flow may outperform.

**Components:**

$$
value_{i,t}=
\operatorname{mean}
\left(
z(B/P),z(E/P),z(Sales/P),z(FCF/P)
\right)
$$

**Direction:** Higher is cheaper or more attractive on value ratios.

**Source data:** `fundamentals.csv` columns `book_to_price`, `earnings_yield`, `sales_to_price`, and `fcf_yield`.

**Caveat:** Public Yahoo fundamentals are sparse. Missing components are neutral-filled after point-in-time merging.

### quality

**Idea:** More profitable, higher-margin, lower-debt companies may have stronger fundamentals.

**Components:**

$$
quality_{i,t}=
\operatorname{mean}
\left(
z(Profitability),
z(GrossMargin),
z(OperatingMargin),
z(ROE),
z(-Debt/Equity)
\right)
$$

**Direction:** Higher is better quality.

**Source data:** `fundamentals.csv` columns `profitability`, `gross_margin`, `operating_margin`, `roe`, and `debt_to_equity`.

### growth

**Idea:** Strong revenue and earnings growth may support positive future returns.

**Components:**

$$
growth_{i,t}=
\operatorname{mean}
\left(
z(RevenueGrowth),
z(EarningsGrowth)
\right)
$$

**Direction:** Higher is stronger growth.

**Source data:** `fundamentals.csv` columns `revenue_growth` and `earnings_growth`.

### dividend_yield

**Idea:** Trailing dividends relative to price can proxy income yield.

**Raw feature:**

$$
dividend\_yield\_raw_{i,t}=
\frac{\sum_{\tau=t-251}^{t}D_{i,\tau}}{P_{i,t}}
$$

**Direction:** Higher is stronger dividend yield.

**Source data:** Yahoo actions/dividends converted into `fundamentals.csv`.

## Event And Vendor Factors

### earnings_revision

**Idea:** Positive earnings surprises, EPS revisions, target-price upside, and upgrades can signal improving expectations.

**Components:**

$$
earnings\_revision_{i,t}=
\operatorname{mean}
\left(
z(EarningsSurprise),
z(EPSRevision),
z(TargetUpside),
z(UpgradeDowngradeScore)
\right)
$$

**Direction:** Higher is more positive revision pressure.

**Source data:** `fundamentals.csv`, `earnings.csv`, and `analyst_events.csv`.

**Caveat:** Analyst and earnings data can be very sparse in public Yahoo endpoints.

### alt_sentiment

**Idea:** Vendor sentiment can add a non-price signal when mapped point-in-time to internal security IDs.

**Raw feature:**

$$
alt\_sentiment\_raw\_signal_{i,t}=
\text{latest mapped vendor sentiment known as of }t
$$

After point-in-time mapping, the value is cross-sectionally normalized:

$$
alt\_sentiment_{i,t}=
\operatorname{winsorized\_zscore}(alt\_sentiment\_raw\_signal_{i,t})
$$

**Direction:** Higher is more positive sentiment.

**Source data:** `vendor_entities.csv` plus `entity_mapping.csv`.

**Caveat:** This factor depends on `point_in_time_match`; do not replace the mapping with a latest ticker join.

## Macro Regime Factors

These optional factors are inspired by Hartigan and Morley's RBA inflation-targeting analysis, which treats the economy as a panel driven by common real and nominal factors and studies how inflation targeting changes common volatility. In QuantBot they are not direct stock factors. They become cross-sectional only by interacting lagged macro states with asset-level traits such as realized volatility and trend.

Enable them with `signals.macro_enabled: true` and provide `data/<root>/macro.csv`. Macro observations are merged as-of by `date + signals.macro_asof_lag_days`, so a release cannot affect a rebalance before it is available.

Expected `macro.csv` columns are flexible:

| Concept | Preferred column | Accepted aliases |
|---|---|---|
| CPI inflation year over year | `cpi_inflation_yoy` | `inflation_yoy`, `trimmed_mean_inflation_yoy` |
| Policy rate | `cash_rate` | `policy_rate`, `overnight_cash_rate` |
| Real common factor | `real_activity_factor` | `real_factor`, `activity_factor` |
| Nominal common factor | `nominal_factor` | `nominal_pressure_factor`, `price_factor` |
| Common volatility | `common_volatility` | `macro_common_volatility` |

### macro_inflation_defensive

**Idea:** When inflation is far from target or common macro volatility is elevated, prefer lower-volatility assets.

**Raw feature:**

$$
macro\_inflation\_defensive\_raw_{i,t}=
\left(z_t(|\pi-target|)+z_t(commonVol)^+\right)(-\sigma_{i,t})
$$

**Direction:** Higher favors lower realized volatility during inflation-target stress.

**Source data:** `macro.csv` plus `prices.csv`.

### macro_policy_pressure_defensive

**Idea:** When inflation pressure and policy tightening rise together, prefer defensive low-volatility exposure.

**Raw feature:**

$$
macro\_policy\_pressure\_defensive\_raw_{i,t}=
z_t(|\pi-target|+\max(\Delta cashRate,0))(-\sigma_{i,t})
$$

**Direction:** Higher favors lower realized volatility when policy pressure is high.

**Source data:** `macro.csv` plus `prices.csv`.

### macro_real_activity_trend

**Idea:** When the real activity factor is strong, reward existing medium-term price trend; when it is weak, the same trend exposure is naturally dampened or inverted by the learned IC.

**Raw feature:**

$$
macro\_real\_activity\_trend\_raw_{i,t}=
z_t(realActivity) \times momentum\_126d\_raw_{i,t}
$$

**Direction:** Higher favors assets with positive trend in stronger real-activity regimes.

**Source data:** `macro.csv` plus `prices.csv`.

## How Factors Become Alpha

The configured factor weights are normalized by absolute weight:

$$
\tilde a_f=\frac{a_f}{\sum_f |a_f|}
$$

Each factor contributes:

$$
contribution_{f,i,t}=
\tilde a_f IC^{eff}_{f,t} z^f_{i,t}
$$

The alpha score is the sum of contributions:

$$
score_{i,t}=
\sum_f contribution_{f,i,t}
$$

The expected one-day return forecast is:

$$
\mu_{i,t}=score_{i,t}\cdot \tilde\sigma_{i,t}
$$

where:

$$
\tilde\sigma_{i,t}=\min(0.08,\max(0.003,\sigma_{i,t}))
$$

The optimizer receives `\mu_{i,t}` as expected return. Risk, turnover, gross exposure, active exposure, transaction costs, and tax drag then determine whether the forecast produces a trade.

## Plain Speech Factor Reference

[Back to Documentation Contents](docs/CONTENTS.md#factor-guide)

This section restates every factor in a teaching format. Each equation is followed by a plain-speech version.

### IC In Plain Speech

Information coefficient asks: "When this factor gave higher scores, did those stocks earn higher future returns?"

Daily IC:

$$
IC_{f,t}=\operatorname{Corr}(z^f_{i,t},r_{i,t+1})
$$

Plain speech version: for one factor on one date, compare all stocks' factor scores today with their next-day returns and calculate the correlation.

Rolling IC:

$$
IC^{roll}_{f,t}=
\operatorname{Corr}(z^f_{i,\tau},r_{i,\tau+1})
\quad \tau<t,\quad \tau\in[t-L_{IC},t)
$$

Plain speech version: before trading on date `t`, look backward over the recent window and ask whether the factor has recently predicted next-day returns.

<details>
<summary>Worked example: IC across stocks</summary>

Suppose today's factor scores and tomorrow's returns are:

| Ticker | Score today | Return tomorrow |
|---|---:|---:|
| AAA | 1.0 | 1.2% |
| BBB | 0.0 | 0.2% |
| CCC | -1.0 | -0.5% |

Higher scores lined up with higher next-day returns, so the IC is positive. QuantBot repeats this through history and uses the rolling IC as a factor skill estimate.

</details>

### momentum Plain Speech

Equation:

$$
momentum\_raw_{i,t}=\frac{P_{i,t-1}}{P_{i,t-L_m-1}}-1
$$

Plain speech version: take yesterday's price, divide it by the price at the start of the lookback window, then subtract one.

Worked example: if yesterday was `$110` and the earlier price was `$100`, raw momentum is `10%`.

[Back to factor list](#contents)

### reversal Plain Speech

Equation:

$$
reversal\_raw_{i,t}=
-\left(\frac{P_{i,t-1}}{P_{i,t-L_r-1}}-1\right)
$$

Plain speech version: calculate recent return, then flip the sign. Recent losers get higher scores.

Worked example: if a stock fell from `$100` to `$95`, recent return is `-5%`, so reversal score is `+5%`.

[Back to factor list](#contents)

### momentum_63d Plain Speech

Equation:

$$
momentum\_63d\_raw_{i,t}=\frac{P_{i,t-1}}{P_{i,t-64}}-1
$$

Plain speech version: compare yesterday's price with the price roughly one quarter earlier.

[Back to factor list](#contents)

### momentum_126d Plain Speech

Equation:

$$
momentum\_126d\_raw_{i,t}=\frac{P_{i,t-1}}{P_{i,t-127}}-1
$$

Plain speech version: compare yesterday's price with the price roughly half a trading year earlier.

[Back to factor list](#contents)

### momentum_252d_skip_21d Plain Speech

Equation:

$$
momentum\_252d\_skip\_21d\_raw_{i,t}=
\frac{P_{i,t-21}}{P_{i,t-252}}-1
$$

Plain speech version: compare the price about one month ago with the price about one year ago. The most recent month is skipped.

<details>
<summary>Worked example: skip-month momentum</summary>

If the price 21 trading days ago was `$120` and the price 252 trading days ago was `$100`:

$$
\frac{120}{100}-1=0.20
$$

Plain speech: the stock was up `20%` over the long window, excluding the most recent month.

</details>

[Back to factor list](#contents)

### vol_adjusted_momentum Plain Speech

Equation:

$$
vol\_adjusted\_momentum\_raw_{i,t}=
\frac{momentum\_126d\_raw_{i,t}}{\sigma^{63d}_{i,t}}
$$

Plain speech version: divide medium-term momentum by recent volatility. Smooth momentum scores better than jumpy momentum.

Worked example: `12% / 2% = 6`; `12% / 4% = 3`. The same return with less volatility gets the higher score.

[Back to factor list](#contents)

### moving_average_trend Plain Speech

Equation:

$$
moving\_average\_trend\_raw_{i,t}=
\frac{SMA_{50}(P_{i,t-1})}{SMA_{200}(P_{i,t-1})}-1
$$

Plain speech version: compare the short moving average with the long moving average. Positive means the short average is above the long average.

[Back to factor list](#contents)

### drawdown_recovery Plain Speech

Equation:

$$
drawdown\_recovery\_raw_{i,t}=
-\left(\frac{P_{i,t-1}}{\max(P_{i,t-252:t-1})}-1\right)
$$

Plain speech version: calculate how far the stock is below its one-year high, then flip the sign so deeper drawdowns become higher recovery scores.

Worked example: price `$80`, trailing high `$100`: `-(80/100 - 1) = 20%`.

[Back to factor list](#contents)

### low_vol Plain Speech

Equation:

$$
low\_vol\_raw_{i,t}=-\sigma_{i,t}
$$

Plain speech version: calculate realized volatility and multiply by `-1`; lower volatility becomes a higher score.

[Back to factor list](#contents)

### liquidity Plain Speech

Equation:

$$
liquidity\_raw_{i,t}=\log(1+ADV^{21}_{i,t})
$$

Plain speech version: calculate 21-day average dollar volume, add one, and take the natural log so very large stocks do not overwhelm the scale.

Worked example: if average dollar volume is `$10,000,000`, the raw value is `log(10,000,001)`.

[Back to factor list](#contents)

### liquidity_change Plain Speech

Equation:

$$
liquidity\_change\_raw_{i,t}=
\log(1+ADV^{21}_{i,t-1})-\log(1+ADV^{21}_{i,t-64})
$$

Plain speech version: compare recent liquidity with liquidity about a quarter earlier.

[Back to factor list](#contents)

### value Plain Speech

Equation:

$$
value_{i,t}=
\operatorname{mean}
\left(
z(B/P),z(E/P),z(Sales/P),z(FCF/P)
\right)
$$

Plain speech version: standardize book-to-price, earnings yield, sales-to-price, and free-cash-flow yield, then average them.

<details>
<summary>Worked example: value composite</summary>

If the component z-scores are `0.8`, `0.4`, `1.1`, and `-0.1`:

$$
value=\frac{0.8+0.4+1.1-0.1}{4}=0.55
$$

Plain speech: the stock is moderately cheap relative to peers.

</details>

[Back to factor list](#contents)

### quality Plain Speech

Equation:

$$
quality_{i,t}=
\operatorname{mean}
\left(
z(Profitability),
z(GrossMargin),
z(OperatingMargin),
z(ROE),
z(-Debt/Equity)
\right)
$$

Plain speech version: standardize profitability, margins, ROE, and low debt, then average them.

[Back to factor list](#contents)

### growth Plain Speech

Equation:

$$
growth_{i,t}=
\operatorname{mean}
\left(
z(RevenueGrowth),
z(EarningsGrowth)
\right)
$$

Plain speech version: standardize revenue growth and earnings growth, then average them.

[Back to factor list](#contents)

### dividend_yield Plain Speech

Equation:

$$
dividend\_yield\_raw_{i,t}=
\frac{\sum_{\tau=t-251}^{t}D_{i,\tau}}{P_{i,t}}
$$

Plain speech version: add up the last year of dividends and divide by current price.

Worked example: `$2` dividends divided by `$50` price equals `4%`.

[Back to factor list](#contents)

### earnings_revision Plain Speech

Equation:

$$
earnings\_revision_{i,t}=
\operatorname{mean}
\left(
z(EarningsSurprise),
z(EPSRevision),
z(TargetUpside),
z(UpgradeDowngradeScore)
\right)
$$

Plain speech version: standardize earnings surprise, EPS revision, target-price upside, and upgrade/downgrade score, then average them.

[Back to factor list](#contents)

### alt_sentiment Plain Speech

Equation:

$$
alt\_sentiment\_raw\_signal_{i,t}=
\text{latest mapped vendor sentiment known as of }t
$$

Plain speech version: use the latest vendor sentiment value that was valid for this security as of the current date.

Normalized equation:

$$
alt\_sentiment_{i,t}=
\operatorname{winsorized\_zscore}(alt\_sentiment\_raw\_signal_{i,t})
$$

Plain speech version: compare each stock's sentiment with the other stocks on the same date, then cap extremes.

[Back to factor list](#contents)

### Alpha Worked Example

Factor contribution:

$$
contribution_{f,i,t}=
\tilde a_f IC^{eff}_{f,t} z^f_{i,t}
$$

Plain speech version: multiply the factor's normalized weight by its skill estimate and the stock's factor score.

<details>
<summary>Worked example: factor score to expected return</summary>

Assume:

| Item | Value |
|---|---:|
| momentum score | 1.0 |
| value score | 0.5 |
| momentum normalized weight | 0.60 |
| value normalized weight | 0.40 |
| momentum effective IC | 0.020 |
| value effective IC | 0.015 |
| clipped daily volatility | 0.020 |

Alpha score:

$$
score=(0.60)(0.020)(1.0)+(0.40)(0.015)(0.5)=0.015
$$

Expected return:

$$
\mu=0.015 \times 0.020=0.0003
$$

Plain speech: the model forecasts about `0.03%`, or 3 basis points, for the next day before the optimizer applies risk, turnover, and cost constraints.

</details>

[Back to Documentation Contents](docs/CONTENTS.md#factor-guide)
