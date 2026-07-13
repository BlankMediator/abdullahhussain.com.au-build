# Worked Examples For Every Equation

[Back to Documentation Contents](docs/CONTENTS.md#worked-examples) | [Math Reference](docs/MATH.md) | [Factor Math Guide](docs/FACTORS.md) | [Config Reference](docs/CONFIG.md) | [Glossary](docs/GLOSSARY.md)

This page gives numeric examples for every unique displayed equation used in the math, factor, config, and glossary docs. Duplicate equations reuse the same example here.

## Example Inputs

Unless a row says otherwise, use these sample values:

| Symbol | Example value |
|---|---:|
| Current price `P_t` | `110` |
| Previous price `P_{t-1}` | `100` |
| Volume `V_t` | `1,000,000` |
| Portfolio weight `w` | `0.12` |
| Benchmark weight `b` | `0.10` |
| Current weight `w^{cur}` | `0.08` |
| Expected return `\mu` | `0.0005` |
| Variance `\sigma^2` | `0.0004` |
| Cost per weight `c` | `0.00035` |

## Returns And Universe

| Equation | Worked example | Result | Plain speech |
|---|---|---:|---|
| `r_{i,t}=P_{i,t}/P_{i,t-1}-1` | `110 / 100 - 1` | `0.10` | The stock returned `10%`. |
| `DV_{i,t}=P_{i,t}V_{i,t}` | `110 * 1,000,000` | `110,000,000` | Dollar volume was `$110m`. |
| `ADV^{21}=mean(DV)` | `(100m + 110m + 120m) / 3` | `110m` | Average dollar volume is the mean over the window. |
| `I=1[P>=P_min]1[ADV>=ADV_min]1[fields]` | `1[110>=5] * 1[110m>=1m] * 1` | `1` | The stock passes the universe filter. |
| `sid_{e,t}=sid_j` where validity covers `t` | entity `ticker:AAPL`, date `2024-01-05`, valid row `SID_AAPL` from `2020-01-01` to `2099-12-31` | `SID_AAPL` | Use only mappings valid on the observation date. |
| `j^*=argmax(valid_from_j)` | overlapping valid rows with `valid_from` 2010 and 2020 | `2020 row` | If multiple mappings overlap, use the most recent valid start. |

## Price And Liquidity Signals

| Equation | Worked example | Result | Plain speech |
|---|---|---:|---|
| `momentum=P_{t-1}/P_{t-L-1}-1` | `110 / 100 - 1` | `0.10` | Price rose `10%` over the lookback. |
| `reversal=-(P_{t-1}/P_{t-L-1}-1)` | `-(95 / 100 - 1)` | `0.05` | A `5%` fall becomes a positive reversal score. |
| `sigma=sqrt(mean((r-rbar)^2))` | returns `1%, -1%, 2%`, mean `0.667%` | `0.0125` | Recent daily volatility is about `1.25%`. |
| `low_vol=-sigma` | `-0.0125` | `-0.0125` | Lower volatility gives a less negative, therefore higher, score. |
| `liquidity=log(1+ADV)` | `log(1+10,000,000)` | `16.12` | Log compresses very large dollar volume. |
| `value=book_to_price_asof` | latest known book-to-price `0.42` | `0.42` | Use the latest fundamental value known as of the date. |
| `quality=profitability_asof` | latest known profitability `0.18` | `0.18` | Use the latest profitability known as of the date. |
| `z=(x-mu)/sigma` | `(12 - 10) / 2` | `1.0` | The stock is one standard deviation above average. |
| `z_tilde=min(zmax,max(-zmax,z))` | cap `4`, raw z `5.2` | `4.0` | Extreme scores are clipped. |
| `momentum_63d=P_{t-1}/P_{t-64}-1` | `112 / 100 - 1` | `0.12` | Quarterly momentum is `12%`. |
| `momentum_126d=P_{t-1}/P_{t-127}-1` | `118 / 100 - 1` | `0.18` | Half-year momentum is `18%`. |
| `momentum_252d_skip_21d=P_{t-21}/P_{t-252}-1` | `120 / 100 - 1` | `0.20` | One-year momentum excluding recent month is `20%`. |
| `vol_adjusted_momentum=momentum_126d/sigma_63d` | `0.12 / 0.02` | `6.0` | Same momentum with lower volatility scores higher. |
| `moving_average_trend=SMA50/SMA200-1` | `105 / 100 - 1` | `0.05` | Short average is `5%` above long average. |
| `drawdown_recovery=-(P/trailing_high-1)` | `-(80 / 100 - 1)` | `0.20` | Stock is `20%` below its high. |
| `liquidity_change=log(1+ADV_recent)-log(1+ADV_old)` | `log(12m) - log(8m)` | `0.405` | Liquidity rose about `50%`, log difference `0.405`. |
| `dividend_yield=sum(D)/P` | `2 / 50` | `0.04` | Trailing dividend yield is `4%`. |
| `available_date=q+45 days` | report date `2024-03-31` plus 45 days | `2024-05-15` | Statement becomes usable after the lag. |
| `available_date <= t` | `2024-05-15 <= 2024-06-01` | `true` | The statement can be used on June 1. |
| `z_sector=(x-sector_mean)/sector_sigma` | `(0.30 - 0.20) / 0.05` | `2.0` | The stock is two sector standard deviations above peers. |

## Composite Factors

| Equation | Worked example | Result | Plain speech |
|---|---|---:|---|
| `value=mean(z(B/P),z(E/P),z(Sales/P),z(FCF/P))` | `(0.8 + 0.4 + 1.1 - 0.1) / 4` | `0.55` | Moderately cheap across value ratios. |
| `quality=mean(z(Profitability),z(GrossMargin),z(OperatingMargin),z(ROE),z(-Debt/Equity))` | `(0.5 + 0.7 + 0.3 + 0.9 + 0.1) / 5` | `0.50` | Above-average quality. |
| `growth=mean(z(RevenueGrowth),z(EarningsGrowth))` | `(0.6 + 0.2) / 2` | `0.40` | Positive growth score. |
| `earnings_revision=mean(z(Surprise),z(EPSRevision),z(TargetUpside),z(UpgradeScore))` | `(1.0 + 0.5 + 0.2 - 0.1) / 4` | `0.40` | Positive revision pressure. |
| `alt_sentiment_raw=latest mapped sentiment known as of t` | latest mapped sentiment before `t` is `0.7` | `0.7` | Use the latest valid sentiment row. |
| `alt_sentiment=winsorized_zscore(raw_sentiment)` | raw z `4.8`, cap `4` | `4.0` | Sentiment score is capped. |

## Rolling IC And Alpha

IC means information coefficient. It is the cross-sectional correlation between today's factor scores and the next period's realized returns. In plain speech, it asks whether higher-scored stocks actually did better after the score was formed.

| Equation | Worked example | Result | Plain speech |
|---|---|---:|---|
| `IC=Corr(score_today,next_return)` | scores `[1,0,-1]`, returns `[1.2%,0.2%,-0.5%]` | positive, about `0.99` | Higher scores lined up with higher next-day returns. |
| `IC_roll=Corr(z_tau,r_tau+1)` for `tau<t` | last 252 days of factor scores vs next-day returns | sample correlation | Uses only history before today's rebalance. |
| `IC_clip=min(ICmax,max(-ICmax,IC_roll))` | `IC_roll=0.12`, `ICmax=0.08` | `0.08` | Rolling IC is capped. |
| `IC_adj` case: weak IC to zero | `IC_clip=0.002`, `IC_min=0.005` | `0` | Tiny IC is treated as noise. |
| `IC_adj` case: negative zero policy | `IC_clip=-0.03`, policy `zero` | `0` | Negative learned IC is ignored. |
| `IC_adj` case: negative flip policy | `IC_clip=-0.03`, policy `flip` | `0.03` | Negative IC is used contrarian. |
| `IC_eff=rho*IC_adj+(1-rho)*IC_prior` | `0.75*0.02 + 0.25*0.01` | `0.0175` | Blend recent evidence and prior. |
| `IC_eff=max(0,IC_eff)` | `max(0,-0.004)` | `0` | Safe policies prevent negative final IC. |
| `IC_eff=IC_prior` | insufficient data, prior `0.015` | `0.015` | Use prior when rolling evidence is unavailable. |
| `a_tilde=a/sum(abs(a))` | factor weight `0.22`, total abs weights `1.00` | `0.22` | Normalize configured factor weights. |
| `contribution=a_tilde*IC_eff*z` | `0.4 * 0.015 * 1.2` | `0.0072` | One factor contribution to alpha score. |
| `score=sum(contributions)` | `0.012 + 0.003` | `0.015` | Add factor contributions. |
| `mu=score*sigma_tilde` | `0.015 * 0.020` | `0.0003` | Forecast is `0.03%` for one day. |
| `sigma_tilde=min(0.08,max(0.003,sigma))` | sigma `0.0005` | `0.003` | Volatility is floored at `0.3%`. |

## Risk Model

| Equation | Worked example | Result | Plain speech |
|---|---|---:|---|
| `r=Bf+epsilon` | market exposure `1`, market return `1%`, residual `0.2%` | `1.2%` | Asset return equals common factor return plus residual. |
| `F_shrunk=(1-delta)F+delta*diag(F)` | `delta=0.1`, off-diagonal `0.0002` | `0.00018` | Shrinkage reduces factor correlations. |
| `Sigma=B F B^T + D` | systematic variance `0.0003`, specific `0.0001` | `0.0004` | Total variance combines common and specific risk. |
| `portfolio_variance=w^T Sigma w` | weights `[0.5,0.5]`, covariance all diagonal `0.0004` | `0.0002` | Diversified portfolio variance is lower than single-name variance. |

## Optimizer

| Equation | Worked example | Result | Plain speech |
|---|---|---:|---|
| `x=[w,u,g]` | `w=0.12`, `u=0.04`, `g=0.12` | vector `[0.12,0.04,0.12]` | Decision vector stores weights, trades, and gross weights. |
| long/short objective | `-0.0005*0.12 + 0.5*8*0.0004*0.12^2 + 0.02*0.00035*0.04` | about `-0.000037` | Reward return, penalize risk and trading. |
| `sum(w)=N*` | weights `[0.20,-0.10,-0.10]` | `0.00` | Market-neutral net exposure. |
| `sum(abs(w))<=G` | `0.2+0.1+0.1` vs `G=1` | `0.4 <= 1` | Gross exposure constraint passes. |
| `abs(w_i)<=pmax` | `abs(0.12)<=0.20` | `true` | Position cap passes. |
| `sum(abs(w-current))<=TOmax` | `0.04+0.02+0.01` vs `0.5` | `0.07 <= 0.5` | Turnover cap passes. |
| benchmark-relative objective | active weight `0.02`, variance `0.0004` | risk term `0.5*8*0.0004*0.02^2=0.00000064` | Penalizes active risk versus benchmark. |
| `sum(w)=1` | `[0.4,0.3,0.3]` | `1.0` | Fully invested long-only portfolio. |
| `0<=w_i<=pmax` | `0<=0.12<=0.20` | `true` | Long-only position is valid. |
| `sum(abs(w-b))<=A_gross` | active `[0.02,-0.01,-0.01]` | `0.04` | Active gross exposure is `4%`. |
| `abs(w_i-b_i)<=Amax` | `abs(0.12-0.10)` | `0.02` | Stock is `2%` overweight. |
| `TE=sqrt(active^T Sigma active)*sqrt(252)` | active `[0.02,-0.02]`, diagonal variance `0.0004` | about `0.009` | Ex-ante tracking error is about `0.9%`. |

## Execution And Equity Curves

| Equation | Worked example | Result | Plain speech |
|---|---|---:|---|
| `Delta w=w_target-w_current` | `0.12 - 0.08` | `0.04` | Buy 4% of portfolio weight. |
| `c=(commission+spread+impact*pct_adv)/10000` | `(0.5+2+8*0.25)/10000` | `0.00045` | Cost is 4.5 basis points. |
| `IS=sum(abs(Delta w)*c)` | `0.04 * 0.00045` | `0.000018` | Shortfall is 0.18 basis points of portfolio. |
| `R_p=sum(w*r_next)-IS` | `0.12*0.01 + 0.88*0 - 0.000018` | `0.001182` | Cost-adjusted return is `0.1182%`. |
| `R_no_cost=sum(w*r_next)` | `0.12*0.01` | `0.0012` | No-cost return is `0.12%`. |
| `drag=R_no_cost-R_p=IS` | `0.0012 - 0.001182` | `0.000018` | Difference is cost drag. |
| `E_next=E*(1+R_p)` | `1,000,000*(1+0.001182)` | `1,001,182` | Equity after one day. |
| `E_no_cost_next=E_no_cost*(1+R_no_cost)` | `1,000,000*(1+0.0012)` | `1,001,200` | No-cost equity after one day. |
| `R_b=sum(b*r_next)` | equal weights `[0.5,0.5]`, returns `[1%,-0.5%]` | `0.25%` | Benchmark return is average weighted return. |

## Performance And Factor Reports

| Equation | Worked example | Result | Plain speech |
|---|---|---:|---|
| `TR=E_T/E_0-1` | `1,200,000 / 1,000,000 - 1` | `0.20` | Total return is `20%`. |
| `R_ann=(1+TR)^(252/T)-1` | `TR=20%`, `T=504` | `9.54%` | Annualized over two trading years. |
| `sigma_ann=Std(R_p)*sqrt(252)` | daily std `1%` | `15.87%` | Annualized volatility. |
| `AR=R_p-R_b` | `0.40% - 0.25%` | `0.15%` | Active return versus benchmark. |
| `IR=annualized active return / active risk` | active mean `0.02%`, active std `0.5%` | `0.635` | Active return per unit active risk. |
| `MDD=min(E/running_max - 1)` | equity drops from `120` to `90` | `-25%` | Worst peak-to-trough drawdown. |
| `Spread=mean(top returns)-mean(bottom returns)` | top `0.8%`, bottom `-0.2%` | `1.0%` | Factor spread for the day. |
| `Spread_ann=252*mean(spread)` | average daily spread `0.03%` | `7.56%` | Annualized long-short spread. |
| `HitRate=mean(1[spread>0])` | 60 positive days out of 100 | `60%` | Factor helped on 60% of days. |

## Glossary And Config Equations

| Equation | Worked example | Result | Plain speech |
|---|---|---:|---|
| `a_i=w_i-b_i` | `0.12 - 0.10` | `0.02` | Active weight is 2% overweight. |
| `gross=sum(abs(w))` | `abs(0.6)+abs(-0.2)` | `0.8` | Gross exposure is 80%. |
| `turnover=sum(abs(w_target-w_current))` | `abs(0.12-0.08)+abs(0.05-0.07)` | `0.06` | Trade 6% of portfolio weight. |
| config momentum example | `P_{t-1}=110`, `P_{t-22}=100` | `10%` | With `momentum_window=21`, use the price 22 trading days back. |
| config alpha contribution | `0.40 * 0.015 * 1.2` | `0.0072` | Factor contribution to alpha score. |

[Back to Documentation Contents](docs/CONTENTS.md#worked-examples)
