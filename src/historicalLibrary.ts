import type { Bar, Instrument, Timeframe } from './types';

export type HistoricalTrendRegime='trend-up'|'trend-down'|'balanced';
export type HistoricalVolatilityRegime='low'|'normal'|'high';
export type HistoricalGapRegime='gap-up'|'gap-down'|'none'|'unknown';
export type HistoricalDifficulty='easy'|'normal'|'hard';
export type HistoricalQuality='usable'|'good'|'excellent';

export interface HistoricalCuration {
  trend:HistoricalTrendRegime;
  volatility:HistoricalVolatilityRegime;
  gap:HistoricalGapRegime;
  characters:string[];
  difficulty:HistoricalDifficulty;
  quality:HistoricalQuality;
  score:number;
  tags:string[];
}

export interface HistoricalSession {
  id:string;
  asset:Instrument;
  contract:string;
  tradeDate:string;
  timezone:string;
  source:string;
  sourceUrl:string;
  tickCount?:number;
  recordCount?:number;
  stats:{
    first:number;last:number;high:number;low:number;rangePct:number;trendPct:number;volume:number;tags:string[];
    gapPct?:number|null;continuityPct?:number;openingMovePct?:number;closeLocation?:number;trendStrength?:number;
  };
  curation?:HistoricalCuration;
  session?:{kind:string;start:string;end:string;regularStart?:string;regularEnd?:string};
  bars:Partial<Record<Timeframe,string>>;
  barCount1m:number;
}

export interface HistoricalLibrarySource {
  provider:string;
  feed:string;
  endpoint:string;
  notes:string;
}

export interface HistoricalLibraryManifest {
  version:number;
  generatedAt:string;
  source:HistoricalLibrarySource;
  sources?:HistoricalLibrarySource[];
  coverage?:Record<string,string[]>;
  sessions:HistoricalSession[];
}

export interface HistoricalWindowShape {
  historyBars:number;
  futureBars:number;
}

function defaultBase(){
  return (import.meta.env.BASE_URL+'data/historical').replace(/\/+$/,'');
}

function localPrivateBase(){
  return (import.meta.env.BASE_URL+'data/local-historical').replace(/\/+$/,'');
}

function seededIndex(seed:number,length:number){
  if(length<=0)return -1;
  let x=(seed>>>0)||1;
  x=(1664525*x+1013904223)>>>0;
  return x%length;
}

function curationBucket(session:HistoricalSession){
  const c=session.curation;
  if(!c)return'uncurated';
  return[c.trend,c.volatility,c.characters[0]??'other',c.difficulty].join('|');
}

function activity(session:HistoricalSession){
  return session.tickCount??session.recordCount??session.stats.volume??0;
}

async function fetchManifest(base:string,required:boolean):Promise<HistoricalLibraryManifest|null>{
  const response=await fetch(base+'/manifest.json',{cache:'no-store'});
  if(!response.ok){
    if(required)throw new Error('Historical library manifest request failed: '+response.status);
    return null;
  }
  return response.json() as Promise<HistoricalLibraryManifest>;
}

export function mergeHistoricalManifests(
  primary:HistoricalLibraryManifest,
  overlay:HistoricalLibraryManifest|null,
):HistoricalLibraryManifest{
  if(!overlay)return primary;
  const sessions=new Map(primary.sessions.map(session=>[session.id,session]));
  for(const session of overlay.sessions)sessions.set(session.id,session);
  const sourceList=[...(primary.sources??[primary.source]),...(overlay.sources??[overlay.source])];
  const sourceKeys=new Set<string>();
  const sources=sourceList.filter(source=>{
    const key=[source.provider,source.feed,source.endpoint].join('|');
    if(sourceKeys.has(key))return false;
    sourceKeys.add(key);
    return true;
  });
  const coverage:Record<string,string[]>={};
  for(const manifest of [primary,overlay]){
    for(const [asset,tags] of Object.entries(manifest.coverage??{})){
      coverage[asset]=[...new Set([...(coverage[asset]??[]),...tags])].sort();
    }
  }
  return{
    ...primary,
    version:Math.max(primary.version,overlay.version),
    generatedAt:primary.generatedAt>overlay.generatedAt?primary.generatedAt:overlay.generatedAt,
    sources,
    coverage,
    sessions:[...sessions.values()].sort((a,b)=>a.asset.localeCompare(b.asset)||a.tradeDate.localeCompare(b.tradeDate)||a.contract.localeCompare(b.contract)),
  };
}

