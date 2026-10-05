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
