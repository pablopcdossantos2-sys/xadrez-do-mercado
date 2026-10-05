# Como Criar Puzzles

Um puzzle e { history: [...82 barras], future: [...38 barras] }.

Cada barra: { time, open, high, low, close, volume }.

## Pipeline

generateMarketData() -> classifySetup() -> analyzePuzzle() -> App()

## Setups

liq_sweep_long, liq_sweep_short, vwap_reclaim, vwap_reject,
orb_long, orb_short, failed_breakdown, failed_breakout,
pullback_long, pullback_short, range_fade_long, range_fade_short,
momentum_long, momentum_short, consolidation.

## Adicionando um novo setup

Insira um novo if-block antes do fallback de momentum em classifySetup().

## Dados historicos reais

Carregue CSV, depois amostre janelas de 82 + 38 barras.
Fontes: Databento, Polygon.io, FirstRate Data, Kaggle.
