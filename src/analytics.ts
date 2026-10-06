import type { Bar, DebriefAxis, Microstructure, PuzzleAnalysis, SessionLevels, Setup, TradeOutcome, TrapInfo } from './types';

export const REF_SL=12;
export const REF_TP=24;

const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));

export function computeEMA(bars:Bar[],period:number){
  if(period<=0)throw new Error('EMA period must be positive');
  const k=2/(period+1);let ema:number|null=null;
  return bars.map(b=>{ema=ema===null?b.close:b.close*k+ema*(1-k);return{time:b.time,value:Number(ema.toFixed(4))};});
}

export function computeDEMA(bars:Bar[],period:number){
  const e1=computeEMA(bars,period);
  const e2=computeEMA(e1.map(x=>({time:x.time,open:x.value,high:x.value,low:x.value,close:x.value,volume:0})),period);
  return e1.map((x,i)=>({time:x.time,value:Number((2*x.value-e2[i].value).toFixed(4))}));
}

export function computeVWAP(bars:Bar[]){
  let pv=0,v=0;
  return bars.map(b=>{const vol=b.volume||1;pv+=((b.high+b.low+b.close)/3)*vol;v+=vol;return{time:b.time,value:Number((pv/v).toFixed(4))};});
}

export function computeATR(bars:Bar[],period=14){
  if(period<=0||bars.length<period+1)return 0;let sum=0;
  for(let i=bars.length-period;i<bars.length;i++){const p=bars[i-1],c=bars[i];sum+=Math.max(c.high-c.low,Math.abs(c.high-p.close),Math.abs(c.low-p.close));}
  return sum/period;
}

export interface SessionClockConfig{timezone?:string;rthStart?:string;rthEnd?:string}

