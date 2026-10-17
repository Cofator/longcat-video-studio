# Relatorio da rota Relay (USDC Base <-> USDT Polygon)

Periodo: 16/10 11:43 ate 16/10 12:57 (Brasilia)  
Cotacoes validas: 75 | erros: 7 | ciclos: 38 | intervalo tipico: 120s  

Unidade: bps (1 bp = 0,01%). Resultado liquido de gas estimado. Positivo = a ida+volta fecha acima do valor inicial.

## Sem a taxa da LI.FI (o seu caso)

| | n | min | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|
| 2,000 ida | 37 | +1.8 | +2.3 | +3.7 | +4.0 | 100% |
| 2,000 volta | 37 | -13.6 | -12.1 | -11.7 | -11.6 | 0% |
| **2,000 ida+volta** | 37 | -11.4 | -9.9 | -9.1 | -8.9 | 0% |

## Como cotado (com a taxa)

| | n | min | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|
| 2,000 ida | 37 | -23.2 | -22.7 | -21.3 | -21.0 | 0% |
| 2,000 volta | 37 | -38.5 | -37.1 | -36.7 | -36.6 | 0% |
| **2,000 ida+volta** | 37 | -61.2 | -59.7 | -59.0 | -58.8 | 0% |

## Janelas de oportunidade (sem taxa, liquido de gas)

Janela = ciclos seguidos com ida+volta positiva. A duracao tem erro de ate um intervalo de coleta.

| valor | ciclos > 0 | janelas | duracao mediana | duracao maxima | melhor (bps) | melhor (US$) |
|---|---|---|---|---|---|---|
| 2,000 | 0/37 | 0 | 0s | 0s | -8.9 | -1.78 |

## Por hora (Brasilia): % de ciclos positivos e media (sem taxa)

| hora | 2,000 |
|---|---|
| 16/10 11h | 0% (-9.2) |
| 16/10 12h | 0% (-9.9) |

## Veredito

**Sem oportunidade na rota Relay** neste periodo (mediana -9.9 bps).

Limitacoes: sao cotacoes, nao execucoes; o preco pode nao se confirmar na execucao e o solver pode limitar volume.

## Erros

- 7x `HTTP N: {"message":"Rate limit exceeded, retry in N minutes","code"`
