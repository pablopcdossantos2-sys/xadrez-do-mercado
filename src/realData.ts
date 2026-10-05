import type { Bar, Instrument, Timeframe } from './types';

export interface RealDataset{
  source:string;
  asset:Instrument;
  timeframe:Timeframe;
  bars:Bar[];
}

function toNumber(value:string|undefined){
  if(value===undefined)return null;
  const normalized=value.trim().includes(',')&&value.trim().includes('.')?value.trim().replace(/\./g,'').replace(',','.'):value.trim().replace(',','.');
  const n=Number(normalized);
  return Number.isFinite(n)?n:null;
}

function parseTime(value:string|undefined){
  if(value===undefined)return null;
  const trimmed=value.trim();
  if(/^\d{10,13}$/.test(trimmed)){
    const numeric=Number(trimmed);
    return numeric>1e12?Math.floor(numeric/1000):numeric;
  }
  const ms=Date.parse(trimmed);
  return Number.isFinite(ms)?Math.floor(ms/1000):null;
}

export function parseOhlcvCsv(csv:string):Bar[]{
  const lines=csv.trim().split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  if(lines.length<2)return[];
  const separator=lines[0]!.includes(';')?';':',';
  const bars:Bar[]=[];
  for(const line of lines.slice(1)){
    const fields=line.split(separator).map(x=>x.trim());
    if(fields.length<6)continue;
    const [time,open,high,low,close,volume]=fields;
    const parsedTime=parseTime(time);
    const parsedOpen=toNumber(open),parsedHigh=toNumber(high),parsedLow=toNumber(low),parsedClose=toNumber(close),parsedVolume=toNumber(volume);
    if(parsedTime===null||parsedOpen===null||parsedHigh===null||parsedLow===null||parsedClose===null||parsedVolume===null)continue;
    bars.push({time:parsedTime,open:parsedOpen,high:parsedHigh,low:parsedLow,close:parsedClose,volume:Math.max(0,parsedVolume)});
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
