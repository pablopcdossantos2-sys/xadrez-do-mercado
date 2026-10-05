# Trading Tape Puzzles

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

Each puzzle presents 82 historical bars and asks for one decision. In Standard mode, the 38 future bars can be replayed bar by bar with an adjustable bracket and Flatten. The result includes rule-based grading, ELO, R outcome, debrief, and counterfactuals.

## Training modes

- **Standard:** decision + adjustable bracket + manual/automatic replay.
- **Blind tape:** during the decision phase, context, playbook, indicators, volume, and explicit price/time labels are hidden; they return after the choice.
- **Speed run:** 10 decisions within a global 15-minute session, with no intermediate debrief; each round is evaluated automatically and the next one loads without manual replay.

## Features

- Procedural generation of synthetic OHLCV series.
- MES and MNQ across 1m, 5m, 15m, and 1h timeframes.
- Candles, volume, VWAP, EMA 20, DEMA, and session levels.
- Setup classifier covering Liquidity Sweep, VWAP Reclaim/Rejection, Opening Range Breakout, Failed Breakout/Breakdown, Trend Pullback, Range Fade, Momentum Push, and Consolidation.
- Rule-based analyst with a 12-point stop / 24-point target reference bracket.
- Counterfactual debrief, trap detection, justified Skip, and streak Freeze.
- ELO, accuracy, process score, streak, and breakdowns by setup, direction, timeframe, and instrument.
- Local journal with up to 200 decisions and JSON/CSV export.
- Bilingual EN/PT-BR interface, optional sound, and keyboard shortcuts.
- Adaptive difficulty, Only structure vs Full context mode, a visual session clock, and a revenge-trade warning.
- Pure-function tests with Vitest.
- Hindsight-safe analyst validation, signal confidence, and accepted answers.
- RTH/ETH references, synthetic microstructure, and simulated macro events in replay.
- Dynamic Elo, deterministic daily challenge, pattern cards, and offline PWA support.

## Architecture

The project was migrated from a monolithic browser implementation to **Vite + React + TypeScript**. UI orchestration is in `src/App.tsx`; analytics in `src/analytics.ts`; data generation in `src/data.ts`; persistence in `src/storage.ts`; translations in `src/translations.ts`; state in `src/reducer.ts`; types in `src/types.ts`; and the React entry point in `src/main.tsx`.

Interactive state is centralized in `useReducer`, replacing a collection of interdependent local state hooks.

## Verification

- `npm run typecheck` — TypeScript checking.
- `npm run build` — type checking and Vite production build.
- `npm run audit` — structural audit of the migration, modes, runtime, and translations.

## Scope and limitations

- Current data is synthetic and procedurally generated; there is no real historical MES/MNQ feed.
- Analyst grading uses rules and the simulated future window. This does not validate a trading strategy or demonstrate predictive capability.
- The project is a training tool and does not place market orders.

## Documentation

- [Roadmap in Portuguese](docs/roadmap.pt-BR.md)
- [Roadmap in English](docs/roadmap.en.md)
- [Implementation notes](docs/roadmap-implementation.md)
- [Puzzle creation tutorial — Portuguese](docs/tutorial-create-puzzles.pt-BR.md)
- [Puzzle creation tutorial — English](docs/tutorial-create-puzzles.md)

## 👤 Authorship and development

Trading Tape Puzzles is a browser-based training tool independently developed by Pablo Phillipe Cândido dos Santos for futures day-trading decision practice through price-action puzzles, trade replay, and counterfactual debriefing.

Development used generative artificial intelligence tools as an auxiliary resource, while the author remained responsible for the project's conception, implementation, integration, and verification.

Currículo Lattes: [http://lattes.cnpq.br/9500873674712528](http://lattes.cnpq.br/9500873674712528)
