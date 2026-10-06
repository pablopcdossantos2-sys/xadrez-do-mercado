# Xadrez do Mercado

*Leia isto em outros idiomas: [Português](README.md)*

---

> Chess puzzles, but for futures day traders.

Browser-based interactive web application for futures-market decision-making practice, focused on price-action reading and Long, Short, or Skip choices.

## Installation and running the project — step by step

This section is also intended for users who **do not usually work with terminals or GitHub repositories**.

### 1. Install the required software first

To run the project on your computer, you need **Node.js 20.19 or newer**. The `npm` package manager is installed together with Node.js.

After installing Node.js, open **Terminal**, **PowerShell**, or **Command Prompt** and run:

```bash
node --version
npm --version
```

If both commands display version numbers, the installation is ready.

> On Windows, you can open PowerShell by searching for **PowerShell** in the Start menu.

### 2. Get the project files

There are two ways to do this.

#### Option A — simplest: download a ZIP file

This option does not require Git.

1. Open the repository page on GitHub.
2. Click **Code**.
3. Choose **Download ZIP**.
4. When the download finishes, extract the ZIP file to a folder of your choice.
5. Open the extracted folder.

Example:

```text
C:\Users\YourName\Documents\xadrez-do-mercado
```

#### Option B — using Git

If Git is already installed, you can clone the repository:

```bash
git clone https://github.com/pablopcdossantos2-sys/xadrez-do-mercado.git
cd xadrez-do-mercado
```

If you have never used Git, **Option A (Download ZIP)** is completely sufficient.

### 3. Open a terminal inside the project folder

The terminal must be opened **in the same folder that contains `package.json`**.

On Windows, an easy method is:

1. open the project folder in File Explorer;
2. click the address bar that shows the folder path;
3. type `powershell`;
4. press **Enter**.

PowerShell will open directly in the correct folder.

### 4. Install the dependencies

Run:

```bash
npm install
```

This automatically downloads the libraries required by the project, including React, Vite, and Lightweight Charts.

You normally need to run this only the first time, or after the project's dependencies change.

### 5. Start the application in development mode

Run:

```bash
npm run dev
```

The terminal will display an address similar to:

```text
http://localhost:5173/
```

Open that address in your web browser.

> Keep the terminal window open while using the application this way. To stop the server, return to the terminal and press `Ctrl + C`.

### 6. Optional: load real historical MES and MNQ samples

The application works without this step and uses the synthetic fallback whenever required.

To download and prepare the free FirstRate Data samples for local use, run:

```bash
npm run historical:firstrate:sample
```

Then start the application normally:

```bash
npm run dev
```

These files are stored locally under `private-data/` and are not included in the production build.

### 7. Create the compiled production version

To generate the final application files, run:

```bash
npm run build
```

This command:

1. checks the TypeScript code;
2. compiles and optimizes the application with Vite;
3. creates the `dist/` folder containing the files ready to be published to a web server.

### 8. Preview the compiled version locally

After running `npm run build`, you can preview the production version with:

```bash
npm run preview
```

The terminal will display a local address. Open it in your browser just as you did in development mode.

### Quick summary for users who only want to run the project

After downloading and extracting the project, the essential commands are:

```bash
npm install
npm run dev
```

When you want to generate the final compiled version:

```bash
npm run build
```

## How it works

Synthetic puzzles use 82 history bars and 38 future bars. Real historical puzzles adapt the window to a single exchange session (1m: 82+38; 5m: 72+30; 15m: 26+12; CME MES/MNQ 1h: 12+6). In Standard mode, future bars can be replayed bar by bar with an adjustable bracket and Flatten. The result includes rule-based grading, ELO, R outcome, debrief, and counterfactuals.

Windows can come from real historical market data or the synthetic generator. **The product does not depend on real-time market data.**

## Training modes

- **Standard:** decision + adjustable bracket + manual/automatic replay.
- **Blind tape:** during the decision phase, context, playbook, indicators, volume, and explicit price/time labels are hidden; they return after the choice.
- **Speed run:** 10 decisions within a global 15-minute session, with no intermediate debrief; each round is evaluated automatically and the next one loads without manual replay.

