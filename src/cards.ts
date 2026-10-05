export interface PatternCard{
  id:string;
  en:string;
  pt:string;
}

export const PATTERN_CARDS:PatternCard[]=[
  {id:'liq_sweep_long',en:'Liquidity Sweep — Long',pt:'Varredura de Liquidez — Long'},
  {id:'liq_sweep_short',en:'Liquidity Sweep — Short',pt:'Varredura de Liquidez — Short'},
  {id:'vwap_reclaim',en:'VWAP Reclaim',pt:'Reclaim de VWAP'},
  {id:'vwap_reject',en:'VWAP Rejection',pt:'Rejeição do VWAP'},
  {id:'orb_long',en:'Opening Range Breakout — Long',pt:'Rompimento do Range de Abertura — Long'},
  {id:'orb_short',en:'Opening Range Breakout — Short',pt:'Rompimento do Range de Abertura — Short'},
  {id:'failed_breakdown',en:'Failed Breakdown',pt:'Rompimento Falho de Baixa'},
  {id:'failed_breakout',en:'Failed Breakout',pt:'Rompimento Falho de Alta'},
  {id:'pullback_long',en:'Trend Pullback — Long',pt:'Pullback de Tendência — Long'},
  {id:'pullback_short',en:'Trend Pullback — Short',pt:'Pullback de Tendência — Short'},
  {id:'range_fade_long',en:'Range Fade — Long',pt:'Fade de Range — Long'},
  {id:'range_fade_short',en:'Range Fade — Short',pt:'Fade de Range — Short'},
  {id:'momentum_long',en:'Momentum Push — Long',pt:'Impulso — Long'},
  {id:'momentum_short',en:'Momentum Push — Short',pt:'Impulso — Short'},
  {id:'consolidation',en:'Consolidation',pt:'Consolidação'},
];
export const CARD_BY_ID=Object.fromEntries(PATTERN_CARDS.map(card=>[card.id,card])) as Record<string,PatternCard>;
