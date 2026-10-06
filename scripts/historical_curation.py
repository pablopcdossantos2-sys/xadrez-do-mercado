from __future__ import annotations

from collections import defaultdict


CURATION_TAG_WEIGHTS = {
    "trend-up": 3.0,
    "trend-down": 3.0,
    "balanced": 2.5,
    "high-volatility": 3.0,
    "low-volatility": 3.0,
    "normal-volatility": 1.0,
    "gap-up": 4.0,
    "gap-down": 4.0,
    "reversal": 4.0,
    "breakout": 3.0,
    "consolidation": 3.0,
    "opening-drive": 2.0,
    "rollover-session": 1.0,
    "easy": 1.5,
    "normal": 1.0,
    "hard": 1.5,
}


def _quantile(values: list[float], q: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    if len(ordered) == 1:
        return ordered[0]
    pos = (len(ordered) - 1) * q
    low = int(pos)
    high = min(len(ordered) - 1, low + 1)
    frac = pos - low
    return ordered[low] * (1 - frac) + ordered[high] * frac


def _continuity(bars: list[dict]) -> float:
    if len(bars) < 2:
        return 0.0
    expected = max(1, int((bars[-1]["time"] - bars[0]["time"]) / 60) + 1)
    return min(1.0, len(bars) / expected)


def _opening_move_pct(bars: list[dict], minutes: int = 60) -> float:
    if not bars:
        return 0.0
    sample = bars[: min(minutes, len(bars))]
    first = sample[0]["open"]
    return (sample[-1]["close"] - first) / first if first else 0.0


def enrich_curation(candidates: list[dict]) -> list[dict]:
    """Attach deterministic pedagogical metadata to historical sessions.

    Volatility labels are relative to the candidate pool for the same asset.
    Gap labels are only calculated against the preceding session of the same
    contract so a rollover cannot be mistaken for a market gap.
    """
    if not candidates:
        return []

    ordered = sorted(candidates, key=lambda x: (x["tradeDate"], x["contract"]))
    ranges = [float(x["stats"].get("rangePct", 0.0)) for x in ordered]
    low_cut = _quantile(ranges, 1 / 3)
    high_cut = _quantile(ranges, 2 / 3)
    previous_by_contract: dict[str, dict] = {}
    previous_session: dict | None = None

    for session in ordered:
        stats = session["stats"]
        bars = session.get("bars1m", [])
        first = float(stats.get("first", 0.0))
        last = float(stats.get("last", first))
        high = float(stats.get("high", max(first, last)))
        low = float(stats.get("low", min(first, last)))
        range_pct = float(stats.get("rangePct", 0.0))
        trend_pct = float(stats.get("trendPct", 0.0))
        price_range = max(0.0, high - low)
        close_location = (last - low) / price_range if price_range else 0.5
        trend_strength = abs(trend_pct) / range_pct if range_pct else 0.0
        continuity = _continuity(bars)
        opening_move_pct = _opening_move_pct(bars)

        trend = (
            "trend-up"
            if trend_pct >= max(0.003, range_pct * 0.35)
            else "trend-down"
            if trend_pct <= -max(0.003, range_pct * 0.35)
            else "balanced"
        )
        volatility = (
            "low"
            if range_pct <= low_cut
            else "high"
            if range_pct >= high_cut
            else "normal"
        )

        previous_same_contract = previous_by_contract.get(session["contract"])
        gap_pct: float | None = None
        gap = "unknown"
        if previous_same_contract:
            previous_close = float(previous_same_contract["stats"].get("last", 0.0))
            if previous_close:
                gap_pct = (first - previous_close) / previous_close
                gap = "gap-up" if gap_pct >= 0.0025 else "gap-down" if gap_pct <= -0.0025 else "none"

        net = last - first
        up_excursion = high - first
        down_excursion = first - low
        characters: list[str] = []
        if (
            (net > 0 and down_excursion >= max(abs(net) * 1.1, price_range * 0.28) and close_location >= 0.65)
            or (net < 0 and up_excursion >= max(abs(net) * 1.1, price_range * 0.28) and close_location <= 0.35)
        ):
            characters.append("reversal")
        if trend == "balanced" and volatility != "high" and trend_strength <= 0.3:
            characters.append("consolidation")
        if (
            (trend == "trend-up" and close_location >= 0.82)
            or (trend == "trend-down" and close_location <= 0.18)
        ):
            characters.append("breakout")
        if range_pct and abs(opening_move_pct) >= range_pct * 0.38 and (
            (opening_move_pct > 0 and trend_pct > 0) or (opening_move_pct < 0 and trend_pct < 0)
        ):
            characters.append("opening-drive")
        if not characters:
            characters.append("two-sided")

        difficulty = (
            "hard"
            if "reversal" in characters or (trend == "balanced" and volatility == "high")
            else "easy"
            if trend != "balanced" and trend_strength >= 0.55 and (close_location >= 0.75 or close_location <= 0.25)
            else "normal"
        )
        quality = "excellent" if continuity >= 0.97 else "good" if continuity >= 0.9 else "usable"
        rollover = bool(previous_session and previous_session["contract"] != session["contract"])

        tags = [trend, f"{volatility}-volatility"]
        if gap in ("gap-up", "gap-down"):
            tags.append(gap)
        tags.extend(characters)
        tags.append(difficulty)
        if rollover:
            tags.append("rollover-session")
        tags = list(dict.fromkeys(tags))

        quality_score = 100 if quality == "excellent" else 85 if quality == "good" else 70
        diversity_score = min(100, round(quality_score * 0.65 + len(tags) * 5 + min(20, trend_strength * 20)))

        stats.update(
            {
                "gapPct": round(gap_pct, 6) if gap_pct is not None else None,
                "continuityPct": round(continuity, 6),
                "openingMovePct": round(opening_move_pct, 6),
                "closeLocation": round(close_location, 6),
                "trendStrength": round(trend_strength, 6),
            }
        )
        stats["tags"] = tags
        session["curation"] = {
            "trend": trend,
            "volatility": volatility,
            "gap": gap,
            "characters": characters,
            "difficulty": difficulty,
            "quality": quality,
            "score": diversity_score,
            "tags": tags,
        }

        previous_by_contract[session["contract"]] = session
        previous_session = session

    return ordered


def choose_curated(candidates: list[dict], limit: int) -> list[dict]:
    """Greedily maximize pedagogical regime coverage instead of raw recency."""
    if not candidates or limit <= 0:
        return []
    candidates = enrich_curation(candidates)
    if len(candidates) <= limit:
        return candidates

    chosen: list[dict] = []
    remaining = list(candidates)
    seen_tags: set[str] = set()
    seen_contracts: set[str] = set()
    volumes = [float(x["stats"].get("volume", 0.0)) for x in candidates]
    max_volume = max(volumes) if volumes else 1.0

    while remaining and len(chosen) < limit:
        def score(item: dict) -> tuple[float, str]:
            tags = item["curation"]["tags"]
            unseen = sum(CURATION_TAG_WEIGHTS.get(tag, 0.5) for tag in tags if tag not in seen_tags)
            contract_bonus = 1.5 if item["contract"] not in seen_contracts else 0.0
            quality_bonus = float(item["curation"].get("score", 0)) / 100
            activity_bonus = (float(item["stats"].get("volume", 0.0)) / max_volume) * 0.5 if max_volume else 0.0
            return (unseen + contract_bonus + quality_bonus + activity_bonus, item["tradeDate"])

        best = max(remaining, key=score)
        chosen.append(best)
        remaining.remove(best)
        seen_tags.update(best["curation"]["tags"])
        seen_contracts.add(best["contract"])

    return sorted(chosen, key=lambda x: (x["tradeDate"], x["contract"]))


def summarize_coverage(sessions: list[dict]) -> dict[str, list[str]]:
    by_asset: dict[str, set[str]] = defaultdict(set)
    for session in sessions:
        by_asset[session["asset"]].update(session.get("curation", {}).get("tags", []))
    return {asset: sorted(tags) for asset, tags in by_asset.items()}
