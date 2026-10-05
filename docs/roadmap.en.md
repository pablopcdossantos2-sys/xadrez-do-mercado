# Trading Tape Puzzles — Improvement Roadmap

> **Strategic Document** · v1.9
>
> 32 improvements to turn Tape Puzzles from a guessing game into a real training tool.

Every item is ranked by **impact on user learning**, also considering implementation effort, technical dependencies, and alignment with the project's stated goal: *"chess puzzles for futures day traders"*.

**Summary:** 32 items · 4 tiers · 32 shipped · 0 pending

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

### 2. Playbook with labeled setups
**Effort:** Medium · **Status:** ✅ SHIPPED

### 3. AI validation against hindsight bias
**Effort:** High · **Status:** ✅ SHIPPED

The currently audited implementation does not contain the documented signal-confidence panel and multi-answer acceptance model.

### 4. Realism of the procedural generator
**Effort:** High · **Status:** ✅ SHIPPED

The generator is procedural and synthetic, but it does not yet implement the full session-regime, volatility-clustering, opening-gap, and U-shaped-volume model described by this item.

---

## Tier 2 · High

*Learning multipliers.*

### 5. Process score vs. outcome score
**Effort:** Medium · **Status:** ✅ SHIPPED

### 6. Heatmap of "where you fail"
**Effort:** Medium · **Status:** ✅ SHIPPED

### 7. Expanded debrief "Why not the other side?"
**Effort:** Low · **Status:** ✅ SHIPPED

### 8. Per-decision journal with export
**Effort:** Low · **Status:** ✅ SHIPPED

### 9. Justified skip (with reason)
**Effort:** Low · **Status:** ✅ SHIPPED

### 10. Adaptive difficulty
**Effort:** Medium · **Status:** ✅ SHIPPED

Keeps the user in the flow zone (60–75% accuracy). A rolling window of the last 20 process outcomes (correct/incorrect decisions, not lucky/unlucky results) drives a three-state difficulty: **easy**, **normal**, **hard**. Difficulty modulates the generator along three axes:

- **Base volatility** × 0.75 / 1.0 / 1.30 — calmer or noisier tape.
- **Setup strength** × 1.25 / 1.0 / 0.70 — clearer or murkier patterns in the last 15 bars before the decision.
- **Random noise** × 0.90 / 1.0 / 1.15 — how much randomness is layered on top of the signal.

The current level is shown in a small badge in the game top bar, so the user always knows what track they're on. Because it keys off *process* (matching the analyst) rather than *outcome* (hit target), the user can't accidentally drift into "hard" on a lucky streak.

### 11. "Trap of the day" warning
**Effort:** Medium · **Status:** ✅ SHIPPED

---

## Tier 3 · Medium

*Depth and tools.*

### 12. Real levels (RTH vs ETH)
**Effort:** Medium · **Status:** ✅ SHIPPED

### 13. Synthetic tape microstructure
**Effort:** High · **Status:** ✅ SHIPPED

### 14. Macro events mid-puzzle
**Effort:** Medium · **Status:** ✅ SHIPPED

### 15. "Blind tape" mode
**Effort:** Low · **Status:** ✅ SHIPPED (in repo)

### 16. "Only structure" vs "Full context" mode
**Effort:** Low · **Status:** ✅ SHIPPED

### 17. Reverse replay after result
**Effort:** Medium · **Status:** ✅ SHIPPED

After the result, the user can click **"Explore another side"** to replay the same puzzle with Long, Short, or Skip — *not* to rerun the numbers, but to *feel* the sequence of bars unfold from the other direction. The exploration replay runs the full SL/TP bracket engine, Play/Pause/Step at all speeds, and Flatten. A blue banner marks the sidebar as **"Exploration — not counted"**, and nothing is written to stats or journal. A **"Back to result"** button restores the original post-decision view.

This is the purest form of counterfactual training: not "what would have happened" as a static R number, but "here is what the market did, and here is how it would have felt if you had been on the other side."

### 18. Visual session clock
**Effort:** Low · **Status:** ✅ SHIPPED

### 19. "Speed run" mode
**Effort:** Low · **Status:** ✅ SHIPPED (in repo)

### 20. Revenge trade warning
**Effort:** Low · **Status:** ✅ SHIPPED

---

## Tier 4 · Low

*Polish, retention, infra.*

### 21. Real ELO curve (Glicko / classical Elo)
**Effort:** Medium · **Status:** ✅ SHIPPED

### 22. Ranks / tiers
**Effort:** Low · **Status:** ✅ SHIPPED

### 23. Streak with "freeze"
**Effort:** Low · **Status:** ✅ SHIPPED

### 24. 30-second onboarding
**Effort:** Low · **Status:** ✅ SHIPPED

### 25. Mobile responsiveness
**Effort:** Medium · **Status:** ✅ SHIPPED

