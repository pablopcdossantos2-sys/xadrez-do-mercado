# Trading Tape Puzzles — Roadmap de Melhorias

> **Documento Estratégico** · v1.1
>
> 32 melhorias para transformar o Tape Puzzles de um jogo de adivinhação em uma ferramenta real de treino.

Cada item é classificado por **impacto no aprendizado do usuário**, considerando também esforço de implementação, dependências técnicas e alinhamento com o objetivo declarado do projeto: *"enigmas de xadrez para day traders de futuros"*.

**Resumo:** 32 itens · 4 tiers · 6 entregues · 26 pendentes

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

Estes são os itens que separam um *quiz de direção* de uma *ferramenta de treino deliberado*. Todos os outros tiers dependem destes para fazer sentido pedagógico.

### 1. Debrief contrafactual

**Esforço:** Baixo · **Status:** ✅ ENTREGUE

Após o resultado, mostrar o que teria acontecido com **cada alternativa** (Long, Short, Skip) contra as mesmas barras futuras.

> *Por que é o #1:* o aprendizado não acontece no acerto — acontece no *contraste*.

### 2. Playbook com setups rotulados

**Esforço:** Médio · **Status:** ✅ ENTREGUE

Marcar cada puzzle com um tipo de setup (Reclaim de VWAP, ORB, Rompimento Falho, Varredura de Liquidez, Pullback de Tendência, Fade de Range, Impulso, Consolidação) e mostrar o rótulo na sidebar.

### 3. Validação da IA contra hindsight bias

**Esforço:** Alto · **Status:** Parcial

A "resposta correta" atual é *qual lado bateu TP antes do SL* — isso é hindsight puro. Aceitar múltiplas respostas válidas, usar uma árvore de regras auditável e expor um score de confiança.

### 4. Realismo do gerador procedural

**Esforço:** Alto · **Status:** Pendente

Injetar agrupamento de volatilidade, regimes de sessão, volume correlacionado com |retorno|, gaps de abertura. Alternativa: CSV histórico real de MES/MNQ.

---

## Tier 2 · Alto

*Multiplicadores de aprendizado.*

Combatemos o vício mais comum de trader: *processo ruim com resultado bom*.

### 5. Score de processo vs. score de resultado

**Esforço:** Médio · **Status:** ✅ ENTREGUE

Um segundo score que premia decisões boas mesmo quando o mercado não coopera. Combate o result bias. A home mostra um insight comparando precisão de processo vs. precisão de resultado.

### 6. Heatmap "onde você erra"

**Esforço:** Médio · **Status:** ✅ ENTREGUE

Estatísticas agregadas por setup, timeframe, horário, direção e instrumento. O usuário descobre onde é fraco. Buckets com menos de 2 amostras são ocultados.

### 7. Debrief expandido "Why not the other side?"

**Esforço:** Baixo · **Status:** Pendente

Após uma perda, bullets objetivos: estrutura, volume, localização, confluência.

### 8. Journal por decisão com export

**Esforço:** Baixo · **Status:** Pendente

Snapshot do gráfico, contexto, decisões, R final. Export em JSON/CSV.

### 9. Skip justificado (com motivo)

**Esforço:** Baixo · **Status:** Pendente

Ao Skip, perguntar "Por quê?" e comparar com a razão real da IA. Treina vocabulário técnico.

### 10. Dificuldade adaptativa

**Esforço:** Médio · **Status:** Pendente

Manter o usuário na zona de fluxo (60–75% de precisão) ajustando o ruído do gerador.

### 11. Aviso de "armadilha do dia"

**Esforço:** Médio · **Status:** Pendente

Detectar padrões enganosos e mostrar uma nota lateral antes da decisão, sem entregar a resposta.

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

ΔELO depende da dificuldade do puzzle. Auto-calibra a progressão.

### 22. Patentes / níveis

**Esforço:** Baixo · **Status:** ✅ ENTREGUE

Novato · Em Desenvolvimento · Consistente · Afiado · Institucional.

### 23. Streak com "freeze"

**Esforço:** Baixo · **Status:** Pendente

1 freeze/dia para não zerar a sequência. Reduz fricção de retorno.

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

Cada setup dominado vira uma "carta". Gamifica o estudo.

### 28. Som sutil

**Esforço:** Baixo · **Status:** Pendente

Chime ao bater TP, thud ao stopar. Desligável.

### 29. Migrar para Vite + React + TypeScript

**Esforço:** Alto · **Status:** Recomendado

Quando o single-file passar de ~2.000 LOC. Estrutura em módulos.

### 30. Testes para funções puras

**Esforço:** Baixo · **Status:** Pendente

classifySetup, computeVWAP, computeATR, analyzePuzzle.

### 31. Modo offline (service worker)

**Esforço:** Médio · **Status:** Pendente

PWA com cache. Treina no avião.

### 32. Estado com useReducer

**Esforço:** Baixo · **Status:** Pendente

Substituir os 12 useState interdependentes. Facilita testes e evita bugs de sincronização.

---

## Matriz de priorização

Visão compacta para decidir a ordem de implementação. **Comece pelo quadrante verde.**

| # | Item | Tier | Esforço | Impacto | Status |
|---|------|------|---------|---------|--------|
| 1 | Debrief contrafactual | T1 | Baixo | Altíssimo | ✅ ENTREGUE |
| 2 | Playbook com setups rotulados | T1 | Médio | Altíssimo | ✅ ENTREGUE |
| 5 | Score de processo vs. resultado | T2 | Médio | Alto | ✅ ENTREGUE |
| 6 | Heatmap "onde você erra" | T2 | Médio | Alto | ✅ ENTREGUE |
| 8 | Journal por decisão com export | T2 | Baixo | Alto | Pendente |
| 3 | Validação da IA (hindsight bias) | T1 | Alto | Altíssimo | Parcial |
| 4 | Realismo do gerador procedural | T1 | Alto | Altíssimo (longo prazo) | Pendente |
| 10 | Dificuldade adaptativa | T2 | Médio | Alto | Pendente |
| 21 | ELO real (Glicko) | T4 | Médio | Médio-alto | Pendente |
| 29 | Migração para Vite + TS | T4 | Alto | Habilitador | Recomendado |

### Quick wins — faça primeiro

- ✅ Debrief contrafactual
- ✅ Playbook com setups rotulados
- ✅ Score de processo vs. resultado
- ✅ Heatmap "onde você erra"
- ✅ Patentes / níveis
- ✅ Onboarding em 30 segundos
- → Skip justificado (#9)
- → Debrief expandido (#7)
- → Journal exportável (#8)

### Investimentos estruturais

- → Validação da IA (#3)
- → Realismo do gerador (#4)
- → Dificuldade adaptativa (#10)
- → Migração para Vite + TS (#29)

---

## Resumo executivo

Hoje, o Tape Puzzles é um *jogo bonito de adivinhar direção*. Para virar uma **ferramenta de treino real**, o pulo do gato está em três itens do Tier 1: **debrief contrafactual**, **rotulagem de setups** e **realismo dos dados**.

Com esses três, o usuário sai de cada puzzle sabendo *o quê* errou, *por quê*, e *o que o mercado teria feito* em qualquer direção — que é exatamente o que *"xadrez para traders"* deveria entregar.

A adição do **score de processo** e do **heatmap de fraquezas** (Tier 2, #5 e #6) fecha o ciclo: o app agora separa boas decisões de bons resultados, e diz ao usuário exatamente onde a edge dele está faltando.

---

*Trading Tape Puzzles · Roadmap de Melhorias · v1.1 · 32 itens · 4 tiers · 6 entregues · 26 pendentes*