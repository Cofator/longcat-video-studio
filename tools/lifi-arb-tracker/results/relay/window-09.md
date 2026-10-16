# Relatorio da rota Relay (USDC Base <-> USDT Polygon)

Periodo: 16/10 17:14 ate 16/10 18:28 (Brasilia)  
Cotacoes validas: 75 | erros: 7 | ciclos: 38 | intervalo tipico: 120s  

Unidade: bps (1 bp = 0,01%). Resultado liquido de gas estimado. Positivo = a ida+volta fecha acima do valor inicial.

## Sem a taxa da LI.FI (o seu caso)

| | n | min | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|
| 2,000 ida | 37 | +3.7 | +4.0 | +4.2 | +5.0 | 100% |
| 2,000 volta | 37 | -15.3 | -13.4 | -13.1 | -13.0 | 0% |
| **2,000 ida+volta** | 37 | -11.4 | -9.6 | -9.3 | -8.3 | 0% |

## Como cotado (com a taxa)

| | n | min | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|
| 2,000 ida | 37 | -21.3 | -21.0 | -20.8 | -20.0 | 0% |
| 2,000 volta | 37 | -40.3 | -38.3 | -38.1 | -37.9 | 0% |
| **2,000 ida+volta** | 37 | -61.3 | -59.5 | -59.2 | -58.2 | 0% |

## Janelas de oportunidade (sem taxa, liquido de gas)

Janela = ciclos seguidos com ida+volta positiva. A duracao tem erro de ate um intervalo de coleta.

| valor | ciclos > 0 | janelas | duracao mediana | duracao maxima | melhor (bps) | melhor (US$) |
|---|---|---|---|---|---|---|
| 2,000 | 0/37 | 0 | 0s | 0s | -8.3 | -1.66 |

## Por hora (Brasilia): % de ciclos positivos e media (sem taxa)

| hora | 2,000 |
|---|---|
| 16/10 17h | 0% (-9.7) |
| 16/10 18h | 0% (-9.7) |

## Veredito

**Sem oportunidade na rota Relay** neste periodo (mediana -9.6 bps).

Limitacoes: sao cotacoes, nao execucoes; o preco pode nao se confirmar na execucao e o solver pode limitar volume.

## Erros

- 7x `HTTP N: {"message":"Rate limit exceeded, retry in N minutes","code"`
