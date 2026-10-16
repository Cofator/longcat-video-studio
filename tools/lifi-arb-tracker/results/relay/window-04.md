# Relatorio da rota Relay (USDC Base <-> USDT Polygon)

Periodo: 16/10 08:03 ate 16/10 09:17 (Brasilia)  
Cotacoes validas: 75 | erros: 7 | ciclos: 38 | intervalo tipico: 120s  

Unidade: bps (1 bp = 0,01%). Resultado liquido de gas estimado. Positivo = a ida+volta fecha acima do valor inicial.

## Sem a taxa da LI.FI (o seu caso)

| | n | min | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|
| 2,000 ida | 37 | +3.0 | +3.4 | +3.6 | +3.8 | 100% |
| 2,000 volta | 37 | -14.4 | -12.5 | -12.1 | -12.1 | 0% |
| **2,000 ida+volta** | 37 | -11.4 | -9.3 | -8.8 | -8.7 | 0% |

## Como cotado (com a taxa)

| | n | min | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|
| 2,000 ida | 37 | -22.0 | -21.6 | -21.4 | -21.2 | 0% |
| 2,000 volta | 37 | -39.4 | -37.5 | -37.1 | -37.0 | 0% |
| **2,000 ida+volta** | 37 | -61.2 | -59.2 | -58.7 | -58.6 | 0% |

## Janelas de oportunidade (sem taxa, liquido de gas)

Janela = ciclos seguidos com ida+volta positiva. A duracao tem erro de ate um intervalo de coleta.

| valor | ciclos > 0 | janelas | duracao mediana | duracao maxima | melhor (bps) | melhor (US$) |
|---|---|---|---|---|---|---|
| 2,000 | 0/37 | 0 | 0s | 0s | -8.7 | -1.75 |

## Por hora (Brasilia): % de ciclos positivos e media (sem taxa)

| hora | 2,000 |
|---|---|
| 16/10 08h | 0% (-9.4) |
| 16/10 09h | 0% (-9.3) |

## Veredito

**Sem oportunidade na rota Relay** neste periodo (mediana -9.3 bps).

Limitacoes: sao cotacoes, nao execucoes; o preco pode nao se confirmar na execucao e o solver pode limitar volume.

## Erros

- 7x `HTTP N: {"message":"Rate limit exceeded, retry in N minutes","code"`
