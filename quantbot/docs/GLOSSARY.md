# Glossary

[Back to Documentation Contents](docs/CONTENTS.md#glossary) | [Math Reference](docs/MATH.md) | [Factor Math Guide](docs/FACTORS.md) | [Worked Examples](docs/WORKED_EXAMPLES.md) | [Config Reference](docs/CONFIG.md)

## Alpha

Plain speech: the model's expected edge before risk and cost constraints. In this project, alpha starts as normalized factor scores, gets scaled by factor IC, and becomes an expected one-day return forecast.

Related: [Alpha forecast](docs/MATH.md#alpha-forecast), [How factors become alpha](docs/FACTORS.md#how-factors-become-alpha)

## Active Return

Plain speech: portfolio return minus benchmark return.

Equation:

$$
AR_t=R_{p,t}-R_{b,t}
$$

## Active Risk

Plain speech: volatility of active return. It measures how much the portfolio differs from the benchmark in return space.

Related: [Performance metrics](docs/MATH.md#performance-metrics)

## Active Weight

Plain speech: portfolio weight minus benchmark weight for the same stock.

Equation:

$$
a_i=w_i-b_i
$$

## ADV

Average dollar volume. Plain speech: average daily traded dollars, usually `price * volume`, over a recent window.

Related: [liquidity](docs/FACTORS.md#liquidity)

## Basis Point

One basis point is `0.01%`, or `0.0001` as a decimal. Transaction costs are often expressed in basis points.

## Benchmark

Plain speech: the comparison portfolio. QuantBot usually uses an equal-weight benchmark over the optimizer universe.

## Benchmark-Active

Plain speech: portfolio mode that stays long-only and fully invested, but optimizes active tilts versus the equal-weight benchmark.

Related: [Optimizer](docs/MATH.md#optimizer), [portfolio config](docs/CONFIG.md#portfolio)

## Capital Gains Tax Drag

Plain speech: simulated tax cost when selling profitable long positions.

Related: [execution config](docs/CONFIG.md#execution)

## Cross-Sectional

Plain speech: across stocks on the same date. A cross-sectional z-score compares one stock with other stocks on that day.

## Drawdown

Plain speech: percentage decline from the previous equity high.

Equation:

$$
drawdown_t=\frac{E_t}{\max_{\tau\le t}E_\tau}-1
$$

## Effective IC

Plain speech: the IC value QuantBot actually uses for a factor after blending prior IC and rolling IC, clipping, and negative-IC policy.

Related: [IC in plain speech](docs/FACTORS.md#ic-in-plain-speech)

## Factor

Plain speech: a measurable stock characteristic used to rank stocks, such as momentum, value, quality, liquidity, or sentiment.

Related: [Factor Math Guide](docs/FACTORS.md)

## Gross Exposure

Plain speech: sum of absolute portfolio weights.

Equation:

$$
gross=\sum_i |w_i|
$$

## IC

Information coefficient. Plain speech: correlation between factor scores and future returns.

Equation:

$$
IC_{f,t}=\operatorname{Corr}(z^f_{i,t},r_{i,t+1})
$$

Related: [IC explanation](docs/FACTORS.md#ic-in-plain-speech)

## Information Ratio

Plain speech: active return per unit of active risk.

Equation:

$$
IR=
\frac{252\cdot\operatorname{Mean}(AR_t)}
{\operatorname{Std}(AR_t)\sqrt{252}}
$$

## Lookahead Bias

Plain speech: accidentally using information that would not have been known at the time of the decision.

Related: [Point-in-time matching](docs/MATH.md#point-in-time-matching)

## Net Exposure

Plain speech: sum of portfolio weights. A fully invested long-only book has net exposure near `1.0`; a market-neutral long/short book has net exposure near `0.0`.

## Point-In-Time

Plain speech: using only data that was available as of the decision date.

Related: [Point-in-time matching](docs/MATH.md#point-in-time-matching)

## QP

Quadratic program. Plain speech: an optimization problem with a quadratic risk penalty and linear constraints.

Related: [Optimizer](docs/MATH.md#optimizer)

## Rebalance

Plain speech: a date when the system recomputes target weights and trades toward them.

Related: [portfolio config](docs/CONFIG.md#portfolio)

## Rolling IC

Plain speech: recent historical IC measured over a moving lookback window before the current rebalance.

Related: [Rolling IC learning](docs/MATH.md#rolling-ic-learning)

## Sharpe-Like Thinking

Plain speech: comparing return to risk. QuantBot reports information ratio for benchmark-relative performance.

## Shortfall

Plain speech: return lost to estimated trading costs and tax drag.

Related: [Execution and costs](docs/MATH.md#execution-and-costs)

## SID

Security ID. Plain speech: internal stable identifier used after mapping raw vendor entities or tickers.

## Turnover

Plain speech: total absolute change in portfolio weights on a rebalance.

Equation:

$$
turnover_t=\sum_i |w^{target}_{i,t}-w^{current}_{i,t}|
$$

## Winsorization

Plain speech: capping extreme values so outliers do not dominate.

Related: [Shared factor pipeline](docs/FACTORS.md#shared-factor-pipeline)

## Z-Score

Plain speech: number of standard deviations above or below a group average.

Equation:

$$
z=\frac{x-\mu}{\sigma}
$$

[Back to Documentation Contents](docs/CONTENTS.md#glossary)
