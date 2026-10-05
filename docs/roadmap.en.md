# Trading Tape Puzzles — Improvement Roadmap

> **Strategic Document** · v1.5
>
> 32 improvements to turn Tape Puzzles from a guessing game into a real training tool.

Every item is ranked by **impact on user learning**, also considering implementation effort, technical dependencies, and alignment with the project's stated goal: *"chess puzzles for futures day traders"*.

**Summary:** 32 items · 4 tiers · 15 shipped · 17 pending

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

**Effort:** High · **Status:** ✅ SHIPPED

The analyst now computes a **signal-based confidence** for each side (structure, VWAP distance, EMA distance, setup bias) *before* seeing the future, then exposes it in a `ConfidencePanel` with one bar per option. A set of **accepted answers** replaces exact matching: any alternative with confidence ≥ 0.30 that did not lose badly is a valid process outcome. Skipping becomes correctly rewarded when the setup was genuinely ambiguous — instead of being silently punished by the hindsight-graded R.

### 4. Realism of the procedural generator

**Effort:** High · **Status:** ✅ SHIPPED

`generateMarketData` was rewritten around four real-market stylized facts:

- **Session regimes** — each puzzle opens in one of *trend_up*, *trend_down*, *range*, *reversal*, or *chop*, which drives drift. `reversal` regime flips mid-session.
- **Volatility clustering** — GARCH(1,1) with α = 0.12, β = 0.78. High-vol bars cluster, quiet bars stay quiet, shocks propagate.
- **Opening gap** — ±0.15% at session start.
- **Volume shape** — U-shaped intraday profile, plus volume correlated with |return|. Big moves print on big volume, exactly like the tape.

The classifier now sees trend, range, and reversal setups with realistic frequency instead of a random-walk soup.

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

**Effort:** Low · **Status:** Pending

10 puzzles in 15 minutes, no debrief. Warm-up before the open.

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

**Effort:** High · **Status:** Recommended

When single-file exceeds ~2,000 LOC.

### 30. Tests for pure functions

**Effort:** Low · **Status:** Pending

classifySetup, computeVWAP, computeATR, analyzePuzzle, analyzeDebrief, detectTrap, isFreezeReady, computeSignalConfidence.

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
| 3 | AI validation (hindsight bias) | T1 | High | Very high | ✅ SHIPPED |
| 4 | Realism of procedural generator | T1 | High | Very high (long term) | ✅ SHIPPED |
| 5 | Process score vs. outcome score | T2 | Medium | High | ✅ SHIPPED |
| 6 | Heatmap of "where you fail" | T2 | Medium | High | ✅ SHIPPED |
| 7 | Expanded debrief "Why not the other side?" | T2 | Low | High | ✅ SHIPPED |
| 8 | Per-decision journal with export | T2 | Low | High | ✅ SHIPPED |
| 9 | Justified skip (with reason) | T2 | Low | High | ✅ SHIPPED |
| 11 | "Trap of the day" warning | T2 | Medium | High | ✅ SHIPPED |
| 22 | Ranks / tiers | T4 | Low | Medium | ✅ SHIPPED |
| 23 | Streak with freeze | T4 | Low | Medium | ✅ SHIPPED |
| 24 | 30-second onboarding | T4 | Low | Medium | ✅ SHIPPED |
| 25 | Mobile responsiveness | T4 | Medium | Medium | ✅ SHIPPED |
| 28 | Subtle sound | T4 | Low | Medium | ✅ SHIPPED |
| 10 | Adaptive difficulty | T2 | Medium | High | Pending |
| 21 | Real ELO (Glicko) | T4 | Medium | Medium-high | Pending |
| 29 | Migration to Vite + TS | T4 | High | Enabler | Recommended |

### Quick wins — do first

- ✅ All 15 shipped items
- → Adaptive difficulty (#10)
- → Real ELO curve (#21)

### Structural investments

- → Migration to Vite + TS (#29)
- → Tests for pure functions (#30)
- → useReducer (#32)

---

## Executive summary

The two Tier 1 items that were still open are now closed. **AI validation** turned the "correct answer" from a hindsight tautology into a fair, multi-answer judgment, and the **generator realism** rewrite gave the app a foundation that actually resembles an MES/MNQ session. The tutorial now rewards the same things a real trading coach would: sound process, regardless of whether the market resolved it in your favor today.

With 15 of 32 items shipped — including every Tier 1 and almost every Tier 2 — the next tier of work is about **depth** (adaptive difficulty, Glicko ELO, microstructure, macro events) and **engineering** (TypeScript migration, tests, useReducer). The learning loop is now complete enough that a serious user can improve on it without the tool fighting them.

---

*Trading Tape Puzzles · Improvement Roadmap · v1.5 · 32 items · 4 tiers · 15 shipped · 17 pending*
