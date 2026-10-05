# Trading Tape Puzzles — Roadmap de Melhorias

> **Documento Estratégico** · v1.3
>
> 32 melhorias para transformar o Tape Puzzles de um jogo de adivinhação em uma ferramenta real de treino.

Cada item é classificado por **impacto no aprendizado do usuário**, considerando também esforço de implementação, dependências técnicas e alinhamento com o objetivo declarado do projeto: *"enigmas de xadrez para day traders de futuros"*.

**Resumo:** 32 itens · 4 tiers · 10 entregues · 22 pendentes

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

**Esforço:** Alto · **Status:** Parcial

A "resposta correta" atual é *qual lado bateu TP antes do SL* — hindsight puro. Aceitar múltiplas respostas válidas, usar árvore de regras auditável e expor score de confiança.

### 4. Realismo do gerador procedural

**Esforço:** Alto · **Status:** Pendente

Injetar agrupamento de volatilidade, regimes de sessão, volume correlacionado com |retorno|, gaps de abertura. Alternativa: CSV histórico real de MES/MNQ.

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

Cada decisão é anexada a um diário local (últimas 200). Export em JSON ou CSV. Agora também armazena motivo do skip e trap detectada.

### 9. Skip justificado (com motivo)

**Esforço:** Baixo · **Status:** ✅ ENTREGUE

Ao Skip, um modal pergunta "Por quê?" com cinco razões canônicas (setup ruim, longe do VWAP, contra tendência, sem confluência, não sei). A escolha é comparada com a razão do analista e salva no journal. Comparação aparece no debrief.

### 10. Dificuldade adaptativa

**Esforço:** Médio · **Status:** Pendente

Manter o usuário na zona de fluxo (60–75% de precisão) ajustando o ruído do gerador.

### 11. Aviso de "armadilha do dia"

**Esforço:** Médio · **Status:** ✅ ENTREGUE

`detectTrap()` analisa o histórico visível e sinaliza padrões enganosos: corpo de barra gigante (>1.5× ATR), rejeição por pavio dominante, whipsaw no VWAP (≥4 cruzamentos em 8 barras), empurrão de 3 barras com volume decrescente, e rompimentos falhos nas últimas 4 barras. Um banner aparece na sidebar durante a fase de decisão, sem entregar a resposta.

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

**Esforço:** Baixo · **Status:** Pendente

Ocultar preço/tempo para forçar leitura de estrutura pura.

### 16. Modo "Only structure" vs "Full context"

**Esforço:** Baixo · **Status:** Pendente

Toggle para esconder o contexto. Treina price action puro primeiro.

### 17. Replay reverso pós-resultado

**Esforço:** Médio · **Status:** Pendente

Re-testar com outra escolha no mesmo puzzle. Calibração de confiança.

### 18. Session clock visual

**Esforço:** Baixo · **Status:** Pendente

Barra com marcações 09:30, 10:00, 11:30, 13:00, 15:00, 16:00.

### 19. Modo "Speed run"

**Esforço:** Baixo · **Status:** Pendente

10 puzzles em 15 minutos, sem debrief. Warm-up antes da abertura.

### 20. Revenge trade warning

**Esforço:** Baixo · **Status:** Pendente

Detectar aumento de risco após losses e avisar. Ensina psicologia operacional.

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

**Esforço:** Baixo · **Status:** Pendente

1 freeze/dia para não zerar a sequência.

### 24. Onboarding em 30 segundos

**Esforço:** Baixo · **Status:** ✅ ENTREGUE

Overlay de 3 passos na primeira visita. A home explica como o jogo funciona.

### 25. Responsividade mobile

**Esforço:** Médio · **Status:** Pendente

Layout vertical, botões touch, gestos.

### 26. Desafios diários com seed determinística

**Esforço:** Médio · **Status:** Pendente

1 puzzle/dia. Ranking local: você vs. você de ontem.

### 27. Cartas de padrão colecionáveis

**Esforço:** Médio · **Status:** Pendente

Cada setup dominado vira uma "carta".

### 28. Som sutil

**Esforço:** Baixo · **Status:** Pendente

Chime ao bater TP, thud ao stopar. Desligável.

