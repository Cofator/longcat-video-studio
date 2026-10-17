# Relatorio da rota Relay (USDC Base <-> USDT Polygon)

Periodo: 16/10 13:33 ate 16/10 14:47 (Brasilia)  
Cotacoes validas: 75 | erros: 7 | ciclos: 38 | intervalo tipico: 120s  

Unidade: bps (1 bp = 0,01%). Resultado liquido de gas estimado. Positivo = a ida+volta fecha acima do valor inicial.

## Sem a taxa da LI.FI (o seu caso)

| | n | min | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|
| 2,000 ida | 37 | -19.6 | +2.5 | +3.4 | +3.7 | 97% |
| 2,000 volta | 37 | -14.9 | -11.7 | -11.2 | -11.1 | 0% |
| **2,000 ida+volta** | 37 | -33.8 | -9.6 | -9.1 | -8.5 | 0% |

## Como cotado (com a taxa)

| | n | min | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|
| 2,000 ida | 37 | -44.5 | -22.5 | -21.6 | -21.3 | 0% |
| 2,000 volta | 37 | -39.9 | -36.7 | -36.2 | -36.1 | 0% |
| **2,000 ida+volta** | 37 | -83.6 | -59.5 | -59.0 | -58.3 | 0% |

## Janelas de oportunidade (sem taxa, liquido de gas)

Janela = ciclos seguidos com ida+volta positiva. A duracao tem erro de ate um intervalo de coleta.

| valor | ciclos > 0 | janelas | duracao mediana | duracao maxima | melhor (bps) | melhor (US$) |
|---|---|---|---|---|---|---|
| 2,000 | 0/37 | 0 | 0s | 0s | -8.5 | -1.69 |

## Por hora (Brasilia): % de ciclos positivos e media (sem taxa)

| hora | 2,000 |
|---|---|
| 16/10 13h | 0% (-9.8) |
| 16/10 14h | 0% (-10.6) |

## Veredito

**Sem oportunidade na rota Relay** neste periodo (mediana -9.6 bps).

Limitacoes: sao cotacoes, nao execucoes; o preco pode nao se confirmar na execucao e o solver pode limitar volume.

## Erros

- 7x `HTTP N: {"message":"Rate limit exceeded, retry in N minutes","code"`
