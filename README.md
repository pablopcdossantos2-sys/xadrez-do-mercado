# Xadrez do Mercado

*Read this in other languages: [English](README-en.md)*

---

> Enigmas de xadrez, mas para day traders de futuros.

Aplicação web de treinamento interativo para tomada de decisão em mercados futuros, focada em leitura de price action e escolhas Long, Short ou Skip.

## Instalação e execução — passo a passo

Esta seção foi escrita pensando também em quem **não costuma usar terminal ou GitHub**.

### 1. O que você precisa instalar antes

Para executar o projeto no seu computador, é necessário ter o **Node.js 20.19 ou superior**. O `npm`, usado para instalar as dependências do projeto, já acompanha o Node.js.

Depois de instalar o Node.js, abra o **Terminal**, **PowerShell** ou **Prompt de Comando** e digite:

```bash
node --version
npm --version
```

Se os dois comandos mostrarem números de versão, a instalação está pronta.

> No Windows, você pode abrir o PowerShell pesquisando por **PowerShell** no menu Iniciar.

### 2. Obtenha os arquivos do projeto

Você pode fazer isso de duas formas.

#### Opção A — mais simples: baixar um arquivo ZIP

Esta opção não exige Git.

1. Abra a página do repositório no GitHub.
2. Clique no botão **Code**.
3. Escolha **Download ZIP**.
4. Quando o download terminar, extraia o arquivo ZIP para uma pasta de sua preferência.
5. Abra essa pasta extraída.

Exemplo de pasta:

```text
C:\Users\SeuNome\Documents\xadrez-do-mercado
```

#### Opção B — usando Git

Se você já tiver o Git instalado, também pode clonar o repositório:

```bash
git clone https://github.com/pablopcdossantos2-sys/xadrez-do-mercado.git
cd xadrez-do-mercado
```

Se você nunca utilizou Git, a **Opção A (Download ZIP)** é suficiente.

### 3. Abra o terminal dentro da pasta do projeto

O terminal precisa estar aberto **na mesma pasta onde está o arquivo `package.json`**.

No Windows, uma forma simples é:

1. abra a pasta do projeto no Explorador de Arquivos;
2. clique na barra onde aparece o caminho da pasta;
3. digite `powershell`;
4. pressione **Enter**.

Uma janela do PowerShell será aberta já na pasta correta.

### 4. Instale as dependências

Digite:

```bash
npm install
```

Esse comando baixa automaticamente as bibliotecas necessárias, como React, Vite e Lightweight Charts.

Normalmente ele precisa ser executado apenas na primeira vez, ou quando as dependências do projeto forem alteradas.

### 5. Execute a aplicação em modo de desenvolvimento

Digite:

```bash
npm run dev
```

O terminal exibirá um endereço semelhante a:

```text
http://localhost:5173/
```

Abra esse endereço no navegador.

> Enquanto estiver usando a aplicação dessa forma, **mantenha a janela do terminal aberta**. Para encerrar o servidor, volte ao terminal e pressione `Ctrl + C`.

### 6. Opcional: carregar os samples históricos reais de MES e MNQ

A ferramenta funciona mesmo sem esta etapa, utilizando o fallback sintético quando necessário.

Para baixar e preparar os samples gratuitos da FirstRate Data para uso local, execute:

```bash
npm run historical:firstrate:sample
```

Depois, inicie normalmente:

```bash
npm run dev
```

Esses dados são armazenados localmente em `private-data/` e não são publicados no build de produção.

### 7. Gerar a versão compilada para produção

Se a intenção for criar os arquivos finais da aplicação, execute:

```bash
npm run build
```

Esse comando:

1. verifica o código TypeScript;
2. compila e otimiza a aplicação com o Vite;
3. cria a pasta `dist/`, que contém os arquivos prontos para publicação em um servidor web.

### 8. Testar localmente a versão compilada

Depois de executar `npm run build`, você pode visualizar a versão de produção com:

```bash
npm run preview
```

O terminal mostrará um endereço local. Abra-o no navegador da mesma forma que no modo de desenvolvimento.

### Resumo para quem só quer executar o projeto

Depois de baixar e extrair o projeto, os três comandos essenciais são:

```bash
npm install
npm run dev
```

E, quando quiser gerar a versão final compilada:

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

- Replay de janelas históricas reais com curadoria por regime e geração procedural sintética.
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
- WINFUT/WDOFUT usam a biblioteca B3 real em 1m, 5m e 15m; 1h continua sintético nesses ativos.
- MES/MNQ podem usar gratuitamente os samples reais da FirstRate em desenvolvimento local com `npm run historical:firstrate:sample`. Esses arquivos ficam em `private-data/`, não são versionados nem entram no build de produção. Sem a biblioteca local, o fallback sintético é mantido.
- A integração de dados reais está sendo orientada para **datasets históricos**, não para streaming em tempo real.
- A curadoria histórica cobre WINFUT/WDOFUT e o pipeline estrangeiro cobre MES/MNQ reais sem usar ES/NQ como substitutos.
- Dados históricos brutos podem ter regras próprias de uso/redistribuição; por isso os samples FirstRate permanecem privados/local-only e a biblioteca B3 pública fica separada.
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

Xadrez do Mercado é uma aplicação web de treinamento interativo, desenvolvida de forma independente por Pablo Phillipe Cândido dos Santos, destinada ao exercício de tomada de decisão de day traders de futuros por meio de puzzles de price action, replay de sessões históricas reais quando disponíveis e geração sintética como fallback, com debrief contrafactual e registro local de desempenho.

O desenvolvimento contou com a utilização de ferramentas de inteligência artificial generativa como recurso auxiliar no processo de desenvolvimento, mantendo-se sob responsabilidade do autor a concepção, implementação, integração e verificação do projeto.

Currículo Lattes: [http://lattes.cnpq.br/9500873674712528](http://lattes.cnpq.br/9500873674712528)
