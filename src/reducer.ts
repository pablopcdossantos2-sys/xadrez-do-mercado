import type { Action, AppState, Decision, JournalEntry, Stats } from './types';
import { FREEZE_WINDOW_MS, cloneBreakdown, recordBucket } from './storage';

const clampJournal = (entries: JournalEntry[]) => entries.slice(-200);

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LANG': return { ...state, lang: action.lang };
    case 'SET_SOUND': return { ...state, soundEnabled: action.enabled };
    case 'CLOCK_TICK': return { ...state, clockNow: action.now };
    case 'SET_MODE': return { ...state, mode: action.mode };
    case 'SET_TIMEFRAME': return { ...state, timeframe: action.timeframe };
    case 'SET_INSTRUMENT': return { ...state, instrument: action.instrument };
    case 'TOGGLE_INDICATOR': return { ...state, [action.key]: !state[action.key] };
    case 'LOAD_PUZZLE':
      return {
        ...state,
        puzzleData: action.data,
        aiData: action.analysis,
        trap: action.trap,
        puzzleId: action.puzzleId,
        phase: action.phase ?? 'DECISION',
        replayData: [],
        userDecision: null,
        entryPrice: null,
        playbackIdx: 0,
        isPlaying: false,
        tradeResult: null,
        rMultiple: 0,
        eloDelta: 0,
        debriefAxes: [],
        skipReason: null,
        skipReasonMatch: null,
        aiSkipReason: action.analysis.setup.bias === 'skip' ? 'No clean directional edge.' : 'The setup lacked a clean directional edge.',
        freezeUsedThisPuzzle: false,
        freezeStreakValue: 0,
        speedRun: action.speedNow && state.speedRun.active ? { ...state.speedRun, startedAt: action.speedNow, deadlineAt: state.speedRun.deadlineAt } : state.speedRun,
        skipModalOpen: false,
        skipReasonDraft: '',
        clockNow: action.speedNow ?? Date.now(),
      };
    case 'SET_DECISION':
      return { ...state, userDecision: action.decision, entryPrice: action.entryPrice };
    case 'OPEN_SKIP': return { ...state, skipModalOpen: true, skipReasonDraft: '' };
    case 'SET_SKIP_DRAFT': return { ...state, skipReasonDraft: action.reason };
    case 'CLOSE_SKIP': return { ...state, skipModalOpen: false, skipReasonDraft: '' };
    case 'SET_SKIP_REASON': return { ...state, skipReason: action.reason, skipReasonMatch: action.match, aiSkipReason: action.aiReason };
    case 'SET_REPLAY': return { ...state, replayData: action.data, playbackIdx: action.idx, phase: 'REPLAY', isPlaying: false };
    case 'TICK_REPLAY': return { ...state, playbackIdx: action.idx, replayData: action.data };
    case 'SET_PLAYING': return { ...state, isPlaying: action.playing };
    case 'SET_SPEED': return { ...state, speed: action.speed };
    case 'SET_BRACKET': return { ...state, slOffset: action.slOffset ?? state.slOffset, tpOffset: action.tpOffset ?? state.tpOffset };
    case 'EVALUATE':
      return {
        ...state,
        phase: state.mode === 'speed' ? (action.journalEntry.speedRunRound === state.speedRun.totalRounds ? 'SPEED_SUMMARY' : 'SPEED_RESULT') : 'RESULT',
        tradeResult: action.result,
        rMultiple: action.rMultiple,
        eloDelta: action.eloDelta,
        debriefAxes: action.debriefAxes,
        freezeUsedThisPuzzle: action.freezeUsed,
        freezeStreakValue: action.freezeStreakValue,
        skipModalOpen: false,
        skipReasonDraft: '',
        isPlaying: false,
        stats: action.nextStats,
        journal: clampJournal(action.nextJournal),
      };
    case 'START_SPEED_RUN':
      return {
        ...state,
        mode: 'speed',
        phase: 'DECISION',
        speedRun: { active: true, round: 1, totalRounds: action.totalRounds, correct: 0, processMatch: 0, rSum: 0, startedAt: action.now, deadlineAt: action.now + 15 * 60 * 1000, lastDurationMs: null },
        clockNow: action.now,
      };
    case 'SPEED_ROUND_RESULT': {
      const nextRound = state.speedRun.round + 1;
      const done = action.finished;
      return {
        ...state,
        speedRun: {
          ...state.speedRun,
          active: !done,
          round: nextRound,
          correct: state.speedRun.correct + (action.correct ? 1 : 0),
          processMatch: state.speedRun.processMatch + (action.processMatch ? 1 : 0),
          rSum: +(state.speedRun.rSum + action.r).toFixed(2),
          startedAt: done ? state.speedRun.startedAt : action.now,
          deadlineAt: state.speedRun.deadlineAt,
          lastDurationMs: action.durationMs,
        },
        phase: done ? 'SPEED_SUMMARY' : 'SPEED_RESULT',
      };
    }
    case 'END_SPEED_RUN': return { ...state, mode: 'standard', phase: 'HOME', speedRun: { ...state.speedRun, active: false } };
    case 'GO_HOME': return { ...state, phase: 'HOME', isPlaying: false, skipModalOpen: false, skipReasonDraft: '', speedRun: { ...state.speedRun, active: false } };
    case 'CLEAR_JOURNAL': return { ...state, journal: [] };
    case 'RESET_STATS':
      return { ...state, stats: { elo: 1236, solved: 0, correct: 0, processMatch: 0, streak: 0, bestStreak: 0, rSum: 0, breakdown: { bySetup: {}, byTimeframe: {}, byDirection: {}, byInstrument: {} }, freezeAvailable: 1, freezeUsedAt: 0 } };
    default: return state;
  }
}