function clockMinutes(time:number,timezone?:string){
  const d=new Date(time*1000);
  if(!timezone)return d.getHours()*60+d.getMinutes();
  const parts=new Intl.DateTimeFormat('en-GB',{timeZone:timezone,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(d);
  const hour=Number(parts.find(part=>part.type==='hour')?.value??0);
  const minute=Number(parts.find(part=>part.type==='minute')?.value??0);
  return hour*60+minute;
}

function parseClock(value:string|undefined,fallback:number){
  if(!value)return fallback;
  const [hour,minute]=value.split(':').map(Number);
  return Number.isFinite(hour)&&Number.isFinite(minute)?hour*60+minute:fallback;
}

export function computeSessionLevels(bars:Bar[],config:SessionClockConfig={}):SessionLevels{
  const start=parseClock(config.rthStart,570),end=parseClock(config.rthEnd,960);
  let rthHigh:number|null=null,rthLow:number|null=null,ethHigh:number|null=null,ethLow:number|null=null;
  for(const b of bars){
    const m=clockMinutes(b.time,config.timezone);
    const rth=start<=end?m>=start&&m<end:m>=start||m<end;
    if(rth){rthHigh=rthHigh===null?b.high:Math.max(rthHigh,b.high);rthLow=rthLow===null?b.low:Math.min(rthLow,b.low);}
    else{ethHigh=ethHigh===null?b.high:Math.max(ethHigh,b.high);ethLow=ethLow===null?b.low:Math.min(ethLow,b.low);}
  }
  return{rthHigh,rthLow,ethHigh,ethLow};
}

export function computeMicrostructure(bars:Bar[]):Microstructure{
  const b=bars.at(-1);
  if(!b)return{buyVolume:0,sellVolume:0,delta:0,imbalance:0,aggressor:'balanced'};
  const range=Math.max(.01,b.high-b.low);
  const bodyBias=(b.close-b.open)/range;
  const closeLocation=((b.close-(b.high+b.low)/2)/range);
  const buyRatio=clamp(.5+bodyBias*.30+closeLocation*.20,.05,.95);
  const buyVolume=Math.round(b.volume*buyRatio),sellVolume=Math.max(0,b.volume-buyVolume),delta=buyVolume-sellVolume;
  const imbalance=delta/Math.max(1,b.volume);
  const aggressor=imbalance>.12?'buyers':imbalance<-.12?'sellers':'balanced';
  return{buyVolume,sellVolume,delta,imbalance,aggressor};
}

export function classifySetup({history,atr,vwap,ema}:{history:Bar[];atr:number;vwap:number;ema:number}):Setup{
  const L=history.length;if(L<25||!atr)return{id:'neutral',en:'Neutral Tape',pt:'Tape Neutro',bias:'skip'};
  const last=history[L-1],prev=history[L-2],highs=history.map(b=>b.high),lows=history.map(b=>b.low);
  const priorHigh=Math.max(...highs.slice(-30,-4)),priorLow=Math.min(...lows.slice(-30,-4));
  for(let i=Math.max(0,L-3);i<L;i++){const b=history[i];if(b.low<priorLow&&b.close>priorLow&&last.close>priorLow)return{id:'liq_sweep_long',en:'Liquidity Sweep — Long',pt:'Varredura de Liquidez — Long',bias:'long'};if(b.high>priorHigh&&b.close<priorHigh&&last.close<priorHigh)return{id:'liq_sweep_short',en:'Liquidity Sweep — Short',pt:'Varredura de Liquidez — Short',bias:'short'};}
  if(prev.close<vwap&&last.close>vwap)return{id:'vwap_reclaim',en:'VWAP Reclaim',pt:'Reclaim de VWAP',bias:'long'};
  if(prev.close>vwap&&last.close<vwap)return{id:'vwap_reject',en:'VWAP Rejection',pt:'Rejeição do VWAP',bias:'short'};
  const or=history.slice(0,6),orh=Math.max(...or.map(b=>b.high)),orl=Math.min(...or.map(b=>b.low));
  if(Math.abs(last.close-orh)<atr*2&&last.close>orh)return{id:'orb_long',en:'Opening Range Breakout — Long',pt:'Rompimento do Range de Abertura — Long',bias:'long'};
  if(Math.abs(last.close-orl)<atr*2&&last.close<orl)return{id:'orb_short',en:'Opening Range Breakout — Short',pt:'Rompimento do Range de Abertura — Short',bias:'short'};
  const recent=history.slice(-10),recentLow=Math.min(...recent.map(b=>b.low)),priorLow20=Math.min(...lows.slice(-30,-10)),recentHigh=Math.max(...recent.map(b=>b.high)),priorHigh20=Math.max(...highs.slice(-30,-10));
  if(recentLow<priorLow20&&last.close>priorLow20)return{id:'failed_breakdown',en:'Failed Breakdown',pt:'Rompimento Falho de Baixa',bias:'long'};
  if(recentHigh>priorHigh20&&last.close<priorHigh20)return{id:'failed_breakout',en:'Failed Breakout',pt:'Rompimento Falho de Alta',bias:'short'};
  const dist=last.close-ema;
  if(Math.abs(dist)<atr*.9&&last.close>last.open&&dist<0)return{id:'pullback_long',en:'Trend Pullback — Long',pt:'Pullback de Tendência — Long',bias:'long'};
  if(Math.abs(dist)<atr*.9&&last.close<last.open&&dist>0)return{id:'pullback_short',en:'Trend Pullback — Short',pt:'Pullback de Tendência — Short',bias:'short'};
  const r20h=Math.max(...highs.slice(-20)),r20l=Math.min(...lows.slice(-20)),range=r20h-r20l;
  if(range>atr*4){const mid=(r20h+r20l)/2,top=r20h-atr*.6,bottom=r20l+atr*.6;if(last.high>top&&last.close<last.high-atr*.3&&last.close>mid)return{id:'range_fade_short',en:'Range Fade — Short',pt:'Fade de Range — Short',bias:'short'};if(last.low<bottom&&last.close>last.low+atr*.3&&last.close<mid)return{id:'range_fade_long',en:'Range Fade — Long',pt:'Fade de Range — Long',bias:'long'};}
  const anchor=history[Math.max(0,L-6)],move=last.close-anchor.open;
  if(move>atr*1.5)return{id:'momentum_long',en:'Momentum Push — Long',pt:'Impulso — Long',bias:'long'};
  if(move<-atr*1.5)return{id:'momentum_short',en:'Momentum Push — Short',pt:'Impulso — Short',bias:'short'};
  return{id:'consolidation',en:'Consolidation',pt:'Consolidação',bias:'skip'};
}

function historyOnlyDecision(history:Bar[],setup:Setup,atr:number,vwap:number,ema:number):{decision:'LONG'|'SHORT'|'SKIP';acceptedDecisions:('LONG'|'SHORT'|'SKIP')[];signalConfidence:number}{
  const last=history.at(-1)!,recent=history.slice(-6),momentum=last.close-(recent[0]?.open??last.open);
  let score=0;
  score+=setup.bias==='long'?3:setup.bias==='short'?-3:0;
  score+=last.close>vwap?1:-1;
  score+=last.close>ema?1:-1;
  score+=momentum>atr*.6?1:momentum<-atr*.6?-1:0;
  score+=last.close>=last.open?1:-1;
  const magnitude=Math.abs(score),decision=magnitude>=2?(score>0?'LONG':'SHORT'):'SKIP';
  const confidence=clamp(.5+magnitude*.09,.5,.95);
  const acceptedDecisions:('LONG'|'SHORT'|'SKIP')[]=decision==='SKIP'?['SKIP',score>=0?'LONG':'SHORT']:(magnitude>=4?[decision]:[decision,'SKIP']);
  return{decision,acceptedDecisions,signalConfidence:Number(confidence.toFixed(2))};
}

export function simulateSide(future:Bar[],entry:number,side:'LONG'|'SHORT',slPts:number,tpPts:number):TradeOutcome{
  const sl=side==='LONG'?entry-slPts:entry+slPts,tp=side==='LONG'?entry+tpPts:entry-tpPts;
  for(let i=0;i<future.length;i++){const b=future[i],hitSL=side==='LONG'?b.low<=sl:b.high>=sl,hitTP=side==='LONG'?b.high>=tp:b.low<=tp;if(hitSL)return{result:'LOSS',r:-1,bars:i+1,exit:sl};if(hitTP)return{result:'WIN',r:Number((tpPts/slPts).toFixed(2)),bars:i+1,exit:tp};}
  const last=future[future.length-1],diff=side==='LONG'?last.close-entry:entry-last.close;
  return{result:'TIMEOUT',r:Number((diff/slPts).toFixed(2)),bars:future.length,exit:last.close};
}

export function analyzePuzzle(history:Bar[],future:Bar[],sessionClock:SessionClockConfig={}):PuzzleAnalysis{
  const entryPrice=history.at(-1)!.close,atr=computeATR(history)||1,vwap=computeVWAP(history).at(-1)!.value,ema=computeEMA(history,20).at(-1)!.value,setup=classifySetup({history,atr,vwap,ema});
  const validated=historyOnlyDecision(history,setup,atr,vwap,ema);
  const outcomes={LONG:simulateSide(future,entryPrice,'LONG',REF_SL,REF_TP),SHORT:simulateSide(future,entryPrice,'SHORT',REF_SL,REF_TP),SKIP:{result:'SKIP',r:0,bars:0,exit:entryPrice} as TradeOutcome};
  const high=Math.max(...history.map(b=>b.high)),low=Math.min(...history.map(b=>b.low)),range=high-low,dist=entryPrice-vwap;
  return{decision:validated.decision,acceptedDecisions:validated.acceptedDecisions,signalConfidence:validated.signalConfidence,setup,outcomes,entryPrice,atr,vwap,ema,range,high,low,vwapDir:dist>=0?'above':'below',distVwapAbs:Math.abs(dist),atrPct:Math.abs(dist)/atr,lastClose:entryPrice,levels:computeSessionLevels(history,sessionClock),microstructure:computeMicrostructure(history)};
}

export function detectTrap(history:Bar[]):TrapInfo|null{
  if(history.length<20)return null;
  const atr=computeATR(history)||1,last=history.at(-1)!,body=Math.abs(last.close-last.open),up=last.high-Math.max(last.open,last.close),down=Math.min(last.open,last.close)-last.low,range=last.high-last.low||1;
  if(body>atr*1.5)return{key:'oversized',messageEn:'Last candle body is '+(body/atr).toFixed(1)+'× ATR — continuation entries deserve extra caution.',messagePt:'O corpo do último candle mede '+(body/atr).toFixed(1)+'× o ATR — entradas de continuação merecem cautela adicional.'};
  if(up/range>.55&&up>atr*.6)return{key:'wick',messageEn:'A dominant upper wick signals rejection; chasing the move can be a trap.',messagePt:'Um pavio superior dominante sinaliza rejeição; perseguir o movimento pode ser uma armadilha.'};
  if(down/range>.55&&down>atr*.6)return{key:'wick',messageEn:'A dominant lower wick signals rejection; chasing the move can be a trap.',messagePt:'Um pavio inferior dominante sinaliza rejeição; perseguir o movimento pode ser uma armadilha.'};
  const vv=computeVWAP(history),bars=history.slice(-8),vals=vv.slice(-8);let cross=0;
  for(let i=1;i<bars.length;i++)if((bars[i-1].close>vals[i-1].value)!==(bars[i].close>vals[i].value))cross++;
  if(cross>=4)return{key:'vwapWhipsaw',messageEn:'Price crossed VWAP '+cross+' times in eight bars — directional bets are vulnerable to whipsaw.',messagePt:'O preço cruzou o VWAP '+cross+' vezes em oito barras — apostas direcionais ficam vulneráveis ao whipsaw.'};
  if(history.length>=4){const a=history.at(-3)!,b=history.at(-2)!,c=history.at(-1)!;if(b.volume<a.volume&&c.volume<b.volume&&c.close!==a.close)return{key:'volumeDivergence',messageEn:'Price is still moving while volume decreases — a common divergence trap.',messagePt:'O preço continua avançando enquanto o volume diminui — uma armadilha comum de divergência.'};}
  return null;
}

export function analyzeDebrief(history:Bar[],ai:'LONG'|'SHORT'|'SKIP'):DebriefAxis[]{
  const entry=history.at(-1)!.close,atr=computeATR(history)||1,last20=history.slice(-20);let hh=0,ll=0;
  for(let i=1;i<last20.length;i++){if(last20[i].high>last20[i-1].high)hh++;if(last20[i].low<last20[i-1].low)ll++;}
  const structure=hh/(last20.length-1)>.6&&ll/(last20.length-1)<.4?'long':ll/(last20.length-1)>.6&&hh/(last20.length-1)<.4?'short':'neutral';
  const ten=history.slice(-10);let up=0,down=0;ten.forEach(b=>b.close>=b.open?up+=b.volume:down+=b.volume);
  const volume=up/(up+down||1)>.6?'long':up/(up+down||1)<.4?'short':'neutral';
  const mid=Math.floor(history.length/2),levels=[{n:'PDH',p:Math.max(...history.slice(0,mid).map(b=>b.high)),b:'short' as const},{n:'PDL',p:Math.min(...history.slice(0,mid).map(b=>b.low)),b:'long' as const},{n:'ONH',p:Math.max(...history.slice(mid).map(b=>b.high)),b:'short' as const},{n:'ONL',p:Math.min(...history.slice(mid).map(b=>b.low)),b:'long' as const}];
  const nearest=levels.sort((a,b)=>Math.abs(entry-a.p)-Math.abs(entry-b.p))[0],location=Math.abs(entry-nearest.p)<atr*1.5?nearest.b:'neutral',ema=computeEMA(history,20).at(-1)!.value,vwap=computeVWAP(history).at(-1)!.value;
  const counts={long:0,short:0};[entry>vwap?'long':'short',entry>ema?'long':'short',structure,volume].forEach(x=>{if(x==='long')counts.long++;if(x==='short')counts.short++;});
  const conf=ai==='LONG'&&counts.long>=2?'long':ai==='SHORT'&&counts.short>=2?'short':'neutral',upPct=Math.round(up/(up+down||1)*100);
  return[
    {axis:'structure',bias:structure,textEn:structure==='long'?'Structure favors buyers: '+hh+' higher-high steps versus '+ll+' lower-low steps.':structure==='short'?'Structure favors sellers: '+ll+' lower-low steps versus '+hh+' higher-high steps.':'Structure is mixed: '+hh+' HH steps versus '+ll+' LL steps.',textPt:structure==='long'?'A estrutura favorece compradores: '+hh+' avanços de máximas contra '+ll+' de mínimas.':structure==='short'?'A estrutura favorece vendedores: '+ll+' avanços de mínimas contra '+hh+' de máximas.':'A estrutura está mista: '+hh+' avanços de máximas contra '+ll+' de mínimas.'},
    {axis:'volume',bias:volume,textEn:upPct+'% of the last ten bars closed up.',textPt:upPct+'% das últimas dez barras fecharam em alta.'},
    {axis:'location',bias:location,textEn:'Nearest reference is '+nearest.n+', '+Math.abs(entry-nearest.p).toFixed(1)+' points away.',textPt:'A referência mais próxima é '+nearest.n+', a '+Math.abs(entry-nearest.p).toFixed(1)+' pontos.'},
    {axis:'confluence',bias:conf,textEn:'Confluence: '+counts.long+'/4 bullish vs '+counts.short+'/4 bearish signals.',textPt:'Confluência: '+counts.long+'/4 sinais de alta contra '+counts.short+'/4 de baixa.'},
  ];
}
