
/*
 * Xadrez do Mercado
 * Independently developed by Pablo Phillipe Cândido dos Santos.
 * Generative AI tools were used as an auxiliary development resource; the author
 * remains responsible for conception, implementation, integration and verification.
 * Currículo Lattes: http://lattes.cnpq.br/9500873674712528
 */
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { analyzeDebrief, analyzePuzzle, computeMicrostructure, detectTrap, REF_SL, REF_TP, simulateSide } from './analytics';
import { generateMarketData, getDailyChallengeSeed, type GeneratorDifficulty } from './data';
import { PATTERN_CARDS } from './cards';
import { getAdaptiveDifficulty } from './difficulty';
import { buildNextStats, reducer } from './reducer';
import type { Action, AppState, Decision, Instrument, JournalEntry, Mode, Timeframe, TradeOutcome } from './types';
import { exportJournalCsv, exportJournalJson, isFreezeReady, loadJournal, loadLanguage, loadSoundPreference, loadStats, saveJournal, saveLanguage, saveSoundPreference, saveStats } from './storage';
import { translate, type TranslationKey } from './translations';
import TapeChart from './TapeChart';
import './styles.css';

const SPEED_TOTAL_ROUNDS=10;
const SPEED_SESSION_MS=15*60*1000;

type T=(key:TranslationKey,vars?:Record<string,string|number>)=>string;

