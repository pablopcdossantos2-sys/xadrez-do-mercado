# Xadrez do Mercado — Real Market Data Plan

This phase migrates exercises from synthetic OHLCV to real market data incrementally, without putting Market Data credentials in the frontend.

## Why not connect a real feed directly now?

B3 states that direct real-time Market Data access requires contracting, while indirect access is obtained through authorized distributors. Its policies also distinguish internal use from external distribution and display/non-display use.

Therefore the browser should receive only data that the backend/provider is licensed to expose to the end user. Provider credentials must never be embedded in the public Vite bundle.

## Stage 1 — Asset and format foundation ✅

Completed in this version.

- Assets: MES, MNQ, WINFUT, WDOFUT, and BIT.
- Per-asset metadata in `src/assets.ts`.
- B3 product codes for the Brazilian futures: WIN, WDO, and BIT.
- Real OHLCV CSV/JSON parser in `src/realData.ts`.
- History/future splitting preserves the current 82-bar puzzle model.
- Synthetic generation remains the development fallback.

## Stage 2 — Licensed historical dataset

Recommended next step.

1. Select a distributor/license compatible with Xadrez do Mercado's intended data use.
2. Obtain enough intraday history for 1m, 5m, and 15m exercises.
3. Normalize contracts by expiration before building continuous series.
4. Store authorized snapshots/files in backend storage.
5. Build each puzzle so the analyst answer only uses data before the decision point.

## Stage 3 — Real feed at runtime

Add a small backend/proxy:

`GET /api/market-data/{asset}/{timeframe}?date=YYYY-MM-DD`

The backend owns authentication, rate limiting, caching, and provider-specific translation into the app's OHLCV format.

The frontend can already consume `loadRealDataset()`; no API key needs to be exposed in public JavaScript.

## Stage 4 — Professional replay

Once enough real data exists:

- derive RTH/ETH sessions from dataset timestamps;
- preserve real gaps;
- use real volume;
- add contract rollover/continuation handling;
- show date, expiry, and dataset source;
- reject windows damaged by low liquidity, holidays, or feed gaps.

## Stage 5 — Real microstructure

Only after OHLCV is stable.

Add trade/market-by-trade data and, when licensing permits, real book/imbalance data. Keep the current synthetic microstructure as a fallback mode.

## Stage 6 — Exercise curation

The puzzle layer should select real windows by teaching pattern:

- breakouts and failures;
- VWAP reclaim/rejection;
- volatility expansion;
- openings/gaps;
- reversals;
- trends;
- consolidations.

The analyst must continue to use only data available before the decision point.

## Migration completion criteria

The real-data mode is complete when there is at least one authorized historical dataset for each Brazilian asset (WINFUT, WDOFUT, and BIT), stable intraday replay, contract/session metadata, and automated tests proving no future leakage.

The goal is to replace the data source without dismantling the existing training logic.
