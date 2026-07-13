# Documentation Contents

Use this page as the project map. Links work in the browser Docs tab and in normal Markdown viewers.

## Start Here

- [README](README.md) - install, normal workflow, GUI, outputs, and tests.
- [Runbook](docs/RUNBOOK.md) - operating guide for downloads, backtests, LAN serving, jobs, and troubleshooting.
- [CLI Command Reference](docs/CLI_REFERENCE.md) - every `quantbot` command, option group, and common recipe.
- [Static Hosting](docs/GITHUB_PAGES.md) - static site build and deployment workflow.
- [ASX Analysis Guide](docs/ASX_ANALYSIS.md) - ASX universe download, segment definitions, metal/sector analysis, separate alpha training, and cross-alpha results.
- [ASX REIT Backtests](docs/ASX_REIT_BACKTESTS.md) - official ASX REIT universe, full REIT backtest, low-covariance REIT basket, and comparison results.
- [US REIT Backtests](docs/US_REIT_BACKTESTS.md) - Nasdaq-sourced US REIT universe, full REIT backtest, low-covariance basket, and comparison results.
- [Architecture](docs/ARCHITECTURE.md) - pipeline structure, data flow, optimizer, and browser/CLI control layer.
- [Math Reference](docs/MATH.md) - complete equations for returns, signals, alpha, risk, optimizer, costs, and performance.
- [Factor Math Guide](docs/FACTORS.md) - one section per alpha factor with formula, direction, source data, and caveats.
- [Worked Examples](docs/WORKED_EXAMPLES.md) - numeric worked examples for every unique displayed equation.
- [Config YAML Reference](docs/CONFIG.md) - every config section and key explained in plain speech.
- [Glossary](docs/GLOSSARY.md) - definitions of quant, backtest, optimizer, and data terms.
- [Python Module Reference](docs/PYTHON_REFERENCE.md) - one section per `.py` file under `src/quantbot`.
- [Video Blueprint](docs/VIDEO_BLUEPRINT.md) - transcript-derived implementation blueprint.

## Common Tasks

