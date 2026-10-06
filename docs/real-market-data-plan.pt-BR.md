# Xadrez do Mercado — Plano de dados históricos reais

O objetivo desta fase é substituir progressivamente o OHLCV sintético por **pregões históricos reais**, sem qualquer dependência de dados em tempo real.

Para o treinamento, não importa se o pregão aconteceu ontem, há seis meses ou há cinco anos. O que importa é que a sequência de preços, volume e horários seja real e possa ser reproduzida pelo usuário como um exercício.

## Decisão arquitetural

Não teremos feed de mercado em tempo real, websocket, polling contínuo nem chave de Market Data no navegador.

A arquitetura passa a ser:

1. obter dados históricos reais;
2. selecionar pregões e janelas pedagógicas;
3. normalizar contratos e timestamps;
4. converter negócios/ticks em OHLCV;
5. armazenar os datasets históricos em um armazenamento estático/autorizado;
6. carregar uma janela real por puzzle;
7. manter o gerador sintético como fallback.

A aplicação continua sendo um frontend estático e offline-friendly.

## Fonte prioritária — B3

A B3 disponibiliza no Boletim Diário do Mercado a tabela **Negócio a negócio** para derivativos. A página de pesquisa por pregão informa explicitamente que é possível selecionar uma data retroativa para obter arquivos anteriores.

Isso é especialmente interessante para o projeto porque negócios individuais permitem reconstruir candles intraday reais e preservar o comportamento de cada pregão, em vez de depender apenas de preços de fechamento.

Referências:
- https://www.b3.com.br/pt_br/market-data-e-indices/servicos-de-dados/market-data/historico/boletins-diarios/pesquisa-por-pregao/pesquisa-por-pregao/
- https://arquivos.b3.com.br/bdi/

## Etapa 1 — Fundação de ativos e parser ✅

Concluída.

- Ativos: MES, MNQ, WINFUT e WDOFUT.
- Códigos B3 dos ativos brasileiros: WIN e WDO.
- Metadados por ativo em `src/assets.ts`.
- Parser real de OHLCV em CSV/JSON em `src/realData.ts`.
- Separação entre histórico visível e futuro do puzzle.
- Gerador sintético mantido como fallback.

## Etapa 2 — Aquisição de pregões históricos reais ✅

Primeira biblioteca funcional concluída.

Começaremos pelos ativos brasileiros:

- WINFUT;
- WDOFUT.

A primeira coleção de cada família não precisa representar anos inteiros. Um conjunto pequeno, porém diversificado, já é suficiente para validar a experiência:

- pregões de tendência;
- rompimentos e falhas;
- abertura com gap;
- reversões;
- consolidação;
- sessões de alta volatilidade;
- sessões de baixa volatilidade;
- eventos macro relevantes.

Os pregões serão escolhidos como **fontes reais de exercícios**, e não como um simples histórico financeiro exposto ao usuário.

## Etapa 3 — Pipeline histórico ✅

O pipeline deverá:

1. importar o arquivo bruto;
2. identificar contrato/ticker;
3. normalizar data e hora para Unix timestamp;
4. normalizar preço e quantidade;
5. ordenar e deduplicar negócios;
6. agregar negócio a negócio em candles de 1 minuto;
7. derivar 5m, 15m e 1h a partir do 1m;
8. preservar volume real;
9. identificar sessões e gaps;
10. separar cada janela em histórico + futuro sem vazamento.

A regra é: **nenhum dado posterior ao ponto de decisão pode participar da recomendação do analista**.

## Estado atual da biblioteca — 05/10/2026

A primeira biblioteca publicada contém **8 pregões reais da B3**: quatro de WINFUT e quatro de WDOFUT. O pipeline preserva o contrato específico de cada sessão e gera 1m, 5m, 15m e 1h a partir dos negócios individuais.

Na geração de puzzles, cada exercício histórico passa a usar **um único pregão real**. Sessões diferentes não são mais concatenadas para formar uma janela, evitando que um puzzle atravesse artificialmente o fechamento de um dia e a abertura do seguinte.

As janelas históricas adotadas são:

- 1m: 82 candles de histórico + 38 futuros;
- 5m: 72 candles de histórico + 30 futuros;
- 15m: 26 candles de histórico + 12 futuros;
- 1h: fallback sintético por enquanto, porque um único pregão B3 não contém candles suficientes para uma janela histórica intradiária útil.

Essa adaptação vale apenas para os dados reais. O gerador sintético mantém o formato original de 82 + 38 candles.

## Etapa 4 — Continuidade dos contratos

WINFUT e WDOFUT são negociados em contratos com vencimentos específicos. Portanto, os datasets não devem simplesmente concatenar códigos diferentes como se fossem um único ativo.

