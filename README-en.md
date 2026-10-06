# Xadrez do Mercado

*Leia isto em outros idiomas: [Português](README.md)*

---

> Chess puzzles, but for futures day traders.

Browser-based interactive training tool for futures decision-making practice, focused on price-action reading and Long, Short, or Skip choices.

## Quick start

```bash
npm install
npm run dev
```

For production:

```bash
npm run build
```

## How it works

Synthetic puzzles use 82 history bars and 38 future bars. Real historical puzzles adapt the window to a single exchange session (1m: 82+38; 5m: 72+30; 15m: 26+12; CME MES/MNQ 1h: 12+6). In Standard mode, future bars can be replayed bar by bar with an adjustable bracket and Flatten. The result includes rule-based grading, ELO, R outcome, debrief, and counterfactuals.

Windows can come from real historical market data or the synthetic generator. **The product does not depend on real-time market data.**

## Training modes

- **Standard:** decision + adjustable bracket + manual/automatic replay.
- **Blind tape:** during the decision phase, context, playbook, indicators, volume, and explicit price/time labels are hidden; they return after the choice.
- **Speed run:** 10 decisions within a global 15-minute session, with no intermediate debrief; each round is evaluated automatically and the next one loads without manual replay.

## Features

- Replay of curated real historical windows and procedural synthetic generation.
- MES, MNQ, WINFUT, and WDOFUT across 1m, 5m, 15m, and 1h timeframes.
- Candles, volume, VWAP, EMA 20, DEMA, and session levels.
- Setup classifier covering Liquidity Sweep, VWAP Reclaim/Rejection, Opening Range Breakout, Failed Breakout/Breakdown, Trend Pullback, Range Fade, Momentum Push, and Consolidation.
- Rule-based analyst with a 12-point stop / 24-point target reference bracket.
- Counterfactual debrief, trap detection, justified Skip, and streak Freeze.
- ELO, accuracy, process score, streak, and breakdowns by setup, direction, timeframe, and instrument.
- Local journal with up to 200 decisions and JSON/CSV export.
- Bilingual EN/PT-BR interface, optional sound, and keyboard shortcuts.
- Adaptive difficulty, Only structure vs Full context mode, a visual session clock, and a revenge-trade warning.
- Hindsight-safe analyst validation, signal confidence, and accepted answers.
- RTH/ETH references, synthetic microstructure, and simulated macro events in replay.
- Dynamic Elo, deterministic daily challenge, pattern cards, and offline PWA support.

## Architecture

The project was migrated from a monolithic browser implementation to **Vite + React + TypeScript**. UI orchestration is in `src/App.tsx`; analytics in `src/analytics.ts`; data generation in `src/data.ts`; persistence in `src/storage.ts`; translations in `src/translations.ts`; state in `src/reducer.ts`; types in `src/types.ts`; the React entry point is in `src/main.tsx`; asset metadata is in `src/assets.ts`; and the real OHLCV parser is in `src/realData.ts`.

Interactive state is centralized in `useReducer`, replacing a collection of interdependent local state hooks.

## Verification

- `npm run typecheck` — TypeScript checking.
- `npm run build` — type checking and Vite production build.
- `npm run audit` — structural audit of the migration, modes, runtime, and translations.
- `npm run test` — pure-function tests.

## Scope and limitations

- Synthetic generation remains available as a fallback.
- WINFUT/WDOFUT use the real B3 library in 1m, 5m and 15m; 1h remains synthetic for those instruments.
- MES/MNQ have a real CME Globex historical pipeline via Databento. When an authorized CME library is published, 1m, 5m, 15m and 1h can use real sessions; otherwise the synthetic fallback remains active.
- Real-data integration is based on **historical datasets**, not real-time streaming.
- The foreign pipeline uses actual MES/MNQ contracts rather than ES/NQ proxies.
- Raw historical market files may have their own usage/redistribution terms; the project should keep application code and market files separate when necessary.
- WINFUT and WDOFUT use the B3 product codes WIN and WDO respectively.
- Analyst grading uses only information available up to the decision point. This does not validate a trading strategy or demonstrate predictive capability.
- The project is a training tool and does not place market orders.

## Documentation

- [Roadmap in Portuguese](docs/roadmap.pt-BR.md)
- [Roadmap in English](docs/roadmap.en.md)
- [Implementation notes](docs/roadmap-implementation.md)
- [Real historical data plan](docs/real-market-data-plan.en.md)
- [Puzzle creation tutorial — Portuguese](docs/tutorial-create-puzzles.pt-BR.md)
- [Puzzle creation tutorial — English](docs/tutorial-create-puzzles.md)

## Authorship and development

Xadrez do Mercado is a browser-based training tool independently developed by Pablo Phillipe Cândido dos Santos for futures day-trading decision practice through price-action puzzles, trade replay, and counterfactual debriefing.

Development used generative artificial intelligence tools as an auxiliary resource, while the author remained responsible for the project's conception, implementation, integration, and verification.

Currículo Lattes: [http://lattes.cnpq.br/9500873674712528](http://lattes.cnpq.br/9500873674712528)
