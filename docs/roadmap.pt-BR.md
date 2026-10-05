# Xadrez do Mercado — Roadmap de Melhorias

> **Documento Estratégico** · v1.9
>
> 32 melhorias para transformar o Tape Puzzles de um jogo de adivinhação em uma ferramenta real de treino.

Cada item é classificado por **impacto no aprendizado do usuário**, considerando também esforço de implementação, dependências técnicas e alinhamento com o objetivo declarado do projeto: *"enigmas de xadrez para day traders de futuros"*.

**Resumo:** 32 itens · 4 tiers · 32 entregues · 0 pendentes

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

### 2. Playbook com setups rotulados
**Esforço:** Médio · **Status:** ✅ ENTREGUE

### 3. Validação da IA contra hindsight bias
**Esforço:** Alto · **Status:** ✅ ENTREGUE

A recomendação do analista usa apenas as barras históricas; um painel de confiança e múltiplas respostas aceitas explicitam a ambiguidade, enquanto o futuro fica isolado para pontuação.

### 4. Realismo do gerador procedural
**Esforço:** Alto · **Status:** ✅ ENTREGUE

O gerador sintético agora modela regimes de sessão, agrupamento persistente de volatilidade, gap de abertura de RTH, volume em U intradiário e choque determinístico de evento macro.

---

## Tier 2 · Alto

*Multiplicadores de aprendizado.*

### 5. Score de processo vs. score de resultado
**Esforço:** Médio · **Status:** ✅ ENTREGUE

### 6. Heatmap "onde você erra"
**Esforço:** Médio · **Status:** ✅ ENTREGUE

### 7. Debrief expandido "Por que não o outro lado?"
**Esforço:** Baixo · **Status:** ✅ ENTREGUE

### 8. Journal por decisão com export
**Esforço:** Baixo · **Status:** ✅ ENTREGUE

### 9. Skip justificado (com motivo)
**Esforço:** Baixo · **Status:** ✅ ENTREGUE

### 10. Dificuldade adaptativa
**Esforço:** Médio · **Status:** ✅ ENTREGUE

Uma janela móvel das últimas 20 decisões mede precisão de processo (`decisão === decisão do analista`), e não resultado bruto do trade. Um pequeno aquecimento mantém menos de cinco amostras em Normal. Abaixo de 60% seleciona Fácil; acima de 75% seleciona Difícil; entre esses limites, Normal. O gerador aplica então os multiplicadores documentados de volatilidade, força do setup e ruído. O nível ativo aparece no cabeçalho do jogo.

Mantém o usuário na zona de fluxo (60–75% de precisão). Uma janela móvel das últimas 20 decisões (correto/incorreto — **não** sorte/azar) alimenta três níveis de dificuldade: **fácil**, **normal**, **difícil**. A dificuldade modula o gerador em três eixos:

- **Volatilidade base** × 0,75 / 1,0 / 1,30 — tape mais calmo ou mais ruidoso.
- **Força do setup** × 1,25 / 1,0 / 0,70 — padrões mais claros ou mais turvos nas 15 barras antes da decisão.
- **Ruído aleatório** × 0,90 / 1,0 / 1,15 — quanto de aleatoriedade é sobreposto ao sinal.

O nível atual aparece num pequeno badge na barra superior do jogo, então o usuário sempre sabe em qual trilha está. Como a chave é o **processo** (bater com o analista), não o **resultado** (bater no alvo), é impossível escalar para "difícil" numa streak de sorte.

### 11. Aviso de "armadilha do dia"
**Esforço:** Médio · **Status:** ✅ ENTREGUE

---

## Tier 3 · Médio

*Profundidade e ferramentas.*

### 12. Níveis de verdade (RTH vs ETH)
**Esforço:** Médio · **Status:** ✅ ENTREGUE

### 13. Microestrutura sintética (tape)
**Esforço:** Alto · **Status:** ✅ ENTREGUE