- [Serve the browser Control Room](docs/RUNBOOK.md#browser-control-room)
- [Publish the static site](docs/GITHUB_PAGES.md)
- [Use the CLI](docs/CLI_REFERENCE.md)
- [Download docs for offline reading](docs/CLI_REFERENCE.md#docs-export)
- [Download Yahoo Finance data](docs/RUNBOOK.md#2-get-yahoo-finance-data)
- [Run ASX segmented alpha analysis](docs/ASX_ANALYSIS.md)
- [Run ASX REIT and low-covariance backtests](docs/ASX_REIT_BACKTESTS.md)
- [Run US REIT and low-covariance backtests](docs/US_REIT_BACKTESTS.md)
- [Use saved download settings](docs/RUNBOOK.md#2-get-yahoo-finance-data)
- [Run the benchmark-active strategy](docs/RUNBOOK.md#4-run-the-main-benchmark-active-strategy)
- [Inspect run outputs](docs/RUNBOOK.md#8-inspect-run-outputs)
- [Troubleshoot Yahoo data](docs/RUNBOOK.md#rich-data-troubleshooting)
- [Understand run logging](docs/MATH.md#run-logging)
- [Audit CLI usage and captured output](docs/CLI_REFERENCE.md#job-and-usage-commands)

## CLI Reference

- [Command logging](docs/CLI_REFERENCE.md#command-logging)
- [Data download commands](docs/CLI_REFERENCE.md#data-download-commands)
- [ASX commands](docs/CLI_REFERENCE.md#asx-commands)
- [ASX REIT backtests](docs/ASX_REIT_BACKTESTS.md)
- [US REIT backtests](docs/US_REIT_BACKTESTS.md)
- [Config commands](docs/CLI_REFERENCE.md#config-commands)
- [Data inspection commands](docs/CLI_REFERENCE.md#data-inspection-commands)
- [Backtest and run commands](docs/CLI_REFERENCE.md#backtest-and-run-commands)
- [Browser GUI command](docs/CLI_REFERENCE.md#browser-gui-command)
- [Docs commands](docs/CLI_REFERENCE.md#docs-commands)
- [Docs export](docs/CLI_REFERENCE.md#docs-export)
- [Job and usage commands](docs/CLI_REFERENCE.md#job-and-usage-commands)
- [Common recipes](docs/CLI_REFERENCE.md#common-recipes)

## Configuration

- [Config overview](docs/CONFIG.md#how-to-read-a-config)
- [project](docs/CONFIG.md#project)
- [data](docs/CONFIG.md#data)
- [signals](docs/CONFIG.md#signals)
- [alpha](docs/CONFIG.md#alpha)
- [risk](docs/CONFIG.md#risk)
- [portfolio](docs/CONFIG.md#portfolio)
- [execution](docs/CONFIG.md#execution)
- [backtest](docs/CONFIG.md#backtest)
- [logging](docs/CONFIG.md#logging)

## Math And Modeling

- [Returns and universe](docs/MATH.md#returns-and-universe)
- [Point-in-time matching](docs/MATH.md#point-in-time-matching)
- [Price and liquidity signals](docs/MATH.md#price-and-liquidity-signals)
- [Rich Yahoo Finance signals](docs/MATH.md#rich-yahoo-finance-signals)
- [ASX segmented alpha workflow](docs/ASX_ANALYSIS.md#method)
- [Macro regime factors](docs/FACTORS.md#macro-regime-factors)
- [Rolling IC learning](docs/MATH.md#rolling-ic-learning)
- [Alpha forecast](docs/MATH.md#alpha-forecast)
- [Risk model](docs/MATH.md#risk-model)
- [Optimizer](docs/MATH.md#optimizer)
- [Execution and costs](docs/MATH.md#execution-and-costs)
- [Performance metrics](docs/MATH.md#performance-metrics)
- [Plain speech equation companion](docs/MATH.md#plain-speech-equation-companion)

## Worked Examples

- [Example inputs](docs/WORKED_EXAMPLES.md#example-inputs)
- [Returns and universe examples](docs/WORKED_EXAMPLES.md#returns-and-universe)
- [Price and liquidity signal examples](docs/WORKED_EXAMPLES.md#price-and-liquidity-signals)
- [Composite factor examples](docs/WORKED_EXAMPLES.md#composite-factors)
- [Rolling IC and alpha examples](docs/WORKED_EXAMPLES.md#rolling-ic-and-alpha)
- [Risk model examples](docs/WORKED_EXAMPLES.md#risk-model)
- [Optimizer examples](docs/WORKED_EXAMPLES.md#optimizer)
- [Execution and equity curve examples](docs/WORKED_EXAMPLES.md#execution-and-equity-curves)
- [Performance and factor report examples](docs/WORKED_EXAMPLES.md#performance-and-factor-reports)
- [Glossary and config equation examples](docs/WORKED_EXAMPLES.md#glossary-and-config-equations)

## Factor Guide

- [Shared factor pipeline](docs/FACTORS.md#shared-factor-pipeline)
- [momentum](docs/FACTORS.md#momentum)
- [reversal](docs/FACTORS.md#reversal)
- [momentum_63d](docs/FACTORS.md#momentum63d)
- [momentum_126d](docs/FACTORS.md#momentum126d)
- [momentum_252d_skip_21d](docs/FACTORS.md#momentum252dskip21d)
- [vol_adjusted_momentum](docs/FACTORS.md#voladjustedmomentum)
- [moving_average_trend](docs/FACTORS.md#movingaveragetrend)
- [drawdown_recovery](docs/FACTORS.md#drawdownrecovery)
- [low_vol](docs/FACTORS.md#lowvol)
- [liquidity](docs/FACTORS.md#liquidity)
- [liquidity_change](docs/FACTORS.md#liquiditychange)
- [value](docs/FACTORS.md#value)
- [quality](docs/FACTORS.md#quality)
- [growth](docs/FACTORS.md#growth)
- [earnings_revision](docs/FACTORS.md#earningsrevision)
- [dividend_yield](docs/FACTORS.md#dividendyield)
- [alt_sentiment](docs/FACTORS.md#altsentiment)
- [Macro regime factors](docs/FACTORS.md#macro-regime-factors)
- [Plain speech factor reference](docs/FACTORS.md#plain-speech-factor-reference)
- [IC in plain speech](docs/FACTORS.md#ic-in-plain-speech)
- [Alpha worked example](docs/FACTORS.md#alpha-worked-example)

## Glossary

- [Alpha](docs/GLOSSARY.md#alpha)
- [Information coefficient / IC](docs/GLOSSARY.md#ic)
- [Rolling IC](docs/GLOSSARY.md#rolling-ic)
- [Point-in-time](docs/GLOSSARY.md#point-in-time)
- [Lookahead bias](docs/GLOSSARY.md#lookahead-bias)
- [Quadratic program / QP](docs/GLOSSARY.md#qp)
- [Turnover](docs/GLOSSARY.md#turnover)
- [Winsorization](docs/GLOSSARY.md#winsorization)
- [Z-score](docs/GLOSSARY.md#z-score)

## Code Reference

- [Top-level package modules](docs/PYTHON_REFERENCE.md#top-level-package)
- [Data package](docs/PYTHON_REFERENCE.md#data-package)
- [Factor package](docs/PYTHON_REFERENCE.md#factor-package)
- [Risk package](docs/PYTHON_REFERENCE.md#risk-package)
- [Portfolio package](docs/PYTHON_REFERENCE.md#portfolio-package)
- [Execution package](docs/PYTHON_REFERENCE.md#execution-package)
- [Analysis package](docs/PYTHON_REFERENCE.md#analysis-package)
- [Backtest package](docs/PYTHON_REFERENCE.md#backtest-package)
- [Utilities](docs/PYTHON_REFERENCE.md#utilities)
