import { describe, expect, it } from 'vitest';
import { analyzePuzzle, computeATR, computeEMA, computeMicrostructure, computeSessionLevels, simulateSide } from '../src/analytics';
import { generateMarketData, getDailyChallengeSeed } from '../src/data';
import { eloDelta } from '../src/rating';
import { getAdaptiveDifficulty } from '../src/difficulty';
import { parseOhlcvCsv, parseOhlcvJson, splitDataset } from '../src/realData';
import { ACTIVE_ASSETS } from '../src/assets';
import { selectHistoricalContractSessions, selectHistoricalSessions, selectHistoricalWindow } from '../src/historicalLibrary';
import type { Bar, JournalEntry } from '../src/types';

function bar(close:number,open=close,high=Math.max(open,close),low=Math.min(open,close),time=0):Bar{
  return {time,open,high,low,close,volume:1000};
}

function journal(processMatch:boolean,count:number):JournalEntry[]{
  return Array.from({length:count},(_,i)=>({
    ts:i,puzzleId:i,instrument:'MES',timeframe:'15m',mode:'standard',
    setup:null,decision:'LONG',aiDecision:'LONG',processMatch,
    outcome:'WIN',r:1,entry:100,slOffset:12,tpOffset:24,skipReason:null,
    skipReasonMatch:null,trap:null,freezeUsed:false,speedRunRound:null,
    speedRunDurationMs:null
  }));
}

describe('analytics pure functions',()=>{
  it('computes EMA from the first close and subsequent smoothing',()=>{
    const result=computeEMA([bar(10,10,11,9,0),bar(12,12,13,11,60)],2);
    expect(result[0].value).toBe(10);
    expect(result[1].value).toBeCloseTo(11.3333,4);
  });

  it('computes ATR from true ranges',()=>{
    const bars=[
      bar(10,10,11,9,0),
      bar(11,11,12,10,60),
      bar(12,12,13,11,120)
    ];
    expect(computeATR(bars,2)).toBe(2);
  });

  it('returns the first bracket result hit by the future bars',()=>{
    const outcome=simulateSide(
      [bar(103,100,104,99,0)],
      100,'LONG',12,3
    );
    expect(outcome.result).toBe('WIN');
    expect(outcome.r).toBe(0.25);
  });

  it('derives microstructure from the latest candle without external data',()=>{
    const micro=computeMicrostructure([bar(12,10,13,9,0)]);
    expect(micro.buyVolume+micro.sellVolume).toBe(1000);
    expect(micro.delta).toBe(micro.buyVolume-micro.sellVolume);
  });

  it('separates RTH and ETH session levels',()=>{
    const bars=[
      bar(10,10,14,8,new Date(2025,0,2,10,0).getTime()/1000),
      bar(12,12,13,9,new Date(2025,0,2,17,0).getTime()/1000)
    ];
    const levels=computeSessionLevels(bars);
    expect(levels.rthHigh).toBe(14);
    expect(levels.rthLow).toBe(8);
    expect(levels.ethHigh).toBe(13);
    expect(levels.ethLow).toBe(9);
  });
});

