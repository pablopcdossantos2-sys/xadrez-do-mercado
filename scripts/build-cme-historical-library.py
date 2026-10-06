#!/usr/bin/env python3
"""Build authorized MES/MNQ historical sessions from CME Globex via Databento.

The script requests real 1-minute OHLCV for the volume-ranked front contract,
resolves Databento instrument IDs back to the actual CME raw contract symbol,
derives 5m/15m/1h locally, and merges the curated sessions into the same
historical manifest used by B3 data.

By default output is written outside the public web bundle. Publishing CME data
under public/data/historical requires an explicit acknowledgement that the
operator has the necessary redistribution rights.
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import re
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
from datetime import date, datetime, time, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

from historical_curation import choose_curated, summarize_coverage

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_PRIVATE_ROOT = ROOT / "private-data" / "historical"
PUBLIC_ROOT = ROOT / "public" / "data" / "historical"
DATABENTO_ROOT = "https://hist.databento.com/v0"
DATASET = "GLBX.MDP3"
NY = ZoneInfo("America/New_York")
ASSETS = {"MES": "MES.v.0", "MNQ": "MNQ.v.0"}
TIMEFRAMES = {"1m": 60, "5m": 300, "15m": 900, "1h": 3600}
CONTRACT_RE = re.compile(r"^(MES|MNQ)[FGHJKMNQUVXZ]\d{1,2}$")


def parse_date(value: str) -> date:
    return datetime.strptime(value, "%Y-%m-%d").date()


def iter_weekdays(start: date, end: date):
    current = start
    while current <= end:
        if current.weekday() < 5:
            yield current
        current += timedelta(days=1)


def _auth_header(api_key: str) -> str:
    token = base64.b64encode(f"{api_key}:".encode()).decode()
    return f"Basic {token}"


def post_form(path: str, fields: dict[str, str], api_key: str) -> bytes:
    request = urllib.request.Request(
        DATABENTO_ROOT + path,
        data=urllib.parse.urlencode(fields).encode(),
        headers={
            "Authorization": _auth_header(api_key),
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "xadrez-do-mercado historical-curation/2.0",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            return response.read()
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Databento request failed ({exc.code}) {path}: {body[:500]}") from exc


def parse_event_time(value: str) -> int:
    return int(datetime.fromisoformat(value.replace("Z", "+00:00")).timestamp())


def session_bounds(trade_date: date) -> tuple[datetime, datetime]:
    start_local = datetime.combine(trade_date - timedelta(days=1), time(18, 0), tzinfo=NY)
    end_local = datetime.combine(trade_date, time(17, 0), tzinfo=NY)
    return start_local.astimezone(timezone.utc), end_local.astimezone(timezone.utc)


def resolve_raw_contract(instrument_id: int, trade_date: date, api_key: str) -> str:
    payload = post_form(
        "/symbology.resolve",
        {
            "dataset": DATASET,
            "symbols": str(instrument_id),
            "stype_in": "instrument_id",
            "stype_out": "raw_symbol",
            "start_date": trade_date.isoformat(),
            "end_date": (trade_date + timedelta(days=1)).isoformat(),
        },
        api_key,
    )
    result = json.loads(payload)
    mappings = result.get("result", {}).get(str(instrument_id), [])
    if not mappings:
        raise RuntimeError(f"Unable to resolve Databento instrument {instrument_id} on {trade_date}")
    contract = str(mappings[0].get("s", "")).strip().upper()
    if not CONTRACT_RE.fullmatch(contract):
        raise RuntimeError(f"Resolved symbol is not an MES/MNQ outright contract: {contract!r}")
    return contract


def request_session(asset: str, trade_date: date, api_key: str) -> dict | None:
    start_utc, end_utc = session_bounds(trade_date)
    raw = post_form(
        "/timeseries.get_range",
        {
            "dataset": DATASET,
            "symbols": ASSETS[asset],
            "stype_in": "continuous",
            "schema": "ohlcv-1m",
            "start": start_utc.isoformat(),
            "end": end_utc.isoformat(),
            "encoding": "json",
            "pretty_px": "true",
            "pretty_ts": "true",
            "map_symbols": "true",
        },
        api_key,
    )

    grouped: dict[int, list[dict]] = defaultdict(list)
    for line in raw.decode("utf-8").splitlines():
        if not line.strip():
            continue
        row = json.loads(line)
        header = row.get("hd") or {}
        instrument_id = row.get("instrument_id", header.get("instrument_id"))
        event_time = row.get("ts_event", header.get("ts_event"))
        if instrument_id is None or not event_time:
            continue
        try:
            bar = {
                "time": parse_event_time(str(event_time)),
                "open": float(row["open"]),
                "high": float(row["high"]),
                "low": float(row["low"]),
                "close": float(row["close"]),
                "volume": float(row["volume"]),
            }
        except (KeyError, TypeError, ValueError):
            continue
        grouped[int(instrument_id)].append(bar)

    if not grouped:
        return None

    dominant_id, bars = max(
        grouped.items(),
        key=lambda item: sum(max(0.0, float(x["volume"])) for x in item[1]),
    )
    bars = sorted(bars, key=lambda x: x["time"])
    if len(bars) < 120:
        return None

    contract = resolve_raw_contract(dominant_id, trade_date, api_key)
    if not contract.startswith(asset):
        raise RuntimeError(f"Continuous {asset} resolved to unexpected contract {contract}")

    stats = session_stats(bars)
    return {
        "id": f"{asset}-{trade_date.isoformat()}-{contract}",
        "asset": asset,
        "contract": contract,
        "tradeDate": trade_date.isoformat(),
        "timezone": "America/New_York",
        "source": "databento-cme-globex-ohlcv-1m",
        "sourceUrl": DATABENTO_ROOT + "/timeseries.get_range",
        "recordCount": len(bars),
        "stats": stats,
        "session": {
            "kind": "CME-Globex",
            "start": "18:00",
            "end": "17:00",
            "regularStart": "09:30",
            "regularEnd": "16:00",
        },
        "bars1m": bars,
    }


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


def write_session(session: dict, out_root: Path):
    bars = session.pop("bars1m")
    paths = {}
    for timeframe, seconds in TIMEFRAMES.items():
        tf_bars = bars if timeframe == "1m" else resample(bars, seconds)
        target = out_root / session["asset"] / session["contract"] / session["tradeDate"] / f"{timeframe}.json"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(json.dumps(tf_bars, separators=(",", ":")), encoding="utf-8")
        paths[timeframe] = "/" + (
            Path("data") / "historical" / session["asset"] / session["contract"] / session["tradeDate"] / f"{timeframe}.json"
        ).as_posix()
    session["bars"] = paths
    session["barCount1m"] = len(bars)


def load_existing_manifest(out_root: Path) -> dict:
    manifest = out_root / "manifest.json"
    if not manifest.exists():
        return {}
    try:
        return json.loads(manifest.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return {}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--start-date", default="2026-09-01")
    parser.add_argument("--end-date", default="2026-10-02")
    parser.add_argument("--max-sessions", type=int, default=8)
    parser.add_argument("--candidate-sessions", type=int, default=16)
    parser.add_argument("--output-root", type=Path, default=DEFAULT_PRIVATE_ROOT)
    parser.add_argument("--acknowledge-redistribution-rights", action="store_true")
    args = parser.parse_args()

    api_key = os.environ.get("DATABENTO_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("DATABENTO_API_KEY is required for real CME historical data")

    out_root = args.output_root.resolve()
    public_root = PUBLIC_ROOT.resolve()
    if out_root == public_root and not args.acknowledge_redistribution_rights:
        raise RuntimeError(
            "Refusing to write CME data into the public web bundle without "
            "--acknowledge-redistribution-rights"
        )

    start = parse_date(args.start_date)
    end = parse_date(args.end_date)
    by_asset: dict[str, list[dict]] = defaultdict(list)

    for trade_date in iter_weekdays(start, end):
        for asset in ASSETS:
            if len(by_asset[asset]) >= args.candidate_sessions:
                continue
            session = request_session(asset, trade_date, api_key)
            if session:
                by_asset[asset].append(session)
                print(f"FETCH {asset} {trade_date} {session['contract']} bars={session['recordCount']}")
        if all(len(by_asset[asset]) >= args.candidate_sessions for asset in ASSETS):
            break

    selected: list[dict] = []
    for asset in ASSETS:
        picked = choose_curated(by_asset[asset], args.max_sessions)
        print(f"{asset}: selected {len(picked)} of {len(by_asset[asset])} candidate sessions")
        selected.extend(picked)

    if not selected:
        raise RuntimeError("No historical MES/MNQ sessions were produced")

    existing = load_existing_manifest(out_root)
    preserved = [s for s in existing.get("sessions", []) if s.get("asset") not in ASSETS]
    for asset in ASSETS:
        asset_root = out_root / asset
        if asset_root.exists():
            for old in asset_root.glob("*/*/*.json"):
                old.unlink()

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

    databento_source = {
        "provider": "Databento / CME Group",
        "feed": "CME Globex MDP 3.0 OHLCV-1m",
        "endpoint": DATABENTO_ROOT + "/timeseries.get_range",
        "notes": "Actual MES/MNQ contracts resolved from volume-ranked continuous symbology; redistribution depends on CME entitlements.",
    }
    sources = [
        source
        for source in existing.get("sources", [])
        if source.get("provider") != databento_source["provider"]
    ]
    if existing.get("source") and not sources:
        sources.append(existing["source"])
    sources.append(databento_source)

    all_sessions = sorted(
        [*preserved, *manifest_sessions],
        key=lambda s: (s.get("asset", ""), s.get("tradeDate", ""), s.get("contract", "")),
    )
    out_root.mkdir(parents=True, exist_ok=True)
    manifest = {
        "version": 2,
        "generatedAt": datetime.now(tz=timezone.utc).isoformat(),
        "source": existing.get("source", databento_source),
        "sources": sources,
        "coverage": summarize_coverage(all_sessions),
        "sessions": all_sessions,
    }
    (out_root / "manifest.json").write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"WROTE {out_root / 'manifest.json'} ({len(manifest_sessions)} CME sessions)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
