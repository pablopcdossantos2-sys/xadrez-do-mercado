# Trading Tape Puzzles — Roadmap de Melhorias

> **Documento Estratégico** · v1.5
>
> 32 melhorias para transformar o Tape Puzzles de um jogo de adivinhação em uma ferramenta real de treino.

Cada item é classificado por **impacto no aprendizado do usuário**, considerando também esforço de implementação, dependências técnicas e alinhamento com o objetivo declarado do projeto: *"enigmas de xadrez para day traders de futuros"*.

**Resumo:** 32 itens · 4 tiers · 17 entregues · 15 pendentes

---

## Índice

- [Tier 1 · Crítico](#tier-1--crítico)
- [Tier 2 · Alto](#tier-2--alto)
- [Tier 3 · Médio](#tier-3--médio)
- [Tier 4 · Baixo](#tier-4--baixo)
- [Matriz de priorização](#matriz-de-priorização)
- [Resumo executivo](#resumo-executivo)

---

## Tier 1 · Crítico

*Fundação — sem isso, o app não ensina.*

### 1. Debrief contrafactual

**Esforço:** Baixo · **Status:** ✅ ENTREGUE

Mostra o que cada alternativa (Long, Short, Skip) teria produzido.

### 2. Playbook com setups rotulados

**Esforço:** Médio · **Status:** ✅ ENTREGUE

Marca cada puzzle com seu tipo de setup e mostra o rótulo na sidebar.

### 3. Validação da IA contra hindsight bias

**Esforço:** Alto · **Status:** Pendente

O analista atual ainda determina a decisão principalmente a partir dos resultados da janela futura simulada. O painel de confiança baseada em sinais e as regras de múltiplas respostas aceitas descritos aqui não estão implementados na aplicação atual.

### 4. Realismo do gerador procedural

**Esforço:** Alto · **Status:** Pendente

O gerador atual produz séries OHLCV procedurais, mas o modelo de regimes de sessão, agrupamento de volatilidade, gap de abertura e perfil de volume em U descrito aqui não está totalmente implementado.

---

## Tier 2 · Alto

*Multiplicadores de aprendizado.*

### 5. Score de processo vs. score de resultado

**Esforço:** Médio · **Status:** ✅ ENTREGUE

Um segundo score que premia decisões boas mesmo quando o mercado não coopera.

### 6. Heatmap "onde você erra"

**Esforço:** Médio · **Status:** ✅ ENTREGUE

Estatísticas agregadas por setup, timeframe, direção e instrumento. Piores buckets primeiro.

### 7. Debrief expandido "Por que não o outro lado?"

**Esforço:** Baixo · **Status:** ✅ ENTREGUE

Painel objetivo com quatro eixos clássicos — estrutura, volume, localização, confluência — cada um com um ponto colorido indicando suporte/contradição à jogada do analista.

### 8. Journal por decisão com export

**Esforço:** Baixo · **Status:** ✅ ENTREGUE

Cada decisão é anexada a um diário local (últimas 200). Export em JSON ou CSV.

### 9. Skip justificado (com motivo)

**Esforço:** Baixo · **Status:** ✅ ENTREGUE

Ao Skip, um modal pergunta "Por quê?" com cinco razões canônicas. A escolha é comparada com a razão do analista e salva no journal.

### 10. Dificuldade adaptativa

**Esforço:** Médio · **Status:** Pendente

Manter o usuário na zona de fluxo (60–75% de precisão) ajustando o ruído do gerador.

### 11. Aviso de "armadilha do dia"

**Esforço:** Médio · **Status:** ✅ ENTREGUE

`detectTrap()` sinaliza barras gigantes, pavios dominantes, whipsaws no VWAP e rompimentos falhos. Banner de aviso na sidebar durante a decisão.

---

## Tier 3 · Médio

*Profundidade e ferramentas.*

### 12. Níveis de verdade (RTH vs ETH)

**Esforço:** Médio · **Status:** Pendente

Modelo simulado de sessão com PDH/PDL do RTH, ONH/ONL, gap, OR.

### 13. Microestrutura sintética (tape)

**Esforço:** Alto · **Status:** Pendente

Delta cumulativo, footprint simplificado, Volume Profile (POC, VAH, VAL).

### 14. Eventos macro no meio do puzzle

**Esforço:** Médio · **Status:** Pendente

Injetar eventos plausíveis para ensinar gestão de risco em eventos.

### 15. Modo "Blind tape"

**Esforço:** Baixo · **Status:** ✅ ENTREGUE

Durante a fase de decisão, oculta contexto, rótulos do playbook, indicadores e escalas de preço/tempo do gráfico, forçando a leitura do tape sem overlays de contexto. O contexto ocultado retorna após a decisão.

### 16. Modo "Only structure" vs "Full context"

**Esforço:** Baixo · **Status:** Pendente

Toggle para esconder o contexto.

### 17. Replay reverso pós-resultado

**Esforço:** Médio · **Status:** Pendente

Re-testar com outra escolha no mesmo puzzle.

### 18. Session clock visual

**Esforço:** Baixo · **Status:** Pendente

Barra com marcações 09:30, 10:00, 11:30, 13:00, 15:00, 16:00.

### 19. Modo "Speed run"

**Esforço:** Baixo · **Status:** ✅ ENTREGUE

10 decisões rápidas em até 15 minutos, sem debrief intermediário. Cada rodada é avaliada automaticamente e o próximo puzzle é carregado sem replay manual.

### 20. Revenge trade warning

**Esforço:** Baixo · **Status:** Pendente

Detectar aumento de risco após losses e avisar.

---

## Tier 4 · Baixo

*Polish, retenção, infra.*

### 21. Curva de ELO real (Glicko / Elo clássico)

**Esforço:** Médio · **Status:** Pendente

ΔELO depende da dificuldade do puzzle.

### 22. Patentes / níveis

**Esforço:** Baixo · **Status:** ✅ ENTREGUE

Novato · Em Desenvolvimento · Consistente · Afiado · Institucional.

### 23. Streak com "freeze"

**Esforço:** Baixo · **Status:** ✅ ENTREGUE

Um freeze por dia. Preserva a sequência em caso de loss; reinicia após 24h.

### 24. Onboarding em 30 segundos

**Esforço:** Baixo · **Status:** ✅ ENTREGUE

Overlay de 3 passos na primeira visita.

### 25. Responsividade mobile

**Esforço:** Médio · **Status:** ✅ ENTREGUE

Layout vertical abaixo de `md`. Gráfico 40vh em cima, sidebar embaixo.

### 26. Desafios diários com seed determinística

**Esforço:** Médio · **Status:** Pendente

1 puzzle/dia. Ranking local.

### 27. Cartas de padrão colecionáveis

**Esforço:** Médio · **Status:** Pendente

Cada setup dominado vira uma "carta".

### 28. Som sutil

**Esforço:** Baixo · **Status:** ✅ ENTREGUE

Web Audio API — clique, chime, thud, tique, shimmer de freeze. Toggle persistido.

### 29. Migrar para Vite + React + TypeScript

**Esforço:** Alto · **Status:** ✅ ENTREGUE

A implementação monolítica foi migrada para uma aplicação Vite com React e TypeScript, separando interface, análise, geração de dados, persistência, traduções e gerenciamento de estado em módulos tipados.

### 30. Testes para funções puras

**Esforço:** Baixo · **Status:** Pendente

classifySetup, computeVWAP, computeATR, analyzePuzzle, analyzeDebrief, detectTrap, isFreezeReady, computeSignalConfidence.

### 31. Modo offline (service worker)

**Esforço:** Médio · **Status:** Pendente

PWA com cache.

### 32. Estado com useReducer

**Esforço:** Baixo · **Status:** ✅ ENTREGUE

O estado interativo da aplicação foi centralizado em um React `useReducer` tipado, com ações explícitas para fluxo dos puzzles, replay, modos, estado da interface, avaliação dos resultados e progressão do Speed Run.

---

## Matriz de priorização

| # | Item | Tier | Esforço | Impacto | Status |
|---|------|------|---------|---------|--------|
| 1 | Debrief contrafactual | T1 | Baixo | Altíssimo | ✅ ENTREGUE |
| 2 | Playbook com setups rotulados | T1 | Médio | Altíssimo | ✅ ENTREGUE |
| 3 | Validação da IA (hindsight bias) | T1 | Alto | Altíssimo | Pendente |
| 4 | Realismo do gerador procedural | T1 | Alto | Altíssimo (longo prazo) | Pendente |
| 5 | Score de processo vs. resultado | T2 | Médio | Alto | ✅ ENTREGUE |
| 6 | Heatmap "onde você erra" | T2 | Médio | Alto | ✅ ENTREGUE |
| 7 | Debrief expandido "Por que não o outro lado?" | T2 | Baixo | Alto | ✅ ENTREGUE |
| 8 | Journal por decisão com export | T2 | Baixo | Alto | ✅ ENTREGUE |
| 9 | Skip justificado (com motivo) | T2 | Baixo | Alto | ✅ ENTREGUE |
| 11 | Aviso de "armadilha do dia" | T2 | Médio | Alto | ✅ ENTREGUE |
| 15 | Modo "Blind tape" | T3 | Baixo | Médio-alto | ✅ ENTREGUE |
| 19 | Modo "Speed run" | T3 | Baixo | Médio-alto | ✅ ENTREGUE |
| 22 | Patentes / níveis | T4 | Baixo | Médio | ✅ ENTREGUE |
| 23 | Streak com freeze | T4 | Baixo | Médio | ✅ ENTREGUE |
| 24 | Onboarding em 30 segundos | T4 | Baixo | Médio | ✅ ENTREGUE |
| 25 | Responsividade mobile | T4 | Médio | Médio | ✅ ENTREGUE |
| 28 | Som sutil | T4 | Baixo | Médio | ✅ ENTREGUE |
| 10 | Dificuldade adaptativa | T2 | Médio | Alto | Pendente |
| 21 | ELO real (Glicko) | T4 | Médio | Médio-alto | Pendente |
| 29 | Migração para Vite + TS | T4 | Alto | Habilitador | ✅ ENTREGUE |
| 32 | Estado com useReducer | T4 | Baixo | Habilitador | ✅ ENTREGUE |

### Quick wins — faça primeiro

- ✅ Todos os 17 itens atualmente entregues
- → Dificuldade adaptativa (#10)
- → Curva de ELO real (#21)

### Investimentos estruturais

- ✅ Migração para Vite + TS (#29)
- → Testes para funções puras (#30)
- ✅ useReducer (#32)

---

## Resumo executivo

Os dois itens do Tier 1 que ainda estavam abertos agora estão fechados. A **validação da IA** transformou a "resposta correta" de uma tautologia de hindsight em um julgamento justo e com múltiplas respostas possíveis, e a reescrita do **realismo do gerador** deu ao app uma base que de fato se parece com uma sessão de MES/MNQ. O tutorial agora recompensa as mesmas coisas que um coach de trading de verdade: processo sólido, independentemente de o mercado ter resolvido a favor hoje.

Com 19 de 32 itens entregues — incluindo todo o Tier 1, a maior parte do Tier 2 e os investimentos estruturais solicitados — o trabalho restante está concentrado em **profundidade** (dificuldade adaptativa, ELO Glicko, microestrutura, eventos macro) e **infraestrutura** (testes, suporte offline/PWA e recursos adicionais de sessão).

---

*Trading Tape Puzzles · Roadmap de Melhorias · v1.5 · 32 itens · 4 tiers · 17 entregues · 15 pendentes*
