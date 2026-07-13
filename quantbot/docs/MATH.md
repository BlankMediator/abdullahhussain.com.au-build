# Quant Factor Bot Math Reference

This page records the equations behind the CSV variables and run logs. Display equations use LaTeX delimiters so the browser docs tab can render them as math blocks.

## Contents

- [Notation](#notation)
- [Returns and universe](#returns-and-universe)
- [Point-in-time matching](#point-in-time-matching)
- [Price and liquidity signals](#price-and-liquidity-signals)
- [Rich Yahoo Finance signals](#rich-yahoo-finance-signals)
- [Rolling IC learning](#rolling-ic-learning)
- [Alpha forecast](#alpha-forecast)
- [Risk model](#risk-model)
- [Optimizer](#optimizer)
- [Execution and costs](#execution-and-costs)
- [Performance metrics](#performance-metrics)
- [Run logging](#run-logging)
- [Plain speech equation companion](#plain-speech-equation-companion)

Related docs: [Documentation Contents](docs/CONTENTS.md#math-and-modeling), [Worked Examples](docs/WORKED_EXAMPLES.md), [Factor Math Guide](docs/FACTORS.md), [Config Reference](docs/CONFIG.md), [Glossary](docs/GLOSSARY.md), [Architecture](docs/ARCHITECTURE.md).

## Notation

- `i`: security
- `t`: date
- `f`: alpha factor
- `k`: risk factor
- `P_{i,t}`: close price
- `V_{i,t}`: volume
- `r_{i,t}`: daily return
- `w_t`: portfolio weights
- `b_t`: benchmark weights
- `\Sigma_t`: asset covariance matrix
- `\mu_t`: expected one-day return forecast

## Returns And Universe

Daily return:

$$
r_{i,t}=\frac{P_{i,t}}{P_{i,t-1}}-1
$$

Dollar volume:

$$
DV_{i,t}=P_{i,t}V_{i,t}
$$

Average dollar volume:

$$
ADV^{21}_{i,t}=\frac{1}{21}\sum_{\tau=t-20}^{t}DV_{i,\tau}
$$

Universe membership:

$$
I_{i,t}=
1[P_{i,t}\ge P_{\min}]
1[ADV^{21}_{i,t}\ge ADV_{\min}]
1[\text{required fields present}]
$$

## Point-In-Time Matching

A vendor entity maps to an internal security only when the mapping was valid as of the observation date:

$$
sid_{e,t}=sid_j
\quad\text{s.t.}\quad
entity_j=e,\quad valid\_from_j\le t\le valid\_to_j
$$

If multiple rows overlap, the latest valid-from date wins:

$$
j^*=\arg\max_j valid\_from_j
$$

## Price And Liquidity Signals

Momentum:

$$
momentum_{i,t}=\frac{P_{i,t-1}}{P_{i,t-L_m-1}}-1
$$

Reversal:

$$
reversal_{i,t}=-\left(\frac{P_{i,t-1}}{P_{i,t-L_r-1}}-1\right)
$$

Realized volatility:

$$
\sigma_{i,t}=
\sqrt{
\frac{1}{L_\sigma}
\sum_{\tau=t-L_\sigma}^{t-1}(r_{i,\tau}-\bar r_{i,t})^2
}
$$

Low volatility:

$$
low\_vol_{i,t}=-\sigma_{i,t}
$$

Liquidity:

$$
liquidity_{i,t}=\log(1+ADV^{21}_{i,t})
$$

Value and quality use the latest known fundamentals as of `t`:

$$
value_{i,t}=book\_to\_price^{asof}_{i,t}
$$

$$
quality_{i,t}=profitability^{asof}_{i,t}
$$

Every raw signal is cross-sectionally normalized by date:

$$
z^x_{i,t}=\frac{x_{i,t}-\mu^x_t}{\sigma^x_t}
$$

and winsorized:

$$
\tilde z^x_{i,t}=\min(z_{\max},\max(-z_{\max},z^x_{i,t}))
$$

## Rich Yahoo Finance Signals

Longer momentum:

$$
momentum\_63d_{i,t}=\frac{P_{i,t-1}}{P_{i,t-64}}-1
$$

$$
momentum\_126d_{i,t}=\frac{P_{i,t-1}}{P_{i,t-127}}-1
$$

$$
momentum\_252d\_skip\_21d_{i,t}=\frac{P_{i,t-21}}{P_{i,t-252}}-1
$$

Volatility-adjusted momentum:

$$
vol\_adjusted\_momentum_{i,t}=
\frac{momentum\_126d_{i,t}}{\sigma^{63d}_{i,t}}
$$

Moving-average trend:

$$
moving\_average\_trend_{i,t}=
\frac{SMA_{50}(P_{i,t-1})}{SMA_{200}(P_{i,t-1})}-1
$$

Drawdown recovery:

$$
drawdown\_recovery_{i,t}=
-\left(\frac{P_{i,t-1}}{\max(P_{i,t-252:t-1})}-1\right)
$$

Liquidity change:

$$
liquidity\_change_{i,t}=
\log(1+ADV^{21}_{i,t-1})-\log(1+ADV^{21}_{i,t-64})
$$

Dividend yield:

$$
dividend\_yield_{i,t}=
\frac{\sum_{\tau=t-251}^{t}D_{i,\tau}}{P_{i,t}}
$$

For a financial statement with report date `q`, the downloader uses a conservative availability lag:

$$
available\_date=q+45\text{ days}
$$

The statement can only be used on date `t` if:

$$
available\_date\le t
$$

Sector-relative z-score:

$$
z^{sector}_{i,t}(x)=
\frac{x_{i,t}-\mu_{sector(i),t}(x)}{\sigma_{sector(i),t}(x)}
$$

Value composite:

$$
value_{i,t}=\operatorname{mean}
\left(
z(B/P),z(E/P),z(Sales/P),z(FCF/P)
\right)
$$

Quality composite:

$$
quality_{i,t}=\operatorname{mean}
\left(
z(Profitability),z(GrossMargin),z(OperatingMargin),z(ROE),z(-Debt/Equity)
\right)
$$

Growth composite:

$$
growth_{i,t}=
\operatorname{mean}\left(z(RevenueGrowth),z(EarningsGrowth)\right)
$$

Earnings and analyst revision composite:

$$
earnings\_revision_{i,t}=
\operatorname{mean}
\left(
z(EarningsSurprise),z(EPSRevision),z(TargetUpside),z(UpgradeDowngradeScore)
\right)
$$

These composites are winsorized and cross-sectionally normalized again before entering the alpha model.

## Rolling IC Learning

For each factor, the bot estimates a rolling information coefficient using only historical rows dated before the current rebalance date:

$$
IC^{roll}_{f,t}=
\operatorname{Corr}(z^f_{i,\tau},r_{i,\tau+1})
\quad \tau<t,\quad \tau\in[t-L_{IC},t)
$$

The rolling IC is clipped:

$$
IC^{clip}_{f,t}=
\min(IC_{\max},\max(-IC_{\max},IC^{roll}_{f,t}))
$$

Small-universe safety gating adjusts the clipped value:

$$
IC^{adj}_{f,t}=
\begin{cases}
0, & |IC^{clip}_{f,t}| < IC_{\min} \\
0, & IC^{clip}_{f,t}<0 \text{ and negative\_ic\_policy=zero} \\
|IC^{clip}_{f,t}|, & IC^{clip}_{f,t}<0 \text{ and negative\_ic\_policy=flip} \\
IC^{clip}_{f,t}, & \text{otherwise}
\end{cases}
$$

The adjusted IC is blended with the configured prior:

$$
IC^{eff}_{f,t}=
\rho IC^{adj}_{f,t}+(1-\rho)IC^{prior}_{f}
$$

For `negative_ic_policy` equal to `zero` or `flip`, the final effective IC is clipped to non-negative values:

$$
IC^{eff}_{f,t}=\max(0,IC^{eff}_{f,t})
$$

If there are not enough observations, the bot uses the prior:

$$
IC^{eff}_{f,t}=IC^{prior}_{f}
$$

## Alpha Forecast

Normalize configured factor weights:

$$
\tilde a_f=\frac{a_f}{\sum_f |a_f|}
$$

Alpha score:

$$
score_{i,t}=\sum_f \tilde a_f IC^{eff}_{f,t} z^f_{i,t}
$$

Expected one-day return:

$$
\mu_{i,t}=score_{i,t}\cdot \tilde\sigma_{i,t}
$$

where:

$$
\tilde\sigma_{i,t}=\min(0.08,\max(0.003,\sigma_{i,t}))
$$

## Risk Model

Return decomposition:

$$
r_t=B_t f_t+\epsilon_t
$$

Factor covariance with shrinkage:

$$
F^{shrunk}_t=(1-\delta)F_t+\delta\operatorname{diag}(F_t)
$$

Full asset covariance:

$$
\Sigma_t=B_tF^{shrunk}_tB_t^\top+D_t
$$

Portfolio variance:

$$
\sigma^2_{p,t}=w_t^\top\Sigma_t w_t
$$

## Optimizer

The optimizer solves a constrained quadratic program. The decision vector is:

$$
x=[w,u,g]
$$

where `u_i` linearizes turnover `|w_i-w^{cur}_i|` and `g_i` linearizes gross exposure `|w_i|`.

### Long/Short Mode

$$
\min_w
-\mu^\top w
+\frac{1}{2}\lambda w^\top\Sigma w
+\eta\sum_i c_i |w_i-w^{cur}_i|
$$

subject to:

$$
\sum_i w_i=N^*,\quad
\sum_i |w_i|\le G,\quad
|w_i|\le p_{\max},\quad
\sum_i |w_i-w^{cur}_i|\le TO_{\max}
$$

### Long-Only Mode

By default, long-only mode is benchmark-relative. Let `b` be the equal-weight benchmark over the optimizer universe:

$$
\min_w
-\mu^\top w
+\frac{1}{2}\lambda (w-b)^\top\Sigma(w-b)
+\eta\sum_i c_i |w_i-w^{cur}_i|
$$

subject to:

$$
\sum_i w_i=1,\quad
0\le w_i\le p_{\max},\quad
\sum_i |w_i|\le G
$$

$$
\sum_i |w_i-b_i|\le A_{gross},\quad
|w_i-b_i|\le A_{\max}
$$

Set `portfolio.long_only_benchmark_relative: false` to use absolute total-risk long-only optimization.

### Benchmark-Active Mode

Let `a=w-b` be active weight:

$$
\min_w
-\mu^\top w
+\frac{1}{2}\lambda (w-b)^\top\Sigma(w-b)
+\eta\sum_i c_i |w_i-w^{cur}_i|
$$

subject to:

$$
\sum_i w_i=1,\quad
0\le w_i\le p_{\max},\quad
\sum_i |w_i|\le G
$$

$$
\sum_i |w_i-w^{cur}_i|\le TO_{\max}
$$

$$
\sum_i |w_i-b_i|\le A_{gross}
$$

$$
|w_i-b_i|\le A_{\max}
$$

Ex-ante tracking error:

$$
TE^{exante}_t=
\sqrt{(w_t-b_t)^\top\Sigma_t(w_t-b_t)}\sqrt{252}
$$

## Execution And Costs

Trade weight:

$$
\Delta w_{i,t}=w^{target}_{i,t}-w^{current}_{i,t}
$$

Cost per weight:

$$
c_{i,t}=
\frac{
commission\_bps+half\_spread\_bps+
impact\_bps\_per\_pct\_adv\cdot pct\_adv\_proxy_{i,t}
}{10000}
$$

Implementation shortfall:

$$
IS_t=\sum_i |\Delta w_{i,t}|c_{i,t}
$$

Portfolio return with costs:

$$
R_{p,t+1}=\sum_i w_{i,t}r_{i,t+1}-IS_t
$$

Portfolio return without costs:

$$
R^{no\ cost}_{p,t+1}=\sum_i w_{i,t}r_{i,t+1}
$$

Cost drag:

$$
drag_t=R^{no\ cost}_{p,t}-R_{p,t}=IS_t
$$

Equity curves:

$$
E_{t+1}=E_t(1+R_{p,t+1})
$$

$$
E^{no\ cost}_{t+1}=E^{no\ cost}_t(1+R^{no\ cost}_{p,t+1})
$$

Benchmark:

$$
R_{b,t+1}=\sum_i b_{i,t}r_{i,t+1}
$$

## Performance Metrics

Total return:

$$
TR=\frac{E_T}{E_0}-1
$$

Annualized return:

$$
R_{ann}=(1+TR)^{252/T}-1
$$

Annualized volatility:

$$
\sigma_{ann}=\operatorname{Std}(R_p)\sqrt{252}
$$

Active return:

$$
AR_t=R_{p,t}-R_{b,t}
$$

Information ratio:

$$
IR=
\frac{252\cdot\operatorname{Mean}(AR_t)}
{\operatorname{Std}(AR_t)\sqrt{252}}
$$

Maximum drawdown:

$$
MDD=\min_t\left(\frac{E_t}{\max_{\tau\le t}E_\tau}-1\right)
$$

Factor spread:

$$
Spread_{f,t}=
\operatorname{Mean}(r_{i,t+1}\mid z^f_{i,t}\in top)
-
\operatorname{Mean}(r_{i,t+1}\mid z^f_{i,t}\in bottom)
$$

Annualized factor spread:

$$
Spread^{ann}_f=252\cdot\operatorname{Mean}(Spread_{f,t})
$$

Hit rate:

$$
HitRate_f=\operatorname{Mean}(1[Spread_{f,t}>0])
$$

A factor is marked `helped=True` when both its mean IC and mean spread are positive.

## Run Logging

Every backtest writes:

```text
logs/run_manifest.json
logs/resolved_config.yaml
logs/data_manifest.csv
logs/calculation_trace.csv
logs/variables/*.csv
```

The data manifest stores row counts, columns, dates, SID counts, and SHA-256 hashes for input files. The calculation trace stores formula, row count, null count, mean, standard deviation, min, percentiles, max, and sample values for each tracked variable.

## Plain Speech Equation Companion

[Back to Documentation Contents](docs/CONTENTS.md#math-and-modeling)

This section restates the major equations in ordinary language. Numeric examples for every unique displayed equation live in [Worked Examples](docs/WORKED_EXAMPLES.md).

<details>
<summary>Returns and universe equations</summary>

Daily return:

$$
r_{i,t}=\frac{P_{i,t}}{P_{i,t-1}}-1
$$

Plain speech version: today's close divided by yesterday's close, minus one.

Dollar volume:

$$
DV_{i,t}=P_{i,t}V_{i,t}
$$

Plain speech version: price times shares traded.

Average dollar volume:

$$
ADV^{21}_{i,t}=\frac{1}{21}\sum_{\tau=t-20}^{t}DV_{i,\tau}
$$

Plain speech version: average dollar volume over the most recent 21 trading days.

Universe membership:

$$
I_{i,t}=
1[P_{i,t}\ge P_{\min}]
1[ADV^{21}_{i,t}\ge ADV_{\min}]
1[\text{required fields present}]
$$

Plain speech version: a stock is tradable only if price, liquidity, and required fields pass their checks.

</details>

<details>
<summary>Signal equations</summary>

Momentum and reversal compare lagged prices. Plain speech: momentum rewards recent winners; reversal rewards recent losers.

Realized volatility:

$$
\sigma_{i,t}=
\sqrt{
\frac{1}{L_\sigma}
\sum_{\tau=t-L_\sigma}^{t-1}(r_{i,\tau}-\bar r_{i,t})^2
}
$$

Plain speech version: calculate how much recent daily returns moved around their average.

Cross-sectional z-score:

$$
z^x_{i,t}=\frac{x_{i,t}-\mu^x_t}{\sigma^x_t}
$$

Plain speech version: compare one stock's raw factor value with the same day's stock universe.

Winsorization:

$$
\tilde z^x_{i,t}=\min(z_{\max},\max(-z_{\max},z^x_{i,t}))
$$

Plain speech version: cap the score inside a configured range.

</details>

<details>
<summary>Rolling IC and alpha equations</summary>

Rolling IC:

$$
IC^{roll}_{f,t}=
\operatorname{Corr}(z^f_{i,\tau},r_{i,\tau+1})
\quad \tau<t,\quad \tau\in[t-L_{IC},t)
$$

Plain speech version: before today's rebalance, check whether a factor's historical scores predicted next-day returns.

Effective IC blend:

$$
IC^{eff}_{f,t}=
\rho IC^{adj}_{f,t}+(1-\rho)IC^{prior}_{f}
$$

Plain speech version: combine recent evidence with the configured prior belief.

Alpha score:

$$
score_{i,t}=\sum_f \tilde a_f IC^{eff}_{f,t} z^f_{i,t}
$$

Plain speech version: add each factor's weighted score after scaling it by factor skill.

Expected return:

$$
\mu_{i,t}=score_{i,t}\cdot \tilde\sigma_{i,t}
$$

Plain speech version: turn the unitless alpha score into a one-day return forecast using clipped daily volatility.

</details>

<details>
<summary>Risk and optimizer equations</summary>

Risk model:

$$
\Sigma_t=B_tF^{shrunk}_tB_t^\top+D_t
$$

Plain speech version: total stock covariance equals shared factor risk plus stock-specific risk.

Optimizer objective:

$$
\min_w
-\mu^\top w
+\frac{1}{2}\lambda w^\top\Sigma w
+\eta\sum_i c_i|w_i-w_i^{cur}|
$$

Plain speech version: choose weights that like expected return, dislike risk, and dislike costly trading.

Tracking error:

$$
TE^{exante}_t=
\sqrt{(w_t-b_t)^\top\Sigma_t(w_t-b_t)}\sqrt{252}
$$

Plain speech version: estimate annualized active risk versus the benchmark before the trade happens.

</details>

<details>
<summary>Execution and performance equations</summary>

Trade weight:

$$
\Delta w_{i,t}=w^{target}_{i,t}-w^{current}_{i,t}
$$

Plain speech version: target weight minus current weight.

Implementation shortfall:

$$
IS_t=\sum_i |\Delta w_{i,t}|c_{i,t}
$$

Plain speech version: trade size times estimated cost per unit of weight, summed across stocks.

Information ratio:

$$
IR=
\frac{252\cdot\operatorname{Mean}(AR_t)}
{\operatorname{Std}(AR_t)\sqrt{252}}
$$

Plain speech version: annualized active return divided by annualized active risk.

Maximum drawdown:

$$
MDD=\min_t\left(\frac{E_t}{\max_{\tau\le t}E_\tau}-1\right)
$$

Plain speech version: worst percentage drop from the previous equity high.

</details>
