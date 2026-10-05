# Biblioteca histórica de mercado

Esta pasta contém a saída compacta do pipeline de ingestão histórica do **Xadrez do Mercado**.

Os arquivos do diretório `public/data/historical/` são candles derivados de dados reais de negócio a negócio de derivativos B3. Os ZIPs brutos não são versionados.

## Estrutura

```
public/data/historical/
├── manifest.json
├── WINFUT/<contrato>/<data>/{1m,5m,15m,1h}.json
├── WDOFUT/<contrato>/<data>/{1m,5m,15m,1h}.json

```

Cada sessão preserva o contrato específico negociado naquele pregão. A seleção do contrato dominante usa a quantidade negociada no arquivo do dia.

## Construção

Requer Python 3.10+:

```bash
python scripts/build-historical-library.py
```

A primeira biblioteca publicada contém 8 sessões reais: quatro de WINFUT e quatro de WDOFUT, cobrindo 23/09/2026 a 30/09/2026. O pipeline prioriza diversidade de volatilidade, direção e atividade e pode ser regenerado com uma janela maior.

O mesmo script é executado pelo workflow de bootstrap do GitHub Actions.

## Princípios

- 1 minuto é a granularidade-base.
- 5m, 15m e 1h são derivados de 1m.
- Volume é a soma da quantidade negociada.
- Gaps reais e minutos sem negócio não são preenchidos artificialmente.
- A janela de puzzle é escolhida depois, sobre candles já históricos.
- Não há geração sintética dentro desta biblioteca.
