#!/usr/bin/env python3
"""Build a zero-cost local MES/MNQ library from FirstRate Data samples.

This importer intentionally keeps FirstRate Data outside the repository and
outside production builds. It downloads the public evaluation ZIPs (or accepts
user-supplied ZIPs), extracts one-minute OHLCV, splits the data into CME Globex
trading sessions, applies the project's pedagogical curation, and writes only
into private-data/firstrate by default.

The Vite development server exposes that private directory locally at
/data/local-historical. Production builds never copy it.

FirstRate Data's license does not permit general redistribution of the raw
dataset. Do not commit the generated files or republish them as a public API.
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import re
import shutil
import time
import urllib.error
import urllib.request
import zipfile
from collections import defaultdict
from datetime import date, datetime, time as dt_time, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

from historical_curation import choose_curated, summarize_coverage

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "private-data" / "firstrate"
FORBIDDEN_PUBLIC_OUTPUT = (ROOT / "public" / "data" / "historical").resolve()
NY = ZoneInfo("America/New_York")
TIMEFRAMES = {"1m": 60, "5m": 300, "15m": 900, "1h": 3600}
SAMPLE_URLS = {
    "MES": "https://frd001.s3.us-east-2.amazonaws.com/frd_sample_futures_MES.zip",
    "MNQ": "https://frd001.s3.us-east-2.amazonaws.com/frd_sample_futures_MNQ.zip",
}
PRODUCT_URLS = {
    "MES": "https://firstratedata.com/i/futures/MES",
    "MNQ": "https://firstratedata.com/i/futures/MNQ",
}
CONTRACT_RE = re.compile(r"(MES|MNQ)[FGHJKMNQUVXZ]\d{2}", re.IGNORECASE)


def download(url: str) -> bytes:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Xadrez-do-Mercado FirstRate sample importer/1.0",
            "Accept": "application/zip,application/octet-stream,*/*",
        },
    )
    last_error: Exception | None = None
    for attempt in range(4):
        try:
            with urllib.request.urlopen(request, timeout=90) as response:
                return response.read()
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            last_error = exc
            if attempt < 3:
                time.sleep(2**attempt)
    raise RuntimeError(f"Unable to download {url}: {last_error}") from last_error


def parse_timestamp(value: str) -> int:
    raw = value.strip()
    formats = (
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%dT%H:%M:%S",
        "%m/%d/%Y %H:%M:%S",
        "%Y/%m/%d %H:%M:%S",
        "%Y-%m-%d %H:%M",
    )
    for fmt in formats:
        try:
            local = datetime.strptime(raw, fmt).replace(tzinfo=NY)
            return int(local.timestamp())
        except ValueError:
            pass
    try:
        local = datetime.fromisoformat(raw)
        if local.tzinfo is None:
            local = local.replace(tzinfo=NY)
        return int(local.timestamp())
    except ValueError as exc:
        raise ValueError(f"Unsupported FirstRate timestamp: {value!r}") from exc


def parse_csv_member(blob: bytes, member: str) -> list[dict]:
    with zipfile.ZipFile(io.BytesIO(blob)) as archive:
        with archive.open(member) as raw:
            text = io.TextIOWrapper(raw, encoding="utf-8-sig", errors="replace", newline="")
            reader = csv.reader(text)
            bars: dict[int, dict] = {}
            for row in reader:
                if len(row) < 6:
                    continue
                if row[0].strip().lower() in {"datetime", "timestamp", "date"}:
                    continue
                try:
                    timestamp = parse_timestamp(row[0])
                    open_price = float(row[1])
                    high = float(row[2])
                    low = float(row[3])
                    close = float(row[4])
                    volume = float(row[5])
                except (ValueError, TypeError):
                    continue
                if min(open_price, high, low, close) <= 0 or high < low:
                    continue
                if high < max(open_price, close) or low > min(open_price, close):
                    continue
                bars[timestamp] = {
                    "time": timestamp,
                    "open": open_price,
                    "high": high,
                    "low": low,
                    "close": close,
                    "volume": max(0.0, volume),
                }
    return [bars[key] for key in sorted(bars)]


def member_score(name: str, asset: str) -> int:
    lower = name.lower()
    if not lower.endswith((".csv", ".txt")):
        return -1000
    if any(token in lower for token in ("tick", "5min", "15min", "30min", "1hour", "1h", "daily")):
        return -500
    score = 0
    if "1min" in lower or "1_min" in lower or "1m" in lower:
        score += 50
    if asset.lower() in lower:
        score += 20
    if "continuous" in lower:
        score += 10
    if "unadjust" in lower:
        score += 20
    if CONTRACT_RE.search(name):
        score += 40
    return score


def choose_one_minute_member(blob: bytes, asset: str) -> tuple[str, list[dict]]:
    with zipfile.ZipFile(io.BytesIO(blob)) as archive:
        members = archive.namelist()
    candidates = sorted(members, key=lambda name: member_score(name, asset), reverse=True)
    diagnostics: list[str] = []
    for member in candidates:
        if member_score(member, asset) < 0:
            continue
        try:
            bars = parse_csv_member(blob, member)
        except (KeyError, zipfile.BadZipFile, ValueError) as exc:
            diagnostics.append(f"{member}: {exc}")
            continue
        if len(bars) >= 120:
            return member, bars
        diagnostics.append(f"{member}: only {len(bars)} valid bars")

    # Some sample archives use generic filenames. Fall back to probing any CSV/TXT.
    for member in members:
        if not member.lower().endswith((".csv", ".txt")):
            continue
        try:
            bars = parse_csv_member(blob, member)
        except (KeyError, zipfile.BadZipFile, ValueError):
            continue
        if len(bars) >= 120:
            return member, bars

    raise RuntimeError(
        f"No usable 1-minute file found for {asset}. Members={members}; diagnostics={diagnostics[:8]}"
    )


def trade_date_for_bar(timestamp: int) -> date | None:
    local = datetime.fromtimestamp(timestamp, NY)
    clock = local.time()
    if clock >= dt_time(18, 0):
        trade_date = local.date() + timedelta(days=1)
    elif clock < dt_time(17, 0):
        trade_date = local.date()
    else:
        return None
    if trade_date.weekday() >= 5:
        return None
    return trade_date


def infer_contract(asset: str, member: str) -> str:
    match = CONTRACT_RE.search(member)
    if match and match.group(0).upper().startswith(asset):
        return match.group(0).upper()
    return f"{asset}-CONTINUOUS-SAMPLE"


def session_stats(bars: list[dict]) -> dict:
    first = bars[0]["open"]
    last = bars[-1]["close"]
    high = max(x["high"] for x in bars)
    low = min(x["low"] for x in bars)
    range_pct = (high - low) / first if first else 0.0
    trend_pct = (last - first) / first if first else 0.0
    volume = sum(x["volume"] for x in bars)
    trend = (
        "trend-up"
        if trend_pct >= max(0.003, range_pct * 0.35)
        else "trend-down"
        if trend_pct <= -max(0.003, range_pct * 0.35)
        else "balanced"
    )
    return {
        "first": round(first, 6),
        "last": round(last, 6),
        "high": round(high, 6),
        "low": round(low, 6),
        "rangePct": round(range_pct, 6),
        "trendPct": round(trend_pct, 6),
        "volume": round(volume, 6),
        "tags": [trend],
    }


def build_candidates(asset: str, member: str, bars: list[dict]) -> list[dict]:
    grouped: dict[date, list[dict]] = defaultdict(list)
    for bar in bars:
        trade_date = trade_date_for_bar(bar["time"])
        if trade_date is not None:
            grouped[trade_date].append(bar)

    contract = infer_contract(asset, member)
    candidates = []
    for trade_date, session_bars in sorted(grouped.items()):
        session_bars = sorted(session_bars, key=lambda x: x["time"])
        if len(session_bars) < 120:
            continue
        candidates.append(
            {
                "id": f"{asset}-{trade_date.isoformat()}-{contract}",
                "asset": asset,
                "contract": contract,
                "tradeDate": trade_date.isoformat(),
                "timezone": "America/New_York",
                "source": "firstrate-free-sample",
                "sourceUrl": PRODUCT_URLS[asset],
                "recordCount": len(session_bars),
                "stats": session_stats(session_bars),
                "session": {
                    "kind": "CME-Globex",
                    "start": "18:00",
                    "end": "17:00",
                    "regularStart": "09:30",
                    "regularEnd": "16:00",
                },
                "bars1m": session_bars,
            }
        )
    return candidates


def resample(bars: list[dict], seconds: int) -> list[dict]:
    buckets: dict[int, list[dict]] = defaultdict(list)
    for bar in bars:
        bucket = bar["time"] - (bar["time"] % seconds)
        buckets[bucket].append(bar)
    result = []
    for bucket in sorted(buckets):
        group = sorted(buckets[bucket], key=lambda x: x["time"])
        result.append(
            {
                "time": bucket,
                "open": group[0]["open"],
                "high": max(x["high"] for x in group),
                "low": min(x["low"] for x in group),
                "close": group[-1]["close"],
                "volume": round(sum(x["volume"] for x in group), 6),
            }
        )
    return result


def write_session(session: dict, out_root: Path):
    bars = session.pop("bars1m")
    paths: dict[str, str] = {}
    for timeframe, seconds in TIMEFRAMES.items():
        tf_bars = bars if timeframe == "1m" else resample(bars, seconds)
        target = out_root / session["asset"] / session["contract"] / session["tradeDate"] / f"{timeframe}.json"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(json.dumps(tf_bars, separators=(",", ":")), encoding="utf-8")
        paths[timeframe] = (
            f"/data/local-historical/{session['asset']}/{session['contract']}/"
            f"{session['tradeDate']}/{timeframe}.json"
        )
    session["bars"] = paths
    session["barCount1m"] = len(bars)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-root", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--max-sessions", type=int, default=6)
    parser.add_argument("--mes-zip", type=Path)
    parser.add_argument("--mnq-zip", type=Path)
    args = parser.parse_args()

    out_root = args.output_root.resolve()
    if out_root == FORBIDDEN_PUBLIC_OUTPUT:
        raise RuntimeError(
            "FirstRate raw/sample data must not be written to public/data/historical. "
            "Use the default private-data/firstrate directory."
        )

    zip_overrides = {"MES": args.mes_zip, "MNQ": args.mnq_zip}
    selected: list[dict] = []
    member_names: dict[str, str] = {}

    for asset in ("MES", "MNQ"):
        override = zip_overrides[asset]
        if override:
            blob = override.read_bytes()
            print(f"READ {asset} sample from {override}")
        else:
            print(f"DOWNLOAD {asset} free sample")
            blob = download(SAMPLE_URLS[asset])

        member, bars = choose_one_minute_member(blob, asset)
        member_names[asset] = member
        candidates = build_candidates(asset, member, bars)
        picked = choose_curated(candidates, min(args.max_sessions, len(candidates)))
        print(
            f"{asset}: member={member!r} bars={len(bars)} "
            f"sessions={len(candidates)} selected={len(picked)}"
        )
        selected.extend(picked)

    if not selected:
        raise RuntimeError("FirstRate samples did not produce any usable CME sessions")

    for asset in ("MES", "MNQ"):
        target = out_root / asset
        if target.exists():
            shutil.rmtree(target)

    manifest_sessions = []
    for session in selected:
        write_session(session, out_root)
        manifest_sessions.append(
            {
                key: session[key]
                for key in (
                    "id",
                    "asset",
                    "contract",
                    "tradeDate",
                    "timezone",
                    "source",
                    "sourceUrl",
                    "recordCount",
                    "stats",
                    "curation",
                    "session",
                    "bars",
                    "barCount1m",
                )
            }
        )

    source = {
        "provider": "FirstRate Data",
        "feed": "free futures evaluation samples (1-minute OHLCV)",
        "endpoint": "public Download Sample links for MES and MNQ product pages",
        "notes": (
            "Local evaluation only. Raw FirstRate sample data is kept outside Git and "
            "served only by the Vite development server. Do not redistribute the raw files."
        ),
    }
    manifest = {
        "version": 2,
        "generatedAt": datetime.now(tz=NY).isoformat(),
        "source": source,
        "sources": [source],
        "coverage": summarize_coverage(manifest_sessions),
        "sampleMembers": member_names,
        "sessions": sorted(
            manifest_sessions,
            key=lambda s: (s["asset"], s["tradeDate"], s["contract"]),
        ),
    }
    out_root.mkdir(parents=True, exist_ok=True)
    (out_root / "manifest.json").write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"WROTE {out_root / 'manifest.json'} ({len(manifest_sessions)} private sample sessions)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
