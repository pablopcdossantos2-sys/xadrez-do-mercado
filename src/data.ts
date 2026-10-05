import type { Bar, Instrument, MacroEvent, Timeframe } from './types';

export const TF_SEC: Record<Timeframe, number> = { '1m':60, '5m':300, '15m':900, '1h':3600 };
export const TF_VOL_MULT: Record<Timeframe, number> = { '1m':0.6, '5m':1.0, '15m':1.8, '1h':3.2 };
export type GeneratorDifficulty = 'easy'|'normal'|'hard';
export const DIFFICULTY_PARAMS:Record<GeneratorDifficulty,{vol:number;setup:number;noise:number}> = {
  easy:{vol:0.75,setup:1.25,noise:0.90},
  normal:{vol:1.0,setup:1.00,noise:1.00},
  hard:{vol:1.30,setup:0.70,noise:1.15},
};

const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const EVENT_KINDS:MacroEvent['kind'][]=['CPI','FOMC','NFP','PPI'];

export function getDailyChallengeSeed(date=new Date()){
  const key=date.getFullYear()*10000+(date.getMonth()+1)*100+date.getDate();
  let x=(key^0x9e3779b9)>>>0;
  x=(1664525*x+1013904223)>>>0;
  return x||1;
}

function sessionProfile(minutes:number){
  if(minutes>=570&&minutes<630)return {vol:1.45,volume:1.75};
  if(minutes>=630&&minutes<720)return {vol:1.12,volume:1.25};
  if(minutes>=720&&minutes<840)return {vol:0.78,volume:0.72};
  if(minutes>=840&&minutes<960)return {vol:1.22,volume:1.55};
  return {vol:0.62,volume:0.55};
}

export function generateMarketData(timeframe:Timeframe,instrument:Instrument,seed=Date.now(),difficulty:GeneratorDifficulty='normal'):{history:Bar[];future:Bar[];macroEvents:MacroEvent[]}{
  const stepSec=TF_SEC[timeframe],volUnit=TF_VOL_MULT[timeframe],basePrice=instrument==='MES'?4200:15500,params=DIFFICULTY_PARAMS[difficulty];
  const baseVol=(timeframe==='1m'?0.9:timeframe==='5m'?2.4:timeframe==='15m'?5.5:11)*volUnit*params.vol;
  const total=120,decisionIdx=82,bars:Bar[]=[];
  let state=(seed>>>0)||1;
  const random=()=>{state=(1664525*state+1013904223)>>>0;return state/4294967296;};
  const sessionStart=new Date();sessionStart.setHours(9,30,0,0);
  let t=Math.floor(sessionStart.getTime()/1000)-decisionIdx*stepSec;
  let price=basePrice+(random()-0.5)*200;
  let trendBias=(random()-0.5)*1.5;
  let volCluster=1;
  const eventIndex=decisionIdx+12+(state%20);
  const eventKind=EVENT_KINDS[state%EVENT_KINDS.length];
  const macroEvents:MacroEvent[]=[{
    index:eventIndex-decisionIdx,
    time:t+eventIndex*stepSec,
    kind:eventKind,
    impact:'high',
    labelEn:eventKind+' release',
    labelPt:'Divulgação de '+eventKind
  }];
  const macroOffset=Math.max(1,random()-0.5);
  for(let i=0;i<total;i++){
    const d=new Date(t*1000),minutes=d.getHours()*60+d.getMinutes();
    if(i===0||i%22===0)trendBias=(random()-0.5)*3.2;
    volCluster=clamp(volCluster*0.86+(0.62+random()*1.25)*0.14,0.60,1.75);
    const profile=sessionProfile(minutes);
    if(i===decisionIdx){
      const gap=(random()-0.5)*baseVol*1.9;
      price+=gap;
    }
    const localBias=i>=decisionIdx-15&&i<decisionIdx?trendBias*1.6*params.setup:trendBias;
    const eventShock=i===eventIndex?macroOffset*baseVol*4.2*(random()>0.5?1:-1):0;
    const eventMultiplier=i===eventIndex?2.4:1;
    const localVol=baseVol*profile.vol*volCluster*eventMultiplier;
    const noise=(random()-0.5)*localVol*params.noise;
    const open=price,move=localBias+noise+eventShock,close=open+move;
    const wick=localVol*(0.35+random()*0.55);
    const high=Math.max(open,close)+random()*wick,low=Math.min(open,close)-random()*wick;
    const volume=Math.round((2500+random()*4500+Math.abs(move)*800)*profile.volume*(eventMultiplier===1?1:2.5));
    bars.push({time:t,open:+open.toFixed(2),high:+high.toFixed(2),low:+low.toFixed(2),close:+close.toFixed(2),volume});
    price=close;t+=stepSec;
  }
  return {history:bars.slice(0,decisionIdx),future:bars.slice(decisionIdx),macroEvents};
}