function initialState():AppState{
  return {
    lang:loadLanguage(),soundEnabled:loadSoundPreference(),stats:loadStats(),journal:loadJournal(),
    timeframe:'15m',instrument:'MES',mode:'standard',showVwap:true,showEma:true,showDema:false,showLevels:true,showVol:true,contextMode:'full',
    phase:'HOME',puzzleData:{history:[],future:[],macroEvents:[]},replayData:[],aiData:null,userDecision:null,entryPrice:null,
    slOffset:REF_SL,tpOffset:REF_TP,playbackIdx:0,isPlaying:false,speed:3,tradeResult:null,rMultiple:0,eloDelta:0,
    debriefAxes:[],trap:null,skipReason:null,skipReasonMatch:null,aiSkipReason:null,freezeUsedThisPuzzle:false,freezeStreakValue:0,
    puzzleId:1000,dailyChallenge:false,dailyChallengeDate:null,speedRun:{active:false,round:0,totalRounds:SPEED_TOTAL_ROUNDS,correct:0,processMatch:0,rSum:0,startedAt:0,deadlineAt:0,lastDurationMs:null},
    reverseDecision:null,reverseReplayData:[],reversePlaybackIdx:0,reverseIsPlaying:false,reverseResult:null,reverseEntryPrice:null,
    skipModalOpen:false,skipReasonDraft:'',clockNow:Date.now(),
  };
}
function useI18n(lang:AppState['lang']):T{return useCallback((key:TranslationKey,vars?:Record<string,string|number>)=>translate(lang,key,vars),[lang]);}
function useSound(enabled:boolean){
  const tone=useCallback((f:number,d:number)=>{if(!enabled)return;try{const AC=window.AudioContext||(window as typeof window&{webkitAudioContext?:typeof AudioContext}).webkitAudioContext;if(!AC)return;const c=new AC(),o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.04,c.currentTime);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+d);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+d);window.setTimeout(()=>void c.close(),300);}catch{}},[enabled]);
  return useMemo(()=>({click:()=>tone(440,.04),win:()=>tone(740,.12),loss:()=>tone(180,.14),skip:()=>tone(330,.08),freeze:()=>tone(620,.16)}),[tone]);
}
function resultText(t:T,r:string|null){return r==='WIN'?t('resultWin'):r==='LOSS'?t('resultLoss'):r==='TIMEOUT'?t('resultTimeout'):r==='FLATTEN'?t('resultFlat'):t('resultSkip');}
function fmtR(r:number){return (r>=0?'+':'')+r.toFixed(2)+'R';}
function fmtDuration(ms:number){const s=Math.max(0,Math.round(ms/1000)),m=Math.floor(s/60);return m+':'+String(s%60).padStart(2,'0');}
function fmtSessionTime(ts:number|null){if(ts===null)return '—';const d=new Date(ts*1000);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}
function hasRecentLoss(journal:JournalEntry[]){return journal.length>0&&journal[journal.length-1].outcome==='LOSS';}
function localDateKey(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function formatPct(value:number){return Math.round(value*100)+'%';}
function rank(elo:number,t:T){return elo<1180?t('rankNovice'):elo<1260?t('rankDeveloping'):elo<1360?t('rankConsistent'):elo<1480?t('rankSharp'):t('rankInstitutional');}
function Toggle({active,children,onClick}:{active:boolean;children:ReactNode;onClick:()=>void}){return <button className={'toggle '+(active?'active':'')} onClick={onClick}>{children}</button>;}

function WeakSpots({state,t}:{state:AppState;t:T}){
  const groups=[state.stats.breakdown.bySetup,state.stats.breakdown.byTimeframe,state.stats.breakdown.byDirection,state.stats.breakdown.byInstrument];
  const buckets=groups.flatMap(g=>Object.entries(g).map(([id,b])=>({id,b}))).filter(x=>x.b.samples>=2).sort((a,b)=>a.b.processMatch/b.b.samples-b.b.processMatch/b.b.samples).slice(0,6);
  return <section className="panel"><div className="panel-title">{t('weakSpots')}</div><p className="muted">{t('weakSpotsHint')}</p>{!buckets.length?<p className="muted">{t('noWeakSpots')}</p>:<div className="weak-list">{buckets.map(x=>{const p=Math.round(x.b.processMatch/x.b.samples*100);return <div className="weak-row" key={x.id}><span>{state.lang==='pt'?x.b.labelPt:x.b.labelEn}</span><b>{p}%</b><small>{x.b.samples} {t('samples')}</small></div>;})}</div>}</section>;
}

function Home({state,t,dispatch,start,startDaily}:{state:AppState;t:T;dispatch:(a:Action)=>void;start:(m:Mode)=>void;startDaily:()=>void}){
  const acc=state.stats.solved?Math.round(state.stats.correct/state.stats.solved*100):0;
  const proc=state.stats.solved?Math.round(state.stats.processMatch/state.stats.solved*100):0;
  const modes:[Mode,string,string][]=[['standard',t('standard'),t('modeStandardDesc')],['blind',t('blind'),t('modeBlindDesc')],['speed',t('speedRun'),t('modeSpeedDesc')]];
  const collected=new Set(state.stats.collectedCards??[]);
  return <main className="home-shell"><header className="home-header"><div className="brand"><div className="brand-mark">XM</div><div><strong>{t('appName')}</strong><small>{t('syntheticData')}</small></div></div><div className="top-actions"><button className="seg-button" onClick={()=>dispatch({type:'SET_LANG',lang:state.lang==='en'?'pt':'en'})}>{state.lang==='en'?'PT-BR':'EN'}</button><button className="seg-button" onClick={()=>dispatch({type:'SET_SOUND',enabled:!state.soundEnabled})}>{state.soundEnabled?'🔊':'🔇'}</button></div></header>
  <section className="hero"><p className="eyebrow">{t('trainingTool')}</p><h1>{t('tagline')}</h1><p>{t('heroSubtitle')}</p><div className="mode-grid">{modes.map(([m,title,desc])=><button className={'mode-card '+(state.mode===m?'selected':'')} key={m} onClick={()=>dispatch({type:'SET_MODE',mode:m})}><strong>{title}</strong><span>{desc}</span><b>{state.mode===m?'✓':'→'}</b></button>)}</div><button className="primary big" onClick={()=>start(state.mode)}>{state.mode==='speed'?t('startSpeedRun'):state.mode==='blind'?t('startBlind'):t('startTraining')} →</button></section>
  <section className="daily-card"><div><div className="eyebrow">{t('dailyChallenge')}</div><strong>{t('dailyChallengeTitle')}</strong><p>{t('dailyChallengeHint')}</p></div><button className="primary" onClick={startDaily}>{t('startDaily')}</button></section>
  <section className="panel settings"><div className="panel-title">{t('mode')} · {t('instrument')} / {t('timeframe')}</div><div className="setting-grid"><label>{t('instrument')}<select value={state.instrument} onChange={(e:ChangeEvent<HTMLSelectElement>)=>dispatch({type:'SET_INSTRUMENT',instrument:e.target.value as Instrument})}><option value="MES">MES</option><option value="MNQ">MNQ</option><option value="WINFUT">WINFUT</option><option value="WDOFUT">WDOFUT</option><option value="BIT">BIT</option></select></label><label>{t('timeframe')}<select value={state.timeframe} onChange={(e:ChangeEvent<HTMLSelectElement>)=>dispatch({type:'SET_TIMEFRAME',timeframe:e.target.value as Timeframe})}><option>1m</option><option>5m</option><option>15m</option><option>1h</option></select></label><div><span>{t('showIndicators')}</span><div className="toggles"><Toggle active={state.showVwap} onClick={()=>dispatch({type:'TOGGLE_INDICATOR',key:'showVwap'})}>{t('vwap')}</Toggle><Toggle active={state.showEma} onClick={()=>dispatch({type:'TOGGLE_INDICATOR',key:'showEma'})}>{t('ema')}</Toggle><Toggle active={state.showDema} onClick={()=>dispatch({type:'TOGGLE_INDICATOR',key:'showDema'})}>{t('dema')}</Toggle><Toggle active={state.showLevels} onClick={()=>dispatch({type:'TOGGLE_INDICATOR',key:'showLevels'})}>{t('levels')}</Toggle><Toggle active={state.showVol} onClick={()=>dispatch({type:'TOGGLE_INDICATOR',key:'showVol'})}>{t('volumeOnChart')}</Toggle></div></div><div className="context-mode-control"><span>{t('contextMode')}</span><div className="toggles"><Toggle active={state.contextMode==='full'} onClick={()=>dispatch({type:'SET_CONTEXT_MODE',contextMode:'full'})}>{t('fullContext')}</Toggle><Toggle active={state.contextMode==='structure'} onClick={()=>dispatch({type:'SET_CONTEXT_MODE',contextMode:'structure'})}>{t('onlyStructure')}</Toggle></div><small>{t('structureModeHint')}</small></div></div></section>
  <section className="three-grid"><div className="info-card"><b>1</b><div><strong>{t('step1Title')}</strong><p>{t('step1Text')}</p></div></div><div className="info-card"><b>2</b><div><strong>{t('step2Title')}</strong><p>{t('step2Text')}</p></div></div><div className="info-card"><b>3</b><div><strong>{t('step3Title')}</strong><p>{t('step3Text')}</p></div></div></section>
  <section className="two-grid"><div className="panel"><div className="panel-title">{t('yourProgress')}</div><div className="progress-head"><div className="rank-badge">{state.stats.elo}</div><div><strong>{rank(state.stats.elo,t)}</strong><small>{t('elo')}</small></div><span className="freeze-pill">❄ {isFreezeReady(state.stats)?'1':'0'}</span></div><div className="stat-grid"><Stat label={t('process')} value={proc+'%'}/><Stat label={t('accuracy')} value={acc+'%'}/><Stat label={t('solved')} value={String(state.stats.solved)}/><Stat label={t('streak')} value={String(state.stats.streak)}/><Stat label={t('tradesR')} value={fmtR(state.stats.rSum)}/></div><div className="panel-actions"><button className="ghost" disabled={!state.stats.solved} onClick={()=>{if(window.confirm(t('confirmReset')))dispatch({type:'RESET_STATS'});}}>{t('resetStats')}</button></div></div><WeakSpots state={state} t={t}/></section>
  <section className="panel"><div className="panel-title">{t('patternCards')} <span className="muted">{t('patternCardsCount',{n:collected.size,m:PATTERN_CARDS.length})}</span></div><div className="card-grid">{PATTERN_CARDS.map(card=><div className={'pattern-card '+(collected.has(card.id)?'collected':'locked')} key={card.id}><b>{collected.has(card.id)?'◆':'◇'}</b><strong>{collected.has(card.id)?(state.lang==='pt'?card.pt:card.en):t('lockedCard')}</strong></div>)}</div></section>
  <section className="panel"><div className="panel-title">{t('journal')} <span className="muted">{t('journalCount',{n:state.journal.length})}</span></div><div className="journal-actions"><button className="ghost" disabled={!state.journal.length} onClick={()=>exportJournalJson(state.journal)}>{t('exportJson')}</button><button className="ghost" disabled={!state.journal.length} onClick={()=>exportJournalCsv(state.journal)}>{t('exportCsv')}</button><button className="danger-link" disabled={!state.journal.length} onClick={()=>{if(window.confirm(t('confirmClearJournal')))dispatch({type:'CLEAR_JOURNAL'});}}>{t('clearJournal')}</button></div><div className="journal-list">{state.journal.slice(-8).reverse().map(e=><div className="journal-row" key={e.ts+'-'+e.puzzleId}><span>{e.dailyChallenge?'★ '+t('dailyChallenge') : e.mode}</span><b>{e.decision}</b><span>{fmtR(e.r)}</span><span>{e.processMatch?'✓':'—'}</span></div>)}</div>{!state.journal.length&&<p className="muted">{t('noJournal')}</p>}</section>
  </main>;
}

function Stat({label,value}:{label:string;value:string}){return <div><span>{label}</span><strong>{value}</strong></div>;}

function ResultPanel({state,t,onNext,onReverse}:{state:AppState;t:T;onNext:()=>void;onReverse:(decision:Decision)=>void}){
  if(!state.aiData)return null;
  const user=state.userDecision??'SKIP';
  const accepted=state.aiData.acceptedDecisions;
  return <div className="result-box"><div className="result-head"><div><div className="eyebrow">{t('result')}</div><h2>{resultText(t,state.tradeResult)}</h2></div><strong className={state.eloDelta>=0?'good':'bad'}>{state.eloDelta>=0?'+':''}{state.eloDelta} ELO</strong></div>
  <div className="result-meta"><span>{t('yourTrade')}: <b>{user}</b></span><span>{t('correctMove')}: <b>{state.aiData.decision}</b></span><span>{fmtR(state.rMultiple)}</span></div>
  <div className="validation-box"><div className="section-title">{t('analystValidation')}</div><div className="validation-grid"><div><span>{t('signalConfidence')}</span><b>{formatPct(state.aiData.signalConfidence)}</b></div><div><span>{t('acceptedDecisions')}</span><b>{accepted.join(' / ')}</b></div></div><p>{t('hindsightGuard')}</p></div>
  <div className="counterfactual"><div className="section-title">{t('counterfactual')}</div>{(['LONG','SHORT','SKIP'] as Decision[]).map(d=><div className={'cf-row '+(d===user?'selected':'')} key={d}><span>{d}</span><b>{d==='SKIP'?'0.00R':fmtR(state.aiData!.outcomes[d].r)}</b><small>{state.aiData!.outcomes[d].result}</small></div>)}</div>
  <div className="debrief"><div className="section-title">{t('whyNotOther')}</div>{state.debriefAxes.map(a=><div className="axis" key={a.axis}><div className="axis-label"><span>{t(('axis'+a.axis.charAt(0).toUpperCase()+a.axis.slice(1)) as TranslationKey)}</span><i className={a.bias==='long'?'long-dot':a.bias==='short'?'short-dot':'neutral'}></i></div><p>{state.lang==='pt'?a.textPt:a.textEn}</p></div>)}</div>
  {state.trap&&<div className="trap-box"><strong>{t('trapOfDay')}</strong><p>{state.lang==='pt'?state.trap.messagePt:state.trap.messageEn}</p></div>}
  {state.skipReason&&<div className="trap-box"><strong>{t('skipReasonLabel')}</strong><p>{({'bad-setup':t('skipBadSetup'),'far-vwap':t('skipFarFromVwap'),'against-trend':t('skipAgainstTrend'),'no-confluence':t('skipNoConfluence'),'unsure':t('skipUnsure')} as Record<string,string>)[state.skipReason] ?? state.skipReason} · {state.skipReasonMatch?'✓':'—'}</p></div>}
  {state.freezeUsedThisPuzzle&&<div className="freeze-banner">❄ {t('freezeUsed')}</div>}
  <div className="reverse-explore"><div className="section-title">{t('reverseExplore')}</div><p>{t('reverseExploreHint')}</p><div className="reverse-buttons"><button className="ghost" onClick={()=>onReverse('LONG')}>{t('exploreLong')}</button><button className="ghost" onClick={()=>onReverse('SHORT')}>{t('exploreShort')}</button><button className="ghost" onClick={()=>onReverse('SKIP')}>{t('exploreSkip')}</button></div></div>
  <button className="primary full" onClick={onNext}>{state.dailyChallenge?t('finishDaily'):t('nextPuzzle')} {state.dailyChallenge?'':'→'}</button></div>;
}


function ReverseReplayPanel({state,t,onStep,onBack,onPlay,onFlatten,onSpeed}:{state:AppState;t:T;onStep:()=>void;onBack:()=>void;onPlay:()=>void;onFlatten:()=>void;onSpeed:(speed:number)=>void}){
  const d=state.reverseDecision;
  const entry=state.reverseEntryPrice;
  const sl=entry!==null&&d&&d!=='SKIP'?(d==='LONG'?entry-state.slOffset:entry+state.slOffset):null;
  const tp=entry!==null&&d&&d!=='SKIP'?(d==='LONG'?entry+state.tpOffset:entry-state.tpOffset):null;
  return <div className="reverse-panel-wrap"><div className="reverse-banner"><strong>{t('reverseExplore')}</strong><span>{t('reverseNotCounted')}</span></div><div className="result-box reverse-box"><div className="result-head"><div><div className="eyebrow">{t('reverseReplay')}</div><h2>{d}</h2></div><span className="muted">{t('notCounted')}</span></div><div className="bracket"><span>{t('entry')} <b>{entry?.toFixed(2)}</b></span><span>{t('stop')} <b className="bad">{sl?.toFixed(2)??'—'}</b></span><span>{t('target')} <b className="good">{tp?.toFixed(2)??'—'}</b></span></div>{state.reverseResult&&<div className="reverse-result"><strong>{resultText(t,state.reverseResult)}</strong><span>{t('reverseResultHint')}</span></div>}<div className="replay-actions"><button className="primary" disabled={!!state.reverseResult} onClick={onPlay}>{state.reverseIsPlaying?t('pause'):t('play')}</button><button className="ghost" disabled={!!state.reverseResult||state.reverseIsPlaying} onClick={onStep}>{t('step')}</button><button className="danger" disabled={!!state.reverseResult||d==='SKIP'} onClick={onFlatten}>{t('flatten')}</button></div><div className="speed-buttons">{[1,3,10,30].map(s=><Toggle key={s} active={state.speed===s} onClick={()=>state.reverseResult?undefined:onSpeed(s)}>{s}x</Toggle>)}</div><button className="ghost full" onClick={onBack}>{t('backToResult')}</button></div></div>;
}

function App(){
  const [state,dispatch]=useReducer(reducer,undefined,initialState);const t=useI18n(state.lang);const sound=useSound(state.soundEnabled);const speedLock=useRef(false);
  useEffect(()=>{saveLanguage(state.lang);document.documentElement.lang=state.lang==='pt'?'pt-BR':'en';},[state.lang]);
  useEffect(()=>saveSoundPreference(state.soundEnabled),[state.soundEnabled]);
  useEffect(()=>saveStats(state.stats),[state.stats]);
  useEffect(()=>saveJournal(state.journal),[state.journal]);

  useEffect(()=>{if(state.mode!=='speed'||state.phase!=='DECISION')return;const id=window.setInterval(()=>dispatch({type:'CLOCK_TICK',now:Date.now()}),250);return()=>window.clearInterval(id);},[state.mode,state.phase,state.speedRun.deadlineAt]);
  const adaptiveProfile=getAdaptiveDifficulty(state.journal);
  const adaptiveDifficulty=adaptiveProfile.key;
  const generatePuzzle=useCallback((seed:number,difficulty:GeneratorDifficulty='normal')=>generateMarketData(state.timeframe,state.instrument,seed,difficulty),[state.instrument,state.timeframe]);
  const newPuzzle=useCallback((speedNow?:number)=>{
    const id=state.puzzleId+1,difficulty=getAdaptiveDifficulty(state.journal).key,seed=Date.now()+id*101,data=generatePuzzle(seed,difficulty);
    dispatch({type:'LOAD_PUZZLE',data,analysis:analyzePuzzle(data.history,data.future),trap:detectTrap(data.history),puzzleId:id,speedNow});
    speedLock.current=false;
  },[generatePuzzle,state.journal,state.puzzleId]);
  const start=useCallback((mode:Mode)=>{
    const now=Date.now();sound.click();
    if(mode==='speed')dispatch({type:'START_SPEED_RUN',totalRounds:SPEED_TOTAL_ROUNDS,now});
    dispatch({type:'SET_DAILY_CONTEXT',active:false,date:null});
    dispatch({type:'SET_MODE',mode});
    const id=state.puzzleId+1,difficulty=getAdaptiveDifficulty(state.journal).key,data=generatePuzzle(now+id*101,difficulty);
    dispatch({type:'LOAD_PUZZLE',data,analysis:analyzePuzzle(data.history,data.future),trap:detectTrap(data.history),puzzleId:id,speedNow:mode==='speed'?now:undefined});
    speedLock.current=false;
  },[generatePuzzle,sound,state.journal,state.puzzleId]);
  const startDaily=useCallback(()=>{
    const date=localDateKey(),seed=getDailyChallengeSeed(new Date()),id=state.puzzleId+1,data=generatePuzzle(seed,'normal');
    sound.click();
    dispatch({type:'SET_DAILY_CONTEXT',active:true,date});
    dispatch({type:'SET_MODE',mode:'standard'});
    dispatch({type:'LOAD_PUZZLE',data,analysis:analyzePuzzle(data.history,data.future),trap:detectTrap(data.history),puzzleId:id});
    speedLock.current=false;
  },[generatePuzzle,sound,state.puzzleId]);
  const finish=useCallback((result:Exclude<AppState['tradeResult'],null>,r:number,extra?:{skipReason?:string;skipReasonMatch?:boolean})=>{
    if(!state.aiData||!state.userDecision)return;
    const difficulty=state.dailyChallenge?'normal':adaptiveDifficulty;
    const built=buildNextStats(state.stats,state.userDecision,state.aiData.decision,result,r,state.aiData.setup,state.timeframe,state.instrument,state.aiData.acceptedDecisions,difficulty);
    const entry:JournalEntry={ts:Date.now(),puzzleId:state.puzzleId,instrument:state.instrument,timeframe:state.timeframe,mode:state.mode,setup:{id:state.aiData.setup.id,en:state.aiData.setup.en,pt:state.aiData.setup.pt},decision:state.userDecision,aiDecision:state.aiData.decision,processMatch:state.aiData.acceptedDecisions.includes(state.userDecision),outcome:result,r:Number(r.toFixed(2)),entry:state.entryPrice,slOffset:state.slOffset,tpOffset:state.tpOffset,skipReason:extra?.skipReason??null,skipReasonMatch:extra?.skipReasonMatch??null,trap:state.trap?.key??null,freezeUsed:built.freezeUsed,speedRunRound:null,speedRunDurationMs:null,dailyChallenge:state.dailyChallenge};
    dispatch({type:'EVALUATE',result,rMultiple:r,eloDelta:built.delta,journalEntry:entry,debriefAxes:analyzeDebrief(state.puzzleData.history,state.aiData.decision),freezeUsed:built.freezeUsed,freezeStreakValue:built.freezeStreak,nextStats:built.stats,nextJournal:[...state.journal,entry].slice(-200)});
    if(result==='WIN')sound.win();else if(result==='LOSS')sound.loss();else if(result==='SKIP')sound.skip();if(built.freezeUsed)sound.freeze();
  },[adaptiveDifficulty,sound,state]);
  const settleSpeed=useCallback((decision:Decision,durationMs:number)=>{if(speedLock.current||!state.aiData)return;speedLock.current=true;const outcome:TradeOutcome=decision==='SKIP'?{result:'SKIP',r:0,bars:0,exit:state.aiData.entryPrice}:simulateSide(state.puzzleData.future,state.aiData.entryPrice,decision,REF_SL,REF_TP);const finished=state.speedRun.round>=state.speedRun.totalRounds||Date.now()>=state.speedRun.deadlineAt;const built=buildNextStats(state.stats,decision,state.aiData.decision,outcome.result,outcome.r,state.aiData.setup,state.timeframe,state.instrument,state.aiData.acceptedDecisions,adaptiveDifficulty);const entry:JournalEntry={ts:Date.now(),puzzleId:state.puzzleId,instrument:state.instrument,timeframe:state.timeframe,mode:'speed',setup:{id:state.aiData.setup.id,en:state.aiData.setup.en,pt:state.aiData.setup.pt},decision,aiDecision:state.aiData.decision,processMatch:state.aiData.acceptedDecisions.includes(decision),outcome:outcome.result,r:Number(outcome.r.toFixed(2)),entry:state.aiData.entryPrice,slOffset:REF_SL,tpOffset:REF_TP,skipReason:null,skipReasonMatch:null,trap:state.trap?.key??null,freezeUsed:built.freezeUsed,speedRunRound:state.speedRun.round,speedRunDurationMs:durationMs,dailyChallenge:false};dispatch({type:'EVALUATE',result:outcome.result,rMultiple:outcome.r,eloDelta:built.delta,journalEntry:entry,debriefAxes:[],freezeUsed:built.freezeUsed,freezeStreakValue:built.freezeStreak,nextStats:built.stats,nextJournal:[...state.journal,entry].slice(-200)});dispatch({type:'SPEED_ROUND_RESULT',correct:decision===state.aiData.decision,processMatch:state.aiData.acceptedDecisions.includes(decision),r:outcome.r,durationMs,finished,now:Date.now()});if(outcome.result==='WIN')sound.win();else if(outcome.result==='LOSS')sound.loss();else sound.skip();if(built.freezeUsed)sound.freeze();if(!finished)window.setTimeout(()=>newPuzzle(Date.now()),250);},[newPuzzle,sound,state]);
  const handleDecision=useCallback((decision:Decision)=>{if(state.phase!=='DECISION'||!state.aiData)return;sound.click();if(state.mode==='speed'){settleSpeed(decision,Math.max(0,Math.min(SPEED_SESSION_MS,Date.now()-state.speedRun.startedAt)));return;}dispatch({type:'SET_DECISION',decision,entryPrice:state.aiData.entryPrice});if(decision==='SKIP')dispatch({type:'OPEN_SKIP'});else dispatch({type:'TICK_REPLAY',idx:0,data:[]});},[settleSpeed,sound,state.aiData,state.mode,state.phase,state.speedRun.startedAt]);
  const startReverse=useCallback((decision:Decision)=>{dispatch({type:'REVERSE_START',decision});},[]);
  const finishReverseWithFlatten=useCallback(()=>{if(state.phase!=='REVERSE_REPLAY'||!state.reverseDecision||state.reverseDecision==='SKIP'||state.reverseResult||state.reverseEntryPrice===null)return;const b=state.reverseReplayData.at(-1)??state.puzzleData.future[0];if(!b)return;const diff=state.reverseDecision==='LONG'?b.close-state.reverseEntryPrice:state.reverseEntryPrice-b.close;void diff;dispatch({type:'REVERSE_FINISH',result:'FLATTEN'});},[state]);
  const submitSkip=useCallback(()=>{if(!state.skipReasonDraft||!state.aiData)return;const aiNoEdge=state.aiData.setup.bias==='skip',match=aiNoEdge&&state.skipReasonDraft==='no-confluence';const reason=aiNoEdge?'No clean directional edge.':'The setup lacked a clean directional edge.';dispatch({type:'SET_SKIP_REASON',reason:state.skipReasonDraft,match,aiReason:reason});dispatch({type:'CLOSE_SKIP'});finish('SKIP',0,{skipReason:state.skipReasonDraft,skipReasonMatch:match});},[finish,state.aiData,state.skipReasonDraft]);
  const advanceReplay=useCallback(()=>{if(state.phase!=='REPLAY'||!state.userDecision||state.userDecision==='SKIP')return;const i=state.playbackIdx,b=state.puzzleData.future[i];if(!b)return;dispatch({type:'TICK_REPLAY',idx:i+1,data:[...state.replayData,b]});const entry=state.entryPrice!;const sl=state.userDecision==='LONG'?entry-state.slOffset:entry+state.slOffset,tp=state.userDecision==='LONG'?entry+state.tpOffset:entry-state.tpOffset;if((state.userDecision==='LONG'?b.low<=sl:b.high>=sl)){finish('LOSS',-1);return;}if((state.userDecision==='LONG'?b.high>=tp:b.low<=tp)){finish('WIN',Number((state.tpOffset/state.slOffset).toFixed(2)));return;}if(i+1>=state.puzzleData.future.length){const diff=state.userDecision==='LONG'?b.close-entry:entry-b.close;finish('TIMEOUT',Number((diff/state.slOffset).toFixed(2)));}},[finish,state]);
  useEffect(()=>{if(state.phase!=='REPLAY'||!state.isPlaying)return;const id=window.setInterval(advanceReplay,Math.max(55,430/state.speed));return()=>window.clearInterval(id);},[advanceReplay,state.phase,state.isPlaying,state.speed]);

  const advanceReverseReplay=useCallback(()=>{
    if(state.phase!=='REVERSE_REPLAY'||!state.reverseDecision||state.reverseResult)return;
    const i=state.reversePlaybackIdx,b=state.puzzleData.future[i];
    if(!b)return;
    const nextData=[...state.reverseReplayData,b];
    dispatch({type:'REVERSE_TICK',idx:i+1,data:nextData});
    if(state.reverseDecision==='SKIP'){
      if(i+1>=state.puzzleData.future.length)dispatch({type:'REVERSE_FINISH',result:'SKIP'});
      return;
    }
    const entry=state.reverseEntryPrice;
    if(entry===null)return;
    const sl=state.reverseDecision==='LONG'?entry-state.slOffset:entry+state.slOffset;
    const tp=state.reverseDecision==='LONG'?entry+state.tpOffset:entry-state.tpOffset;
    const hitSL=state.reverseDecision==='LONG'?b.low<=sl:b.high>=sl;
    const hitTP=state.reverseDecision==='LONG'?b.high>=tp:b.low<=tp;
    if(hitSL){dispatch({type:'REVERSE_FINISH',result:'LOSS'});return;}
    if(hitTP){dispatch({type:'REVERSE_FINISH',result:'WIN'});return;}
    if(i+1>=state.puzzleData.future.length)dispatch({type:'REVERSE_FINISH',result:'TIMEOUT'});
  },[state]);

  useEffect(()=>{if(state.phase!=='REVERSE_REPLAY'||!state.reverseIsPlaying||state.reverseResult)return;const id=window.setInterval(advanceReverseReplay,Math.max(55,430/state.speed));return()=>window.clearInterval(id);},[advanceReverseReplay,state.phase,state.reverseIsPlaying,state.reverseResult,state.speed]);


  useEffect(()=>{if(state.mode!=='speed'||state.phase!=='DECISION'||!state.speedRun.active)return;if(state.clockNow>=state.speedRun.deadlineAt&&!speedLock.current)settleSpeed('SKIP',Math.max(0,state.speedRun.deadlineAt-state.speedRun.startedAt));},[settleSpeed,state.clockNow,state.mode,state.phase,state.speedRun.active,state.speedRun.deadlineAt]);
  useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if((e.target as HTMLElement)?.matches('input,select,button,textarea'))return;const k=e.key.toLowerCase();if(state.phase==='DECISION'&&k==='l')handleDecision('LONG');else if(state.phase==='DECISION'&&k==='s')handleDecision('SHORT');else if(state.phase==='DECISION'&&k==='k')handleDecision('SKIP');else if(state.phase==='REPLAY'&&e.code==='Space'){e.preventDefault();dispatch({type:'SET_PLAYING',playing:!state.isPlaying});}else if(state.phase==='REPLAY'&&k==='f'){const b=state.replayData.at(-1)??state.puzzleData.history.at(-1);if(b&&state.entryPrice&&state.userDecision&&state.userDecision!=='SKIP'){const diff=state.userDecision==='LONG'?b.close-state.entryPrice:state.entryPrice-b.close;finish('FLATTEN',Number((diff/state.slOffset).toFixed(2)));}}else if(state.phase==='RESULT'&&k==='n')newPuzzle();else if(e.key==='Escape')dispatch({type:'GO_HOME'});};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);},[finish,handleDecision,newPuzzle,state]);
  const slPrice=state.entryPrice!==null&&state.userDecision&&state.userDecision!=='SKIP'?(state.userDecision==='LONG'?state.entryPrice-state.slOffset:state.entryPrice+state.slOffset):null,tpPrice=state.entryPrice!==null&&state.userDecision&&state.userDecision!=='SKIP'?(state.userDecision==='LONG'?state.entryPrice+state.tpOffset:state.entryPrice-state.tpOffset):null;
  if(state.phase==='HOME')return <Home state={state} t={t} dispatch={dispatch} start={start} startDaily={startDaily}/>;
  const blind=state.mode==='blind'&&state.phase==='DECISION',bars=state.phase==='REVERSE_REPLAY'?[...state.puzzleData.history,...state.reverseReplayData]:[...state.puzzleData.history,...state.replayData],showContext=state.contextMode==='full'||state.phase!=='DECISION',chartEntry=state.phase==='REVERSE_REPLAY'?state.reverseEntryPrice:state.entryPrice,chartSl=state.phase==='REVERSE_REPLAY'&&state.reverseEntryPrice!==null&&state.reverseDecision&&state.reverseDecision!=='SKIP'?(state.reverseDecision==='LONG'?state.reverseEntryPrice-state.slOffset:state.reverseEntryPrice+state.slOffset):slPrice,chartTp=state.phase==='REVERSE_REPLAY'&&state.reverseEntryPrice!==null&&state.reverseDecision&&state.reverseDecision!=='SKIP'?(state.reverseDecision==='LONG'?state.reverseEntryPrice+state.tpOffset:state.reverseEntryPrice-state.tpOffset):tpPrice,remaining=Math.max(0,state.speedRun.deadlineAt-state.clockNow),rm=Math.floor(remaining/60000),rs=Math.floor(remaining%60000/1000);
  const timeLabel=rm+':'+String(rs).padStart(2,'0');
  const revengeWarning=state.phase==='DECISION'&&state.mode!=='speed'&&hasRecentLoss(state.journal);
  const visibleBar=bars.at(-1);
  const sessionClock=visibleBar?fmtSessionTime(visibleBar.time):'—';
  const activeMacro=state.puzzleData.macroEvents.filter(e=>bars.length>=state.puzzleData.history.length+e.index).at(-1);
  const levels=state.aiData?.levels;
  const micro=computeMicrostructure(bars);
  const setupLabel=state.aiData?(state.lang==='pt'?state.aiData.setup.pt:state.aiData.setup.en):'—';
  return <div className="app-shell"><header className="app-bar"><button className="home-link" onClick={()=>dispatch({type:'GO_HOME'})}>← {t('trainingModes')}</button><div className="app-center"><strong>{t('appName')}</strong><span>{state.instrument} · {state.timeframe} · {state.mode==='blind'?t('blind'):state.mode==='speed'?t('speedRun'):t('standard')}</span></div><div className="difficulty-badge" title={t('difficultyProcessHint')}>{t('difficulty')}: {t(('difficulty'+adaptiveDifficulty.charAt(0).toUpperCase()+adaptiveDifficulty.slice(1)) as TranslationKey)}</div>{!blind&&<div className="session-clock" title={t('sessionClockHint')}><span>{t('sessionClock')}</span><strong>{sessionClock}</strong></div>}<div className="app-actions"><button onClick={()=>dispatch({type:'SET_LANG',lang:state.lang==='en'?'pt':'en'})}>{state.lang==='en'?'PT':'EN'}</button><button onClick={()=>dispatch({type:'SET_SOUND',enabled:!state.soundEnabled})}>{state.soundEnabled?'🔊':'🔇'}</button></div></header>
  {state.mode==='speed'&&state.phase!=='SPEED_SUMMARY'&&<div className="speed-strip"><span>{t('round')} {Math.min(state.speedRun.round,state.speedRun.totalRounds)} {t('of')} {state.speedRun.totalRounds}</span><strong className={'timer '+(remaining<=60000?'danger':'')}>{timeLabel}</strong><div className="timer-bar"><div style={{width:Math.max(0,Math.min(100,remaining/SPEED_SESSION_MS*100))}}/></div></div>}
  {state.phase!=='SPEED_SUMMARY'&&<div className="workspace"><section className="chart-panel"><div className="chart-top"><span>{state.phase==='DECISION'?t('decision'):state.phase==='REPLAY'?t('replay'):state.phase==='REVERSE_REPLAY'?t('reverseReplay'):t('result')}</span><span className="mono">#{state.puzzleId}</span></div><TapeChart bars={bars} showVwap={state.showVwap} showEma={state.showEma} showDema={state.showDema} showLevels={state.showLevels} showVol={state.showVol} blind={blind} entryPrice={chartEntry} slPrice={chartSl} tpPrice={chartTp} sessionLevels={levels}/></section>
  <aside className="side-panel">{revengeWarning&&<div className="revenge-warning"><strong>{t('revengeWarningTitle')}</strong><span>{t('revengeWarningText')}</span></div>}{!blind&&showContext&&<div className="context-box"><div className="section-title">{t('marketContext')}</div><div className="context-grid"><div><span>{t('range')}</span><strong>{state.aiData?.range.toFixed(1)} pts</strong></div><div><span>{t('atr')}</span><strong>{state.aiData?.atr.toFixed(1)} pts</strong></div><div><span>{t('priceVsVwap')}</span><strong>{state.aiData?.vwapDir} {state.aiData?.distVwapAbs.toFixed(1)}</strong></div><div><span>{t('playbook')}</span><strong>{setupLabel}</strong></div><div><span>{t('rthHigh')}</span><strong>{levels?.rthHigh?.toFixed(2)??'—'}</strong></div><div><span>{t('rthLow')}</span><strong>{levels?.rthLow?.toFixed(2)??'—'}</strong></div><div><span>{t('ethHigh')}</span><strong>{levels?.ethHigh?.toFixed(2)??'—'}</strong></div><div><span>{t('ethLow')}</span><strong>{levels?.ethLow?.toFixed(2)??'—'}</strong></div></div><div className="micro-box"><div className="section-title">{t('microstructure')}</div><div className="micro-grid"><span>{t('buyVolume')}: <b>{micro?.buyVolume.toLocaleString()}</b></span><span>{t('sellVolume')}: <b>{micro?.sellVolume.toLocaleString()}</b></span><span>{t('delta')}: <b className={micro&&micro.delta>=0?'good':'bad'}>{micro?.delta.toLocaleString()}</b></span><span>{t('aggressor')}: <b>{micro?.aggressor}</b></span></div><small>{t('syntheticMicrostructureHint')}</small></div>{activeMacro&&<div className="macro-event"><strong>{state.lang==='pt'?activeMacro.labelPt:activeMacro.labelEn}</strong><span>{activeMacro.kind} · {t('macroEventHighImpact')}</span></div></div>}{blind&&<div className="blind-card"><div className="blind-badge">{t('blindBadge')}</div><strong>{t('blind')}</strong><p>{t('blindHint')}</p></div>}
  {state.phase==='DECISION'&&<div className="decision-box"><div className="section-title">{t('decisionQ')}</div><div className="decision-grid"><button className="long" onClick={()=>handleDecision('LONG')}>{t('long')}</button><button className="short" onClick={()=>handleDecision('SHORT')}>{t('short')}</button><button className="skip" onClick={()=>handleDecision('SKIP')}>{t('skip')}</button></div><small>{t('shortcuts')}</small></div>}
  {state.phase==='REPLAY'&&<div className="replay-box"><div className="bracket"><span>{t('entry')} <b>{state.entryPrice?.toFixed(2)}</b></span><span>{t('stop')} <b className="bad">{slPrice?.toFixed(2)}</b></span><span>{t('target')} <b className="good">{tpPrice?.toFixed(2)}</b></span></div><label><span>{t('stopLoss')} <b>{state.slOffset} pts</b></span><input type="range" min="4" max="40" value={state.slOffset} onChange={(e:ChangeEvent<HTMLInputElement>)=>dispatch({type:'SET_BRACKET',slOffset:Number(e.target.value)})}/></label><label><span>{t('takeProfit')} <b>{state.tpOffset} pts</b></span><input type="range" min="8" max="80" value={state.tpOffset} onChange={(e:ChangeEvent<HTMLInputElement>)=>dispatch({type:'SET_BRACKET',tpOffset:Number(e.target.value)})}/></label><div className="replay-actions"><button className="primary" onClick={()=>dispatch({type:'SET_PLAYING',playing:!state.isPlaying})}>{state.isPlaying?t('pause'):t('play')}</button><button className="ghost" disabled={state.isPlaying} onClick={advanceReplay}>{t('step')}</button><button className="danger" onClick={()=>{const b=state.replayData.at(-1)??state.puzzleData.history.at(-1);if(!b||state.entryPrice===null||!state.userDecision||state.userDecision==='SKIP')return;const diff=state.userDecision==='LONG'?b.close-state.entryPrice:state.entryPrice-b.close;finish('FLATTEN',Number((diff/state.slOffset).toFixed(2)));}}>{t('flatten')}</button></div><div className="speed-buttons">{[1,3,10,30].map(s=><Toggle key={s} active={state.speed===s} onClick={()=>dispatch({type:'SET_SPEED',speed:s})}>{s}x</Toggle>)}</div></div>}
  {state.phase==='RESULT'&&<ResultPanel state={state} t={t} onNext={state.dailyChallenge?()=>dispatch({type:'GO_HOME'}):newPuzzle} onReverse={startReverse}/>}
  {state.phase==='REVERSE_REPLAY'&&<ReverseReplayPanel state={state} t={t} onStep={advanceReverseReplay} onBack={()=>dispatch({type:'REVERSE_BACK'})} onPlay={()=>dispatch({type:'REVERSE_SET_PLAYING',playing:!state.reverseIsPlaying})} onFlatten={finishReverseWithFlatten} onSpeed={(speed)=>dispatch({type:'SET_SPEED',speed})}/>}
  {state.phase==='SPEED_RESULT'&&<div className="speed-feedback"><div className="eyebrow">{t('roundComplete')}</div><h2>{resultText(t,state.tradeResult)}</h2><p>{t('speedDecisionRecorded',{decision:state.userDecision??'SKIP',r:state.rMultiple.toFixed(2)})}</p><strong>{t('nextRoundAutomatically')}</strong></div>}</aside></div>}
  {state.phase==='SPEED_SUMMARY'&&<div className="speed-summary"><div className="summary-card"><span className="eyebrow">{t('speedRunDone')}</span><h1>{t('speedRunSummary')}</h1><div className="summary-score">{state.speedRun.correct}/{state.speedRun.totalRounds}</div><div className="summary-grid"><Stat label={t('speedRunAccuracy')} value={Math.round(state.speedRun.correct/Math.max(1,state.speedRun.round)*100)+'%'}/><Stat label={t('speedRunProcess')} value={Math.round(state.speedRun.processMatch/Math.max(1,state.speedRun.round)*100)+'%'}/><Stat label={t('speedRunR')} value={fmtR(state.speedRun.rSum)}/></div><div className="summary-actions"><button className="primary" onClick={()=>start('speed')}>{t('playAgain')}</button><button className="ghost" onClick={()=>dispatch({type:'END_SPEED_RUN'})}>{t('home')}</button></div></div></div>}
  {state.skipModalOpen&&<div className="modal-backdrop"><div className="modal"><h2>{t('skipTitle')}</h2><p>{t('skipSub')}</p><select value={state.skipReasonDraft} onChange={(e:ChangeEvent<HTMLSelectElement>)=>dispatch({type:'SET_SKIP_DRAFT',reason:e.target.value})}><option value="">—</option><option value="bad-setup">{t('skipBadSetup')}</option><option value="far-vwap">{t('skipFarFromVwap')}</option><option value="against-trend">{t('skipAgainstTrend')}</option><option value="no-confluence">{t('skipNoConfluence')}</option><option value="unsure">{t('skipUnsure')}</option></select><div className="modal-actions"><button className="ghost" onClick={()=>dispatch({type:'CLOSE_SKIP'})}>{t('cancel')}</button><button className="primary" disabled={!state.skipReasonDraft} onClick={submitSkip}>{t('submit')}</button></div></div></div>}
  <footer className="app-footer">{t('shortcutsText')} · {t('noPrediction')}</footer></div>;
}
export default App;
