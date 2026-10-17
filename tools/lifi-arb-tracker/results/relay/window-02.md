# Relatorio da rota Relay (USDC Base <-> USDT Polygon)

Periodo: 16/10 04:23 ate 16/10 05:37 (Brasilia)  
Cotacoes validas: 75 | erros: 7 | ciclos: 38 | intervalo tipico: 120s  

Unidade: bps (1 bp = 0,01%). Resultado liquido de gas estimado. Positivo = a ida+volta fecha acima do valor inicial.

## Sem a taxa da LI.FI (o seu caso)

| | n | min | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|
| 2,000 ida | 37 | -26.9 | +3.4 | +3.5 | +3.7 | 97% |
| 2,000 volta | 37 | -13.8 | -13.1 | -12.7 | -12.5 | 0% |
| **2,000 ida+volta** | 37 | -40.2 | -10.1 | -9.8 | -9.7 | 0% |

## Como cotado (com a taxa)

| | n | min | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|
| 2,000 ida | 37 | -51.8 | -21.6 | -21.5 | -21.3 | 0% |
| 2,000 volta | 37 | -38.7 | -38.1 | -37.6 | -37.5 | 0% |
| **2,000 ida+volta** | 37 | -89.9 | -60.0 | -59.7 | -59.6 | 0% |

## Janelas de oportunidade (sem taxa, liquido de gas)

Janela = ciclos seguidos com ida+volta positiva. A duracao tem erro de ate um intervalo de coleta.

| valor | ciclos > 0 | janelas | duracao mediana | duracao maxima | melhor (bps) | melhor (US$) |
|---|---|---|---|---|---|---|
| 2,000 | 0/37 | 0 | 0s | 0s | -9.7 | -1.95 |

## Por hora (Brasilia): % de ciclos positivos e media (sem taxa)

| hora | 2,000 |
|---|---|
| 16/10 04h | 0% (-10.3) |
| 16/10 05h | 0% (-11.9) |

## Veredito

**Sem oportunidade na rota Relay** neste periodo (mediana -10.1 bps).

Limitacoes: sao cotacoes, nao execucoes; o preco pode nao se confirmar na execucao e o solver pode limitar volume.

## Erros

- 7x `HTTP N: {"message":"Rate limit exceeded, retry in N minutes","code"`
