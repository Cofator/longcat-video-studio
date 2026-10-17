# Relatorio da rota Relay (USDC Base <-> USDT Polygon)

Periodo: 16/10 09:53 ate 16/10 11:07 (Brasilia)  
Cotacoes validas: 74 | erros: 8 | ciclos: 38 | intervalo tipico: 120s  

Unidade: bps (1 bp = 0,01%). Resultado liquido de gas estimado. Positivo = a ida+volta fecha acima do valor inicial.

## Sem a taxa da LI.FI (o seu caso)

| | n | min | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|
| 2,000 ida | 36 | +3.0 | +3.2 | +3.4 | +8.0 | 100% |
| 2,000 volta | 36 | -14.5 | -12.8 | -12.7 | -11.3 | 0% |
| **2,000 ida+volta** | 36 | -11.3 | -9.9 | -9.5 | -5.1 | 0% |

## Como cotado (com a taxa)

| | n | min | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|
| 2,000 ida | 36 | -22.0 | -21.8 | -21.7 | -17.0 | 0% |
| 2,000 volta | 36 | -39.5 | -37.8 | -37.7 | -36.3 | 0% |
| **2,000 ida+volta** | 36 | -61.2 | -59.8 | -59.4 | -55.0 | 0% |

## Janelas de oportunidade (sem taxa, liquido de gas)

Janela = ciclos seguidos com ida+volta positiva. A duracao tem erro de ate um intervalo de coleta.

| valor | ciclos > 0 | janelas | duracao mediana | duracao maxima | melhor (bps) | melhor (US$) |
|---|---|---|---|---|---|---|
| 2,000 | 0/36 | 0 | 0s | 0s | -5.1 | -1.02 |

## Por hora (Brasilia): % de ciclos positivos e media (sem taxa)

| hora | 2,000 |
|---|---|
| 16/10 09h | 0% (-10.1) |
| 16/10 10h | 0% (-9.7) |
| 16/10 11h | 0% (-9.8) |

## Veredito

**Sem oportunidade na rota Relay** neste periodo (mediana -9.9 bps).

Limitacoes: sao cotacoes, nao execucoes; o preco pode nao se confirmar na execucao e o solver pode limitar volume.

## Erros

- 7x `HTTP N: {"message":"Rate limit exceeded, retry in N minutes","code"`
- 1x `HTTP N: {"message":"No available quotes for the requested transfer",`
