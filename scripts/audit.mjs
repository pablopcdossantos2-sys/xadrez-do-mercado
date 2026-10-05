import { access, readFile } from 'node:fs/promises';

const expected=[
  'index.html','package.json','vite.config.ts','tsconfig.json','tsconfig.app.json',
  'src/main.tsx','src/App.tsx','src/TapeChart.tsx','src/types.ts','src/data.ts','src/difficulty.ts','src/analytics.ts','src/reducer.ts','src/rating.ts','src/cards.ts','src/assets.ts','src/realData.ts',
  'src/storage.ts','src/translations.ts','src/styles.css','tests/pure.test.ts','public/sw.js','public/manifest.webmanifest','public/icon.svg','docs/real-market-data-plan.pt-BR.md','docs/real-market-data-plan.en.md'
];
for(const f of expected)await access(f);

const index=await readFile('index.html','utf8');
const app=await readFile('src/App.tsx','utf8');
const reducer=await readFile('src/reducer.ts','utf8');
const translations=await readFile('src/translations.ts','utf8');
const readme=await readFile('README.md','utf8');
const readmeEn=await readFile('README-en.md','utf8');
const roadmap=await readFile('docs/roadmap-implementation.md','utf8');
const pkg=JSON.parse(await readFile('package.json','utf8'));

const checks=[
 ['Vite module entry', index.includes('/src/main.tsx')],
 ['No CDN runtime', !/unpkg\.com|cdn\.tailwindcss\.com|babel\.standalone/i.test(index)],
 ['React entry', await readFile('src/main.tsx','utf8').then(x=>x.includes('createRoot'))],
 ['useReducer only', app.includes('useReducer') && !app.includes('useState')],
 ['Blind tape implemented', app.includes("mode==='blind'") && translations.includes("blindHint")],
 ['Adaptive difficulty implemented', app.includes('getAdaptiveDifficulty') && app.includes('difficulty-badge')],
 ['Structure-only context mode', app.includes('SET_CONTEXT_MODE') && app.includes("contextMode==='structure'") && translations.includes('onlyStructure')],
 ['Visual session clock', app.includes('sessionClock') && app.includes('fmtSessionTime') && translations.includes('sessionClockHint')],
 ['Revenge trade warning', app.includes('revengeWarning') && app.includes('hasRecentLoss') && translations.includes('revengeWarningTitle')],
 ['Reverse replay implemented', app.includes('REVERSE_REPLAY') && app.includes("onReverse('LONG')") && app.includes("onReverse('SHORT')") && app.includes("onReverse('SKIP')") && app.includes('reverseNotCounted')],
 ['Hindsight-safe analyst validation', app.includes('signalConfidence') && app.includes('acceptedDecisions') && !/const decision=sorted\[0\]/.test(await readFile('src/analytics.ts','utf8'))],
 ['Generator realism model', await readFile('src/data.ts','utf8').then(x=>x.includes('sessionProfile')&&x.includes('volCluster')&&x.includes('eventIndex')&&x.includes('gap='))],
 ['RTH/ETH levels', await readFile('src/analytics.ts','utf8').then(x=>x.includes('computeSessionLevels')) && await readFile('src/TapeChart.tsx','utf8').then(x=>x.includes('RTH H')&&x.includes('ETH H'))],
 ['Synthetic tape microstructure', await readFile('src/analytics.ts','utf8').then(x=>x.includes('computeMicrostructure')) && app.includes('micro-box')],
 ['Macro events mid-puzzle', await readFile('src/data.ts','utf8').then(x=>x.includes('macroEvents')) && app.includes('activeMacro')],
 ['Dynamic Elo', await readFile('src/rating.ts','utf8').then(x=>x.includes('expectedScore')&&x.includes('eloDelta')) && reducer.includes('DIFFICULTY_RATING')],
 ['Daily challenge deterministic seed', app.includes('startDaily') && await readFile('src/data.ts','utf8').then(x=>x.includes('getDailyChallengeSeed'))],
 ['Collectible pattern cards', await readFile('src/cards.ts','utf8').then(x=>x.includes('PATTERN_CARDS')) && app.includes('collectedCards')],
 ['Offline PWA shell', index.includes('manifest.webmanifest') && await readFile('src/main.tsx','utf8').then(x=>x.includes("serviceWorker.register('/sw.js')")) && await readFile('public/sw.js','utf8').then(x=>x.includes("caches.open(CACHE)"))],
 ['Multi-asset catalog', await readFile('src/assets.ts','utf8').then(x=>x.includes('WINFUT')&&x.includes('WDOFUT')&&x.includes('BIT'))],
 ['Real OHLCV adapter', await readFile('src/realData.ts','utf8').then(x=>x.includes('parseOhlcvCsv')&&x.includes('parseOhlcvJson')&&x.includes('loadRealDataset'))],
 ['Real-data migration plan', await readFile('docs/real-market-data-plan.pt-BR.md','utf8').then(x=>x.includes('Etapa 2')&&x.includes('Etapa 3')&&x.includes('Etapa 5'))],
 ['Project branding', pkg.name==='xadrez-do-mercado' && index.includes('<title>Xadrez do Mercado</title>') && translations.includes("appName:'Xadrez do Mercado'")],
 ['Speed run 10 rounds / 15 min', app.includes('SPEED_TOTAL_ROUNDS=10') && app.includes('SPEED_SESSION_MS=15*60*1000') && reducer.includes('15 * 60 * 1000')],
 ['Speed run has no debrief', app.includes("state.phase==='SPEED_RESULT'&&<div className=\"speed-feedback\"") && !app.includes("state.phase==='SPEED_RESULT'&&<ResultPanel")],
 ['Translation parity guard', translations.includes('Translation dictionaries are out of sync')],
 ['README language links', readme.includes('(README-en.md)') && readmeEn.includes('(README.md)')],
 ['Roadmap implementation notes', roadmap.includes('15. Blind tape') && roadmap.includes('19. Speed run') && roadmap.includes('29. Migrate') && roadmap.includes('32. State') && roadmap.includes('10. Adaptive difficulty') && roadmap.includes('17. Reverse replay')],
 ['Build scripts', pkg.scripts?.dev==='vite' && pkg.scripts?.build?.includes('vite build') && pkg.scripts?.typecheck?.includes('tsc')],
 ['Test script', pkg.scripts?.test==='vitest run'],
 ['Pure-function tests configured', pkg.scripts?.test==='vitest run' && pkg.devDependencies?.vitest],
 ['Roadmap complete EN', await readFile('docs/roadmap.en.md','utf8').then(x=>x.includes('32 shipped · 0 pending'))],
 ['Roadmap complete PT', await readFile('docs/roadmap.pt-BR.md','utf8').then(x=>x.includes('32 entregues · 0 pendentes'))],
 ['README omits roadmap execution section', !readme.includes('Roadmap executado nesta versão') && !readmeEn.includes('Roadmap completed in this version')],
 ['No legacy JSX runtime', !app.includes('ReactDOM') && !app.includes('LightweightCharts')],
 ['Reverse replay is non-scoring', app.includes('reverseNotCounted') && app.includes('REVERSE_START') && !app.includes('buildNextStats(current, action.reverseDecision')],
];
for(const [name,ok] of checks)console.log((ok?'PASS':'FAIL')+': '+name);
if(checks.some(([,ok])=>!ok))process.exit(1);
