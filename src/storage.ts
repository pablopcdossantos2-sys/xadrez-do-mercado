
import type { Breakdown, JournalEntry, Stats, StatsBucket } from './types';

export const STATS_KEY='tape_puzzle_stats_v4', LEGACY_STATS_KEY='tape_puzzle_stats_v3';
export const JOURNAL_KEY='tape_puzzle_journal_v2', LEGACY_JOURNAL_KEY='tape_puzzle_journal_v1';
export const LANG_KEY='tape_puzzle_lang', SOUND_KEY='tape_puzzle_sound';
export const JOURNAL_MAX=200, FREEZE_WINDOW_MS=24*60*60*1000;

const newBucket=():StatsBucket=>({labelEn:'',labelPt:'',samples:0,correct:0,processMatch:0,rSum:0});
export const emptyBreakdown=():Breakdown=>({bySetup:{},byTimeframe:{},byDirection:{},byInstrument:{}});
export const createDefaultStats=():Stats=>({elo:1236,solved:0,correct:0,processMatch:0,streak:0,bestStreak:0,rSum:0,breakdown:emptyBreakdown(),freezeAvailable:1,freezeUsedAt:0,collectedCards:[]});

export function migrateStats(raw:unknown):Stats{
  if(!raw||typeof raw!=='object')return createDefaultStats();
  const s=raw as Partial<Stats>, b=emptyBreakdown();
  if(s.breakdown&&typeof s.breakdown==='object'){
    (Object.keys(b) as (keyof Breakdown)[]).forEach(k=>{
      const src=s.breakdown?.[k];
      if(src&&typeof src==='object')Object.entries(src).forEach(([key,value])=>{
        const x=value as Partial<StatsBucket>;
        b[k][key]={...newBucket(),...x,samples:Number(x.samples)||0,correct:Number(x.correct)||0,processMatch:Number(x.processMatch)||0,rSum:Number(x.rSum)||0};
      });
    });
  }
  return {...createDefaultStats(),...s,breakdown:b,collectedCards:Array.isArray(s.collectedCards)?s.collectedCards.filter((x):x is string=>typeof x==='string'):[]};
}
export function loadStats():Stats{
  try{const current=localStorage.getItem(STATS_KEY),legacy=localStorage.getItem(LEGACY_STATS_KEY);return current?migrateStats(JSON.parse(current)):legacy?migrateStats(JSON.parse(legacy)):createDefaultStats();}
  catch{return createDefaultStats();}
}
export function saveStats(stats:Stats){try{localStorage.setItem(STATS_KEY,JSON.stringify(stats));}catch{}}
export function isFreezeReady(stats:Stats){return stats.freezeAvailable>0||(stats.freezeUsedAt>0&&Date.now()-stats.freezeUsedAt>FREEZE_WINDOW_MS);}
export function cloneBreakdown(x:Breakdown):Breakdown{return JSON.parse(JSON.stringify(x)) as Breakdown;}
export function recordBucket(group:Record<string,StatsBucket>,key:string,patch:{correct:boolean;processMatch:boolean;r:number},labelEn='',labelPt=''){
  const b=group[key]??newBucket();b.labelEn=labelEn||b.labelEn||key;b.labelPt=labelPt||b.labelPt||key;b.samples++;if(patch.correct)b.correct++;if(patch.processMatch)b.processMatch++;b.rSum=+(b.rSum+patch.r).toFixed(2);group[key]=b;
}
export function loadLanguage():'en'|'pt'{try{return localStorage.getItem(LANG_KEY)==='pt'?'pt':'en';}catch{return'en';}}
export function saveLanguage(lang:'en'|'pt'){try{localStorage.setItem(LANG_KEY,lang);}catch{}}
export function loadSoundPreference(){try{return localStorage.getItem(SOUND_KEY)!=='0';}catch{return true;}}
export function saveSoundPreference(v:boolean){try{localStorage.setItem(SOUND_KEY,v?'1':'0');}catch{}}

function normaliseEntry(x:Partial<JournalEntry>):JournalEntry{
  return {...x,ts:Number(x.ts)||Date.now(),puzzleId:Number(x.puzzleId)||0,instrument:x.instrument==='MNQ'?'MNQ':'MES',timeframe:x.timeframe??'15m',mode:x.mode??'standard',setup:x.setup??null,decision:x.decision??'SKIP',aiDecision:x.aiDecision??'SKIP',processMatch:Boolean(x.processMatch),outcome:x.outcome??'SKIP',r:Number(x.r)||0,entry:typeof x.entry==='number'?x.entry:null,slOffset:Number(x.slOffset)||12,tpOffset:Number(x.tpOffset)||24,skipReason:x.skipReason??null,skipReasonMatch:x.skipReasonMatch??null,trap:x.trap??null,freezeUsed:Boolean(x.freezeUsed),speedRunRound:x.speedRunRound??null,speedRunDurationMs:x.speedRunDurationMs??null,dailyChallenge:Boolean(x.dailyChallenge)};
}
export function loadJournal():JournalEntry[]{
  try{const raw=localStorage.getItem(JOURNAL_KEY)??localStorage.getItem(LEGACY_JOURNAL_KEY);if(!raw)return[];const data=JSON.parse(raw);return Array.isArray(data)?data.slice(-JOURNAL_MAX).map(normaliseEntry):[];}catch{return[];}
}
export function saveJournal(entries:JournalEntry[]){try{localStorage.setItem(JOURNAL_KEY,JSON.stringify(entries.slice(-JOURNAL_MAX)));}catch{}}
function download(name:string,data:string,mime:string){const url=URL.createObjectURL(new Blob([data],{type:mime})),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),250);}
export function exportJournalJson(entries:JournalEntry[]){download('tape-puzzles-journal-'+Date.now()+'.json',JSON.stringify(entries,null,2),'application/json');}
export function exportJournalCsv(entries:JournalEntry[]){const head=['timestamp_iso','puzzle_id','instrument','timeframe','mode','setup_id','decision','ai_decision','process_match','outcome','r','speed_round','speed_duration_ms'];const rows=entries.map(e=>[new Date(e.ts).toISOString(),e.puzzleId,e.instrument,e.timeframe,e.mode,e.setup?.id??'',e.decision,e.aiDecision,e.processMatch?1:0,e.outcome,e.r.toFixed(2),e.speedRunRound??'',e.speedRunDurationMs??''].join(','));download('tape-puzzles-journal-'+Date.now()+'.csv',[head.join(','),...rows].join('\n'),'text/csv');}
