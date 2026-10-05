# Xadrez do Mercado — Real historical data plan

The goal of this phase is to progressively replace synthetic OHLCV with **real historical trading sessions**, with no dependency on real-time market data.

For training, it does not matter whether a session happened yesterday, six months ago, or five years ago. What matters is that the price, volume, and timestamp sequence is real and can be replayed as an exercise.

## Architectural decision

We will not use a real-time market feed, websocket, continuous polling, or Market Data key in the browser.

The architecture becomes:

1. obtain real historical data;
2. select trading sessions and pedagogical windows;
3. normalize contracts and timestamps;
4. convert trades/ticks into OHLCV;
5. store historical datasets in authorized/static storage;
6. load one real window per puzzle;
7. keep the synthetic generator as a fallback.

The application remains a static, offline-friendly frontend.

## Priority source — B3

B3 publishes a **Tick by tick / Negócio a negócio** table for derivatives in the Daily Market Bulletin. The trading-session search page explicitly says that a previous date can be selected to retrieve retroactive files.

This is particularly useful because individual trades let us reconstruct real intraday candles and preserve the behavior of a real session instead of relying only on closing prices.

References:
- https://www.b3.com.br/en_us/market-data-and-indices/data-services/market-data/historical-data/newsletters/search-by-trading-session/
- https://arquivos.b3.com.br/bdi/

## Phase 1 — Asset and parser foundation ✅

Completed.

- Assets: MES, MNQ, WINFUT, and WDOFUT.
- Brazilian B3 product codes: WIN and WDO.
- Per-asset metadata in `src/assets.ts`.
- Real OHLCV CSV/JSON parser in `src/realData.ts`.
- History/future puzzle split.
- Synthetic generator retained as a fallback.

## Phase 2 — Acquire real historical sessions

Immediate priority.

Start with Brazilian instruments:

- WINFUT;
- WDOFUT;
- BIT.

The first collection for each market family does not need to cover entire years. A small but diverse collection is enough to validate the experience:

- trends;
- breakouts and failures;
- opening gaps;
- reversals;
- consolidation;
- high-volatility sessions;
- low-volatility sessions;
- sessions around relevant macro events.

These sessions are treated as **real exercise sources**, not as a generic financial-history viewer.

## Phase 3 — Historical data pipeline

The pipeline should:

1. import the raw file;
2. identify contract/ticker;
3. normalize date/time to Unix timestamp;
4. normalize price and quantity;
5. sort and deduplicate trades;
6. aggregate trades into 1-minute candles;
7. derive 5m, 15m, and 1h from 1m;
8. preserve real volume;
9. identify sessions and gaps;
10. split each exercise into history + future without leakage.

Rule: **no data after the decision point may participate in the analyst recommendation**.

## Phase 4 — Contract continuity

WINFUT and WDOFUT trade specific expiring contracts. Therefore, datasets should not simply concatenate different contract codes as though they were a single instrument.

The historical layer should retain:

- contract;
- underlying family;
- expiration;
- first/last timestamp;
- source;
- timezone;
- base timeframe.

A continuous series should only be created when the rollover rule is explicit.

## Phase 5 — Historical exercise library

After normalization, each window can receive pedagogical metadata:

- dominant setup;
- volatility regime;
- session period;
- opening gap;
- event presence;
- difficulty;
- data quality;
- instrument and contract;
- real trading-session date.

The user does not need to know the date during the decision. The date can be revealed only in the result/debrief to preserve the puzzle experience.

## Phase 6 — Real microstructure

Because trade-by-trade data is much richer than OHLCV, we can later calculate:

- directional volume when inferable;
- delta;
- trade concentration;
- volume acceleration;
- estimated aggression;
- pre/post-breakout behavior.

These features come **after** the OHLCV layer is stable.

## Storage and licensing

Raw data can be large and should not automatically become part of the browser bundle.

The first implementation should separate:

- application code;
- dataset manifest/metadata;
- authorized historical files.

When usage terms allow redistribution, datasets can be versioned in the project or static storage. When they do not, the application should remain capable of working with locally supplied/imported files.

Historical and public does not automatically mean unrestricted redistribution; applicable terms still need to be checked.

## Phase 7 — Puzzle curation

With real data available, the puzzle engine has two paths:

### Real historical

Select a window from a real trading session and replay the observed sequence.

### Synthetic

Generate a procedural sequence for rare cases, tests, and controlled training.

The user experience remains the same. Only the data source differs.

## Phase 8 — Foreign futures

The next front is building a real historical library for **MES and MNQ** from an authorized source, using the same dataset contract already used for the Brazilian library. The foreign library should preserve regular-session timestamps, contract identity, volume, and rollover rules without mixing expiries.

At this time, MES and MNQ remain on the synthetic generator and are not part of the published real historical library.

## Completion criteria

The historical migration is complete when there is:

- at least one working real historical dataset for WINFUT;
- at least one for WDOFUT;
- 1m, 5m, and 15m support;
- real volume;
- contract/session metadata;
- window selection without future leakage;
- synthetic fallback preserved;
- replay indistinguishable at the UI level between a real and synthetic window.

**This architecture has no real-time data requirement.**
