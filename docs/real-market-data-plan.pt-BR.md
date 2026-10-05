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

## Etapa 2 — Aquisição de pregões históricos reais

Prioridade imediata.

Começaremos pelos ativos brasileiros:

- WINFUT;
- WDOFUT;
- BIT.

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

## Etapa 3 — Pipeline histórico

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

## Etapa 5 — Banco de exercícios históricos

Depois da normalização, cada janela poderá receber metadados pedagógicos:

- setup predominante;
- regime de volatilidade;
- período do pregão;
- presença de gap;
- presença de evento;
- dificuldade;
- qualidade dos dados;
- ativo e contrato;
- data real do pregão.

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

## Etapa 7 — Curadoria dos puzzles

Com os dados reais disponíveis, o gerador de puzzles passa a ter dois caminhos:

### Real histórico

Seleciona uma janela de um pregão real e faz o replay da sequência observada.

### Sintético

Gera uma sequência procedural para completar casos raros, testes e treinamento controlado.

A experiência do usuário permanece a mesma. A diferença fica na origem dos dados.

## Etapa 8 — Futuros estrangeiros

A próxima frente é montar a biblioteca real de **MES e MNQ** em fonte autorizada, mantendo o mesmo contrato de dados já usado no histórico brasileiro. A biblioteca estrangeira deverá preservar sessão regular, horário de negociação, contrato, volume e regras de rollover, sem misturar dados de vencimentos diferentes.

Neste momento, MES e MNQ permanecem com o gerador sintético e não fazem parte da biblioteca histórica real publicada.

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