export function buildNextStats(current: Stats, decision: Decision, aiDecision: Decision, result: string, r: number, setup: { id: string; en: string; pt: string }, timeframe: string, instrument: string): { stats: Stats; delta: number; freezeUsed: boolean; freezeStreak: number } {
  const processMatch = decision === aiDecision;
  const correct = result === 'WIN' || (result === 'SKIP' && decision === 'SKIP' && aiDecision === 'SKIP') || (result === 'FLATTEN' && r > 0 && processMatch);
  let delta = correct ? 18 : -15;
  if (result === 'FLATTEN' && r > 0) delta = 8;

  let streak = delta > 0 ? current.streak + 1 : 0;
  let freezeAvailable = current.freezeAvailable ?? 1;
  let freezeUsedAt = current.freezeUsedAt ?? 0;
  let freezeUsed = false;
  let freezeStreak = 0;
  const freezeReady = freezeAvailable > 0 || (freezeUsedAt > 0 && Date.now() - freezeUsedAt > FREEZE_WINDOW_MS);
  if (delta < 0 && current.streak > 0 && freezeReady) {
    streak = current.streak;
    freezeAvailable = 0;
    freezeUsedAt = Date.now();
    freezeUsed = true;
    freezeStreak = current.streak;
  } else if (freezeAvailable === 0 && freezeUsedAt > 0 && Date.now() - freezeUsedAt > FREEZE_WINDOW_MS) {
    freezeAvailable = 1;
    freezeUsedAt = 0;
  }

  const breakdown = cloneBreakdown(current.breakdown);
  const patch = { correct, processMatch, r };
  recordBucket(breakdown.bySetup, setup.id, patch, setup.en, setup.pt);
  recordBucket(breakdown.byTimeframe, timeframe, patch, timeframe, timeframe);
  recordBucket(breakdown.byDirection, decision, patch, decision, decision);
  recordBucket(breakdown.byInstrument, instrument, patch, instrument, instrument);
  return {
    stats: {
      ...current,
      elo: Math.max(0, current.elo + delta),
      solved: current.solved + 1,
      correct: current.correct + (correct ? 1 : 0),
      processMatch: current.processMatch + (processMatch ? 1 : 0),
      streak,
      bestStreak: Math.max(current.bestStreak, streak),
      rSum: +(current.rSum + r).toFixed(2),
      breakdown,
      freezeAvailable,
      freezeUsedAt,
    },
    delta,
    freezeUsed,
    freezeStreak,
  };
}