describe('real market data foundation',()=>{
  it('parses standard and semicolon OHLCV CSV',()=>{
    const comma=parseOhlcvCsv('time,open,high,low,close,volume\\n2026-01-02T10:00:00Z,10,12,9,11,1500');
    const semicolon=parseOhlcvCsv('time;open;high;low;close;volume\\n2026-01-02T10:00:00Z;10,5;12,5;9,5;11,5;1500');
    expect(comma[0]?.close).toBe(11);
    expect(semicolon[0]?.close).toBe(11.5);
  });

  it('parses JSON OHLCV and keeps bars ordered',()=>{
    const bars=parseOhlcvJson([{time:2,open:11,high:12,low:10,close:11.5,volume:200},{time:1,open:10,high:11,low:9,close:10.5,volume:100}]);
    expect(bars.map(x=>x.time)).toEqual([1,2]);
    expect(splitDataset(bars,1).history).toHaveLength(1);
  });

  it('selects a reproducible historical exercise window',()=>{
    const bars=Array.from({length:130},(_,i)=>bar(100+i,100+i,101+i,99+i,i*60));
    const a=selectHistoricalWindow(bars,123,82,38);
    const b=selectHistoricalWindow(bars,123,82,38);
    expect(a).toEqual(b);
    expect(a?.history).toHaveLength(82);
    expect(a?.future).toHaveLength(38);
  });

  it('prefers the longest same-contract historical run',()=>{
    const base={timezone:'America/Sao_Paulo',source:'b3',sourceUrl:'x',tickCount:100,
      stats:{first:1,last:1,high:1,low:1,rangePct:0,trendPct:0,volume:1,tags:[]},bars:{'1m':'/x.json'},barCount1m:120} as const;
    const manifest={version:1,generatedAt:'x',source:{provider:'B3',feed:'deriv',endpoint:'x',notes:'x'},sessions:[
      {...base,id:'a1',asset:'WINFUT',contract:'WINV26',tradeDate:'2026-09-23'},
      {...base,id:'a2',asset:'WINFUT',contract:'WINV26',tradeDate:'2026-09-24'},
      {...base,id:'b1',asset:'WINFUT',contract:'WINX26',tradeDate:'2026-09-25'}
    ]} as const;
    expect(selectHistoricalContractSessions(manifest,'WINFUT','1m').map(x=>x.id)).toEqual(['a1','a2']);
  });
  it('filters historical sessions by asset and timeframe',()=>{
    const manifest={
      version:1,generatedAt:'x',
      source:{provider:'B3',feed:'deriv',endpoint:'x',notes:'x'},
      sessions:[
        {id:'w',asset:'WINFUT',contract:'WINJ26',tradeDate:'2026-09-20',timezone:'America/Sao_Paulo',source:'b3',sourceUrl:'x',tickCount:100,stats:{first:1,last:1,high:1,low:1,rangePct:0,trendPct:0,volume:1,tags:[]},bars:{'1m':'/w.json','15m':'/w15.json'},barCount1m:120},
        {id:'d',asset:'WDOFUT',contract:'WDOJ26',tradeDate:'2026-09-20',timezone:'America/Sao_Paulo',source:'b3',sourceUrl:'x',tickCount:100,stats:{first:1,last:1,high:1,low:1,rangePct:0,trendPct:0,volume:1,tags:[]},bars:{'1m':'/d.json'},barCount1m:120}
      ]
    } as const;
    expect(selectHistoricalSessions(manifest,'WINFUT','15m').map(x=>x.id)).toEqual(['w']);
    expect(selectHistoricalSessions(manifest,'WDOFUT','15m')).toHaveLength(0);
  });

  it('includes the requested Brazilian futures',()=>{
    expect(ACTIVE_ASSETS.map(x=>x.id)).toEqual(['MES','MNQ','WINFUT','WDOFUT']);
    expect(ACTIVE_ASSETS.find(x=>x.id==='WINFUT')?.b3Code).toBe('WIN');
    expect(ACTIVE_ASSETS.find(x=>x.id==='WDOFUT')?.b3Code).toBe('WDO');
  });
});

describe('roadmap validation and generator',()=>{
  it('does not let future bars change the analyst recommendation',()=>{
    const puzzle=generateMarketData('15m','MES',123456,'normal');
    const futureA=puzzle.future.map(b=>({...b,close:b.close+1000,high:b.high+1000,low:b.low+1000}));
    const a=analyzePuzzle(puzzle.history,puzzle.future);
    const b=analyzePuzzle(puzzle.history,futureA);
    expect(b.decision).toBe(a.decision);
    expect(b.acceptedDecisions).toEqual(a.acceptedDecisions);
    expect(b.signalConfidence).toBe(a.signalConfidence);
  });

  it('keeps the daily seed deterministic for a calendar date',()=>{
    const date=new Date(2026,9,5,12,0);
    expect(getDailyChallengeSeed(date)).toBe(getDailyChallengeSeed(new Date(date)));
  });

  it('rewards beating a harder synthetic rating with more Elo',()=>{
    expect(eloDelta(1236,1310,1)).toBeGreaterThan(eloDelta(1236,1160,1));
  });
});

describe('adaptive difficulty pure function',()=>{
  it('stays normal during warm-up',()=>{
    expect(getAdaptiveDifficulty(journal(true,4)).key).toBe('normal');
  });

  it('maps process accuracy to easy, normal, and hard',()=>{
    expect(getAdaptiveDifficulty(journal(false,5)).key).toBe('easy');
    const mixed=[...journal(true,3),...journal(false,2)];
    expect(getAdaptiveDifficulty(mixed).key).toBe('normal');
    expect(getAdaptiveDifficulty(journal(true,5)).key).toBe('hard');
  });
});
