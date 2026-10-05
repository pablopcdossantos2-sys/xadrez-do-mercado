# Xadrez do Mercado — Roadmap implementation notes

## 15. Blind tape — shipped

Added a dedicated Blind tape mode. During the decision phase, the application hides contextual market information, playbook classification, chart indicators, volume, and explicit price/time labels. The trader sees the tape structure without the usual contextual overlays. Context is restored after the decision.

## 19. Speed run — shipped

Added a 10-round rapid-decision session with a global 15-minute time limit. There is no intermediate debrief: Long, Short, or Skip is evaluated automatically against the future window using the reference 12-point stop / 24-point target bracket, and the next round loads automatically. The final summary reports accuracy, process score, and total R. Each round is logged with timing metadata.

## 29. Migrate to Vite + React + TypeScript — shipped

The former monolithic browser runtime is now a Vite application using React and TypeScript. The code is separated into typed modules for UI orchestration, analytics, procedural data generation, persistence, translations, state transitions, and application entry.

The legacy CDN-loaded React/Babel/Tailwind runtime was removed from `index.html`.

## 32. State via useReducer — shipped

The interactive application state is centralized in a typed React `useReducer`. Explicit actions cover language, sound, mode, market configuration, puzzle loading, decisions, replay, brackets, result evaluation, Speed Run progression, journal clearing, and statistics reset.

## Audit corrections applied

- Added a reactive clock for the Speed Run countdown.
- Corrected round timing so the duration starts when each puzzle is loaded.
- Changed Speed Run from a per-round countdown to the roadmap's global 15-minute session limit.
- Removed the full debrief from intermediate Speed Run rounds.
- Preserved keyboard shortcuts for Long/Short/Skip, replay controls, Flatten, next puzzle, and Home.
- Preserved previous statistics and journal data through versioned local-storage migration.
- Added an explicit EN/PT-BR dictionary parity guard.
- Corrected the documentation to distinguish synthetic procedural data from real historical market data.

## 10. Adaptive difficulty — shipped

Implemented a rolling process-accuracy controller using the last 20 scored decisions in the local journal. The warm-up phase keeps the difficulty at Normal until five process observations exist; after that, below 60% selects Easy, above 75% selects Hard, and the 60–75% zone stays Normal. Reverse exploration is not journaled, so it cannot distort difficulty.

The generator receives the selected level and applies the roadmap multipliers:
- Easy: volatility ×0.75, setup strength ×1.25, noise ×0.90.
- Normal: ×1.00, ×1.00, ×1.00.
- Hard: volatility ×1.30, setup strength ×0.70, noise ×1.15.

Setup strength is applied to the 15 historical bars immediately preceding the decision point. The active level is shown in the game header.

## 17. Reverse replay after result — shipped

After a scored result, the user can start an isolated exploration of the same puzzle with Long, Short, or Skip. The original 38 future bars are replayed from the original entry point.

Long/Short use the same SL/TP bracket controls and replay engine, including Play, Pause, Step, four playback speeds, and Flatten. Skip replays the future sequence without opening a position. A blue “Exploration — not counted” banner identifies the mode.

Exploration has its own replay/result state and never writes to statistics or journal. “Back to result” restores the original scored result without changing ELO, streak, process accuracy, or history used by adaptive difficulty.

## 16. Only structure vs Full context — shipped

Added a persistent context selector with two tracks: **Full context** keeps the market-context panel visible, while **Only structure** hides that panel during the decision and leaves the chart itself available. The context panel returns after the decision, and Blind tape keeps its stricter concealment rules.

## 18. Visual session clock — shipped

Added a compact market-session clock to the game header. It follows the timestamp of the latest visible bar, so it advances with replay instead of showing wall-clock time. Blind tape hides the session clock during the decision phase to preserve the mode's information constraints.

## 20. Revenge trade warning — shipped

When a new Standard or Blind decision starts immediately after a losing scored trade, the sidebar shows a localized behavioral warning to slow down, reread the structure, and avoid trading to recover the previous loss. Speed Run is excluded because its rapid-session design intentionally avoids extra decision friction.

## 30. Tests for pure functions — shipped

Added a Vitest suite covering pure analytics and adaptive-difficulty behavior: EMA, ATR, bracket outcome ordering, warm-up behavior, and easy/normal/hard threshold mapping. The repository now exposes `npm run test` for the suite.

## 3. Analyst validation against hindsight bias — shipped

Reworked the puzzle analyst so its recommendation is computed only from the 82 historical bars. Future bars are now isolated to outcome simulation after the decision. The analysis exposes a signal-confidence score and a small accepted-answer set for ambiguous setups; process scoring uses that accepted set rather than forcing a single hindsight-derived answer.

## 4. Procedural generator realism — shipped

Expanded the synthetic generator with session-dependent volatility and volume profiles, persistent volatility clustering, a deterministic opening gap at RTH open, and a deterministic high-impact macro shock inside the future window. The generator remains explicitly synthetic; these features model market behavior without claiming historical-feed realism.

## 12. Real levels (RTH vs ETH) — shipped

Added separate RTH and ETH high/low calculations from the historical bars and rendered them both in the context panel and on the interactive chart. These are synthetic session references, not exchange-derived historical levels.

## 13. Synthetic tape microstructure — shipped

Added a deterministic synthetic order-flow estimate per visible candle, exposing buy volume, sell volume, delta, imbalance, and aggressor bias. The UI updates this estimate during replay and explicitly labels it as synthetic rather than real bid/ask data.

## 14. Macro events mid-puzzle — shipped

Each generated puzzle now receives one deterministic high-impact simulated event during the future sequence. When replay reaches the event, the UI surfaces the event label and the generator applies an associated price/volume shock.

## 21. Real ELO curve — shipped

Replaced the fixed +18/-15 rating step with a classical Elo calculation using expected score, K-factor 24, and a synthetic opponent rating tied to difficulty. Harder puzzles therefore carry different rating expectations instead of every result moving the rating by the same amount.

## 26. Daily challenges with deterministic seed — shipped

Added a Daily Challenge entry point that uses a calendar-date-derived deterministic seed and Normal difficulty, so the same instrument/timeframe combination produces the same daily puzzle for that date. Daily runs are logged as challenge entries and can be finished from the result screen without loading a second puzzle.

## 27. Collectible pattern cards — shipped

Added a persistent collection of setup cards. Each solved puzzle exposes its setup as a collectible, the home screen shows collected versus locked patterns, and Reset Stats clears the collection.

## 31. Offline mode — shipped

Added a minimal PWA shell with a web manifest, SVG app icon, service-worker registration, shell precaching, and runtime same-origin caching. After an online load, the application assets can be served from cache when the network is unavailable.

## Advanced phase — historical real market data

The next phase is explicitly **historical-first**. There is no real-time feed requirement.

The preferred initial source is B3's public Daily Market Bulletin / historical session files, especially the derivatives **Negócio a negócio** table, which can be queried retroactively by trading date.

The implementation path is:
1. acquire a curated set of real sessions for WINFUT and WDOFUT;
2. normalize trades and contract metadata;
3. aggregate to 1m and derive 5m/15m/1h;
4. build a historical exercise library with pedagogical metadata;
5. connect the puzzle selector to the historical library;
6. retain synthetic generation as fallback and for controlled test cases.

There is intentionally no backend streaming stage in this plan. Any storage/distribution decision must still respect the applicable market-data usage terms.
