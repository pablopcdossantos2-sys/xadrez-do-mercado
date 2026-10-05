# Como Criar Puzzles

Um puzzle é `{ history: [...82 barras], future: [...38 barras] }`, gerado por `src/data.ts`.

Cada barra tem o formato `{ time, open, high, low, close, volume }`.

## Pipeline

`src/data.ts` (`generateMarketData`) -> `src/analytics.ts` (`classifySetup` / `analyzePuzzle`) -> `src/App.tsx`

## Setups

`liq_sweep_long`, `liq_sweep_short`, `vwap_reclaim`, `vwap_reject`,
`orb_long`, `orb_short`, `failed_breakdown`, `failed_breakout`,
`pullback_long`, `pullback_short`, `range_fade_long`, `range_fade_short`,
`momentum_long`, `momentum_short`, `consolidation`.

## Adicionando um novo setup

Insira uma nova condição em `classifySetup()` antes do fallback de momentum. Retorne o id do setup, os rótulos em inglês/português e o viés direcional.

## Dados históricos reais

A aplicação atual gera deliberadamente dados sintéticos de forma procedural. Um futuro adaptador de dados históricos deverá preservar o contrato de 82 barras de histórico / 38 barras futuras antes de enviar as amostras para o mesmo pipeline de análise.