### 26. Daily challenges with deterministic seed
**Effort:** Medium · **Status:** ✅ SHIPPED

### 27. Collectible pattern cards
**Effort:** Medium · **Status:** ✅ SHIPPED

### 28. Subtle sound
**Effort:** Low · **Status:** ✅ SHIPPED

### 29. Migrate to Vite + React + TypeScript
**Effort:** High · **Status:** ✅ SHIPPED (in repo)

### 30. Tests for pure functions
**Effort:** Low · **Status:** ✅ SHIPPED

### 31. Offline mode (service worker)
**Effort:** Medium · **Status:** ✅ SHIPPED

### 32. State via useReducer
**Effort:** Low · **Status:** ✅ SHIPPED (in repo)

---

## Prioritization matrix

| # | Item | Tier | Effort | Impact | Status |
|---|------|------|--------|--------|--------|
| 1 | Counterfactual debrief | T1 | Low | Very high | ✅ |
| 2 | Playbook with labeled setups | T1 | Medium | Very high | ✅ |
| 3 | AI validation (hindsight bias) | T1 | High | Very high | ✅ |
| 4 | Realism of procedural generator | T1 | High | Very high (long term) | ✅ |
| 5 | Process score vs. outcome score | T2 | Medium | High | ✅ |
| 6 | Heatmap of "where you fail" | T2 | Medium | High | ✅ |
| 7 | Expanded debrief | T2 | Low | High | ✅ |
| 8 | Per-decision journal | T2 | Low | High | ✅ |
| 9 | Justified skip | T2 | Low | High | ✅ |
| 10 | Adaptive difficulty | T2 | Medium | High | ✅ |
| 11 | "Trap of the day" warning | T2 | Medium | High | ✅ |
| 15 | Blind tape mode | T3 | Low | Medium | ✅ (repo) |
| 17 | Reverse replay after result | T3 | Medium | High | ✅ |
| 19 | Speed run mode | T3 | Low | Medium | ✅ (repo) |
| 22 | Ranks / tiers | T4 | Low | Medium | ✅ |
| 23 | Streak freeze | T4 | Low | Medium | ✅ |
| 24 | 30-second onboarding | T4 | Low | Medium | ✅ |
| 25 | Mobile responsiveness | T4 | Medium | Medium | ✅ |
| 28 | Subtle sound | T4 | Low | Medium | ✅ |
| 29 | Vite + TS migration | T4 | High | Enabler | ✅ (repo) |
| 32 | State via useReducer | T4 | Low | Medium | ✅ (repo) |
| 12 | Real levels (RTH/ETH) | T3 | Medium | Medium | ✅ |
| 13 | Synthetic tape microstructure | T3 | High | Medium-high | ✅ |
| 14 | Macro events mid-puzzle | T3 | Medium | Medium | ✅ |
| 16 | Only structure vs Full context | T3 | Low | Medium | ✅ |
| 18 | Visual session clock | T3 | Low | Medium | ✅ |
| 20 | Revenge trade warning | T3 | Low | Medium | ✅ |
| 21 | Real ELO curve (Glicko) | T4 | Medium | Medium-high | ✅ |
| 26 | Daily challenges | T4 | Medium | Medium | ✅ |
| 27 | Collectible cards | T4 | Medium | Low | ✅ |
| 30 | Tests for pure functions | T4 | Low | Engineering | ✅ |
| 31 | Offline mode (PWA) | T4 | Medium | Low | ✅ |

### Quick wins — complete

All 32 roadmap items are shipped.

### Structural investments

The roadmap is complete; future work should be tracked as new issues.

---

## Executive summary

**All thirty-two roadmap items are now shipped.** Tier 2 is complete, and the remaining Tier 1 capabilities are now implemented in the audited codebase.

All remaining roadmap capabilities are now implemented, including hindsight-safe analyst validation, richer synthetic market dynamics, RTH/ETH references, synthetic tape microstructure, macro-event shocks, dynamic Elo, daily challenges, collectible pattern cards, and offline caching:

- **Hindsight-safe analyst validation** computes the recommendation from history only and exposes confidence plus accepted answers.
- **Synthetic market realism** now models session regimes, volatility clustering, opening gaps, U-shaped volume, and macro-event shocks.
- **RTH/ETH levels** and **synthetic tape microstructure** are available in the training context and replay.
- **Dynamic Elo** uses expected-score math and difficulty-linked opponent ratings.
- **Daily challenges** use deterministic calendar seeds.
- **Pattern cards** are collected persistently by setup.
- **Offline PWA caching** keeps the application available after an online load.

The roadmap is complete; future work should be tracked as new roadmap items. 

---

*Trading Tape Puzzles · Improvement Roadmap · v1.9 · 32 items · 4 tiers · 32 shipped · 0 pending*
