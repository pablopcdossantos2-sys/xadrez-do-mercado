# Trading Tape Puzzles — Improvement Roadmap

> **Strategic Document** · v1.3
>
> 32 improvements to turn Tape Puzzles from a guessing game into a real training tool.

Every item is ranked by **impact on user learning**, also considering implementation effort, technical dependencies, and alignment with the project's stated goal: *"chess puzzles for futures day traders"*.

**Summary:** 32 items · 4 tiers · 10 shipped · 22 pending

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

**Effort:** High · **Status:** Partial

The current "correct answer" is *which side hit TP before SL* — pure hindsight. Accept multiple valid answers, use an auditable rule tree, and expose a confidence score.

### 4. Realism of the procedural generator

**Effort:** High · **Status:** Pending

Inject volatility clustering, session regimes, volume correlated with |return|, opening gaps. Alternative: real historical CSV of MES/MNQ.

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

Every decision is appended to a local journal (last 200). Export as JSON or CSV. Now also stores skip reason and trap detected.

### 9. Justified skip (with reason)

**Effort:** Low · **Status:** ✅ SHIPPED

On Skip, a modal asks "Why?" with five canonical reasons (bad setup, far from VWAP, against trend, no confluence, unsure). The choice is compared against the analyst's reason and stored in the journal. Comparison is shown in the debrief.

### 10. Adaptive difficulty

**Effort:** Medium · **Status:** Pending

Keep the user in flow zone (60–75% accuracy) by tuning generator noise.

### 11. "Trap of the day" warning

**Effort:** Medium · **Status:** ✅ SHIPPED

`detectTrap()` analyzes the visible history and flags deceptive patterns: oversized bar body (>1.5× ATR), dominant wick rejection, VWAP whipsaw (≥4 crossings in 8 bars), 3-bar push on declining volume, and failed breakouts in the last 4 bars. A warning banner appears in the Decision phase sidebar, without giving away the answer.

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

Re-test with a different choice on the same puzzle. Confidence calibration.

### 18. Visual session clock

**Effort:** Low · **Status:** Pending

Bar with markers at 09:30, 10:00, 11:30, 13:00, 15:00, 16:00.

### 19. "Speed run" mode

**Effort:** Low · **Status:** Pending

10 puzzles in 15 minutes, no debrief. Warm-up before the open.

### 20. Revenge trade warning

**Effort:** Low · **Status:** Pending

Detect risk escalation after losses and warn. Teaches trading psychology.

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

**Effort:** Low · **Status:** Pending

1 freeze/day to avoid resetting the streak.

### 24. 30-second onboarding

**Effort:** Low · **Status:** ✅ SHIPPED

3-step overlay on first visit. Home screen explains how the game works.

### 25. Mobile responsiveness

**Effort:** Medium · **Status:** Pending

Vertical layout, touch buttons, gestures.

### 26. Daily challenges with deterministic seed

**Effort:** Medium · **Status:** Pending

1 puzzle/day. Local ranking: you vs. yesterday's you.

### 27. Collectible pattern cards

**Effort:** Medium · **Status:** Pending

Each mastered setup becomes a "card".

### 28. Subtle sound

**Effort:** Low · **Status:** Pending

Chime on TP hit, thud on stop. Toggleable.

### 29. Migrate to Vite + React + TypeScript

**Effort:** High · **Status:** Recommended

When single-file exceeds ~2,000 LOC. Modular structure.

### 30. Tests for pure functions

**Effort:** Low · **Status:** Pending

classifySetup, computeVWAP, computeATR, analyzePuzzle, analyzeDebrief, detectTrap.

### 31. Offline mode (service worker)

**Effort:** Medium · **Status:** Pending

PWA with cache.

### 32. State via useReducer

**Effort:** Low · **Status:** Pending

Replace the 12+ interdependent useState hooks.

---

## Prioritization matrix

| # | Item | Tier | Effort | Impact | Status |
|---|------|------|--------|--------|--------|
| 1 | Counterfactual debrief | T1 | Low | Very high | ✅ SHIPPED |
| 2 | Playbook with labeled setups | T1 | Medium | Very high | ✅ SHIPPED |
| 5 | Process score vs. outcome score | T2 | Medium | High | ✅ SHIPPED |
| 6 | Heatmap of "where you fail" | T2 | Medium | High | ✅ SHIPPED |
| 7 | Expanded debrief "Why not the other side?" | T2 | Low | High | ✅ SHIPPED |
| 8 | Per-decision journal with export | T2 | Low | High | ✅ SHIPPED |
| 9 | Justified skip (with reason) | T2 | Low | High | ✅ SHIPPED |
| 11 | "Trap of the day" warning | T2 | Medium | High | ✅ SHIPPED |
| 3 | AI validation (hindsight bias) | T1 | High | Very high | Partial |
| 4 | Realism of procedural generator | T1 | High | Very high (long term) | Pending |
| 10 | Adaptive difficulty | T2 | Medium | High | Pending |
| 21 | Real ELO (Glicko) | T4 | Medium | Medium-high | Pending |
| 29 | Migration to Vite + TS | T4 | High | Enabler | Recommended |

### Quick wins — do first

- ✅ Counterfactual debrief (#1)
- ✅ Playbook with labeled setups (#2)
- ✅ Process score vs. outcome score (#5)
- ✅ Heatmap of "where you fail" (#6)
- ✅ Expanded debrief "Why not the other side?" (#7)
- ✅ Per-decision journal with export (#8)
- ✅ Justified skip with reason (#9)
- ✅ "Trap of the day" warning (#11)
- ✅ Ranks / tiers (#22)
- ✅ 30-second onboarding (#24)
- → Adaptive difficulty (#10)

### Structural investments

- → AI validation (hindsight bias) (#3)
- → Generator realism (#4)
- → Adaptive difficulty (#10)
- → Vite + TS migration (#29)

---

## Executive summary

Today, Tape Puzzles is a *beautiful direction-guessing game*. To become a **real training tool**, the key lies in three Tier 1 items: **counterfactual debrief**, **setup labeling**, and **data realism**.

The addition of **process score**, the **weakness heatmap**, the **four-axis expanded debrief**, the **per-decision journal**, the **justified skip modal**, and the **trap warning** (Tier 2, #5, #6, #7, #8, #9, #11) closes the loop: the app now separates good decisions from good outcomes, tells the user exactly where their edge is missing, explains *why* the other side lost, keeps a persistent exportable record of every decision, asks the user to justify skips, and warns about the most common traps in real time.

The next frontier is the **generator realism** (#4) — until the data is realistic, the rest is training wheels on a synthetic track.

---

*Trading Tape Puzzles · Improvement Roadmap · v1.3 · 32 items · 4 tiers · 10 shipped · 22 pending*
