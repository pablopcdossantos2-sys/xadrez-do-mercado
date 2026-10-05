# Trading Tape Puzzles

*Leia isto em outros idiomas: [Português](README.md)*

---

> Chess puzzles, but for futures day traders.

Browser-based training tool for decision-making practice in futures trading, focused on price-action reading and Long, Short, or Skip choices.

## Quick start

Open `index.html` in a modern browser. There is no local build or installation step.

The project runs in the browser and loads its interface dependencies from CDNs. There is no backend, user account, or broker integration.

## How it works

### 1. Decision

The system presents an 82-bar historical window and asks for one decision: Long, Short, or Skip. The context panel shows information such as VWAP, ATR, moving averages, session levels, instrument, timeframe, and the identified playbook.

### 2. Replay

After the decision, the 38 future bars are replayed one by one. You can adjust stop loss and take profit, play automatically, step bar by bar, change the replay speed, and flatten the position.

### 3. Result and debrief

The final stage shows the trade result, ELO change, process score, debrief, and counterfactual outcomes for Long, Short, and Skip. For Skip decisions, the system also records and compares the reason provided by the user.

## Implemented features

- Procedural generation of synthetic intraday OHLCV series.
- Support for MES and MNQ instruments and the 1m, 5m, 15m, and 1h timeframes.
- Candlestick charts with volume, VWAP, EMA, DEMA, session levels, and entry, stop, and target lines.
- Setup classifier covering Liquidity Sweep, VWAP Reclaim/Rejection, Opening Range Breakout, Failed Breakout/Breakdown, Trend Pullback, Range Fade, Momentum Push, and Consolidation.
- Rule-based analyst comparing Long, Short, and Skip with a 12-point stop and 24-point target reference bracket.
- Counterfactual debrief and four-axis analysis: structure, volume, location, and confluence.
- Detection of selected tape traps, Skip justification, and a streak-protection Freeze mechanic.
- Browser-persistent statistics including ELO, accuracy, streak, R result, and breakdowns by setup, direction, timeframe, and instrument.
- Local decision journal capped at 200 entries, with JSON and CSV export.
- Bilingual EN/PT-BR interface, sound feedback, and keyboard shortcuts.

## Current scope and limitations

- The current generator uses synthetic, procedurally generated series; this implementation does not use a real historical MES/MNQ market-data feed.
- The analyst classification is rule-based and uses the simulated future window to determine outcomes. It does not, by itself, validate a trading strategy or demonstrate predictive capability.
- The project is a training tool: it does not place market orders or connect to a broker.

## Documentation

- [Roadmap in Portuguese](docs/roadmap.pt-BR.md)
- [Roadmap in English](docs/roadmap.en.md)
- [Puzzle creation tutorial — Portuguese](docs/tutorial-create-puzzles.pt-BR.md)
- [Puzzle creation tutorial — English](docs/tutorial-create-puzzles.md)

## 👤 Authorship and development

Trading Tape Puzzles is a browser-based training tool independently developed by Pablo Phillipe Cândido dos Santos for futures day-trading decision practice through price-action puzzles, trade replay, and counterfactual debriefing.

Development used generative artificial intelligence tools as an auxiliary resource, while the author remained responsible for the project's conception, implementation, integration, and verification.

Currículo Lattes: [http://lattes.cnpq.br/9500873674712528](http://lattes.cnpq.br/9500873674712528)