# Relatorio da rota Relay (USDC Base <-> USDT Polygon)

Periodo: 16/10 06:13 ate 16/10 07:27 (Brasilia)  
Cotacoes validas: 75 | erros: 7 | ciclos: 38 | intervalo tipico: 120s  

Unidade: bps (1 bp = 0,01%). Resultado liquido de gas estimado. Positivo = a ida+volta fecha acima do valor inicial.

## Sem a taxa da LI.FI (o seu caso)

| | n | min | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|
| 2,000 ida | 37 | -19.9 | +2.7 | +3.3 | +3.7 | 95% |
| 2,000 volta | 37 | -13.9 | -12.3 | -12.1 | -12.0 | 0% |
| **2,000 ida+volta** | 37 | -32.3 | -9.7 | -9.5 | -9.2 | 0% |

## Como cotado (com a taxa)

| | n | min | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|
| 2,000 ida | 37 | -44.8 | -22.3 | -21.7 | -21.3 | 0% |
| 2,000 volta | 37 | -38.9 | -37.2 | -37.1 | -37.0 | 0% |
| **2,000 ida+volta** | 37 | -82.1 | -59.6 | -59.4 | -59.1 | 0% |

## Janelas de oportunidade (sem taxa, liquido de gas)

Janela = ciclos seguidos com ida+volta positiva. A duracao tem erro de ate um intervalo de coleta.

| valor | ciclos > 0 | janelas | duracao mediana | duracao maxima | melhor (bps) | melhor (US$) |
|---|---|---|---|---|---|---|
| 2,000 | 0/37 | 0 | 0s | 0s | -9.2 | -1.84 |

## Por hora (Brasilia): % de ciclos positivos e media (sem taxa)

| hora | 2,000 |
|---|---|
| 16/10 06h | 0% (-9.8) |
| 16/10 07h | 0% (-12.7) |

## Veredito

**Sem oportunidade na rota Relay** neste periodo (mediana -9.7 bps).

Limitacoes: sao cotacoes, nao execucoes; o preco pode nao se confirmar na execucao e o solver pode limitar volume.

## Erros

- 7x `HTTP N: {"message":"Rate limit exceeded, retry in N minutes","code"`
