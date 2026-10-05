# Trading Tape Puzzles — Improvement Roadmap

> **Strategic Document** · v1.1
>
> 32 improvements to turn Tape Puzzles from a guessing game into a real training tool.

Every item is ranked by **impact on user learning**, also considering implementation effort, technical dependencies, and alignment with the project's stated goal: *"chess puzzles for futures day traders"*.

**Summary:** 32 items · 4 tiers · 4 shipped · 28 pending

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

These are the items that separate a *direction quiz* from a *deliberate training tool*. Every other tier depends on these to make pedagogical sense.

### 1. Counterfactual debrief

**Effort:** Low · **Status:** ✅ SHIPPED

After the result, show what would have happened with **each alternative** (Long, Short, Skip) against the same future bars.

> *Why it's #1:* learning doesn't happen on the win — it happens on the *contrast*.

### 2. Playbook with labeled setups

**Effort:** Medium · **Status:** ✅ SHIPPED

Tag every puzzle with a setup type (VWAP Reclaim, ORB, Failed Breakdown, Liquidity Sweep, Trend Pullback, Range Fade, Momentum Push, Consolidation) and show the label in the sidebar.

### 3. AI validation against hindsight bias

**Effort:** High · **Status:** Partial

The current "correct answer" is *which side hit TP before SL* — that's pure hindsight. Accept multiple valid answers, use an auditable rule tree, and expose a confidence score.

### 4. Realism of the procedural generator

**Effort:** High · **Status:** Pending

Inject volatility clustering, session regimes, volume correlated with |return|, opening gaps. Alternative: real historical CSV of MES/MNQ.

---

## Tier 2 · High

*Learning multipliers.*

We fight the most common trader vice: *bad process with good outcome*.

### 5. Process score vs. outcome score

**Effort:** Medium · **Status:** ✅ SHIPPED

A second score that rewards good decisions even when the market doesn't cooperate. Fights result bias. The home screen shows an insight comparing process accuracy vs. outcome accuracy.

### 6. Heatmap of "where you fail"

**Effort:** Medium · **Status:** ✅ SHIPPED

Stats aggregated by setup, timeframe, time of day, direction, and instrument. The user learns where they're weak. Buckets with fewer than 2 samples are hidden.

### 7. Expanded debrief "Why not the other side?"

**Effort:** Low · **Status:** Pending

After a loss, objective bullets: structure, volume, location, confluence.

### 8. Per-decision journal with export

**Effort:** Low · **Status:** Pending

Chart snapshot, context, decisions, final R. Export as JSON/CSV.

### 9. Justified skip (with reason)

**Effort:** Low · **Status:** Pending

On Skip, ask "Why?" and compare against the AI's real reason. Trains technical vocabulary.

### 10. Adaptive difficulty

**Effort:** Medium · **Status:** Pending

Keep the user in flow zone (60–75% accuracy) by tuning generator noise.

### 11. "Trap of the day" warning

**Effort:** Medium · **Status:** Pending

Detect deceptive patterns and surface a side note before the decision, without giving away the answer.

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

ΔELO depends on puzzle difficulty. Self-calibrating progression.

### 22. Ranks / tiers

**Effort:** Low · **Status:** ✅ SHIPPED

Novice · Developing · Consistent · Sharp · Institutional.

### 23. Streak with "freeze"

**Effort:** Low · **Status:** Pending

1 freeze/day to avoid resetting the streak. Reduces return friction.

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

Each mastered setup becomes a "card". Gamifies study.

### 28. Subtle sound

**Effort:** Low · **Status:** Pending

Chime on TP hit, thud on stop. Toggleable.

### 29. Migrate to Vite + React + TypeScript

**Effort:** High · **Status:** Recommended

When single-file exceeds ~2,000 LOC. Modular structure.

### 30. Tests for pure functions

**Effort:** Low · **Status:** Pending

classifySetup, computeVWAP, computeATR, analyzePuzzle.

### 31. Offline mode (service worker)

**Effort:** Medium · **Status:** Pending

PWA with cache. Train on a plane.

### 32. State via useReducer

**Effort:** Low · **Status:** Pending

Replace the 12 interdependent useState hooks. Easier to test, fewer sync bugs.

---

## Prioritization matrix

Compact view to decide implementation order. **Start with the green quadrant.**

| # | Item | Tier | Effort | Impact | Status |
|---|------|------|--------|--------|--------|
| 1 | Counterfactual debrief | T1 | Low | Very high | ✅ SHIPPED |
| 2 | Playbook with labeled setups | T1 | Medium | Very high | ✅ SHIPPED |
| 5 | Process score vs. outcome score | T2 | Medium | High | ✅ SHIPPED |
| 6 | Heatmap of "where you fail" | T2 | Medium | High | ✅ SHIPPED |
| 8 | Per-decision journal with export | T2 | Low | High | Pending |
| 3 | AI validation (hindsight bias) | T1 | High | Very high | Partial |
| 4 | Realism of procedural generator | T1 | High | Very high (long term) | Pending |
| 10 | Adaptive difficulty | T2 | Medium | High | Pending |
| 21 | Real ELO (Glicko) | T4 | Medium | Medium-high | Pending |
| 29 | Migration to Vite + TS | T4 | High | Enabler | Recommended |

### Quick wins — do first

- ✅ Counterfactual debrief
- ✅ Playbook with labeled setups
- ✅ Process score vs. outcome score
- ✅ Heatmap of "where you fail"
- ✅ Ranks / tiers
- ✅ 30-second onboarding
- → Justified skip (#9)
- → Expanded debrief (#7)
- → Exportable journal (#8)

### Structural investments

- → AI validation (#3)
- → Generator realism (#4)
- → Adaptive difficulty (#10)
- → Vite + TS migration (#29)

---

## Executive summary

Today, Tape Puzzles is a *beautiful direction-guessing game*. To become a **real training tool**, the key lies in three Tier 1 items: **counterfactual debrief**, **setup labeling**, and **data realism**.

With those three, the user leaves every puzzle knowing *what* they missed, *why*, and *what the market would have done* in any direction — which is exactly what *"chess puzzles for traders"* should deliver.

The addition of **process score** and the **weakness heatmap** (Tier 2, #5 and #6) closes the loop: the app now separates good decisions from good outcomes, and tells the user exactly where their edge is missing.

---

*Trading Tape Puzzles · Improvement Roadmap · v1.1 · 32 items · 4 tiers · 6 shipped · 26 pending*