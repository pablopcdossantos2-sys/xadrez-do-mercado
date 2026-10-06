#!/usr/bin/env python3
"""
Build the first Xadrez do Mercado historical market library from B3's
derivatives tick-by-tick public distribution endpoint.

The generated library keeps only filtered futures trades for WIN/WDO,
aggregates them to 1m, and derives 5m/15m/1h. Raw B3 ZIP files are not
committed to the repository.
"""

from __future__ import annotations

import argparse
import csv
import io
import http.client
import time
import json
import re
import sys
import urllib.error
import urllib.request
import zipfile
from collections import defaultdict
from datetime import date, datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

from historical_curation import choose_curated, summarize_coverage

ROOT = Path(__file__).resolve().parents[1]
OUT_ROOT = ROOT / "public" / "data" / "historical"
MANIFEST = OUT_ROOT / "manifest.json"
B3_URL = "https://drp.b3.com.br/rapinegocios/tickercsv/{date}?type=1"
BRT = ZoneInfo("America/Sao_Paulo")
ASSETS = {"WINFUT": "WIN", "WDOFUT": "WDO"}
TIMEFRAMES = {"1m": 60, "5m": 300, "15m": 900, "1h": 3600}
CONTRACT_RE = re.compile(r"^(WIN|WDO)[A-Z]\d{2}$")
RAW_COLUMNS = (
    "DataReferencia",
    "CodigoInstrumento",
    "AcaoAtualizacao",
    "PrecoNegocio",
    "QuantidadeNegociada",
    "HoraFechamento",
    "CodigoIdentificadorNegocio",
    "TipoSessaoPregao",
    "DataNegocio",
    "CodigoParticipanteComprador",
    "CodigoParticipanteVendedor",
    "TipoDoCanal",
)


def parse_date(value: str) -> date:
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%Y%m%d", "%d-%m-%Y"):
        try:
            return datetime.strptime(value.strip(), fmt).date()
        except ValueError:
            pass
    raise ValueError(f"Invalid trading date: {value}")


def iter_dates(start: date, end: date):
    current = start
    while current <= end:
        yield current
        current += timedelta(days=1)


def fetch_zip(trade_date: date) -> bytes | None:
    url = B3_URL.format(date=trade_date.isoformat())
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Xadrez-do-Mercado historical-library bootstrap/1.0",
            "Accept": "application/zip,application/octet-stream,*/*",
        },
    )
    last_error: Exception | None = None
    for attempt in range(4):
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                return response.read()
        except urllib.error.HTTPError as exc:
            if exc.code == 404:
                return None
            last_error = exc
        except (urllib.error.URLError, http.client.IncompleteRead, ConnectionResetError, TimeoutError, OSError) as exc:
            last_error = exc
        if attempt < 3:
            delay = 2 ** attempt
            print(f"  RETRY {trade_date} after download interruption ({type(last_error).__name__}); waiting {delay}s")
            time.sleep(delay)
    raise RuntimeError(f"B3 request failed after retries for {trade_date}: {last_error}") from last_error


def parse_price(value: str) -> float:
    raw = value.strip()
    normalized = raw.replace(".", "").replace(",", ".") if "," in raw else raw
    return float(normalized)


def parse_time(raw: str) -> tuple[int, int, int, int]:
    digits = str(raw).strip().zfill(9)
    return (
        int(digits[0:2]),
        int(digits[2:4]),
        int(digits[4:6]),
        int(digits[6:9]),
    )


def parse_trade_datetime(trade_date: date, raw_time: str) -> int:
    hour, minute, second, millis = parse_time(raw_time)
    dt = datetime(
        trade_date.year,
        trade_date.month,
        trade_date.day,
        hour,
        minute,
        second,
        millis * 1000,
        tzinfo=BRT,
    )
    return int(dt.timestamp())


def read_derivative_rows(blob: bytes, trade_date: date):
    with zipfile.ZipFile(io.BytesIO(blob)) as archive:
        txts = [
            name
            for name in archive.namelist()
            if name.upper().endswith("_NEGOCIOSAVISTA_DRV.TXT")
        ]
        if not txts:
            raise ValueError(
                f"No derivative TXT found for {trade_date}; files={archive.namelist()}"
            )
        with archive.open(txts[0]) as raw:
            content = io.TextIOWrapper(raw, encoding="latin1", newline="")
            reader = csv.reader(content, delimiter=";")
            next(reader, None)
            for row in reader:
                if len(row) < len(RAW_COLUMNS):
                    continue
                yield dict(zip(RAW_COLUMNS, row))


def is_asset_contract(symbol: str, product: str) -> bool:
    return bool(CONTRACT_RE.fullmatch(symbol.strip())) and symbol.strip().startswith(product)


