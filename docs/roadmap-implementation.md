# Roadmap implementation notes

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

## Roadmap consistency audit

The audit also reconciled roadmap claims with the actual implementation. Items 3 (AI validation against hindsight bias) and 4 (procedural-generator realism) were marked Pending because the current source did not contain the capabilities previously described as shipped. This avoids documenting functionality that is not actually present.

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