### 14. Eventos macro no meio do puzzle
**Esforço:** Médio · **Status:** ✅ ENTREGUE

### 15. Modo "Blind tape"
**Esforço:** Baixo · **Status:** ✅ ENTREGUE (no repo)

### 16. Modo "Only structure" vs "Full context"
**Esforço:** Baixo · **Status:** ✅ ENTREGUE

### 17. Replay reverso pós-resultado
**Esforço:** Médio · **Status:** ✅ ENTREGUE

Após o resultado, o usuário pode explorar o mesmo puzzle com Long, Short ou Skip. As mesmas 38 barras futuras são reproduzidas a partir da entrada original, sem criar uma nova decisão contabilizada. Long/Short usam o bracket completo, Play/Pause/Step e todas as velocidades; Skip reproduz o futuro sem posição. A exploração é explicitamente não contabilizada: ELO, streak, estatísticas e journal permanecem intactos. Um banner azul identifica o modo e o botão Voltar ao resultado restaura o resultado original.

Após o resultado, o usuário pode clicar em **"Explorar outro lado"** para replay-ar o mesmo puzzle com Long, Short ou Skip — *não* para rodar os números de novo, mas para **sentir** a sequência de barras desenrolar do outro lado. O replay de exploração usa a engine completa de bracket SL/TP, Play/Pause/Step em todas as velocidades, e Flatten. Um banner azul marca a sidebar como **"Exploração — não contabilizado"**, e nada é escrito nas estatísticas ou no journal. Um botão **"Voltar ao resultado"** restaura a visão original.

É a forma mais pura de treino contrafactual: não "o que teria acontecido" como um número estático de R, mas "aqui está o que o mercado fez, e aqui está como teria sido se você tivesse estado do outro lado."

### 18. Session clock visual
**Esforço:** Baixo · **Status:** ✅ ENTREGUE

### 19. Modo "Speed run"
**Esforço:** Baixo · **Status:** ✅ ENTREGUE (no repo)

### 20. Revenge trade warning
**Esforço:** Baixo · **Status:** ✅ ENTREGUE

---

## Tier 4 · Baixo

*Polish, retenção, infra.*

### 21. Curva de ELO real (Glicko / Elo clássico)
**Esforço:** Médio · **Status:** ✅ ENTREGUE

### 22. Patentes / níveis
**Esforço:** Baixo · **Status:** ✅ ENTREGUE

### 23. Streak com "freeze"
**Esforço:** Baixo · **Status:** ✅ ENTREGUE

### 24. Onboarding em 30 segundos
**Esforço:** Baixo · **Status:** ✅ ENTREGUE

### 25. Responsividade mobile
**Esforço:** Médio · **Status:** ✅ ENTREGUE

### 26. Desafios diários com seed determinística
**Esforço:** Médio · **Status:** ✅ ENTREGUE

### 27. Cartas de padrão colecionáveis
**Esforço:** Médio · **Status:** ✅ ENTREGUE

### 28. Som sutil
**Esforço:** Baixo · **Status:** ✅ ENTREGUE

### 29. Migrar para Vite + React + TypeScript
**Esforço:** Alto · **Status:** ✅ ENTREGUE (no repo)

### 30. Testes para funções puras
**Esforço:** Baixo · **Status:** ✅ ENTREGUE

### 31. Modo offline (service worker)
**Esforço:** Médio · **Status:** ✅ ENTREGUE

### 32. Estado com useReducer
**Esforço:** Baixo · **Status:** ✅ ENTREGUE (no repo)

---

## Matriz de priorização