### 29. Migrar para Vite + React + TypeScript

**Esforço:** Alto · **Status:** Recomendado

Quando o single-file passar de ~2.000 LOC. Estrutura em módulos.

### 30. Testes para funções puras

**Esforço:** Baixo · **Status:** Pendente

classifySetup, computeVWAP, computeATR, analyzePuzzle, analyzeDebrief, detectTrap.

### 31. Modo offline (service worker)

**Esforço:** Médio · **Status:** Pendente

PWA com cache.

### 32. Estado com useReducer

**Esforço:** Baixo · **Status:** Pendente

Substituir os 12+ useState interdependentes.

---

## Matriz de priorização

| # | Item | Tier | Esforço | Impacto | Status |
|---|------|------|---------|---------|--------|
| 1 | Debrief contrafactual | T1 | Baixo | Altíssimo | ✅ ENTREGUE |
| 2 | Playbook com setups rotulados | T1 | Médio | Altíssimo | ✅ ENTREGUE |
| 5 | Score de processo vs. resultado | T2 | Médio | Alto | ✅ ENTREGUE |
| 6 | Heatmap "onde você erra" | T2 | Médio | Alto | ✅ ENTREGUE |
| 7 | Debrief expandido "Por que não o outro lado?" | T2 | Baixo | Alto | ✅ ENTREGUE |
| 8 | Journal por decisão com export | T2 | Baixo | Alto | ✅ ENTREGUE |
| 9 | Skip justificado (com motivo) | T2 | Baixo | Alto | ✅ ENTREGUE |
| 11 | Aviso de "armadilha do dia" | T2 | Médio | Alto | ✅ ENTREGUE |
| 3 | Validação da IA (hindsight bias) | T1 | Alto | Altíssimo | Parcial |
| 4 | Realismo do gerador procedural | T1 | Alto | Altíssimo (longo prazo) | Pendente |
| 10 | Dificuldade adaptativa | T2 | Médio | Alto | Pendente |
| 21 | ELO real (Glicko) | T4 | Médio | Médio-alto | Pendente |
| 29 | Migração para Vite + TS | T4 | Alto | Habilitador | Recomendado |

### Quick wins — faça primeiro

- ✅ Debrief contrafactual (#1)
- ✅ Playbook com setups rotulados (#2)
- ✅ Score de processo vs. resultado (#5)
- ✅ Heatmap "onde você erra" (#6)
- ✅ Debrief expandido "Por que não o outro lado?" (#7)
- ✅ Journal por decisão com export (#8)
- ✅ Skip justificado com motivo (#9)
- ✅ Aviso de "armadilha do dia" (#11)
- ✅ Patentes / níveis (#22)
- ✅ Onboarding em 30 segundos (#24)
- → Dificuldade adaptativa (#10)

### Investimentos estruturais

- → Validação da IA (hindsight bias) (#3)
- → Realismo do gerador (#4)
- → Dificuldade adaptativa (#10)
- → Migração para Vite + TS (#29)

---

## Resumo executivo

Hoje, o Tape Puzzles é um *jogo bonito de adivinhar direção*. Para virar uma **ferramenta de treino real**, o pulo do gato está em três itens do Tier 1: **debrief contrafactual**, **rotulagem de setups** e **realismo dos dados**.

A adição do **score de processo**, do **heatmap de fraquezas**, do **debrief expandido em quatro eixos**, do **journal por decisão**, do **skip justificado** e do **aviso de armadilha** (Tier 2, #5, #6, #7, #8, #9, #11) fecha o ciclo: o app agora separa boas decisões de bons resultados, diz exatamente onde a edge do usuário está faltando, explica *por que* o outro lado perdeu, mantém um registro persistente e exportável de cada decisão, pede que o usuário justifique os skips, e avisa em tempo real sobre as armadilhas mais comuns.

A próxima fronteira é o **realismo do gerador** (#4) — enquanto os dados não forem realistas, o resto é rodinha de bicicleta em pista sintética.

---

*Trading Tape Puzzles · Roadmap de Melhorias · v1.3 · 32 itens · 4 tiers · 10 entregues · 22 pendentes*
