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

function defaultBase(){
  return (import.meta.env.BASE_URL+'data/historical').replace(/\/+$/,'');
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
  if(!Array.isArray(bars)||bars.length<40)throw new Error('Historical dataset is too small: '+session.id+'/'+timeframe);
  return bars.sort((a,b)=>a.time-b.time);
}

export function selectHistoricalSessions(manifest:HistoricalLibraryManifest,asset:Instrument,timeframe:Timeframe){
  return manifest.sessions.filter(session=>session.asset===asset&&Boolean(session.bars[timeframe]));
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
  let x=(seed>>>0)||1;
  x=(1664525*x+1013904223)>>>0;
  const start=x%(maxStart+1);
  return{history:bars.slice(start,start+historyBars),future:bars.slice(start+historyBars,start+needed)};
}
