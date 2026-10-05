
const en={
  appName:'Trading Tape Puzzles',trainingTool:'Trading decision trainer',tagline:'Chess puzzles, but for futures day traders.',
  heroSubtitle:'Read the tape, make one call, learn from what the market would have done.',heroFooter:'Runs entirely in your browser. No account. No backend.',
  mode:'Mode',standard:'Standard',blind:'Blind tape',speedRun:'Speed run',contextMode:'Context',fullContext:'Full context',onlyStructure:'Only structure',structureModeHint:'Hide market context during the decision, while keeping the chart visible.',startTraining:'Start training',startBlind:'Start blind tape',startSpeedRun:'Start speed run',home:'Home',blindBadge:'BLIND TAPE',difficulty:'Difficulty',difficultyEasy:'Easy',difficultyNormal:'Normal',difficultyHard:'Hard',difficultyProcessHint:'Based on your process accuracy over the last 20 decisions.',
  blindHint:'During the decision phase, context, playbook, price/time scales, indicators, and volume are hidden.',speedHint:'10 rapid decisions within a 15-minute session. No intermediate debrief; each round is evaluated automatically.',
  marketContext:'Market context',decision:'Decision',replay:'Replay',result:'Result',decisionQ:'Long, short, or skip?',long:'Long',short:'Short',skip:'Skip',
  rthHigh:'RTH high',rthLow:'RTH low',ethHigh:'ETH high',ethLow:'ETH low',microstructure:'Synthetic tape',buyVolume:'Buy volume',sellVolume:'Sell volume',delta:'Delta',aggressor:'Aggressor',syntheticMicrostructureHint:'Synthetic order-flow estimate derived from candle body and location; not real bid/ask data.',macroEventHighImpact:'high-impact simulated event',analystValidation:'Analyst validation',signalConfidence:'Signal confidence',acceptedDecisions:'Accepted decisions',hindsightGuard:'The recommendation and accepted answers are computed from the historical bars only; the future window is used only to score what happened after your decision.',
  playbook:'Playbook',range:'Range',atr:'ATR(14)',priceVsVwap:'Price vs VWAP',sessionOpen:'Session open',entry:'Entry',stop:'Stop',target:'Target',
  stopLoss:'Stop loss',takeProfit:'Take profit',play:'Play',pause:'Pause',step:'Step',flatten:'Flatten',
  showIndicators:'Chart controls',vwap:'VWAP',ema:'EMA 20',dema:'DEMA',levels:'Levels',volumeOnChart:'Volume',
  shortcuts:'L = Long · S = Short · K = Skip',shortcutsText:'L/S/K = decision · Space = play/pause · F = flatten · N = next · Esc = home',
  correctMove:'Analyst call',yourTrade:'Your decision',counterfactual:'Counterfactual outcomes',whyNotOther:'Why not the other side?',reverseExplore:'Explore another side',reverseExploreHint:'Replay this same puzzle with a different decision. Exploration is not scored or journaled.',reverseReplay:'Reverse replay',reverseNotCounted:'Not counted in stats or journal',notCounted:'Exploration — not counted',reverseResultHint:'This exploration does not change ELO, streak, or journal.',exploreLong:'Explore Long',exploreShort:'Explore Short',exploreSkip:'Explore Skip',backToResult:'Back to result',
  axisStructure:'Structure',axisVolume:'Volume',axisLocation:'Location',axisConfluence:'Confluence',
  trapOfDay:'Trap of the day',freezeUsed:'Freeze preserved your streak.',nextPuzzle:'Next puzzle',
  resultWin:'Target hit',resultLoss:'Stopped out',resultTimeout:'Time expired',resultFlat:'Flattened',resultSkip:'Skipped',
  elo:'ELO',process:'Process',accuracy:'Accuracy',solved:'Solved',streak:'Streak',best:'best',tradesR:'Trades R',
  yourProgress:'Your progress',rankNovice:'Novice',rankDeveloping:'Developing',rankConsistent:'Consistent',rankSharp:'Sharp',rankInstitutional:'Institutional',
  noPlayYet:'Play your first puzzle to see stats here.',journal:'Journal',journalCount:'{n} entries stored (last 200 kept).',
  exportJson:'Export JSON',exportCsv:'Export CSV',clearJournal:'Clear journal',resetStats:'Reset stats',
  confirmClearJournal:'Clear the entire journal? This cannot be undone.',confirmReset:'Reset all statistics? This cannot be undone.',
  skipTitle:'Why are you skipping?',skipReasonLabel:'Skip reason',skipSub:'Choose the main reason for your Skip decision.',skipBadSetup:'Bad setup',skipFarFromVwap:'Too far from VWAP',
  skipAgainstTrend:'Against the trend',skipNoConfluence:'No confluence',skipUnsure:'Not sure',cancel:'Cancel',submit:'Submit',
  freezeAvailable:'Freeze available',loadingChart:'Loading chart…',candlesAria:'Candlestick market replay chart',syntheticData:'Procedural synthetic market data',
  sessionClock:'Session',sessionClockHint:'Current market time of the last visible bar.',revengeWarningTitle:'Revenge trade warning',revengeWarningText:'You just took a loss. Slow down, reread the structure, and do not trade to win it back.',
  speedRunDone:'Speed run complete',speedRunSummary:'Session summary',playAgain:'Run again',round:'Round',of:'of',roundComplete:'Round complete',
  speedDecisionRecorded:'Decision {decision} recorded at {r}R.',nextRoundAutomatically:'Next round loads automatically.',
  speedRunAccuracy:'Accuracy',speedRunProcess:'Process',speedRunR:'R total',timeUp:'Time up',
  instrument:'Instrument',timeframe:'Timeframe',trainingModes:'Training modes',noPrediction:'Training simulation; not a prediction engine.',
  step1Title:'Read the context',step1Text:'Inspect price action and the available market context before committing to one decision.',
  step2Title:'Make your call',step2Text:'Choose Long, Short, or Skip. In Standard mode, entry locks at the last visible close.',
  step3Title:'Replay and debrief',step3Text:'Replay the future bars, manage the bracket, then study the counterfactual outcome.',
  persistence:'Local persistence',weakSpots:'Where you fail',weakSpotsHint:'Process accuracy by bucket. Only buckets with at least two samples are shown.',
  noWeakSpots:'Not enough data yet.',samples:'samples',recentDecisions:'Recent decisions',noJournal:'No decisions logged yet.',
  modeStandardDesc:'Decision + adjustable bracket + bar-by-bar replay.',modeBlindDesc:'Decision phase without contextual overlays or price/time labels.',
  modeSpeedDesc:'10 rapid decisions inside a 15-minute session, with automatic grading and no intermediate debrief.',
  autoNext:'The next round is loading…'
};
const pt={
  appName:'Trading Tape Puzzles',trainingTool:'Treinador de tomada de decisão',tagline:'Enigmas de xadrez, mas para day traders de futuros.',
  heroSubtitle:'Leia o tape, faça uma escolha e aprenda com o que o mercado teria feito.',heroFooter:'Executado no navegador. Sem conta. Sem backend.',
  mode:'Modo',standard:'Padrão',blind:'Blind tape',speedRun:'Speed run',contextMode:'Contexto',fullContext:'Contexto completo',onlyStructure:'Só estrutura',structureModeHint:'Oculta o contexto durante a decisão, mantendo o gráfico visível.',startTraining:'Iniciar treinamento',startBlind:'Iniciar blind tape',startSpeedRun:'Iniciar speed run',home:'Início',blindBadge:'BLIND TAPE',difficulty:'Dificuldade',difficultyEasy:'Fácil',difficultyNormal:'Normal',difficultyHard:'Difícil',difficultyProcessHint:'Baseada na precisão de processo das últimas 20 decisões.',
  blindHint:'Durante a decisão, contexto, playbook, escalas de preço/tempo, indicadores e volume ficam ocultos.',speedHint:'10 decisões rápidas em até 15 minutos. Sem debrief intermediário; cada rodada é avaliada automaticamente.',
  marketContext:'Contexto de mercado',decision:'Decisão',replay:'Replay',result:'Resultado',decisionQ:'Long, short ou skip?',long:'Long',short:'Short',skip:'Skip',
  playbook:'Playbook',range:'Range',atr:'ATR(14)',priceVsVwap:'Preço vs VWAP',sessionOpen:'Abertura da sessão',entry:'Entrada',stop:'Stop',target:'Alvo',
  stopLoss:'Stop loss',takeProfit:'Take profit',play:'Reproduzir',pause:'Pausar',step:'Avançar',flatten:'Flatten',
  showIndicators:'Controles do gráfico',vwap:'VWAP',ema:'EMA 20',dema:'DEMA',levels:'Níveis',volumeOnChart:'Volume',
  shortcuts:'L = Long · S = Short · K = Skip',shortcutsText:'L/S/K = decisão · Espaço = play/pausa · F = flatten · N = próximo · Esc = início',
  correctMove:'Leitura do analista',yourTrade:'Sua decisão',counterfactual:'Resultados contrafactuais',whyNotOther:'Por que não o outro lado?',reverseExplore:'Explorar outro lado',reverseExploreHint:'Reproduza este mesmo puzzle com uma decisão diferente. A exploração não entra no score nem no journal.',reverseReplay:'Replay reverso',reverseNotCounted:'Não contabilizado em estatísticas ou journal',notCounted:'Exploração — não contabilizada',reverseResultHint:'Esta exploração não altera ELO, sequência ou journal.',exploreLong:'Explorar Long',exploreShort:'Explorar Short',exploreSkip:'Explorar Skip',backToResult:'Voltar ao resultado',
  axisStructure:'Estrutura',axisVolume:'Volume',axisLocation:'Localização',axisConfluence:'Confluência',
  trapOfDay:'Armadilha do dia',freezeUsed:'Freeze preservou sua sequência.',nextPuzzle:'Próximo puzzle',
  resultWin:'Alvo atingido',resultLoss:'Stop atingido',resultTimeout:'Tempo encerrado',resultFlat:'Flatten',resultSkip:'Skip',
  elo:'ELO',process:'Processo',accuracy:'Precisão',solved:'Resolvidos',streak:'Sequência',best:'melhor',tradesR:'Trades R',
  yourProgress:'Seu progresso',rankNovice:'Novato',rankDeveloping:'Em desenvolvimento',rankConsistent:'Consistente',rankSharp:'Afiado',rankInstitutional:'Institucional',
  noPlayYet:'Faça seu primeiro puzzle para ver as estatísticas.',journal:'Journal',journalCount:'{n} entradas armazenadas (últimas 200).',
  exportJson:'Exportar JSON',exportCsv:'Exportar CSV',clearJournal:'Limpar journal',resetStats:'Resetar estatísticas',
  confirmClearJournal:'Limpar todo o journal? Esta ação não pode ser desfeita.',confirmReset:'Resetar todas as estatísticas? Esta ação não pode ser desfeita.',
  skipTitle:'Por que você está pulando?',skipReasonLabel:'Motivo do Skip',skipSub:'Escolha o principal motivo para sua decisão de Skip.',skipBadSetup:'Setup ruim',skipFarFromVwap:'Longe demais do VWAP',
  skipAgainstTrend:'Contra a tendência',skipNoConfluence:'Sem confluência',skipUnsure:'Não tenho certeza',cancel:'Cancelar',submit:'Confirmar',
  freezeAvailable:'Freeze disponível',loadingChart:'Carregando gráfico…',candlesAria:'Gráfico de replay de candles',syntheticData:'Dados de mercado sintéticos e procedurais',
  sessionClock:'Sessão',sessionClockHint:'Horário de mercado da última barra visível.',revengeWarningTitle:'Alerta de revenge trade',revengeWarningText:'Você acabou de sofrer uma perda. Diminua o ritmo, releia a estrutura e não opere para tentar recuperar.',
  speedRunDone:'Speed run concluído',speedRunSummary:'Resumo da sessão',playAgain:'Executar novamente',round:'Rodada',of:'de',roundComplete:'Rodada concluída',
  speedDecisionRecorded:'Decisão {decision} registrada em {r}R.',nextRoundAutomatically:'A próxima rodada será carregada automaticamente.',
  speedRunAccuracy:'Precisão',speedRunProcess:'Processo',speedRunR:'R total',timeUp:'Tempo esgotado',
  instrument:'Instrumento',timeframe:'Timeframe',trainingModes:'Modos de treinamento',noPrediction:'Simulação de treinamento; não é um mecanismo de previsão.',
  step1Title:'Leia o contexto',step1Text:'Inspecione o price action e o contexto disponível antes de assumir uma decisão.',
  step2Title:'Faça sua escolha',step2Text:'Escolha Long, Short ou Skip. No modo Padrão, a entrada fica travada no último fechamento visível.',
  step3Title:'Reproduza e faça o debrief',step3Text:'Reproduza as barras futuras, gerencie o bracket e estude o resultado contrafactual.',
  persistence:'Persistência local',weakSpots:'Onde você erra',weakSpotsHint:'Precisão de processo por bucket. Apenas buckets com pelo menos duas amostras aparecem.',
  noWeakSpots:'Ainda não há dados suficientes.',samples:'amostras',recentDecisions:'Decisões recentes',noJournal:'Nenhuma decisão registrada.',
  modeStandardDesc:'Decisão + bracket ajustável + replay barra a barra.',modeBlindDesc:'Fase de decisão sem overlays de contexto nem rótulos de preço/tempo.',
  modeSpeedDesc:'10 decisões rápidas em até 15 minutos, com avaliação automática e sem debrief intermediário.',
  autoNext:'A próxima rodada está sendo carregada…'
};
const dictionaries={en,pt} as const;
export type TranslationKey=keyof typeof en;
const missing=Object.keys(en).filter(k=>!(k in pt));
if(missing.length||Object.keys(pt).some(k=>!(k in en)))throw new Error('Translation dictionaries are out of sync: '+missing.join(','));
export function translate(lang:'en'|'pt',key:TranslationKey,vars?:Record<string,string|number>){
  let value=dictionaries[lang][key]??dictionaries.en[key];
  if(vars)Object.entries(vars).forEach(([k,v])=>{value=value.replaceAll('{'+k+'}',String(v));});
  return value;
}
