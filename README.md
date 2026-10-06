# Xadrez do Mercado

*Read this in other languages: [English](README-en.md)*

---

> Enigmas de xadrez, mas para day traders de futuros.

Ferramenta web de treinamento interativo para tomada de decisão em futuros, focada em leitura de price action e escolhas Long, Short ou Skip.

## Início rápido

```bash
npm install
npm run dev
```

Para produção:

```bash
npm run build
```

## Como funciona

Os puzzles sintéticos apresentam 82 barras de histórico e 38 barras futuras. Nos puzzles históricos reais, a janela é adaptada ao timeframe para permanecer integralmente dentro de um único pregão (1m: 82+38; 5m: 72+30; 15m: 26+12). No modo Padrão, as barras futuras podem ser reproduzidas barra a barra, com bracket ajustável e Flatten. O resultado inclui avaliação baseada em regras, ELO, resultado em R, debrief e contrafactuais.

As janelas podem vir de dados históricos reais ou do gerador sintético. **O produto não depende de dados em tempo real.**

## Modos de treinamento

- **Padrão:** decisão + bracket ajustável + replay manual/automático.
- **Blind tape:** durante a decisão, oculta contexto, playbook, indicadores, volume e rótulos explícitos de preço/tempo; esses elementos voltam após a escolha.
- **Speed run:** 10 decisões dentro de uma janela global de 15 minutos, sem debrief intermediário; cada rodada é avaliada automaticamente e a próxima é carregada sem replay manual.

## Recursos

- Replay de janelas históricas reais e geração procedural sintética.
- MES, MNQ, WINFUT e WDOFUT nos timeframes 1m, 5m, 15m e 1h.
- Candles, volume, VWAP, EMA 20, DEMA e níveis de sessão.
- Classificador de setups: Liquidity Sweep, VWAP Reclaim/Rejection, Opening Range Breakout, Failed Breakout/Breakdown, Trend Pullback, Range Fade, Momentum Push e Consolidation.
- Analista baseado em regras com bracket de referência de 12 pontos de stop por 24 pontos de alvo.
- Debrief contrafactual, detecção de armadilhas, Skip justificado e Freeze de sequência.
- ELO, precisão, score de processo, streak e breakdown por setup, direção, timeframe e instrumento.
- Journal local com até 200 decisões e exportação em JSON/CSV.
- Interface bilíngue EN/PT-BR, som opcional e atalhos de teclado.
- Dificuldade adaptativa, modo Only structure vs Full context, relógio visual de sessão e alerta de revenge trade.
- Validação do analista sem hindsight, confiança do sinal e respostas aceitas.
- Referências RTH/ETH, microestrutura sintética e eventos macro simulados no replay.
- ELO dinâmico, desafio diário determinístico, cartas de padrão e suporte offline via PWA.

## Arquitetura

O projeto foi migrado da implementação monolítica para **Vite + React + TypeScript**. A interface está em `src/App.tsx`; análise em `src/analytics.ts`; geração de dados em `src/data.ts`; persistência em `src/storage.ts`; traduções em `src/translations.ts`; estado em `src/reducer.ts`; tipos em `src/types.ts`; entrada React em `src/main.tsx`; metadados de ativos em `src/assets.ts`; e parser de OHLCV real em `src/realData.ts`.

O estado interativo é centralizado em `useReducer`, evitando uma coleção de estados locais interdependentes.

## Verificação

- `npm run typecheck` — checagem TypeScript.
- `npm run build` — checagem e build de produção.
- `npm run audit` — auditoria estrutural da migração, modos, runtime e traduções.
- `npm run test` — testes das funções puras.

## Escopo e limitações

- O gerador sintético continua disponível como fallback.
- **MES e MNQ já estão disponíveis no catálogo, mas ainda usam dados sintéticos; a biblioteca histórica real atual é somente WINFUT e WDOFUT.**
- Para WINFUT/WDOFUT, 1m, 5m e 15m podem usar puzzles históricos reais de um único pregão; 1h permanece sintético por enquanto.
- A integração de dados reais está sendo orientada para **datasets históricos**, não para streaming em tempo real.
- A prioridade histórica é WINFUT e WDOFUT.
- Dados históricos brutos podem ter regras próprias de uso/redistribuição; o projeto deve manter separados o código e os arquivos de mercado quando necessário.
- WINFUT e WDOFUT usam os códigos de produto B3 WIN e WDO, respectivamente.
- A avaliação do analista usa somente o histórico disponível até o ponto de decisão. Isso não valida uma estratégia nem demonstra capacidade preditiva.
- O projeto é uma ferramenta de treinamento e não executa ordens no mercado.

## Documentação

- [Roadmap em português](docs/roadmap.pt-BR.md)
- [Roadmap em inglês](docs/roadmap.en.md)
- [Notas de implementação](docs/roadmap-implementation.md)
- [Plano de dados históricos reais](docs/real-market-data-plan.pt-BR.md)
- [Tutorial para criação de puzzles — português](docs/tutorial-create-puzzles.pt-BR.md)
- [Puzzle creation tutorial — English](docs/tutorial-create-puzzles.md)

## 👤 Autoria e desenvolvimento

Xadrez do Mercado é uma ferramenta de treinamento baseada em navegador, desenvolvida de forma independente por Pablo Phillipe Cândido dos Santos, destinada ao exercício de tomada de decisão de day traders de futuros por meio de puzzles de price action, replay de operações e debrief contrafactual.

O desenvolvimento contou com a utilização de ferramentas de inteligência artificial generativa como recurso auxiliar no processo de desenvolvimento, mantendo-se sob responsabilidade do autor a concepção, implementação, integração e verificação do projeto.

Currículo Lattes: [http://lattes.cnpq.br/9500873674712528](http://lattes.cnpq.br/9500873674712528)
