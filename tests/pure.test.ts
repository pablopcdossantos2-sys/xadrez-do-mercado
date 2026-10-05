import { describe, expect, it } from 'vitest';
import { computeATR, computeEMA, simulateSide } from '../src/analytics';
import { getAdaptiveDifficulty } from '../src/difficulty';
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