export async function loadHistoricalManifest(base=defaultBase()):Promise<HistoricalLibraryManifest>{
  const primary=await fetchManifest(base,true);
  if(!primary)throw new Error('Historical library manifest is unavailable');
  if(base!==defaultBase())return primary;
  try{
    const local=await fetchManifest(localPrivateBase(),false);
    return mergeHistoricalManifests(primary,local);
  }catch{
    return primary;
  }
}

export async function loadHistoricalSession(session:HistoricalSession,timeframe:Timeframe):Promise<Bar[]>{
  const path=session.bars[timeframe];
  if(!path)throw new Error('Historical timeframe is unavailable: '+timeframe);
  const root=import.meta.env.BASE_URL.replace(/\/+$/,'');
  const url=path.startsWith('/')?root+path:path;
  const response=await fetch(url,{cache:'force-cache'});
  if(!response.ok)throw new Error('Historical dataset request failed: '+response.status);
  const bars=await response.json() as Bar[];
  if(!Array.isArray(bars)||bars.length<2)throw new Error('Historical dataset is too small: '+session.id+'/'+timeframe);
  return bars.sort((a,b)=>a.time-b.time);
}

export function selectHistoricalSessions(manifest:HistoricalLibraryManifest,asset:Instrument,timeframe:Timeframe){
  return manifest.sessions.filter(session=>session.asset===asset&&Boolean(session.bars[timeframe]));
}

export function selectHistoricalSession(
  manifest:HistoricalLibraryManifest,
  asset:Instrument,
  timeframe:Timeframe,
  seed:number,
):HistoricalSession|null{
  const sessions=selectHistoricalSessions(manifest,asset,timeframe)
    .slice()
    .sort((a,b)=>a.tradeDate.localeCompare(b.tradeDate)||a.contract.localeCompare(b.contract)||a.id.localeCompare(b.id));
  if(!sessions.length)return null;

  const byRegime=new Map<string,HistoricalSession[]>();
  for(const session of sessions){
    const key=curationBucket(session);
    const group=byRegime.get(key)??[];
    group.push(session);
    byRegime.set(key,group);
  }
  const regimeKeys=[...byRegime.keys()].sort();
  const regimeIndex=seededIndex(seed,regimeKeys.length);
  const group=byRegime.get(regimeKeys[regimeIndex]!)??sessions;
  const itemIndex=seededIndex(seed^0x9e3779b9,group.length);
  return itemIndex>=0?group[itemIndex]??null:null;
}

// Kept for compatibility with callers/tests that inspect the longest run of one contract.
// Puzzle generation itself selects one session at a time so a window never crosses a trading day.
export function selectHistoricalContractSessions(
  manifest:HistoricalLibraryManifest,
  asset:Instrument,
  timeframe:Timeframe,
):HistoricalSession[]{
  const sessions=selectHistoricalSessions(manifest,asset,timeframe);
  const byContract=new Map<string,HistoricalSession[]>();
  for(const session of sessions){
    const group=byContract.get(session.contract)??[];
    group.push(session);
    byContract.set(session.contract,group);
  }
  return [...byContract.values()]
    .sort((a,b)=>b.length-a.length||b.reduce((n,s)=>n+activity(s),0)-a.reduce((n,s)=>n+activity(s),0))
    .at(0)?.sort((a,b)=>a.tradeDate.localeCompare(b.tradeDate))??[];
}

export function historicalWindowShape(timeframe:Timeframe,asset?:Instrument):HistoricalWindowShape|null{
  // Real puzzles stay inside one exchange session rather than stitching days.
  if(timeframe==='1m')return{historyBars:82,futureBars:38};
  if(timeframe==='5m')return{historyBars:72,futureBars:30};
  if(timeframe==='15m')return{historyBars:26,futureBars:12};
  if(timeframe==='1h'&&(asset==='MES'||asset==='MNQ'))return{historyBars:12,futureBars:6};
  return null;
}

export function selectHistoricalWindow(
  bars:Bar[],
  seed:number,
  historyBars=82,
  futureBars=38,
):{history:Bar[];future:Bar[]}|null{
  const needed=historyBars+futureBars;
  if(bars.length<needed)return null;
  const maxStart=bars.length-needed;
  const start=seededIndex(seed,maxStart+1);
  if(start<0)return null;
  return{history:bars.slice(start,start+historyBars),future:bars.slice(start+historyBars,start+needed)};
}
