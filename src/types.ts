export type Language = 'en' | 'pt';
export type Decision = 'LONG' | 'SHORT' | 'SKIP';
export type Phase = 'HOME' | 'DECISION' | 'REPLAY' | 'RESULT' | 'REVERSE_REPLAY' | 'SPEED_RESULT' | 'SPEED_SUMMARY';
export type Mode = 'standard' | 'blind' | 'speed';
export type TradeResult = 'WIN' | 'LOSS' | 'TIMEOUT' | 'FLATTEN' | 'SKIP' | null;

export interface Bar { time:number; open:number; high:number; low:number; close:number; volume:number; }
export interface Setup { id:string; en:string; pt:string; bias:'long'|'short'|'skip'; }
export interface TradeOutcome { result:Exclude<TradeResult,null>; r:number; bars:number; exit:number; }
export interface PuzzleAnalysis { decision:Decision; setup:Setup; outcomes:Record<Decision,TradeOutcome>; entryPrice:number; atr:number; vwap:number; ema:number; range:number; high:number; low:number; vwapDir:'above'|'below'; distVwapAbs:number; atrPct:number; lastClose:number; }
export interface DebriefAxis { axis:'structure'|'volume'|'location'|'confluence'; bias:'long'|'short'|'neutral'; textEn:string; textPt:string; }
export interface TrapInfo { key:'oversized'|'wick'|'vwapWhipsaw'|'volumeDivergence'|'failedBreak'; messageEn:string; messagePt:string; }
export interface StatsBucket { labelEn:string; labelPt:string; samples:number; correct:number; processMatch:number; rSum:number; }
export interface Breakdown { bySetup:Record<string,StatsBucket>; byTimeframe:Record<string,StatsBucket>; byDirection:Record<string,StatsBucket>; byInstrument:Record<string,StatsBucket>; }
export interface Stats { elo:number; solved:number; correct:number; processMatch:number; streak:number; bestStreak:number; rSum:number; breakdown:Breakdown; freezeAvailable:number; freezeUsedAt:number; }
export type Instrument = 'MES'|'MNQ';
export type Timeframe = '1m'|'5m'|'15m'|'1h';

export interface JournalEntry { ts:number; puzzleId:number; instrument:Instrument; timeframe:Timeframe; mode:Mode; setup:{id:string;en:string;pt:string}|null; decision:Decision; aiDecision:Decision; processMatch:boolean; outcome:Exclude<TradeResult,null>; r:number; entry:number|null; slOffset:number; tpOffset:number; skipReason:string|null; skipReasonMatch:boolean|null; trap:string|null; freezeUsed:boolean; speedRunRound:number|null; speedRunDurationMs:number|null; }
export interface SpeedRun { active:boolean; round:number; totalRounds:number; correct:number; processMatch:number; rSum:number; startedAt:number; deadlineAt:number; lastDurationMs:number|null; }
export interface PuzzleData { history:Bar[]; future:Bar[]; }
export interface AppState { lang:Language; soundEnabled:boolean; stats:Stats; journal:JournalEntry[]; timeframe:Timeframe; instrument:Instrument; mode:Mode; showVwap:boolean; showEma:boolean; showDema:boolean; showLevels:boolean; showVol:boolean; phase:Phase; puzzleData:PuzzleData; replayData:Bar[]; aiData:PuzzleAnalysis|null; userDecision:Decision|null; entryPrice:number|null; slOffset:number; tpOffset:number; playbackIdx:number; isPlaying:boolean; speed:number; tradeResult:TradeResult; rMultiple:number; eloDelta:number; debriefAxes:DebriefAxis[]; trap:TrapInfo|null; skipReason:string|null; skipReasonMatch:boolean|null; aiSkipReason:string|null; freezeUsedThisPuzzle:boolean; freezeStreakValue:number; puzzleId:number; speedRun:SpeedRun; skipModalOpen:boolean; skipReasonDraft:string; clockNow:number; }
export type Action =
  | {type:'SET_LANG';lang:Language}
  | {type:'SET_SOUND';enabled:boolean}
  | {type:'SET_MODE';mode:Mode}
  | {type:'SET_TIMEFRAME';timeframe:Timeframe}
  | {type:'SET_INSTRUMENT';instrument:Instrument}
  | {type:'TOGGLE_INDICATOR';key:'showVwap'|'showEma'|'showDema'|'showLevels'|'showVol'}
  | {type:'LOAD_PUZZLE';data:PuzzleData;analysis:PuzzleAnalysis;trap:TrapInfo|null;puzzleId:number;phase?:Phase;speedNow?:number}
  | {type:'SET_DECISION';decision:Decision;entryPrice:number}
  | {type:'OPEN_SKIP'}
  | {type:'SET_SKIP_DRAFT';reason:string}
  | {type:'CLOSE_SKIP'}
  | {type:'SET_SKIP_REASON';reason:string;match:boolean;aiReason:string}
  | {type:'TICK_REPLAY';idx:number;data:Bar[]}
  | {type:'SET_PLAYING';playing:boolean}
  | {type:'SET_SPEED';speed:number}
  | {type:'SET_BRACKET';slOffset?:number;tpOffset?:number}
  | {type:'EVALUATE';result:Exclude<TradeResult,null>;rMultiple:number;eloDelta:number;journalEntry:JournalEntry;debriefAxes:DebriefAxis[];freezeUsed:boolean;freezeStreakValue:number;nextStats:Stats;nextJournal:JournalEntry[]}
  | {type:'START_SPEED_RUN';totalRounds:number;now:number}
  | {type:'SPEED_ROUND_RESULT';correct:boolean;processMatch:boolean;r:number;durationMs:number;finished:boolean;now:number}
  | {type:'CLOCK_TICK';now:number}
  | {type:'END_SPEED_RUN'}
  | {type:'GO_HOME'}
  | {type:'CLEAR_JOURNAL'}
  | {type:'REVERSE_START';decision:Decision}
  | {type:'REVERSE_TICK';idx:number;data:Bar[]}
  | {type:'REVERSE_SET_PLAYING';playing:boolean}
  | {type:'REVERSE_FINISH';result:Exclude<TradeResult,null>}
  | {type:'REVERSE_BACK'}
  | {type:'RESET_STATS'};
