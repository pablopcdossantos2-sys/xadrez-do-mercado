# Trading Tape Puzzles

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

Cada puzzle apresenta 82 barras de histórico e solicita uma decisão. No modo Padrão, as 38 barras futuras podem ser reproduzidas barra a barra, com bracket ajustável e Flatten. O resultado inclui avaliação baseada em regras, ELO, resultado em R, debrief e contrafactuais.

## Modos de treinamento

- **Padrão:** decisão + bracket ajustável + replay manual/automático.
- **Blind tape:** durante a decisão, oculta contexto, playbook, indicadores, volume e rótulos explícitos de preço/tempo; esses elementos voltam após a escolha.
- **Speed run:** 10 decisões dentro de uma janela global de 15 minutos, sem debrief intermediário; cada rodada é avaliada automaticamente e a próxima é carregada sem replay manual.

## Recursos

- Geração procedural de séries OHLCV sintéticas.
- MES e MNQ nos timeframes 1m, 5m, 15m e 1h.
- Candles, volume, VWAP, EMA 20, DEMA e níveis de sessão.
- Classificador de setups: Liquidity Sweep, VWAP Reclaim/Rejection, Opening Range Breakout, Failed Breakout/Breakdown, Trend Pullback, Range Fade, Momentum Push e Consolidation.
- Analista baseado em regras com bracket de referência de 12 pontos de stop por 24 pontos de alvo.
- Debrief contrafactual, detecção de armadilhas, Skip justificado e Freeze de sequência.
- ELO, precisão, score de processo, streak e breakdown por setup, direção, timeframe e instrumento.
- Journal local com até 200 decisões e exportação em JSON/CSV.
- Interface bilíngue EN/PT-BR, som opcional e atalhos de teclado.
- Dificuldade adaptativa, modo Only structure vs Full context, relógio visual de sessão e alerta de revenge trade.
- Testes de funções puras com Vitest.

## Arquitetura

O projeto foi migrado da implementação monolítica para **Vite + React + TypeScript**. A interface está em `src/App.tsx`; análise em `src/analytics.ts`; geração de dados em `src/data.ts`; persistência em `src/storage.ts`; traduções em `src/translations.ts`; estado em `src/reducer.ts`; tipos em `src/types.ts`; e entrada React em `src/main.tsx`.

O estado interativo é centralizado em `useReducer`, evitando uma coleção de estados locais interdependentes.

## Verificação

- `npm run typecheck` — checagem TypeScript.
- `npm run build` — checagem e build de produção.
- `npm run audit` — auditoria estrutural da migração, modos, runtime e traduções.

## Escopo e limitações

- Os dados atuais são sintéticos e gerados proceduralmente; não há feed histórico real de MES/MNQ.
- A avaliação do analista usa regras e a janela futura simulada. Isso não constitui validação de estratégia nem demonstra capacidade preditiva.
- O projeto é uma ferramenta de treinamento e não executa ordens no mercado.

## Roadmap executado nesta versão

Foram implementadas as pendências **10. Dificuldade adaptativa**, **15. Blind tape**, **16. Only structure vs Full context**, **17. Replay reverso pós-resultado**, **18. Session clock visual**, **19. Speed run**, **20. Revenge trade warning**, **29. Migrar para Vite + React + TypeScript**, **30. Testes para funções puras** e **32. Estado com useReducer**. Detalhes: [notas de implementação](docs/roadmap-implementation.md).

## Documentação

- [Roadmap em português](docs/roadmap.pt-BR.md)
- [Roadmap em inglês](docs/roadmap.en.md)
- [Notas de implementação](docs/roadmap-implementation.md)
- [Tutorial para criação de puzzles — português](docs/tutorial-create-puzzles.pt-BR.md)
- [Puzzle creation tutorial — English](docs/tutorial-create-puzzles.md)

## 👤 Autoria e desenvolvimento

Trading Tape Puzzles é uma ferramenta de treinamento baseada em navegador, desenvolvida de forma independente por Pablo Phillipe Cândido dos Santos, destinada ao exercício de tomada de decisão de day traders de futuros por meio de puzzles de price action, replay de operações e debrief contrafactual.

O desenvolvimento contou com a utilização de ferramentas de inteligência artificial generativa como recurso auxiliar no processo de desenvolvimento, mantendo-se sob responsabilidade do autor a concepção, implementação, integração e verificação do projeto.

Currículo Lattes: [http://lattes.cnpq.br/9500873674712528](http://lattes.cnpq.br/9500873674712528)