def aggregate_minute(rows: list[tuple[int, float, float]]) -> list[dict]:
    buckets: dict[int, list[tuple[int, float, float]]] = defaultdict(list)
    for timestamp, price, quantity in rows:
        bucket = timestamp - (timestamp % 60)
        buckets[bucket].append((timestamp, price, quantity))

    bars = []
    for bucket in sorted(buckets):
        trades = sorted(buckets[bucket], key=lambda x: x[0])
        prices = [x[1] for x in trades]
        bars.append(
            {
                "time": bucket,
                "open": round(prices[0], 6),
                "high": round(max(prices), 6),
                "low": round(min(prices), 6),
                "close": round(prices[-1], 6),
                "volume": round(sum(max(0.0, x[2]) for x in trades), 6),
            }
        )
    return bars


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
    if not bars:
        return {}
    first = bars[0]["open"]
    last = bars[-1]["close"]
    high = max(x["high"] for x in bars)
    low = min(x["low"] for x in bars)
    range_pct = (high - low) / first if first else 0.0
    trend_pct = (last - first) / first if first else 0.0
    volume = sum(x["volume"] for x in bars)
    if abs(trend_pct) >= max(0.003, range_pct * 0.35):
        trend_tag = "trend-up" if trend_pct > 0 else "trend-down"
    else:
        trend_tag = "balanced"
    return {
        "first": first,
        "last": last,
        "high": high,
        "low": low,
        "rangePct": round(range_pct, 6),
        "trendPct": round(trend_pct, 6),
        "volume": round(volume, 6),
        "tags": [trend_tag],
    }



def build_day(trade_date: date, raw_rows) -> list[dict]:
    grouped: dict[str, list[tuple[int, float, float]]] = defaultdict(list)
    quantities: dict[str, float] = defaultdict(float)

    for row in raw_rows:
        symbol = row["CodigoInstrumento"].strip().upper()
        if not symbol or not CONTRACT_RE.fullmatch(symbol):
            continue
        if not any(symbol.startswith(code) for code in ASSETS.values()):
            continue
        try:
            timestamp = parse_trade_datetime(trade_date, row["HoraFechamento"])
            price = parse_price(row["PrecoNegocio"])
            quantity = float(row["QuantidadeNegociada"].strip() or 0)
        except (ValueError, TypeError):
            continue
        quantities[symbol] += max(0.0, quantity)
        grouped[symbol].append((timestamp, price, quantity))

    dominant: dict[str, str] = {}
    for asset, code in ASSETS.items():
        choices = [s for s in quantities if s.startswith(code)]
        if choices:
            dominant[asset] = max(choices, key=lambda s: quantities[s])

    results = []
    for asset, contract in dominant.items():
        bars = aggregate_minute(grouped[contract])
        if len(bars) < 120:
            continue
        stats = session_stats(bars)
        results.append(
            {
                "id": f"{asset}-{trade_date.isoformat()}-{contract}",
                "asset": asset,
                "contract": contract,
                "tradeDate": trade_date.isoformat(),
                "timezone": "America/Sao_Paulo",
                "source": "b3-derivatives-tick-by-tick",
                "sourceUrl": B3_URL.format(date=trade_date.isoformat()),
                "tickCount": len(grouped[contract]),
                "stats": stats,
                "session": {"kind": "B3", "start": "09:00", "end": "18:00", "regularStart": "09:00", "regularEnd": "18:00"},
                "bars1m": bars,
            }
        )
    return results


def write_session(session: dict):
    base = OUT_ROOT / session["asset"] / session["contract"] / session["tradeDate"]
    base.mkdir(parents=True, exist_ok=True)
    bars = session.pop("bars1m")
    paths = {}
    for tf, seconds in TIMEFRAMES.items():
        tf_bars = bars if tf == "1m" else resample(bars, seconds)
        rel = Path("data") / "historical" / session["asset"] / session["contract"] / session["tradeDate"] / f"{tf}.json"
        target = OUT_ROOT / session["asset"] / session["contract"] / session["tradeDate"] / f"{tf}.json"
        target.write_text(json.dumps(tf_bars, separators=(",", ":"), ensure_ascii=False), encoding="utf-8")
        paths[tf] = "/" + rel.as_posix()
    session["bars"] = paths
    session["barCount1m"] = len(bars)