A camada histórica deverá guardar:

- contrato;
- ativo-base;
- vencimento;
- primeiro/último timestamp;
- origem;
- timezone;
- timeframe-base.

Uma série contínua poderá ser criada apenas quando a regra de rollover estiver explícita.

## Etapa 5 — Banco de exercícios históricos — curadoria implementada

Depois da normalização, cada sessão recebe metadados pedagógicos calculados pelo pipeline:

- direção predominante (`trend-up`, `trend-down`, `balanced`);
- volatilidade relativa (`low`, `normal`, `high`);
- gap de abertura quando comparável com o pregão anterior do mesmo contrato;
- caráter do pregão (`reversal`, `consolidation`, `breakout`, `opening-drive` ou `two-sided`);
- dificuldade (`easy`, `normal`, `hard`);
- qualidade/continuidade dos candles;
- força da tendência, posição do fechamento no range e movimento de abertura;
- ativo, contrato e data real do pregão.

A seleção dos exercícios distribui as seeds entre regimes de curadoria, para que uma grande quantidade de pregões semelhantes não domine a biblioteca.

O usuário não precisa conhecer a data durante a decisão. A data pode ser revelada apenas no resultado/debrief, para preservar a experiência de puzzle.

## Etapa 6 — Microestrutura real

Como os dados de negócio a negócio carregam informação muito mais detalhada que OHLCV, poderemos posteriormente calcular:

- volume por direção, quando inferível;
- delta;
- concentração de negócios;
- aceleração de volume;
- agressão estimada;
- comportamento antes/depois de rompimentos.

Esses recursos entram **depois** de a camada OHLCV estar estável.

## Armazenamento e licenciamento

Os dados brutos podem ser grandes e não devem entrar automaticamente no bundle do navegador.

A primeira implementação deve separar:

- código do aplicativo;
- manifesto/metadados dos datasets;
- arquivos históricos autorizados.

Quando as condições de uso permitirem redistribuição, os datasets podem ser versionados no projeto ou em um storage estático. Quando não permitirem, o aplicativo deve continuar capaz de trabalhar com arquivos importados/localmente disponibilizados.

O fato de um dado ser histórico e público não elimina a necessidade de verificar as condições aplicáveis ao seu uso e redistribuição.

## Etapa 7 — Curadoria dos puzzles ✅

Com os dados reais disponíveis, o gerador de puzzles passa a ter dois caminhos:

### Real histórico

Seleciona uma janela de um pregão real e faz o replay da sequência observada.

### Sintético

Gera uma sequência procedural para completar casos raros, testes e treinamento controlado.

A experiência do usuário permanece a mesma. A diferença fica na origem dos dados.

## Etapa 8 — Futuros estrangeiros — pipeline implementado

A fonte selecionada para **MES e MNQ reais** é o CME Globex MDP 3.0 distribuído pela Databento. O pipeline em `scripts/build-cme-historical-library.py`:

1. solicita OHLCV real de 1 minuto do contrato líder por volume;
2. resolve o `instrument_id` para o contrato CME efetivo (por exemplo, MESH5/MNQH5), sem substituir MES/MNQ por ES/NQ;
3. separa cada sessão Globex das 18:00 às 17:00 em `America/New_York`;
4. preserva RTH (09:30–16:00), contrato, timezone e volume;
5. deriva 5m, 15m e 1h localmente;
6. aplica a mesma curadoria pedagógica usada para B3;
7. mescla MES/MNQ no mesmo manifesto sem apagar WIN/WDO.

O acesso exige `DATABENTO_API_KEY`. Por padrão, o resultado é gravado em `private-data/historical/`, que está ignorado pelo Git. A publicação em `public/data/historical/` exige a flag `--acknowledge-redistribution-rights` e, no GitHub Actions, o secret `CME_REDISTRIBUTION_ALLOWED=true`. Isso impede que dados CME licenciados sejam redistribuídos publicamente por acidente.

Referências:
- https://databento.com/docs/quickstart
- https://databento.com/docs/schemas-and-data-formats/ohlcv
- https://databento.com/docs/standards-and-conventions/symbology
- https://databento.com/docs/knowledge-base/datasets
- https://www.cmegroup.com/datamine.html

## Critério de conclusão

Consideraremos a migração histórica bem-sucedida quando houver:

- pelo menos um conjunto histórico real funcional para WINFUT;
- pelo menos um para WDOFUT;
- suporte a 1m, 5m e 15m;
- volume real;
- metadados de contrato/sessão;
- seleção de janelas sem vazamento do futuro;
- fallback sintético preservado;
- replay indistinguível, do ponto de vista da interface, entre uma janela real e uma janela sintética.

**Não existe requisito de dados em tempo real nesta arquitetura.**
