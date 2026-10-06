# Biblioteca histórica de mercado

Esta pasta contém a saída compacta dos pipelines de dados reais do **Xadrez do Mercado**.

## Fontes

- **WINFUT / WDOFUT:** negócios individuais da B3, agregados localmente em OHLCV.
- **MES / MNQ (zero-budget/local):** samples gratuitos da FirstRate Data, processados para `private-data/firstrate/` e servidos apenas pelo Vite em desenvolvimento local.
- **MES / MNQ (opcional futuro):** CME Globex MDP 3.0 via Databento, caso haja acesso/licença autorizados.

Os arquivos brutos não são versionados.

## Estrutura

```
public/data/historical/
├── manifest.json
├── WINFUT/<contrato>/<data>/{1m,5m,15m,1h}.json
├── WDOFUT/<contrato>/<data>/{1m,5m,15m,1h}.json
├── MES/<contrato>/<data>/{1m,5m,15m,1h}.json
└── MNQ/<contrato>/<data>/{1m,5m,15m,1h}.json
```

Pastas MES/MNQ só aparecem no bundle público quando uma execução autorizada do pipeline CME tiver ocorrido.

## Curadoria pedagógica

Cada sessão recebe metadados para tendência, volatilidade relativa, gap, reversão, consolidação, breakout, opening drive, dificuldade e qualidade/continuidade. A seleção final usa cobertura de regimes, e não apenas recência ou volume.

O gerador de puzzles usa esses regimes para distribuir exercícios entre comportamentos distintos do mercado. Um puzzle histórico nunca concatena pregões diferentes.

## Construção B3

Requer Python 3.10+:

```bash
npm run historical:b3
```

O pipeline varre um pool maior de candidatos e escolhe sessões que maximizam diversidade pedagógica.

## Construção gratuita local — MES/MNQ

```bash
npm run historical:firstrate:sample
npm run dev
```

A aplicação detecta automaticamente `private-data/firstrate/manifest.json` durante o desenvolvimento e mescla MES/MNQ à biblioteca pública B3. O diretório privado não é copiado para o build.

## Construção CME autorizada — MES/MNQ

Opcionalmente, se houver acesso licenciado, defina `DATABENTO_API_KEY` e execute:

```bash
npm run historical:cme
```

Por segurança, a saída padrão é `private-data/historical/` e não é versionada. Para publicar no bundle web é necessário possuir os direitos correspondentes e executar explicitamente:

```bash
python scripts/build-cme-historical-library.py \
  --output-root public/data/historical \
  --acknowledge-redistribution-rights
```

O workflow de curadoria só publica CME quando `DATABENTO_API_KEY` estiver configurado e `CME_REDISTRIBUTION_ALLOWED=true`.

## Princípios

- 1 minuto é a granularidade-base.
- 5m, 15m e 1h são derivados localmente de 1m.
- Volume real é preservado.
- Minutos sem negócio não são preenchidos artificialmente.
- Contratos de vencimentos diferentes nunca são concatenados dentro de um puzzle.
- WIN/WDO usam pregões B3 isolados.
- MES/MNQ usam sessões Globex isoladas (18:00–17:00, America/New_York), com RTH 09:30–16:00 registrado no manifesto.
- Não há geração sintética dentro da biblioteca histórica.
