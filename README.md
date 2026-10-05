# Trading Tape Puzzles

*Read this in other languages: [English](README-en.md)*

---

> Enigmas de xadrez, mas para day traders de futuros.

Ferramenta de treinamento baseada em navegador para exercício de tomada de decisão em futuros, com foco em leitura de price action e escolhas Long, Short ou Skip.

## Início rápido

Abra `index.html` em um navegador moderno. Não há etapa local de build ou instalação.

O projeto é executado no navegador e carrega suas dependências de interface a partir de CDNs. Não há backend, conta de usuário ou integração com corretora.

## Como funciona

### 1. Decisão

O sistema apresenta uma janela de histórico com 82 barras e solicita uma única decisão: Long, Short ou Skip. O painel de contexto exibe informações como VWAP, ATR, médias móveis, níveis da sessão, instrumento, timeframe e playbook identificado.

### 2. Replay

Após a decisão, as 38 barras futuras são reproduzidas uma a uma. É possível ajustar stop loss e take profit, reproduzir automaticamente, avançar barra a barra, alterar a velocidade e encerrar a operação com Flatten.

### 3. Resultado e debrief

A etapa final apresenta o resultado da operação, variação de ELO, score de processo, debrief e os resultados contrafactuais das alternativas Long, Short e Skip. Para decisões Skip, o sistema também registra e compara o motivo informado.

## Recursos implementados

- Geração procedural de séries intradiárias sintéticas em OHLCV.
- Suporte aos instrumentos MES e MNQ e aos timeframes 1m, 5m, 15m e 1h.
- Gráficos de candles com volume, VWAP, EMA, DEMA, níveis de sessão e linhas de entrada, stop e alvo.
- Classificador de setups, incluindo Liquidity Sweep, VWAP Reclaim/Rejection, Opening Range Breakout, Failed Breakout/Breakdown, Trend Pullback, Range Fade, Momentum Push e Consolidation.
- Analista baseado em regras para comparar Long, Short e Skip, usando um bracket de referência de 12 pontos de stop e 24 pontos de alvo.
- Debrief contrafactual e leitura por quatro eixos: estrutura, volume, localização e confluência.
- Detecção de algumas armadilhas de tape, justificativa para Skip e mecânica de proteção de streak por Freeze.
- Estatísticas persistentes no navegador, incluindo ELO, acurácia, streak, resultado em R e breakdown por setup, direção, timeframe e instrumento.
- Journal local das decisões, mantido em até 200 entradas, com exportação para JSON e CSV.
- Interface bilíngue EN/PT-BR, feedback sonoro e atalhos de teclado.

## Escopo atual e limitações

- As séries utilizadas pelo gerador atual são sintéticas e geradas proceduralmente; o projeto não usa, nesta implementação, um feed histórico real de MES/MNQ.
- A classificação do analista é baseada em regras e nos resultados da janela futura simulada. Ela não constitui, por si só, validação de uma estratégia de trading nem demonstra capacidade preditiva.
- O projeto é uma ferramenta de treinamento e não envia ordens ao mercado nem se conecta a uma corretora.

## Documentação

- [Roadmap em português](docs/roadmap.pt-BR.md)
- [Roadmap em inglês](docs/roadmap.en.md)
- [Tutorial para criação de puzzles — português](docs/tutorial-create-puzzles.pt-BR.md)
- [Tutorial para criação de puzzles — inglês](docs/tutorial-create-puzzles.md)

## 👤 Autoria e desenvolvimento

Trading Tape Puzzles é uma ferramenta de treinamento baseada em navegador, desenvolvida de forma independente por Pablo Phillipe Cândido dos Santos, destinada ao exercício de tomada de decisão de day traders de futuros por meio de puzzles de price action, replay de operações e debrief contrafactual.

O desenvolvimento contou com a utilização de ferramentas de inteligência artificial generativa como recurso auxiliar no processo de desenvolvimento, mantendo-se sob responsabilidade do autor a concepção, implementação, integração e verificação do projeto.

Currículo Lattes: [http://lattes.cnpq.br/9500873674712528](http://lattes.cnpq.br/9500873674712528)