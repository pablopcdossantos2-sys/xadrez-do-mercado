# How to Create Puzzles

A puzzle is { history: [...82 bars], future: [...38 bars] }.

Each bar: { time, open, high, low, close, volume }.

## Pipeline

generateMarketData() -> classifySetup() -> analyzePuzzle() -> App()

## Setups

liq_sweep_long, liq_sweep_short, vwap_reclaim, vwap_reject,
orb_long, orb_short, failed_breakdown, failed_breakout,
pullback_long, pullback_short, range_fade_long, range_fade_short,
momentum_long, momentum_short, consolidation.

## Adding a new setup

Insert a new if-block before the momentum fallback in classifySetup().

## Real historical data

Load CSV, then sample windows of 82 + 38 bars.
Sources: Databento, Polygon.io, FirstRate Data, Kaggle.