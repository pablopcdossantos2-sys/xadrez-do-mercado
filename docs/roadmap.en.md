# Trading Tape Puzzles — Improvement Roadmap

> **Strategic Document** · v1.5
>
> 32 improvements to turn Tape Puzzles from a guessing game into a real training tool.

Every item is ranked by **impact on user learning**, also considering implementation effort, technical dependencies, and alignment with the project's stated goal: *"chess puzzles for futures day traders"*.

**Summary:** 32 items · 4 tiers · 17 shipped · 15 pending

---

## Table of contents

- [Tier 1 · Critical](#tier-1--critical)
- [Tier 2 · High](#tier-2--high)
- [Tier 3 · Medium](#tier-3--medium)
- [Tier 4 · Low](#tier-4--low)
- [Prioritization matrix](#prioritization-matrix)
- [Executive summary](#executive-summary)

---

## Tier 1 · Critical

*Foundation — without this, the app doesn't teach.*

### 1. Counterfactual debrief

**Effort:** Low · **Status:** ✅ SHIPPED

Show what each alternative (Long, Short, Skip) would have produced.

### 2. Playbook with labeled setups

**Effort:** Medium · **Status:** ✅ SHIPPED

Tag every puzzle with its setup type and show the label in the sidebar.

### 3. AI validation against hindsight bias

**Effort:** High · **Status:** Pending

The current analyst still selects the decision primarily from the simulated future outcomes. The documented signal-confidence panel and multi-answer acceptance rules are not implemented in the current application.

### 4. Realism of the procedural generator

**Effort:** High · **Status:** Pending

The current generator produces procedural OHLCV series, but the session-regime, volatility-clustering, opening-gap, and U-shaped-volume model described here is not fully implemented.

---

## Tier 2 · High

*Learning multipliers.*

### 5. Process score vs. outcome score

**Effort:** Medium · **Status:** ✅ SHIPPED

A second score that rewards good decisions even when the market doesn't cooperate.

### 6. Heatmap of "where you fail"

**Effort:** Medium · **Status:** ✅ SHIPPED

Stats aggregated by setup, timeframe, direction, and instrument. Weakest buckets first.

### 7. Expanded debrief "Why not the other side?"

**Effort:** Low · **Status:** ✅ SHIPPED

Objective panel with four classic axes — structure, volume, location, confluence — each with a colored dot indicating support/contradiction of the analyst call.

### 8. Per-decision journal with export

**Effort:** Low · **Status:** ✅ SHIPPED

Every decision is appended to a local journal (last 200). Export as JSON or CSV. Stores skip reason, trap detected, and freeze usage.

### 9. Justified skip (with reason)

**Effort:** Low · **Status:** ✅ SHIPPED

On Skip, a modal asks "Why?" with five canonical reasons. The choice is compared against the analyst's reason and stored in the journal.

### 10. Adaptive difficulty

**Effort:** Medium · **Status:** Pending

Keep the user in flow zone (60–75% accuracy) by tuning generator noise.

### 11. "Trap of the day" warning

**Effort:** Medium · **Status:** ✅ SHIPPED

`detectTrap()` flags oversized bars, dominant wicks, VWAP whipsaws, and failed breakouts. Warning banner in the Decision phase sidebar.

---

## Tier 3 · Medium

*Depth and tools.*

### 12. Real levels (RTH vs ETH)

**Effort:** Medium · **Status:** Pending

Simulated session model with RTH PDH/PDL, ONH/ONL, gap, OR.

### 13. Synthetic tape microstructure

**Effort:** High · **Status:** Pending

Cumulative delta, simplified footprint, Volume Profile (POC, VAH, VAL).

### 14. Macro events mid-puzzle

**Effort:** Medium · **Status:** Pending

Inject plausible events to teach risk management around news.

### 15. "Blind tape" mode

**Effort:** Low · **Status:** Pending

Hide price/time to force pure structure reading.

### 16. "Only structure" vs "Full context" mode

**Effort:** Low · **Status:** Pending

Toggle to hide context. Trains pure price action first.

### 17. Reverse replay after result

**Effort:** Medium · **Status:** Pending

Re-test with a different choice on the same puzzle.

### 18. Visual session clock

**Effort:** Low · **Status:** Pending

Bar with markers at 09:30, 10:00, 11:30, 13:00, 15:00, 16:00.

### 19. "Speed run" mode

**Effort:** Low · **Status:** ✅ SHIPPED

10 rapid decisions within a 15-minute session, with no intermediate debrief. Each round is evaluated automatically and the next puzzle loads without manual replay. Warm-up before the open.

### 20. Revenge trade warning

**Effort:** Low · **Status:** Pending

Detect risk escalation after losses and warn.

---

## Tier 4 · Low

*Polish, retention, infra.*

### 21. Real ELO curve (Glicko / classical Elo)

**Effort:** Medium · **Status:** Pending

ΔELO depends on puzzle difficulty.

### 22. Ranks / tiers

**Effort:** Low · **Status:** ✅ SHIPPED

Novice · Developing · Consistent · Sharp · Institutional.

### 23. Streak with "freeze"

**Effort:** Low · **Status:** ✅ SHIPPED

One freeze per day. Preserves streak on loss; resets after 24h.

### 24. 30-second onboarding

**Effort:** Low · **Status:** ✅ SHIPPED

3-step overlay on first visit.

### 25. Mobile responsiveness

**Effort:** Medium · **Status:** ✅ SHIPPED

Vertical layout below `md`. Chart 40vh on top, sidebar below.

### 26. Daily challenges with deterministic seed

**Effort:** Medium · **Status:** Pending

1 puzzle/day. Local ranking.

### 27. Collectible pattern cards

**Effort:** Medium · **Status:** Pending

Each mastered setup becomes a "card".

### 28. Subtle sound

**Effort:** Low · **Status:** ✅ SHIPPED

Web Audio API — click, chime, thud, tick, freeze shimmer. Toggle persisted.

### 29. Migrate to Vite + React + TypeScript

**Effort:** High · **Status:** ✅ SHIPPED

The former single-file runtime is now a Vite application with React and TypeScript, split into typed modules for UI, analytics, data generation, persistence, translations, and state management.

### 30. Tests for pure functions

**Effort:** Low · **Status:** Pending

classifySetup, computeVWAP, computeATR, analyzePuzzle, analyzeDebrief, detectTrap, isFreezeReady, computeSignalConfidence.

### 31. Offline mode (service worker)

**Effort:** Medium · **Status:** Pending

PWA with cache.

### 32. State via useReducer

**Effort:** Low · **Status:** ✅ SHIPPED

Interactive application state is centralized in a typed React `useReducer`, with explicit actions for puzzle flow, replay, mode changes, persistence-related UI state, result evaluation, and Speed Run progression.

---

## Prioritization matrix

| # | Item | Tier | Effort | Impact | Status |
|---|------|------|--------|--------|--------|
| 1 | Counterfactual debrief | T1 | Low | Very high | ✅ SHIPPED |
| 2 | Playbook with labeled setups | T1 | Medium | Very high | ✅ SHIPPED |
| 3 | AI validation (hindsight bias) | T1 | High | Very high | Pending |
| 4 | Realism of procedural generator | T1 | High | Very high (long term) | Pending |
| 5 | Process score vs. outcome score | T2 | Medium | High | ✅ SHIPPED |
| 6 | Heatmap of "where you fail" | T2 | Medium | High | ✅ SHIPPED |
| 7 | Expanded debrief "Why not the other side?" | T2 | Low | High | ✅ SHIPPED |
| 8 | Per-decision journal with export | T2 | Low | High | ✅ SHIPPED |
| 9 | Justified skip (with reason) | T2 | Low | High | ✅ SHIPPED |
| 11 | "Trap of the day" warning | T2 | Medium | High | ✅ SHIPPED |
| 15 | "Blind tape" mode | T3 | Low | Medium-high | ✅ SHIPPED |
| 19 | "Speed run" mode | T3 | Low | Medium-high | ✅ SHIPPED |
| 22 | Ranks / tiers | T4 | Low | Medium | ✅ SHIPPED |
| 23 | Streak with freeze | T4 | Low | Medium | ✅ SHIPPED |
| 24 | 30-second onboarding | T4 | Low | Medium | ✅ SHIPPED |
| 25 | Mobile responsiveness | T4 | Medium | Medium | ✅ SHIPPED |
| 28 | Subtle sound | T4 | Low | Medium | ✅ SHIPPED |
| 10 | Adaptive difficulty | T2 | Medium | High | Pending |
| 21 | Real ELO (Glicko) | T4 | Medium | Medium-high | Pending |
| 29 | Migration to Vite + TS | T4 | High | Enabler | ✅ SHIPPED |
| 32 | State via useReducer | T4 | Low | Enabler | ✅ SHIPPED |

### Quick wins — do first

- ✅ All 17 currently shipped items
- → Adaptive difficulty (#10)
- → Real ELO curve (#21)

### Structural investments

- ✅ Migration to Vite + TS (#29)
- → Tests for pure functions (#30)
- ✅ useReducer (#32)

---

## Executive summary

The requested **Blind tape**, **Speed run**, **Vite + React + TypeScript migration**, and **useReducer** work is now shipped. During the code audit, two older roadmap claims were also corrected: **AI validation** and **generator realism** are not fully implemented in the current codebase, so items 3 and 4 are again marked Pending rather than overstating project capabilities.

With 17 of 32 items currently shipped, the next work is concentrated on **fairer grading and market realism** (items 3 and 4), plus adaptive difficulty, Glicko ELO, microstructure, macro events, tests, and offline/PWA support.

---

*Trading Tape Puzzles · Improvement Roadmap · v1.5 · 32 items · 4 tiers · 17 shipped · 15 pending*
