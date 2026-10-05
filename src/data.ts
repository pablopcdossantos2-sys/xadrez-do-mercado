import type { Bar, Instrument, Timeframe } from './types';

export const TF_SEC: Record<Timeframe, number> = { '1m':60, '5m':300, '15m':900, '1h':3600 };
export const TF_VOL_MULT: Record<Timeframe, number> = { '1m':0.6, '5m':1.0, '15m':1.8, '1h':3.2 };
export type GeneratorDifficulty = 'easy'|'normal'|'hard';
export const DIFFICULTY_PARAMS:Record<GeneratorDifficulty,{vol:number;setup:number;noise:number}> = {
  easy:{vol:0.75,setup:1.25,noise:0.90},
  normal:{vol:1.0,setup:1.00,noise:1.00},
  hard:{vol:1.30,setup:0.70,noise:1.15},
};

export function generateMarketData(timeframe:Timeframe,instrument:Instrument,seed=Date.now(),difficulty:GeneratorDifficulty='normal'):{history:Bar[];future:Bar[]}{
  const stepSec=TF_SEC[timeframe], volUnit=TF_VOL_MULT[timeframe], basePrice=instrument==='MES'?4200:15500, params=DIFFICULTY_PARAMS[difficulty];
  const volatility=(timeframe==='1m'?0.9:timeframe==='5m'?2.4:timeframe==='15m'?5.5:11)*volUnit*params.vol;
  const bars:Bar[]=[]; const total=120, decisionIdx=82;
  let state=(seed>>>0)||1;
  const random=()=>{state=(1664525*state+1013904223)>>>0;return state/4294967296;};
  const sessionStart=new Date(); sessionStart.setHours(9,30,0,0);
  let t=Math.floor(sessionStart.getTime()/1000)-decisionIdx*stepSec;
  let price=basePrice+(random()-0.5)*200, trendBias=(random()-0.5)*1.5;
  for(let i=0;i<total;i++){
    if(i===0||i%22===0)trendBias=(random()-0.5)*3.2;
    const localBias=i>=decisionIdx-15&&i<decisionIdx?trendBias*1.6*params.setup:trendBias;
    const noise=(random()-0.5)*volatility*params.noise, open=price, move=localBias+noise, close=open+move;
    const high=Math.max(open,close)+random()*volatility*0.55, low=Math.min(open,close)-random()*volatility*0.55;
    const volume=Math.round(2500+random()*4500+Math.abs(move)*800);
    bars.push({time:t,open:+open.toFixed(2),high:+high.toFixed(2),low:+low.toFixed(2),close:+close.toFixed(2),volume});
    price=close; t+=stepSec;
  }
  return {history:bars.slice(0,decisionIdx),future:bars.slice(decisionIdx)};
}
