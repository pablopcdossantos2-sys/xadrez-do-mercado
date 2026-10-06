import type { Bar, Instrument, Timeframe } from './types';

export interface HistoricalSession {
  id:string;
  asset:Instrument;
  contract:string;
  tradeDate:string;
  timezone:string;
  source:string;
  sourceUrl:string;
  tickCount:number;
  stats:{first:number;last:number;high:number;low:number;rangePct:number;trendPct:number;volume:number;tags:string[]};
  bars:Partial<Record<Timeframe,string>>;
  barCount1m:number;
}

export interface HistoricalLibraryManifest {
  version:number;
  generatedAt:string;
  source:{provider:string;feed:string;endpoint:string;notes:string};
  sessions:HistoricalSession[];
}

export interface HistoricalWindowShape {
  historyBars:number;
  futureBars:number;
}

function defaultBase(){
  return (import.meta.env.BASE_URL+'data/historical').replace(/\/+$/,'');
}

function seededIndex(seed:number,length:number){
  if(length<=0)return -1;
  let x=(seed>>>0)||1;
  x=(1664525*x+1013904223)>>>0;
  return x%length;
}

export async function loadHistoricalManifest(base=defaultBase()):Promise<HistoricalLibraryManifest>{
  const response=await fetch(base+'/manifest.json',{cache:'no-store'});
  if(!response.ok)throw new Error('Historical library manifest request failed: '+response.status);
  return response.json() as Promise<HistoricalLibraryManifest>;
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
  const index=seededIndex(seed,sessions.length);
  return index>=0?sessions[index]??null:null;
}

// Kept for compatibility with callers/tests that need to inspect the longest run of one contract.
// Puzzle generation itself must select one session at a time so a window never crosses a trading day.
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
    .sort((a,b)=>b.length-a.length||b.reduce((n,s)=>n+s.tickCount,0)-a.reduce((n,s)=>n+s.tickCount,0))
    .at(0)?.sort((a,b)=>a.tradeDate.localeCompare(b.tradeDate))??[];
}

export function historicalWindowShape(timeframe:Timeframe):HistoricalWindowShape|null{
  // A B3 intraday session cannot fit the synthetic 82+38 shape in higher timeframes.
  // Keep each real puzzle inside one trading day instead of stitching separate sessions.
  if(timeframe==='1m')return{historyBars:82,futureBars:38};
  if(timeframe==='5m')return{historyBars:72,futureBars:30};
  if(timeframe==='15m')return{historyBars:26,futureBars:12};
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
