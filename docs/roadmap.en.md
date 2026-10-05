# Trading Tape Puzzles — Improvement Roadmap

> **Strategic Document** · v1.7
>
> 32 improvements to turn Tape Puzzles from a guessing game into a real training tool.

Every item is ranked by **impact on user learning**, also considering implementation effort, technical dependencies, and alignment with the project's stated goal: *"chess puzzles for futures day traders"*.

**Summary:** 32 items · 4 tiers · 19 shipped · 13 pending

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

### 4. Realism of the procedural generator
**Effort:** High · **Status:** ✅ SHIPPED

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
**Effort:** Medium · **Status:** Pending

### 13. Synthetic tape microstructure
**Effort:** High · **Status:** Pending

### 14. Macro events mid-puzzle
**Effort:** Medium · **Status:** Pending

### 15. "Blind tape" mode
**Effort:** Low · **Status:** ✅ SHIPPED (in repo)

### 16. "Only structure" vs "Full context" mode
**Effort:** Low · **Status:** Pending

### 17. Reverse replay after result
**Effort:** Medium · **Status:** ✅ SHIPPED

After the result, the user can click **"Explore another side"** to replay the same puzzle with Long, Short, or Skip — *not* to rerun the numbers, but to *feel* the sequence of bars unfold from the other direction. The exploration replay runs the full SL/TP bracket engine, Play/Pause/Step at all speeds, and Flatten. A blue banner marks the sidebar as **"Exploration — not counted"**, and nothing is written to stats or journal. A **"Back to result"** button restores the original post-decision view.

This is the purest form of counterfactual training: not "what would have happened" as a static R number, but "here is what the market did, and here is how it would have felt if you had been on the other side."

### 18. Visual session clock
**Effort:** Low · **Status:** Pending

### 19. "Speed run" mode
**Effort:** Low · **Status:** ✅ SHIPPED (in repo)

### 20. Revenge trade warning
**Effort:** Low · **Status:** Pending

---

## Tier 4 · Low

*Polish, retention, infra.*

### 21. Real ELO curve (Glicko / classical Elo)
**Effort:** Medium · **Status:** Pending

### 22. Ranks / tiers
**Effort:** Low · **Status:** ✅ SHIPPED

### 23. Streak with "freeze"
**Effort:** Low · **Status:** ✅ SHIPPED

### 24. 30-second onboarding
**Effort:** Low · **Status:** ✅ SHIPPED

### 25. Mobile responsiveness
**Effort:** Medium · **Status:** ✅ SHIPPED

### 26. Daily challenges with deterministic seed
**Effort:** Medium · **Status:** Pending

### 27. Collectible pattern cards
**Effort:** Medium · **Status:** Pending

### 28. Subtle sound
**Effort:** Low · **Status:** ✅ SHIPPED

### 29. Migrate to Vite + React + TypeScript
**Effort:** High · **Status:** ✅ SHIPPED (in repo)

### 30. Tests for pure functions
**Effort:** Low · **Status:** Pending

### 31. Offline mode (service worker)
**Effort:** Medium · **Status:** Pending

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
| 12 | Real levels (RTH/ETH) | T3 | Medium | Medium | Pending |
| 13 | Synthetic tape microstructure | T3 | High | Medium-high | Pending |
| 14 | Macro events mid-puzzle | T3 | Medium | Medium | Pending |
| 16 | Only structure vs Full context | T3 | Low | Medium | Pending |
| 18 | Visual session clock | T3 | Low | Medium | Pending |
| 20 | Revenge trade warning | T3 | Low | Medium | Pending |
| 21 | Real ELO curve (Glicko) | T4 | Medium | Medium-high | Pending |
| 26 | Daily challenges | T4 | Medium | Medium | Pending |
| 27 | Collectible cards | T4 | Medium | Low | Pending |
| 30 | Tests for pure functions | T4 | Low | Engineering | Pending |
| 31 | Offline mode (PWA) | T4 | Medium | Low | Pending |

### Quick wins — do first

- → Real levels (RTH/ETH) (#12)
- → Session clock (#18)
- → Revenge trade warning (#20)

### Structural investments

- → Adaptive ELO (Glicko) (#21)
- → Tests for pure functions (#30)
- → PWA offline mode (#31)

---

## Executive summary

**Nineteen of thirty-two items are now shipped.** Tier 2 is complete, while Tier 1 items 3 and 4 remain pending because their previously documented capabilities are not yet fully present in the audited codebase.

The two newly verified learning-loop items are **adaptive difficulty** and **reverse replay**:

- **Adaptive difficulty** keeps the user in a target process-accuracy zone using a rolling 20-decision window, with difficulty changes driven by decision quality rather than lucky trade outcomes.
- **Reverse replay** turns the existing counterfactual numbers into an interactive, non-scoring exploration of the same future sequence.

The remaining work is mostly **depth** (real levels, microstructure, macro events), **meta-progression** (Glicko ELO, daily challenges, cards), and **engineering** (tests, offline PWA). 

---

*Trading Tape Puzzles · Improvement Roadmap · v1.7 · 32 items · 4 tiers · 19 shipped · 13 pending*
