import { access, readFile } from 'node:fs/promises';

const expected=[
  'index.html','package.json','vite.config.ts','tsconfig.json','tsconfig.app.json',
  'src/main.tsx','src/App.tsx','src/TapeChart.tsx','src/types.ts','src/data.ts','src/difficulty.ts','src/analytics.ts','src/reducer.ts',
  'src/storage.ts','src/translations.ts','src/styles.css','tests/pure.test.ts'
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
 ['Speed run 10 rounds / 15 min', app.includes('SPEED_TOTAL_ROUNDS=10') && app.includes('SPEED_SESSION_MS=15*60*1000') && reducer.includes('15 * 60 * 1000')],
 ['Speed run has no debrief', app.includes("state.phase==='SPEED_RESULT'&&<div className=\"speed-feedback\"") && !app.includes("state.phase==='SPEED_RESULT'&&<ResultPanel")],
 ['Translation parity guard', translations.includes('Translation dictionaries are out of sync')],
 ['README language links', readme.includes('(README-en.md)') && readmeEn.includes('(README.md)')],
 ['Roadmap implementation notes', roadmap.includes('15. Blind tape') && roadmap.includes('19. Speed run') && roadmap.includes('29. Migrate') && roadmap.includes('32. State') && roadmap.includes('10. Adaptive difficulty') && roadmap.includes('17. Reverse replay')],
 ['Build scripts', pkg.scripts?.dev==='vite' && pkg.scripts?.build?.includes('vite build') && pkg.scripts?.typecheck?.includes('tsc')],
 ['Pure-function tests configured', pkg.scripts?.test==='vitest run' && pkg.devDependencies?.vitest],
 ['No legacy JSX runtime', !app.includes('ReactDOM') && !app.includes('LightweightCharts')],
 ['Reverse replay is non-scoring', app.includes('reverseNotCounted') && app.includes('REVERSE_START') && !app.includes('buildNextStats(current, action.reverseDecision')],
];
for(const [name,ok] of checks)console.log((ok?'PASS':'FAIL')+': '+name);
if(checks.some(([,ok])=>!ok))process.exit(1);
