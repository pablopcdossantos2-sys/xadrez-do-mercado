import type { Bar, Instrument, Timeframe } from './types';

export interface RealDataset{
  source:string;
  asset:Instrument;
  timeframe:Timeframe;
  bars:Bar[];
}

function toNumber(value:string){
  const n=Number(value.replace(',','.').trim());
  return Number.isFinite(n)?n:null;
}

function parseTime(value:string){
  const trimmed=value.trim();
  if(/^\\d{10,13}$/.test(trimmed)){
    const numeric=Number(trimmed);
    return numeric>1e12?Math.floor(numeric/1000):numeric;
  }
  const ms=Date.parse(trimmed);
  return Number.isFinite(ms)?Math.floor(ms/1000):null;
}

export function parseOhlcvCsv(csv:string):Bar[]{
  const lines=csv.trim().split(/\\r?\\n/).filter(Boolean);
  if(lines.length<2)return[];
  const rows=lines.slice(1);
  const bars:Bar[]=[];
  for(const line of rows){
    const fields=line.split(',').map(x=>x.trim());
    if(fields.length<6)continue;
    const [time,open,high,low,close,volume]=fields;
    const parsed=[toNumber(open),toNumber(high),toNumber(low),toNumber(close),toNumber(volume),parseTime(time)];
    if(parsed.some(x=>x===null))continue;
    bars.push({time:parsed[5]!,open:parsed[1]!,high:parsed[2]!,low:parsed[3]!,close:parsed[4]!,volume:Math.max(0,parsed[4]!)});
  }
  return bars.sort((a,b)=>a.time-b.time);
}

export function parseOhlcvJson(payload:unknown):Bar[]{
  if(!Array.isArray(payload))return[];
  return payload.flatMap(row=>{
    if(!row||typeof row!=='object')return[];
    const x=row as Record<string,unknown>;
    const time=typeof x.time==='number'?x.time:parseTime(String(x.time??''));
    const open=Number(x.open),high=Number(x.high),low=Number(x.low),close=Number(x.close),volume=Number(x.volume);
    return time!==null&&[open,high,low,close,volume].every(Number.isFinite)?[{time,open,high,low,close,volume:Math.max(0,volume)}]:[];
  }).sort((a,b)=>a.time-b.time);
}

export async function loadRealDataset(url:string,asset:Instrument,timeframe:Timeframe):Promise<RealDataset>{
  const response=await fetch(url,{headers:{Accept:'application/json,text/csv;q=0.9'}});
  if(!response.ok)throw new Error('Real market-data request failed: '+response.status);
  const type=response.headers.get('content-type')??'';
  const bars=type.includes('json')?parseOhlcvJson(await response.json()):parseOhlcvCsv(await response.text());
  if(bars.length<40)throw new Error('Real market dataset must contain at least 40 valid OHLCV bars');
  return{source:url,asset,timeframe,bars};
}

export function splitDataset(bars:Bar[],historyBars=82){
  const split=Math.min(historyBars,Math.max(1,bars.length-1));
  return{history:bars.slice(0,split),future:bars.slice(split)};
}