def load_existing_b3_candidates(existing_manifest: dict) -> list[dict]:
    candidates: list[dict] = []
    for session in existing_manifest.get("sessions", []):
        asset = session.get("asset")
        if asset not in ASSETS:
            continue
        contract = str(session.get("contract", ""))
        trade_date = str(session.get("tradeDate", ""))
        one_minute = OUT_ROOT / asset / contract / trade_date / "1m.json"
        if not one_minute.exists():
            continue
        try:
            bars = json.loads(one_minute.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            continue
        if not isinstance(bars, list) or len(bars) < 120:
            continue
        candidates.append(
            {
                "id": session.get("id", f"{asset}-{trade_date}-{contract}"),
                "asset": asset,
                "contract": contract,
                "tradeDate": trade_date,
                "timezone": session.get("timezone", "America/Sao_Paulo"),
                "source": session.get("source", "b3-derivatives-tick-by-tick"),
                "sourceUrl": session.get("sourceUrl", B3_URL.format(date=trade_date)),
                "tickCount": int(session.get("tickCount", 0)),
                "stats": session_stats(bars),
                "session": session.get(
                    "session",
                    {"kind": "B3", "start": "09:00", "end": "18:00", "regularStart": "09:00", "regularEnd": "18:00"},
                ),
                "bars1m": bars,
            }
        )
    return candidates


def reached_candidate_target(candidates: list[dict], target: int) -> bool:
    return all(sum(1 for c in candidates if c["asset"] == asset) >= target for asset in ASSETS)



def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--start-date", default="2026-09-16")
    parser.add_argument("--end-date", default="2026-10-02")
    parser.add_argument("--max-sessions", type=int, default=8)
    parser.add_argument("--candidate-sessions", type=int, default=9)
    args = parser.parse_args()

    start = parse_date(args.start_date)
    end = parse_date(args.end_date)

    existing_manifest = {}
    if MANIFEST.exists():
        try:
            existing_manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            existing_manifest = {}

    candidates = load_existing_b3_candidates(existing_manifest)
    known_ids = {c["id"] for c in candidates}
    existing_dates = {
        (c["asset"], c["tradeDate"])
        for c in candidates
    }
    print(
        "REUSE "
        + ", ".join(
            f"{asset}={sum(1 for c in candidates if c['asset'] == asset)}"
            for asset in ASSETS
        )
        + " existing sessions"
    )

    if not reached_candidate_target(candidates, args.candidate_sessions):
        for trade_date in iter_dates(start, end):
            trade_date_iso = trade_date.isoformat()
            if all((asset, trade_date_iso) in existing_dates for asset in ASSETS):
                print(f"REUSE {trade_date} (already in library)")
                continue
            blob = fetch_zip(trade_date)
            if blob is None:
                print(f"SKIP {trade_date} (no B3 derivative tick file)")
                continue
            print(f"FETCH {trade_date} ({len(blob) / 1_000_000:.1f} MB)")
            try:
                day_candidates = build_day(trade_date, read_derivative_rows(blob, trade_date))
                added = 0
                for candidate in day_candidates:
                    if candidate["id"] in known_ids:
                        continue
                    candidates.append(candidate)
                    known_ids.add(candidate["id"])
                    existing_dates.add((candidate["asset"], candidate["tradeDate"]))
                    added += 1
                print(f"  candidate-assets={len(day_candidates)} added={added}")
                if reached_candidate_target(candidates, args.candidate_sessions):
                    print("ENOUGH: reached the requested incremental candidate pool for all assets")
                    break
            except (ValueError, zipfile.BadZipFile) as exc:
                print(f"  FAIL {trade_date}: {exc}", file=sys.stderr)

    by_asset: dict[str, list[dict]] = defaultdict(list)
    for candidate in candidates:
        by_asset[candidate["asset"]].append(candidate)

    selected: list[dict] = []
    for asset in ASSETS:
        picked = choose_curated(by_asset[asset], args.max_sessions)
        print(f"{asset}: selected {len(picked)} sessions")
        selected.extend(picked)

    if not selected:
        raise RuntimeError("No historical WINFUT/WDOFUT sessions were produced.")

    preserved_sessions = [
        s for s in existing_manifest.get("sessions", [])
        if s.get("asset") not in ASSETS
    ]

    for asset in ASSETS:
        asset_root = OUT_ROOT / asset
        if asset_root.exists():
            for old in asset_root.glob("*/*/*.json"):
                old.unlink()

    manifest_sessions = []
    for session in selected:
        write_session(session)
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
                    "tickCount",
                    "stats",
                    "curation",
                    "session",
                    "bars",
                    "barCount1m",
                )
            }
        )

    OUT_ROOT.mkdir(parents=True, exist_ok=True)
    b3_source = {
        "provider": "B3",
        "feed": "derivatives tick-by-tick",
        "endpoint": B3_URL,
        "notes": "Raw ZIPs are processed and discarded; only compact OHLCV exercise data is retained.",
    }
    sources = [b3_source]
    for source in existing_manifest.get("sources", []):
        if source.get("provider") != "B3":
            sources.append(source)
    all_sessions = sorted(
        [*preserved_sessions, *manifest_sessions],
        key=lambda s: (s.get("asset", ""), s.get("tradeDate", ""), s.get("contract", "")),
    )
    MANIFEST.write_text(
        json.dumps(
            {
                "version": 2,
                "generatedAt": datetime.now(tz=BRT).isoformat(),
                "source": b3_source,
                "sources": sources,
                "coverage": summarize_coverage(all_sessions),
                "sessions": all_sessions,
            },
            indent=2,
            ensure_ascii=False,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"WROTE {MANIFEST} ({len(manifest_sessions)} B3 sessions; {len(preserved_sessions)} preserved foreign sessions)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