## Features

- Replay of curated real historical windows and procedural synthetic generation.
- MES, MNQ, WINFUT, and WDOFUT across 1m, 5m, 15m, and 1h timeframes.
- Candles, volume, VWAP, EMA 20, DEMA, and session levels.
- Setup classifier covering Liquidity Sweep, VWAP Reclaim/Rejection, Opening Range Breakout, Failed Breakout/Breakdown, Trend Pullback, Range Fade, Momentum Push, and Consolidation.
- Rule-based analyst with a 12-point stop / 24-point target reference bracket.
- Counterfactual debrief, trap detection, justified Skip, and streak Freeze.
- ELO, accuracy, process score, streak, and breakdowns by setup, direction, timeframe, and instrument.
- Local journal with up to 200 decisions and JSON/CSV export.
- Bilingual EN/PT-BR interface, optional sound, and keyboard shortcuts.
- Adaptive difficulty, Only structure vs Full context mode, a visual session clock, and a revenge-trade warning.
- Hindsight-safe analyst validation, signal confidence, and accepted answers.
- RTH/ETH references, synthetic microstructure, and simulated macro events in replay.
- Dynamic Elo, deterministic daily challenge, pattern cards, and offline PWA support.

## Architecture

The project was migrated from a monolithic browser implementation to **Vite + React + TypeScript**. UI orchestration is in `src/App.tsx`; analytics in `src/analytics.ts`; data generation in `src/data.ts`; persistence in `src/storage.ts`; translations in `src/translations.ts`; state in `src/reducer.ts`; types in `src/types.ts`; the React entry point is in `src/main.tsx`; asset metadata is in `src/assets.ts`; and the real OHLCV parser is in `src/realData.ts`.

Interactive state is centralized in `useReducer`, replacing a collection of interdependent local state hooks.

## Verification

- `npm run typecheck` — TypeScript checking.
- `npm run build` — type checking and Vite production build.
- `npm run audit` — structural audit of the migration, modes, runtime, and translations.
- `npm run test` — pure-function tests.

## Scope and limitations

- Synthetic generation remains available as a fallback.
- WINFUT/WDOFUT use the real B3 library in 1m, 5m and 15m; 1h remains synthetic for those instruments.
- MES/MNQ can use FirstRate Data's free real-data samples during local development via `npm run historical:firstrate:sample`. Those files stay under `private-data/`, are not committed, and never enter production builds. Without the local library, the synthetic fallback remains active.
- Real-data integration is based on **historical datasets**, not real-time streaming.
- The foreign pipeline uses actual MES/MNQ contracts rather than ES/NQ proxies.
- Raw historical market files may have their own usage/redistribution terms; the project should keep application code and market files separate when necessary.
- WINFUT and WDOFUT use the B3 product codes WIN and WDO respectively.
- Analyst grading uses only information available up to the decision point. This does not validate a trading strategy or demonstrate predictive capability.
- The project is a training tool and does not place market orders.

## Documentation

- [Roadmap in Portuguese](docs/roadmap.pt-BR.md)
- [Roadmap in English](docs/roadmap.en.md)
- [Implementation notes](docs/roadmap-implementation.md)
- [Real historical data plan](docs/real-market-data-plan.en.md)
- [Puzzle creation tutorial — Portuguese](docs/tutorial-create-puzzles.pt-BR.md)
- [Puzzle creation tutorial — English](docs/tutorial-create-puzzles.md)

## Authorship and development

Xadrez do Mercado is an interactive web training application independently developed by Pablo Phillipe Cândido dos Santos for futures day-trading decision practice through price-action puzzles, replay of real historical sessions when available, and synthetic generation as a fallback, with counterfactual debriefing and local performance tracking.

Development used generative artificial intelligence tools as an auxiliary resource, while the author remained responsible for the project's conception, implementation, integration, and verification.

Currículo Lattes: [http://lattes.cnpq.br/9500873674712528](http://lattes.cnpq.br/9500873674712528)
