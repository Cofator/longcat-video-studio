# Relatorio da rota Relay (USDC Base <-> USDT Polygon)

Periodo: 16/10 19:04 ate 16/10 20:18 (Brasilia)  
Cotacoes validas: 75 | erros: 7 | ciclos: 38 | intervalo tipico: 120s  

Unidade: bps (1 bp = 0,01%). Resultado liquido de gas estimado. Positivo = a ida+volta fecha acima do valor inicial.

## Sem a taxa da LI.FI (o seu caso)

| | n | min | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|
| 2,000 ida | 37 | +3.5 | +3.8 | +4.2 | +4.2 | 100% |
| 2,000 volta | 37 | -14.0 | -13.2 | -13.0 | -12.4 | 0% |
| **2,000 ida+volta** | 37 | -10.9 | -9.7 | -9.3 | -9.1 | 0% |

## Como cotado (com a taxa)

| | n | min | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|
| 2,000 ida | 37 | -21.5 | -21.2 | -20.8 | -20.8 | 0% |
| 2,000 volta | 37 | -39.0 | -38.1 | -38.0 | -37.4 | 0% |
| **2,000 ida+volta** | 37 | -60.8 | -59.6 | -59.2 | -59.0 | 0% |

## Janelas de oportunidade (sem taxa, liquido de gas)

Janela = ciclos seguidos com ida+volta positiva. A duracao tem erro de ate um intervalo de coleta.

| valor | ciclos > 0 | janelas | duracao mediana | duracao maxima | melhor (bps) | melhor (US$) |
|---|---|---|---|---|---|---|
| 2,000 | 0/37 | 0 | 0s | 0s | -9.1 | -1.82 |

## Por hora (Brasilia): % de ciclos positivos e media (sem taxa)

| hora | 2,000 |
|---|---|
| 16/10 19h | 0% (-9.8) |
| 16/10 20h | 0% (-9.8) |

## Veredito

**Sem oportunidade na rota Relay** neste periodo (mediana -9.7 bps).

Limitacoes: sao cotacoes, nao execucoes; o preco pode nao se confirmar na execucao e o solver pode limitar volume.

## Erros

- 7x `HTTP N: {"message":"Rate limit exceeded, retry in N minutes","code"`