| # | Item | Tier | Esforço | Impacto | Status |
|---|------|------|---------|---------|--------|
| 1 | Debrief contrafactual | T1 | Baixo | Altíssimo | ✅ |
| 2 | Playbook com setups rotulados | T1 | Médio | Altíssimo | ✅ |
| 3 | Validação da IA (hindsight bias) | T1 | Alto | Altíssimo | ✅ |
| 4 | Realismo do gerador | T1 | Alto | Altíssimo (longo prazo) | ✅ |
| 5 | Score de processo vs. resultado | T2 | Médio | Alto | ✅ |
| 6 | Heatmap "onde você erra" | T2 | Médio | Alto | ✅ |
| 7 | Debrief expandido | T2 | Baixo | Alto | ✅ |
| 8 | Journal por decisão | T2 | Baixo | Alto | ✅ |
| 9 | Skip justificado | T2 | Baixo | Alto | ✅ |
| 10 | Dificuldade adaptativa | T2 | Médio | Alto | ✅ |
| 11 | Aviso de armadilha | T2 | Médio | Alto | ✅ |
| 15 | Modo Blind tape | T3 | Baixo | Médio | ✅ (repo) |
| 17 | Replay reverso | T3 | Médio | Alto | ✅ |
| 19 | Modo Speed run | T3 | Baixo | Médio | ✅ (repo) |
| 22 | Patentes / níveis | T4 | Baixo | Médio | ✅ |
| 23 | Streak freeze | T4 | Baixo | Médio | ✅ |
| 24 | Onboarding 30s | T4 | Baixo | Médio | ✅ |
| 25 | Responsividade mobile | T4 | Médio | Médio | ✅ |
| 28 | Som sutil | T4 | Baixo | Médio | ✅ |
| 29 | Migração Vite + TS | T4 | Alto | Habilitador | ✅ (repo) |
| 32 | useReducer | T4 | Baixo | Médio | ✅ (repo) |
| 12 | Níveis RTH/ETH | T3 | Médio | Médio | ✅ |
| 13 | Microestrutura | T3 | Alto | Médio-alto | ✅ |
| 14 | Eventos macro | T3 | Médio | Médio | ✅ |
| 16 | Only structure vs Full context | T3 | Baixo | Médio | ✅ |
| 18 | Session clock | T3 | Baixo | Médio | ✅ |
| 20 | Revenge trade warning | T3 | Baixo | Médio | ✅ |
| 21 | Curva de ELO (Glicko) | T4 | Médio | Médio-alto | ✅ |
| 26 | Desafios diários | T4 | Médio | Médio | ✅ |
| 27 | Cartas colecionáveis | T4 | Médio | Baixo | ✅ |
| 30 | Testes de funções puras | T4 | Baixo | Engenharia | ✅ |
| 31 | Modo offline (PWA) | T4 | Médio | Baixo | ✅ |

### Quick wins — concluído

Todos os 32 itens do roadmap foram entregues.

### Investimentos estruturais

O roadmap foi concluído; novos trabalhos devem ser acompanhados como novos itens.

---

## Resumo executivo

**Todos os trinta e dois itens estão entregues.** O Tier 2 está completo, e os demais recursos do Tier 1 agora também estão implementados no código auditado.

Todos os itens restantes agora foram implementados, incluindo validação do analista sem hindsight, modelo sintético de mercado mais rico, níveis RTH/ETH, microestrutura sintética, eventos macro, Elo dinâmico, desafios diários, cartas colecionáveis e cache offline:

- **Validação sem hindsight** calcula a recomendação apenas com histórico e expõe confiança mais respostas aceitas.
- **Realismo sintético** modela regimes de sessão, agrupamento de volatilidade, gaps, volume em U e eventos macro.
- **Níveis RTH/ETH** e **microestrutura sintética** aparecem no contexto e durante o replay.
- **Elo dinâmico** usa matemática de score esperado e rating adversário ligado à dificuldade.
- **Desafios diários** usam seeds determinísticas por data.
- **Cartas de padrão** são coletadas e persistidas por setup.
- **Modo offline** mantém o app disponível via cache após um carregamento online.

O roadmap foi concluído; novos trabalhos devem ser acompanhados como novos itens.

---

*Trading Tape Puzzles · Roadmap de Melhorias · v1.9 · 32 itens · 4 tiers · 32 entregues · 0 pendentes*
