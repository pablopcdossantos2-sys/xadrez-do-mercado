# Xadrez do Mercado — Plano de dados reais

Esta etapa migra os exercícios de OHLCV sintético para dados reais de forma incremental, sem colocar credenciais de Market Data no frontend.

## Por que não ligar um feed real diretamente agora?

A B3 informa que o acesso direto ao Market Data em tempo real exige contratação, e que o acesso indireto deve ser feito por distribuidores autorizados. A política também distingue uso interno de distribuição externa e display/non-display.

Por isso, o navegador deve receber apenas dados que o backend/provedor já tenha autorizado para o usuário final. A chave/licença do fornecedor não deve ser embutida no bundle Vite.

## Etapa 1 — Fundação de ativos e formato ✅

Concluída nesta versão.

- Ativos: MES, MNQ, WINFUT, WDOFUT e BIT.
- Metadados por ativo em `src/assets.ts`.
- Códigos B3 dos ativos brasileiros: WIN, WDO e BIT.
- Parser real de OHLCV em CSV/JSON em `src/realData.ts`.
- Separação de histórico e futuro preserva a mecânica atual de 82 barras históricas.
- O gerador sintético continua como fallback de desenvolvimento.

## Etapa 2 — Dataset histórico real

Próximo passo recomendado.

1. Escolher um distribuidor/licença compatível com uso dos dados no Xadrez do Mercado.
2. Obter histórico intraday suficiente para exercícios de 1m, 5m e 15m.
3. Normalizar contratos por vencimento antes de montar séries contínuas.
4. Salvar snapshots/arquivos versionados no backend ou storage autorizado.
5. Transformar cada janela histórica em um puzzle sem usar barras posteriores para gerar a resposta do analista.

Nesta etapa, o frontend consumirá somente um endpoint autorizado, por exemplo um manifest por ativo/timeframe.

## Etapa 3 — Feed real no runtime

Criar um pequeno backend/proxy:

`GET /api/market-data/{asset}/{timeframe}?date=YYYY-MM-DD`

O backend será responsável por autenticação, rate limiting, cache e tradução do fornecedor para o formato OHLCV do app.

O frontend continuará usando `loadRealDataset()`; nenhuma API key será exposta no JavaScript público.

## Etapa 4 — Replay profissional

Depois de termos dados reais suficientes:

- detectar sessão RTH/ETH com base no timestamp do dataset;
- preservar gaps reais;
- usar volume real;
- adicionar rollover/continuação de contratos;
- exibir data, vencimento e origem do dataset;
- impedir puzzles quebrados por baixa liquidez, feriados ou falhas de feed.

## Etapa 5 — Microestrutura real

Somente depois do OHLCV estável.

Adicionar trades/market-by-trade e, quando a licença permitir, book/imbalance real. A microestrutura sintética atual deve continuar disponível como modo de fallback.

## Etapa 6 — Curadoria dos exercícios

A camada de puzzle deve selecionar janelas reais por critérios pedagógicos:

- rompimento e falha;
- reclaim/rejection de VWAP;
- expansão de volatilidade;
- abertura/gap;
- reversão;
- tendência;
- consolidação.

O analista continuará sendo calculado apenas com dados anteriores ao ponto de decisão.

## Critério de conclusão da migração

Consideraremos o modo real pronto quando existirem pelo menos um dataset histórico autorizado para cada ativo brasileiro (WINFUT, WDOFUT e BIT), replay intraday estável, metadados de contrato/sessão e testes que comprovem ausência de vazamento do futuro.

O objetivo é trocar a fonte dos dados sem desmontar a lógica pedagógica já existente.
